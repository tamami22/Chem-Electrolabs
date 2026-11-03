import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface LatexTextProps {
  children?: React.ReactNode;
  text?: string;
  className?: string;
}

/**
 * Helper component untuk merender teks dengan formula LaTeX inline ($...$) atau block ($$...$$)
 * menggunakan react-katex.
 */
export const LatexText: React.FC<LatexTextProps> = ({ children, text, className = '' }) => {
  const content = typeof children === 'string' ? children : text || '';

  if (!content) return null;

  // Split by $$...$$ (block math) or $...$ (inline math)
  const regex = /(\$\$[\s\S]*?\$\$|\$[^$]+?\$)/g;
  const parts = content.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (!part) return null;

        if (part.startsWith('$$') && part.endsWith('$$') && part.length >= 4) {
          const math = part.slice(2, -2).trim();
          return (
            <span key={index} className="my-2 block text-center overflow-x-auto">
              <BlockMath math={math} errorColor="#ef4444" />
            </span>
          );
        }

        if (part.startsWith('$') && part.endsWith('$') && part.length >= 2) {
          const math = part.slice(1, -1).trim();
          return (
            <span key={index} className="inline-block px-0.5 align-baseline">
              <InlineMath math={math} errorColor="#ef4444" />
            </span>
          );
        }

        // Render plain text with line breaks preserved
        const lines = part.split('\n');
        return (
          <React.Fragment key={index}>
            {lines.map((line, lineIdx) => (
              <React.Fragment key={lineIdx}>
                {line}
                {lineIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </React.Fragment>
        );
      })}
    </span>
  );
};

export default LatexText;

