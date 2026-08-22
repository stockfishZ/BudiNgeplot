import React from 'react';
import { BodeAnalysisResult, FACTOR_COLORS } from '../utils/bodeEngine';
import { MathView } from './MathView';
import { fmtNum } from '../utils/formatUtils';
import { FileText, AlertTriangle, Sparkles } from 'lucide-react';

interface HomeworkBreakdownProps {
  analysis: BodeAnalysisResult;
  activeHoverFactorId?: string | null;
  selectedFactorId?: string | null;
  onHoverFactor?: (id: string | null) => void;
  onSelectFactor?: (id: string | null) => void;
}

export const HomeworkBreakdown: React.FC<HomeworkBreakdownProps> = ({
  analysis,
  activeHoverFactorId = null,
  selectedFactorId = null,
  onHoverFactor,
  onSelectFactor
}) => {
  const getStatusBadge = () => {
    switch (analysis.stabilityStatus) {
      case 'Stable':
        return (
          <span style={{
            backgroundColor: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.85rem',
            fontWeight: '700',
            display: 'inline-flex',
            alignItems: 'center'
          }}>
            System is Stable (GM & PM &gt; 0)
          </span>
        );
      case 'Unstable':
        return (
          <span style={{
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.85rem',
            fontWeight: '700',
            display: 'inline-flex',
            alignItems: 'center'
          }}>
            System is Unstable
          </span>
        );
      default:
        return (
          <span style={{
            backgroundColor: '#FEF3C7',
            color: 'var(--color-warning)',
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.85rem',
            fontWeight: '700',
            display: 'inline-flex',
            alignItems: 'center'
          }}>
            Marginally Stable / Special Case
          </span>
        );
    }
  };

  return (
    <div className="card" style={{ marginTop: '1rem' }}>
      <div className="card-header">
        <h2 className="card-title">
          <FileText size={18} />
          Step-by-Step Solution Breakdown
        </h2>
      </div>

      {/* Stability Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        backgroundColor: 'var(--color-surface-muted)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--color-border-subtle)',
        marginBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: '600', fontFamily: 'var(--font-heading)' }}>
            Stability Assessment:
          </span>
          {getStatusBadge()}
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
          <div>
            <span style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}>GM: </span>
            <strong>{analysis.gainMarginDb !== null ? `${fmtNum(analysis.gainMarginDb, 2)} dB` : '∞'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}>PM: </span>
            <strong>{analysis.phaseMargin !== null ? `${fmtNum(analysis.phaseMargin, 1)}°` : 'N/A'}</strong>
          </div>
        </div>
      </div>

      {/* Equations Section */}
      <div className="equations-grid">
        <div style={{ padding: '0.85rem', backgroundColor: '#FAFAFA', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--color-primary-dark)' }}>
            Given Transfer Function H(s)
          </h4>
          <div style={{ overflowX: 'auto', padding: '0.25rem 0' }}>
            <MathView latex={analysis.latexTF} displayMode={true} />
          </div>
        </div>

        <div style={{ padding: '0.85rem', backgroundColor: '#FAFAFA', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--color-primary-dark)' }}>
            Standard Bode Canonical Factorized Form
          </h4>
          <div style={{ overflowX: 'auto', padding: '0.25rem 0' }}>
            <MathView latex={analysis.latexCanonical} displayMode={true} />
          </div>
        </div>
      </div>

      {/* Factor Breakdown Table */}
      <h4 style={{ fontSize: '0.95rem', color: 'var(--color-primary-dark)', margin: '0 0 0.5rem 0' }}>
        Individual Factor Contributions & Corner Frequencies
      </h4>

      <div className="table-responsive">
        <table className="hw-table" style={{ marginTop: 0 }}>
        <thead>
          <tr>
            <th>Factor Component</th>
            <th>Type</th>
            <th>Corner Freq (<MathView latex="\omega_c" />)</th>
            <th>Mag Slope</th>
            <th>Phase Range</th>
          </tr>
        </thead>
        <tbody>
          {analysis.factors.map((f, i) => {
            const color = FACTOR_COLORS[i % FACTOR_COLORS.length];
            const isSelected = selectedFactorId === f.id;
            const isHovered = activeHoverFactorId === f.id;

            return (
              <tr
                key={f.id || i}
                onMouseEnter={() => onHoverFactor?.(f.id)}
                onMouseLeave={() => onHoverFactor?.(null)}
                onClick={() => onSelectFactor?.(f.id)}
                style={{
                  backgroundColor: isSelected ? 'rgba(79, 70, 229, 0.14)' : isHovered ? 'rgba(79, 70, 229, 0.06)' : undefined,
                  transition: 'background-color 0.15s ease',
                  cursor: 'pointer',
                  outline: isSelected ? `2px solid ${color}` : undefined
                }}
                title={isSelected ? "Click to unlock isolation" : "Click to lock / hover to preview this factor"}
              >
                <td style={{ fontWeight: '600' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: color,
                        flexShrink: 0
                      }}
                    />
                    <MathView latex={f.latex} />
                  </div>
                </td>
                <td style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-muted)' }}>
                  {f.name}
                </td>
                <td>
                  {f.omega_c > 0 ? `${fmtNum(f.omega_c, 2)} rad/s` : '—'}
                </td>
                <td style={{ color: f.slopeDbDec > 0 ? 'green' : f.slopeDbDec < 0 ? 'red' : 'inherit', fontWeight: 'bold' }}>
                  {f.slopeDbDec > 0 ? `+${f.slopeDbDec}` : f.slopeDbDec} dB/dec
                </td>
                <td>
                  {fmtNum(f.phaseLow, 0)}° → {fmtNum(f.phaseHigh, 0)}°
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

      {/* Stability Step-by-Step Equations */}
      <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border-subtle)' }}>
        <h4 style={{ fontSize: '0.95rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem' }}>
          Step-by-Step Stability Derivation
        </h4>

        <div style={{ fontSize: '0.875rem', fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
              <strong>1. Gain Crossover Frequency (<MathView latex="\omega_{gc}" />):</strong>
              <span>Frequency where <MathView latex="|H(j\omega_{gc})| = 0\text{ dB} = 1,0" />.</span>
            </div>
            {analysis.omega_gc !== null ? (
              <div style={{ margin: '0.35rem 0 0.5rem 0.5rem', overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
                <MathView latex={`\\omega_{gc} = ${fmtNum(analysis.omega_gc, 3)} \\text{ rad/s}`} />
                <div style={{ marginTop: '0.35rem', overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
                  <MathView latex={`\\text{PM} = 180^\\circ + \\angle H(j\\omega_{gc}) = 180^\\circ + (${fmtNum(analysis.phaseMargin! - 180, 1)}^\\circ) = \\mathbf{${fmtNum(analysis.phaseMargin!, 1)}^\\circ}`} />
                </div>
              </div>
            ) : (
              <span style={{ color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>No 0 dB crossover detected within frequency range.</span>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
              <strong>2. Phase Crossover Frequency (<MathView latex="\omega_{pc}" />):</strong>
              <span>Frequency where <MathView latex="\angle H(j\omega_{pc}) = -180^\circ" />.</span>
            </div>
            {analysis.omega_pc !== null ? (
              <div style={{ margin: '0.35rem 0 0.5rem 0.5rem', overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
                <MathView latex={`\\omega_{pc} = ${fmtNum(analysis.omega_pc, 3)} \\text{ rad/s}`} />
                <div style={{ marginTop: '0.35rem', overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
                  <MathView latex={`\\text{GM}_{\\text{dB}} = -20 \\log_{10} |H(j\\omega_{pc})| = \\mathbf{${fmtNum(analysis.gainMarginDb!, 2)} \\text{ dB}} \\quad (\\text{Linear GM} = ${fmtNum(analysis.gainMarginLinear, 2)})`} />
                </div>
              </div>
            ) : (
              <span style={{ color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>Phase does not cross -180° (Gain Margin is Infinite ∞).</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

