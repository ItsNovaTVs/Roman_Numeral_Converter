import { toRoman, formatRomanBreakdown } from "./roman.js";
import { validateRoman } from "./validator.js";
const HISTORY_KEY = "roman-numeral-history-v1"; let mode = "roman";
const $ = id => document.getElementById(id);
const input = $("numberInput"), output = $("outputValue"), status = $("statusMessage"), breakdown = $("breakdown"), historyList = $("historyList");
const romanModeBtn = $("romanModeBtn"), arabicModeBtn = $("arabicModeBtn"), macronBtn = $("macronBtn");
function setStatus(message, kind = "") { status.textContent = message; status.className = kind ? "status " + kind : "status"; }
function renderBreakdown(items) {
  breakdown.innerHTML = ""; if (!items?.length) return;
  const fragment = document.createDocumentFragment();
  items.forEach(item => { const row = document.createElement("div"); row.className = "breakdown-row"; row.innerHTML = "<span>" + item.symbol + "</span><span>" + item.value.toLocaleString() + "</span>"; fragment.appendChild(row); });
  breakdown.appendChild(fragment);
}
function saveHistory(inputValue, resultValue, direction) {
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  history.unshift({ input: inputValue, result: resultValue, direction, time: Date.now() });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 10))); renderHistory();
}
function renderHistory() {
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); historyList.innerHTML = "";
  if (!history.length) { historyList.innerHTML = "<li class=\"empty-history\">No conversions yet.</li>"; return; }
  history.forEach(item => { const li = document.createElement("li"); const button = document.createElement("button"); button.className = "history-item"; button.type = "button"; button.textContent = item.input + " → " + item.result; button.addEventListener("click", () => { input.value = item.input; mode = item.direction; updateModeButtons(); handleConversion(false); }); li.appendChild(button); historyList.appendChild(li); });
}
function updateModeButtons() {
  const roman = mode === "roman"; romanModeBtn.setAttribute("aria-pressed", String(roman)); arabicModeBtn.setAttribute("aria-pressed", String(!roman));
  romanModeBtn.classList.toggle("active", roman); arabicModeBtn.classList.toggle("active", !roman);
  input.placeholder = roman ? "Enter Roman numeral…" : "Enter a number…"; input.inputMode = roman ? "text" : "numeric"; macronBtn.hidden = !roman; $("inputLabel").textContent = roman ? "Roman numeral" : "Arabic number";
}
function handleConversion(save = true) {
  const raw = input.value.trim();
  if (!raw) { output.textContent = "—"; renderBreakdown([]); setStatus(mode === "roman" ? "Enter a Roman numeral." : "Enter a whole number."); return; }
  if (mode === "roman") {
    const result = validateRoman(raw);
    if (!result.valid) { output.textContent = "Invalid"; renderBreakdown([]); setStatus(result.error, "error"); return; }
    output.textContent = result.total.toLocaleString(); renderBreakdown(formatRomanBreakdown(result.tokens)); setStatus("Valid Roman numeral.", "success");
    if (save) saveHistory(raw, result.total.toLocaleString(), mode);
  } else {
    const result = toRoman(raw);
    if (result.error) { output.textContent = "Invalid"; renderBreakdown([]); setStatus(result.error, "error"); return; }
    output.textContent = result.roman; renderBreakdown([]); setStatus("Converted successfully.", "success");
    if (save) saveHistory(raw, result.roman, mode);
  }
}
romanModeBtn.addEventListener("click", () => { mode = "roman"; updateModeButtons(); handleConversion(false); input.focus(); });
arabicModeBtn.addEventListener("click", () => { mode = "arabic"; updateModeButtons(); handleConversion(false); input.focus(); });
$("convertBtn").addEventListener("click", () => handleConversion());
$("clearBtn").addEventListener("click", () => { input.value = ""; handleConversion(false); input.focus(); });
$("swapBtn").addEventListener("click", () => { const currentOutput = output.textContent; if (currentOutput === "—" || currentOutput === "Invalid") return; mode = mode === "roman" ? "arabic" : "roman"; input.value = currentOutput.replace(/,/g, ""); updateModeButtons(); handleConversion(false); input.focus(); });
$("copyBtn").addEventListener("click", async () => { if (output.textContent === "—" || output.textContent === "Invalid") return; await navigator.clipboard.writeText(output.textContent); setStatus("Result copied to clipboard.", "success"); });
$("clearHistoryBtn").addEventListener("click", () => { localStorage.removeItem(HISTORY_KEY); renderHistory(); });
input.addEventListener("input", () => handleConversion(false)); input.addEventListener("keydown", event => { if (event.key === "Enter") handleConversion(); });
macronBtn.addEventListener("click", () => {
  const cursor = input.selectionStart ?? input.value.length, value = input.value; let base = -1;
  for (let i = cursor - 1; i >= 0; i--) { if ("IVXLCDM".includes(value[i].toUpperCase())) { base = i; break; } if (value[i] !== "\\u0304") break; }
  if (base < 0) { setStatus("Place the cursor after a Roman numeral letter first.", "error"); return; }
  if (value[base].toUpperCase() === "I") { setStatus("The letter I cannot take macrons in this converter.", "error"); return; }
  let count = 0; while (value[base + 1 + count] === "\\u0304") count++;
  if (count >= 4) { setStatus("A symbol cannot have more than 4 macrons.", "error"); return; }
  const insertAt = base + 1 + count; input.value = value.slice(0, insertAt) + "\\u0304" + value.slice(insertAt); input.setSelectionRange(insertAt + 1, insertAt + 1); input.focus(); handleConversion(false);
});
updateModeButtons(); renderHistory(); handleConversion(false);