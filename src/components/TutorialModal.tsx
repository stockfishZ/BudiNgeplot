import React, { useState, useEffect } from 'react';
import { MathView } from './MathView';
import { X, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'recipe' | 'factors' | 'example' | 'margins' | 'protips';

const TABS: { id: TabType; title: string }[] = [
  { id: 'recipe', title: '1. How to Draw' },
  { id: 'factors', title: '2. Factor Types' },
  { id: 'example', title: '3. Example Problem' },
  { id: 'margins', title: '4. Stability Margins' },
  { id: 'protips', title: '5. Common Mistakes' },
];

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('recipe');

  const currentIndex = TABS.findIndex((t) => t.id === activeTab);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && currentIndex < TABS.length - 1) {
        setActiveTab(TABS[currentIndex + 1].id);
      }
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setActiveTab(TABS[currentIndex - 1].id);
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, currentIndex]);

  if (!isOpen) return null;

  const goToPrev = () => {
    if (currentIndex > 0) setActiveTab(TABS[currentIndex - 1].id);
  };

  const goToNext = () => {
    if (currentIndex < TABS.length - 1) setActiveTab(TABS[currentIndex + 1].id);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 31, 63, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '1080px',
          height: '92vh',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          border: '1px solid #CBD5E1',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div
          style={{
            backgroundColor: 'var(--color-primary-dark)',
            color: '#FFFFFF',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            flexShrink: 0,
          }}
        >
          <div>
            <h2
              style={{
                color: '#FFFFFF',
                fontSize: '1.2rem',
                margin: 0,
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-0.01em',
              }}
            >
              Drawing Bode Plots
            </h2>
            <p
              style={{
                color: 'var(--color-accent-gold-bright)',
                fontSize: '0.78rem',
                margin: '0.15rem 0 0 0',
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
              }}
            >
              Adapted from Alexander &amp; Sadiku — Fundamentals of Electric Circuits (Chapter 14)
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              padding: '0.45rem',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Close (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {/* TABS NAVIGATION */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            overflowX: 'auto',
            padding: '0.5rem 1rem 0 1rem',
            gap: '0.5rem',
            flexShrink: 0,
          }}
        >
          {TABS.map((tab, idx) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem 1rem',
                  fontSize: '0.84rem',
                  fontWeight: isActive ? 700 : 500,
                  fontFamily: 'var(--font-sans)',
                  color: isActive ? 'var(--color-primary-dark)' : '#64748B',
                  backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                  borderTop: isActive ? '3px solid var(--color-accent-gold)' : '3px solid transparent',
                  borderLeft: isActive ? '1px solid #E2E8F0' : '1px solid transparent',
                  borderRight: isActive ? '1px solid #E2E8F0' : '1px solid transparent',
                  borderBottom: isActive ? '1px solid #FFFFFF' : '1px solid transparent',
                  borderTopLeftRadius: '4px',
                  borderTopRightRadius: '4px',
                  cursor: 'pointer',
                  marginBottom: '-1px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.12s ease',
                }}
              >
                <span
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: isActive ? 'var(--color-primary-dark)' : '#E2E8F0',
                    color: isActive ? '#FFFFFF' : '#475569',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {idx + 1}
                </span>
                <span>{tab.title}</span>
              </button>
            );
          })}
        </div>

        {/* CONTENT BODY */}
        <div
          style={{
            padding: '1.75rem 2rem',
            overflowY: 'auto',
            flex: 1,
            fontSize: '0.92rem',
            color: 'var(--color-text-dark)',
            lineHeight: 1.75,
          }}
        >
          {/* ========================================================================= */}
          {/* TAB 1: HOW TO DRAW */}
          {/* ========================================================================= */}
          {activeTab === 'recipe' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {/* Top intro */}
              <div
                style={{
                  padding: '1rem 1.25rem',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderLeft: '4px solid var(--color-primary-dark)',
                  borderRadius: '6px',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-primary-dark)', marginBottom: '0.35rem' }}>
                  What a Bode plot represents
                </div>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#334155' }}>
                  A Bode plot consists of two separate graphs plotted against frequency on a logarithmic scale (<MathView latex="\log_{10}\omega" />):
                  <br />
                  1. <strong>Magnitude in decibels:</strong> <MathView latex="|H(j\omega)|_{\text{dB}} = 20\log_{10}|H(j\omega)|" />
                  <br />
                  2. <strong>Phase in degrees:</strong> <MathView latex="\angle H(j\omega)" />
                </p>
              </div>

              {/* 4 Steps in 2-column grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.25rem' }}>
                {/* Step 1 */}
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '1.25rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: 'var(--color-primary-dark)' }}>
                    Step 1: Put H(s) in standard form
                  </h3>
                  <p style={{ margin: '0 0 0.65rem 0', color: '#475569', fontSize: '0.85rem' }}>
                    Factor out constant numbers from each term so that the constant part in every factor is <strong>1</strong>:
                  </p>
                  <div style={{ backgroundColor: '#F8FAFC', padding: '0.65rem', borderRadius: '4px', border: '1px solid #E2E8F0', textAlign: 'center', marginBottom: '0.65rem' }}>
                    <MathView
                      latex="H(j\omega) = \frac{{\color{#D97706}K_0} (j\omega)^{\pm N} \left(1 + j\frac{\omega}{{\color{#059669}z_1}}\right) \cdots}{\left(1 + j\frac{\omega}{{\color{#DC2626}p_1}}\right)\left[1 + j2\zeta\frac{\omega}{\omega_n} + \left(j\frac{\omega}{\omega_n}\right)^2\right]}"
                      displayMode={true}
                    />
                  </div>
                  <div style={{ backgroundColor: '#FEF3C7', padding: '0.5rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', color: '#92400E', border: '1px solid #FCD34D' }}>
                    <strong>Example:</strong> Convert <MathView latex="(s + 20)" /> into <MathView latex="20\left(1 + \frac{s}{20}\right)" />. Here <MathView latex="\omega_c = 20\text{ rad/s}" />, and 20 multiplies into <MathView latex="K_0" />.
                  </div>
                </div>

                {/* Step 2 */}
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '1.25rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: 'var(--color-primary-dark)' }}>
                    Step 2: List and sort corner frequencies
                  </h3>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#475569', fontSize: '0.85rem' }}>
                    Identify all corner frequencies (<MathView latex="\omega_c" />) from poles and zeros, then place them in order from lowest to highest along the frequency axis:
                  </p>
                  <ul style={{ paddingLeft: '1.2rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem' }}>
                    <li><strong>Zeros (<MathView latex="z_i" />):</strong> Bend magnitude <strong>up by +20 dB/decade</strong>.</li>
                    <li><strong>Poles (<MathView latex="p_k" />):</strong> Bend magnitude <strong>down by -20 dB/decade</strong>.</li>
                    <li><strong>Quadratic terms:</strong> Bend slope by <strong>±40 dB/decade</strong>.</li>
                  </ul>
                </div>

                {/* Step 3 */}
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '1.25rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: 'var(--color-primary-dark)' }}>
                    Step 3: Draw magnitude lines
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', color: '#334155', fontSize: '0.85rem' }}>
                    <div>
                      <strong>Low-frequency starting line:</strong>
                      <ul style={{ paddingLeft: '1.2rem', marginTop: '0.2rem' }}>
                        <li>No poles/zeros at origin (<MathView latex="s^0" />): Flat line at <MathView latex="20\log_{10}|K_0|\text{ dB}" />.</li>
                        <li>Pole at origin (<MathView latex="1/s" />): Slope of <MathView latex="-20\text{ dB/dec}" />, passing <MathView latex="20\log_{10}|K_0|" /> at <MathView latex="\omega = 1" />.</li>
                        <li>Zero at origin (<MathView latex="s" />): Slope of <MathView latex="+20\text{ dB/dec}" />, passing <MathView latex="20\log_{10}|K_0|" /> at <MathView latex="\omega = 1" />.</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Past each corner:</strong> Add <span style={{ color: '#059669', fontWeight: 600 }}>+20 dB/dec for a zero</span> or subtract <span style={{ color: '#DC2626', fontWeight: 600 }}>-20 dB/dec for a pole</span>.
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '1.25rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: 'var(--color-primary-dark)' }}>
                    Step 4: Draw phase lines
                  </h3>
                  <p style={{ margin: '0 0 0.4rem 0', color: '#475569', fontSize: '0.85rem' }}>
                    Phase changes occur over a 2-decade interval centered at each corner (<MathView latex="0.1\omega_c \to 10\omega_c" />):
                  </p>
                  <ul style={{ paddingLeft: '1.2rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
                    <li><strong>Base phase:</strong> <MathView latex="0^\circ" /> (<MathView latex="K_0 > 0" />) or <MathView latex="-180^\circ" /> (<MathView latex="K_0 < 0" />). Add <MathView latex="+90^\circ" /> per origin zero; subtract <MathView latex="-90^\circ" /> per origin pole.</li>
                    <li><strong>Simple zero (<MathView latex="z" />):</strong> Slopes up at <strong>+45°/dec</strong> from <MathView latex="0.1z" /> to <MathView latex="10z" /> (crosses <MathView latex="+45^\circ" /> at <MathView latex="z" />).</li>
                    <li><strong>Simple pole (<MathView latex="p" />):</strong> Slopes down at <strong>-45°/dec</strong> from <MathView latex="0.1p" /> to <MathView latex="10p" /> (crosses <MathView latex="-45^\circ" /> at <MathView latex="p" />).</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: FACTOR TYPES (CLEAN VISUAL DIAGRAMS FOR EACH FACTOR) */}
          {/* ========================================================================= */}
          {activeTab === 'factors' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem' }}>
                Every Bode plot is built from these basic behaviors. Here is what each factor looks like on graph paper:
              </p>

              {/* 6 Visual Factor Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1.25rem' }}>
                {/* 1. Constant Gain K */}
                <div style={{ border: '1px solid #CBD5E1', borderRadius: '6px', padding: '1rem', backgroundColor: '#FFFFFF' }}>
                  <div style={{ marginBottom: '0.4rem' }}>
                    <strong style={{ color: '#B45309', fontSize: '0.95rem' }}>1. Constant Gain (K)</strong>
                  </div>
                  <svg viewBox="0 0 280 95" style={{ width: '100%', height: 'auto', display: 'block', backgroundColor: '#FAFAFA', borderRadius: '4px', marginBottom: '0.6rem', border: '1px solid #E2E8F0' }}>
                    <line x1="20" y1="75" x2="260" y2="75" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="25" y="86" fill="#9CA3AF" fontSize="9" fontFamily="var(--font-mono)">0 dB baseline</text>
                    {/* Constant gain line */}
                    <line x1="20" y1="45" x2="260" y2="45" stroke="#D97706" strokeWidth="2.5" />
                    <text x="140" y="25" textAnchor="middle" fill="#B45309" fontSize="9.5" fontWeight="700" fontFamily="var(--font-mono)">20 log₁₀|K| dB (Flat)</text>
                  </svg>
                  <div style={{ fontSize: '0.825rem', color: '#334155' }}>
                    • Flat horizontal line across the entire frequency range.<br />
                    • Phase is <MathView latex="0^\circ" /> (if <MathView latex="K > 0" />) or <MathView latex="-180^\circ" /> (if <MathView latex="K < 0" />).
                  </div>
                </div>

                {/* 2. Zero at Origin s */}
                <div style={{ border: '1px solid #A7F3D0', borderRadius: '6px', padding: '1rem', backgroundColor: '#FFFFFF' }}>
                  <div style={{ marginBottom: '0.4rem' }}>
                    <strong style={{ color: '#059669', fontSize: '0.95rem' }}>2. Zero at Origin (s)</strong>
                  </div>
                  <svg viewBox="0 0 280 95" style={{ width: '100%', height: 'auto', display: 'block', backgroundColor: '#FAFAFA', borderRadius: '4px', marginBottom: '0.6rem', border: '1px solid #E2E8F0' }}>
                    <line x1="20" y1="50" x2="260" y2="50" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="140" y1="15" x2="140" y2="85" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3 3" />
                    {/* Slope line */}
                    <line x1="30" y1="80" x2="250" y2="20" stroke="#059669" strokeWidth="2.5" />
                    <circle cx="140" cy="50" r="3.5" fill="#059669" />
                    {/* Labels cleanly separated from lines */}
                    <text x="65" y="28" fill="#059669" fontSize="9.5" fontWeight="700" fontFamily="var(--font-mono)">+20 dB/dec ↗</text>
                    <text x="140" y="90" textAnchor="middle" fill="#6B7280" fontSize="9" fontFamily="var(--font-mono)">ω = 1 rad/s (0 dB)</text>
                  </svg>
                  <div style={{ fontSize: '0.825rem', color: '#334155' }}>
                    • Slopes upward right from the start (+20 dB/decade).<br />
                    • Always passes through 0 dB at <MathView latex="\omega = 1\text{ rad/s}" />. Phase is <MathView latex="+90^\circ" />.
                  </div>
                </div>

                {/* 3. Pole at Origin 1/s */}
                <div style={{ border: '1px solid #FECACA', borderRadius: '6px', padding: '1rem', backgroundColor: '#FFFFFF' }}>
                  <div style={{ marginBottom: '0.4rem' }}>
                    <strong style={{ color: '#DC2626', fontSize: '0.95rem' }}>3. Pole at Origin (1/s)</strong>
                  </div>
                  <svg viewBox="0 0 280 95" style={{ width: '100%', height: 'auto', display: 'block', backgroundColor: '#FAFAFA', borderRadius: '4px', marginBottom: '0.6rem', border: '1px solid #E2E8F0' }}>
                    <line x1="20" y1="50" x2="260" y2="50" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="140" y1="15" x2="140" y2="85" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3 3" />
                    {/* Slope line */}
                    <line x1="30" y1="20" x2="250" y2="80" stroke="#DC2626" strokeWidth="2.5" />
                    <circle cx="140" cy="50" r="3.5" fill="#DC2626" />
                    {/* Labels cleanly separated from lines */}
                    <text x="215" y="28" fill="#DC2626" fontSize="9.5" fontWeight="700" fontFamily="var(--font-mono)">-20 dB/dec ↘</text>
                    <text x="140" y="90" textAnchor="middle" fill="#6B7280" fontSize="9" fontFamily="var(--font-mono)">ω = 1 rad/s (0 dB)</text>
                  </svg>
                  <div style={{ fontSize: '0.825rem', color: '#334155' }}>
                    • Slopes downward right from the start (-20 dB/decade).<br />
                    • Always passes through 0 dB at <MathView latex="\omega = 1\text{ rad/s}" />. Phase is <MathView latex="-90^\circ" />.
                  </div>
                </div>

                {/* 4. Simple Zero (1 + s/z) */}
                <div style={{ border: '1px solid #CBD5E1', borderRadius: '6px', padding: '1rem', backgroundColor: '#FFFFFF' }}>
                  <div style={{ marginBottom: '0.4rem' }}>
                    <strong style={{ color: '#059669', fontSize: '0.95rem' }}>4. Simple Zero (1 + s/z)</strong>
                  </div>
                  <svg viewBox="0 0 280 95" style={{ width: '100%', height: 'auto', display: 'block', backgroundColor: '#FAFAFA', borderRadius: '4px', marginBottom: '0.6rem', border: '1px solid #E2E8F0' }}>
                    <line x1="20" y1="70" x2="260" y2="70" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="130" y1="10" x2="130" y2="80" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3" />
                    {/* Asymptote: 0 dB then +20 dB/dec */}
                    <path d="M 20 70 L 130 70 L 250 20" fill="none" stroke="#D97706" strokeWidth="2" strokeDasharray="4 3" />
                    {/* Exact curve */}
                    <path d="M 20 70 Q 110 68, 130 58 T 250 20" fill="none" stroke="#059669" strokeWidth="2.5" />
                    <circle cx="130" cy="58" r="3" fill="#059669" />
                    {/* Labels cleanly separated */}
                    <text x="65" y="28" fill="#D97706" fontSize="9.5" fontWeight="700" fontFamily="var(--font-mono)">+20 dB/dec ↗</text>
                    <text x="130" y="42" textAnchor="middle" fill="#059669" fontSize="9" fontWeight="700" fontFamily="var(--font-mono)">+3 dB</text>
                    <text x="130" y="90" textAnchor="middle" fill="#6B7280" fontSize="9" fontFamily="var(--font-mono)">ω = z</text>
                  </svg>
                  <div style={{ fontSize: '0.825rem', color: '#334155' }}>
                    • Flat at 0 dB before <MathView latex="\omega = z" />.<br />
                    • Bends <strong>UP</strong> by +20 dB/dec after <MathView latex="z" /> (exact curve is +3 dB higher at <MathView latex="z" />).
                  </div>
                </div>

                {/* 5. Simple Pole 1/(1 + s/p) */}
                <div style={{ border: '1px solid #CBD5E1', borderRadius: '6px', padding: '1rem', backgroundColor: '#FFFFFF' }}>
                  <div style={{ marginBottom: '0.4rem' }}>
                    <strong style={{ color: '#DC2626', fontSize: '0.95rem' }}>5. Simple Pole 1/(1 + s/p)</strong>
                  </div>
                  <svg viewBox="0 0 280 95" style={{ width: '100%', height: 'auto', display: 'block', backgroundColor: '#FAFAFA', borderRadius: '4px', marginBottom: '0.6rem', border: '1px solid #E2E8F0' }}>
                    <line x1="20" y1="25" x2="260" y2="25" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="130" y1="10" x2="130" y2="80" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3" />
                    {/* Asymptote: 0 dB then -20 dB/dec */}
                    <path d="M 20 25 L 130 25 L 250 75" fill="none" stroke="#D97706" strokeWidth="2" strokeDasharray="4 3" />
                    {/* Exact curve */}
                    <path d="M 20 25 Q 110 27, 130 37 T 250 75" fill="none" stroke="#DC2626" strokeWidth="2.5" />
                    <circle cx="130" cy="37" r="3" fill="#DC2626" />
                    {/* Labels cleanly separated */}
                    <text x="65" y="75" fill="#D97706" fontSize="9.5" fontWeight="700" fontFamily="var(--font-mono)">-20 dB/dec ↘</text>
                    <text x="130" y="54" textAnchor="middle" fill="#DC2626" fontSize="9" fontWeight="700" fontFamily="var(--font-mono)">-3 dB</text>
                    <text x="130" y="90" textAnchor="middle" fill="#6B7280" fontSize="9" fontFamily="var(--font-mono)">ω = p</text>
                  </svg>
                  <div style={{ fontSize: '0.825rem', color: '#334155' }}>
                    • Flat at 0 dB before <MathView latex="\omega = p" />.<br />
                    • Bends <strong>DOWN</strong> by -20 dB/dec after <MathView latex="p" /> (exact curve is -3 dB lower at <MathView latex="p" />).
                  </div>
                </div>

                {/* 6. Quadratic Pole */}
                <div style={{ border: '1px solid #CBD5E1', borderRadius: '6px', padding: '1rem', backgroundColor: '#FFFFFF' }}>
                  <div style={{ marginBottom: '0.4rem' }}>
                    <strong style={{ color: '#4F46E5', fontSize: '0.95rem' }}>6. Quadratic Pole (2nd-Order)</strong>
                  </div>
                  <svg viewBox="0 0 280 95" style={{ width: '100%', height: 'auto', display: 'block', backgroundColor: '#FAFAFA', borderRadius: '4px', marginBottom: '0.6rem', border: '1px solid #E2E8F0' }}>
                    <line x1="20" y1="30" x2="260" y2="30" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="120" y1="10" x2="120" y2="80" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3" />
                    {/* Asymptote: 0 dB then -40 dB/dec */}
                    <path d="M 20 30 L 120 30 L 250 85" fill="none" stroke="#D97706" strokeWidth="2" strokeDasharray="4 3" />
                    {/* Resonant bump exact curve */}
                    <path d="M 20 30 Q 100 28, 120 18 T 250 85" fill="none" stroke="#4F46E5" strokeWidth="2.5" />
                    {/* Labels cleanly separated */}
                    <text x="65" y="75" fill="#4F46E5" fontSize="9.5" fontWeight="700" fontFamily="var(--font-mono)">-40 dB/dec ↘</text>
                    <text x="120" y="90" textAnchor="middle" fill="#6B7280" fontSize="9" fontFamily="var(--font-mono)">ω = ωn</text>
                  </svg>
                  <div style={{ fontSize: '0.825rem', color: '#334155' }}>
                    • Flat at 0 dB until natural frequency <MathView latex="\omega_n" />.<br />
                    • Drops with <strong>DOUBLE slope (-40 dB/dec)</strong> after <MathView latex="\omega_n" />.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: EXAMPLE PROBLEM */}
          {/* ========================================================================= */}
          {activeTab === 'example' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Problem Definition */}
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '1.25rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--color-primary-dark)', fontSize: '1rem', marginBottom: '0.4rem' }}>
                  Sadiku Example 14.3
                </div>
                <p style={{ margin: '0 0 0.5rem 0', color: '#475569' }}>
                  Draw the Bode plots for the transfer function:
                </p>
                <div style={{ backgroundColor: '#FFFFFF', padding: '0.85rem', borderRadius: '4px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                  <MathView
                    latex="H(s) = \frac{{\color{#D97706}200}{\color{#059669}s}}{{\color{#DC2626}(s + 2)(s + 10)}}"
                    displayMode={true}
                  />
                </div>
              </div>

              {/* Step 1 in Example */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '1.25rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: 'var(--color-primary-dark)' }}>
                  1. Factoring into standard form
                </h4>
                <div style={{ backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '4px', textAlign: 'center', marginBottom: '0.6rem' }}>
                  <MathView
                    latex="H(j\omega) = \frac{200(j\omega)}{{\color{#DC2626}2}\left(1 + j\frac{\omega}{{\color{#DC2626}2}}\right) \cdot {\color{#DC2626}10}\left(1 + j\frac{\omega}{{\color{#DC2626}10}}\right)} = \frac{{\color{#D97706}10}(j\omega)}{\left(1 + j\frac{\omega}{{\color{#DC2626}2}}\right)\left(1 + j\frac{\omega}{{\color{#DC2626}10}}\right)}"
                    displayMode={true}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                  <span style={{ backgroundColor: '#FEF3C7', padding: '0.25rem 0.6rem', borderRadius: '4px', color: '#92400E' }}>
                    Gain: <MathView latex="K_0 = 10 \implies 20\log_{10}(10) = 20\text{ dB}" />
                  </span>
                  <span style={{ backgroundColor: '#DCFCE7', padding: '0.25rem 0.6rem', borderRadius: '4px', color: '#166534' }}>
                    Zero at origin: <MathView latex="j\omega" /> (+20 dB/dec)
                  </span>
                  <span style={{ backgroundColor: '#FEE2E2', padding: '0.25rem 0.6rem', borderRadius: '4px', color: '#991B1B' }}>
                    Poles: <MathView latex="\omega_{c1} = 2\text{ rad/s}" />, <MathView latex="\omega_{c2} = 10\text{ rad/s}" />
                  </span>
                </div>
              </div>

              {/* Graphic for Example 14.3 */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '1.25rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--color-primary-dark)', fontSize: '0.95rem', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Bode Magnitude Response for Example 14.3</span>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}>
                    Dashed = Asymptote | Solid = Exact Response
                  </span>
                </div>

                {/* SVG with wide non-intersecting layout */}
                <svg viewBox="0 0 740 260" style={{ width: '100%', height: 'auto', display: 'block', backgroundColor: '#FAFAFA', borderRadius: '4px', border: '1px solid #E5E7EB' }}>
                  {/* Grid Lines */}
                  <line x1="80" y1="40" x2="680" y2="40" stroke="#E5E7EB" strokeWidth="1" />
                  <line x1="80" y1="90" x2="680" y2="90" stroke="#E5E7EB" strokeWidth="1" />
                  <line x1="80" y1="140" x2="680" y2="140" stroke="#E5E7EB" strokeWidth="1" />
                  <line x1="80" y1="190" x2="680" y2="190" stroke="#E5E7EB" strokeWidth="1" />

                  {/* Decade Frequency Vertical Grid */}
                  <line x1="130" y1="25" x2="130" y2="205" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="310" y1="25" x2="310" y2="205" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="490" y1="25" x2="490" y2="205" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="640" y1="25" x2="640" y2="205" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3 3" />

                  {/* Frequency Labels */}
                  <text x="130" y="225" textAnchor="middle" fill="#4B5563" fontSize="11" fontFamily="var(--font-mono)">0.1</text>
                  <text x="310" y="225" textAnchor="middle" fill="#4B5563" fontSize="11" fontFamily="var(--font-mono)">1.0</text>
                  <text x="490" y="225" textAnchor="middle" fill="#4B5563" fontSize="11" fontFamily="var(--font-mono)">10</text>
                  <text x="640" y="225" textAnchor="middle" fill="#4B5563" fontSize="11" fontFamily="var(--font-mono)">100 rad/s</text>

                  {/* Magnitude Y Labels with ample spacing from the left */}
                  <text x="68" y="44" textAnchor="end" fill="#4B5563" fontSize="10.5" fontFamily="var(--font-mono)">+30 dB</text>
                  <text x="68" y="94" textAnchor="end" fill="#4B5563" fontSize="10.5" fontFamily="var(--font-mono)">+20 dB</text>
                  <text x="68" y="144" textAnchor="end" fill="#4B5563" fontSize="10.5" fontFamily="var(--font-mono)">+10 dB</text>
                  <text x="68" y="194" textAnchor="end" fill="#4B5563" fontSize="10.5" fontFamily="var(--font-mono)">0 dB</text>

                  {/* Corner Frequency 1: wc1 = 2 rad/s */}
                  <line x1="364" y1="25" x2="364" y2="205" stroke="#D97706" strokeWidth="1.2" strokeDasharray="2 2" />
                  <rect x="338" y="10" width="52" height="18" rx="3" fill="#FEF3C7" stroke="#FCD34D" />
                  <text x="364" y="23" textAnchor="middle" fill="#B45309" fontSize="9.5" fontWeight="700" fontFamily="var(--font-mono)">wc=2</text>

                  {/* Corner Frequency 2: wc2 = 10 rad/s */}
                  <line x1="490" y1="25" x2="490" y2="205" stroke="#D97706" strokeWidth="1.2" strokeDasharray="2 2" />
                  <rect x="464" y="10" width="52" height="18" rx="3" fill="#FEF3C7" stroke="#FCD34D" />
                  <text x="490" y="23" textAnchor="middle" fill="#B45309" fontSize="9.5" fontWeight="700" fontFamily="var(--font-mono)">wc=10</text>

                  {/* Magnitude Asymptote Line */}
                  <path d="M 130 190 L 310 90 L 364 60 L 490 60 L 640 160" fill="none" stroke="#D97706" strokeWidth="2.2" strokeDasharray="5 3" />

                  {/* Exact Response Curve */}
                  <path d="M 130 190 Q 290 95, 364 69 T 490 69 T 640 160" fill="none" stroke="#001F3F" strokeWidth="3" />

                  {/* Slope text annotations placed away from the curves */}
                  <text x="210" y="130" fill="#059669" fontSize="10.5" fontWeight="700" fontFamily="var(--font-mono)">+20 dB/dec ↗</text>
                  <text x="427" y="48" textAnchor="middle" fill="#D97706" fontSize="10.5" fontWeight="700" fontFamily="var(--font-mono)">0 dB/dec (26 dB)</text>
                  <text x="575" y="100" fill="#DC2626" fontSize="10.5" fontWeight="700" fontFamily="var(--font-mono)">-20 dB/dec ↘</text>
                </svg>
              </div>

              {/* Table of Regions */}
              <div style={{ overflowX: 'auto' }}>
                <table className="hw-table" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th>Region</th>
                      <th>Frequency Range</th>
                      <th>Active Slopes</th>
                      <th>Magnitude Values</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong style={{ color: '#059669' }}>Region 1</strong></td>
                      <td><MathView latex="\omega < 2\text{ rad/s}" /></td>
                      <td><strong style={{ color: '#059669' }}>+20 dB/dec</strong> (zero at origin)</td>
                      <td>At <MathView latex="\omega=1" />: <strong>20 dB</strong> | At <MathView latex="\omega=2" />: <strong>26 dB</strong></td>
                    </tr>
                    <tr>
                      <td><strong style={{ color: '#D97706' }}>Region 2</strong></td>
                      <td><MathView latex="2 \le \omega < 10\text{ rad/s}" /></td>
                      <td><strong>0 dB/dec</strong> (+20 zero - 20 pole)</td>
                      <td>Flat plateau at <strong>26 dB</strong></td>
                    </tr>
                    <tr>
                      <td><strong style={{ color: '#DC2626' }}>Region 3</strong></td>
                      <td><MathView latex="\omega \ge 10\text{ rad/s}" /></td>
                      <td><strong style={{ color: '#DC2626' }}>-20 dB/dec</strong> (second pole subtracts 20)</td>
                      <td>At <MathView latex="\omega=10" />: <strong>26 dB</strong> | At <MathView latex="\omega=100" />: <strong>6 dB</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: STABILITY MARGINS */}
          {/* ========================================================================= */}
          {activeTab === 'margins' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div
                style={{
                  padding: '1rem 1.25rem',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderLeft: '4px solid var(--color-primary-dark)',
                  borderRadius: '6px',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-primary-dark)', marginBottom: '0.35rem' }}>
                  Stability in feedback systems
                </div>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#334155' }}>
                  If a closed-loop system produces a gain of <strong>1 (0 dB)</strong> when the signal phase reaches <strong>-180°</strong>, negative feedback turns into positive feedback, causing instability. Gain Margin (GM) and Phase Margin (PM) quantify the safety margin against oscillation.
                </p>
              </div>

              {/* Graphic */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '1.25rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--color-primary-dark)', fontSize: '0.92rem', marginBottom: '0.75rem' }}>
                  Locating Gain Margin and Phase Margin on a Bode Plot
                </div>

                <svg viewBox="0 0 720 220" style={{ width: '100%', height: 'auto', display: 'block', backgroundColor: '#FAFAFA', borderRadius: '4px' }}>
                  {/* Top: Magnitude area */}
                  <rect x="80" y="20" width="580" height="75" fill="#FFFFFF" stroke="#E2E8F0" />
                  <line x1="80" y1="58" x2="660" y2="58" stroke="#9CA3AF" strokeWidth="1" strokeDasharray="3 3" />
                  <text x="70" y="61" textAnchor="end" fill="#001F3F" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)">0 dB</text>

                  {/* Bottom: Phase area */}
                  <rect x="80" y="115" width="580" height="75" fill="#FFFFFF" stroke="#E2E8F0" />
                  <line x1="80" y1="152" x2="660" y2="152" stroke="#9CA3AF" strokeWidth="1" strokeDasharray="3 3" />
                  <text x="70" y="155" textAnchor="end" fill="#001F3F" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)">-180°</text>

                  {/* Magnitude curve */}
                  <path d="M 110 32 Q 320 48, 400 58 T 620 90" fill="none" stroke="#001F3F" strokeWidth="2.5" />

                  {/* Phase curve */}
                  <path d="M 110 125 Q 360 135, 500 152 T 620 182" fill="none" stroke="#001F3F" strokeWidth="2.5" />

                  {/* wgc at x=400 where Mag = 0 dB */}
                  <line x1="400" y1="58" x2="400" y2="140" stroke="#D4AF37" strokeWidth="1.8" strokeDasharray="3 3" />
                  <circle cx="400" cy="58" r="4.5" fill="#D4AF37" stroke="#001F3F" strokeWidth="1.5" />
                  <circle cx="400" cy="140" r="4.5" fill="#D4AF37" stroke="#001F3F" strokeWidth="1.5" />
                  {/* PM vertical line */}
                  <line x1="400" y1="152" x2="400" y2="140" stroke="#D4AF37" strokeWidth="3" />
                  <rect x="412" y="132" width="70" height="18" rx="3" fill="#001F3F" />
                  <text x="447" y="145" textAnchor="middle" fill="#FFD700" fontSize="9.5" fontWeight="700" fontFamily="var(--font-mono)">PM &gt; 0°</text>
                  <text x="400" y="204" textAnchor="middle" fill="#D4AF37" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)">ωgc</text>

                  {/* wpc at x=500 where Phase = -180 */}
                  <line x1="500" y1="78" x2="500" y2="152" stroke="#2ECC40" strokeWidth="1.8" strokeDasharray="3 3" />
                  <circle cx="500" cy="152" r="4.5" fill="#2ECC40" stroke="#001F3F" strokeWidth="1.5" />
                  <circle cx="500" cy="78" r="4.5" fill="#2ECC40" stroke="#001F3F" strokeWidth="1.5" />
                  {/* GM vertical line */}
                  <line x1="500" y1="58" x2="500" y2="78" stroke="#2ECC40" strokeWidth="3" />
                  <rect x="512" y="62" width="70" height="18" rx="3" fill="#001F3F" />
                  <text x="547" y="75" textAnchor="middle" fill="#2ECC40" fontSize="9.5" fontWeight="700" fontFamily="var(--font-mono)">GM &gt; 0 dB</text>
                  <text x="500" y="204" textAnchor="middle" fill="#2ECC40" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)">ωpc</text>
                </svg>
              </div>

              {/* Two cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div style={{ border: '1px solid #FCD34D', backgroundColor: '#FEF3C7', padding: '1.1rem', borderRadius: '6px' }}>
                  <strong style={{ color: '#92400E', fontSize: '0.95rem' }}>Phase Margin (PM)</strong>
                  <p style={{ margin: '0.35rem 0', fontSize: '0.85rem', color: '#78350F' }}>
                    1. Find frequency <MathView latex="\omega_{gc}" /> where magnitude is <strong>0 dB</strong>.<br />
                    2. Calculate degrees above -180°:
                  </p>
                  <div style={{ backgroundColor: '#FFFFFF', padding: '0.5rem', borderRadius: '4px', textAlign: 'center', fontWeight: 700 }}>
                    <MathView latex="\text{PM} = 180^\circ + \angle H(j\omega_{gc})" />
                  </div>
                </div>

                <div style={{ border: '1px solid #A7F3D0', backgroundColor: '#ECFDF5', padding: '1.1rem', borderRadius: '6px' }}>
                  <strong style={{ color: '#065F46', fontSize: '0.95rem' }}>Gain Margin (GM)</strong>
                  <p style={{ margin: '0.35rem 0', fontSize: '0.85rem', color: '#064E3B' }}>
                    1. Find frequency <MathView latex="\omega_{pc}" /> where phase crosses <strong>-180°</strong>.<br />
                    2. Calculate dB below 0 dB:
                  </p>
                  <div style={{ backgroundColor: '#FFFFFF', padding: '0.5rem', borderRadius: '4px', textAlign: 'center', fontWeight: 700 }}>
                    <MathView latex="\text{GM} = -20\log_{10}|H(j\omega_{pc})|\text{ dB}" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: COMMON MISTAKES */}
          {/* ========================================================================= */}
          {activeTab === 'protips' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '1.25rem' }}>
                <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.98rem', color: 'var(--color-primary-dark)' }}>
                  1. Reading the gain constant before factoring
                </h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#334155' }}>
                  In <MathView latex="H(s) = \frac{100}{s + 50}" />, the low-frequency gain is not 100.
                  <br />
                  Factor the denominator first: <MathView latex="H(s) = \frac{100}{50\left(1 + \frac{s}{50}\right)} = \frac{2}{1 + \frac{s}{50}}" />.
                  The true constant gain is <MathView latex="K_0 = 2 \implies 20\log_{10}(2) \approx 6.02\text{ dB}" />.
                </p>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '1.25rem' }}>
                <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.98rem', color: 'var(--color-primary-dark)' }}>
                  2. Final high-frequency slope calculation
                </h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#334155' }}>
                  The high-frequency slope always equals:
                  <br />
                  <strong style={{ color: 'var(--color-primary-dark)' }}>
                    Final Slope = <MathView latex="20 \times (m - n)\text{ dB/decade}" />
                  </strong> (where <MathView latex="m" /> = number of zeros, <MathView latex="n" /> = number of poles).
                  <br />
                  For example, 1 zero and 2 poles gives <MathView latex="20 \times (1 - 2) = -20\text{ dB/decade}" />.
                </p>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '1.25rem' }}>
                <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.98rem', color: 'var(--color-primary-dark)' }}>
                  3. 3 dB deviation at corner frequencies
                </h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#334155' }}>
                  Asymptotic lines are straight approximations. At the exact corner frequency <MathView latex="\omega_c" />:
                  <br />• A simple zero is <strong>3 dB higher</strong> than the asymptote intersection.
                  <br />• A simple pole is <strong>3 dB lower</strong> than the asymptote intersection.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
            padding: '0.85rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <button
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className="btn btn-secondary btn-sm"
            style={{
              opacity: currentIndex === 0 ? 0.35 : 1,
              cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <ChevronLeft size={16} /> Previous
          </button>

          <span style={{ fontSize: '0.82rem', color: '#64748B', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
            {currentIndex + 1} of {TABS.length}: {TABS[currentIndex].title}
          </span>

          {currentIndex < TABS.length - 1 ? (
            <button
              onClick={goToNext}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="btn btn-gold btn-sm"
              style={{ fontWeight: 700 }}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
