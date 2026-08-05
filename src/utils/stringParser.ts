import * as math from 'mathjs';

export interface ParsedTF {
  numCoeffs: number[];
  denCoeffs: number[];
  error?: string;
}

/**
 * Parses user input string like "10*(s+2) / (s*(s^2 + 4*s + 13))" or "5 / (1 + s/10)" into polynomial coefficients
 */
export function parseTFString(exprStr: string): ParsedTF {
  try {
    const cleanStr = exprStr.trim();
    if (!cleanStr) return { numCoeffs: [], denCoeffs: [], error: "Expression cannot be empty." };

    // Check for unbalanced parentheses
    let depth = 0;
    for (let i = 0; i < cleanStr.length; i++) {
      if (cleanStr[i] === '(') depth++;
      else if (cleanStr[i] === ')') depth--;
      if (depth < 0) return { numCoeffs: [], denCoeffs: [], error: "Unbalanced parentheses (extra closing parenthesis)." };
    }
    if (depth > 0) {
      return { numCoeffs: [], denCoeffs: [], error: "Unbalanced parentheses (missing closing parenthesis)." };
    }

    // Check for incomplete trailing binary operator
    if (/[-+*/^]\s*$/.test(cleanStr)) {
      return { numCoeffs: [], denCoeffs: [], error: "Incomplete expression (trailing operator)." };
    }

    // Split expression into numerator and denominator nodes if fraction exists
    const slashIdx = findTopLevelSlash(cleanStr);
    let numStr = cleanStr;
    let denStr = '1';

    if (slashIdx !== -1) {
      numStr = cleanStr.substring(0, slashIdx).trim();
      denStr = cleanStr.substring(slashIdx + 1).trim();

      if (!numStr || !denStr) {
        return { numCoeffs: [], denCoeffs: [], error: "Incomplete fraction expression." };
      }
    }

    const numNode = math.parse(numStr);
    const denNode = math.parse(denStr);

    const numCoeffs = extractCoeffsFromNode(numNode);
    const denCoeffs = extractCoeffsFromNode(denNode);

    if (numCoeffs.length > 0 && denCoeffs.length > 0) {
      // Check if denominator is identically zero
      if (denCoeffs.every(c => Math.abs(c) < 1e-12)) {
        return { numCoeffs: [], denCoeffs: [], error: "Denominator cannot be zero." };
      }
      return { numCoeffs, denCoeffs };
    }

    return { numCoeffs: [], denCoeffs: [], error: "Could not extract valid polynomial terms." };
  } catch (err: any) {
    return { numCoeffs: [], denCoeffs: [], error: err.message || "Invalid expression syntax." };
  }
}

/**
 * Finds index of top-level division slash '/' not enclosed in parentheses
 */
function findTopLevelSlash(str: string): number {
  let parenDepth = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '(') parenDepth++;
    else if (char === ')') parenDepth--;
    else if (char === '/' && parenDepth === 0) {
      return i;
    }
  }
  return -1;
}

/**
 * Helper to extract polynomial coefficients [a_n, ..., a_0] from a mathjs AST node
 */
function extractCoeffsFromNode(node: math.MathNode): number[] {
  const maxDegree = 8;
  const compiled = node.compile();

  const samples: { s: number; val: number }[] = [];
  // Sample at distinct integer and fractional points to avoid accidental roots
  const samplePoints = [0, 1, -1, 2, -2, 3, -3, 4, -4, 5, 0.5, 1.5];

  for (const s of samplePoints) {
    try {
      const val = compiled.evaluate({ s });
      if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
        samples.push({ s, val });
      }
    } catch {
      // Continue sampling
    }
  }

  if (samples.length === 0) return [1];

  // Check degree 0 (Constant)
  if (samples.every(p => Math.abs(p.val - samples[0].val) < 1e-6)) {
    return [roundClean(samples[0].val)];
  }

  // Find lowest degree N where polynomial fits sample points
  for (let deg = 1; deg <= maxDegree && deg < samples.length; deg++) {
    const coeffs = fitPolynomial(samples.slice(0, deg + 1), deg);
    if (coeffs) {
      // Verify fit against all remaining sample points
      let fits = true;
      for (let k = deg + 1; k < samples.length; k++) {
        const evalVal = evalPoly(coeffs, samples[k].s);
        if (Math.abs(evalVal - samples[k].val) > 1e-3) {
          fits = false;
          break;
        }
      }
      if (fits) {
        return coeffs.map(c => roundClean(c));
      }
    }
  }

  return [1];
}

function fitPolynomial(samples: { s: number; val: number }[], degree: number): number[] | null {
  const n = degree + 1;
  const V: number[][] = [];
  const y: number[] = [];

  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    const s = samples[i].s;
    for (let j = degree; j >= 0; j--) {
      row.push(Math.pow(s, j));
    }
    V.push(row);
    y.push(samples[i].val);
  }

  try {
    const sol = math.lusolve(V, y) as any;
    if (Array.isArray(sol)) {
      return sol.map((r: any) => (Array.isArray(r) ? r[0] : r));
    }
    return null;
  } catch {
    return null;
  }
}

function evalPoly(coeffs: number[], s: number): number {
  let val = 0;
  const deg = coeffs.length - 1;
  for (let i = 0; i <= deg; i++) {
    val += coeffs[i] * Math.pow(s, deg - i);
  }
  return val;
}

function roundClean(num: number): number {
  if (Math.abs(num) < 1e-9) return 0;
  const rounded = Math.round(num * 1e6) / 1e6;
  return rounded;
}

