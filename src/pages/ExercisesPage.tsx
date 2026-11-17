import { useState } from 'react';
import { QuizCard, MatchingExercise } from '../components';
import quizzesDataRaw from '../content/quizzes.json';
import {
  Zap,
  HelpCircle,
  Layers,
  Trophy,
  Filter,
  BookOpen
} from 'lucide-react';

const MODULE_TABS = [
  { id: 'all', label: 'Semua Modul', badge: 'Ringkasan' },
  { id: 'module1', label: 'Modul 1: Redoks', badge: 'TP1' },
  { id: 'module2', label: 'Modul 2: Sel Volta', badge: 'TP2' },
  { id: 'module3', label: 'Modul 3: Elektrolisis', badge: 'TP3' },
  { id: 'module4', label: 'Modul 4: Hukum Faraday', badge: 'TP4' },
  { id: 'module5', label: 'Modul 5: Korosi', badge: 'TP5' },
];

export default function ExercisesPage() {
  const [activeModule, setActiveModule] = useState('all');
  const [activeCategory, setActiveCategory] = useState<'all' | 'exercise' | 'quiz'>('all');

  const flatQuizzes = Object.values(quizzesDataRaw).flat();
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);

  // Status progres siswa yang tersimpan di localStorage
  const [userProgress, setUserProgress] = useState<Record<string, any>>(() => {
    try {
      const saved = localStorage.getItem('chem-electrolabs.v1.progress');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Update progress di localStorage saat ada aktivitas selesai
  const handleQuizAnswer = (moduleId: string, isCorrect: boolean) => {
    if (!isCorrect) return;
    try {
      const current = { ...userProgress };
      const modNum = moduleId.replace('module', '');
      current[`module_${modNum}_pct`] = Math.max(current[`module_${modNum}_pct`] || 0, 75);
      setUserProgress(current);
      localStorage.setItem('chem-electrolabs.v1.progress', JSON.stringify(current));
    } catch {
      // ignore
    }
  };

  const handleExerciseComplete = (moduleId: string, score: number, total: number) => {
    try {
      const current = { ...userProgress };
      const modNum = moduleId.replace('module', '');
      const pct = Math.round((score / total) * 100);
      current[`module_${modNum}_pct`] = Math.max(current[`module_${modNum}_pct`] || 0, pct);
      if (pct >= 80) {
        current[`module_${modNum}_done`] = true;
      }
      setUserProgress(current);
      localStorage.setItem('chem-electrolabs.v1.progress', JSON.stringify(current));
    } catch {
      // ignore
    }
  };

  return (
    <main className="min-h-screen pt-24 pb-20 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* ─── Hero Section ────────────────────────────────────────── */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-4 animate-fade-in">
          <Zap className="w-3.5 h-3.5 text-sky-400" />
          <span>F8 & F9 — Pusat Latihan Elektrokimia</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
          Latihan Interaktif & <span className="gradient-text">Cek Pemahaman</span>
        </h1>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Uji pemahaman konsep elektrokimia melalui pencocokan tiga level representasi (makroskopik, submikroskopik, simbolik) dan kuis evaluasi formatif dengan pembahasan tuntas.
        </p>

        {/* Highlight Stats Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8 max-w-xl mx-auto text-left">
          <div className="glass p-3.5 rounded-2xl border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 flex-shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Latihan F8</div>
              <div className="font-bold text-sm text-white">Triple Rep & Komponen</div>
            </div>
          </div>

          <div className="glass p-3.5 rounded-2xl border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 flex-shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Kuis F9</div>
              <div className="font-bold text-sm text-white">{flatQuizzes.length} Soal Berbantuan LaTeX</div>
            </div>
          </div>

          <div className="glass p-3.5 rounded-2xl border border-white/10 flex items-center gap-3 col-span-2 sm:col-span-1">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Umpan Balik</div>
              <div className="font-bold text-sm text-white">Langsung & Konseptual</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Filter & Kategori Tab ────────────────────────────────── */}
      <div className="mb-10 space-y-4">
        {/* Module Selection Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {MODULE_TABS.map((tab) => {
            const isActive = activeModule === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveModule(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25 ring-2 ring-sky-400/40'
                    : 'glass text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Activity Filter (Semua / Latihan / Kuis) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-sky-400" />
            <span>Tipe Aktivitas:</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800/60 p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-sky-500 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Semua ({activeModule === 'all' ? 'Latihan & Kuis' : 'Lengkap'})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('exercise')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeCategory === 'exercise'
                  ? 'bg-teal-500 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Latihan Interaktif (F8)
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('quiz')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeCategory === 'quiz'
                  ? 'bg-sky-500 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cek Pemahaman / Kuis (F9)
            </button>
          </div>
        </div>
      </div>

      {/* ─── Konten Aktivitas ─────────────────────────────────────── */}
      <div className="space-y-12">
        {/* ========================================================= */}
        {/* SEKSI 1: LATIHAN INTERAKTIF (F8)                          */}
        {/* ========================================================= */}
        {(activeCategory === 'all' || activeCategory === 'exercise') && (
          <section className="space-y-8">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <Layers className="w-6 h-6 text-teal-400" />
                  Latihan Interaktif (F8)
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Mencocokkan triple representation dan melabeli diagram sel elektrokimia.
                </p>
              </div>
            </div>

            {/* Modul 1 Latihan: Triple Representation */}
            {(activeModule === 'all' || activeModule === 'module1') && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    Modul 1 • TP1
                  </span>
                  <span className="text-sm font-semibold text-slate-300">
                    Reaksi Redoks & Tiga Representasi Kimia
                  </span>
                </div>
                <MatchingExercise
                  moduleId="module1"
                  onComplete={(score, total) => handleExerciseComplete('module1', score, total)}
                />
              </div>
            )}

            {/* Modul 2 Latihan: Komponen Sel Volta */}
            {(activeModule === 'all' || activeModule === 'module2') && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    Modul 2 • TP2
                  </span>
                  <span className="text-sm font-semibold text-slate-300">
                    Struktur & Komponen Sel Volta
                  </span>
                </div>
                <MatchingExercise
                  moduleId="module2"
                  onComplete={(score, total) => handleExerciseComplete('module2', score, total)}
                />
              </div>
            )}

            {/* Catatan jika modul 3/4/5 dipilih pada filter Latihan */}
            {(activeModule === 'module3' || activeModule === 'module4' || activeModule === 'module5') && (
              <div className="glass p-6 rounded-2xl border border-white/10 text-center space-y-2">
                <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-75" />
                <h4 className="font-semibold text-white">Latihan Simulasi Khusus</h4>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                  Untuk modul ini, latihan interaktif berfokus pada simulasi elektrolisis, kalkulator Faraday, dan kuis cek pemahaman di bawah.
                </p>
              </div>
            )}
          </section>
        )}

        {/* ========================================================= */}
        {/* SEKSI 2: CEK PEMAHAMAN (KUIS F9)                          */}
        {/* ========================================================= */}
        {(activeCategory === 'all' || activeCategory === 'quiz') && (
          <section className="space-y-6 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-6 h-6 text-sky-400" />
                  Cek Pemahaman / Kuis (F9)
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Soal formatif per modul berbantuan rumus kimia KaTeX dan ulasan konsep tuntas.
                </p>
              </div>

              {/* Selector Soal Jika Melihat Semua Modul */}
              {activeModule === 'all' && (
                <div className="flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-xl border border-white/10">
                  <span className="text-xs text-slate-400 px-2 font-medium">Navigasi Soal:</span>
                  {flatQuizzes.map((q, idx) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setQuizQuestionIndex(idx)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        quizQuestionIndex === idx
                          ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                          : 'text-slate-300 hover:bg-slate-700/60'
                      }`}
                      title={`Soal ${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Jika 'all' modul dipilih: tampilkan kuis berurutan dengan tombol next */}
            {activeModule === 'all' ? (
              <QuizCard
                question={flatQuizzes[quizQuestionIndex]}
                questionNumber={quizQuestionIndex + 1}
                totalQuestions={flatQuizzes.length}
                showNextButton={true}
                onNext={() => setQuizQuestionIndex((prev) => (prev + 1) % flatQuizzes.length)}
                onAnswer={(isCorrect) => handleQuizAnswer(`module${quizQuestionIndex + 1}`, isCorrect)}
              />
            ) : (
              /* Jika modul tertentu dipilih: tampilkan kuis modul tersebut */
              <QuizCard
                moduleId={activeModule}
                questionIndex={0}
                questionNumber={1}
                totalQuestions={quizzesDataRaw[activeModule as keyof typeof quizzesDataRaw]?.length || 1}
                showNextButton={false}
                onAnswer={(isCorrect) => handleQuizAnswer(activeModule, isCorrect)}
              />
            )}
          </section>
        )}
      </div>
    </main>
  );
}
