import * as math from 'mathjs';
import { fmtNum } from './formatUtils';

export interface ComplexNum {
  re: number;
  im: number;
}

export interface PoleZero {
  re: number;
  im: number;
  type: 'pole' | 'zero';
  omega_n: number;
  zeta: number;
  isOrigin: boolean;
}

export interface BodeFactor {
  id: string;
  name: string;
  latex: string;
  type: 'gain' | 'origin' | 'real_zero' | 'real_pole' | 'complex_zero' | 'complex_pole';
  omega_c: number;
  slopeDbDec: number;
  phaseLow: number;
  phaseHigh: number;
}

export interface BodePoint {
  omega: number;
  magDb: number;
  magLinear: number;
  phaseDeg: number;
  magAsympDb: number;
  phaseAsympDeg: number;
}

export interface BodeAnalysisResult {
  points: BodePoint[];
  poles: PoleZero[];
  zeros: PoleZero[];
  factors: BodeFactor[];
  omega_gc: number | null; // rad/s where mag = 0 dB
  phaseMargin: number | null; // deg
  omega_pc: number | null; // rad/s where phase = -180 deg
  gainMarginDb: number | null; // dB
  gainMarginLinear: number | null;
  isStable: boolean | null;
  stabilityStatus: 'Stable' | 'Unstable' | 'Marginally Stable' | 'Unknown';
  latexTF: string;
  latexCanonical: string;
  gainK0: number;
  integratorOrder: number; // >0 for poles at origin, <0 for zeros at origin
}

/**
 * Durand-Kerner method to find all complex roots of a polynomial
 * coeffs: [a_n, a_{n-1}, ..., a_0] for a_n * s^n + ... + a_0 = 0
 */
export function findPolynomialRoots(coeffs: number[]): ComplexNum[] {
  // Strip leading zeros
  let poly = [...coeffs];
  while (poly.length > 0 && Math.abs(poly[0]) < 1e-12) {
    poly.shift();
  }

  if (poly.length <= 1) return [];

  // Normalize polynomial so leading coeff is 1
  const leading = poly[0];
  poly = poly.map(c => c / leading);
  const degree = poly.length - 1;

  if (degree === 1) {
    // a s + b = 0 => s = -b / a
    return [{ re: -poly[1], im: 0 }];
  }

  if (degree === 2) {
    // s^2 + b s + c = 0
    const b = poly[1];
    const c = poly[2];
    const disc = b * b - 4 * c;
    if (disc >= 0) {
      return [
        { re: (-b + Math.sqrt(disc)) / 2, im: 0 },
        { re: (-b - Math.sqrt(disc)) / 2, im: 0 }
      ];
    } else {
      return [
        { re: -b / 2, im: Math.sqrt(-disc) / 2 },
        { re: -b / 2, im: -Math.sqrt(-disc) / 2 }
      ];
    }
  }

  // Initial roots estimation for Durand-Kerner algorithm
  let roots: math.Complex[] = [];
  const radius = 0.9;
  for (let k = 0; k < degree; k++) {
    const angle = (2 * Math.PI * k) / degree + 0.4;
    const r = Math.pow(radius, k);
    roots.push(math.complex(r * Math.cos(angle), r * Math.sin(angle)));
  }

  // Evaluate polynomial P(z)
  const evalPoly = (z: math.Complex): math.Complex => {
    let res = math.complex(poly[0], 0);
    for (let i = 1; i <= degree; i++) {
      res = math.add(math.multiply(res, z), math.complex(poly[i], 0)) as math.Complex;
    }
    return res;
  };

  // Iterate Durand-Kerner
  const maxIter = 100;
  const tol = 1e-9;
  for (let iter = 0; iter < maxIter; iter++) {
    let maxChange = 0;
    const newRoots = [...roots];

    for (let i = 0; i < degree; i++) {
      const pVal = evalPoly(roots[i]);
      let denom = math.complex(1, 0);
      for (let j = 0; j < degree; j++) {
        if (i !== j) {
          denom = math.multiply(denom, math.subtract(roots[i], roots[j])) as math.Complex;
        }
      }
      const absDenom = math.abs(denom) as unknown as number;
      if (absDenom < 1e-15) continue;
      const delta = math.divide(pVal, denom) as math.Complex;
      newRoots[i] = math.subtract(roots[i], delta) as math.Complex;
      const absDelta = math.abs(delta) as unknown as number;
      maxChange = Math.max(maxChange, absDelta);
    }

    roots = newRoots;
    if (maxChange < tol) break;
  }

  // Convert and combine real/complex pairs cleanly
  const result: ComplexNum[] = roots.map(r => ({
    re: Math.abs(r.re) < 1e-8 ? 0 : r.re,
    im: Math.abs(r.im) < 1e-8 ? 0 : r.im
  }));

  return result;
}

