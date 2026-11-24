import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '../lib/firebase.ts';
import {
  getStoredProgress,
  saveStudentProfile,
  clearStudentProfile,
  recordQuizAttempt,
  getBestQuizScore,
  resetProgress,
  syncProgressWithFirestore,
  saveProgressToFirestore,
  type QuizAttemptRecord,
  type QuizScoreRecord,
} from '../lib/storage.ts';

async function authWithTimeout<T>(promise: Promise<T>, timeoutMs = 3000): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error('Auth network timeout') as Error & { code?: string };
      err.code = 'auth/network-request-failed';
      reject(err);
    }, timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer!);
  }
}

export const STUDENT_SESSION_KEY = 'chem-electrolabs.v1.student-session';

function checkSessionActive(): boolean {
  if (typeof window === 'undefined' || !window.sessionStorage) return false;
  try {
    return window.sessionStorage.getItem(STUDENT_SESSION_KEY) === 'active';
  } catch {
    return false;
  }
}

function writeSessionActive(active: boolean): void {
  if (typeof window === 'undefined' || !window.sessionStorage) return;
  try {
    if (active) {
      window.sessionStorage.setItem(STUDENT_SESSION_KEY, 'active');
    } else {
      window.sessionStorage.removeItem(STUDENT_SESSION_KEY);
    }
  } catch {
    // Abaikan error kuota/privasi sessionStorage
  }
}

export interface StudentStoreState {
  studentName: string;
  className: string;
  attendanceNumber: string;
  isEntered: boolean;
  attempts: QuizAttemptRecord[];

  // Firebase Auth State
  uid: string | null;
  email: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setProfile: (studentName: string, className: string, attendanceNumber?: string) => void;
  enterSession: () => void;
  leaveSession: () => void;
  clearProfile: () => void;
  recordAttempt: (params: {
    moduleId: string;
    score: number;
    total: number;
    percent: number;
  }) => QuizAttemptRecord;
  getBestScore: (moduleId: string) => QuizScoreRecord | null;
  getAttemptsByModule: (moduleId: string) => QuizAttemptRecord[];
  reset: () => void;

  // Firebase Auth & Firestore Sync Actions
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string; needsClass?: boolean }>;
  registerWithEmail: (
    email: string,
    password: string,
    profile: { studentName: string; className: string; attendanceNumber?: string }
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  syncWithFirestore: () => Promise<void>;
}

// Inisialisasi state awal dari localStorage dan sessionStorage
const initialProgress = getStoredProgress();
const initialSessionActive = checkSessionActive();
const hasSavedStudent = Boolean(
  initialProgress.student.studentName?.trim() && initialProgress.student.className?.trim()
);

