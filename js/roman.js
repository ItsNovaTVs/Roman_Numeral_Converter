const ROMAN_VALUES = Object.freeze({ I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 });
const STANDARD_PAIRS = Object.freeze([["M",1000],["CM",900],["D",500],["CD",400],["C",100],["XC",90],["L",50],["XL",40],["X",10],["IX",9],["V",5],["IV",4],["I",1]]);

export function tokenizeRoman(input) {
  const cleaned = input.trim().toUpperCase();
  const tokens = []; let i = 0;
  while (i < cleaned.length) {
    const char = cleaned[i];
    if (ROMAN_VALUES[char] === undefined) { if (/\\s/.test(char)) { i++; continue; } return { error: "Invalid character detected: " + char }; }
    let macrons = 0; let j = i + 1;
    while (cleaned[j] === "\\u0304") { macrons++; j++; }
    if (macrons > 4) return { error: "A symbol cannot have more than 4 macrons." };
    if (char === "I" && macrons > 0) return { error: "The letter I cannot take macrons." };
    tokens.push({ symbol: char + "\\u0304".repeat(macrons), base: char, macrons, value: ROMAN_VALUES[char] * 1000 ** macrons });
    i = j;
  }
  return { tokens };
}

export function parseRoman(input) {
  const parsed = tokenizeRoman(input);
  if (parsed.error) return parsed;
  if (!parsed.tokens.length) return { error: "Please enter a Roman numeral." };
  let total = 0;
  parsed.tokens.forEach((token, index) => { const next = parsed.tokens[index + 1]?.value ?? 0; total += next > token.value ? -token.value : token.value; });
  return { total, tokens: parsed.tokens };
}

export function toRoman(number) {
  const value = Number(number);
  if (!Number.isInteger(value) || value < 1 || value > 3999) return { error: "Standard Roman numerals can be generated for whole numbers from 1 to 3,999." };
  let remaining = value; let result = "";
  for (const [symbol, amount] of STANDARD_PAIRS) while (remaining >= amount) { result += symbol; remaining -= amount; }
  return { roman: result };
}

export function formatRomanBreakdown(tokens) { return tokens.map(token => ({ symbol: token.symbol, value: token.value })); }
export { ROMAN_VALUES };