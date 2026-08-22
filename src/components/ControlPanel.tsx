import React from 'react';
import { Sliders, Code, List, Eye, CheckSquare, AlertTriangle } from 'lucide-react';

interface ControlPanelProps {
  numStr: string;
  denStr: string;
  exprStr: string;
  zpkGainStr: string;
  zpkZerosStr: string;
  zpkPolesStr: string;
  inputMode: 'poly' | 'expr' | 'zpk';
  exprError?: string | null;
  onNumChange: (val: string) => void;
  onDenChange: (val: string) => void;
  onExprChange: (val: string) => void;
  onZpkGainChange: (val: string) => void;
  onZpkZerosChange: (val: string) => void;
  onZpkPolesChange: (val: string) => void;
  onInputModeChange: (mode: 'poly' | 'expr' | 'zpk') => void;
  omegaMinPower: number;
  omegaMaxPower: number;
  onOmegaMinChange: (val: number) => void;
  onOmegaMaxChange: (val: number) => void;
  showAsymptotic: boolean;
  showFactorBreakdown: boolean;
  showMargins: boolean;
  showGrid: boolean;
  showPoleZeroMap: boolean;
  onToggleAsymptotic: () => void;
  onToggleFactorBreakdown: () => void;
  onToggleMargins: () => void;
  onToggleGrid: () => void;
  onTogglePoleZeroMap: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  numStr,
  denStr,
  exprStr,
  zpkGainStr,
  zpkZerosStr,
  zpkPolesStr,
  inputMode,
  exprError,
  onNumChange,
  onDenChange,
  onExprChange,
  onZpkGainChange,
  onZpkZerosChange,
  onZpkPolesChange,
  onInputModeChange,
  omegaMinPower,
  omegaMaxPower,
  onOmegaMinChange,
  onOmegaMaxChange,
  showAsymptotic,
  showFactorBreakdown,
  showMargins,
  showGrid,
  showPoleZeroMap,
  onToggleAsymptotic,
  onToggleFactorBreakdown,
  onToggleMargins,
  onToggleGrid,
  onTogglePoleZeroMap
}) => {
  return (
    <div className="card no-print">
      <div className="card-header">
        <h2 className="card-title">
          <Sliders size={18} />
          Transfer Function
        </h2>
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${inputMode === 'expr' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onInputModeChange('expr')}
          >
            Expression
          </button>
          <button
            className={`btn btn-sm ${inputMode === 'poly' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onInputModeChange('poly')}
          >
            Polynomial
          </button>
          <button
            className={`btn btn-sm ${inputMode === 'zpk' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onInputModeChange('zpk')}
          >
            Zero Pole
          </button>
        </div>
      </div>

      {/* Inputs */}
      {inputMode === 'poly' && (
        <>
          <div className="form-group">
            <label className="form-label">
              Numerator Polynomial Coefficients <span className="mono-val">[b_m, ..., b_0]</span>
            </label>
            <input
              type="text"
              className="input-text"
              value={numStr}
              onChange={(e) => onNumChange(e.target.value)}
              placeholder="e.g. 10, 20"
            />
            <small style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}>
              Enter space or comma separated numbers from highest degree to constant
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">
              Denominator Polynomial Coefficients <span className="mono-val">[a_n, ..., a_0]</span>
            </label>
            <input
              type="text"
              className="input-text"
              value={denStr}
              onChange={(e) => onDenChange(e.target.value)}
              placeholder="e.g. 1, 4, 25"
            />
            <small style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}>
              Enter space or comma separated numbers (e.g., <code className="mono-val">1 4 25</code> for s² + 4s + 25)
            </small>
          </div>
        </>
      )}

      {inputMode === 'expr' && (
        <div className="form-group">
          <label className="form-label">
            Express H(s)
          </label>
          <input
            type="text"
            className="input-text"
            style={{
              borderColor: exprError ? '#DC2626' : undefined,
              backgroundColor: exprError ? '#FEF2F2' : undefined
            }}
            value={exprStr}
            onChange={(e) => onExprChange(e.target.value)}
            placeholder="e.g. 10*(s+2) / (s*(s^2 + 4*s + 25))"
          />
          {exprError ? (
            <div style={{
              marginTop: '0.35rem',
              padding: '0.35rem 0.6rem',
              backgroundColor: '#FEF3C7',
              color: '#B45309',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              border: '1px solid #FCD34D'
            }}>
              <AlertTriangle size={14} style={{ flexShrink: 0 }} />
              <span>Incomplete / Invalid Expression: {exprError} (holding at last valid plot)</span>
            </div>
          ) : (
            <small style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}>
              Use standard math operators <code className="mono-val">* / + - ^</code> with parameter <code className="mono-val">s</code>
            </small>
          )}
        </div>
      )}

      {inputMode === 'zpk' && (
        <div className="zpk-grid">
          <div className="form-group">
            <label className="form-label">Gain (K)</label>
            <input
              type="text"
              className="input-text"
              value={zpkGainStr}
              onChange={(e) => onZpkGainChange(e.target.value)}
              placeholder="e.g. 10"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Zeros (z_i)</label>
            <input
              type="text"
              className="input-text"
              value={zpkZerosStr}
              onChange={(e) => onZpkZerosChange(e.target.value)}
              placeholder="e.g. -2, 3"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Poles (p_j)</label>
            <input
              type="text"
              className="input-text"
              value={zpkPolesStr}
              onChange={(e) => onZpkPolesChange(e.target.value)}
              placeholder="e.g. 0, -10"
            />
          </div>
        </div>
      )}

      {/* Frequency Range Sliders */}
      <div className="sliders-grid">
        <div className="form-group">
          <label className="form-label">
            Frequency Range Min: <span className="mono-val">10^{omegaMinPower} rad/s</span>
          </label>
          <input
            type="range"
            min="-3"
            max="1"
            step="1"
            value={omegaMinPower}
            onChange={(e) => onOmegaMinChange(parseInt(e.target.value, 10))}
            style={{ accentColor: 'var(--color-primary-dark)', cursor: 'pointer' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Frequency Range Max: <span className="mono-val">10^{omegaMaxPower} rad/s</span>
          </label>
          <input
            type="range"
            min="2"
            max="6"
            step="1"
            value={omegaMaxPower}
            onChange={(e) => onOmegaMaxChange(parseInt(e.target.value, 10))}
            style={{ accentColor: 'var(--color-primary-dark)', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="toggles-grid">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
          <input
            type="checkbox"
            checked={showAsymptotic}
            onChange={onToggleAsymptotic}
            style={{ accentColor: 'var(--color-primary-dark)' }}
          />
          Total Asymptote
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
          <input
            type="checkbox"
            checked={showFactorBreakdown}
            onChange={onToggleFactorBreakdown}
            style={{ accentColor: 'var(--color-primary-dark)' }}
          />
          Individual Factor Lines
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
          <input
            type="checkbox"
            checked={showMargins}
            onChange={onToggleMargins}
            style={{ accentColor: 'var(--color-primary-dark)' }}
          />
          GM & PM Margins
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
          <input
            type="checkbox"
            checked={showGrid}
            onChange={onToggleGrid}
            style={{ accentColor: 'var(--color-primary-dark)' }}
          />
          Log Grid Lines
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
          <input
            type="checkbox"
            checked={showPoleZeroMap}
            onChange={onTogglePoleZeroMap}
            style={{ accentColor: 'var(--color-primary-dark)' }}
          />
          Pole-Zero S-Map
        </label>
      </div>
    </div>
  );
};
