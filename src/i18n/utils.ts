import tr from "./tr.json";
import en from "./en.json";

export type Locale = "tr" | "en";

const translations = { tr, en };

export function getLangFromUrl(url: URL): Locale {
  const [, lang] = url.pathname.split("/");
  if (lang === "en") return "en";
  return "tr";
}

export function useTranslations(lang: Locale) {
  return translations[lang];
}
