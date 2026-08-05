import React, { useRef } from 'react';
import { PoleZero } from '../utils/bodeEngine';
import { fmtNum } from '../utils/formatUtils';

interface PoleZeroMapProps {
  poles: PoleZero[];
  zeros: PoleZero[];
}

export const PoleZeroMap: React.FC<PoleZeroMapProps> = ({ poles, zeros }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const width = 400;
  const height = 300;
  const padding = 40;

  const plotW = width - 2 * padding;
  const plotH = height - 2 * padding;

  const allPoints = [...poles, ...zeros];
  let maxVal = 5;
  allPoints.forEach(pt => {
    maxVal = Math.max(maxVal, Math.abs(pt.re), Math.abs(pt.im));
  });
  const limit = Math.ceil(maxVal * 1.3);

  const getX = (re: number) => padding + plotW / 2 + (re / limit) * (plotW / 2);
  const getY = (im: number) => padding + plotH / 2 - (im / limit) * (plotH / 2);

  return (
    <div className="card" style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--color-primary-dark)', margin: 0 }}>
          S-Plane Pole-Zero Map
        </h3>
      </div>

      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {/* Background Regions */}
        <rect
          x={padding}
          y={padding}
          width={plotW / 2}
          height={plotH}
          fill="rgba(46, 204, 64, 0.05)"
          stroke="none"
        />
        <rect
          x={padding + plotW / 2}
          y={padding}
          width={plotW / 2}
          height={plotH}
          fill="rgba(229, 62, 62, 0.05)"
          stroke="none"
        />

        {/* AXIS LINES */}
        <line x1={padding} y1={getY(0)} x2={width - padding} y2={getY(0)} stroke="#9CA3AF" strokeWidth="1.5" />
        <line x1={getX(0)} y1={padding} x2={getX(0)} y2={height - padding} stroke="#9CA3AF" strokeWidth="1.5" />

        {/* Damping Ratio ζ = 0.707 diagonal lines */}
        {(() => {
          const angle707 = Math.PI / 4;
          const xLine = limit * Math.cos(angle707);
          const yLine = limit * Math.sin(angle707);
          return (
            <g stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3 3">
              <line x1={getX(-xLine)} y1={getY(yLine)} x2={getX(0)} y2={getY(0)} />
              <line x1={getX(-xLine)} y1={getY(-yLine)} x2={getX(0)} y2={getY(0)} />
            </g>
          );
        })()}

        {/* Natural Frequency Circles */}
        {[limit * 0.4, limit * 0.8].map((rW, i) => (
          <circle
            key={i}
            cx={getX(0)}
            cy={getY(0)}
            r={(rW / limit) * (plotW / 2)}
            fill="none"
            stroke="#F3F4F6"
            strokeWidth="1"
          />
        ))}

        {/* Axis Labels */}
        <text x={width - padding + 5} y={getY(0) + 4} fill="#6B7280" fontFamily="var(--font-mono)" fontSize="10">
          σ (Real)
        </text>
        <text x={getX(0)} y={padding - 10} textAnchor="middle" fill="#6B7280" fontFamily="var(--font-mono)" fontSize="10">
          jω (Imag)
        </text>

        {/* DRAW ZEROS (Circles) */}
        {zeros.map((z, idx) => {
          const cx = getX(z.re);
          const cy = getY(z.im);
          return (
            <g key={`zero_${idx}`}>
              <circle cx={cx} cy={cy} r="6" fill="none" stroke="#D4AF37" strokeWidth="2.5" />
              <title>{`Zero: ${fmtNum(z.re, 2)} + j(${fmtNum(z.im, 2)}), ωn=${fmtNum(z.omega_n, 2)}, ζ=${fmtNum(z.zeta, 2)}`}</title>
            </g>
          );
        })}

        {/* DRAW POLES (Crosses) */}
        {poles.map((p, idx) => {
          const cx = getX(p.re);
          const cy = getY(p.im);
          const size = 5;
          const isUnstable = p.re > 1e-5;
          const strokeColor = isUnstable ? '#991B1B' : '#001F3F';
          return (
            <g key={`pole_${idx}`}>
              <line x1={cx - size} y1={cy - size} x2={cx + size} y2={cy + size} stroke={strokeColor} strokeWidth="2.5" />
              <line x1={cx - size} y1={cy + size} x2={cx + size} y2={cy - size} stroke={strokeColor} strokeWidth="2.5" />
              <title>{`Pole: ${fmtNum(p.re, 2)} + j(${fmtNum(p.im, 2)}), ωn=${fmtNum(p.omega_n, 2)}, ζ=${fmtNum(p.zeta, 2)}`}</title>
            </g>
          );
        })}
      </svg>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.75rem', fontFamily: 'var(--font-sans)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ color: '#001F3F', fontWeight: 'bold', fontSize: '1rem' }}>✕</span> Pole
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px solid #D4AF37', display: 'inline-block' }}></span> Zero
        </span>
        <span style={{ color: 'var(--color-text-muted)' }}>
          Green = LHP Stable | Red = RHP Unstable
        </span>
      </div>
    </div>
  );
};
