// ISRC: CC-XXX-YY-NNNNN (country-registrant-year-designation)
// UPC: 12-digit EAN-13 barcode

export function generateISRC(countryCode = "US"): string {
  const registrant = randomAlpha(3);
  const year = new Date().getFullYear().toString().slice(-2);
  const designation = String(Math.floor(Math.random() * 99999)).padStart(5, "0");
  return `${countryCode}-${registrant}-${year}-${designation}`;
}

export function generateUPC(): string {
  const digits = Array.from({ length: 11 }, () => Math.floor(Math.random() * 10));
  // EAN-13 check digit
  let sum = 0;
  for (let i = 0; i < 11; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return [...digits, check].join("");
}

export function generateISWC(): string {
  const num = String(Math.floor(Math.random() * 999999999)).padStart(9, "0");
  return `T-${num.slice(0, 3)}.${num.slice(3, 6)}.${num.slice(6, 9)}-C`;
}

function randomAlpha(len: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function guessLanguageFromTitle(title: string): string {
  // Very basic heuristic — in prod you'd use langdetect
  const hindi = /[अ-ह]/;
  const spanish = /[áéíóúüñ¿¡]/i;
  const french = /[àâæçèêëîïôœùûüÿ]/i;
  if (hindi.test(title)) return "hi";
  if (spanish.test(title)) return "es";
  if (french.test(title)) return "fr";
  return "en";
}
