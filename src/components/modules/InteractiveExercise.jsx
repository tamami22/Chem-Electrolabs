import { useState } from 'react'
import { CheckCircle2, XCircle, RotateCcw, Eye, Atom, Hash, Sparkles } from 'lucide-react'
import { InlineMath } from '../ui/MathFormula'

export default function InteractiveExercise({ exerciseData }) {
  const { title, instruction, items } = exerciseData

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedSubmicro, setSelectedSubmicro] = useState(null)
  const [selectedSimbolik, setSelectedSimbolik] = useState(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [completedItems, setCompletedItems] = useState({})

  const currentItem = items[currentIndex]

  // Available options: correct one + shuffled from other items
  // To keep it predictable and reproducible:
  const submicroOptions = items.map((it) => it.submicro)
  const simbolikOptions = items.map((it) => it.simbolik)

  const handleSelectSubmicro = (opt) => {
    if (isSubmitted) return
    setSelectedSubmicro(opt)
  }

  const handleSelectSimbolik = (opt) => {
    if (isSubmitted) return
    setSelectedSimbolik(opt)
  }

  const handleCheckAnswer = () => {
    if (!selectedSubmicro || !selectedSimbolik) return
    const isCorrect =
      selectedSubmicro === currentItem.submicro &&
      selectedSimbolik === currentItem.simbolik

    setIsSubmitted(true)
    if (isCorrect) {
      setCompletedItems((prev) => ({ ...prev, [currentItem.id]: true }))
    }
  }

  const handleNext = () => {
    setIsSubmitted(false)
    setSelectedSubmicro(null)
    setSelectedSimbolik(null)
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const handleReset = () => {
    setCurrentIndex(0)
    setSelectedSubmicro(null)
    setSelectedSimbolik(null)
    setIsSubmitted(false)
    setCompletedItems({})
  }

  const isCurrentCorrect =
    selectedSubmicro === currentItem.submicro &&
    selectedSimbolik === currentItem.simbolik

  const totalCompleted = Object.keys(completedItems).length

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="p-5 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-emerald-400" />
            <h3 className="text-base sm:text-lg font-bold text-white">{title}</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">{instruction}</p>
        </div>

        {/* Progress Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300">
            Terselesaikan:
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {totalCompleted} / {items.length} Pasangan
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-7 space-y-6">
        {/* Step dots */}
        <div className="flex items-center justify-center gap-2">
          {items.map((it, idx) => (
            <button
              key={it.id}
              onClick={() => {
                setCurrentIndex(idx)
                setIsSubmitted(false)
                setSelectedSubmicro(null)
                setSelectedSimbolik(null)
              }}
              className={`w-8 h-8 rounded-full text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                currentIndex === idx
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30 scale-110'
                  : completedItems[it.id]
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              aria-label={`Buka tantangan ${idx + 1}`}
            >
              {completedItems[it.id] ? <CheckCircle2 size={14} /> : idx + 1}
            </button>
          ))}
        </div>

        {/* Challenge Box: LEVEL 1 MAKROSKOPIK (Diberikan) */}
        <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400 mb-1.5">
            <Eye size={15} />
            Level 1: Gejala Makroskopik (Teramati di Lab)
          </div>
          <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
            "{currentItem.makro}"
          </p>
        </div>

        {/* Matching Columns (Tap-to-match for mobile & desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Column A: Submikroskopik Selection */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Atom size={15} />
              Pilih Penjelasan Submikroskopik yang Tepat:
            </h4>
            <div className="space-y-2">
              {submicroOptions.map((opt, idx) => {
                const isSelected = selectedSubmicro === opt
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSubmicro(opt)}
                    className={`w-full text-left p-3.5 rounded-xl text-xs sm:text-sm transition-all border cursor-pointer leading-relaxed ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500 shadow-md shadow-emerald-500/10'
                        : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Column B: Simbolik Selection */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Hash size={15} />
              Pilih Representasi Simbolik yang Sesuai:
            </h4>
            <div className="space-y-2">
              {simbolikOptions.map((opt, idx) => {
                const isSelected = selectedSimbolik === opt
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSimbolik(opt)}
                    className={`w-full text-left p-3.5 rounded-xl text-xs sm:text-sm transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-200 border-amber-500 shadow-md shadow-amber-500/10'
                        : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 text-xs flex items-center justify-center shrink-0 font-bold">
                        {idx + 1}
                      </span>
                      <div className="text-center w-full py-1">
                        <InlineMath math={opt} />
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        {isSubmitted && (
          <div
            className={`p-4 sm:p-5 rounded-xl border animate-fade-in ${
              isCurrentCorrect
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                : 'bg-red-500/10 border-red-500/40 text-red-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {isCurrentCorrect ? (
                <CheckCircle2 size={22} className="text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle size={22} className="text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1.5">
                <h5 className="font-bold text-sm sm:text-base">
                  {isCurrentCorrect
                    ? 'Luar Biasa, Pasangan Anda Tepat!'
                    : 'Kurang Tepat, Coba Analisis Kembali'}
                </h5>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {currentItem.explanation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw size={14} />
            Mulai Ulang Latihan
          </button>

          <div className="flex items-center gap-2">
            {!isSubmitted ? (
              <button
                type="button"
                disabled={!selectedSubmicro || !selectedSimbolik}
                onClick={handleCheckAnswer}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-sky-500 hover:bg-sky-400 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-lg shadow-sky-500/20"
              >
                Periksa Pasangan
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-400 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                {currentIndex < items.length - 1 ? 'Lanjut ke Soal Berikutnya →' : 'Selesai Latihan 🎉'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
