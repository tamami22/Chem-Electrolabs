import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Compass,
  User,
  GraduationCap,
  AlertCircle,
  ArrowRight,
  UserCheck,
  RefreshCw,
  Lock,
  ShieldCheck,
  Mail,
  KeyRound,
  LogIn,
  UserPlus,
  Cloud,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft,
  Send,
  Loader2,
} from 'lucide-react';
import { useStudentStore } from '../stores/useStudentStore.ts';
import { isFirebaseConfigured } from '../lib/firebase.ts';

const CLASS_OPTIONS = [
  'XII-1',
  'XII-2',
  'XII-3',
  'XII-4',
  'XII-5',
  'XII-6',
  'XII-7',
  'XII-8',
  'Lainnya',
];

// Komponen SVG logo Google
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function StudentEntryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    uid,
    studentName,
    className,
    email,
    setProfile,
    enterSession,
    leaveSession,
    clearProfile,
    loginWithEmail,
    loginWithGoogle,
    registerWithEmail,
    sendPasswordReset,
  } = useStudentStore();

  const fromPath =
    (location.state as { from?: { pathname?: string } })?.from?.pathname || '/';

  const hasSavedProfile = Boolean(studentName?.trim() && className?.trim());

  // Status tampilan
  const [isEditing, setIsEditing] = useState(!hasSavedProfile);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [isGoogleCompleteMode, setIsGoogleCompleteMode] = useState(
    Boolean(uid && email && !className?.trim())
  );

  // State loading lokal (tidak bergantung pada store.isLoading)
  const [isBusy, setIsBusy] = useState(false);

  // Form Lupa Kata Sandi
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  // Form Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Form Register
  const [regName, setRegName] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [customClass, setCustomClass] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Lanjutkan dengan sesi tersimpan
  const handleContinueAsSaved = () => {
    enterSession();
    navigate(fromPath, { replace: true });
  };

  // Login dengan Google
  const handleGoogleLogin = async () => {
    if (isBusy) return;
    setError(null);
    setIsBusy(true);
    try {
      const res = await loginWithGoogle();
      if (!res.success) {
        setError(res.error || 'Gagal masuk dengan Google.');
        return;
      }
      if (res.needsClass) {
        const googleName = useStudentStore.getState().studentName;
        if (googleName && !regName.trim()) {
          setRegName(googleName);
        }
        setIsGoogleCompleteMode(true);
        setIsRegisterMode(false);
        setIsEditing(true);
      } else {
        navigate(fromPath, { replace: true });
      }
    } catch (err: unknown) {
      // Tampilkan pesan error spesifik dari Firebase
      let msg = 'Terjadi kesalahan saat masuk dengan Google.';
      if (err && typeof err === 'object' && 'code' in err) {
        const code = (err as { code: string }).code;
        if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
          msg = 'Jendela masuk Google ditutup. Silakan coba lagi.';
        } else if (code === 'auth/popup-blocked') {
          msg = 'Popup Google diblokir browser. Izinkan popup untuk situs ini lalu coba lagi.';
        } else if (code === 'auth/network-request-failed') {
          msg = 'Koneksi internet terputus. Periksa jaringan Anda dan coba lagi.';
        } else if (code === 'auth/operation-not-allowed') {
          msg = 'Login Google belum diaktifkan. Aktifkan Google Sign-In di Firebase Console → Authentication → Sign-in method.';
        } else if (code === 'auth/unauthorized-domain') {
          msg = 'Domain ini belum diizinkan di Firebase. Tambahkan "localhost" di Firebase Console → Authentication → Settings → Authorized domains.';
        } else {
          msg = `Gagal masuk dengan Google (${code}). Silakan coba lagi.`;
        }
      } else if (err instanceof Error) {
        msg = `Gagal masuk dengan Google: ${err.message}`;
      }
      setError(msg);
    } finally {
      setIsBusy(false);
    }
  };

  // Submit Login Email
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBusy) return;
    setError(null);

    const cleanedEmail = loginEmail.trim();
    if (!cleanedEmail || !cleanedEmail.includes('@')) {
      setError('Silakan masukkan alamat email yang valid.');
      return;
    }
    if (!loginPassword) {
      setError('Silakan masukkan kata sandi akun Anda.');
      return;
    }

    setIsBusy(true);
    try {
      const res = await loginWithEmail(cleanedEmail, loginPassword);
      if (!res.success) {
        setError(res.error || 'Gagal masuk akun.');
        return;
      }
      navigate(fromPath, { replace: true });
    } finally {
      setIsBusy(false);
    }
  };

  // Submit Lupa Kata Sandi
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBusy) return;
    setError(null);
    setResetSuccess(null);

    const cleanedEmail = forgotEmail.trim();
    if (!cleanedEmail || !cleanedEmail.includes('@')) {
      setError('Silakan masukkan alamat email yang valid.');
      return;
    }

    setIsBusy(true);
    try {
      const res = await sendPasswordReset(cleanedEmail);
      if (res.success) {
        setResetSuccess(
          `Tautan pemulihan kata sandi telah dikirim ke ${cleanedEmail}. Silakan periksa kotak masuk (inbox) atau folder spam email Anda.`
        );
      } else {
        setError(res.error || 'Gagal mengirim email pemulihan kata sandi.');
      }
    } finally {
      setIsBusy(false);
    }
  };

  const validateNameAndClass = () => {
    const cleanedName = regName.trim().replace(/\s+/g, ' ');
    if (!cleanedName || cleanedName.length < 2) {
      setError('Nama lengkap wajib diisi minimal 2 karakter.');
      return null;
    }
    if (!/[a-zA-Z]/.test(cleanedName)) {
      setError('Nama lengkap harus mengandung huruf alfabet.');
      return null;
    }

    if (!selectedClass) {
      setError('Silakan pilih kelas Anda.');
      return null;
    }
    const finalClass =
      selectedClass === 'Lainnya'
        ? customClass.trim().replace(/\s+/g, ' ')
        : selectedClass;

    if (selectedClass === 'Lainnya' && (!finalClass || finalClass.length < 2)) {
      setError('Silakan tuliskan nama kelas Anda.');
      return null;
    }
    return { cleanedName, finalClass };
  };

  // Lengkapi profil setelah login Google pertama kali
  const handleGoogleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBusy) return;
    setError(null);
    const validated = validateNameAndClass();
    if (!validated) return;
    setProfile(validated.cleanedName, validated.finalClass);
    setIsGoogleCompleteMode(false);
    navigate(fromPath, { replace: true });
  };

  // Submit Pendaftaran Akun Baru
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBusy) return;
    setError(null);

    const validated = validateNameAndClass();
    if (!validated) return;

    const cleanedEmail = regEmail.trim();
    if (!cleanedEmail || !cleanedEmail.includes('@')) {
      setError('Silakan masukkan alamat email yang valid.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setError('Kata sandi minimal 6 karakter.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsBusy(true);
    try {
      const res = await registerWithEmail(cleanedEmail, regPassword, {
        studentName: validated.cleanedName,
        className: validated.finalClass,
      });
      if (!res.success) {
        setError(res.error || 'Gagal mendaftar akun.');
        return;
      }
      navigate(fromPath, { replace: true });
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-6 px-4 sm:px-6">
      <div className="w-full max-w-lg bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-44 h-44 bg-sky-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="w-14 h-14 rounded-2xl bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Compass className="w-7 h-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Chem-ElectroLabs
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-sm mx-auto">
            Media Pembelajaran Elektrokimia Tiga Representasi Kimia SMA
          </p>
        </div>

        {/* Konten */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Tampilan 1: Ada Sesi Tersimpan */}
          {hasSavedProfile && !isEditing ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sky-800 text-xs font-extrabold uppercase tracking-wider">
                    <UserCheck className="w-4 h-4 text-sky-600" />
                    <span>Sesi Akun Siswa Aktif</span>
                  </div>
                  {email && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <Cloud className="w-3 h-3 text-emerald-600" />
                      <span>Cloud Sync</span>
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="text-lg sm:text-xl font-extrabold text-slate-900">
                    {studentName}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 font-medium flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-white border border-sky-200 font-bold text-sky-900">
                      Kelas: {className}
                    </span>
                    {email && (
                      <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-medium text-slate-600 text-xs">
                        {email}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-500 pt-1 border-t border-sky-100">
                  Data dan evaluasi kuis Anda tersimpan dan tersinkronisasi di database Firestore.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleContinueAsSaved}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-white font-extrabold text-sm sm:text-base bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/20 transition-all min-h-[48px] cursor-pointer"
                >
                  <UserCheck className="w-5 h-5" />
                  <span>Lanjutkan sebagai {studentName}</span>
                  <ArrowRight className="w-5 h-5 ml-1" />
                </button>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(true);
                      setIsRegisterMode(false);
                      setError(null);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all min-h-[44px] cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                    <span>Ganti Akun / Masuk Akun Lain</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      clearProfile();
                      setIsEditing(true);
                      setIsRegisterMode(false);
                    }}
                    className="text-xs font-medium text-rose-600 hover:text-rose-700 underline py-2 min-h-[44px] flex items-center cursor-pointer"
                  >
                    Hapus data tersimpan
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Tampilan 2: Form Login / Register */
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Judul Form */}
              <div className="space-y-1 text-left">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  {isForgotMode
                    ? 'Lupa Kata Sandi'
                    : isGoogleCompleteMode
                    ? 'Lengkapi Data Siswa'
                    : isRegisterMode
                    ? 'Daftar Akun Siswa'
                    : 'Masuk Akun Siswa'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {isForgotMode
                    ? 'Masukkan alamat email Anda untuk menerima tautan pemulihan kata sandi.'
                    : isGoogleCompleteMode
                    ? `Akun Google (${email || 'terhubung'}) berhasil masuk. Lengkapi nama dan kelas Anda untuk melanjutkan.`
                    : isRegisterMode
                    ? 'Daftarkan akun baru Anda untuk menyimpan riwayat belajar, simulasi, dan nilai kuis di cloud Firestore.'
                    : 'Masuk dengan akun Google atau email dan kata sandi Anda.'}
                </p>
              </div>

              {/* Pesan Error */}
              {error && (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in"
                >
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              {/* Pesan Sukses Reset */}
              {resetSuccess && (
                <div
                  role="status"
                  className="p-3.5 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 text-xs sm:text-sm font-semibold flex items-start gap-2.5 animate-in fade-in"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="leading-relaxed">{resetSuccess}</span>
                </div>
              )}

              {/* ===== FORM LUPA KATA SANDI ===== */}
              {isForgotMode ? (
                <form onSubmit={handleForgotSubmit} noValidate className="space-y-4 text-left">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="student-forgot-email"
                      className="block text-xs sm:text-sm font-bold text-slate-800"
                    >
                      Alamat Email Akun Siswa <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="student-forgot-email"
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => {
                          setForgotEmail(e.target.value);
                          if (error) setError(null);
                          if (resetSuccess) setResetSuccess(null);
                        }}
                        placeholder="nama@sekolah.sch.id"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:border-sky-500 focus:outline-none min-h-[44px]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isBusy}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-extrabold text-sm bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/20 transition-all min-h-[44px] cursor-pointer disabled:opacity-60"
                  >
                    {isBusy ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>{isBusy ? 'Mengirim Tautan...' : 'Kirim Tautan Pemulihan Kata Sandi'}</span>
                  </button>

                  <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-left space-y-1">
                    <p className="text-[11px] font-bold text-sky-900">Tips Penting:</p>
                    <p className="text-[11px] text-sky-800 leading-relaxed">
                      Tautan reset hanya berlaku <strong>satu kali</strong>. Jika Anda mengirim permintaan lebih dari sekali, tautan lama otomatis kedaluwarsa—pastikan membuka tautan dari <strong>email paling terakhir</strong> yang masuk.
                    </p>
                  </div>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotMode(false);
                        setError(null);
                        setResetSuccess(null);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 cursor-pointer min-h-[44px]"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Kembali ke Halaman Masuk</span>
                    </button>
                  </div>
                </form>

              ) : isGoogleCompleteMode ? (
                /* ===== LENGKAPI PROFIL GOOGLE ===== */
                <form onSubmit={handleGoogleCompleteSubmit} noValidate className="space-y-4 text-left">
                  <div className="space-y-1.5">
                    <label htmlFor="register-name" className="block text-xs sm:text-sm font-bold text-slate-800">
                      Nama Lengkap Siswa <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="register-name"
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => { setRegName(e.target.value); if (error) setError(null); }}
                        placeholder="Contoh: Siti Rahmawati / Ahmad Fauzi"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:border-sky-500 focus:outline-none min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="register-class" className="block text-xs sm:text-sm font-bold text-slate-800">
                      Kelas / Rombel <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        id="register-class"
                        required
                        value={selectedClass}
                        onChange={(e) => { setSelectedClass(e.target.value); if (error) setError(null); }}
                        className="w-full pl-10 pr-8 py-3 rounded-xl border-2 border-slate-300 text-slate-900 text-xs sm:text-sm focus:border-sky-500 focus:outline-none min-h-[44px] bg-white cursor-pointer"
                      >
                        <option value="" disabled>-- Pilih Kelas XII --</option>
                        {CLASS_OPTIONS.map((cls) => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>
                    {selectedClass === 'Lainnya' && (
                      <div className="pt-2 space-y-1">
                        <label htmlFor="register-custom-class" className="block text-xs font-semibold text-slate-700">
                          Tuliskan Nama Kelas Lainnya <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="register-custom-class"
                          type="text"
                          required
                          value={customClass}
                          onChange={(e) => { setCustomClass(e.target.value); if (error) setError(null); }}
                          placeholder="Contoh: XII MIPA 9 / XII Kimia 3"
                          className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:border-sky-500 focus:outline-none min-h-[44px]"
                        />
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isBusy}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-extrabold text-sm bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/20 transition-all min-h-[44px] cursor-pointer disabled:opacity-60"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simpan &amp; Masuk</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        leaveSession();
                        setIsGoogleCompleteMode(false);
                        setError(null);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 underline cursor-pointer p-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Gunakan akun lain</span>
                    </button>
                  </div>
                </form>

              ) : !isRegisterMode ? (
                /* ===== FORM LOGIN ===== */
                <div className="space-y-4 text-left">
                  {/* Tombol Google */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isBusy}
                    className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm bg-white hover:bg-gray-50 border-2 border-slate-200 hover:border-slate-300 text-slate-700 shadow-sm transition-all min-h-[44px] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isBusy ? (
                      <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                    ) : (
                      <GoogleIcon className="w-5 h-5" />
                    )}
                    <span>{isBusy ? 'Memproses...' : 'Masuk dengan Google'}</span>
                  </button>

                  {/* Pembatas */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap">atau masuk dengan email</span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  {/* Form email/password */}
                  <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="student-login-email"
                        className="block text-xs sm:text-sm font-bold text-slate-800"
                      >
                        Alamat Email Siswa <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="student-login-email"
                          type="email"
                          required
                          value={loginEmail}
                          onChange={(e) => {
                            setLoginEmail(e.target.value);
                            if (error) setError(null);
                          }}
                          placeholder="nama@sekolah.sch.id"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:border-sky-500 focus:outline-none min-h-[44px]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="student-login-password"
                          className="block text-xs sm:text-sm font-bold text-slate-800"
                        >
                          Kata Sandi <span className="text-rose-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotMode(true);
                            setForgotEmail(loginEmail);
                            setError(null);
                            setResetSuccess(null);
                          }}
                          className="text-xs text-sky-600 hover:text-sky-700 font-semibold hover:underline cursor-pointer"
                        >
                          Lupa kata sandi?
                        </button>
                      </div>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="student-login-password"
                          type={showLoginPassword ? 'text' : 'password'}
                          required
                          value={loginPassword}
                          onChange={(e) => {
                            setLoginPassword(e.target.value);
                            if (error) setError(null);
                          }}
                          placeholder="Masukkan kata sandi"
                          className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:border-sky-500 focus:outline-none min-h-[44px]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 cursor-pointer"
                          aria-label={showLoginPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                        >
                          {showLoginPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isBusy}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-extrabold text-sm bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/20 transition-all min-h-[44px] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isBusy ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <LogIn className="w-4 h-4" />
                      )}
                      <span>{isBusy ? 'Memeriksa Akun...' : 'Masuk Akun Siswa'}</span>
                      {!isBusy && <ArrowRight className="w-4 h-4 ml-1" />}
                    </button>

                    <div className="text-center pt-1">
                      <p className="text-xs text-slate-600">
                        Belum punya akun?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setIsRegisterMode(true);
                            setError(null);
                          }}
                          className="font-bold text-sky-600 hover:text-sky-700 underline cursor-pointer p-1"
                        >
                          Daftar di sini
                        </button>
                      </p>
                    </div>
                  </form>
                </div>

              ) : (
                /* ===== FORM DAFTAR ===== */
                <div className="space-y-4 text-left">
                  {/* Tombol Google */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isBusy}
                    className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm bg-white hover:bg-gray-50 border-2 border-slate-200 hover:border-slate-300 text-slate-700 shadow-sm transition-all min-h-[44px] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isBusy ? (
                      <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                    ) : (
                      <GoogleIcon className="w-5 h-5" />
                    )}
                    <span>{isBusy ? 'Memproses...' : 'Daftar dengan Google'}</span>
                  </button>

                  {/* Pembatas */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap">atau daftar dengan email</span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  <form onSubmit={handleRegisterSubmit} noValidate className="space-y-4">
                    {/* Nama Lengkap */}
                    <div className="space-y-1.5">
                      <label htmlFor="register-name" className="block text-xs sm:text-sm font-bold text-slate-800">
                        Nama Lengkap Siswa <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="register-name"
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => { setRegName(e.target.value); if (error) setError(null); }}
                          placeholder="Contoh: Siti Rahmawati / Ahmad Fauzi"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:border-sky-500 focus:outline-none min-h-[44px]"
                        />
                      </div>
                    </div>

                    {/* Kelas */}
                    <div className="space-y-1.5">
                      <label htmlFor="register-class" className="block text-xs sm:text-sm font-bold text-slate-800">
                        Kelas / Rombel <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select
                          id="register-class"
                          required
                          value={selectedClass}
                          onChange={(e) => { setSelectedClass(e.target.value); if (error) setError(null); }}
                          className="w-full pl-10 pr-8 py-3 rounded-xl border-2 border-slate-300 text-slate-900 text-xs sm:text-sm focus:border-sky-500 focus:outline-none min-h-[44px] bg-white cursor-pointer"
                        >
                          <option value="" disabled>-- Pilih Kelas XII --</option>
                          {CLASS_OPTIONS.map((cls) => (
                            <option key={cls} value={cls}>{cls}</option>
                          ))}
                        </select>
                      </div>
                      {selectedClass === 'Lainnya' && (
                        <div className="pt-2 space-y-1">
                          <label htmlFor="register-custom-class" className="block text-xs font-semibold text-slate-700">
                            Tuliskan Nama Kelas Lainnya <span className="text-rose-500">*</span>
                          </label>
                          <input
                            id="register-custom-class"
                            type="text"
                            required
                            value={customClass}
                            onChange={(e) => { setCustomClass(e.target.value); if (error) setError(null); }}
                            placeholder="Contoh: XII MIPA 9 / XII Kimia 3"
                            className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:border-sky-500 focus:outline-none min-h-[44px]"
                          />
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label htmlFor="register-email" className="block text-xs sm:text-sm font-bold text-slate-800">
                        Alamat Email Siswa <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="register-email"
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => { setRegEmail(e.target.value); if (error) setError(null); }}
                          placeholder="nama@sekolah.sch.id"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:border-sky-500 focus:outline-none min-h-[44px]"
                        />
                      </div>
                    </div>

                    {/* Kata Sandi */}
                    <div className="space-y-1.5">
                      <label htmlFor="register-password" className="block text-xs sm:text-sm font-bold text-slate-800">
                        Kata Sandi <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="register-password"
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          value={regPassword}
                          onChange={(e) => { setRegPassword(e.target.value); if (error) setError(null); }}
                          placeholder="Minimal 6 karakter"
                          className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:border-sky-500 focus:outline-none min-h-[44px]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 cursor-pointer"
                          aria-label={showRegPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                        >
                          {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Konfirmasi Kata Sandi */}
                    <div className="space-y-1.5">
                      <label htmlFor="register-confirm-password" className="block text-xs sm:text-sm font-bold text-slate-800">
                        Konfirmasi Kata Sandi <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="register-confirm-password"
                          type={showRegConfirmPassword ? 'text' : 'password'}
                          required
                          value={regConfirmPassword}
                          onChange={(e) => { setRegConfirmPassword(e.target.value); if (error) setError(null); }}
                          placeholder="Ulangi kata sandi"
                          className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:border-sky-500 focus:outline-none min-h-[44px]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegConfirmPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 cursor-pointer"
                          aria-label={showRegConfirmPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                        >
                          {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isBusy}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-extrabold text-sm bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/20 transition-all min-h-[44px] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isBusy ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UserPlus className="w-4 h-4" />
                      )}
                      <span>{isBusy ? 'Mendaftarkan Akun...' : 'Daftar & Mulai Belajar'}</span>
                      {!isBusy && <ArrowRight className="w-4 h-4 ml-1" />}
                    </button>

                    <div className="text-center pt-1">
                      <p className="text-xs text-slate-600">
                        Sudah punya akun?{' '}
                        <button
                          type="button"
                          onClick={() => { setIsRegisterMode(false); setError(null); }}
                          className="font-bold text-sky-600 hover:text-sky-700 underline cursor-pointer p-1"
                        >
                          Masuk di sini
                        </button>
                      </p>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {isFirebaseConfigured
                  ? 'Disimpan di Firestore (progress/{uid}) & LocalStorage.'
                  : 'Penyimpanan lokal perangkat aktif (Offline Fallback).'}
              </span>
            </div>

            <Link
              to="/guru"
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-sky-700 font-bold py-2 px-2 hover:bg-slate-100 rounded-lg transition-colors min-h-[44px]"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Akses Guru &rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
