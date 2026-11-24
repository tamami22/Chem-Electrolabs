import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { QuizQuestion } from '../../content/types.ts';
import { prepareShuffledQuestion, isAnswerCorrect, calculateQuizScore } from './quizUtils.ts';
import { generateQuizExportPayload, type QuizAttemptRecord } from '../../lib/storage.ts';
import { useStudentStore } from '../../stores/useStudentStore.ts';
import FormattedText from '../ui/FormattedText.tsx';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Award,
  Layers,
  ChevronRight,
  ArrowLeft,
  LayoutGrid,
  BookOpen,
  UserCheck,
  Copy,
  Check,
  Download,
  Code,
  User,
  GraduationCap,
  Edit2,
} from 'lucide-react';

export interface QuizPlayerProps {
  questions: QuizQuestion[];
  title?: string;
  moduleTitle?: string;
  moduleSlug?: string;
  moduleId?: string;
  onFinish?: (score: number, total: number, percentage: number) => void;
  onBackToList?: () => void;
  className?: string;
}

interface QuestionState {
  selectedShuffledIndex: number | null;
  isChecked: boolean;
  isCorrect: boolean;
  shuffledOptions: string[];
  newCorrectAnswer: number;
}

export default function QuizPlayer({
  questions,
  title = 'Cek Pemahaman (Kuis Pilihan Ganda)',
  moduleTitle,
  moduleSlug,
  moduleId,
  onFinish,
  onBackToList,
  className = '',
}: QuizPlayerProps) {
  // Zustand Store Identitas & Riwayat Siswa
  const { studentName, className: studentClass, setProfile, recordAttempt } = useStudentStore();

  // State Form Identitas Sebelum Kuis
  const [inputName, setInputName] = useState(studentName);
  const [inputClass, setInputClass] = useState(studentClass);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // State Alur Kuis
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attemptId, setAttemptId] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [lastAttempt, setLastAttempt] = useState<QuizAttemptRecord | null>(null);

  // State Interaksi Ekspor Hasil
  const [copied, setCopied] = useState(false);
  const [showJsonPreview, setShowJsonPreview] = useState(false);

  // Filter hanya soal pilihan ganda (tipe lain di task berikutnya sesuai PRD)
  const mcQuestions = useMemo(() => {
    return questions.filter((q) => q.type === 'multiple_choice' && q.options && q.options.length > 0);
  }, [questions]);

  // Siapkan data opsi yang diacak untuk seluruh soal secara deterministik per attempt
  const shuffledDataList = useMemo(() => {
    return mcQuestions.map((q) => {
      const rawCorrect =
        typeof q.correctAnswer === 'number'
          ? q.correctAnswer
          : typeof q.correctIndex === 'number'
            ? q.correctIndex
            : 0;
      return prepareShuffledQuestion(q.options || [], rawCorrect);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mcQuestions, attemptId]);

  // Simpan riwayat interaksi pengguna per butir soal
  const [answersState, setAnswersState] = useState<Record<number, QuestionState>>({});

  const currentQuestion = mcQuestions[currentIndex];
  const currentShuffled = shuffledDataList[currentIndex];

  const currentAnswer = answersState[currentIndex] || {
    selectedShuffledIndex: null,
    isChecked: false,
    isCorrect: false,
    shuffledOptions: currentShuffled ? currentShuffled.shuffledOptions : [],
    newCorrectAnswer: currentShuffled ? currentShuffled.newCorrectAnswer : 0,
  };

  const handleSelectOption = (shuffledIdx: number) => {
    if (currentAnswer.isChecked) return;
    setAnswersState((prev) => ({
      ...prev,
      [currentIndex]: {
        ...currentAnswer,
        selectedShuffledIndex: shuffledIdx,
        shuffledOptions: currentShuffled.shuffledOptions,
        newCorrectAnswer: currentShuffled.newCorrectAnswer,
      },
    }));
  };

  const handleCheckAnswer = () => {
    if (currentAnswer.selectedShuffledIndex === null || currentAnswer.isChecked) return;

    const correct = isAnswerCorrect(
      currentAnswer.selectedShuffledIndex,
      currentShuffled.newCorrectAnswer
    );

    setAnswersState((prev) => ({
      ...prev,
      [currentIndex]: {
        ...currentAnswer,
        isChecked: true,
        isCorrect: correct,
        shuffledOptions: currentShuffled.shuffledOptions,
        newCorrectAnswer: currentShuffled.newCorrectAnswer,
      },
    }));
  };

  const handleNext = () => {
    if (currentIndex < mcQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Selesai kuis: kalkulasi skor, simpan record percobaan & skor terbaik
      setIsCompleted(true);
      const results = mcQuestions.map((_, idx) => answersState[idx]?.isCorrect ?? false);
      const score = calculateQuizScore(results);

      const attempt = recordAttempt({
        moduleId: moduleId || 'general',
        score: score.correct,
        total: score.total,
        percent: score.percentage,
      });

      setLastAttempt(attempt);

      if (onFinish) {
        onFinish(score.correct, score.total, score.percentage);
      }
    }
  };

  const handleRestart = () => {
    setAnswersState({});
    setCurrentIndex(0);
    setIsCompleted(false);
    setCopied(false);
    setShowJsonPreview(false);
    setAttemptId((prev) => prev + 1);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim() || !inputClass.trim()) return;
    setProfile(inputName.trim(), inputClass.trim());
    setIsEditingProfile(false);
  };

  // Hitung skor akhir jika telah selesai
  const scoreSummary = useMemo(() => {
    if (!isCompleted) return null;
    const results = mcQuestions.map((_, idx) => answersState[idx]?.isCorrect ?? false);
    return calculateQuizScore(results);
  }, [isCompleted, mcQuestions, answersState]);

  // Siapkan payload ekspor JSON berformat tetap dan berversi (schemaVersion: 1)
  const exportPayload = useMemo(() => {
    if (!lastAttempt) return null;
    return generateQuizExportPayload(lastAttempt, moduleTitle);
  }, [lastAttempt, moduleTitle]);

  const handleCopyCode = async () => {
    if (!exportPayload) return;
    const payloadString = JSON.stringify(exportPayload, null, 2);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(payloadString);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = payloadString;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3500);
    } catch {
      // Abaikan error
    }
  };

  const handleDownloadJson = () => {
    if (!exportPayload) return;
    const payloadString = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([payloadString], { type: 'application/json' });
    const url = typeof URL.createObjectURL === 'function' ? URL.createObjectURL(blob) : '#';
    const a = document.createElement('a');
    a.href = url;
    const safeName = (studentName || 'siswa').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeModule = (moduleId || 'modul').replace(/[^a-zA-Z0-9_-]/g, '_');
    a.download = `hasil-kuis-${safeModule}-${safeName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (typeof URL.revokeObjectURL === 'function') {
      URL.revokeObjectURL(url);
    }
  };

  // 1. TAMPILAN FORMULIR IDENTITAS SEBELUM KUIS DIMULAI (Jika belum diisi atau sedang diedit)
  const isProfileMissing = !studentName.trim() || !studentClass.trim();
  if (isProfileMissing || isEditingProfile) {
    return (
      <div className={`bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 ${className}`}>
        {onBackToList && (
          <div>
            <button
              type="button"
              onClick={onBackToList}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-sky-600 transition-colors py-2 min-h-[44px] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Daftar Kuis</span>
            </button>
          </div>
        )}

        <div className="space-y-2 text-center max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto shadow-xs">
            <UserCheck className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {isEditingProfile ? 'Ubah Identitas Siswa' : 'Identitas Siswa Sebelum Kuis'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Data nama dan kelas akan disimpan di peramban ini dan dicantumkan pada kode hasil serta unduhan berkas evaluasi.
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="max-w-md mx-auto space-y-4 pt-2">
          <div className="space-y-1.5">
            <label htmlFor="student-name-input" className="block text-xs font-bold text-slate-700">
              Nama Lengkap Siswa <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="student-name-input"
                type="text"
                required
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="Contoh: Ahmad Fauzi / Siti Rahmawati"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 min-h-[44px]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="student-class-input" className="block text-xs font-bold text-slate-700">
              Kelas / Rombel <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="student-class-input"
                type="text"
                required
                value={inputClass}
                onChange={(e) => setInputClass(e.target.value)}
                placeholder="Contoh: XII MIPA 1 / XII Kimia 2"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 min-h-[44px]"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            {isEditingProfile && (
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="w-full sm:w-1/2 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors min-h-[44px] cursor-pointer"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              disabled={!inputName.trim() || !inputClass.trim()}
              className={`w-full ${isEditingProfile ? 'sm:w-1/2' : ''} inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-xs transition-all shadow-xs min-h-[44px] ${
                inputName.trim() && inputClass.trim()
                  ? 'bg-sky-600 hover:bg-sky-500 cursor-pointer'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>{isEditingProfile ? 'Simpan Perubahan' : 'Mulai Kerjakan Kuis'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (mcQuestions.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-sm text-slate-500 space-y-4">
        <p>Belum ada butir soal pilihan ganda yang tersedia untuk modul ini.</p>
        {onBackToList && (
          <button
            type="button"
            onClick={onBackToList}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs min-h-[44px] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Kuis</span>
          </button>
        )}
      </div>
    );
  }

  // 2. TAMPILAN RINGKASAN SKOR & EKSPOR HASIL DI AKHIR KUIS
  if (isCompleted && scoreSummary) {
    return (
      <div className={`bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 ${className}`}>
        {/* Tombol Navigasi Kembali ke Daftar Kuis (Atas) */}
        {onBackToList && (
          <div>
            <button
              type="button"
              onClick={onBackToList}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-sky-600 transition-colors py-2 min-h-[44px] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Daftar Kuis</span>
            </button>
          </div>
        )}

        {/* Header Ringkasan & Identitas Siswa */}
        <div className="text-center space-y-3">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-sm ${
              scoreSummary.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900">Ringkasan Hasil Evaluasi Kuis</h2>
            {moduleTitle && <p className="text-xs text-slate-500 font-medium">{moduleTitle}</p>}
          </div>

          {/* Badge Identitas Peserta */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-800">
            <UserCheck className="w-4 h-4 text-sky-600" />
            <span>
              Peserta: <strong>{studentName}</strong> &bull; Kelas: <strong>{studentClass}</strong>
            </span>
          </div>

          {/* Kartu Skor Utama */}
          <div className="flex items-center justify-center gap-4 bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl max-w-sm mx-auto">
            <div className="text-center">
              <span className="block text-3xl sm:text-4xl font-extrabold text-slate-900">
                {scoreSummary.percentage}%
              </span>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Nilai Akhir
              </span>
            </div>
            <div className="h-8 w-px bg-slate-300" />
            <div className="text-center">
              <span className="block text-2xl sm:text-3xl font-extrabold text-sky-700">
                {scoreSummary.correct} <span className="text-base text-slate-400 font-semibold">/ {scoreSummary.total}</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Benar
              </span>
            </div>
          </div>

          {/* Pesan Kualitatif Evaluasi (Ikon + Teks, Bukan Warna Saja) */}
          <div
            className={`p-4 rounded-xl text-xs sm:text-sm font-semibold max-w-lg mx-auto leading-relaxed ${
              scoreSummary.passed
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-amber-50 text-amber-900 border border-amber-200'
            }`}
          >
            {scoreSummary.passed ? (
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Selamat! Anda telah menguasai konsep pada modul ini dengan tuntas (≥75%).</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Masih ada konsep yang perlu diperdalam (&lt;75%). Pelajari kembali materi dan coba ulangi kuis.</span>
              </div>
            )}
          </div>
        </div>

        {/* SECTION EKSPOR & DOKUMENTASI HASIL (Salin Kode & Unduh JSON) */}
        <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                <Download className="w-4 h-4 text-indigo-600" />
                <span>Kirim &amp; Dokumentasi Hasil Kuis ke Guru</span>
              </h3>
              <p className="text-xs text-indigo-900/80 leading-relaxed mt-0.5">
                Salin kode teks hasil atau unduh berkas JSON (schemaVersion: 1) untuk diserahkan kepada guru.
              </p>
            </div>
          </div>

          {/* Tombol Aksi Ekspor Hasil */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCopyCode}
              className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs transition-all shadow-xs min-h-[44px] cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white hover:bg-slate-50 text-indigo-900 border border-indigo-300'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 text-indigo-600" />}
              <span>{copied ? 'Kode Hasil Tersalin ke Clipboard!' : 'Salin Kode Hasil'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadJson}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-xs min-h-[44px] cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh File Hasil (.json)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowJsonPreview(!showJsonPreview)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl text-indigo-700 hover:text-indigo-900 font-semibold text-xs min-h-[44px] cursor-pointer"
            >
              <Code className="w-4 h-4" />
              <span>{showJsonPreview ? 'Sembunyikan Payload' : 'Lihat Format JSON'}</span>
            </button>
          </div>

          {/* Pratinjau JSON Payload jika dibuka */}
          {showJsonPreview && exportPayload && (
            <div className="pt-2">
              <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto max-h-60 leading-relaxed border border-slate-700">
                {JSON.stringify(exportPayload, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Rincian Jawaban Per Butir Soal */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Tinjauan Butir Soal &amp; Pembahasan Konsep:</h3>
          <div className="space-y-3">
            {mcQuestions.map((q, idx) => {
              const state = answersState[idx];
              const isQCorrect = state?.isCorrect ?? false;
              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    isQCorrect ? 'bg-slate-50/60 border-emerald-200' : 'bg-rose-50/40 border-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-700">
                      Soal {idx + 1} &bull; {q.tpCode} ({q.tripleRepLevel})
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[10px] ${
                        isQCorrect
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isQCorrect ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Benar
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" /> Salah
                        </>
                      )}
                    </span>
                  </div>

                  <div className="text-slate-900 font-medium leading-relaxed">
                    <FormattedText text={q.question} />
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-slate-200/80 text-slate-700 leading-relaxed text-[11px]">
                    <strong className="text-slate-900">Ulasan Konsep: </strong>
                    <FormattedText text={q.explanation} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tombol Aksi Akhir: Ulangi, Kembali ke Daftar Kuis, dan Tautan ke Materi */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-6 border-t border-slate-100">
          {/* Tombol Ulangi Kuis */}
          <button
            type="button"
            onClick={handleRestart}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors shadow-xs min-h-[44px] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Ulangi Kuis</span>
          </button>

          {/* Tombol Kembali ke Daftar Kuis */}
          {onBackToList ? (
            <button
              type="button"
              onClick={onBackToList}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors border border-slate-200 min-h-[44px] cursor-pointer"
            >
              <LayoutGrid className="w-4 h-4 text-slate-600" />
              <span>Kembali ke Daftar Kuis</span>
            </button>
          ) : (
            <Link
              to="/asesmen"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors border border-slate-200 min-h-[44px]"
            >
              <LayoutGrid className="w-4 h-4 text-slate-600" />
              <span>Kembali ke Daftar Kuis</span>
            </Link>
          )}

          {/* Tautan ke Materi Modul Terkait */}
          {moduleSlug && (
            <Link
              to={`/modul/${moduleSlug}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors border border-indigo-200 min-h-[44px]"
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Pelajari Materi Modul</span>
            </Link>
          )}
        </div>
      </div>
    );
  }

  // 3. TAMPILAN PERTANYAAN KUIS (SOAL DEMI SOAL)
  const optionLetters = ['A', 'B', 'C', 'D', 'E'];
  const progressPercent = Math.round(((currentIndex + 1) / mcQuestions.length) * 100);

  return (
    <div
      className={`bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-xs space-y-6 ${className}`}
      aria-labelledby="quiz-player-heading"
    >
      {/* Baris Navigasi Kembali & Identitas Siswa */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-slate-100">
        {onBackToList ? (
          <button
            type="button"
            onClick={onBackToList}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-sky-600 transition-colors py-1.5 min-h-[44px] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Kuis</span>
          </button>
        ) : <div />}

        {/* Identitas Siswa yang sedang aktif dengan tombol Ubah */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
          <UserCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          <span>
            <strong>{studentName}</strong> ({studentClass})
          </span>
          <button
            type="button"
            onClick={() => {
              setInputName(studentName);
              setInputClass(studentClass);
              setIsEditingProfile(true);
            }}
            className="text-sky-600 hover:text-sky-800 font-bold text-[11px] underline ml-1 inline-flex items-center gap-0.5 cursor-pointer py-1"
          >
            <Edit2 className="w-3 h-3" />
            <span>Ganti</span>
          </button>
        </div>
      </div>

      {/* Header & Progress Bar */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block">
              {title}
            </span>
            <h2 id="quiz-player-heading" className="text-base font-bold text-slate-900">
              Soal {currentIndex + 1} dari {mcQuestions.length}
            </h2>
          </div>

          {/* Badges Kode TP & Tingkat Representasi */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="px-2.5 py-1 rounded-md font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {currentQuestion.tpCode}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold bg-slate-100 text-slate-700 capitalize">
              <Layers className="w-3 h-3 text-slate-500" />
              {currentQuestion.tripleRepLevel}
            </span>
          </div>
        </div>

        {/* Progress bar visual */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Teks Pertanyaan (dengan dukungan LaTeX MathFormula) */}
      <div className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed pt-1">
        <FormattedText text={currentQuestion.question} />
      </div>

      {/* Opsi Pilihan Ganda (Accessible Radio Group) */}
      <div
        role="radiogroup"
        aria-label="Pilihan jawaban kuis"
        className="space-y-3"
      >
        {currentAnswer.shuffledOptions.map((option, index) => {
          const letter = optionLetters[index] || `${index + 1}`;
          const isSelected = currentAnswer.selectedShuffledIndex === index;
          const isThisCorrect = currentAnswer.newCorrectAnswer === index;

          let optionStyle = 'border-slate-200 hover:border-sky-300 hover:bg-slate-50/80 text-slate-800';
          let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';

          if (isSelected && !currentAnswer.isChecked) {
            optionStyle = 'border-sky-500 bg-sky-50/70 text-sky-950 ring-2 ring-sky-200 font-medium';
            badgeStyle = 'bg-sky-600 text-white border-sky-600';
          } else if (currentAnswer.isChecked) {
            if (isThisCorrect) {
              optionStyle = 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-medium ring-2 ring-emerald-200';
              badgeStyle = 'bg-emerald-600 text-white border-emerald-600';
            } else if (isSelected && !isThisCorrect) {
              optionStyle = 'border-rose-400 bg-rose-50/80 text-rose-950 ring-2 ring-rose-200';
              badgeStyle = 'bg-rose-600 text-white border-rose-600';
            } else {
              optionStyle = 'opacity-40 border-slate-200 bg-white text-slate-400';
            }
          }

          return (
            <button
              key={index}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={currentAnswer.isChecked}
              onClick={() => handleSelectOption(index)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  handleSelectOption(index);
                }
              }}
              className={`w-full flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl border text-left text-xs sm:text-sm transition-all min-h-[44px] cursor-pointer focus-visible:outline-2 focus-visible:outline-sky-500 ${optionStyle}`}
            >
              {/* Huruf Opsi A, B, C, D */}
              <span
                className={`w-7 h-7 rounded-lg text-xs font-bold border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${badgeStyle}`}
              >
                {letter}
              </span>

              {/* Teks Pilihan */}
              <div className="flex-1 leading-relaxed pt-0.5">
                <FormattedText text={option} />
              </div>

              {/* Ikon Indikator Status Hasil */}
              {currentAnswer.isChecked && isThisCorrect && (
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs shrink-0 self-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">Kunci Benar</span>
                </div>
              )}
              {currentAnswer.isChecked && isSelected && !isThisCorrect && (
                <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs shrink-0 self-center">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span className="hidden sm:inline">Jawaban Anda</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Tombol Periksa / Umpan Balik / Lanjut */}
      {!currentAnswer.isChecked ? (
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            disabled={currentAnswer.selectedShuffledIndex === null}
            onClick={handleCheckAnswer}
            className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
              currentAnswer.selectedShuffledIndex !== null
                ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-xs cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Periksa Jawaban</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-4 pt-2">
          {/* Banner Umpan Balik Mendalam */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border text-xs sm:text-sm leading-relaxed ${
              currentAnswer.isCorrect
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-rose-50 border-rose-300 text-rose-950'
            }`}
          >
            <div className="flex items-center gap-2 font-bold mb-2">
              {currentAnswer.isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-emerald-900 text-sm">Hebat, Jawaban Anda Tepat!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span className="text-rose-900 text-sm">Jawaban Belum Tepat. Simak Ulasan Berikut:</span>
                </>
              )}
            </div>
            <div className="text-slate-800 text-xs sm:text-sm leading-relaxed pt-1 pl-7">
              <FormattedText text={currentQuestion.explanation} />
            </div>
          </div>

          {/* Tombol Lanjut ke Soal Berikutnya */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors shadow-xs min-h-[44px] cursor-pointer"
            >
              <span>
                {currentIndex < mcQuestions.length - 1 ? 'Lanjut ke Soal Berikutnya' : 'Lihat Hasil & Skor Kuis'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
