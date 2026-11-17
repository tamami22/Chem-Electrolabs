import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Zap, ArrowRight, ArrowLeft, CheckCircle2,
  BookOpen, Clock, Check, ChevronRight
} from 'lucide-react'
import modul1Data from '../content/modul-1.json'
import TripleRepTabs from '../components/modules/TripleRepTabs'
import RedoxExperimentSimulator from '../features/redox/RedoxExperimentSimulator'
import InteractiveExercise from '../components/modules/InteractiveExercise'
import ModuleQuiz from '../components/modules/ModuleQuiz'

const NAVIGATION_SECTIONS = [
  { id: 'step-1', label: '1. Transfer Elektron', type: 'step', index: 0 },
  { id: 'step-2', label: '2. Reduktor & Oksidator', type: 'step', index: 1 },
  { id: 'step-3', label: '3. Kereaktifan Logam', type: 'step', index: 2 },
  { id: 'lab', label: 'Laboratorium Virtual', type: 'lab' },
  { id: 'exercise', label: 'Latihan Representasi', type: 'exercise' },
  { id: 'quiz', label: 'Cek Pemahaman', type: 'quiz' },
]

function getStoredProgress() {
  try {
    const raw = localStorage.getItem('chem-electrolabs.v1.progress')
    if (raw) {
      const parsed = JSON.parse(raw)
      return parsed.modules?.['1-redoks'] || {}
    }
  } catch {
    // ignore
  }
  return {}
}

