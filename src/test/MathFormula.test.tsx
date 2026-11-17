import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import MathFormula from '../components/ui/MathFormula.tsx';

describe('MathFormula Component Tests', () => {
  it('renders chemical half-reaction using KaTeX', () => {
    const { container } = render(
      <MathFormula formula="\text{Zn}^{2+}\text{(aq)} + 2e^- \rightarrow \text{Zn(s)}" />
    );
    expect(container.querySelector('.katex')).toBeInTheDocument();
    expect(container.querySelector('.katex-html')).toBeInTheDocument();
  });

  it('renders displayMode block with horizontal scrollable wrapper', () => {
    const { container } = render(
      <MathFormula formula="E^\circ_{\text{sel}} = E^\circ_{\text{katoda}} - E^\circ_{\text{anoda}}" displayMode />
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.tagName.toLowerCase()).toBe('div');
    expect(wrapper.className).toContain('overflow-x-auto');
    expect(container.querySelector('.katex-display')).toBeInTheDocument();
  });

  it('renders ionic formulas correctly (e.g. Zn^{2+} and SO_4^{2-})', () => {
    const { container } = render(<MathFormula formula="Zn^{2+}" />);
    expect(container.querySelector('.katex')).toBeInTheDocument();
  });

  it('handles empty formula gracefully without crashing', () => {
    const { container } = render(<MathFormula formula="" />);
    expect(container.firstChild).toBeNull();
  });

  it('handles malformed formula gracefully with throwOnError: false fallback', () => {
    const { container } = render(<MathFormula formula="\invalidMacro{test}" />);
    expect(container).toBeDefined();
  });
});

