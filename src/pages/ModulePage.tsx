import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { modules } from '../content/index.ts';
import TripleRepTabs from '../components/modules/TripleRepTabs.tsx';
import QuickCheckCard from '../components/quiz/QuickCheckCard.tsx';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Layers,
  AlertCircle,
  Award,
  CheckCircle2,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

export default function ModulePage() {
  const { slug } = useParams<{ slug: string }>();
  const currentModule = modules.find((m) => m.slug === slug);

  // State langkah aktif (step-by-step: 0 sampai steps.length - 1)
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!currentModule) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Modul Tidak Ditemukan</h1>
        <p className="text-sm text-slate-600">
          Modul dengan tautan <code className="bg-slate-100 px-2 py-0.5 rounded text-xs">{slug}</code> tidak tersedia.
        </p>
        <Link
          to="/peta"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-sky-600 text-white hover:bg-sky-500 transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Peta Belajar</span>
        </Link>
      </div>
    );
  }

  const totalSteps = currentModule.steps.length;
  const currentStep = currentModule.steps[currentStepIndex] || currentModule.steps[0];
  const progressPercent = Math.round(((currentStepIndex + 1) / totalSteps) * 100);

  const handleNextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleSelectStep = (index: number) => {
    setCurrentStepIndex(index);
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 py-4 max-w-5xl mx-auto">
      {/* =========================================================================
          1. NAVIGASI ATAS: KEMBALI KE PETA BELAJAR
         ========================================================================= */}
      <div className="flex items-center justify-between">
        <Link
          to="/peta"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-sky-700 bg-white border border-slate-200 hover:border-sky-300 px-3.5 py-2 rounded-xl transition-all shadow-2xs min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 text-sky-600" />
          <span>Peta Belajar</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-sky-100 text-sky-800">
            Modul {currentModule.moduleNumber}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            <Clock className="w-3.5 h-3.5" />
            {currentModule.estimatedMinutes} Menit
          </span>
        </div>
      </div>

      {/* =========================================================================
          2. HEADER MODUL: JUDUL, TP, & TUJUAN PEMBELAJARAN
         ========================================================================= */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-sky-50 text-sky-700 border border-sky-200">
              <Layers className="w-3.5 h-3.5" />
              {currentModule.tpCodes.join(', ')}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Alur Capaian Kimia Fase F (Kelas XII)
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            {currentModule.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
            {currentModule.subtitle}
          </p>
        </div>

        {/* Indikator Tujuan Pembelajaran Khusus */}
        <div className="pt-4 border-t border-slate-100 space-y-2.5">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Tujuan Pembelajaran Khusus:
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700">
            {currentModule.learningObjectives.map((obj, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 leading-relaxed"
              >
                <span className="w-5 h-5 rounded-md bg-sky-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                  {idx + 1}
                </span>
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* =========================================================================
          3. INDIKATOR PROGRES LANGKAH (STEP PROGRESS)
         ========================================================================= */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-600 shrink-0" />
            <span className="text-sm font-extrabold text-slate-900">
              Langkah Pembelajaran {currentStepIndex + 1} dari {totalSteps}:
            </span>
            <span className="text-xs sm:text-sm font-medium text-slate-600 truncate max-w-xs sm:max-w-md">
              {currentStep.title}
            </span>
          </div>

          <span className="text-xs font-extrabold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200 self-start sm:self-auto">
            Progres: {progressPercent}%
          </span>
        </div>

        {/* Visual Progress Bar Track */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progres pembelajaran ${progressPercent}%`}
          />
        </div>

        {/* Pill Tombol Navigasi Cepat per Langkah */}
        <div className="pt-2 flex flex-wrap items-center gap-2">
          {currentModule.steps.map((st, idx) => {
            const isActive = idx === currentStepIndex;
            const isCompleted = idx < currentStepIndex;

            return (
              <button
                key={st.stepNumber}
                type="button"
                onClick={() => handleSelectStep(idx)}
                aria-label={`Langkah ${st.stepNumber}: ${st.title}`}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] cursor-pointer focus-visible:outline-2 focus-visible:outline-sky-500 ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-300'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                    : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                    {st.stepNumber}
                  </span>
                )}
                <span>Langkah {st.stepNumber}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          4. KONTEN LANGKAH AKTIF (Langkah Satu per Satu)
         ========================================================================= */}
      <section className="space-y-6 animate-in fade-in duration-200">
        {/* Header Langkah */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-sky-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs">
              {currentStep.stepNumber}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {currentStep.title}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl pl-10">
            {currentStep.summary}
          </p>
        </div>

        {/* Tiga Tab Representasi Johnstone (Makroskopik, Submikroskopik, Simbolik) */}
        <TripleRepTabs
          key={`${currentModule.id}-step-${currentStep.stepNumber}`}
          tripleRep={currentStep.tripleRep}
        />

        {/* Quick Check Formatif Per Langkah (Jika Ada) */}
        {currentStep.quickCheck && (
          <div className="pt-2">
            <QuickCheckCard
              key={`${currentModule.id}-qc-${currentStep.stepNumber}`}
              quickCheck={currentStep.quickCheck}
            />
          </div>
        )}

        {/* =========================================================================
            5. TOMBOL NAVIGASI LANGKAH (Sebelumnya / Lanjut)
           ========================================================================= */}
        <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-200">
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={currentStepIndex === 0}
            className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
              currentStepIndex === 0
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-300 hover:border-slate-400 cursor-pointer'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Langkah Sebelumnya</span>
          </button>

          {currentStepIndex < totalSteps - 1 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-extrabold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20 transition-all min-h-[44px] cursor-pointer"
            >
              <span>Lanjut ke Langkah {currentStepIndex + 2}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-300 px-4 py-3 rounded-xl min-h-[44px]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Seluruh langkah materi telah diselesaikan!</span>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          6. KARTU EVALUASI KUIS ASESMEN (Tetap Terpisah di Halaman Asesmen)
         ========================================================================= */}
      {currentModule.quiz && currentModule.quiz.length > 0 && (
        <section className="pt-4">
          <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border-2 border-sky-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
                <Award className="w-3.5 h-3.5" />
                <span>Evaluasi Akhir Modul {currentModule.moduleNumber}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Uji Penguasaan Konsep Mandiri
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
                Kerjakan {currentModule.quiz.filter((q) => q.type === 'multiple_choice').length} butir
                soal pilihan ganda di halaman <strong>Asesmen</strong> untuk menguji pemahaman konsep
                tiga representasi kimia dan mencatat rekam skor terbaik Anda.
              </p>
            </div>

            <Link
              to={`/asesmen?modul=${currentModule.id}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-md shadow-sky-600/20 transition-all min-h-[44px] shrink-0"
            >
              <span>Buka Kuis Asesmen Modul {currentModule.moduleNumber}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
