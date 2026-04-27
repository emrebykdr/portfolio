import type { APIRoute } from "astro";
import { logger } from "../../lib/logger";

interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const POST: APIRoute = async ({ request }) => {
  let body: ContactPayload;

  try {
    body = await request.json() as ContactPayload;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { name, email, message } = body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return new Response(JSON.stringify({ error: "All fields are required" }), { status: 422 });
  }

  if (!isValidEmail(email)) {
    return new Response(JSON.stringify({ error: "Invalid email address" }), { status: 422 });
  }

  const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    logger.warn("RESEND_API_KEY not configured — contact form submission skipped");
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Portfolio Contact <noreply@emrebykdr.dev>",
        to: ["emre@emrebykdr.dev"],
        subject: `Portfolio contact from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      }),
    });

    if (!res.ok) {
      logger.error({ status: res.status }, "Resend API error");
      return new Response(JSON.stringify({ error: "Email service error" }), { status: 502 });
    }

    logger.info({ name, email }, "Contact form submitted");
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    logger.error({ err }, "Failed to send contact email");
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
};
