import React, { useState, useMemo } from 'react';
import { QuizQuestion, QuizzesJSON } from '../types/content';
import quizzesDataRaw from '../content/quizzes.json';
import { LatexText } from './LatexText';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';

const quizzesData = quizzesDataRaw as unknown as QuizzesJSON;

export interface QuizCardProps {
  /**
   * Data satu soal kuis.
   */
  question?: QuizQuestion;
  /**
   * Daftar beberapa soal kuis (jika ingin QuizCard mengelola navigasi antar soal sendiri)
   */
  questions?: QuizQuestion[];
  /**
   * Module ID untuk memuat soal default jika `question` tidak diberikan (contoh: 'module1')
   */
  moduleId?: string;
  /**
   * Indeks soal dalam modul (0-based)
   */
  questionIndex?: number;
  /**
   * Nomor soal untuk label tampilan (contoh: Soal 1)
   */
  questionNumber?: number;
  /**
   * Total jumlah soal dalam rangkaian
   */
  totalQuestions?: number;
  /**
   * Callback saat jawaban diperiksa
   */
  onAnswer?: (isCorrect: boolean, selectedOptionId: string) => void;
  /**
   * Callback untuk berpindah ke soal berikutnya
   */
  onNext?: () => void;
  /**
   * Menampilkan tombol lanjut ke soal berikutnya (default: true)
   */
  showNextButton?: boolean;
  /**
   * Class name tambahan untuk wrapper
   */
  className?: string;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  question: propQuestion,
  questions: propQuestions,
  moduleId = 'module1',
  questionIndex: propQuestionIndex,
  questionNumber: propQuestionNumber,
  totalQuestions: propTotalQuestions,
  onAnswer,
  onNext,
  showNextButton = true,
  className = '',
}) => {
  // Internal index jika navigasi dikelola secara mandiri oleh QuizCard
  const [internalIndex, setInternalIndex] = useState(0);

  // Kumpulan soal yang tersedia
  const questionList: QuizQuestion[] = useMemo(() => {
    if (propQuestions && propQuestions.length > 0) return propQuestions;
    if (propQuestion) return [propQuestion];
    if (quizzesData[moduleId] && quizzesData[moduleId].length > 0) {
      return quizzesData[moduleId];
    }
    const all = Object.values(quizzesData).flat();
    return all.length > 0 ? all : [quizzesData.module1[0]];
  }, [propQuestions, propQuestion, moduleId]);

  const currentIndex = propQuestionIndex !== undefined ? propQuestionIndex : internalIndex;

  const activeQuestion: QuizQuestion =
    propQuestion ||
    questionList[currentIndex] ||
    questionList[0] ||
    quizzesData.module1[0];

  const total = propTotalQuestions || questionList.length;
  const displayQuestionNumber = propQuestionNumber || currentIndex + 1;
  const hasNext = onNext !== undefined || currentIndex < total - 1;

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [prevQuestionId, setPrevQuestionId] = useState<string>(activeQuestion.id);

  // Reset pilihan dan status submit saat soal berganti (pola render resmi React)
  if (prevQuestionId !== activeQuestion.id) {
    setPrevQuestionId(activeQuestion.id);
    setSelectedOptionId(null);
    setIsSubmitted(false);
  }

  const isCorrect = selectedOptionId === activeQuestion.correctAnswer;

  const handleSelectOption = (optionId: string) => {
    if (isSubmitted) return; // Kunci pilihan setelah disubmit sebelum reset
    setSelectedOptionId(optionId);
  };

  const handleSubmit = () => {
    if (!selectedOptionId || isSubmitted) return;
    setIsSubmitted(true);
    if (onAnswer) {
      onAnswer(selectedOptionId === activeQuestion.correctAnswer, selectedOptionId);
    }
  };

  const handleReset = () => {
    setSelectedOptionId(null);
    setIsSubmitted(false);
  };

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else if (currentIndex < questionList.length - 1) {
      setInternalIndex((prev) => prev + 1);
    }
  };

  const correctOptionText = activeQuestion.options.find(
    (opt) => opt.id === activeQuestion.correctAnswer
  )?.text;

  return (
    <div
      className={`glass rounded-2xl border border-white/10 p-6 sm:p-8 shadow-xl transition-all duration-300 relative overflow-hidden bg-slate-900/80 backdrop-blur-md ${className}`}
    >
      {/* Decorative Top Accent Glow */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 transition-colors duration-500 ${
          !isSubmitted
            ? 'bg-gradient-to-r from-sky-500 to-emerald-400'
            : isCorrect
            ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]'
            : 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.7)]'
        }`}
      />

      {/* Header Info */}
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            {`Soal ${displayQuestionNumber}${total > 1 ? ` / ${total}` : ''}`}
          </span>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            ID: {activeQuestion.id}
          </span>
        </div>

        {isSubmitted && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 animate-scale-in ${
              isCorrect
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
            }`}
          >
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Benar (+100)
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                Belum Tepat
              </>
            )}
          </span>
        )}
      </div>

      {/* Teks Pertanyaan (dengan LaTeX renderer) */}
      <div className="mb-6">
        <h3 className="text-lg sm:text-xl font-medium text-slate-100 leading-relaxed">
          <LatexText text={activeQuestion.question} />
        </h3>
      </div>

      {/* Pilihan Jawaban */}
      <div className="space-y-3 mb-6" role="radiogroup" aria-label="Pilihan Ganda">
        {activeQuestion.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const isOptionCorrect = option.id === activeQuestion.correctAnswer;

          let optionStyle =
            'border-white/10 bg-slate-800/50 hover:bg-slate-800 hover:border-sky-500/50 text-slate-200';

          if (isSelected && !isSubmitted) {
            optionStyle =
              'border-sky-500 bg-sky-500/15 text-white ring-2 ring-sky-500/40 shadow-[0_0_15px_rgba(14,165,233,0.2)]';
          } else if (isSubmitted) {
            if (isOptionCorrect) {
              optionStyle =
                'border-emerald-500/80 bg-emerald-500/20 text-emerald-100 ring-2 ring-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.25)]';
            } else if (isSelected && !isCorrect) {
              optionStyle =
                'border-rose-500/80 bg-rose-500/20 text-rose-100 ring-2 ring-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.25)]';
            } else {
              optionStyle = 'border-white/5 bg-slate-800/30 text-slate-500 opacity-60';
            }
          }

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelectOption(option.id)}
              disabled={isSubmitted}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-3.5 group cursor-pointer disabled:cursor-default ${optionStyle}`}
              aria-checked={isSelected}
              role="radio"
            >
              {/* Option Letter Indicator */}
              <span
                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-colors ${
                  isSelected && !isSubmitted
                    ? 'bg-sky-500 text-white'
                    : isSubmitted && isOptionCorrect
                    ? 'bg-emerald-500 text-white'
                    : isSubmitted && isSelected && !isCorrect
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-700/60 text-slate-300 group-hover:bg-slate-700 group-hover:text-white'
                }`}
              >
                {option.id}
              </span>

              {/* Option Text (dengan KaTeX rendering) */}
              <div className="flex-1 pt-1 text-sm sm:text-base leading-relaxed">
                <LatexText text={option.text} />
              </div>

              {/* Status Icon bila sudah submit */}
              {isSubmitted && (
                <div className="flex-shrink-0 pt-1">
                  {isOptionCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : isSelected ? (
                    <XCircle className="w-5 h-5 text-rose-400" />
                  ) : null}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Action Buttons (Sebelum Submit) */}
      {!isSubmitted && (
        <div className="flex items-center justify-end pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedOptionId}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 hover:scale-105 shadow-lg shadow-sky-500/20"
            style={{
              background: selectedOptionId
                ? 'linear-gradient(135deg, var(--ce-primary), var(--ce-primary-dark))'
                : 'rgba(51, 65, 85, 0.5)',
            }}
          >
            <Sparkles className="w-4 h-4" />
            Periksa Jawaban
          </button>
        </div>
      )}

      {/* Kotak Umpan Balik (Feedback Box) Setelah Submit */}
      {isSubmitted && (
        <div
          className={`mt-6 p-5 sm:p-6 rounded-2xl border transition-all duration-300 animate-fade-in ${
            isCorrect
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-100'
          }`}
          role="region"
          aria-live="polite"
        >
          {/* Header Feedback */}
          <div className="flex items-center gap-3 mb-3">
            {isCorrect ? (
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 flex-shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
            )}
            <div>
              <h4 className="font-bold text-base sm:text-lg">
                {isCorrect ? 'Hebat, Jawabanmu Benar!' : 'Jawabanmu Belum Tepat'}
              </h4>
              {!isCorrect && correctOptionText && (
                <p className="text-xs sm:text-sm text-rose-300/90 mt-0.5">
                  Kunci Jawaban:{' '}
                  <span className="font-bold underline">
                    {activeQuestion.correctAnswer}
                  </span>{' '}
                  — <LatexText text={correctOptionText} />
                </p>
              )}
            </div>
          </div>

          {/* Penjelasan Konsep (dengan KaTeX rendering) */}
          <div className="pl-0 sm:pl-12 text-sm sm:text-base leading-relaxed text-slate-200/95 border-t border-white/10 pt-3 mt-3">
            <span className="font-semibold text-xs tracking-wider uppercase text-slate-400 block mb-1">
              Penjelasan Konsep:
            </span>
            <LatexText text={activeQuestion.explanation} />
          </div>

          {/* Kontrol Navigasi & Ulangi */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-5 mt-4 border-t border-white/10">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Coba Lagi
            </button>

            {showNextButton && hasNext && (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all hover:scale-105 cursor-pointer shadow-md"
                style={{
                  background:
                    'linear-gradient(135deg, var(--ce-primary), var(--ce-primary-dark))',
                }}
              >
                Soal Berikutnya
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizCard;
