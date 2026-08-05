import React, { useState, useRef } from 'react';
import { BodeAnalysisResult, BodePoint } from '../utils/bodeEngine';

interface BodeChartProps {
  analysis: BodeAnalysisResult;
  showAsymptotic: boolean;
  showMargins: boolean;
  showGrid: boolean;
  omegaMinPower: number;
  omegaMaxPower: number;
}

export const BodeChart: React.FC<BodeChartProps> = ({
  analysis,
  showAsymptotic,
  showMargins,
  showGrid,
  omegaMinPower,
  omegaMaxPower
}) => {
  const [hoverPoint, setHoverPoint] = useState<BodePoint | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const points = analysis.points;
  if (!points || points.length === 0) return null;

  // Chart dimensions & padding
  const width = 800;
  const magHeight = 260;
  const phaseHeight = 220;
  const gap = 35;
  const totalHeight = magHeight + gap + phaseHeight;

  const paddingLeft = 65;
  const paddingRight = 35;
  const paddingTop = 30;
  const paddingBottom = 40;

  const plotWidth = width - paddingLeft - paddingRight;
  const magPlotHeight = magHeight - paddingTop;
  const phasePlotHeight = phaseHeight - paddingBottom;

  const magY0 = paddingTop;
  const phaseY0 = paddingTop + magHeight + gap;

  // Frequency X mapping: log10(omega) to [0, plotWidth]
  const logMin = omegaMinPower;
  const logMax = omegaMaxPower;
  const getX = (omega: number) => {
    const logW = Math.log10(Math.max(omega, 1e-12));
    const frac = (logW - logMin) / (logMax - logMin);
    return paddingLeft + Math.max(0, Math.min(1, frac)) * plotWidth;
  };

  // Magnitude Y mapping
  // Determine dynamic or standardized dB bounds
  const magVals = points.map(p => p.magDb);
  let minMagDb = Math.min(...magVals, -60);
  let maxMagDb = Math.max(...magVals, +40);

  // Round to decade grid (multiples of 20 dB)
  minMagDb = Math.floor(minMagDb / 20) * 20 - 10;
  maxMagDb = Math.ceil(maxMagDb / 20) * 20 + 10;

  const getMagY = (magDb: number) => {
    const frac = (magDb - minMagDb) / (maxMagDb - minMagDb);
    return magY0 + magPlotHeight * (1 - Math.max(0, Math.min(1, frac)));
  };

  // Phase Y mapping
  const phaseVals = points.map(p => p.phaseDeg);
  let minPhaseDeg = Math.min(...phaseVals, -270);
  let maxPhaseDeg = Math.max(...phaseVals, +90);

  minPhaseDeg = Math.floor(minPhaseDeg / 45) * 45 - 15;
  maxPhaseDeg = Math.ceil(maxPhaseDeg / 45) * 45 + 15;

  const getPhaseY = (phaseDeg: number) => {
    const frac = (phaseDeg - minPhaseDeg) / (maxPhaseDeg - minPhaseDeg);
    return phaseY0 + phasePlotHeight * (1 - Math.max(0, Math.min(1, frac)));
  };

  // Generate SVG Path d strings
  const magExactPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.omega).toFixed(1)} ${getMagY(p.magDb).toFixed(1)}`).join(' ');
  const magAsympPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.omega).toFixed(1)} ${getMagY(p.magAsympDb).toFixed(1)}`).join(' ');
  const phaseExactPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.omega).toFixed(1)} ${getPhaseY(p.phaseDeg).toFixed(1)}`).join(' ');
  const phaseAsympPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.omega).toFixed(1)} ${getPhaseY(p.phaseAsympDeg).toFixed(1)}`).join(' ');

  // Grid Ticks
  const decadeTicks: number[] = [];
  for (let p = logMin; p <= logMax; p++) {
    decadeTicks.push(p);
  }

  // Minor sub-ticks (2..9)
  const minorTicks: number[] = [];
  for (let p = logMin; p < logMax; p++) {
    const base = Math.pow(10, p);
    for (let mult = 2; mult <= 9; mult++) {
      minorTicks.push(base * mult);
    }
  }

  // Mag Y Ticks (every 20 dB)
  const magYTicks: number[] = [];
  for (let db = Math.ceil(minMagDb / 20) * 20; db <= maxMagDb; db += 20) {
    magYTicks.push(db);
  }

  // Phase Y Ticks (every 45 degrees)
  const phaseYTicks: number[] = [];
  for (let deg = Math.ceil(minPhaseDeg / 45) * 45; deg <= maxPhaseDeg; deg += 45) {
    phaseYTicks.push(deg);
  }

  // Mouse hover handler
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseSvgX = ((e.clientX - rect.left) / rect.width) * width;
    const mouseSvgY = ((e.clientY - rect.top) / rect.height) * totalHeight;

    if (mouseSvgX >= paddingLeft && mouseSvgX <= paddingLeft + plotWidth) {
      // Find closest point by X coordinate
      const frac = (mouseSvgX - paddingLeft) / plotWidth;
      const targetLogW = logMin + frac * (logMax - logMin);
      const targetW = Math.pow(10, targetLogW);

      let closest = points[0];
      let minDiff = Math.abs(points[0].omega - targetW);

      for (let i = 1; i < points.length; i++) {
        const diff = Math.abs(points[i].omega - targetW);
        if (diff < minDiff) {
          minDiff = diff;
          closest = points[i];
        }
      }

      setHoverPoint(closest);
      setMousePos({ x: mouseSvgX, y: mouseSvgY });
    } else {
      setHoverPoint(null);
      setMousePos(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverPoint(null);
    setMousePos(null);
  };

  return (
    <div className="card" style={{ padding: '1rem', position: 'relative' }} ref={containerRef}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)' }}>
          Interactive Bode Frequency Response
        </h3>
        <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8rem', fontFamily: 'var(--font-sans)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ display: 'inline-block', width: '14px', height: '3px', backgroundColor: '#001F3F' }}></span>
            Exact Response H(jω)
          </span>
          {showAsymptotic && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ display: 'inline-block', width: '14px', height: '2px', borderTop: '2px dashed #B45309' }}></span>
              Asymptotic Straight Lines
            </span>
          )}
          {showMargins && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#D4AF37' }}></span>
              GM / PM Crossovers
            </span>
          )}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${totalHeight}`}
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible', cursor: 'crosshair' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Background Plot Surfaces */}
        <rect x={paddingLeft} y={magY0} width={plotWidth} height={magPlotHeight} fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1" />
        <rect x={paddingLeft} y={phaseY0} width={plotWidth} height={phasePlotHeight} fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1" />

        {/* LOG X-AXIS GRID LINES */}
        {showGrid && (
          <>
            {/* Minor Sub-ticks */}
            {minorTicks.map((w, idx) => {
              const x = getX(w);
              return (
                <g key={`minor_${idx}`}>
                  <line x1={x} y1={magY0} x2={x} y2={magY0 + magPlotHeight} stroke="#F3F4F6" strokeWidth="1" />
                  <line x1={x} y1={phaseY0} x2={x} y2={phaseY0 + phasePlotHeight} stroke="#F3F4F6" strokeWidth="1" />
                </g>
              );
            })}

            {/* Major Decade Ticks */}
            {decadeTicks.map((p) => {
              const w = Math.pow(10, p);
              const x = getX(w);
              return (
                <g key={`major_${p}`}>
                  <line x1={x} y1={magY0} x2={x} y2={magY0 + magPlotHeight} stroke="#E5E7EB" strokeWidth="1.2" strokeDasharray="4 2" />
                  <line x1={x} y1={phaseY0} x2={x} y2={phaseY0 + phasePlotHeight} stroke="#E5E7EB" strokeWidth="1.2" strokeDasharray="4 2" />
                  
                  {/* X Axis Decade Label */}
                  <text
                    x={x}
                    y={phaseY0 + phasePlotHeight + 20}
                    textAnchor="middle"
                    fill="#374151"
                    fontFamily="var(--font-mono)"
                    fontSize="11"
                    fontWeight="500"
                  >
                    10^{p}
                  </text>
                </g>
              );
            })}
          </>
        )}

        {/* MAGNITUDE Y GRID & LABELS */}
        {magYTicks.map((db) => {
          const y = getMagY(db);
          const isZeroDb = db === 0;
          return (
            <g key={`mag_y_${db}`}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={paddingLeft + plotWidth}
                y2={y}
                stroke={isZeroDb ? '#9CA3AF' : '#F3F4F6'}
                strokeWidth={isZeroDb ? '1.5' : '1'}
                strokeDasharray={isZeroDb ? '0' : '3 3'}
              />
              <text
                x={paddingLeft - 10}
                y={y + 4}
                textAnchor="end"
                fill={isZeroDb ? '#001F3F' : '#6B7280'}
                fontFamily="var(--font-mono)"
                fontSize="11"
                fontWeight={isZeroDb ? '700' : '400'}
              >
                {db > 0 ? `+${db}` : db} dB
              </text>
            </g>
          );
        })}

        {/* PHASE Y GRID & LABELS */}
        {phaseYTicks.map((deg) => {
          const y = getPhaseY(deg);
          const isNeg180 = deg === -180;
          return (
            <g key={`phase_y_${deg}`}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={paddingLeft + plotWidth}
                y2={y}
                stroke={isNeg180 ? '#9CA3AF' : '#F3F4F6'}
                strokeWidth={isNeg180 ? '1.5' : '1'}
                strokeDasharray={isNeg180 ? '0' : '3 3'}
              />
              <text
                x={paddingLeft - 10}
                y={y + 4}
                textAnchor="end"
                fill={isNeg180 ? '#001F3F' : '#6B7280'}
                fontFamily="var(--font-mono)"
                fontSize="11"
                fontWeight={isNeg180 ? '700' : '400'}
              >
                {deg}°
              </text>
            </g>
          );
        })}

        {/* ASYMPTOTIC CURVES */}
        {showAsymptotic && (
          <>
            <path d={magAsympPath} fill="none" stroke="#B45309" strokeWidth="1.8" strokeDasharray="6 4" opacity="0.85" />
            <path d={phaseAsympPath} fill="none" stroke="#B45309" strokeWidth="1.8" strokeDasharray="6 4" opacity="0.85" />

            {/* Corner Frequency Markers */}
            {analysis.factors.filter(f => f.omega_c > 0).map((f, idx) => {
              const x = getX(f.omega_c);
              return (
                <g key={`corner_${idx}`}>
                  <line x1={x} y1={magY0} x2={x} y2={magY0 + magPlotHeight} stroke="#D97706" strokeWidth="1" strokeDasharray="2 2" />
                  <circle cx={x} cy={getMagY(f.slopeDbDec)} r="3.5" fill="#D97706" />
                  <text
                    x={x}
                    y={magY0 - 8}
                    textAnchor="middle"
                    fill="#B45309"
                    fontFamily="var(--font-mono)"
                    fontSize="10"
                    fontWeight="600"
                  >
                    ω_c={f.omega_c.toFixed(1)}
                  </text>
                </g>
              );
            })}
          </>
        )}

        {/* EXACT RESPONSE CURVES */}
        <path d={magExactPath} fill="none" stroke="#001F3F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={phaseExactPath} fill="none" stroke="#001F3F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* GAIN & PHASE MARGIN ANNOTATIONS */}
        {showMargins && (
          <>
            {/* Gain Crossover Point (omega_gc) & Phase Margin (PM) */}
            {analysis.omega_gc !== null && analysis.phaseMargin !== null && (
              <g>
                {/* Drop line from 0 dB on mag chart to phase chart */}
                const xGc = getX(analysis.omega_gc);
                const yMagGc = getMagY(0);
                const yPhaseGc = getPhaseY(-180 + analysis.phaseMargin);
                const yNeg180 = getPhaseY(-180);

                <line x1={getX(analysis.omega_gc)} y1={yMagGc} x2={getX(analysis.omega_gc)} y2={yPhaseGc} stroke="#D4AF37" strokeWidth="2" strokeDasharray="3 3" />
                <circle cx={getX(analysis.omega_gc)} cy={yMagGc} r="5" fill="#D4AF37" stroke="#001F3F" strokeWidth="1.5" />
                <circle cx={getX(analysis.omega_gc)} cy={yPhaseGc} r="5" fill="#D4AF37" stroke="#001F3F" strokeWidth="1.5" />

                {/* PM Vertical Arrow / Span */}
                <line x1={getX(analysis.omega_gc)} y1={yNeg180} x2={getX(analysis.omega_gc)} y2={yPhaseGc} stroke="#D4AF37" strokeWidth="3" />

                {/* Label */}
                <rect x={getX(analysis.omega_gc) + 8} y={yMagGc - 12} width="110" height="20" rx="3" fill="#001F3F" opacity="0.9" />
                <text x={getX(analysis.omega_gc) + 14} y={yMagGc + 2} fill="#FFD700" fontFamily="var(--font-mono)" fontSize="10" fontWeight="600">
                  ω_gc = {analysis.omega_gc.toFixed(2)} rad/s
                </text>

                <rect x={getX(analysis.omega_gc) + 8} y={(yNeg180 + yPhaseGc) / 2 - 10} width="85" height="20" rx="3" fill="#001F3F" opacity="0.9" />
                <text x={getX(analysis.omega_gc) + 14} y={(yNeg180 + yPhaseGc) / 2 + 4} fill="#FFD700" fontFamily="var(--font-mono)" fontSize="10" fontWeight="600">
                  PM = {analysis.phaseMargin.toFixed(1)}°
                </text>
              </g>
            )}

            {/* Phase Crossover Point (omega_pc) & Gain Margin (GM) */}
            {analysis.omega_pc !== null && analysis.gainMarginDb !== null && (
              <g>
                const xPc = getX(analysis.omega_pc);
                const yPhasePc = getPhaseY(-180);
                const yMagPc = getMagY(-analysis.gainMarginDb);
                const y0Db = getMagY(0);

                <line x1={getX(analysis.omega_pc)} y1={yMagPc} x2={getX(analysis.omega_pc)} y2={yPhasePc} stroke="#2ECC40" strokeWidth="2" strokeDasharray="3 3" />
                <circle cx={getX(analysis.omega_pc)} cy={yPhasePc} r="5" fill="#2ECC40" stroke="#001F3F" strokeWidth="1.5" />
                <circle cx={getX(analysis.omega_pc)} cy={yMagPc} r="5" fill="#2ECC40" stroke="#001F3F" strokeWidth="1.5" />

                {/* GM Line */}
                <line x1={getX(analysis.omega_pc)} y1={y0Db} x2={getX(analysis.omega_pc)} y2={yMagPc} stroke="#2ECC40" strokeWidth="3" />

                <rect x={getX(analysis.omega_pc) - 120} y={yPhasePc - 10} width="115" height="20" rx="3" fill="#001F3F" opacity="0.9" />
                <text x={getX(analysis.omega_pc) - 114} y={yPhasePc + 4} fill="#2ECC40" fontFamily="var(--font-mono)" fontSize="10" fontWeight="600">
                  ω_pc = {analysis.omega_pc.toFixed(2)} rad/s
                </text>

                <rect x={getX(analysis.omega_pc) - 105} y={(y0Db + yMagPc) / 2 - 10} width="100" height="20" rx="3" fill="#001F3F" opacity="0.9" />
                <text x={getX(analysis.omega_pc) - 99} y={(y0Db + yMagPc) / 2 + 4} fill="#2ECC40" fontFamily="var(--font-mono)" fontSize="10" fontWeight="600">
                  GM = {analysis.gainMarginDb.toFixed(1)} dB
                </text>
              </g>
            )}
          </>
        )}

        {/* AXIS TITLES */}
        <text x={paddingLeft + plotWidth / 2} y={phaseY0 + phasePlotHeight + 35} textAnchor="middle" fill="#1F2937" fontFamily="var(--font-heading)" fontSize="12" fontWeight="700">
          Frequency ω (rad/s) [Log Scale]
        </text>

        <text x={18} y={magY0 + magPlotHeight / 2} textAnchor="middle" fill="#001F3F" fontFamily="var(--font-heading)" fontSize="12" fontWeight="700" transform={`rotate(-90 18 ${magY0 + magPlotHeight / 2})`}>
          Magnitude |H(jω)| (dB)
        </text>

        <text x={18} y={phaseY0 + phasePlotHeight / 2} textAnchor="middle" fill="#001F3F" fontFamily="var(--font-heading)" fontSize="12" fontWeight="700" transform={`rotate(-90 18 ${phaseY0 + phasePlotHeight / 2})`}>
          Phase ∠H(jω) (Deg)
        </text>

        {/* HOVER CURSOR CROSSHAIR & PROBE TOOLTIP */}
        {hoverPoint && mousePos && (
          <g>
            {/* Vertical crosshair */}
            <line x1={getX(hoverPoint.omega)} y1={magY0} x2={getX(hoverPoint.omega)} y2={phaseY0 + phasePlotHeight} stroke="#001F3F" strokeWidth="1" strokeDasharray="3 3" />

            {/* Dots on exact curves */}
            <circle cx={getX(hoverPoint.omega)} cy={getMagY(hoverPoint.magDb)} r="5" fill="#001F3F" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx={getX(hoverPoint.omega)} cy={getPhaseY(hoverPoint.phaseDeg)} r="5" fill="#001F3F" stroke="#FFFFFF" strokeWidth="2" />

            {/* Floating Tooltip Box */}
            {(() => {
              const tooltipWidth = 200;
              const tooltipHeight = 100;
              let tooltipX = getX(hoverPoint.omega) + 15;
              if (tooltipX + tooltipWidth > width - paddingRight) {
                tooltipX = getX(hoverPoint.omega) - tooltipWidth - 15;
              }
              let tooltipY = magY0 + 15;

              return (
                <g transform={`translate(${tooltipX}, ${tooltipY})`}>
                  <rect width={tooltipWidth} height={tooltipHeight} rx="4" fill="#001F3F" opacity="0.95" stroke="#D4AF37" strokeWidth="1" />
                  <text x="12" y="22" fill="#FFD700" fontFamily="var(--font-mono)" fontSize="11" fontWeight="700">
                    Frequency: {hoverPoint.omega.toFixed(2)} rad/s
                  </text>
                  <line x1="10" y1="28" x2={tooltipWidth - 10} y2="28" stroke="rgba(255,255,255,0.2)" />
                  <text x="12" y="46" fill="#FFFFFF" fontFamily="var(--font-mono)" fontSize="11">
                    Magnitude: <tspan fontWeight="700">{hoverPoint.magDb.toFixed(2)} dB</tspan>
                  </text>
                  <text x="12" y="64" fill="#FFFFFF" fontFamily="var(--font-mono)" fontSize="11">
                    Phase: <tspan fontWeight="700">{hoverPoint.phaseDeg.toFixed(1)}°</tspan>
                  </text>
                  {showAsymptotic && (
                    <text x="12" y="82" fill="#D97706" fontFamily="var(--font-mono)" fontSize="10">
                      Asymptotic: {hoverPoint.magAsympDb.toFixed(1)} dB
                    </text>
                  )}
                </g>
              );
            })()}
          </g>
        )}
      </svg>
    </div>
  );
};
