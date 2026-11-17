/**
 * Chem-ElectroLabs - LocalStorage Progress, Student Profile & Assessment Utility
 * Key standar PRD §8: chem-electrolabs.v1.progress
 * Dilengkapi integrasi Firestore pada koleksi 'progress/{uid}' dengan fallback LocalStorage jika offline.
 */

import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db, auth } from './firebase.ts';
import type { TeacherStudentRecord } from '../features/teacher/teacherUtils.ts';

export const PROGRESS_STORAGE_KEY = 'chem-electrolabs.v1.progress';
export const FIRESTORE_PROGRESS_COLLECTION = 'progress';

export interface StudentProfile {
  studentName: string;
  className: string;
  attendanceNumber?: string;
  isAgreed?: boolean;
}

export interface QuizAttemptRecord {
  id: string; // ID unik percobaan (e.g. att-1772800000000)
  studentName: string;
  className: string;
  moduleId: string;
  score: number; // Jumlah jawaban benar
  total: number; // Total butir soal
  percent: number; // Persentase skor (0 - 100)
  attemptedAt: string; // ISO 8601 string
}

export interface QuizScoreRecord {
  moduleId: string;
  score: number; // Persentase skor tertinggi (0 - 100)
  correctCount: number;
  totalQuestions: number;
  passed: boolean; // Ambang ketuntasan >= 75%
  completedAt: string; // ISO 8601 string
  attemptsCount: number;
}

/**
 * Format payload ekspor hasil kuis berversi (schemaVersion: 1)
 * Dirancang agar kelak kompatibel bila dikirimkan ke backend atau LMS
 */
export interface QuizExportPayload {
  schemaVersion: 1;
  app: 'Chem-ElectroLabs';
  exportType: 'QUIZ_RESULT';
  exportedAt: string;
  student: StudentProfile;
  result: {
    moduleId: string;
    moduleTitle?: string;
    score: number;
    total: number;
    percent: number;
    passed: boolean;
    attemptedAt: string;
  };
  summary: {
    bestPercent: number;
    totalAttempts: number;
  };
}

export interface StoredProgress {
  version: 1;
  student: StudentProfile;
  attempts: QuizAttemptRecord[];
  quizScores: Record<string, QuizScoreRecord>;
  lastUpdated: string;
}

export function getDefaultProgress(): StoredProgress {
  return {
    version: 1,
    student: {
      studentName: '',
      className: '',
      attendanceNumber: undefined,
      isAgreed: false,
    },
    attempts: [],
    quizScores: {},
    lastUpdated: new Date().toISOString(),
  };
}

export function getStoredProgress(): StoredProgress {
  if (typeof window === 'undefined' || !window.localStorage) {
    return getDefaultProgress();
  }
  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) {
      return getDefaultProgress();
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return getDefaultProgress();
    }
    return {
      version: 1,
      student: {
        studentName: parsed.student?.studentName || '',
        className: parsed.student?.className || '',
        attendanceNumber: parsed.student?.attendanceNumber || undefined,
        isAgreed: Boolean(parsed.student?.isAgreed),
      },
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
      quizScores: parsed.quizScores || {},
      lastUpdated: parsed.lastUpdated || new Date().toISOString(),
    };
  } catch {
    return getDefaultProgress();
  }
}

export function writeProgressToStorage(data: StoredProgress): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Menangani error jika kuota penyimpanan penuh atau mode privasi
    }
  }
}

// ==============================================================================
// INTEGRASI FIRESTORE (Koleksi progress/{uid}) DENGAN FALLBACK OFFLINE
// ==============================================================================

/**
 * Timeout helper agar panggilan Firestore tidak menggantung saat offline / timeout
 */
async function executeWithTimeout<T>(promise: Promise<T>, timeoutMs = 2500): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error('Firestore timeout'));
    }, timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer!);
  }
}

/**
 * Sanitasi data agar tidak mengandung field 'undefined' yang dilarang oleh Firestore
 */
