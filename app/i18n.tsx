import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import getSystemLanguage from "./language-utils";

import translationEN from "./locales/en.json";
import translationPL from "./locales/pl.json";

// Define the type for the resources object
const resources = {
  en: {
    translation: translationEN,
  },
  pl: {
    translation: translationPL,
  },
} as const; // `as const` ensures the keys are readonly literals

type LanguageKeys = keyof typeof resources; // Extract valid keys from resources

// Type guard to validate if a string is a valid key
function isLanguageKey(key: string): key is LanguageKeys {
  return key in resources;
}

const systemLanguage = getSystemLanguage();
const fallbackLanguage: LanguageKeys = "en"; // Define fallback language

// Validate the system language
const selectedLanguage = isLanguageKey(systemLanguage) ? systemLanguage : fallbackLanguage;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: selectedLanguage, // Use validated language or fallback
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;
