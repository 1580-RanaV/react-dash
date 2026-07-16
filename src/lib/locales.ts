export type Script = "Latin" | "Cyrillic" | "Kana";

export interface Locale {
  /** BCP-47 code — feed this straight to i18next / your router */
  code: string;
  /** English name, used in the menu's second line */
  name: string;
  /** Endonym, shown as the primary label */
  native: string;
  script: Script;
  /** The signature letter this locale morphs to. Must exist in GLYPHS. */
  glyph: string;
}

/**
 * One signature letter per locale: the character that language (or its script)
 * uniquely owns. Order matters — it is the order of the menu.
 */
export const LOCALES: Locale[] = [
  { code: "en",    name: "English",         native: "English",    script: "Latin",    glyph: "A" },
  { code: "lt",    name: "Lithuanian",      native: "Lietuvių",   script: "Latin",    glyph: "Ą" },
  { code: "ru",    name: "Russian",         native: "Русский",    script: "Cyrillic", glyph: "Я" },
  { code: "uk",    name: "Ukrainian",       native: "Українська", script: "Cyrillic", glyph: "Ї" },
  { code: "pl",    name: "Polish",          native: "Polski",     script: "Latin",    glyph: "Ł" },
  { code: "lv",    name: "Latvian",         native: "Latviešu",   script: "Latin",    glyph: "Ā" },
  { code: "de",    name: "German",          native: "Deutsch",    script: "Latin",    glyph: "ß" },
  { code: "et",    name: "Estonian",        native: "Eesti",      script: "Latin",    glyph: "Õ" },
  { code: "nl",    name: "Dutch",           native: "Nederlands", script: "Latin",    glyph: "Ĳ" },
  { code: "be",    name: "Belarusian",      native: "Беларуская", script: "Cyrillic", glyph: "Ў" },
  { code: "es",    name: "Spanish",         native: "Español",    script: "Latin",    glyph: "Ñ" },
  { code: "fr",    name: "French",          native: "Français",   script: "Latin",    glyph: "Ç" },
  { code: "ja",    name: "Japanese",        native: "日本語",      script: "Kana",     glyph: "あ" },
  { code: "pt-BR", name: "Portuguese (BR)", native: "Português",  script: "Latin",    glyph: "Ã" },
];

export const SCRIPT_COLOR: Record<Script, string> = {
  Latin: "#B4A0FF",
  Cyrillic: "#F2C14E",
  Kana: "#5FD3C0",
};