/**
 * Converts Zero-Pole-Gain (ZPK) format to polynomial coefficients
 */
export function zpkToPoly(
  gainK: number,
  zeros: (number | ComplexNum)[],
  poles: (number | ComplexNum)[]
): { numCoeffs: number[]; denCoeffs: number[] } {
  const expandRoots = (rootsList: (number | ComplexNum)[]): number[] => {
    let poly: number[] = [1];
    for (const r of rootsList) {
      const re = typeof r === 'number' ? r : r.re;
      const im = typeof r === 'number' ? 0 : r.im;

      if (Math.abs(im) < 1e-8) {
        // Real root (s - re)
        const next: number[] = new Array(poly.length + 1).fill(0);
        for (let i = 0; i < poly.length; i++) {
          next[i] += poly[i];
          next[i + 1] -= re * poly[i];
        }
        poly = next;
      } else {
        // Simple heuristic for complex pairs or mixed
      }
    }
    return poly;
  };

  const numPoly = expandRoots(zeros).map(c => c * gainK);
  const denPoly = expandRoots(poles);

  return { numCoeffs: numPoly, denCoeffs: denPoly };
}

/**
 * Parses user numerator & denominator arrays or string input into BodeAnalysisResult
 */
export function analyzeTransferFunction(
  numCoeffs: number[],
  denCoeffs: number[],
  omegaMinPower: number = -2,
  omegaMaxPower: number = 4,
  pointsCount: number = 400
): BodeAnalysisResult {
  // Find raw roots
  const rawZeros = findPolynomialRoots(numCoeffs);
  const rawPoles = findPolynomialRoots(denCoeffs);

  // Group poles & zeros
  const zeros: PoleZero[] = rawZeros.map(z => {
    const omega_n = Math.sqrt(z.re * z.re + z.im * z.im);
    const zeta = omega_n > 1e-9 ? -z.re / omega_n : 0;
    const isOrigin = omega_n < 1e-7;
    return { ...z, type: 'zero', omega_n, zeta, isOrigin };
  });

  const poles: PoleZero[] = rawPoles.map(p => {
    const omega_n = Math.sqrt(p.re * p.re + p.im * p.im);
    const zeta = omega_n > 1e-9 ? -p.re / omega_n : 0;
    const isOrigin = omega_n < 1e-7;
    return { ...p, type: 'pole', omega_n, zeta, isOrigin };
  });

  // Calculate Bode Canonical form factors
  const zerosAtOrigin = zeros.filter(z => z.isOrigin).length;
  const polesAtOrigin = poles.filter(p => p.isOrigin).length;
  const integratorOrder = polesAtOrigin - zerosAtOrigin;

  const numLeading = numCoeffs[0] || 1;
  const denLeading = denCoeffs[0] || 1;
  let kRaw = numLeading / denLeading;

  // Convert gain K_raw to Bode K0
  let k0 = kRaw;
  zeros.filter(z => !z.isOrigin).forEach(z => {
    const dist = Math.sqrt(z.re * z.re + z.im * z.im);
    k0 *= -z.re !== 0 ? dist : 1;
  });
  poles.filter(p => !p.isOrigin).forEach(p => {
    const dist = Math.sqrt(p.re * p.re + p.im * p.im);
    k0 /= dist !== 0 ? dist : 1;
  });

  // Factors identification
  const factors: BodeFactor[] = [];

  // Gain Factor
  factors.push({
    id: 'gain',
    name: 'Constant Gain K₀',
    latex: `K_0 = ${fmtNum(k0, 3)}`,
    type: 'gain',
    omega_c: 0,
    slopeDbDec: 0,
    phaseLow: k0 < 0 ? -180 : 0,
    phaseHigh: k0 < 0 ? -180 : 0
  });

  // Origin Factor
  if (integratorOrder !== 0) {
    const powerStr = Math.abs(integratorOrder) === 1 ? '' : `^${Math.abs(integratorOrder)}`;
    const nameStr = integratorOrder > 0 ? `Integrator 1/s${powerStr}` : `Differentiator s${powerStr}`;
    const latexStr = integratorOrder > 0 ? `\\frac{1}{s${powerStr}}` : `s${powerStr}`;
    factors.push({
      id: 'origin',
      name: nameStr,
      latex: latexStr,
      type: 'origin',
      omega_c: 0,
      slopeDbDec: -20 * integratorOrder,
      phaseLow: -90 * integratorOrder,
      phaseHigh: -90 * integratorOrder
    });
  }

  // Non-origin Zeros
  const processedZeros = new Set<number>();
  zeros.forEach((z, idx) => {
    if (z.isOrigin || processedZeros.has(idx)) return;

    if (Math.abs(z.im) > 1e-6) {
      const pairIdx = zeros.findIndex((other, oIdx) => oIdx !== idx && !processedZeros.has(oIdx) && Math.abs(other.re - z.re) < 1e-4 && Math.abs(other.im + z.im) < 1e-4);
      if (pairIdx !== -1) {
        processedZeros.add(idx);
        processedZeros.add(pairIdx);
        const isRhp = z.re > 1e-6;
        const signStr = isRhp ? '-' : '+';
        factors.push({
          id: `cz_${idx}`,
          name: `${isRhp ? 'RHP ' : ''}Complex Zero Pair (ωₙ=${fmtNum(z.omega_n, 2)}, ζ=${fmtNum(z.zeta, 2)})`,
          latex: `1 ${signStr} 2(${fmtNum(Math.abs(z.zeta), 2)})\\cdot\\frac{s}{${fmtNum(z.omega_n, 2)}} + \\left(\\frac{s}{${fmtNum(z.omega_n, 2)}}\\right)^2`,
          type: 'complex_zero',
          omega_c: z.omega_n,
          slopeDbDec: +40,
          phaseLow: 0,
          phaseHigh: isRhp ? -180 : +180
        });
        return;
      }
    }

    processedZeros.add(idx);
    const wc = z.omega_n;
    const isRhp = z.re > 1e-6;
    factors.push({
      id: `rz_${idx}`,
      name: `${isRhp ? 'RHP (Non-Min Phase) ' : ''}Real Zero (ω_c=${fmtNum(wc, 2)})`,
      latex: isRhp ? `1 - \\frac{s}{${fmtNum(wc, 2)}}` : `1 + \\frac{s}{${fmtNum(wc, 2)}}`,
      type: 'real_zero',
      omega_c: wc,
      slopeDbDec: +20,
      phaseLow: 0,
      phaseHigh: isRhp ? -90 : +90
    });
  });

  // Non-origin Poles
  const processedPoles = new Set<number>();
  poles.forEach((p, idx) => {
    if (p.isOrigin || processedPoles.has(idx)) return;

    if (Math.abs(p.im) > 1e-6) {
      const pairIdx = poles.findIndex((other, oIdx) => oIdx !== idx && !processedPoles.has(oIdx) && Math.abs(other.re - p.re) < 1e-4 && Math.abs(other.im + p.im) < 1e-4);
      if (pairIdx !== -1) {
        processedPoles.add(idx);
        processedPoles.add(pairIdx);
        const isRhp = p.re > 1e-6;
        const signStr = isRhp ? '-' : '+';
        factors.push({
          id: `cp_${idx}`,
          name: `${isRhp ? 'RHP ' : ''}Complex Pole Pair (ωₙ=${fmtNum(p.omega_n, 2)}, ζ=${fmtNum(p.zeta, 2)})`,
          latex: `\\frac{1}{1 ${signStr} 2(${fmtNum(Math.abs(p.zeta), 2)})\\cdot\\frac{s}{${fmtNum(p.omega_n, 2)}} + \\left(\\frac{s}{${fmtNum(p.omega_n, 2)}}\\right)^2}`,
          type: 'complex_pole',
          omega_c: p.omega_n,
          slopeDbDec: -40,
          phaseLow: 0,
          phaseHigh: isRhp ? +180 : -180
        });
        return;
      }
    }

    processedPoles.add(idx);
    const wc = p.omega_n;
    const isRhp = p.re > 1e-6;
    factors.push({
      id: `rp_${idx}`,
      name: `${isRhp ? 'Unstable ' : ''}Real Pole (ω_c=${fmtNum(wc, 2)})`,
      latex: isRhp ? `\\frac{1}{1 - \\frac{s}{${fmtNum(wc, 2)}}}` : `\\frac{1}{1 + \\frac{s}{${fmtNum(wc, 2)}}}`,
      type: 'real_pole',
      omega_c: wc,
      slopeDbDec: -20,
      phaseLow: 0,
      phaseHigh: isRhp ? +90 : -90
    });
  });

  // Evaluate H(j*omega) points across log frequency vector
  const points: BodePoint[] = [];
  const logMin = omegaMinPower;
  const logMax = omegaMaxPower;
  const step = (logMax - logMin) / (pointsCount - 1);

  for (let i = 0; i < pointsCount; i++) {
    const logOmega = logMin + i * step;
    const omega = Math.pow(10, logOmega);

    let numVal = evalPolyComplex(numCoeffs, omega);
    let denVal = evalPolyComplex(denCoeffs, omega);
    let hVal = math.divide(numVal, denVal) as math.Complex;

    const magLinear = math.abs(hVal) as unknown as number;
    const magDb = 20 * Math.log10(Math.max(magLinear, 1e-12));
    const argVal = math.arg(hVal) as unknown as number;
    let phaseDeg = (argVal * 180) / Math.PI;

    let magAsympDb = 20 * Math.log10(Math.max(Math.abs(k0), 1e-12)) - 20 * integratorOrder * Math.log10(omega);
    let phaseAsympDeg = -90 * integratorOrder + (k0 < 0 ? -180 : 0);

    factors.forEach(f => {
      if (f.omega_c > 0) {
        if (omega >= f.omega_c) {
          magAsympDb += f.slopeDbDec * Math.log10(omega / f.omega_c);
        }
        const wLow = f.omega_c / 10;
        const wHigh = f.omega_c * 10;
        if (omega <= wLow) {
          phaseAsympDeg += f.phaseLow;
        } else if (omega >= wHigh) {
          phaseAsympDeg += f.phaseHigh;
        } else {
          const frac = Math.log10(omega / wLow) / 2;
          phaseAsympDeg += f.phaseLow + frac * (f.phaseHigh - f.phaseLow);
        }
      }
    });

    points.push({
      omega,
      magDb,
      magLinear,
      phaseDeg,
      magAsympDb,
      phaseAsympDeg
    });
  }

  // Phase Unwrap
  for (let i = 1; i < points.length; i++) {
    let diff = points[i].phaseDeg - points[i - 1].phaseDeg;
    while (diff > 180) {
      points[i].phaseDeg -= 360;
      diff -= 360;
    }
    while (diff < -180) {
      points[i].phaseDeg += 360;
      diff += 360;
    }
  }

  // Find Gain Crossover Frequency (omega_gc) where magDb crosses 0
  let omega_gc: number | null = null;
  let phaseMargin: number | null = null;

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    if ((p1.magDb >= 0 && p2.magDb <= 0) || (p1.magDb <= 0 && p2.magDb >= 0)) {
      // Linear interpolation
      const frac = Math.abs(p1.magDb) / (Math.abs(p1.magDb) + Math.abs(p2.magDb) + 1e-12);
      omega_gc = p1.omega + frac * (p2.omega - p1.omega);
      const phaseAtGc = p1.phaseDeg + frac * (p2.phaseDeg - p1.phaseDeg);
      phaseMargin = 180 + phaseAtGc;
      break;
    }
  }

  // Find Phase Crossover Frequency (omega_pc) where phaseDeg crosses -180
  let omega_pc: number | null = null;
  let gainMarginDb: number | null = null;
  let gainMarginLinear: number | null = null;

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    if ((p1.phaseDeg >= -180 && p2.phaseDeg <= -180) || (p1.phaseDeg <= -180 && p2.phaseDeg >= -180)) {
      const frac = Math.abs(p1.phaseDeg - (-180)) / (Math.abs(p1.phaseDeg - p2.phaseDeg) + 1e-12);
      omega_pc = p1.omega + frac * (p2.omega - p1.omega);
      const magAtPcDb = p1.magDb + frac * (p2.magDb - p1.magDb);
      gainMarginDb = -magAtPcDb;
      gainMarginLinear = Math.pow(10, gainMarginDb / 20);
      break;
    }
  }

  // Stability Classification
  let isStable: boolean | null = null;
  let stabilityStatus: 'Stable' | 'Unstable' | 'Marginally Stable' | 'Unknown' = 'Unknown';

  // Check right-half plane poles
  const rhpPoles = poles.filter(p => p.re > 1e-6).length;
  if (rhpPoles > 0) {
    isStable = false;
    stabilityStatus = 'Unstable';
  } else if (gainMarginDb !== null && phaseMargin !== null) {
    if (gainMarginDb > 0 && phaseMargin > 0) {
      isStable = true;
      stabilityStatus = 'Stable';
    } else if (Math.abs(gainMarginDb) < 0.1 || Math.abs(phaseMargin) < 0.1) {
      isStable = null;
      stabilityStatus = 'Marginally Stable';
    } else {
      isStable = false;
      stabilityStatus = 'Unstable';
    }
  } else {
    // If no crossovers found, inspect overall margin trend
    const lastMag = points[points.length - 1].magDb;
    if (lastMag < 0) {
      isStable = true;
      stabilityStatus = 'Stable';
    }
  }

  // Construct LaTeX Transfer Function Strings
  const latexNum = formatPolyLatex(numCoeffs);
  const latexDen = formatPolyLatex(denCoeffs);
  const latexTF = `H(s) = \\frac{${latexNum}}{${latexDen}}`;

  const canonicalFactorsStr = factors.map(f => f.latex).join(' \\cdot ');
  const latexCanonical = `H(s) = ${canonicalFactorsStr}`;

  return {
    points,
    poles,
    zeros,
    factors,
    omega_gc,
    phaseMargin,
    omega_pc,
    gainMarginDb,
    gainMarginLinear,
    isStable,
    stabilityStatus,
    latexTF,
    latexCanonical,
    gainK0: k0,
    integratorOrder
  };
}

