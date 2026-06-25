import { useState } from "react";
import { Check, Copy } from "lucide-react";

// ── VS Code Dark+ palette ─────────────────────────────────────
const C = {
  tag:     "#4EC9B0",  // teal  — HTML tag names
  angle:   "#808080",  // grey  — < > /
  attr:    "#9CDCFE",  // light blue — HTML attr names
  string:  "#CE9178",  // orange — strings
  keyword: "#569CD6",  // blue — JS keywords / JSON booleans
  flow:    "#C586C0",  // purple — return, if, void, etc.
  builtin: "#4EC9B0",  // teal — window, Promise, Date
  number:  "#B5CEA8",  // green — numbers
  jsonKey: "#9CDCFE",  // light blue — JSON keys
  dim:     "#495162",  // dim — line numbers
  default: "#D4D4D4",  // light grey — everything else
};

type Token = { text: string; color: string };

const JS_KEYWORDS = new Set(["function","var","let","const","new","typeof","this","true","false","null","undefined"]);
const JS_FLOW     = new Set(["return","if","else","while","for","do","switch","case","break","continue","void","throw","try","catch","finally"]);
const JS_BUILTINS = new Set(["window","document","Promise","Date","Math","Object","Array","JSON","arguments"]);

// ── HTML / JS tokenizer ───────────────────────────────────────
function tokenizeHtmlJs(code: string): Token[] {
  const out: Token[] = [];
  let i = 0;

  while (i < code.length) {
    // newline / whitespace
    if (/\s/.test(code[i])) {
      let s = "";
      while (i < code.length && /\s/.test(code[i])) s += code[i++];
      out.push({ text: s, color: C.default });
      continue;
    }

    // HTML tag
    if (code[i] === "<") {
      const tagMatch = code.slice(i).match(/^<(\/?)([a-zA-Z][a-zA-Z0-9_-]*)/);
      if (tagMatch) {
        out.push({ text: "<", color: C.angle }); i++;
        if (tagMatch[1]) { out.push({ text: "/", color: C.angle }); i++; }
        out.push({ text: tagMatch[2], color: C.tag });
        i += tagMatch[2].length;
        while (i < code.length && code[i] !== ">") {
          if (/[a-zA-Z_]/.test(code[i])) {
            let name = "";
            while (i < code.length && /[a-zA-Z0-9_-]/.test(code[i])) name += code[i++];
            out.push({ text: name, color: C.attr });
          } else if (code[i] === "=") {
            out.push({ text: "=", color: C.angle }); i++;
          } else if (code[i] === '"') {
            let s = '"'; i++;
            while (i < code.length && code[i] !== '"') { if (code[i] === "\\") s += code[i++]; s += code[i++]; }
            s += '"'; i++;
            out.push({ text: s, color: C.string });
          } else {
            out.push({ text: code[i], color: C.default }); i++;
          }
        }
        if (i < code.length && code[i] === ">") { out.push({ text: ">", color: C.angle }); i++; }
        continue;
      }
      out.push({ text: "<", color: C.default }); i++;
      continue;
    }

    // JS string
    if (code[i] === '"' || code[i] === "'") {
      const q = code[i]; let s = q; i++;
      while (i < code.length && code[i] !== q) { if (code[i] === "\\") s += code[i++]; s += code[i++]; }
      s += q; i++;
      out.push({ text: s, color: C.string });
      continue;
    }

    // Number
    if (/\d/.test(code[i])) {
      let n = "";
      while (i < code.length && /[\d.]/.test(code[i])) n += code[i++];
      out.push({ text: n, color: C.number });
      continue;
    }

    // Identifier / keyword / builtin
    if (/[a-zA-Z_$]/.test(code[i])) {
      let word = "";
      while (i < code.length && /[a-zA-Z0-9_$]/.test(code[i])) word += code[i++];
      let color = C.default;
      if (JS_KEYWORDS.has(word))   color = C.keyword;
      else if (JS_FLOW.has(word))  color = C.flow;
      else if (JS_BUILTINS.has(word)) color = C.builtin;
      out.push({ text: word, color });
      continue;
    }

    out.push({ text: code[i], color: C.default }); i++;
  }
  return out;
}

// ── JSON tokenizer ────────────────────────────────────────────
function tokenizeJSON(code: string): Token[] {
  const out: Token[] = [];
  let i = 0;

  while (i < code.length) {
    if (/\s/.test(code[i])) {
      let s = "";
      while (i < code.length && /\s/.test(code[i])) s += code[i++];
      out.push({ text: s, color: C.default });
      continue;
    }

    if (code[i] === '"') {
      let s = '"'; i++;
      while (i < code.length && code[i] !== '"') { if (code[i] === "\\") s += code[i++]; s += code[i++]; }
      s += '"'; i++;
      let j = i;
      while (j < code.length && code[j] === " ") j++;
      out.push({ text: s, color: code[j] === ":" ? C.jsonKey : C.string });
      continue;
    }

    if (/[-\d]/.test(code[i]) && (code[i] !== "-" || /\d/.test(code[i + 1] ?? ""))) {
      let n = "";
      if (code[i] === "-") n += code[i++];
      while (i < code.length && /[\d.eE+\-]/.test(code[i])) n += code[i++];
      out.push({ text: n, color: C.number });
      continue;
    }

    if (/[a-z]/.test(code[i])) {
      let word = "";
      while (i < code.length && /[a-z]/.test(code[i])) word += code[i++];
      out.push({ text: word, color: C.keyword });
      continue;
    }

    out.push({ text: code[i], color: C.default }); i++;
  }
  return out;
}

// ── Split token stream into per-line arrays ───────────────────
function splitLines(tokens: Token[]): Token[][] {
  const lines: Token[][] = [[]];
  for (const tok of tokens) {
    const parts = tok.text.split("\n");
    for (let i = 0; i < parts.length; i++) {
      if (i > 0) lines.push([]);
      if (parts[i].length > 0) lines[lines.length - 1].push({ text: parts[i], color: tok.color });
    }
  }
  return lines;
}

// ── Public component ──────────────────────────────────────────
export default function CodeBlock({
  code,
  language = "html",
  copyText,
}: {
  code: string;
  language?: "html" | "json";
  copyText?: string;
}) {
  const [copied, setCopied] = useState(false);

  function doCopy() {
    navigator.clipboard.writeText(copyText ?? code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const tokens = language === "json" ? tokenizeJSON(code) : tokenizeHtmlJs(code);
  const lines  = splitLines(tokens);

  return (
    <div className="relative overflow-hidden rounded-xl" style={{ background: "#1E1E1E" }}>
      {/* copy button */}
      <button
        onClick={doCopy}
        className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
      >
        {copied
          ? <Check size={13} style={{ color: "#4EC9B0" }} />
          : <Copy size={13} style={{ color: "#6B7280" }} />}
      </button>

      {/* code area */}
      <div className="p-5 pr-10 font-mono" style={{ fontSize: 12, lineHeight: "20px" }}>
        {lines.map((lineTokens, ln) => (
          <div key={ln} className="flex">
            {/* line number */}
            <span
              className="mr-4 w-5 shrink-0 select-none text-right"
              style={{ color: C.dim }}
            >
              {ln + 1}
            </span>
            {/* code — wraps inside the container */}
            <span className="flex-1 min-w-0" style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
              {lineTokens.length === 0
                ? <span style={{ color: C.default }}>&nbsp;</span>
                : lineTokens.map((t, j) => (
                    <span key={j} style={{ color: t.color }}>{t.text}</span>
                  ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