export const useStudentStore = create<StudentStoreState>((set, get) => ({
  studentName: initialProgress.student.studentName || '',
  className: initialProgress.student.className || '',
  attendanceNumber: initialProgress.student.attendanceNumber || '',
  isEntered: Boolean(hasSavedStudent && initialSessionActive),
  attempts: initialProgress.attempts,

  uid: null,
  email: null,
  isLoading: false,
  error: null,

  setProfile: (studentName: string, className: string, attendanceNumber?: string) => {
    const uid = get().uid || undefined;
    const saved = saveStudentProfile(studentName, className, attendanceNumber, uid);
    writeSessionActive(true);
    set({
      studentName: saved.studentName,
      className: saved.className,
      attendanceNumber: saved.attendanceNumber || '',
      isEntered: true,
      error: null,
    });
  },

  enterSession: () => {
    const { studentName, className } = get();
    if (studentName.trim() && className.trim()) {
      writeSessionActive(true);
      set({ isEntered: true });
    }
  },

  leaveSession: () => {
    if (auth && auth.currentUser) {
      signOut(auth).catch(() => {});
    }
    writeSessionActive(false);
    set({ uid: null, email: null, isEntered: false });
  },

  clearProfile: () => {
    clearStudentProfile();
    writeSessionActive(false);
    set({
      studentName: '',
      className: '',
      attendanceNumber: '',
      isEntered: false,
      uid: null,
      email: null,
      error: null,
    });
  },

  recordAttempt: (params: {
    moduleId: string;
    score: number;
    total: number;
    percent: number;
  }) => {
    const { studentName, className, uid } = get();
    const currentName = studentName || 'Siswa';
    const currentClass = className || 'Kelas';

    const { attempt } = recordQuizAttempt(
      {
        studentName: currentName,
        className: currentClass,
        moduleId: params.moduleId,
        score: params.score,
        total: params.total,
        percent: params.percent,
      },
      uid || undefined
    );

    set((state) => ({
      attempts: [...state.attempts, attempt],
    }));

    return attempt;
  },

  getBestScore: (moduleId: string) => {
    return getBestQuizScore(moduleId);
  },

  getAttemptsByModule: (moduleId: string) => {
    return get().attempts.filter((a) => a.moduleId === moduleId);
  },

  reset: () => {
    const uid = get().uid || undefined;
    resetProgress(uid);
    writeSessionActive(false);
    set({
      uid: null,
      email: null,
      studentName: '',
      className: '',
      attendanceNumber: '',
      isEntered: false,
      attempts: [],
      error: null,
    });
  },

  loginWithEmail: async (email: string, password: string) => {
    if (!auth) {
      const msg = 'Firebase Auth belum terkonfigurasi. Pastikan variabel lingkungan .env sudah diisi.';
      set({ error: msg });
      return { success: false, error: msg };
    }
    set({ isLoading: true, error: null });
    try {
      const cred = await authWithTimeout(signInWithEmailAndPassword(auth, email.trim(), password));
      const user = cred.user;
      writeSessionActive(true);

      const synced = await syncProgressWithFirestore(user.uid);
      set({
        uid: user.uid,
        email: user.email,
        studentName: synced.student.studentName || user.displayName || '',
        className: synced.student.className || '',
        attendanceNumber: synced.student.attendanceNumber || '',
        attempts: synced.attempts,
        isEntered: true,
        isLoading: false,
        error: null,
      });
      return { success: true };
    } catch (err: unknown) {
      let msg = 'Gagal masuk akun. Periksa kembali email dan kata sandi Anda.';
      if (err && typeof err === 'object' && 'code' in err) {
        const code = (err as { code: string }).code;
        if (
          code === 'auth/user-not-found' ||
          code === 'auth/wrong-password' ||
          code === 'auth/invalid-credential'
        ) {
          msg = 'Email atau kata sandi tidak sesuai.';
        } else if (code === 'auth/invalid-email') {
          msg = 'Format alamat email tidak valid.';
        } else if (code === 'auth/network-request-failed') {
          msg = 'Koneksi jaringan terputus (offline). Menggunakan data lokal perangkat.';
        } else if (code === 'auth/too-many-requests') {
          msg = 'Terlalu banyak percobaan masuk yang gagal. Silakan coba sesaat lagi.';
        }
      }
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  loginWithGoogle: async () => {
    if (!auth) {
      const msg = 'Firebase Auth belum terkonfigurasi. Pastikan variabel lingkungan .env sudah diisi.';
      set({ error: msg });
      return { success: false, error: msg };
    }
    set({ isLoading: true, error: null });
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      const user = cred.user;
      writeSessionActive(true);

      const synced = await syncProgressWithFirestore(user.uid);
      const studentName = synced.student.studentName || user.displayName || user.email?.split('@')[0] || 'Siswa';
      const className = synced.student.className || '';
      const attendanceNumber = synced.student.attendanceNumber || '';

      if (studentName) {
        saveStudentProfile(studentName, className, attendanceNumber, user.uid);
      }

      const hasClass = Boolean(className.trim());

      set({
        uid: user.uid,
        email: user.email,
        studentName,
        className,
        attendanceNumber,
        attempts: synced.attempts,
        isEntered: hasClass,
        isLoading: false,
        error: null,
      });

      return { success: true, needsClass: !hasClass };
    } catch (err: unknown) {
      let msg = 'Gagal masuk dengan akun Google.';
      if (err && typeof err === 'object' && 'code' in err) {
        const code = (err as { code: string }).code;
        if (code === 'auth/popup-closed-by-user') {
          msg = 'Jendela masuk Google ditutup sebelum proses selesai.';
        } else if (code === 'auth/cancelled-popup-request') {
          msg = 'Permintaan jendela masuk Google dibatalkan.';
        } else if (code === 'auth/popup-blocked') {
          msg = 'Jendela popup Google diblokir oleh browser. Harap izinkan popup di situs ini.';
        } else if (code === 'auth/network-request-failed') {
          msg = 'Koneksi jaringan terputus (offline). Silakan periksa jaringan internet Anda.';
        } else if (code === 'auth/operation-not-allowed') {
          msg = 'Login Google belum diaktifkan di Firebase Console.';
        } else if (code === 'auth/account-exists-with-different-credential') {
          msg = 'Email ini sudah terdaftar dengan metode masuk lain (Email & Kata Sandi).';
        }
      }
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  registerWithEmail: async (
    email: string,
    password: string,
    profile: { studentName: string; className: string; attendanceNumber?: string }
  ) => {
    if (!auth) {
      const msg = 'Firebase Auth belum terkonfigurasi. Pastikan variabel lingkungan .env sudah diisi.';
      set({ error: msg });
      return { success: false, error: msg };
    }
    set({ isLoading: true, error: null });
    try {
      const cred = await authWithTimeout(createUserWithEmailAndPassword(auth, email.trim(), password));
      const user = cred.user;

      try {
        await updateProfile(user, { displayName: profile.studentName });
      } catch {
        // Abaikan kegagalan update displayName
      }

      const saved = saveStudentProfile(
        profile.studentName,
        profile.className,
        profile.attendanceNumber,
        user.uid
      );
      writeSessionActive(true);

      const progress = getStoredProgress();
      await saveProgressToFirestore(user.uid, progress);

      set({
        uid: user.uid,
        email: user.email,
        studentName: saved.studentName,
        className: saved.className,
        attendanceNumber: saved.attendanceNumber || '',
        attempts: progress.attempts,
        isEntered: true,
        isLoading: false,
        error: null,
      });
      return { success: true };
    } catch (err: unknown) {
      let msg = 'Gagal mendaftar akun. Silakan coba kembali.';
      if (err && typeof err === 'object' && 'code' in err) {
        const code = (err as { code: string }).code;
        if (code === 'auth/email-already-in-use') {
          msg = 'Email ini sudah terdaftar. Silakan pilih Masuk Akun.';
        } else if (code === 'auth/weak-password') {
          msg = 'Kata sandi terlalu pendek (minimal 6 karakter).';
        } else if (code === 'auth/invalid-email') {
          msg = 'Format alamat email tidak valid.';
        } else if (code === 'auth/network-request-failed') {
          msg = 'Tidak ada koneksi internet (offline). Coba daftar saat online.';
        }
      }
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

/* duplicate loginWithGoogle removed */

  logout: async () => {
    if (auth) {
      try {
        await signOut(auth);
      } catch {
        // Abaikan error saat signOut
      }
    }
    writeSessionActive(false);
    set({
      uid: null,
      email: null,
      isEntered: false,
    });
  },

  sendPasswordReset: async (email: string) => {
    if (!auth) {
      const msg = 'Firebase Auth belum terkonfigurasi. Pastikan variabel lingkungan .env sudah diisi.';
      set({ error: msg });
      return { success: false, error: msg };
    }
    set({ isLoading: true, error: null });
    try {
      const actionCodeSettings = {
        url: `${typeof window !== 'undefined' ? window.location.origin : ''}/reset-password`,
        handleCodeInApp: true,
      };
      try {
        await authWithTimeout(sendPasswordResetEmail(auth, email.trim(), actionCodeSettings));
      } catch (err: unknown) {
        if (
          err &&
          typeof err === 'object' &&
          'code' in err &&
          (err as { code: string }).code === 'auth/unauthorized-continue-uri'
        ) {
          await authWithTimeout(sendPasswordResetEmail(auth, email.trim()));
        } else {
          throw err;
        }
      }
      set({ isLoading: false, error: null });
      return { success: true };
    } catch (err: unknown) {
      let msg = 'Gagal mengirim email pemulihan kata sandi. Silakan coba kembali.';
      if (err && typeof err === 'object' && 'code' in err) {
        const code = (err as { code: string }).code;
        if (code === 'auth/user-not-found') {
          msg = 'Alamat email tidak terdaftar dalam sistem.';
        } else if (code === 'auth/invalid-email') {
          msg = 'Format alamat email tidak valid.';
        } else if (code === 'auth/missing-email') {
          msg = 'Silakan masukkan alamat email Anda terlebih dahulu.';
        } else if (code === 'auth/network-request-failed') {
          msg = 'Koneksi jaringan terputus (offline). Periksa koneksi internet Anda.';
        } else if (code === 'auth/too-many-requests') {
          msg = 'Terlalu banyak permintaan. Silakan tunggu sesaat sebelum mencoba lagi.';
        }
      }
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

/* duplicate loginWithGoogle removed */

  syncWithFirestore: async () => {
    const { uid } = get();
    if (!uid) return;
    set({ isLoading: true });
    try {
      const synced = await syncProgressWithFirestore(uid);
      set({
        studentName: synced.student.studentName || get().studentName,
        className: synced.student.className || get().className,
        attendanceNumber: synced.student.attendanceNumber || get().attendanceNumber,
        attempts: synced.attempts,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },
}));

// Listener status autentikasi Firebase
if (typeof window !== 'undefined' && auth) {
  try {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        useStudentStore.setState({
          uid: user.uid,
          email: user.email || null,
          isEntered: true,
        });
        writeSessionActive(true);
        try {
          const synced = await syncProgressWithFirestore(user.uid);
          useStudentStore.setState({
            studentName: synced.student.studentName || user.displayName || '',
            className: synced.student.className || '',
            attendanceNumber: synced.student.attendanceNumber || '',
            attempts: synced.attempts,
          });
        } catch {
          // offline fallback
        }
      } else {
        const state = useStudentStore.getState();
        if (state.uid) {
          useStudentStore.setState({ uid: null, email: null });
        }
      }
    });
  } catch {
    // Abaikan error listener
  }
}
