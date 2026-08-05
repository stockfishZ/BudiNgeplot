import React, { useState } from 'react';
import { BodeAnalysisResult } from '../utils/bodeEngine';
import { MathView } from './MathView';
import { Copy, Check, FileText, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

interface HomeworkBreakdownProps {
  analysis: BodeAnalysisResult;
}

export const HomeworkBreakdown: React.FC<HomeworkBreakdownProps> = ({ analysis }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLatex = () => {
    const fullLatexText = `% --- BodeNgeplot Homework Solution Export ---
\\documentclass{article}
\\usepackage{amsmath}
\\begin{document}

\\section*{Transfer Function Analysis}
Given the system transfer function:
\\[ ${analysis.latexTF} \\]

Canonical Bode Factorized Form:
\\[ ${analysis.latexCanonical} \\]

\\subsection*{Bode Factor Breakdown Table}
\\begin{tabular}{|l|c|c|r|}
\\hline
Factor & Type & Corner Frequency $\\omega_c$ & Magnitude Slope \\\\
\\hline
${analysis.factors.map(f => `${f.name} & ${f.type} & ${f.omega_c > 0 ? f.omega_c.toFixed(2) + ' rad/s' : 'N/A'} & ${f.slopeDbDec > 0 ? '+' + f.slopeDbDec : f.slopeDbDec} dB/dec \\\\`).join('\n')}
\\hline
\\end{tabular}

\\subsection*{Stability and Margin Derivations}
\\begin{itemize}
  \\item Gain Crossover Frequency: $\\omega_{gc} = ${analysis.omega_gc !== null ? analysis.omega_gc.toFixed(3) + ' \\text{ rad/s}' : '\\text{N/A}'}$
  \\item Phase Margin: $\\text{PM} = ${analysis.phaseMargin !== null ? analysis.phaseMargin.toFixed(2) + '^\\circ' : '\\text{N/A}'}$
  \\item Phase Crossover Frequency: $\\omega_{pc} = ${analysis.omega_pc !== null ? analysis.omega_pc.toFixed(3) + ' \\text{ rad/s}' : '\\text{N/A}'}$
  \\item Gain Margin: $\\text{GM} = ${analysis.gainMarginDb !== null ? analysis.gainMarginDb.toFixed(2) + ' \\text{ dB}' : '\\text{N/A}'}$
  \\item Stability Status: \\textbf{${analysis.stabilityStatus}}
\\end{itemize}

\\end{document}`;

    navigator.clipboard.writeText(fullLatexText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <ShieldCheck size={16} /> System is Stable (GM & PM &gt; 0)
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
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <ShieldAlert size={16} /> System is Unstable
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
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <AlertTriangle size={16} /> Marginally Stable / Special Case
          </span>
        );
    }
  };

  return (
    <div className="card" style={{ marginTop: '1rem' }}>
      <div className="card-header">
        <h2 className="card-title">
          <FileText size={18} />
          Homework Step-by-Step Solution Breakdown
        </h2>
        <button className="btn btn-secondary btn-sm no-print" onClick={handleCopyLatex}>
          {copied ? <Check size={14} color="green" /> : <Copy size={14} />}
          {copied ? 'Copied LaTeX!' : 'Copy LaTeX Code'}
        </button>
      </div>

      {/* Stability Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        backgroundColor: 'var(--color-surface-muted)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--color-border-subtle)',
        marginBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: '600', fontFamily: 'var(--font-heading)' }}>
            Stability Assessment:
          </span>
          {getStatusBadge()}
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
          <div>
            <span style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}>GM: </span>
            <strong>{analysis.gainMarginDb !== null ? `${analysis.gainMarginDb.toFixed(2)} dB` : '∞'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}>PM: </span>
            <strong>{analysis.phaseMargin !== null ? `${analysis.phaseMargin.toFixed(1)}°` : 'N/A'}</strong>
          </div>
        </div>
      </div>

      {/* Equations Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
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
      <h4 style={{ fontSize: '0.95rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem' }}>
        Individual Factor Contributions & Corner Frequencies
      </h4>

      <table className="hw-table">
        <thead>
          <tr>
            <th>Factor Component</th>
            <th>Type</th>
            <th>Corner Freq (ω_c)</th>
            <th>Mag Slope</th>
            <th>Phase Range</th>
          </tr>
        </thead>
        <tbody>
          {analysis.factors.map((f, i) => (
            <tr key={i}>
              <td style={{ fontWeight: '600' }}>
                <MathView latex={f.latex} />
              </td>
              <td style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-muted)' }}>
                {f.name}
              </td>
              <td>
                {f.omega_c > 0 ? `${f.omega_c.toFixed(2)} rad/s` : '—'}
              </td>
              <td style={{ color: f.slopeDbDec > 0 ? 'green' : f.slopeDbDec < 0 ? 'red' : 'inherit', fontWeight: 'bold' }}>
                {f.slopeDbDec > 0 ? `+${f.slopeDbDec}` : f.slopeDbDec} dB/dec
              </td>
              <td>
                {f.phaseLow}° → {f.phaseHigh}°
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Stability Step-by-Step Equations */}
      <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border-subtle)' }}>
        <h4 style={{ fontSize: '0.95rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem' }}>
          Step-by-Step Stability Derivation
        </h4>

        <div style={{ fontSize: '0.875rem', fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div>
            <strong>1. Gain Crossover Frequency (ω_gc):</strong>{' Frequency where $|H(j\\omega_{gc})| = 0 \\text{ dB} = 1.0$.'}
            {analysis.omega_gc !== null ? (
              <div style={{ margin: '0.25rem 0 0.5rem 1rem' }}>
                <MathView latex={`\\omega_{gc} = ${analysis.omega_gc.toFixed(3)} \\text{ rad/s}`} />
                <br />
                <MathView latex={`\\text{PM} = 180^\\circ + \\angle H(j\\omega_{gc}) = 180^\\circ + (${(analysis.phaseMargin! - 180).toFixed(1)}^\\circ) = \\mathbf{${analysis.phaseMargin!.toFixed(1)}^\\circ}`} />
              </div>
            ) : (
              <span style={{ color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>No 0 dB crossover detected within frequency range.</span>
            )}
          </div>

          <div>
            <strong>2. Phase Crossover Frequency (ω_pc):</strong>{' Frequency where $\\angle H(j\\omega_{pc}) = -180^\\circ$.'}
            {analysis.omega_pc !== null ? (
              <div style={{ margin: '0.25rem 0 0.5rem 1rem' }}>
                <MathView latex={`\\omega_{pc} = ${analysis.omega_pc.toFixed(3)} \\text{ rad/s}`} />
                <br />
                <MathView latex={`\\text{GM}_{\\text{dB}} = -20 \\log_{10} |H(j\\omega_{pc})| = \\mathbf{${analysis.gainMarginDb!.toFixed(2)} \\text{ dB}} \\quad (\\text{Linear GM} = ${analysis.gainMarginLinear?.toFixed(2)})`} />
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
