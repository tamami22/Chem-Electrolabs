import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { modules } from '../content/index.ts';
import { getBestQuizScore } from '../lib/storage.ts';
import { useStudentStore } from '../stores/useStudentStore.ts';
import QuizPlayer from '../components/quiz/QuizPlayer.tsx';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  BookOpen,
  ArrowRight,
  Layers,
  Sparkles,
  Info,
  UserCheck,
} from 'lucide-react';

export default function AssessmentPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [refreshKey, setRefreshKey] = useState(0);
  const { studentName, className: studentClass } = useStudentStore();

  const modulParam = searchParams.get('modul');

  // Cari modul yang aktif bila ada parameter di URL (?modul=modul-1 atau ?modul=1-redoks)
  const activeModule = useMemo(() => {
    if (!modulParam) return null;
    return modules.find((m) => m.id === modulParam || m.slug === modulParam) || null;
  }, [modulParam]);

  // Handler saat kuis diselesaikan, memicu update tampilan skor terbaik
  const handleQuizFinish = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleBackToList = () => {
    setSearchParams({});
  };

  // TAMPILAN 1: PENGERJAAN KUIS MODUL TERTENTU
  if (activeModule) {
    return (
      <div className="space-y-6 py-4 max-w-4xl mx-auto">
        {/* Breadcrumb Navigasi */}
        <nav aria-label="Breadcrumb" className="text-xs text-slate-500 flex items-center gap-2">
          <button
            type="button"
            onClick={handleBackToList}
            className="hover:text-sky-600 transition-colors font-semibold cursor-pointer py-1"
          >
            Daftar Kuis Asesmen
          </button>
          <span>/</span>
          <span className="text-slate-900 font-bold">
            Modul {activeModule.moduleNumber}: {activeModule.title}
          </span>
        </nav>

        {/* Player Kuis Interaktif */}
        <QuizPlayer
          questions={activeModule.quiz}
          title={`Kuis Pemahaman Modul ${activeModule.moduleNumber}`}
          moduleTitle={activeModule.title}
          moduleId={activeModule.id}
          moduleSlug={activeModule.slug}
          onBackToList={handleBackToList}
          onFinish={handleQuizFinish}
        />
      </div>
    );
  }

  // TAMPILAN 2: DAFTAR 5 KARTU KUIS PER MODUL
  return (
    <div className="space-y-8 py-4">
      {/* Header Halaman Asesmen */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800">
          <Award className="w-3.5 h-3.5" />
          <span>Asesmen &amp; Evaluasi Pemahaman Mandiri</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Kuis Diagnostik Elektrokimia Berbasis TP1–TP6
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          Uji pemahaman konsep elektrokimia Anda dalam tiga representasi (makroskopik, submikroskopik, dan simbolik).
          Pilih modul di bawah untuk memulai kuis. Opsi pilihan akan diacak secara dinamis dan skor terbaik Anda akan tersimpan otomatis.
        </p>

        {studentName && studentClass && (
          <div className="pt-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-800">
              <UserCheck className="w-4 h-4 text-sky-600" />
              <span>
                Peserta Aktif: <strong>{studentName}</strong> &bull; Kelas {studentClass}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Grid 5 Kartu Kuis Modul (Mobile-First) */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        key={refreshKey}
      >
        {modules.map((mod) => {
          const mcQuestions = mod.quiz.filter((q) => q.type === 'multiple_choice');
          const bestScore = getBestQuizScore(mod.id);

          return (
            <div
              key={mod.id}
              className="bg-white border border-slate-200 hover:border-sky-300 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5"
            >
              {/* Bagian Atas: Badges & Judul */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-sky-100 text-sky-800">
                      Modul {mod.moduleNumber}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                      <Layers className="w-3 h-3" />
                      {mod.tpCodes.join(', ')}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                    <Clock className="w-3 h-3" />
                    {mod.estimatedMinutes} mnt
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {mod.title}
                  </h2>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {mod.subtitle}
                  </p>
                </div>
              </div>

              {/* Bagian Tengah: Rincian Soal & Status Skor Terbaik */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Jumlah Soal Pilihan Ganda:</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-800">
                    {mcQuestions.length} Soal
                  </span>
                </div>

                {/* Status Skor Terbaik Jika Ada (Bukan Hanya Mengandalkan Warna) */}
                <div
                  className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
                    bestScore
                      ? bestScore.passed
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                        : 'bg-amber-50/80 border-amber-200 text-amber-950'
                      : 'bg-slate-50 border-slate-200/80 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {bestScore ? (
                      bestScore.passed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                      )
                    ) : (
                      <HelpCircle className="w-5 h-5 text-slate-400 shrink-0" />
                    )}

                    <div>
                      {bestScore ? (
                        <>
                          <div className="font-bold flex items-center gap-1.5">
                            <span>Skor Terbaik: {bestScore.score}%</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                                bestScore.passed
                                  ? 'bg-emerald-200 text-emerald-900'
                                  : 'bg-amber-200 text-amber-900'
                              }`}
                            >
                              {bestScore.passed ? 'Lulus' : 'Perlu Pengayaan'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 block">
                            Tuntas ≥75% &bull; {bestScore.attemptsCount}x percobaan
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="font-bold text-slate-700 block">Belum Dikerjakan</span>
                          <span className="text-[10px] text-slate-500 block">
                            Ambang batas kelulusan: 75%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bagian Bawah: Tombol Aksi (Minimal 44px, Aksesibel Keyboard) */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => setSearchParams({ modul: mod.id })}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs transition-colors min-h-[44px] cursor-pointer focus-visible:outline-2 focus-visible:outline-sky-500"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{bestScore ? 'Ulangi Kuis Modul' : 'Mulai Kuis Modul'}</span>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </button>

                <div className="text-center">
                  <Link
                    to={`/modul/${mod.slug}`}
                    className="inline-flex items-center justify-center gap-1.5 text-xs text-slate-600 hover:text-sky-600 font-semibold py-2 transition-colors min-h-[44px]"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Pelajari Materi Terlebih Dahulu</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Kotak Petunjuk & Standar Kuis */}
      <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-5 sm:p-6 space-y-2 text-xs text-sky-950">
        <div className="flex items-center gap-2 font-bold text-sm text-sky-900">
          <Info className="w-4 h-4 text-sky-600 shrink-0" />
          <span>Panduan Pelaksanaan Asesmen Mandiri</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-slate-700 leading-relaxed pl-1">
          <li>Setiap soal kuis menguji penguasaan satu atau lebih dari Tiga Representasi Kimia (makroskopik, submikroskopik, simbolik).</li>
          <li>Urutan pilihan jawaban (A, B, C, D) diacak secara dinamis setiap kali kuis dimulai tanpa mengubah kunci jawaban ilmiah.</li>
          <li>Umpan balik konsep mendalam langsung disajikan setelah Anda menekan tombol <strong>Periksa Jawaban</strong>.</li>
          <li>Skor terbaik tersimpan di peramban Anda (localStorage) dan dapat diulang sewaktu-waktu untuk pengayaan pemahaman.</li>
        </ul>
      </div>
    </div>
  );
}
