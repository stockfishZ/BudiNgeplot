import React from 'react';
import { Sliders, Code, List, Eye, CheckSquare } from 'lucide-react';

export interface Presets {
  name: string;
  num: number[];
  den: number[];
  expr: string;
}

export const HOMEWORK_PRESETS: Presets[] = [
  {
    name: '2nd-Order Underdamped (ζ = 0.4, ωₙ = 5)',
    num: [25],
    den: [1, 4, 25],
    expr: '25 / (s^2 + 4*s + 25)'
  },
  {
    name: 'Integrator + Lag-Lead Network',
    num: [10, 20],
    den: [1, 10, 0],
    expr: '10*(s + 2) / (s*(s + 10))'
  },
  {
    name: 'Non-Minimum Phase Zero (Right Half Plane Zero)',
    num: [-2, 2],
    den: [0.1, 1.1, 1],
    expr: '2*(1 - s) / ((s + 1)*(0.1*s + 1))'
  },
  {
    name: '3rd-Order System with Resonant Peak',
    num: [100],
    den: [1, 2, 50, 0],
    expr: '100 / (s*(s^2 + 2*s + 50))'
  },
  {
    name: 'High Gain Unstable Control System',
    num: [50],
    den: [1, 6, 11, 6],
    expr: '50 / (s^3 + 6*s^2 + 11*s + 6)'
  }
];

interface ControlPanelProps {
  numStr: string;
  denStr: string;
  exprStr: string;
  inputMode: 'poly' | 'expr';
  onNumChange: (val: string) => void;
  onDenChange: (val: string) => void;
  onExprChange: (val: string) => void;
  onInputModeChange: (mode: 'poly' | 'expr') => void;
  onSelectPreset: (preset: Presets) => void;
  omegaMinPower: number;
  omegaMaxPower: number;
  onOmegaMinChange: (val: number) => void;
  onOmegaMaxChange: (val: number) => void;
  showAsymptotic: boolean;
  showMargins: boolean;
  showGrid: boolean;
  showPoleZeroMap: boolean;
  onToggleAsymptotic: () => void;
  onToggleMargins: () => void;
  onToggleGrid: () => void;
  onTogglePoleZeroMap: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  numStr,
  denStr,
  exprStr,
  inputMode,
  onNumChange,
  onDenChange,
  onExprChange,
  onInputModeChange,
  onSelectPreset,
  omegaMinPower,
  omegaMaxPower,
  onOmegaMinChange,
  onOmegaMaxChange,
  showAsymptotic,
  showMargins,
  showGrid,
  showPoleZeroMap,
  onToggleAsymptotic,
  onToggleMargins,
  onToggleGrid,
  onTogglePoleZeroMap
}) => {
  return (
    <div className="card no-print">
      <div className="card-header">
        <h2 className="card-title">
          <Sliders size={18} />
          Transfer Function Controls
        </h2>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button
            className={`btn btn-sm ${inputMode === 'poly' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onInputModeChange('poly')}
          >
            Polynomial [Coeffs]
          </button>
          <button
            className={`btn btn-sm ${inputMode === 'expr' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onInputModeChange('expr')}
          >
            Expression [String]
          </button>
        </div>
      </div>

      {/* Preset Homework Dropdown */}
      <div className="form-group">
        <label className="form-label">
          <List size={14} />
          Homework Presets
        </label>
        <select
          className="select-input"
          onChange={(e) => {
            const idx = parseInt(e.target.value, 10);
            if (!isNaN(idx) && HOMEWORK_PRESETS[idx]) {
              onSelectPreset(HOMEWORK_PRESETS[idx]);
            }
          }}
          defaultValue=""
        >
          <option value="" disabled>-- Choose Homework Example --</option>
          {HOMEWORK_PRESETS.map((p, i) => (
            <option key={i} value={i}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Inputs */}
      {inputMode === 'poly' ? (
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
      ) : (
        <div className="form-group">
          <label className="form-label">
            Math Expression H(s)
          </label>
          <input
            type="text"
            className="input-text"
            value={exprStr}
            onChange={(e) => onExprChange(e.target.value)}
            placeholder="e.g. 10*(s+2) / (s*(s^2 + 4*s + 25))"
          />
          <small style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}>
            Use standard math operators <code className="mono-val">* / + - ^</code> with parameter <code className="mono-val">s</code>
          </small>
        </div>
      )}

      {/* Frequency Range Sliders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
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
      <div style={{
        marginTop: '0.75rem',
        paddingTop: '0.75rem',
        borderTop: '1px solid var(--color-border-subtle)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '0.5rem'
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
          <input
            type="checkbox"
            checked={showAsymptotic}
            onChange={onToggleAsymptotic}
            style={{ accentColor: 'var(--color-primary-dark)' }}
          />
          Asymptotic Line
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
