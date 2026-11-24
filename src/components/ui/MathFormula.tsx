import { useMemo } from 'react';
import katex from 'katex';

export interface MathFormulaProps {
  formula: string;
  displayMode?: boolean;
  className?: string;
  ariaLabel?: string;
}

export default function MathFormula({
  formula,
  displayMode = false,
  className = '',
  ariaLabel,
}: MathFormulaProps) {
  const html = useMemo(() => {
    if (!formula) return '';
    try {
      return katex.renderToString(formula, {
        displayMode,
        throwOnError: false,
      });
    } catch {
      return formula;
    }
  }, [formula, displayMode]);

  if (!formula) {
    return null;
  }

  if (displayMode) {
    return (
      <div
        className={`overflow-x-auto max-w-full py-1.5 my-1 text-slate-800 scrollbar-thin ${className}`}
        aria-label={ariaLabel || formula}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`inline-block overflow-x-auto max-w-full align-middle text-slate-800 scrollbar-thin ${className}`}
      aria-label={ariaLabel || formula}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

