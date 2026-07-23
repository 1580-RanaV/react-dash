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
  { code: "en",    name: "English",              native: "English",    script: "Latin", glyph: "A" },
  { code: "es",    name: "Spanish",              native: "Español",    script: "Latin", glyph: "Ñ" },
  { code: "fr",    name: "French",               native: "Français",   script: "Latin", glyph: "Ç" },
  { code: "de",    name: "German",               native: "Deutsch",    script: "Latin", glyph: "ß" },
  { code: "pt-BR", name: "Portuguese (Brazil)",  native: "Português",  script: "Latin", glyph: "Ã" },
];

export const SCRIPT_COLOR: Record<Script, string> = {
  Latin: "#B4A0FF",
  Cyrillic: "#F2C14E",
  Kana: "#5FD3C0",
};
