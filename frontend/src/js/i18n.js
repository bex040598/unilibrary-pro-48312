const localeCache = new Map();
let currentLocale = "uz";
let currentMessages = {};

export async function loadLocale(locale) {
  if (!localeCache.has(locale)) {
    const response = await fetch(`/locales/${locale}.json`);
    if (!response.ok) {
      throw new Error(`Locale load failed: ${locale}`);
    }
    localeCache.set(locale, await response.json());
  }
  currentLocale = locale;
  currentMessages = localeCache.get(locale) || {};
  localStorage.setItem("cyberrisk.locale", locale);
}

export function getLocale() {
  return currentLocale;
}

export function t(key, variables = {}) {
  let template = currentMessages[key] ?? key;
  for (const [name, value] of Object.entries(variables)) {
    template = template.replaceAll(`{${name}}`, String(value));
  }
  return template;
}

function fallbackTitle(value) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function enumLabel(prefix, value) {
  if (!value) return "";
  const normalized = String(value).toLowerCase().replace(/[^a-z0-9]+/g, "_");
  const key = `${prefix}.${normalized}`;
  const translated = t(key);
  return translated === key ? fallbackTitle(String(value)) : translated;
}
