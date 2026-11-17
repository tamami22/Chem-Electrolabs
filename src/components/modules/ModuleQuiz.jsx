import { useState } from 'react'
import {
  CheckCircle2, XCircle, RotateCcw,
  Sparkles, Award, ArrowRight, BookOpen, CheckSquare, Square
} from 'lucide-react'

export default function ModuleQuiz({ quizData, onComplete }) {
  const { title, description, questions, reflectionEssay } = quizData

  const [selectedAnswers, setSelectedAnswers] = useState({}) // { [qId]: optionId }
  const [showFeedback, setShowFeedback] = useState({}) // { [qId]: boolean }
  const [essayAnswer, setEssayAnswer] = useState('')
  const [checkedRubrics, setCheckedRubrics] = useState({}) // { [idx]: boolean }
  const [showModelAnswer, setShowModelAnswer] = useState(false)
  const [isQuizFinished, setIsQuizFinished] = useState(false)

  const handleSelectOption = (qId, optId) => {
    if (showFeedback[qId]) return
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optId }))
  }

  const handleCheckQuestion = (qId) => {
    setShowFeedback((prev) => ({ ...prev, [qId]: true }))
  }

  // Calculate score
  let correctCount = 0
  questions.forEach((q) => {
    const chosen = selectedAnswers[q.id]
    const correctOpt = q.options.find((o) => o.isCorrect)
    if (chosen && correctOpt && chosen === correctOpt.id) {
      correctCount++
    }
  })

  const scorePercent = Math.round((correctCount / questions.length) * 100)

  const handleFinishQuiz = () => {
    setIsQuizFinished(true)
    if (onComplete) {
      onComplete(scorePercent)
    }
  }

  const handleResetQuiz = () => {
    setSelectedAnswers({})
    setShowFeedback({})
    setEssayAnswer('')
    setCheckedRubrics({})
    setShowModelAnswer(false)
    setIsQuizFinished(false)
  }

  const toggleRubric = (idx) => {
    setCheckedRubrics((prev) => ({ ...prev, [idx]: !prev[idx] }))
  }

  const allQuestionsAnswered = questions.every((q) => selectedAnswers[q.id])

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Quiz Header */}
      <div className="p-5 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Award size={20} className="text-amber-400" />
            <h3 className="text-base sm:text-lg font-bold text-white">{title}</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">{description}</p>
        </div>

        {/* Live Score Counter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300">Skor Pilihan Ganda:</span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 font-mono">
            {correctCount} / {questions.length} Benar ({scorePercent}%)
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-7 space-y-8">
        {/* SECTION 1: PILIHAN GANDA */}
        <div className="space-y-6">
          <h4 className="text-xs uppercase tracking-wider font-bold text-sky-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <BookOpen size={15} />
            Bagian A: Soal Pilihan Ganda Konseptual (5 Soal)
          </h4>

          {questions.map((q, idx) => {
            const chosen = selectedAnswers[q.id]
            const isEvaluated = showFeedback[q.id]
            const correctOpt = q.options.find((o) => o.isCorrect)
            const isCorrect = chosen && correctOpt && chosen === correctOpt.id

            return (
              <div
                key={q.id}
                className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4"
              >
                {/* Question Text */}
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed">
                    {q.question}
                  </p>
                </div>

                {/* Options List */}
                <div className="space-y-2 pl-9">
                  {q.options.map((opt) => {
                    const isSelected = chosen === opt.id
                    let optStyle = 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700'

                    if (isEvaluated) {
                      if (opt.isCorrect) {
                        optStyle = 'bg-emerald-500/20 text-emerald-200 border-emerald-500 font-semibold'
                      } else if (isSelected && !opt.isCorrect) {
                        optStyle = 'bg-red-500/20 text-red-200 border-red-500'
                      } else {
                        optStyle = 'bg-slate-950/40 text-slate-500 border-slate-800/40'
                      }
                    } else if (isSelected) {
                      optStyle = 'bg-sky-500/20 text-sky-200 border-sky-500 font-medium'
                    }

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectOption(q.id, opt.id)}
                        className={`w-full text-left p-3 rounded-xl text-xs sm:text-sm transition-all border flex items-center gap-3 cursor-pointer ${optStyle}`}
                      >
                        <span className="w-5 h-5 rounded-full bg-slate-800/80 text-xs font-bold flex items-center justify-center shrink-0">
                          {opt.id}
                        </span>
                        <span className="flex-1 leading-relaxed">{opt.text}</span>
                        {isEvaluated && opt.isCorrect && (
                          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        )}
                        {isEvaluated && isSelected && !opt.isCorrect && (
                          <XCircle size={16} className="text-red-400 shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Check Button for individual question */}
                {!isEvaluated && chosen && (
                  <div className="pl-9">
                    <button
                      type="button"
                      onClick={() => handleCheckQuestion(q.id)}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 transition-all cursor-pointer"
                    >
                      Periksa Jawaban Ini
                    </button>
                  </div>
                )}

                {/* Feedback note */}
                {isEvaluated && (
                  <div
                    className={`ml-9 p-3 rounded-lg text-xs leading-relaxed border ${
                      isCorrect
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                        : 'bg-red-500/10 border-red-500/30 text-red-200'
                    }`}
                  >
                    <p className="font-semibold mb-0.5">
                      {isCorrect ? '✓ Penjelasan Konsep:' : '✗ Ulasan Konsep:'}
                    </p>
                    <p>{isCorrect ? q.feedbackCorrect : q.feedbackIncorrect}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* SECTION 2: REFLEKSI MANDIRI (URAIOAN SELF-CHECK) */}
        {reflectionEssay && (
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h4 className="text-xs uppercase tracking-wider font-bold text-amber-400 flex items-center gap-1.5">
              <Sparkles size={15} />
              Bagian B: Soal Refleksi Tiga Representasi (Uraian Mandiri)
            </h4>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
              <p className="text-sm font-semibold text-slate-100 leading-relaxed">
                {reflectionEssay.question}
              </p>

              {/* Textarea for writing self answer */}
              <textarea
                rows={4}
                value={essayAnswer}
                onChange={(e) => setEssayAnswer(e.target.value)}
                placeholder="Tuliskan penjelasan sintesis tiga representasimu di sini..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              />

              {/* Self-check Rubric Checklist */}
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-4 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 block">
                  Rubrik Evaluasi Diri (Centang kriteria yang sudah Anda jelaskan):
                </span>
                <div className="space-y-2">
                  {reflectionEssay.rubric.map((item, idx) => {
                    const isChecked = !!checkedRubrics[idx]
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleRubric(idx)}
                        className="w-full flex items-start gap-2.5 text-left text-xs sm:text-sm text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        {isChecked ? (
                          <CheckSquare size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <Square size={16} className="text-slate-500 shrink-0 mt-0.5" />
                        )}
                        <span className={isChecked ? 'text-emerald-300 font-medium' : ''}>
                          {item}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Reveal Model Answer Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModelAnswer(!showModelAnswer)}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-4 cursor-pointer"
                  >
                    {showModelAnswer ? 'Sembunyikan Contoh Jawaban' : 'Lihat Contoh Jawaban Model →'}
                  </button>

                  {showModelAnswer && (
                    <div className="mt-3 p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200 leading-relaxed animate-fade-in">
                      <span className="font-bold block mb-1 text-amber-300">Model Jawaban Ideal:</span>
                      {reflectionEssay.modelAnswer}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Completion & Results Summary */}
        {isQuizFinished ? (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/40 text-center space-y-4 animate-scale-in">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Award size={28} />
            </div>
            <div>
              <h4 className="text-lg sm:text-xl font-bold text-white">
                {scorePercent >= 70 ? 'Selamat! Anda Menguasai Modul 1' : 'Hasil Evaluasi Modul 1'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md mx-auto">
                Skor akhir kuis pemahaman Anda: <span className="font-bold text-emerald-400">{scorePercent}%</span> ({correctCount} dari {questions.length} benar).
                {scorePercent >= 70
                  ? ' Pemahaman triple representation Anda sangat baik dan siap melanjutkan ke Modul 2 (Sel Volta)!'
                  : ' Anda dapat meninjau kembali step materi atau mencoba ulang kuis ini untuk menyempurnakan pemahaman.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetQuiz}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <RotateCcw size={15} />
                Ulangi Kuis
              </button>
              <a
                href="/modul/2-sel-volta"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-all hover:scale-105 shadow-lg shadow-sky-500/25"
                style={{
                  background: 'linear-gradient(135deg, var(--ce-primary), var(--ce-primary-dark))',
                }}
              >
                Lanjut ke Modul 2: Sel Volta
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        ) : (
          /* Bottom Action Bar */
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleResetQuiz}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw size={14} />
              Reset Semua Jawaban
            </button>

            <button
              type="button"
              disabled={!allQuestionsAnswered}
              onClick={handleFinishQuiz}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-sky-500 hover:bg-sky-400 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-lg shadow-sky-500/20"
            >
              Simpan & Selesaikan Kuis
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
