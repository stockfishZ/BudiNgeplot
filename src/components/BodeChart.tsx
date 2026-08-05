import React, { useState, useRef } from 'react';
import { BodeAnalysisResult, BodePoint } from '../utils/bodeEngine';
import { exportSvg, exportPng } from '../utils/exportChart';
import { fmtNum } from '../utils/formatUtils';
import { Download, Image as ImageIcon, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

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

  // Synchronized Zoom State
  const [zoomRange, setZoomRange] = useState<{ minLog: number; maxLog: number } | null>(null);

  // Drag selection brush zoom
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectStartX, setSelectStartX] = useState<number | null>(null);
  const [selectCurrentX, setSelectCurrentX] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const points = analysis.points;
  if (!points || points.length === 0) return null;

  // Effective frequency bounds (Log10 scale)
  const logMin = zoomRange ? zoomRange.minLog : omegaMinPower;
  const logMax = zoomRange ? zoomRange.maxLog : omegaMaxPower;

  // Chart dimensions & padding
  const width = 800;
  const magHeight = 245;
  const phaseHeight = 220;
  const gap = 40;
  const totalHeight = 520; // 520px height encloses all elements cleanly without clipping bottom labels

  const paddingLeft = 85;
  const paddingRight = 35;
  const paddingTop = 35;
  const paddingBottom = 40;

  const plotWidth = width - paddingLeft - paddingRight;
  const magPlotHeight = magHeight - paddingTop; // 210px
  const phasePlotHeight = phaseHeight - paddingBottom; // 180px

  const magY0 = paddingTop; // y = 35
  const phaseY0 = magY0 + magPlotHeight + gap; // y = 35 + 210 + 40 = 285

  // Frequency X mapping: log10(omega) to [0, plotWidth]
  const getX = (omega: number) => {
    const logW = Math.log10(Math.max(omega, 1e-12));
    const frac = (logW - logMin) / (logMax - logMin);
    return paddingLeft + Math.max(0, Math.min(1, frac)) * plotWidth;
  };

  // Magnitude Y mapping
  const magVals = points.map(p => p.magDb);
  let minMagDb = Math.min(...magVals, -60);
  let maxMagDb = Math.max(...magVals, +40);

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

  // Filter points visible in active frequency window
  const visiblePoints = points.filter(p => {
    const logW = Math.log10(p.omega);
    return logW >= logMin - 0.05 && logW <= logMax + 0.05;
  });

  // Generate SVG Path d strings
  const magExactPath = visiblePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.omega).toFixed(1)} ${getMagY(p.magDb).toFixed(1)}`).join(' ');
  const magAsympPath = visiblePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.omega).toFixed(1)} ${getMagY(p.magAsympDb).toFixed(1)}`).join(' ');
  const phaseExactPath = visiblePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.omega).toFixed(1)} ${getPhaseY(p.phaseDeg).toFixed(1)}`).join(' ');
  const phaseAsympPath = visiblePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.omega).toFixed(1)} ${getPhaseY(p.phaseAsympDeg).toFixed(1)}`).join(' ');

  // Grid Ticks
  const decadeTicks: number[] = [];
  const startDecade = Math.floor(logMin);
  const endDecade = Math.ceil(logMax);
  for (let p = startDecade; p <= endDecade; p++) {
    if (p >= logMin - 0.1 && p <= logMax + 0.1) {
      decadeTicks.push(p);
    }
  }

  const minorTicks: number[] = [];
  for (let p = startDecade - 1; p <= endDecade; p++) {
    const base = Math.pow(10, p);
    for (let mult = 2; mult <= 9; mult++) {
      const w = base * mult;
      const logW = Math.log10(w);
      if (logW >= logMin && logW <= logMax) {
        minorTicks.push(w);
      }
    }
  }

  const magYTicks: number[] = [];
  for (let db = Math.ceil(minMagDb / 20) * 20; db <= maxMagDb; db += 20) {
    magYTicks.push(db);
  }

  const phaseYTicks: number[] = [];
  for (let deg = Math.ceil(minPhaseDeg / 45) * 45; deg <= maxPhaseDeg; deg += 45) {
    phaseYTicks.push(deg);
  }

  // Zoom Button Controls
  const handleZoomIn = () => {
    const center = (logMin + logMax) / 2;
    const span = (logMax - logMin) * 0.6;
    if (span >= 0.2) {
      setZoomRange({ minLog: center - span / 2, maxLog: center + span / 2 });
    }
  };

  const handleZoomOut = () => {
    const center = (logMin + logMax) / 2;
    const span = (logMax - logMin) * 1.5;
    setZoomRange({
      minLog: Math.max(omegaMinPower - 1, center - span / 2),
      maxLog: Math.min(omegaMaxPower + 1, center + span / 2)
    });
  };

  const handleResetZoom = () => {
    setZoomRange(null);
  };

  // Mouse drag selection / hover handlers
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseSvgX = ((e.clientX - rect.left) / rect.width) * width;
    if (mouseSvgX >= paddingLeft && mouseSvgX <= paddingLeft + plotWidth) {
      setIsSelecting(true);
      setSelectStartX(mouseSvgX);
      setSelectCurrentX(mouseSvgX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseSvgX = ((e.clientX - rect.left) / rect.width) * width;
    const mouseSvgY = ((e.clientY - rect.top) / rect.height) * totalHeight;

    if (isSelecting) {
      setSelectCurrentX(Math.max(paddingLeft, Math.min(paddingLeft + plotWidth, mouseSvgX)));
      return;
    }

    if (mouseSvgX >= paddingLeft && mouseSvgX <= paddingLeft + plotWidth) {
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

  const handleMouseUp = () => {
    if (isSelecting && selectStartX !== null && selectCurrentX !== null) {
      const x1 = Math.min(selectStartX, selectCurrentX);
      const x2 = Math.max(selectStartX, selectCurrentX);
      if (Math.abs(x2 - x1) > 12) {
        const frac1 = (x1 - paddingLeft) / plotWidth;
        const frac2 = (x2 - paddingLeft) / plotWidth;
        const w1Log = logMin + frac1 * (logMax - logMin);
        const w2Log = logMin + frac2 * (logMax - logMin);
        setZoomRange({ minLog: w1Log, maxLog: w2Log });
      }
    }
    setIsSelecting(false);
    setSelectStartX(null);
    setSelectCurrentX(null);
  };

  const handleMouseLeave = () => {
    setIsSelecting(false);
    setSelectStartX(null);
    setSelectCurrentX(null);
    setHoverPoint(null);
    setMousePos(null);
  };

  const handleExportPng = () => {
    if (svgRef.current) exportPng(svgRef.current, 'bode_plot_budingeplot.png');
  };

  const handleExportSvg = () => {
    if (svgRef.current) exportSvg(svgRef.current, 'bode_plot_budingeplot.svg');
  };

  return (
    <div className="card" style={{ padding: '1rem', position: 'relative' }} ref={containerRef}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)', margin: 0 }}>
          Interactive Bode Frequency Response
        </h3>

        {/* Synchronized Zoom & Image Export Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', paddingRight: '0.5rem', borderRight: '1px solid #E5E7EB' }}>
            <button className="btn btn-secondary btn-sm no-print" onClick={handleZoomIn} title="Zoom In Synchronously (+)">
              <ZoomIn size={14} />
            </button>
            <button className="btn btn-secondary btn-sm no-print" onClick={handleZoomOut} title="Zoom Out Synchronously (-)">
              <ZoomOut size={14} />
            </button>
            {zoomRange && (
              <button className="btn btn-gold btn-sm no-print" onClick={handleResetZoom} title="Reset Frequency Range">
                <RotateCcw size={13} /> Reset Zoom
              </button>
            )}
          </div>

          <button className="btn btn-secondary btn-sm no-print" onClick={handleExportPng} title="Export High-Res PNG Image">
            <ImageIcon size={14} /> PNG
          </button>
          <button className="btn btn-secondary btn-sm no-print" onClick={handleExportSvg} title="Export Vector SVG File">
            <Download size={14} /> SVG
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8rem', fontFamily: 'var(--font-sans)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ display: 'inline-block', width: '14px', height: '3px', backgroundColor: '#001F3F' }}></span>
            Exact Response H(jω)
          </span>
          {showAsymptotic && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ display: 'inline-block', width: '14px', height: '2px', borderTop: '2px dashed #B45309' }}></span>
              Asymptotic Lines
            </span>
          )}
          {showMargins && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#D4AF37' }}></span>
              GM / PM Crossovers
            </span>
          )}
        </div>

        <small style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}>
          💡 Drag horizontally on either chart to zoom into a frequency window
        </small>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${totalHeight}`}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          overflow: 'visible',
          cursor: isSelecting ? 'col-resize' : 'crosshair',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <clipPath id="magClip">
            <rect x={paddingLeft} y={magY0} width={plotWidth} height={magPlotHeight} />
          </clipPath>
          <clipPath id="phaseClip">
            <rect x={paddingLeft} y={phaseY0} width={plotWidth} height={phasePlotHeight} />
          </clipPath>
        </defs>

        {/* Background Plot Surfaces */}
        <rect x={paddingLeft} y={magY0} width={plotWidth} height={magPlotHeight} fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1" />
        <rect x={paddingLeft} y={phaseY0} width={plotWidth} height={phasePlotHeight} fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1" />

        {/* LOG X-AXIS GRID LINES & DUAL FREQUENCY METRICS (TOP & BOTTOM) */}
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

            {/* Major Decade Ticks & Dual X-Axis Metric Labels */}
            {decadeTicks.map((p) => {
              const w = Math.pow(10, p);
              const x = getX(w);
              return (
                <g key={`major_${p}`}>
                  <line x1={x} y1={magY0} x2={x} y2={magY0 + magPlotHeight} stroke="#E5E7EB" strokeWidth="1.2" strokeDasharray="4 2" />
                  <line x1={x} y1={phaseY0} x2={x} y2={phaseY0 + phasePlotHeight} stroke="#E5E7EB" strokeWidth="1.2" strokeDasharray="4 2" />
                  
                  {/* TOP X-AXIS FREQUENCY METRIC FOR dB PLOT */}
                  <text
                    x={x}
                    y={magY0 - 8}
                    textAnchor="middle"
                    fill="#374151"
                    fontFamily="var(--font-mono)"
                    fontSize="11"
                    fontWeight="600"
                  >
                    10^{p}
                  </text>

                  {/* BOTTOM X-AXIS FREQUENCY METRIC FOR PHASE PLOT */}
                  <text
                    x={x}
                    y={phaseY0 + phasePlotHeight + 20}
                    textAnchor="middle"
                    fill="#374151"
                    fontFamily="var(--font-mono)"
                    fontSize="11"
                    fontWeight="600"
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
                x={paddingLeft - 12}
                y={y + 4}
                textAnchor="end"
                fill={isZeroDb ? '#001F3F' : '#6B7280'}
                fontFamily="var(--font-mono)"
                fontSize="11"
                fontWeight={isZeroDb ? '700' : '400'}
              >
                {db > 0 ? `+${fmtNum(db, 0)}` : fmtNum(db, 0)} dB
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
                x={paddingLeft - 12}
                y={y + 4}
                textAnchor="end"
                fill={isNeg180 ? '#001F3F' : '#6B7280'}
                fontFamily="var(--font-mono)"
                fontSize="11"
                fontWeight={isNeg180 ? '700' : '400'}
              >
                {fmtNum(deg, 0)}°
              </text>
            </g>
          );
        })}

        {/* CORNER FREQUENCY (ω_c) METRIC TICKS ON TOP X-AXIS OF dB PLOT */}
        {analysis.factors.filter(f => f.omega_c > 0).map((f, idx) => {
          const x = getX(f.omega_c);
          const inView = Math.log10(f.omega_c) >= logMin && Math.log10(f.omega_c) <= logMax;
          if (!inView) return null;
          return (
            <g key={`top_wc_${idx}`}>
              <line x1={x} y1={magY0 - 5} x2={x} y2={magY0} stroke="#B45309" strokeWidth="1.5" />
              <rect x={x - 30} y={magY0 - 24} width="60" height="16" rx="3" fill="#FEF3C7" stroke="#FCD34D" strokeWidth="1" />
              <text
                x={x}
                y={magY0 - 12}
                textAnchor="middle"
                fill="#B45309"
                fontFamily="var(--font-mono)"
                fontSize="9.5"
                fontWeight="700"
              >
                ω_c={fmtNum(f.omega_c, 1)}
              </text>
            </g>
          );
        })}

        {/* ASYMPTOTIC CURVES */}
        {showAsymptotic && (
          <>
            <path d={magAsympPath} fill="none" stroke="#B45309" strokeWidth="1.8" strokeDasharray="6 4" opacity="0.85" clipPath="url(#magClip)" />
            <path d={phaseAsympPath} fill="none" stroke="#B45309" strokeWidth="1.8" strokeDasharray="6 4" opacity="0.85" clipPath="url(#phaseClip)" />

            {/* Subtle Corner Frequency Dots */}
            {analysis.factors.filter(f => f.omega_c > 0).map((f, idx) => {
              const x = getX(f.omega_c);
              const inView = Math.log10(f.omega_c) >= logMin && Math.log10(f.omega_c) <= logMax;
              if (!inView) return null;
              return (
                <g key={`corner_${idx}`} clipPath="url(#magClip)">
                  <line x1={x} y1={magY0} x2={x} y2={magY0 + magPlotHeight} stroke="#D97706" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
                  <circle cx={x} cy={getMagY(f.slopeDbDec)} r="3" fill="#D97706" />
                </g>
              );
            })}
          </>
        )}

        {/* EXACT RESPONSE CURVES */}
        <path d={magExactPath} fill="none" stroke="#001F3F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" clipPath="url(#magClip)" />
        <path d={phaseExactPath} fill="none" stroke="#001F3F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" clipPath="url(#phaseClip)" />

        {/* GAIN & PHASE MARGIN ANNOTATIONS (Clean drop lines & margin spans without duplicate badges) */}
        {showMargins && (
          <>
            {/* Gain Crossover Point (omega_gc) & Phase Margin (PM) */}
            {analysis.omega_gc !== null && analysis.phaseMargin !== null && (() => {
              const xGc = getX(analysis.omega_gc);
              const yMagGc = getMagY(0);
              const yPhaseGc = getPhaseY(-180 + analysis.phaseMargin);
              const yNeg180 = getPhaseY(-180);
              const inView = Math.log10(analysis.omega_gc) >= logMin && Math.log10(analysis.omega_gc) <= logMax;
              if (!inView) return null;

              return (
              <g>
                <line x1={xGc} y1={yMagGc} x2={xGc} y2={yPhaseGc} stroke="#D4AF37" strokeWidth="1.8" strokeDasharray="3 3" />
                <circle cx={xGc} cy={yMagGc} r="4.5" fill="#D4AF37" stroke="#001F3F" strokeWidth="1.5" />
                <circle cx={xGc} cy={yPhaseGc} r="4.5" fill="#D4AF37" stroke="#001F3F" strokeWidth="1.5" />

                <line x1={xGc} y1={yNeg180} x2={xGc} y2={yPhaseGc} stroke="#D4AF37" strokeWidth="2.5" />

                <rect x={xGc + 8} y={(yNeg180 + yPhaseGc) / 2 - 10} width="85" height="20" rx="3" fill="#001F3F" opacity="0.9" />
                <text x={xGc + 14} y={(yNeg180 + yPhaseGc) / 2 + 4} fill="#FFD700" fontFamily="var(--font-mono)" fontSize="10" fontWeight="600">
                  PM = {fmtNum(analysis.phaseMargin, 1)}°
                </text>
              </g>
              );
            })()}

            {/* Phase Crossover Point (omega_pc) & Gain Margin (GM) */}
            {analysis.omega_pc !== null && analysis.gainMarginDb !== null && (() => {
              const xPc = getX(analysis.omega_pc);
              const yPhasePc = getPhaseY(-180);
              const yMagPc = getMagY(-analysis.gainMarginDb);
              const y0Db = getMagY(0);
              const inView = Math.log10(analysis.omega_pc) >= logMin && Math.log10(analysis.omega_pc) <= logMax;
              if (!inView) return null;

              return (
              <g>
                <line x1={xPc} y1={yMagPc} x2={xPc} y2={yPhasePc} stroke="#2ECC40" strokeWidth="1.8" strokeDasharray="3 3" />
                <circle cx={xPc} cy={yPhasePc} r="4.5" fill="#2ECC40" stroke="#001F3F" strokeWidth="1.5" />
                <circle cx={xPc} cy={yMagPc} r="4.5" fill="#2ECC40" stroke="#001F3F" strokeWidth="1.5" />

                <line x1={xPc} y1={y0Db} x2={xPc} y2={yMagPc} stroke="#2ECC40" strokeWidth="2.5" />

                <rect x={xPc - 100} y={(y0Db + yMagPc) / 2 - 10} width="95" height="20" rx="3" fill="#001F3F" opacity="0.9" />
                <text x={xPc - 94} y={(y0Db + yMagPc) / 2 + 4} fill="#2ECC40" fontFamily="var(--font-mono)" fontSize="10" fontWeight="600">
                  GM = {fmtNum(analysis.gainMarginDb, 1)} dB
                </text>
              </g>
              );
            })()}
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

        {/* BRUSH SELECTION RECTANGLE (DURING DRAG ZOOM) */}
        {isSelecting && selectStartX !== null && selectCurrentX !== null && (() => {
          const x1 = Math.min(selectStartX, selectCurrentX);
          const widthSel = Math.abs(selectCurrentX - selectStartX);
          return (
            <g>
              <rect
                x={x1}
                y={magY0}
                width={widthSel}
                height={phaseY0 + phasePlotHeight - magY0}
                fill="rgba(212, 175, 55, 0.15)"
                stroke="#D4AF37"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
            </g>
          );
        })()}

        {/* HOVER CURSOR CROSSHAIR & ENRICHED PROBE TOOLTIP */}
        {!isSelecting && hoverPoint && mousePos && (
          <g>
            <line x1={getX(hoverPoint.omega)} y1={magY0} x2={getX(hoverPoint.omega)} y2={phaseY0 + phasePlotHeight} stroke="#001F3F" strokeWidth="1" strokeDasharray="3 3" />

            <circle cx={getX(hoverPoint.omega)} cy={getMagY(hoverPoint.magDb)} r="5" fill="#001F3F" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx={getX(hoverPoint.omega)} cy={getPhaseY(hoverPoint.phaseDeg)} r="5" fill="#001F3F" stroke="#FFFFFF" strokeWidth="2" />

            {/* Check proximity to key metrics */}
            {(() => {
              const nearCorner = analysis.factors.find(f => f.omega_c > 0 && Math.abs(Math.log10(hoverPoint.omega) - Math.log10(f.omega_c)) < 0.08);
              const isNearGc = analysis.omega_gc !== null && Math.abs(Math.log10(hoverPoint.omega) - Math.log10(analysis.omega_gc)) < 0.08;
              const isNearPc = analysis.omega_pc !== null && Math.abs(Math.log10(hoverPoint.omega) - Math.log10(analysis.omega_pc)) < 0.08;

              const hasExtraInfo = nearCorner || isNearGc || isNearPc;
              const tooltipWidth = 220;
              const tooltipHeight = 100 + (hasExtraInfo ? 20 : 0);
              let tooltipX = getX(hoverPoint.omega) + 15;
              if (tooltipX + tooltipWidth > width - paddingRight) {
                tooltipX = getX(hoverPoint.omega) - tooltipWidth - 15;
              }
              let tooltipY = magY0 + 15;

              return (
                <g transform={`translate(${tooltipX}, ${tooltipY})`}>
                  <rect width={tooltipWidth} height={tooltipHeight} rx="4" fill="#001F3F" opacity="0.95" stroke="#D4AF37" strokeWidth="1.2" />
                  <text x="12" y="22" fill="#FFD700" fontFamily="var(--font-mono)" fontSize="11" fontWeight="700">
                    Frequency: {fmtNum(hoverPoint.omega, 2)} rad/s
                  </text>
                  <line x1="10" y1="28" x2={tooltipWidth - 10} y2="28" stroke="rgba(255,255,255,0.2)" />
                  <text x="12" y="46" fill="#FFFFFF" fontFamily="var(--font-mono)" fontSize="11">
                    Magnitude: <tspan fontWeight="700">{fmtNum(hoverPoint.magDb, 2)} dB</tspan>
                  </text>
                  <text x="12" y="64" fill="#FFFFFF" fontFamily="var(--font-mono)" fontSize="11">
                    Phase: <tspan fontWeight="700">{fmtNum(hoverPoint.phaseDeg, 1)}°</tspan>
                  </text>
                  {showAsymptotic && (
                    <text x="12" y="82" fill="#D97706" fontFamily="var(--font-mono)" fontSize="10">
                      Asymptotic: {fmtNum(hoverPoint.magAsympDb, 1)} dB
                    </text>
                  )}

                  {/* Proximity Highlights */}
                  {isNearGc && (
                    <text x="12" y={tooltipHeight - 10} fill="#FFD700" fontFamily="var(--font-mono)" fontSize="10" fontWeight="700">
                      Gain Crossover (ω_gc): {fmtNum(analysis.omega_gc, 2)}
                    </text>
                  )}
                  {!isNearGc && isNearPc && (
                    <text x="12" y={tooltipHeight - 10} fill="#2ECC40" fontFamily="var(--font-mono)" fontSize="10" fontWeight="700">
                      Phase Crossover (ω_pc): {fmtNum(analysis.omega_pc, 2)}
                    </text>
                  )}
                  {!isNearGc && !isNearPc && nearCorner && (
                    <text x="12" y={tooltipHeight - 10} fill="#D97706" fontFamily="var(--font-mono)" fontSize="10" fontWeight="700">
                      Corner Freq (ω_c): {fmtNum(nearCorner.omega_c, 2)}
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
