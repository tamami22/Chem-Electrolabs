/**
 * Chem-ElectroLabs - Teacher Mode Storage
 * Mengelola sesi guru pada sessionStorage dan rekapitulasi data nilai siswa pada localStorage.
 */

import {
  type TeacherStudentRecord,
  parseAndValidateQuizPayload,
} from './teacherUtils.ts';
import { getAllAttempts, getAllFirestoreProgress as fetchAllFirestoreProgress } from '../../lib/storage.ts';

export async function getAllFirestoreProgress(): Promise<TeacherStudentRecord[]> {
  return fetchAllFirestoreProgress();
}

export const TEACHER_SESSION_KEY = 'chem-electrolabs.teacher_session';
export const TEACHER_ROSTER_KEY = 'chem-electrolabs.teacher_roster.v1';

// ==========================================
// SESI GURU (sessionStorage: hilang saat tab ditutup)
// ==========================================

export function isTeacherSessionActive(): boolean {
  if (typeof window === 'undefined' || !window.sessionStorage) return false;
  try {
    return window.sessionStorage.getItem(TEACHER_SESSION_KEY) === 'unlocked';
  } catch {
    return false;
  }
}

export function setTeacherSessionActive(): void {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      window.sessionStorage.setItem(TEACHER_SESSION_KEY, 'unlocked');
    } catch {
      // Abaikan error kuota
    }
  }
}

export function clearTeacherSession(): void {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      window.sessionStorage.removeItem(TEACHER_SESSION_KEY);
    } catch {
      // Abaikan error
    }
  }
}

// ==========================================
// REKAPITULASI ROSTER SISWA (localStorage)
// ==========================================

export function getTeacherRoster(): TeacherStudentRecord[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(TEACHER_ROSTER_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTeacherRoster(roster: TeacherStudentRecord[]): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(TEACHER_ROSTER_KEY, JSON.stringify(roster));
    } catch {
      // Abaikan error
    }
  }
}

/**
 * Mengimpor satu payload hasil kuis dan menggabungkannya ke dalam roster.
 * Mempertahankan skor tertinggi (best score) per modul per siswa.
 */
export function importQuizPayloadToRoster(rawInput: unknown): {
  success: boolean;
  message: string;
  studentName?: string;
  className?: string;
} {
  const validation = parseAndValidateQuizPayload(rawInput);
  if (!validation.valid) {
    return { success: false, message: validation.error };
  }

  const { student, result } = validation.payload;
  const roster = getTeacherRoster();

  // Cari siswa berdasarkan nama dan kelas (case-insensitive)
  const normName = student.studentName.trim().toLowerCase();
  const normClass = student.className.trim().toLowerCase();

  const existingIndex = roster.findIndex(
    (s) => s.studentName.trim().toLowerCase() === normName && s.className.trim().toLowerCase() === normClass
  );

  if (existingIndex >= 0) {
    const studentRecord = roster[existingIndex];
    const prevScore = studentRecord.moduleScores[result.moduleId];
    // Perbarui ke skor tertinggi
    studentRecord.moduleScores[result.moduleId] =
      typeof prevScore === 'number' ? Math.max(prevScore, result.percent) : result.percent;
    studentRecord.lastUpdated = new Date().toISOString();
    roster[existingIndex] = studentRecord;
  } else {
    // Tambahkan siswa baru
    roster.push({
      studentName: student.studentName.trim(),
      className: student.className.trim(),
      moduleScores: {
        [result.moduleId]: result.percent,
      },
      lastUpdated: new Date().toISOString(),
    });
  }

  saveTeacherRoster(roster);
  return {
    success: true,
    message: `Berhasil mengimpor nilai ${student.studentName} (${student.className}) untuk ${result.moduleId}: ${result.percent}%`,
    studentName: student.studentName,
    className: student.className,
  };
}

/**
 * Sinkronisasi seluruh percobaan kuis lokal yang ada pada perangkat ini ke dalam roster guru.
 */
export function syncLocalAttemptsToRoster(): number {
  const localAttempts = getAllAttempts();
  let count = 0;

  for (const att of localAttempts) {
    const res = importQuizPayloadToRoster({
      schemaVersion: 1,
      app: 'Chem-ElectroLabs',
      exportType: 'QUIZ_RESULT',
      exportedAt: att.attemptedAt,
      student: {
        studentName: att.studentName,
        className: att.className,
      },
      result: {
        moduleId: att.moduleId,
        score: att.score,
        total: att.total,
        percent: att.percent,
        passed: att.percent >= 75,
        attemptedAt: att.attemptedAt,
      },
      summary: {
        bestPercent: att.percent,
        totalAttempts: 1,
      },
    });
    if (res.success) count++;
  }

  return count;
}

export function clearTeacherRoster(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(TEACHER_ROSTER_KEY);
    } catch {
      // Abaikan error
    }
  }
}

