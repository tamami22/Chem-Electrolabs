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

export default function StudentEntryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    studentName,
    className,
    email,
    isLoading,
    enterSession,
    clearProfile,
    loginWithEmail,
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

  // Form Lupa Kata Sandi
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Form Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Form Register (Nama, Kelas, Email, Password, Konfirmasi Password)
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

  // Submit Login Akun
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    const res = await loginWithEmail(cleanedEmail, loginPassword);
    if (!res.success) {
      setError(res.error || 'Gagal masuk akun.');
      return;
    }

    navigate(fromPath, { replace: true });
  };

  // Submit Lupa Kata Sandi (Kirim Email Reset)
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetSuccess(null);

    const cleanedEmail = forgotEmail.trim();
    if (!cleanedEmail || !cleanedEmail.includes('@')) {
      setError('Silakan masukkan alamat email yang valid.');
      return;
    }

    setIsResetting(true);
    const res = await sendPasswordReset(cleanedEmail);
    setIsResetting(false);

    if (res.success) {
      setResetSuccess(
        `Tautan pemulihan kata sandi telah dikirim ke ${cleanedEmail}. Silakan periksa kotak masuk (inbox) atau folder spam email Anda.`
      );
    } else {
      setError(res.error || 'Gagal mengirim email pemulihan kata sandi.');
    }
  };

  // Submit Pendaftaran Akun Baru (Nama, Kelas, Email, Password)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Validasi Nama Siswa
    const cleanedName = regName.trim().replace(/\s+/g, ' ');
    if (!cleanedName || cleanedName.length < 2) {
      setError('Nama lengkap wajib diisi minimal 2 karakter.');
      return;
    }
    if (!/[a-zA-Z]/.test(cleanedName)) {
      setError('Nama lengkap harus mengandung huruf alfabet.');
      return;
    }

    // 2. Validasi Kelas
    if (!selectedClass) {
      setError('Silakan pilih kelas Anda.');
      return;
    }
    const finalClass =
      selectedClass === 'Lainnya'
        ? customClass.trim().replace(/\s+/g, ' ')
        : selectedClass;

    if (selectedClass === 'Lainnya' && (!finalClass || finalClass.length < 2)) {
      setError('Silakan tuliskan nama kelas Anda.');
      return;
    }

    // 3. Validasi Email & Password
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

    // Eksekusi Pendaftaran via Firebase Auth & Simpan di Firestore progress/{uid}
    const res = await registerWithEmail(cleanedEmail, regPassword, {
      studentName: cleanedName,
      className: finalClass,
    });

    if (!res.success) {
      setError(res.error || 'Gagal mendaftar akun.');
      return;
    }

    navigate(fromPath, { replace: true });
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-6 px-4 sm:px-6">
      <div className="w-full max-w-lg bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden">
        {/* Header Header Aksen Biru */}
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

        {/* Konten Halaman */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Tampilan 1: Sudah Ada Sesi / Data Tersimpan */}
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

              {/* Tombol Aksi */}
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
            /* Tampilan 2: Langsung Form Login atau Daftar (Tanpa Tab) */
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Header Form */}
              <div className="space-y-1 text-left">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  {isForgotMode
                    ? 'Lupa Kata Sandi'
                    : isRegisterMode
                    ? 'Daftar Akun Siswa'
                    : 'Masuk Akun Siswa'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {isForgotMode
                    ? 'Masukkan alamat email Anda untuk menerima tautan pemulihan kata sandi.'
                    : isRegisterMode
                    ? 'Daftarkan akun baru Anda untuk menyimpan riwayat belajar, simulasi, dan nilai kuis di cloud Firestore.'
                    : 'Masuk dengan email dan kata sandi Anda untuk mengakses materi pembelajaran.'}
                </p>
              </div>

              {/* Kotak Pesan Error */}
              {error && (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in"
                >
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              {/* Kotak Pesan Sukses Reset */}
              {resetSuccess && (
                <div
                  role="status"
                  className="p-3.5 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 text-xs sm:text-sm font-semibold flex items-start gap-2.5 animate-in fade-in"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="leading-relaxed">{resetSuccess}</span>
                </div>
              )}

              {/* Form Mode: Forgot vs Register vs Login */}
              {isForgotMode ? (
                /* 0. FORM LUPA KATA SANDI */
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
                    disabled={isResetting}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-extrabold text-sm bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/20 transition-all min-h-[44px] cursor-pointer disabled:opacity-60"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isResetting ? 'Mengirim Tautan...' : 'Kirim Tautan Pemulihan Kata Sandi'}</span>
                  </button>

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
              ) : !isRegisterMode ? (
                /* 1. FORM LOGIN DENGAN FIREBASE AUTH */
                <form onSubmit={handleLoginSubmit} noValidate className="space-y-4 text-left">
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
                    disabled={isLoading}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-extrabold text-sm bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/20 transition-all min-h-[44px] cursor-pointer disabled:opacity-60"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{isLoading ? 'Memeriksa Akun...' : 'Masuk Akun Siswa'}</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>

                  {/* Opsi Switch ke Form Pendaftaran */}
                  <div className="text-center pt-2">
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
              ) : (
                /* 2. FORM DAFTAR AKUN BARU (NAMA, KELAS, EMAIL, PASSWORD) */
                <form onSubmit={handleRegisterSubmit} noValidate className="space-y-4 text-left">
                  {/* Nama Lengkap Siswa */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="register-name"
                      className="block text-xs sm:text-sm font-bold text-slate-800"
                    >
                      Nama Lengkap Siswa <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="register-name"
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => {
                          setRegName(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="Contoh: Siti Rahmawati / Ahmad Fauzi"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:border-sky-500 focus:outline-none min-h-[44px]"
                      />
                    </div>
                  </div>

                  {/* Kelas / Rombel */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="register-class"
                      className="block text-xs sm:text-sm font-bold text-slate-800"
                    >
                      Kelas / Rombel <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        id="register-class"
                        required
                        value={selectedClass}
                        onChange={(e) => {
                          setSelectedClass(e.target.value);
                          if (error) setError(null);
                        }}
                        className="w-full pl-10 pr-8 py-3 rounded-xl border-2 border-slate-300 text-slate-900 text-xs sm:text-sm focus:border-sky-500 focus:outline-none min-h-[44px] bg-white cursor-pointer"
                      >
                        <option value="" disabled>
                          -- Pilih Kelas XII --
                        </option>
                        {CLASS_OPTIONS.map((cls) => (
                          <option key={cls} value={cls}>
                            {cls}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Jika memilih Lainnya */}
                    {selectedClass === 'Lainnya' && (
                      <div className="pt-2 space-y-1">
                        <label
                          htmlFor="register-custom-class"
                          className="block text-xs font-semibold text-slate-700"
                        >
                          Tuliskan Nama Kelas Lainnya <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="register-custom-class"
                          type="text"
                          required
                          value={customClass}
                          onChange={(e) => {
                            setCustomClass(e.target.value);
                            if (error) setError(null);
                          }}
                          placeholder="Contoh: XII MIPA 9 / XII Kimia 3"
                          className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:border-sky-500 focus:outline-none min-h-[44px]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Alamat Email */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="register-email"
                      className="block text-xs sm:text-sm font-bold text-slate-800"
                    >
                      Alamat Email Siswa <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="register-email"
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => {
                          setRegEmail(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="nama@sekolah.sch.id"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:border-sky-500 focus:outline-none min-h-[44px]"
                      />
                    </div>
                  </div>

                  {/* Kata Sandi */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="register-password"
                      className="block text-xs sm:text-sm font-bold text-slate-800"
                    >
                      Kata Sandi <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="register-password"
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => {
                          setRegPassword(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="Minimal 6 karakter"
                        className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:border-sky-500 focus:outline-none min-h-[44px]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 cursor-pointer"
                        aria-label={showRegPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                      >
                        {showRegPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Konfirmasi Kata Sandi */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="register-confirm-password"
                      className="block text-xs sm:text-sm font-bold text-slate-800"
                    >
                      Konfirmasi Kata Sandi <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="register-confirm-password"
                        type={showRegConfirmPassword ? 'text' : 'password'}
                        required
                        value={regConfirmPassword}
                        onChange={(e) => {
                          setRegConfirmPassword(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="Ulangi kata sandi"
                        className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:border-sky-500 focus:outline-none min-h-[44px]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 cursor-pointer"
                        aria-label={showRegConfirmPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                      >
                        {showRegConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Tombol Submit Daftar */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-extrabold text-sm bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/20 transition-all min-h-[44px] cursor-pointer disabled:opacity-60"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isLoading ? 'Mendaftarkan Akun...' : 'Daftar & Mulai Belajar'}</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>

                  {/* Opsi Kembali ke Login */}
                  <div className="text-center pt-2">
                    <p className="text-xs text-slate-600">
                      Sudah punya akun?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setIsRegisterMode(false);
                          setError(null);
                        }}
                        className="font-bold text-sky-600 hover:text-sky-700 underline cursor-pointer p-1"
                      >
                        Masuk di sini
                      </button>
                    </p>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Footer Card: Info & Tautan Akses Guru */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {isFirebaseConfigured
                  ? 'Disimpan di Firestore (progress/{uid}) & LocalStorage.'
                  : 'Penyimpanan lokal perangkat aktif (Offline Fallback).'}
              </span>
            </div>

            {/* Tautan Masuk Guru */}
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
