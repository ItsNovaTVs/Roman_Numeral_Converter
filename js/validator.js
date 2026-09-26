import { parseRoman, toRoman } from "./roman.js";
const VALID_SUBTRACTIVE_PAIRS = new Set(["IV","IX","XL","XC","CD","CM"]);
export function validateRoman(input) {
  const parsed = parseRoman(input);
  if (parsed.error) return { valid: false, error: parsed.error };
  const tokens = parsed.tokens; const normalized = tokens.map(t => t.base).join("");
  const hasMacrons = tokens.some(t => t.macrons > 0);
  if (!hasMacrons) {
    const canonical = toRoman(parsed.total);
    if (canonical.error) return { valid: false, error: canonical.error };
    if (normalized !== canonical.roman) return { valid: false, error: normalized + " is not in standard Roman numeral form. Try " + canonical.roman + ".", suggestion: canonical.roman };
  } else {
    for (let i = 0; i < tokens.length - 1; i++) {
      const current = tokens[i], next = tokens[i + 1];
      if (next.value > current.value) {
        const sameLevel = current.macrons === next.macrons;
        const pair = current.base + next.base;
        if (!sameLevel || !VALID_SUBTRACTIVE_PAIRS.has(pair)) return { valid: false, error: current.symbol + next.symbol + " is not a valid subtractive pair in this notation." };
      }
    }
  }
  return { valid: true, total: parsed.total, tokens };
}