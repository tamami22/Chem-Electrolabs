import MathFormula from './MathFormula.tsx';

interface FormattedTextProps {
  text: string;
  className?: string;
}

/**
 * Merender teks dengan formula matematika / kimia otomatis menggunakan KaTeX.
 * Mendukung teks dengan sintaks $...$ atau string persamaan LaTeX langsung.
 */
export default function FormattedText({ text, className = '' }: FormattedTextProps) {
  if (!text) return null;

  // Jika teks mengandung segmen LaTeX $...$
  if (text.includes('$')) {
    const parts = text.split('$');
    return (
      <span className={className}>
        {parts.map((part, index) =>
          index % 2 === 1 ? (
            <MathFormula key={index} formula={part} className="px-0.5" />
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </span>
    );
  }

  // Jika teks merupakan formula LaTeX murni (diawali \ atau mengandung \text{} / \rightarrow)
  if (text.startsWith('\\') || text.includes('\\text{') || text.includes('\\rightarrow')) {
    return <MathFormula formula={text} className={className} />;
  }

  return <span className={className}>{text}</span>;
}