/**
 * Evaluate polynomial with complex frequency s = j * omega
 */
function evalPolyComplex(coeffs: number[], omega: number): math.Complex {
  const n = coeffs.length;
  let res = math.complex(0, 0);
  const s = math.complex(0, omega); // j*omega

  for (let i = 0; i < n; i++) {
    const power = n - 1 - i;
    const coeff = coeffs[i];
    if (Math.abs(coeff) < 1e-12) continue;

    let term = math.complex(coeff, 0);
    if (power > 0) {
      term = math.multiply(term, math.pow(s, power)) as math.Complex;
    }
    res = math.add(res, term) as math.Complex;
  }
  return res;
}

/**
 * Helper to convert array of coefficients to LaTeX polynomial
 */
export function formatPolyLatex(coeffs: number[]): string {
  if (coeffs.length === 0) return '0';
  const degree = coeffs.length - 1;
  const terms: string[] = [];

  for (let i = 0; i <= degree; i++) {
    const coeff = coeffs[i];
    if (Math.abs(coeff) < 1e-10) continue;
    const power = degree - i;

    let termStr = '';
    const absCoeff = Math.abs(coeff);
    const rawCoeffStr = (Math.round(absCoeff * 1e4) / 1e4).toString().replace('.', ',');
    const coeffStr = absCoeff === 1 && power > 0 ? '' : rawCoeffStr;

    if (power === 0) {
      termStr = `${coeffStr || '1'}`;
    } else if (power === 1) {
      termStr = `${coeffStr}s`;
    } else {
      termStr = `${coeffStr}s^{${power}}`;
    }

    if (terms.length > 0) {
      const sign = coeff > 0 ? ' + ' : ' - ';
      terms.push(`${sign}${termStr}`);
    } else {
      const sign = coeff < 0 ? '-' : '';
      terms.push(`${sign}${termStr}`);
    }
  }

  return terms.join('') || '0';
}
