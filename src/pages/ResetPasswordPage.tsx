import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  KeyRound,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Send,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import {
  verifyPasswordResetCode,
  confirmPasswordReset,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../lib/firebase.ts';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();

  // Parameter dari URL Firebase Auth
  const oobCode = searchParams.get('oobCode');

  // Status halaman: 'verifying' | 'ready' | 'invalid' | 'success' | 'request'
  const [status, setStatus] = useState<'verifying' | 'ready' | 'invalid' | 'success' | 'request'>(
    oobCode ? 'verifying' : 'request'
  );

  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form minta tautan baru jika kedaluwarsa
  const [requestEmail, setRequestEmail] = useState('');
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verifikasi oobCode saat pertama kali dimuat
  useEffect(() => {
    if (!oobCode) {
      setStatus('request');
      return;
    }

    let isMounted = true;

    async function checkCode() {
      if (!auth) {
        if (isMounted) {
          setError('Firebase Auth belum terkonfigurasi. Pastikan variabel lingkungan .env sudah diisi.');
          setStatus('invalid');
        }
        return;
      }

      try {
        const email = await verifyPasswordResetCode(auth, oobCode!);
        if (isMounted) {
          setVerifiedEmail(email);
          setStatus('ready');
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          let msg = 'Tautan reset kata sandi tidak valid atau sudah kedaluwarsa.';
          if (err && typeof err === 'object' && 'code' in err) {
            const code = (err as { code: string }).code;
            if (code === 'auth/expired-action-code') {
              msg = 'Tautan reset kata sandi telah kedaluwarsa. Tautan hanya berlaku 1 jam.';
            } else if (code === 'auth/invalid-action-code') {
              msg = 'Tautan reset kata sandi tidak valid atau sudah pernah digunakan sebelumnya.';
            }
          }
          setError(msg);
          setStatus('invalid');
        }
      }
    }

    void checkCode();

    return () => {
      isMounted = false;
    };
  }, [oobCode]);

  // Submit Kata Sandi Baru
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || newPassword.length < 6) {
      setError('Kata sandi baru minimal harus 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (!auth || !oobCode) {
      setError('Kode otorisasi tidak ditemukan.');
      return;
    }

    setIsLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setStatus('success');
      setError(null);
    } catch (err: unknown) {
      let msg = 'Gagal memperbarui kata sandi. Silakan coba kembali.';
      if (err && typeof err === 'object' && 'code' in err) {
        const code = (err as { code: string }).code;
        if (code === 'auth/expired-action-code') {
          msg = 'Tautan telah kedaluwarsa saat memproses. Silakan minta tautan baru.';
          setStatus('invalid');
        } else if (code === 'auth/invalid-action-code') {
          msg = 'Tautan tidak valid atau sudah pernah digunakan.';
          setStatus('invalid');
        } else if (code === 'auth/weak-password') {
          msg = 'Kata sandi terlalu lemah. Gunakan kombinasi huruf dan angka.';
        }
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Minta Tautan Baru
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRequestSuccess(null);

    const email = requestEmail.trim();
    if (!email || !email.includes('@')) {
      setError('Silakan masukkan alamat email yang valid.');
      return;
    }

    if (!auth) {
      setError('Firebase Auth belum terkonfigurasi.');
      return;
    }

    setIsLoading(true);
    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/reset-password`,
        handleCodeInApp: true,
      };
      try {
        await sendPasswordResetEmail(auth, email, actionCodeSettings);
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'auth/unauthorized-continue-uri') {
          await sendPasswordResetEmail(auth, email);
        } else {
          throw err;
        }
      }
      setRequestSuccess(`Tautan reset baru telah dikirim ke ${email}. Silakan periksa email terbaru Anda.`);
      setError(null);
    } catch (err: unknown) {
      let msg = 'Gagal mengirim email reset kata sandi.';
      if (err && typeof err === 'object' && 'code' in err) {
        const code = (err as { code: string }).code;
        if (code === 'auth/user-not-found') {
          msg = 'Alamat email tidak terdaftar dalam sistem.';
        } else if (code === 'auth/invalid-email') {
          msg = 'Format alamat email tidak valid.';
        } else if (code === 'auth/too-many-requests') {
          msg = 'Terlalu banyak permintaan reset. Silakan tunggu sesaat lagi.';
        }
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-6 px-4 sm:px-6">
      <div className="w-full max-w-md bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden">
        {/* Banner Atas */}
        <div className="bg-gradient-to-r from-sky-600 to-indigo-700 px-6 py-6 text-white text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
            <KeyRound className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Chem-ElectroLabs</h1>
          <p className="text-xs text-sky-100 font-medium">Pemulihan & Reset Kata Sandi Akun</p>
        </div>

        {/* Konten Halaman */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Status 1: Memverifikasi Kode */}
          {status === 'verifying' && (
            <div className="py-8 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Memverifikasi tautan reset kata sandi...</p>
              <p className="text-xs text-slate-500">Mohon tunggu sebentar.</p>
            </div>
          )}

          {/* Status 2: Siap Masukkan Kata Sandi Baru */}
          {status === 'ready' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="space-y-1 text-left">
                <h2 className="text-lg font-extrabold text-slate-900">Buat Kata Sandi Baru</h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Masukkan kata sandi baru untuk akun:{' '}
                  <strong className="text-slate-900 font-bold">{verifiedEmail}</strong>
                </p>
              </div>

              {error && (
                <div role="alert" className="p-3.5 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs font-semibold flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleResetSubmit} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label htmlFor="new-password-input" className="block text-xs font-bold text-slate-700">
                    Kata Sandi Baru <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="new-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none min-h-[44px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="confirm-password-input" className="block text-xs font-bold text-slate-700">
                    Konfirmasi Kata Sandi Baru <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="confirm-password-input"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ketik ulang kata sandi baru"
                      className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none min-h-[44px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      aria-label={showConfirmPassword ? 'Sembunyikan konfirmasi kata sandi' : 'Tampilkan konfirmasi kata sandi'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-extrabold text-sm bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/20 transition-all min-h-[44px] cursor-pointer disabled:opacity-60"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isLoading ? 'Menyimpan Kata Sandi...' : 'Simpan Kata Sandi Baru'}</span>
                </button>
              </form>
            </div>
          )}

          {/* Status 3: Sukses Reset Kata Sandi */}
          {status === 'success' && (
            <div className="py-4 text-center space-y-4 animate-in fade-in">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-slate-900">Kata Sandi Berhasil Diperbarui!</h2>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                  Kata sandi baru Anda telah aktif. Silakan masuk kembali ke aplikasi menggunakan kata sandi yang baru dibuat.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to="/masuk"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-extrabold text-sm bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/20 transition-all min-h-[44px]"
                >
                  <span>Masuk ke Akun Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Status 4: Tautan Tidak Valid atau Kedaluwarsa */}
          {status === 'invalid' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-left space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>Tautan Kedaluwarsa atau Sudah Digunakan</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Tautan reset kata sandi dari Firebase hanya berlaku <strong>satu kali</strong>. Jika Anda telah meminta reset lebih dari satu kali, tautan lama otomatis hangus. Pastikan membuka tautan dari <strong>email paling terakhir</strong> yang masuk.
                </p>
              </div>

              {requestSuccess && (
                <div role="status" className="p-3.5 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 text-xs font-semibold flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{requestSuccess}</span>
                </div>
              )}

              {error && !requestSuccess && (
                <div role="alert" className="p-3.5 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs font-semibold flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form Minta Tautan Baru */}
              <form onSubmit={handleRequestSubmit} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label htmlFor="retry-email-input" className="block text-xs font-bold text-slate-700">
                    Kirim Ulang Tautan ke Email Anda
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="retry-email-input"
                      type="email"
                      required
                      value={requestEmail}
                      onChange={(e) => setRequestEmail(e.target.value)}
                      placeholder="nama@sekolah.sch.id"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none min-h-[44px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-extrabold text-sm bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/20 transition-all min-h-[44px] cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  <span>{isLoading ? 'Mengirim...' : 'Kirim Tautan Reset Baru'}</span>
                </button>
              </form>

              <div className="pt-2 text-center">
                <Link
                  to="/masuk"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke Halaman Masuk</span>
                </Link>
              </div>
            </div>
          )}

          {/* Status 5: Halaman Permintaan Reset Manual */}
          {status === 'request' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="space-y-1 text-left">
                <h2 className="text-lg font-extrabold text-slate-900">Minta Tautan Reset Kata Sandi</h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Masukkan email Anda. Kami akan mengirimkan tautan untuk membuat kata sandi baru.
                </p>
              </div>

              {requestSuccess && (
                <div role="status" className="p-3.5 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 text-xs font-semibold flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{requestSuccess}</span>
                </div>
              )}

              {error && !requestSuccess && (
                <div role="alert" className="p-3.5 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs font-semibold flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRequestSubmit} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label htmlFor="req-email-input" className="block text-xs font-bold text-slate-700">
                    Alamat Email Akun <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="req-email-input"
                      type="email"
                      required
                      value={requestEmail}
                      onChange={(e) => setRequestEmail(e.target.value)}
                      placeholder="nama@sekolah.sch.id"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none min-h-[44px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-extrabold text-sm bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/20 transition-all min-h-[44px] cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  <span>{isLoading ? 'Mengirim...' : 'Kirim Tautan Reset'}</span>
                </button>
              </form>

              <div className="pt-2 text-center">
                <Link
                  to="/masuk"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke Halaman Masuk</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
