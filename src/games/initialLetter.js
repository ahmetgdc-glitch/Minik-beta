export function initialLetter(label = "", lang = "de") {
  const text = String(label).trim().normalize("NFC");
  if (!text) return "";
  const first = Array.from(text)[0] || "";
  return lang === "tr"
    ? first.toLocaleUpperCase("tr-TR")
    : first.toLocaleUpperCase("de-DE");
}
