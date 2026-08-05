import * as math from 'mathjs';

export interface ParsedTF {
  numCoeffs: number[];
  denCoeffs: number[];
  error?: string;
}

/**
 * Parses user input string like "10*(s+2) / (s*(s^2 + 4*s + 13))" into polynomial coefficients
 */
export function parseTFString(exprStr: string): ParsedTF {
  try {
    const cleanStr = exprStr.trim();
    if (!cleanStr) return { numCoeffs: [1], denCoeffs: [1] };

    // Use mathjs node evaluation to simplify expression
    const node = math.parse(cleanStr);
    
    // Rationalize or evaluate symbolically if possible, or compile s-evaluator
    // To extract polynomial coefficients robustly for degree <= 6:
    // H(s) = N(s) / D(s)
    // We can extract coefficients by evaluating H(s) at distinct sample points or using math.rationalize
    try {
      const rational = math.rationalize(node, {}, true) as any;
      if (rational && rational.coefficients) {
        // rationalized successfully
        // rational.expression is num/den
      }
    } catch {
      // Fallback manual coefficient extraction using interpolation / finite difference matrix if needed
    }

    // Alternative: standard polynomial string parser for "num" / "den" or factored terms
    // We can evaluate numerator and denominator nodes directly:
    const parts = cleanStr.split('/');
    if (parts.length === 2) {
      const numNode = math.parse(parts[0]);
      const denNode = math.parse(parts[1]);

      const numCoeffs = extractCoeffsFromNode(numNode);
      const denCoeffs = extractCoeffsFromNode(denNode);

      if (numCoeffs.length > 0 && denCoeffs.length > 0) {
        return { numCoeffs, denCoeffs };
      }
    } else {
      // Single expression (treated as numerator with den=1)
      const numNode = math.parse(cleanStr);
      const numCoeffs = extractCoeffsFromNode(numNode);
      if (numCoeffs.length > 0) {
        return { numCoeffs, denCoeffs: [1] };
      }
    }

    return { numCoeffs: [1], denCoeffs: [1, 1], error: "Could not parse transfer function string." };
  } catch (err: any) {
    return { numCoeffs: [1], denCoeffs: [1, 1], error: err.message || "Invalid expression format." };
  }
}

/**
 * Helper to extract polynomial coefficients [a_n, ..., a_0] from a mathjs AST node
 */
function extractCoeffsFromNode(node: math.MathNode): number[] {
  // Evaluate AST at sample points s = 0, 1, 2, 3, 4, 5, 6... to solve system of linear equations
  // Degree upper bound test up to degree 8
  const maxDegree = 8;
  const compiled = node.compile();

  const samples: { s: number; val: number }[] = [];
  for (let s = 0; s <= maxDegree; s++) {
    try {
      const val = compiled.evaluate({ s });
      if (typeof val === 'number' && !isNaN(val)) {
        samples.push({ s, val });
      }
    } catch {
      break;
    }
  }

  if (samples.length === 0) return [1];

  // Check degree 0
  if (samples.every(p => Math.abs(p.val - samples[0].val) < 1e-7)) {
    return [samples[0].val];
  }

  // Find lowest degree N where polynomial fits all samples
  for (let deg = 1; deg <= maxDegree && deg < samples.length; deg++) {
    const coeffs = fitPolynomial(samples.slice(0, deg + 1), deg);
    if (coeffs) {
      // Verify against remaining samples
      let fits = true;
      for (let k = deg + 1; k < samples.length; k++) {
        const evalVal = evalPoly(coeffs, samples[k].s);
        if (Math.abs(evalVal - samples[k].val) > 1e-4) {
          fits = false;
          break;
        }
      }
      if (fits) return coeffs;
    }
  }

  return [1];
}

function fitPolynomial(samples: { s: number; val: number }[], degree: number): number[] | null {
  // Solve Vandermonde matrix V * c = y
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
    const sol = math.usolve(V, y) as any;
    return sol.map((r: any) => r[0]);
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
