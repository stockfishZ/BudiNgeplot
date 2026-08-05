import { ComplexNum } from './bodeEngine';
import { parseLocalFloat } from './formatUtils';

export interface ParsedZPK {
  gain: number;
  zeros: ComplexNum[];
  poles: ComplexNum[];
}

/**
 * Parses ZPK input strings into numerical complex zeros and poles
 * e.g. "-2,5; 3" or "0, -1+4j, -1-4j" or "-5, -10"
 */
export function parseZPK(gainStr: string, zerosStr: string, polesStr: string): ParsedZPK {
  const gain = parseLocalFloat(gainStr) || 1;
  const zeros = parseComplexList(zerosStr);
  const poles = parseComplexList(polesStr);

  return { gain, zeros, poles };
}

function parseComplexList(str: string): ComplexNum[] {
  if (!str || !str.trim()) return [];

  // Support both semicolon and space/comma separation
  const rawTokens = str.includes(';') ? str.split(';') : str.split(/[\s,]+/);
  const result: ComplexNum[] = [];

  for (let token of rawTokens) {
    token = token.trim();
    if (!token) continue;
    
    // Replace i with j and normalize comma to dot for parsing internally
    const cleaned = token.replace(/i/g, 'j').replace(/,/g, '.');

    // Case 1: Simple real number e.g. "-2.5"
    if (/^[-+]?\d*\.?\d+$/.test(cleaned)) {
      result.push({ re: parseFloat(cleaned), im: 0 });
      continue;
    }

    // Case 2: Pure imaginary e.g. "4j" or "-3.5j"
    const pureImagMatch = cleaned.match(/^([-+]?\d*\.?\d+)j$/);
    if (pureImagMatch) {
      result.push({ re: 0, im: parseFloat(pureImagMatch[1]) });
      continue;
    }

    // Case 3: Complex number e.g. "-1+4j" or "2-3.5j"
    const complexMatch = cleaned.match(/^([-+]?\d*\.?\d+)([-+]\d*\.?\d+)j$/);
    if (complexMatch) {
      result.push({ re: parseFloat(complexMatch[1]), im: parseFloat(complexMatch[2]) });
      continue;
    }

    // Fallback single float parse
    const val = parseFloat(cleaned);
    if (!isNaN(val)) {
      result.push({ re: val, im: 0 });
    }
  }

  return result;
}

/**
 * Converts ZPK complex roots into exact expanded polynomial coefficients [a_n, ..., a_0]
 */
export function zpkToPolynomials(
  gain: number,
  zeros: ComplexNum[],
  poles: ComplexNum[]
): { numCoeffs: number[]; denCoeffs: number[] } {
  const expandComplexRoots = (roots: ComplexNum[]): number[] => {
    if (roots.length === 0) return [1];

    let currentPoly = [1];

    // Group into conjugate pairs and real roots to preserve real coefficients
    const visited = new Set<number>();

    for (let i = 0; i < roots.length; i++) {
      if (visited.has(i)) continue;
      const r = roots[i];

      if (Math.abs(r.im) > 1e-6) {
        // Find matching conjugate pair (re - j*im)
        const pairIdx = roots.findIndex((other, oIdx) => 
          oIdx !== i && !visited.has(oIdx) && Math.abs(other.re - r.re) < 1e-4 && Math.abs(other.im + r.im) < 1e-4
        );

        if (pairIdx !== -1) {
          visited.add(i);
          visited.add(pairIdx);
          // (s - (re + j*im))(s - (re - j*im)) = s^2 - 2*re*s + (re^2 + im^2)
          const quadraticFactor = [1, -2 * r.re, r.re * r.re + r.im * r.im];
          currentPoly = multiplyPolynomials(currentPoly, quadraticFactor);
          continue;
        }
      }

      // Real root (s - re)
      visited.add(i);
      const linearFactor = [1, -r.re];
      currentPoly = multiplyPolynomials(currentPoly, linearFactor);
    }

    return currentPoly;
  };

  const numCoeffs = expandComplexRoots(zeros).map(c => c * gain);
  const denCoeffs = expandComplexRoots(poles);

  return { numCoeffs, denCoeffs };
}

function multiplyPolynomials(p1: number[], p2: number[]): number[] {
  const result = new Array(p1.length + p2.length - 1).fill(0);
  for (let i = 0; i < p1.length; i++) {
    for (let j = 0; j < p2.length; j++) {
      result[i + j] += p1[i] * p2[j];
    }
  }
  return result;
}
