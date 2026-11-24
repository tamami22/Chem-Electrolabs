import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Lock,
  Unlock,
  KeyRound,
  ShieldAlert,
  FileSpreadsheet,
  Upload,
  FileText,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Trash2,
  RefreshCw,
  Search,
  UserCheck,
  Printer,
  Eye,
  EyeOff,
  Mail,
  LogIn,
} from 'lucide-react';
import { signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase.ts';
import { FIRESTORE_PROGRESS_COLLECTION } from '../lib/storage.ts';
import {
  verifyTeacherCode,
  calculateLockoutSeconds,
  exportRosterToCsv,
  calculateStudentAverage,
  type TeacherStudentRecord,
} from '../features/teacher/teacherUtils.ts';
import * as teacherStorage from '../features/teacher/teacherStorage.ts';
import {
  isTeacherSessionActive,
  setTeacherSessionActive,
  clearTeacherSession,
  getTeacherRoster,
  saveTeacherRoster,
  importQuizPayloadToRoster,
  syncLocalAttemptsToRoster,
  clearTeacherRoster,
} from '../features/teacher/teacherStorage.ts';

export default function TeacherModePage() {
  // Status Akses Terbuka / Terkunci (sessionStorage)
  const [isUnlocked, setIsUnlocked] = useState(() => isTeacherSessionActive());

  // State Form Login Email Guru (Firebase Auth)
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [showTeacherPassword, setShowTeacherPassword] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // State Form Kode Akses & Jeda Bertahap (Rate Limiting)
  const [accessCode, setAccessCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // State Firestore Loading & Error
  const [isLoadingFirestore, setIsLoadingFirestore] = useState(false);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);

  // State Data Roster Siswa
  const [roster, setRoster] = useState<TeacherStudentRecord[]>(() => getTeacherRoster());
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'name' | 'class' | 'average' | 'm1' | 'm2' | 'm3' | 'm4' | 'm5'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // State Dialog Impor Data
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Timer hitung mundur jika terjadi lockout kode akses
  useEffect(() => {
    if (lockoutSeconds > 0) {
      const timer = setInterval(() => {
        setLockoutSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockoutSeconds]);

  // Handler Pengambilan Data dari Firestore Koleksi progress
  const loadFirestoreData = useCallback(async () => {
    setIsLoadingFirestore(true);
    setFirestoreError(null);
    try {
      const records = await teacherStorage.getAllFirestoreProgress();
      setRoster(records);
      saveTeacherRoster(records); // Simpan cache lokal
    } catch (err: unknown) {
      console.error('[TeacherMode] Gagal memuat data dari Firestore:', err);
      if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'permission-denied') {
        setFirestoreError(
          'Akses ditolak (Permission Denied). Akun email ini tidak memiliki izin untuk membaca seluruh data progres siswa. Pastikan Anda masuk menggunakan akun email guru yang terdaftar pada aturan keamanan Firestore (firestore.rules).'
        );
      } else {
        setFirestoreError(
          'Tidak dapat menghubungkan ke koleksi Firestore (mungkin perangkat sedang offline). Menggunakan data cache lokal jika tersedia.'
        );
      }
      // Fallback ke penyimpanan lokal
      setRoster(getTeacherRoster());
    } finally {
      setIsLoadingFirestore(false);
    }
  }, []);

  // Ambil data progres dari Firestore saat sesi mode guru terbuka
  useEffect(() => {
    if (isUnlocked) {
      const timer = setTimeout(() => {
        void loadFirestoreData();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isUnlocked, loadFirestoreData]);

  // Handler Masuk Akun Guru via Firebase Auth (Email & Password)
  const handleTeacherEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherEmail.trim() || !teacherPassword) return;

    setIsAuthLoading(true);
    setAuthError('');

    try {
      if (!auth) {
        throw new Error('Firebase Auth belum terkonfigurasi. Pastikan variabel lingkungan .env sudah diisi.');
      }
      await signInWithEmailAndPassword(auth, teacherEmail.trim(), teacherPassword);
      setTeacherSessionActive();
      setIsUnlocked(true);
      setTeacherEmail('');
      setTeacherPassword('');
      void loadFirestoreData();
    } catch (err: unknown) {
      let msg = 'Gagal masuk akun guru. Periksa kembali email dan kata sandi Anda.';
      if (err && typeof err === 'object' && 'code' in err) {
        const code = (err as { code: string }).code;
        if (
          code === 'auth/user-not-found' ||
          code === 'auth/wrong-password' ||
          code === 'auth/invalid-credential'
        ) {
          msg = 'Email atau kata sandi guru tidak sesuai.';
        } else if (code === 'auth/invalid-email') {
          msg = 'Format alamat email tidak valid.';
        } else if (code === 'auth/network-request-failed') {
          msg = 'Koneksi jaringan terputus (offline). Silakan periksa jaringan internet Anda.';
        } else if (code === 'auth/too-many-requests') {
          msg = 'Terlalu banyak percobaan masuk yang gagal. Silakan coba sesaat lagi.';
        }
      }
      setAuthError(msg);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Handler Lupa Kata Sandi Guru via Firebase Auth
  const handleTeacherForgotPassword = async () => {
    setAuthError('');
    setResetSuccessMsg('');
    const email = teacherEmail.trim();
    if (!email || !email.includes('@')) {
      setAuthError('Silakan masukkan alamat email pendidik terlebih dahulu pada kolom email di atas.');
      return;
    }
    if (!auth) {
      setAuthError('Firebase Auth belum terkonfigurasi. Pastikan variabel lingkungan .env sudah diisi.');
      return;
    }
    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSuccessMsg(`Tautan reset kata sandi telah dikirim ke ${email}. Silakan periksa kotak masuk atau spam email Anda.`);
    } catch (err: unknown) {
      let msg = 'Gagal mengirim email reset kata sandi.';
      if (err && typeof err === 'object' && 'code' in err) {
        const code = (err as { code: string }).code;
        if (code === 'auth/user-not-found') {
          msg = 'Email pendidik tidak terdaftar dalam sistem.';
        } else if (code === 'auth/invalid-email') {
          msg = 'Format alamat email tidak valid.';
        } else if (code === 'auth/network-request-failed') {
          msg = 'Koneksi jaringan terputus (offline). Periksa koneksi internet Anda.';
        } else if (code === 'auth/too-many-requests') {
          msg = 'Terlalu banyak permintaan reset kata sandi. Silakan coba sesaat lagi.';
        }
      }
      setAuthError(msg);
    } finally {
      setIsResetting(false);
    }
  };

  // Handler Verifikasi Kode Akses Pendidik
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0 || !accessCode.trim()) return;

    setIsVerifying(true);
    setCodeError('');

    try {
      const isValid = await verifyTeacherCode(accessCode.trim());
      if (isValid) {
        setTeacherSessionActive();
        setIsUnlocked(true);
        setAccessCode('');
        setFailedAttempts(0);
        setRoster(getTeacherRoster());
      } else {
        const nextFailed = failedAttempts + 1;
        setFailedAttempts(nextFailed);
        const delay = calculateLockoutSeconds(nextFailed);

        if (delay > 0) {
          setLockoutSeconds(delay);
          setCodeError(`Kode akses salah. Terlalu banyak percobaan gagal. Silakan tunggu ${delay} detik.`);
        } else {
          setCodeError(`Kode akses salah. Sisa percobaan tanpa jeda: ${3 - nextFailed} kali.`);
        }
      }
    } catch {
      setCodeError('Terjadi kesalahan saat memproses verifikasi kriptografi.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Handler Mengunci Kembali & Logout
  const handleLockSession = async () => {
    clearTeacherSession();
    setIsUnlocked(false);
    setAccessCode('');
    setCodeError('');
    setAuthError('');
    if (auth && auth.currentUser) {
      try {
        await signOut(auth);
      } catch {
        // Abaikan error saat signOut
      }
    }
  };

  // Handler Impor Teks JSON
  const handleImportText = () => {
    if (!pasteText.trim()) return;
    const res = importQuizPayloadToRoster(pasteText.trim());
    if (res.success) {
      setImportStatus({ type: 'success', message: res.message });
      setPasteText('');
      setRoster(getTeacherRoster());
    } else {
      setImportStatus({ type: 'error', message: res.message });
    }
  };

  // Handler Impor Berkas File JSON
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const res = importQuizPayloadToRoster(content);
          if (res.success) {
            successCount++;
          } else {
            failCount++;
            errors.push(`${file.name}: ${res.message}`);
          }
        } catch {
          failCount++;
          errors.push(`${file.name}: Berkas tidak dapat dibaca.`);
        }

        const updated = getTeacherRoster();
        setRoster(updated);

        if (failCount === 0) {
          setImportStatus({
            type: 'success',
            message: `Berhasil mengimpor ${successCount} berkas hasil kuis.`,
          });
        } else {
          setImportStatus({
            type: 'error',
            message: `${successCount} berhasil, ${failCount} gagal (${errors.join('; ')}).`,
          });
        }
      };
      reader.readAsText(file);
    });
  };

  // Handler Sinkronisasi Hasil dari Penyimpanan Lokal Perangkat
  const handleSyncLocal = () => {
    const count = syncLocalAttemptsToRoster();
    setRoster(getTeacherRoster());
    setImportStatus({
      type: 'success',
      message: `Sinkronisasi selesai: ${count} percobaan dari peramban lokal telah dimasukkan ke rekap.`,
    });
  };

  // Handler Hapus Siswa Tertentu (hapus dari local dan Firestore jika ada uid)
  const handleDeleteStudent = async (indexToRemove: number) => {
    const target = roster[indexToRemove];
    if (!target) return;

    if (window.confirm(`Hapus baris data siswa "${target.studentName}" dari rekapitulasi kelas?`)) {
      if (target.uid && db) {
        try {
          await deleteDoc(doc(db, FIRESTORE_PROGRESS_COLLECTION, target.uid));
        } catch (err) {
          console.error(`[TeacherMode] Gagal menghapus dokumen progress/${target.uid} di Firestore:`, err);
        }
      }
      const updated = roster.filter((_, idx) => idx !== indexToRemove);
      saveTeacherRoster(updated);
      setRoster(updated);
    }
  };

  // Handler Bersihkan Seluruh Rekap
  const handleClearAllRoster = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus SELURUH tabel rekapitulasi nilai siswa?')) {
      clearTeacherRoster();
      setRoster([]);
    }
  };

  // Ekstraksi Daftar Kelas Unik untuk Opsi Filter
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    roster.forEach((s) => {
      if (s.className.trim()) set.add(s.className.trim());
    });
    return Array.from(set).sort();
  }, [roster]);

  // Penyaringan (Filter) dan Pengurutan (Sorting) Data Siswa
  const filteredAndSortedStudents = useMemo(() => {
    let result = [...roster];

    // Filter Kelas
    if (selectedClass !== 'all') {
      result = result.filter((s) => s.className.trim().toLowerCase() === selectedClass.trim().toLowerCase());
    }

    // Filter Pencarian Nama
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) => s.studentName.toLowerCase().includes(q) || s.className.toLowerCase().includes(q)
      );
    }

    // Pengurutan (Sort)
    result.sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      if (sortField === 'name') {
        valA = a.studentName.toLowerCase();
        valB = b.studentName.toLowerCase();
      } else if (sortField === 'class') {
        valA = a.className.toLowerCase();
        valB = b.className.toLowerCase();
      } else if (sortField === 'average') {
        valA = calculateStudentAverage(a) ?? -1;
        valB = calculateStudentAverage(b) ?? -1;
      } else {
        const modKey =
          sortField === 'm1'
            ? 'modul-1'
            : sortField === 'm2'
              ? 'modul-2'
              : sortField === 'm3'
                ? 'modul-3'
                : sortField === 'm4'
                  ? 'modul-4'
                  : 'modul-5';
        valA = a.moduleScores[modKey] ?? -1;
        valB = b.moduleScores[modKey] ?? -1;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [roster, selectedClass, searchQuery, sortField, sortDirection]);

  // Handler Ekspor CSV
  const handleExportCsv = () => {
    const csvContent = exportRosterToCsv(filteredAndSortedStudents);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = typeof URL.createObjectURL === 'function' ? URL.createObjectURL(blob) : '#';
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    const classTag = selectedClass === 'all' ? 'semua-kelas' : selectedClass.replace(/\s+/g, '_');
    a.download = `rekap-nilai-elektrokimia-${classTag}-${dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (typeof URL.revokeObjectURL === 'function') {
      URL.revokeObjectURL(url);
    }
  };

  const handleToggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Data Rubrik Pembelajaran untuk TP1-TP6
  const rubrics = [
    { tp: 'TP1', title: 'Rubrik Penilaian Konsep Redoks', kriteria: 'Ketepatan mengidentifikasi transfer elektron dan perubahan bilangan oksidasi.' },
    { tp: 'TP2', title: 'Rubrik Penilaian Sel Volta vs Elektrolisis', kriteria: 'Kemampuan membedakan arah energi, kutub elektrode, dan spontanitas reaksi.' },
    { tp: 'TP3', title: 'Rubrik Penilaian Sel Volta & Potensial Standar', kriteria: 'Akurasi penyusunan notasi sel dan perhitungan matematis E°sel standar.' },
    { tp: 'TP4', title: 'Rubrik Penilaian Sel Elektrolisis', kriteria: 'Ketepatan memprediksi reaksi katoda/anoda berdasarkan jenis elektrode dan anion.' },
    { tp: 'TP5', title: 'Rubrik Penilaian Hukum Faraday', kriteria: 'Penguasaan langkah stoikiometri elektrokimia (F, Q, dan mol elektron).' },
    { tp: 'TP6', title: 'Rubrik Penilaian Korosi & Proteksi', kriteria: 'Analisis faktor korosi dan evaluasi efektivitas metode perlindungan katodik.' },
  ];

  // =========================================================================
  // 1. TAMPILAN TERKUNCI: FORMULIR MASUK GURU (FIREBASE AUTH & KODE AKSES)
  // =========================================================================
  if (!isUnlocked) {
    return (
      <div className="py-12 max-w-md mx-auto space-y-6">
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-extrabold text-slate-900">Akses Mode Guru</h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              Masuk menggunakan akun email guru untuk mengakses rekapitulasi data progres siswa dari Firestore atau gunakan kode akses pendidik.
            </p>
          </div>

          {/* Form Masuk Akun Guru via Firebase Auth */}
          <form onSubmit={handleTeacherEmailLogin} className="space-y-4 text-left pt-2">
            <div className="space-y-1.5">
              <label htmlFor="teacher-email-input" className="block text-xs font-bold text-slate-700">
                Email Pendidik / Guru <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="teacher-email-input"
                  type="email"
                  required
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  placeholder="nama.guru@sekolah.sch.id"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[44px]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="teacher-password-input" className="block text-xs font-bold text-slate-700">
                  Kata Sandi Guru <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleTeacherForgotPassword}
                  disabled={isResetting}
                  className="text-[11px] text-purple-600 hover:text-purple-700 font-semibold hover:underline cursor-pointer"
                >
                  {isResetting ? 'Mengirim tautan...' : 'Lupa kata sandi?'}
                </button>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="teacher-password-input"
                  type={showTeacherPassword ? 'text' : 'password'}
                  required
                  value={teacherPassword}
                  onChange={(e) => setTeacherPassword(e.target.value)}
                  placeholder="Masukkan kata sandi guru"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={() => setShowTeacherPassword(!showTeacherPassword)}
                  aria-label={showTeacherPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 min-h-[32px] min-w-[32px] flex items-center justify-center cursor-pointer"
                >
                  {showTeacherPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5 leading-relaxed">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {resetSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{resetSuccessMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthLoading || !teacherEmail.trim() || !teacherPassword}
              className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-bold text-xs transition-all shadow-xs min-h-[44px] ${
                isAuthLoading || !teacherEmail.trim() || !teacherPassword
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-500 cursor-pointer'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>{isAuthLoading ? 'Memverifikasi Akun Guru...' : 'Masuk Akun Guru & Buka Dashboard'}</span>
            </button>
          </form>

          {/* Pemisah Antara Login Firebase Auth dan Akses Cepat */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200" />
            <span className="flex-shrink mx-4 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
              Atau Akses Cepat
            </span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          {/* Form Akses Cepat dengan Kode Akses Pendidik */}
          <form onSubmit={handleUnlock} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label htmlFor="teacher-access-code" className="block text-xs font-bold text-slate-700">
                Kode Akses Pendidik
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="teacher-access-code"
                  type="password"
                  disabled={lockoutSeconds > 0 || isVerifying}
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Masukkan kode akses guru"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[44px]"
                />
              </div>
            </div>

            {codeError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5 leading-relaxed">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{codeError}</span>
              </div>
            )}

            {lockoutSeconds > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 font-semibold">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-spin" />
                <span>Jeda keamanan aktif: {lockoutSeconds} detik tersisa</span>
              </div>
            )}

            <button
              type="submit"
              disabled={lockoutSeconds > 0 || isVerifying || !accessCode.trim()}
              className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-bold text-xs transition-all shadow-xs min-h-[44px] ${
                lockoutSeconds > 0 || isVerifying || !accessCode.trim()
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-700 hover:bg-slate-600 cursor-pointer'
              }`}
            >
              <Unlock className="w-4 h-4" />
              <span>{isVerifying ? 'Memverifikasi...' : 'Buka Mode Guru'}</span>
            </button>
          </form>
        </div>

        {/* Catatan Perlindungan Ringan Sisi Klien */}
        <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-200/80 text-slate-600 text-[11px] leading-relaxed flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-800">Catatan Perlindungan Ringan:</strong> Masuk menggunakan akun Firebase Auth guru untuk membaca data langsung dari Firestore secara online. Anda juga dapat menggunakan verifikasi hash kode akses untuk demonstrasi luring praktis di kelas.
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. TAMPILAN TERBUKA: DASHBOARD REKAPITULASI & PERANGKAT GURU
  // =========================================================================
  return (
    <div className="space-y-8 py-4">
      {/* Header Utama Mode Guru & Tombol Kunci */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
              <UserCheck className="w-3.5 h-3.5" />
              <span>
                {auth?.currentUser?.email
                  ? `Pendidik Terhubung: ${auth.currentUser.email}`
                  : 'Sesi Pendidik Aktif (sessionStorage)'}
              </span>
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              Sesi otomatis terkunci saat tab peramban ditutup
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Mode Guru: Rekapitulasi &amp; Instrumen Pembelajaran
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Kelola rekapitulasi nilai kuis mandiri siswa, baca data progres dari Firestore, ekspor laporan format CSV, dan akses rubrik pembelajaran kelas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleLockSession}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs border border-slate-200 hover:border-rose-300 transition-colors min-h-[44px] cursor-pointer"
          >
            <Lock className="w-4 h-4 text-slate-500" />
            <span>Kunci Mode Guru</span>
          </button>
        </div>
      </div>

      {/* Indikator Status Memuat Data Firestore */}
      {isLoadingFirestore && (
        <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 text-xs flex items-center gap-3">
          <RefreshCw className="w-4 h-4 text-sky-600 animate-spin shrink-0" />
          <span>
            <strong>Memuat Data Siswa:</strong> Sedang mengambil seluruh data progres kuis dan asesmen siswa dari Firestore...
          </span>
        </div>
      )}

      {/* Banner Pesan Akses Ditolak atau Error Firestore */}
      {firestoreError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-rose-950">Pemberitahuan Sinkronisasi Cloud:</div>
            <p className="leading-relaxed">{firestoreError}</p>
          </div>
        </div>
      )}

      {/* SECTION 1: TABEL REKAPITULASI NILAI SISWA */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
        {/* Bilah Aksi Utama: Segarkan Firestore, Impor, Ekspor CSV, Sinkronisasi Lokal */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-purple-600" />
              <span>Tabel Rekapitulasi Nilai Kuis (Siswa &times; Modul 1–5)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Menampilkan skor terbaik (best score) yang diraih setiap peserta per modul materi beserta jumlah percobaan (remedial).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={loadFirestoreData}
              disabled={isLoadingFirestore}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xs transition-colors min-h-[44px] cursor-pointer disabled:bg-purple-300"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingFirestore ? 'animate-spin' : ''}`} />
              <span>{isLoadingFirestore ? 'Memuat...' : 'Segarkan Data Firestore'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsImportOpen(!isImportOpen)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 shadow-xs transition-colors min-h-[44px] cursor-pointer"
            >
              <Upload className="w-4 h-4 text-purple-700" />
              <span>Impor Berkas/Kode</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              disabled={filteredAndSortedStudents.length === 0}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors min-h-[44px] ${
                filteredAndSortedStudents.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Rekap CSV</span>
            </button>

            <button
              type="button"
              onClick={handleSyncLocal}
              title="Tarik data hasil kuis yang tersimpan di peramban ini"
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors min-h-[44px] cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sinkronkan Lokal</span>
            </button>
          </div>
        </div>

        {/* Kotak Impor (Bisa Tempel Kode atau Unggah Berkas JSON) */}
        {isImportOpen && (
          <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-purple-950 flex items-center gap-2">
                <Upload className="w-4 h-4 text-purple-700" />
                <span>Impor Hasil Evaluasi Mandiri Siswa</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsImportOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-800 font-bold py-1 min-h-[32px] cursor-pointer"
              >
                Tutup
              </button>
            </div>

            {importStatus && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  importStatus.type === 'success'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-rose-100 text-rose-900 border border-rose-300'
                }`}
              >
                {importStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{importStatus.message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Opsi 1: Tempel Kode Hasil Teks JSON */}
              <div className="space-y-2 bg-white p-4 rounded-xl border border-purple-200/80">
                <span className="text-xs font-bold text-slate-800 block">
                  Cara 1: Tempel Kode Hasil Kuis Siswa
                </span>
                <p className="text-[11px] text-slate-500">
                  Tempel teks hasil yang disalin siswa dari tombol &ldquo;Salin Kode Hasil&rdquo;.
                </p>
                <textarea
                  rows={4}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder='Tempel kode JSON hasil di sini (dimulai dengan { "schemaVersion": 1, ... })'
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={handleImportText}
                  disabled={!pasteText.trim()}
                  className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs min-h-[44px] ${
                    pasteText.trim()
                      ? 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Proses Impor Teks</span>
                </button>
              </div>

              {/* Opsi 2: Unggah Berkas JSON */}
              <div className="space-y-2 bg-white p-4 rounded-xl border border-purple-200/80 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Cara 2: Unggah Berkas File (.json)
                  </span>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Pilih satu atau beberapa berkas .json yang diunduh siswa dari halaman asesmen.
                  </p>
                  <input
                    type="file"
                    accept=".json"
                    multiple
                    onChange={handleFileUpload}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 min-h-[44px] cursor-pointer"
                  />
                </div>
                <span className="text-[10px] text-slate-400 italic">
                  Mendukung pemilihan multi-file sekaligus (Ctrl / Shift + klik)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Filter & Kontrol Pencarian */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Kelas */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <label htmlFor="filter-class" className="font-bold text-slate-700">Kelas:</label>
              <select
                id="filter-class"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="py-2 px-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px]"
              >
                <option value="all">Semua Kelas ({roster.length} Siswa)</option>
                {availableClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Pencarian Nama Siswa */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama siswa..."
                className="pl-8 pr-3 py-2 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px]"
              />
            </div>
          </div>

          {roster.length > 0 && (
            <button
              type="button"
              onClick={handleClearAllRoster}
              className="text-rose-600 hover:text-rose-800 font-semibold text-xs inline-flex items-center gap-1 self-end sm:self-auto py-2 min-h-[44px] cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan Seluruh Rekap</span>
            </button>
          )}
        </div>

        {/* Tabel Data Rekapitulasi Siswa x Modul 1-5 */}
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 w-10 text-center">No</th>
                <th
                  onClick={() => handleToggleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Nama Siswa</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleToggleSort('class')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Kelas</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleToggleSort('m1')}
                  className="py-3 px-3 text-center cursor-pointer hover:bg-slate-100 transition-colors select-none"
                >
                  Modul 1
                </th>
                <th
                  onClick={() => handleToggleSort('m2')}
                  className="py-3 px-3 text-center cursor-pointer hover:bg-slate-100 transition-colors select-none"
                >
                  Modul 2
                </th>
                <th
                  onClick={() => handleToggleSort('m3')}
                  className="py-3 px-3 text-center cursor-pointer hover:bg-slate-100 transition-colors select-none"
                >
                  Modul 3
                </th>
                <th
                  onClick={() => handleToggleSort('m4')}
                  className="py-3 px-3 text-center cursor-pointer hover:bg-slate-100 transition-colors select-none"
                >
                  Modul 4
                </th>
                <th
                  onClick={() => handleToggleSort('m5')}
                  className="py-3 px-3 text-center cursor-pointer hover:bg-slate-100 transition-colors select-none"
                >
                  Modul 5
                </th>
                <th
                  onClick={() => handleToggleSort('average')}
                  className="py-3 px-3 text-center cursor-pointer hover:bg-slate-100 transition-colors select-none text-purple-900"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Rata-rata</span>
                    <ArrowUpDown className="w-3 h-3 text-purple-600" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center w-12">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAndSortedStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <FileSpreadsheet className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                    <p className="font-bold text-slate-700 text-sm">Belum ada data progres siswa di Firestore.</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      Data hasil kuis dan asesmen mandiri akan otomatis ditampilkan di sini setelah siswa masuk akun dan menyelesaikan kuis modul.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAndSortedStudents.map((student, idx) => {
                  const m1 = student.moduleScores['modul-1'];
                  const m2 = student.moduleScores['modul-2'];
                  const m3 = student.moduleScores['modul-3'];
                  const m4 = student.moduleScores['modul-4'];
                  const m5 = student.moduleScores['modul-5'];
                  const avg = calculateStudentAverage(student);

                  const renderScoreBadge = (score?: number, modKey?: string) => {
                    if (typeof score !== 'number') return <span className="text-slate-300">-</span>;
                    const passed = score >= 75;
                    const modAttempts = modKey && student.attempts
                      ? student.attempts.filter((a) => a.moduleId === modKey).length
                      : 0;

                    return (
                      <div className="inline-flex flex-col items-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md font-bold text-[11px] ${
                            passed
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                          title={passed ? 'Tuntas (>= 75%)' : 'Perlu Remedial (< 75%)'}
                        >
                          {score}%
                        </span>
                        {modAttempts > 1 && (
                          <span
                            className="text-[10px] text-purple-600 font-semibold"
                            title={`${modAttempts} kali pengerjaan (remedial)`}
                          >
                            ({modAttempts}x)
                          </span>
                        )}
                      </div>
                    );
                  };

                  return (
                    <tr key={`${student.studentName}-${student.className}-${student.uid || idx}`} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{student.studentName}</td>
                      <td className="py-3 px-3 text-slate-600">{student.className}</td>
                      <td className="py-3 px-3 text-center">{renderScoreBadge(m1, 'modul-1')}</td>
                      <td className="py-3 px-3 text-center">{renderScoreBadge(m2, 'modul-2')}</td>
                      <td className="py-3 px-3 text-center">{renderScoreBadge(m3, 'modul-3')}</td>
                      <td className="py-3 px-3 text-center">{renderScoreBadge(m4, 'modul-4')}</td>
                      <td className="py-3 px-3 text-center">{renderScoreBadge(m5, 'modul-5')}</td>
                      <td className="py-3 px-3 text-center font-extrabold text-purple-950">
                        {avg !== null ? (
                          <span
                            className={`px-2 py-0.5 rounded-lg ${
                              avg >= 75 ? 'bg-purple-100 text-purple-900' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {avg}%
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteStudent(idx)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg min-h-[36px] cursor-pointer"
                          title="Hapus baris siswa ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Baris Ringkasan Rata-rata Kelas */}
            {filteredAndSortedStudents.length > 0 && (
              <tfoot className="bg-slate-100/80 border-t-2 border-slate-300 font-bold text-slate-800">
                <tr>
                  <td colSpan={3} className="py-3 px-4 text-right uppercase tracking-wider text-[11px]">
                    Rata-rata Kelas:
                  </td>
                  {['modul-1', 'modul-2', 'modul-3', 'modul-4', 'modul-5'].map((mKey) => {
                    const scores = filteredAndSortedStudents
                      .map((s) => s.moduleScores[mKey])
                      .filter((val): val is number => typeof val === 'number');
                    const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '-';
                    return (
                      <td key={mKey} className="py-3 px-3 text-center font-extrabold text-slate-900 text-[11px]">
                        {avg !== '-' ? `${avg}%` : '-'}
                      </td>
                    );
                  })}
                  <td className="py-3 px-3 text-center font-extrabold text-purple-950 text-xs">
                    {(() => {
                      const all = filteredAndSortedStudents.flatMap((s) =>
                        Object.values(s.moduleScores).filter((v): v is number => typeof v === 'number')
                      );
                      return all.length > 0 ? `${(all.reduce((a, b) => a + b, 0) / all.length).toFixed(1)}%` : '-';
                    })()}
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* SECTION 2: PERANGKAT AJAR, RUBRIK TP, & LKPD (Konten Standar Guru) */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600" />
          <span>Rubrik Penilaian Berbasis Tujuan Pembelajaran (TP1–TP6)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rubrics.map((r) => (
            <div key={r.tp} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700">
                  {r.tp}
                </span>
                <CheckCircle2 className="w-4 h-4 text-purple-500" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">{r.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{r.kriteria}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Unduh Lembar Kerja Siswa (LKPD) */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl space-y-4">
        <div className="max-w-2xl space-y-2">
          <h2 className="text-lg font-bold text-white">Unduh Instrumen &amp; Lembar Kerja Siswa (LKPD)</h2>
          <p className="text-xs text-slate-200 leading-relaxed">
            Format lembar kerja terstruktur yang dirancang khusus untuk memandu siswa mencatat data makroskopik, menggambarkan model submikroskopik, dan merumuskan persamaan reaksi simbolik.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors min-h-[44px] cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh LKPD Sel Daniell (Modul 2)</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 transition-colors min-h-[44px] cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Panduan Praktikum Virtual</span>
          </button>
        </div>
      </div>
    </div>
  );
}
