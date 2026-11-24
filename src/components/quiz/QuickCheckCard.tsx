import { useState, useMemo } from 'react';
import type { QuickCheck } from '../../content/types.ts';
import { prepareShuffledQuestion, isAnswerCorrect } from './quizUtils.ts';
import FormattedText from '../ui/FormattedText.tsx';
import { CheckCircle2, XCircle, HelpCircle, RotateCcw, ArrowRight } from 'lucide-react';

export interface QuickCheckCardProps {
  quickCheck: QuickCheck;
  onAnswerChecked?: (isCorrect: boolean) => void;
  className?: string;
}

export default function QuickCheckCard({
  quickCheck,
  onAnswerChecked,
  className = '',
}: QuickCheckCardProps) {
  const [selectedShuffledIndex, setSelectedShuffledIndex] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  // Ambil kunci jawaban yang seragam
  const rawCorrectAnswer = quickCheck.correctAnswer ?? quickCheck.correctIndex ?? 0;

  // Acak urutan opsi hanya saat komponen diinisialisasi atau saat di-reset
  const { shuffledOptions, newCorrectAnswer } = useMemo(() => {
    return prepareShuffledQuestion(quickCheck.options, rawCorrectAnswer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickCheck, attemptCount]);

  const isCorrect = isChecked && isAnswerCorrect(selectedShuffledIndex, newCorrectAnswer);

  const handleSelect = (index: number) => {
    if (isChecked) return;
    setSelectedShuffledIndex(index);
  };

  const handleCheck = () => {
    if (selectedShuffledIndex === null) return;
    setIsChecked(true);
    const correct = isAnswerCorrect(selectedShuffledIndex, newCorrectAnswer);
    if (onAnswerChecked) {
      onAnswerChecked(correct);
    }
  };

  const handleRetry = () => {
    setSelectedShuffledIndex(null);
    setIsChecked(false);
    setAttemptCount((prev) => prev + 1);
  };

  const optionLetters = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div
      className={`bg-white border-2 border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 ${className}`}
      aria-labelledby="quick-check-heading"
    >
      {/* Header Quick Check */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
            <HelpCircle className="w-4 h-4" />
          </div>
          <h2 id="quick-check-heading" className="text-sm font-bold text-slate-900">
            Cek Pemahaman Cepat (Quick Check)
          </h2>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
          Formatif Mandiri
        </span>
      </div>

      {/* Pertanyaan */}
      <div className="text-sm font-medium text-slate-900 leading-relaxed">
        <FormattedText text={quickCheck.question} />
      </div>

      {/* Daftar Opsi Pilihan Ganda (Accessible Radio Group) */}
      <div
        role="radiogroup"
        aria-label="Pilihan jawaban"
        className="space-y-2.5"
      >
        {shuffledOptions.map((option, index) => {
          const letter = optionLetters[index] || `${index + 1}`;
          const isSelected = selectedShuffledIndex === index;
          const isThisCorrect = newCorrectAnswer === index;

          let optionStyle = 'border-slate-200 hover:border-sky-300 hover:bg-slate-50/80 text-slate-800';
          let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';

          if (isSelected && !isChecked) {
            optionStyle = 'border-sky-500 bg-sky-50/60 text-sky-950 ring-2 ring-sky-200';
            badgeStyle = 'bg-sky-600 text-white border-sky-600';
          } else if (isChecked) {
            if (isThisCorrect) {
              optionStyle = 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-medium ring-2 ring-emerald-200';
              badgeStyle = 'bg-emerald-600 text-white border-emerald-600';
            } else if (isSelected && !isThisCorrect) {
              optionStyle = 'border-rose-400 bg-rose-50/70 text-rose-950 ring-2 ring-rose-200';
              badgeStyle = 'bg-rose-600 text-white border-rose-600';
            } else {
              optionStyle = 'opacity-50 border-slate-200 bg-white text-slate-500';
            }
          }

          return (
            <button
              key={index}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={isChecked}
              onClick={() => handleSelect(index)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  handleSelect(index);
                }
              }}
              className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all min-h-[44px] cursor-pointer focus-visible:outline-2 focus-visible:outline-sky-500 ${optionStyle}`}
            >
              {/* Huruf Opsi (A, B, C, D) */}
              <span
                className={`w-6 h-6 rounded-lg text-xs font-bold border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${badgeStyle}`}
              >
                {letter}
              </span>

              {/* Teks Pilihan */}
              <div className="flex-1 leading-relaxed pt-0.5">
                <FormattedText text={option} />
              </div>

              {/* Ikon Status Saat Sudah Diperiksa */}
              {isChecked && isThisCorrect && (
                <div className="flex items-center gap-1 text-emerald-700 font-bold text-xs shrink-0 self-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">Kunci Benar</span>
                </div>
              )}
              {isChecked && isSelected && !isThisCorrect && (
                <div className="flex items-center gap-1 text-rose-700 font-bold text-xs shrink-0 self-center">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span className="hidden sm:inline">Pilihan Anda</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Tombol Aksi (Periksa / Coba Lagi) */}
      {!isChecked ? (
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            disabled={selectedShuffledIndex === null}
            onClick={handleCheck}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
              selectedShuffledIndex !== null
                ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-xs cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Periksa Jawaban</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-3 pt-2">
          {/* Banner Umpan Balik Konseptual */}
          <div
            className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed ${
              isCorrect
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-rose-50 border-rose-300 text-rose-950'
            }`}
          >
            <div className="flex items-center gap-2 font-bold mb-1">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-emerald-800">Luar Biasa, Pemahaman Anda Tepat!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span className="text-rose-800">Jawaban Kurang Tepat, Perhatikan Konsep Berikut:</span>
                </>
              )}
            </div>
            <div className="text-slate-700 pl-7 text-xs leading-relaxed pt-1">
              <FormattedText text={quickCheck.explanation} />
            </div>
          </div>

          {/* Tombol Ulangi Jika Salah */}
          {!isCorrect && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors min-h-[44px] cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Coba Jawab Lagi</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

