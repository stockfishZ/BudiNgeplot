import React, { useEffect, useRef } from 'react';
import katex from 'katex';

interface MathViewProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
}

export const MathView: React.FC<MathViewProps> = ({ latex, displayMode = false, className = '' }) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(latex, containerRef.current, {
          displayMode,
          throwOnError: false,
        });
      } catch (err) {
        if (containerRef.current) {
          containerRef.current.innerText = latex;
        }
      }
    }
  }, [latex, displayMode]);

  return (
    <span
      ref={containerRef}
      className={`math-view ${className}`}
      style={{
        display: displayMode ? 'block' : 'inline-block',
        verticalAlign: displayMode ? 'unset' : 'middle',
        maxWidth: '100%',
        overflowX: 'auto',
        overflowY: 'hidden',
        WebkitOverflowScrolling: 'touch',
      }}
    />
  );
};