function sanitizeProgressForFirestore(progress: StoredProgress): Record<string, unknown> {
  return {
    version: progress.version || 1,
    student: {
      studentName: progress.student.studentName || '',
      className: progress.student.className || '',
      attendanceNumber: progress.student.attendanceNumber || '',
      isAgreed: Boolean(progress.student.isAgreed),
    },
    attempts: (progress.attempts || []).map((att) => ({
      id: att.id,
      studentName: att.studentName || '',
      className: att.className || '',
      moduleId: att.moduleId || '',
      score: Number(att.score) || 0,
      total: Number(att.total) || 0,
      percent: Number(att.percent) || 0,
      attemptedAt: att.attemptedAt || new Date().toISOString(),
    })),
    quizScores: progress.quizScores || {},
    lastUpdated: progress.lastUpdated || new Date().toISOString(),
  };
}

/**
 * Mengambil progres siswa dari Firestore (koleksi progress/{uid})
 * Fallback ke null jika offline / gagal, sehingga pemanggil dapat menggunakan localStorage
 */
export async function getFirestoreProgress(uid: string): Promise<StoredProgress | null> {
  if (!db || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return null;
  }
  try {
    const docRef = doc(db, FIRESTORE_PROGRESS_COLLECTION, uid);
    const docSnap = await executeWithTimeout(getDoc(docRef));
    if (docSnap.exists()) {
      const data = docSnap.data() as StoredProgress;
      writeProgressToStorage(data);
      return data;
    }
    return null;
  } catch (error) {
    console.warn('[Storage] Gagal mengambil data progress dari Firestore, fallback ke localStorage:', error);
    return null;
  }
}

/**
 * Menyimpan progres siswa ke Firestore (koleksi progress/{uid})
 * Jika offline atau terjadi error jaringan, gagal secara halus (data tetap aman di localStorage)
 */
export async function saveProgressToFirestore(
  uid: string,
  progress: StoredProgress
): Promise<boolean> {
  if (!db) {
    console.error('[Firestore Error] Instance Firestore (db) belum terinisialisasi. Periksa konfigurasi .env Firebase.');
    return false;
  }
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    console.warn('[Firestore Offline] Perangkat offline, data disimpan di localStorage.');
    return false;
  }
  try {
    const docRef = doc(db, FIRESTORE_PROGRESS_COLLECTION, uid);
    const payload = sanitizeProgressForFirestore(progress);
    await executeWithTimeout(setDoc(docRef, payload, { merge: true }));
    return true;
  } catch (error) {
    console.error(`[Firestore Error] Gagal menulis ke progress/${uid}:`, error);
    return false;
  }
}

/**
 * Mengambil seluruh dokumen progres siswa dari Firestore (koleksi progress)
 * Digunakan oleh dashboard guru untuk rekapitulasi data kelas secara real-time.
 */
export async function getAllFirestoreProgress(): Promise<TeacherStudentRecord[]> {
  if (!db) {
    throw new Error('Firestore belum terinisialisasi. Periksa konfigurasi .env Firebase Anda.');
  }
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error('Perangkat sedang offline.');
  }

  const colRef = collection(db, FIRESTORE_PROGRESS_COLLECTION);
  const snap = await executeWithTimeout(getDocs(colRef));
  const list: TeacherStudentRecord[] = [];

  snap.forEach((docSnap) => {
    const data = docSnap.data() as StoredProgress;
    const student = data.student || { studentName: '', className: '' };
    const quizScores = data.quizScores || {};
    const attempts = Array.isArray(data.attempts) ? data.attempts : [];

    const moduleScores: Record<string, number | undefined> = {};
    ['modul-1', 'modul-2', 'modul-3', 'modul-4', 'modul-5'].forEach((mKey) => {
      if (quizScores[mKey]?.score !== undefined) {
        moduleScores[mKey] = Number(quizScores[mKey].score);
      } else {
        const modAttempts = attempts.filter((a) => a.moduleId === mKey);
        if (modAttempts.length > 0) {
          moduleScores[mKey] = Math.max(...modAttempts.map((a) => Number(a.percent) || 0));
        }
      }
    });

    list.push({
      studentName: student.studentName || 'Siswa Tanpa Nama',
      className: student.className || '-',
      attendanceNumber: student.attendanceNumber,
      moduleScores,
      lastUpdated: data.lastUpdated || new Date().toISOString(),
      attempts,
      totalAttempts: attempts.length,
      uid: docSnap.id,
    });
  });

  return list;
}

/**
 * Sinkronisasi dua arah antara data lokal perangkat dan Firestore
 */
