import pino from "pino";

export const logger = pino({
  level: import.meta.env.LOG_LEVEL ?? "info",
  ...(import.meta.env.DEV
    ? { transport: { target: "pino-pretty", options: { colorize: true } } }
    : {}),
});
