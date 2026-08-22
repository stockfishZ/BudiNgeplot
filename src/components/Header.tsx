import React from 'react';
import { Activity, BookOpen } from 'lucide-react';

interface HeaderProps {
  onOpenTutorial?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenTutorial }) => {
  return (
    <header style={{
      backgroundColor: 'var(--color-primary-dark)',
      color: 'var(--color-surface-white)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '1rem 1.5rem',
    }} className="no-print">
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            backgroundColor: 'var(--color-accent-gold-bright)',
            color: 'var(--color-primary-dark)',
            padding: '0.4rem 0.6rem',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Activity size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.4rem',
              color: 'var(--color-surface-white)',
              margin: 0,
              letterSpacing: '-0.01em'
            }}>
              BudiNgeplot
            </h1>
            <p style={{
              fontSize: '0.78rem',
              fontFamily: 'var(--font-sans)',
              color: 'var(--color-accent-gold-bright)',
              fontWeight: 500,
              margin: 0
            }}>
              Budi males bikin BodePlot sendiri
            </p>
          </div>
        </div>

        {onOpenTutorial && (
          <button
            onClick={onOpenTutorial}
            className="btn btn-gold"
            style={{
              fontSize: '0.825rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 0.9rem',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(255, 215, 0, 0.25)',
              cursor: 'pointer'
            }}
            title="Drawing Bode Plots Guide"
          >
            <BookOpen size={16} strokeWidth={2.3} />
            <span>Quick Tutor</span>
          </button>
        )}
      </div>
    </header>
  );
};