export async function syncProgressWithFirestore(uid: string): Promise<StoredProgress> {
  const local = getStoredProgress();
  if (!db || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return local;
  }
  try {
    const remote = await getFirestoreProgress(uid);
    if (!remote) {
      if (local.student.studentName || local.attempts.length > 0) {
        await saveProgressToFirestore(uid, local);
      }
      return local;
    }

    // Gabungkan attempts unik berdasarkan id
    const attemptMap = new Map<string, QuizAttemptRecord>();
    remote.attempts.forEach((a) => attemptMap.set(a.id, a));
    local.attempts.forEach((a) => attemptMap.set(a.id, a));
    const mergedAttempts = Array.from(attemptMap.values()).sort(
      (a, b) => new Date(a.attemptedAt).getTime() - new Date(b.attemptedAt).getTime()
    );

    // Gabungkan skor kuis terbaik per modul
    const mergedScores: Record<string, QuizScoreRecord> = { ...remote.quizScores };
    for (const [modId, scoreRec] of Object.entries(local.quizScores)) {
      if (!mergedScores[modId] || scoreRec.score > mergedScores[modId].score) {
        mergedScores[modId] = scoreRec;
      }
    }

    const merged: StoredProgress = {
      version: 1,
      student: {
        studentName: remote.student.studentName || local.student.studentName,
        className: remote.student.className || local.student.className,
        attendanceNumber: remote.student.attendanceNumber || local.student.attendanceNumber,
        isAgreed: remote.student.isAgreed || local.student.isAgreed,
      },
      attempts: mergedAttempts,
      quizScores: mergedScores,
      lastUpdated: new Date().toISOString(),
    };

    writeProgressToStorage(merged);
    await saveProgressToFirestore(uid, merged);
    return merged;
  } catch (err) {
    console.warn('[Storage] Gagal sinkronisasi data dengan Firestore:', err);
    return local;
  }
}

/**
 * Menyimpan profil identitas siswa (Nama, Kelas, No. Absen, Persetujuan)
 * Menghapus spasi berlebih pada nama lengkap.
 * Menyimpan ke localStorage dan otomatis sinkron ke Firestore jika pengguna login.
 */
export function saveStudentProfile(
  studentName: string,
  className: string,
  attendanceNumber?: string,
  uid?: string
): StudentProfile {
  const current = getStoredProgress();
  const cleanedName = studentName.trim().replace(/\s+/g, ' ');
  const cleanedClass = className.trim();
  const cleanedAbsen = attendanceNumber ? attendanceNumber.trim() : undefined;

  const profile: StudentProfile = {
    studentName: cleanedName,
    className: cleanedClass,
    attendanceNumber: cleanedAbsen,
    isAgreed: true,
  };

  current.student = profile;
  current.lastUpdated = new Date().toISOString();
  writeProgressToStorage(current);

  const activeUid = uid || (typeof auth !== 'undefined' ? auth?.currentUser?.uid : undefined);
  if (activeUid) {
    saveProgressToFirestore(activeUid, current).catch((err) => {
      console.error(`[Firestore Error] Gagal menulis ke progress/${activeUid}:`, err);
    });
  }

  return profile;
}

/**
 * Menghapus profil identitas siswa dari penyimpanan lokal (opsi ganti nama)
 */
export function clearStudentProfile(): void {
  const current = getStoredProgress();
  current.student = {
    studentName: '',
    className: '',
    attendanceNumber: undefined,
    isAgreed: false,
  };
  current.lastUpdated = new Date().toISOString();
  writeProgressToStorage(current);
}

export function getStudentProfile(): StudentProfile {
  return getStoredProgress().student;
}

/**
 * Mencatat satu percobaan kuis siswa, menyimpan ke daftar riwayat percobaan,
 * dan memperbarui skor terbaik per modul.
 * Menyimpan ke localStorage dan Firestore (progress/{uid}) jika terautentikasi.
 */
