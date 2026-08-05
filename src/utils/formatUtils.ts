/**
 * Formats a number into a string using a decimal comma (`,`) per local engineering standards.
 * Automatically trims unnecessary trailing zeros (e.g. 1.000 -> "1", 1.50 -> "1,5", 0.40 -> "0,4")
 */
export function fmtNum(val: number | null | undefined, decimals: number = 2): string {
  if (val === null || val === undefined || isNaN(val)) return 'N/A';
  let str = val.toFixed(decimals);
  if (str.includes('.')) {
    str = str.replace(/0+$/, '').replace(/\.$/, '');
  }
  return str.replace('.', ',');
}

/**
 * Parses user numeric inputs supporting both decimal dots and decimal commas
 * e.g. "2,5" -> 2.5, "2.5" -> 2.5
 */
export function parseLocalFloat(str: string): number {
  if (!str) return NaN;
  const normalized = str.replace(',', '.');
  return parseFloat(normalized);
}

/**
 * Splits a list string using space, semicolon, or comma (smart check for decimal comma)
 * e.g. "1,5; 2,5; 3,0" or "1.5, 2.5, 3.0" or "1 4 25"
 */
export function parseLocalNumberList(str: string): number[] {
  if (!str || !str.trim()) return [];

  const trimmed = str.trim();

  // If semicolon is present, split by semicolon first (e.g. "1,5; 2,5; 3")
  if (trimmed.includes(';')) {
    return trimmed
      .split(';')
      .map(s => parseLocalFloat(s.trim()))
      .filter(v => !isNaN(v));
  }

  // If contains space or comma, split smartly
  const tokens = trimmed.split(/[\s,]+/);
  const result: number[] = [];

  for (const token of tokens) {
    const val = parseLocalFloat(token);
    if (!isNaN(val)) {
      result.push(val);
    }
  }

  return result;
}