export default function Module1Page() {
  const [activeSection, setActiveSection] = useState('step-1')
  const [completedSections, setCompletedSections] = useState(() => {
    return getStoredProgress().completedSections || {}
  })
  const [quizScore, setQuizScore] = useState(() => {
    return getStoredProgress().quizScore ?? null
  })

  // Save progress helper
  const saveProgress = (newCompleted, newQuizScore) => {
    try {
      const raw = localStorage.getItem('chem-electrolabs.v1.progress')
      const parsed = raw ? JSON.parse(raw) : { modules: {} }
      if (!parsed.modules) parsed.modules = {}

      parsed.modules['1-redoks'] = {
        completed: Object.keys(newCompleted).length >= 5 || (newQuizScore && newQuizScore >= 70),
        completedSections: newCompleted,
        quizScore: newQuizScore ?? quizScore,
        lastAccessed: new Date().toISOString(),
      }

      localStorage.setItem('chem-electrolabs.v1.progress', JSON.stringify(parsed))
    } catch {
      // ignore
    }
  }

  const markSectionCompleted = (sectionId) => {
    setCompletedSections((prev) => {
      const updated = { ...prev, [sectionId]: true }
      saveProgress(updated, quizScore)
      return updated
    })
  }

  const handleQuizComplete = (score) => {
    setQuizScore(score)
    setCompletedSections((prev) => {
      const updated = { ...prev, quiz: true }
      saveProgress(updated, score)
      return updated
    })
  }

  // Current active index in NAVIGATION_SECTIONS
  const currentNavIndex = NAVIGATION_SECTIONS.findIndex((s) => s.id === activeSection)

  const handleNextSection = () => {
    markSectionCompleted(activeSection)
    if (currentNavIndex < NAVIGATION_SECTIONS.length - 1) {
      const nextId = NAVIGATION_SECTIONS[currentNavIndex + 1].id
      setActiveSection(nextId)
      window.scrollTo({ top: 180, behavior: 'smooth' })
    }
  }

  const handlePrevSection = () => {
    if (currentNavIndex > 0) {
      const prevId = NAVIGATION_SECTIONS[currentNavIndex - 1].id
      setActiveSection(prevId)
      window.scrollTo({ top: 180, behavior: 'smooth' })
    }
  }

  // Calculate progress percentage
  const totalNavSections = NAVIGATION_SECTIONS.length
  const completedCount = Object.keys(completedSections).length
  const progressPercent = Math.min(100, Math.round((completedCount / totalNavSections) * 100))

  return (
    <main className="min-h-screen pt-20 pb-24 px-4 sm:px-6 max-w-6xl mx-auto space-y-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
        <Link to="/" className="hover:text-white transition-colors">Beranda</Link>
        <ChevronRight size={14} />
        <Link to="/peta" className="hover:text-white transition-colors">Peta Belajar</Link>
        <ChevronRight size={14} />
        <span className="text-sky-400 font-medium">Modul 1: Reaksi Redoks</span>
      </nav>

      {/* Module Hero Header Card */}
      <header className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center gap-1.5">
                <Zap size={13} />
                {modul1Data.tpCode}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {modul1Data.badge}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock size={13} />
                {modul1Data.duration}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {modul1Data.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {modul1Data.subtitle}
            </p>
          </div>

          {/* Module Progress Dial */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center shrink-0 min-w-[160px] text-center shadow-lg">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
              Progres Modul
            </span>
            <span className="text-3xl font-extrabold text-sky-400 font-mono">
              {progressPercent}%
            </span>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2.5">
              <div
                className="bg-gradient-to-r from-sky-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-2">
              {completedCount} dari {totalNavSections} bagian selesai
            </span>
          </div>
        </div>
      </header>

      {/* Learning Goals (TP1 & Indikator) Collapsible / Summary Box */}
      <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-3">
        <h2 className="text-xs uppercase tracking-wider font-bold text-sky-400 flex items-center gap-1.5">
          <BookOpen size={16} />
          Tujuan Pembelajaran (TP1) & Indikator Kompetensi:
        </h2>
        <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed">
          "{modul1Data.tpDesc}"
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2 text-xs sm:text-sm text-slate-300">
          {modul1Data.learningOutcomes.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
              <Check size={15} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Stepper Navigation Bar */}
      <nav aria-label="Navigasi Tahapan Modul 1" className="bg-slate-900/70 border border-slate-800 rounded-2xl p-2 overflow-x-auto shadow-md backdrop-blur-sm">
        <div className="flex items-center gap-1.5 min-w-max">
          {NAVIGATION_SECTIONS.map((sec, idx) => {
            const isActive = activeSection === sec.id
            const isDone = completedSections[sec.id]

            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                    : isDone
                    ? 'bg-slate-800/80 text-emerald-400 hover:text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 size={15} className={isActive ? 'text-white' : 'text-emerald-400'} />
                ) : (
                  <span className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {idx + 1}
                  </span>
                )}
                <span>{sec.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Dynamic Content Display Area */}
      <div className="space-y-6">
        {/* STEP 1 */}
        {activeSection === 'step-1' && (
          <section className="space-y-6 animate-fade-in" aria-labelledby="step-1-title">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Tahap 1 dari 3</span>
              <h2 id="step-1-title" className="text-xl sm:text-2xl font-bold text-white">
                {modul1Data.steps[0].title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                {modul1Data.steps[0].summary}
              </p>
            </div>
            <TripleRepTabs stepData={modul1Data.steps[0]} />
          </section>
        )}

        {/* STEP 2 */}
        {activeSection === 'step-2' && (
          <section className="space-y-6 animate-fade-in" aria-labelledby="step-2-title">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Tahap 2 dari 3</span>
              <h2 id="step-2-title" className="text-xl sm:text-2xl font-bold text-white">
                {modul1Data.steps[1].title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                {modul1Data.steps[1].summary}
              </p>
            </div>
            <TripleRepTabs stepData={modul1Data.steps[1]} />
          </section>
        )}

        {/* STEP 3 */}
        {activeSection === 'step-3' && (
          <section className="space-y-6 animate-fade-in" aria-labelledby="step-3-title">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Tahap 3 dari 3</span>
              <h2 id="step-3-title" className="text-xl sm:text-2xl font-bold text-white">
                {modul1Data.steps[2].title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                {modul1Data.steps[2].summary}
              </p>
            </div>
            <TripleRepTabs stepData={modul1Data.steps[2]} />
          </section>
        )}

        {/* LAB VIRTUAL */}
        {activeSection === 'lab' && (
          <section className="space-y-6 animate-fade-in" aria-labelledby="lab-title">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Praktikum Digital</span>
              <h2 id="lab-title" className="text-xl sm:text-2xl font-bold text-white">
                {modul1Data.interactiveLab.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                {modul1Data.interactiveLab.description}
              </p>
            </div>
            <RedoxExperimentSimulator />
          </section>
        )}

        {/* LATIHAN INTERAKTIF */}
        {activeSection === 'exercise' && (
          <section className="space-y-6 animate-fade-in" aria-labelledby="exercise-title">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Aktivitas Latihan</span>
              <h2 id="exercise-title" className="text-xl sm:text-2xl font-bold text-white">
                {modul1Data.matchingExercise.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Hubungkan gejala makroskopik laboratorium dengan penjelasan partikel dan representasi simboliknya.
              </p>
            </div>
            <InteractiveExercise exerciseData={modul1Data.matchingExercise} />
          </section>
        )}

        {/* KUIS CEK PEMAHAMAN */}
        {activeSection === 'quiz' && (
          <section className="space-y-6 animate-fade-in" aria-labelledby="quiz-title">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Evaluasi Formatif</span>
              <h2 id="quiz-title" className="text-xl sm:text-2xl font-bold text-white">
                {modul1Data.quiz.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                {modul1Data.quiz.description}
              </p>
            </div>
            <ModuleQuiz quizData={modul1Data.quiz} onComplete={handleQuizComplete} />
          </section>
        )}
      </div>

      {/* Bottom Sticky-style Action Bar */}
      <footer className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
        <button
          type="button"
          disabled={currentNavIndex === 0}
          onClick={handlePrevSection}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          <ArrowLeft size={16} />
          Sebelumnya
        </button>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
          <span>Bagian {currentNavIndex + 1} dari {NAVIGATION_SECTIONS.length}</span>
        </div>

        {currentNavIndex < NAVIGATION_SECTIONS.length - 1 ? (
          <button
            type="button"
            onClick={handleNextSection}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-sky-500 hover:bg-sky-400 transition-all cursor-pointer shadow-lg shadow-sky-500/20"
          >
            Lanjut
            <ArrowRight size={16} />
          </button>
        ) : (
          <Link
            to="/modul/2-sel-volta"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-all hover:scale-105 shadow-lg shadow-emerald-500/20"
            style={{
              background: 'linear-gradient(135deg, var(--ce-secondary), #059669)',
            }}
          >
            Modul Berikutnya: Sel Volta
            <ArrowRight size={16} />
          </Link>
        )}
      </footer>
    </main>
  )
}