export function recordQuizAttempt(
  params: {
    studentName: string;
    className: string;
    moduleId: string;
    score: number;
    total: number;
    percent: number;
  },
  uid?: string
): { attempt: QuizAttemptRecord; bestScore: QuizScoreRecord } {
  const current = getStoredProgress();
  const now = new Date().toISOString();

  const attempt: QuizAttemptRecord = {
    id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    studentName: params.studentName.trim(),
    className: params.className.trim(),
    moduleId: params.moduleId,
    score: params.score,
    total: params.total,
    percent: params.percent,
    attemptedAt: now,
  };

  // Simpan record percobaan ke riwayat lengkap
  current.attempts.push(attempt);

  // Perbarui profil siswa jika sebelumnya belum lengkap
  if (params.studentName.trim() && !current.student.studentName) {
    current.student.studentName = params.studentName.trim();
  }
  if (params.className.trim() && !current.student.className) {
    current.student.className = params.className.trim();
  }

  // Hitung & simpan skor terbaik (best score) untuk modul ini
  const existingBest = current.quizScores[params.moduleId];
  const bestScoreVal = existingBest ? Math.max(existingBest.score, params.percent) : params.percent;
  const attemptsCount = (existingBest?.attemptsCount ?? 0) + 1;

  const bestScoreRecord: QuizScoreRecord = {
    moduleId: params.moduleId,
    score: bestScoreVal,
    correctCount: params.percent >= (existingBest?.score ?? 0) ? params.score : (existingBest?.correctCount ?? params.score),
    totalQuestions: params.total,
    passed: bestScoreVal >= 75,
    completedAt: now,
    attemptsCount,
  };

  current.quizScores[params.moduleId] = bestScoreRecord;
  current.lastUpdated = now;
  writeProgressToStorage(current);

  const activeUid = uid || (typeof auth !== 'undefined' ? auth?.currentUser?.uid : undefined);
  if (activeUid) {
    saveProgressToFirestore(activeUid, current).catch((err) => {
      console.error(`[Firestore Error] Gagal menulis ke progress/${activeUid}:`, err);
    });
  }

  return { attempt, bestScore: bestScoreRecord };
}

/**
 * Menyimpan skor kuis ke localStorage dan memperbarui skor terbaik (best score).
 * Kompatibel dengan pemanggilan sebelumnya.
 */
export function saveQuizScore(
  moduleId: string,
  correctCount: number,
  totalQuestions: number,
  uid?: string
): QuizScoreRecord {
  const student = getStudentProfile();
  const percent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const { bestScore } = recordQuizAttempt({
    studentName: student.studentName || 'Siswa',
    className: student.className || 'Kelas',
    moduleId,
    score: correctCount,
    total: totalQuestions,
    percent,
  }, uid);
  return bestScore;
}

export function getBestQuizScore(moduleId: string): QuizScoreRecord | null {
  const progress = getStoredProgress();
  return progress.quizScores[moduleId] ?? null;
}

export function getAllAttempts(): QuizAttemptRecord[] {
  return getStoredProgress().attempts;
}

export function getAttemptsByModule(moduleId: string): QuizAttemptRecord[] {
  return getStoredProgress().attempts.filter((a) => a.moduleId === moduleId);
}

/**
 * Menghasilkan payload JSON terstandar berversi (schemaVersion: 1)
 */
export function generateQuizExportPayload(
  attempt: QuizAttemptRecord,
  moduleTitle?: string
): QuizExportPayload {
  const best = getBestQuizScore(attempt.moduleId);
  const attempts = getAttemptsByModule(attempt.moduleId);

  return {
    schemaVersion: 1,
    app: 'Chem-ElectroLabs',
    exportType: 'QUIZ_RESULT',
    exportedAt: new Date().toISOString(),
    student: {
      studentName: attempt.studentName,
      className: attempt.className,
    },
    result: {
      moduleId: attempt.moduleId,
      moduleTitle,
      score: attempt.score,
      total: attempt.total,
      percent: attempt.percent,
      passed: attempt.percent >= 75,
      attemptedAt: attempt.attemptedAt,
    },
    summary: {
      bestPercent: best ? best.score : attempt.percent,
      totalAttempts: attempts.length > 0 ? attempts.length : 1,
    },
  };
}

export function resetProgress(uid?: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(PROGRESS_STORAGE_KEY);
    } catch {
      // Abaikan error
    }
  }

  const activeUid = uid || (typeof auth !== 'undefined' ? auth?.currentUser?.uid : undefined);
  if (activeUid) {
    saveProgressToFirestore(activeUid, getDefaultProgress()).catch((err) => {
      console.error(`[Firestore Error] Gagal menulis ke progress/${activeUid}:`, err);
    });
  }
}
