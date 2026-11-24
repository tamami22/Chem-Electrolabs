/**
 * Chem-ElectroLabs - Teacher Mode Utilities
 * Validasi hash SHA-256 via Web Crypto API, rate-limiting, validasi payload, dan ekspor CSV.
 */

import type { QuizExportPayload, QuizAttemptRecord } from '../../lib/storage.ts';

// Hash fallback default untuk mode pengembangan jika env tidak didefinisikan (Hex SHA-256 dari 'KIMIA2026')
export const DEFAULT_DEV_HASH = '9af4a2620dd33a3735a2474f6dcf372bb6a4912988f28b4cc3c2c0cc61fb1181';

export interface TeacherStudentRecord {
  studentName: string;
  className: string;
  moduleScores: {
    'modul-1'?: number;
    'modul-2'?: number;
    'modul-3'?: number;
    'modul-4'?: number;
    'modul-5'?: number;
    [key: string]: number | undefined;
  };
  lastUpdated: string;
  uid?: string;
  attendanceNumber?: string;
  attempts?: QuizAttemptRecord[];
  totalAttempts?: number;
}

/**
 * Menghitung hash SHA-256 menggunakan Web Crypto API standar (crypto.subtle).
 */
export async function sha256(text: string): Promise<string> {
  const cryptoObj =
    typeof window !== 'undefined' && window.crypto?.subtle ? window.crypto : globalThis.crypto;

  if (!cryptoObj || !cryptoObj.subtle) {
    throw new Error('Web Crypto API tidak tersedia.');
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await cryptoObj.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').toLowerCase();
}

/**
 * Mengambil hash yang diharapkan dari variabel lingkungan VITE_TEACHER_CODE_HASH
 */
export function getExpectedTeacherHash(): string {
  const envHash = import.meta.env.VITE_TEACHER_CODE_HASH;
  if (envHash && typeof envHash === 'string' && envHash.trim().length === 64) {
    return envHash.trim().toLowerCase();
  }
  return DEFAULT_DEV_HASH;
}

/**
 * Memeriksa apakah kode akses yang dimasukkan cocok dengan hash yang diharapkan.
 * Plain-text kode tidak pernah disimpan atau dituliskan di source code.
 */
export async function verifyTeacherCode(
  inputCode: string,
  targetHash?: string
): Promise<boolean> {
  if (!inputCode || !inputCode.trim()) return false;
  const expected = (targetHash || getExpectedTeacherHash()).toLowerCase();
  const hashedInput = await sha256(inputCode.trim());
  return hashedInput === expected;
}

/**
 * Menghitung jeda bertahap (detik lockout) berdasarkan jumlah percobaan salah:
 * - < 3 salah: 0 detik (bisa langsung coba lagi)
 * - 3 salah: 5 detik
 * - 4 salah: 15 detik
 * - >= 5 salah: 30 detik
 */
export function calculateLockoutSeconds(failedCount: number): number {
  if (failedCount < 3) return 0;
  if (failedCount === 3) return 5;
  if (failedCount === 4) return 15;
  return 30;
}

/**
 * Validasi ketat format JSON payload hasil kuis siswa (schemaVersion: 1)
 */
export function parseAndValidateQuizPayload(
  rawJsonOrObj: unknown
): { valid: true; payload: QuizExportPayload } | { valid: false; error: string } {
  let parsed: unknown = rawJsonOrObj;

  if (typeof rawJsonOrObj === 'string') {
    try {
      parsed = JSON.parse(rawJsonOrObj);
    } catch {
      return { valid: false, error: 'Format JSON tidak valid (kesalahan sintaksis).' };
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    return { valid: false, error: 'Payload harus berupa objek JSON.' };
  }

  const obj = parsed as Record<string, unknown>;

  // Validasi versi skema
  if (obj.schemaVersion !== 1) {
    return {
      valid: false,
      error: `Versi skema tidak didukung: ${String(obj.schemaVersion)}. Diperlukan schemaVersion: 1.`,
    };
  }

  // Validasi data identitas siswa
  const student = obj.student as Record<string, unknown> | undefined;
  if (!student || typeof student !== 'object') {
    return { valid: false, error: 'Objek "student" tidak ditemukan pada payload.' };
  }

  if (typeof student.studentName !== 'string' || !student.studentName.trim()) {
    return { valid: false, error: 'Field "student.studentName" harus berupa teks non-kosong.' };
  }

  if (typeof student.className !== 'string' || !student.className.trim()) {
    return { valid: false, error: 'Field "student.className" harus berupa teks non-kosong.' };
  }

  // Validasi data hasil pengerjaan modul
  const result = obj.result as Record<string, unknown> | undefined;
  if (!result || typeof result !== 'object') {
    return { valid: false, error: 'Objek "result" tidak ditemukan pada payload.' };
  }

  if (typeof result.moduleId !== 'string' || !result.moduleId.trim()) {
    return { valid: false, error: 'Field "result.moduleId" tidak valid.' };
  }

  if (typeof result.score !== 'number' || typeof result.total !== 'number') {
    return { valid: false, error: 'Field "result.score" dan "result.total" harus berupa angka numerik.' };
  }

  if (typeof result.percent !== 'number' || result.percent < 0 || result.percent > 100) {
    return { valid: false, error: 'Field "result.percent" harus berupa persentase antara 0 s.d. 100.' };
  }

  return {
    valid: true,
    payload: parsed as QuizExportPayload,
  };
}

/**
 * Menghitung nilai rata-rata dari modul-modul yang sudah dikerjakan siswa
 */
export function calculateStudentAverage(record: TeacherStudentRecord): number | null {
  const modules = ['modul-1', 'modul-2', 'modul-3', 'modul-4', 'modul-5'];
  const scores: number[] = [];

  for (const m of modules) {
    const val = record.moduleScores[m];
    if (typeof val === 'number') {
      scores.push(val);
    }
  }

  if (scores.length === 0) return null;
  const sum = scores.reduce((acc, curr) => acc + curr, 0);
  return Math.round(sum / scores.length);
}

/**
 * Menghasilkan string file CSV lengkap dari data rekapitulasi siswa
 */
export function exportRosterToCsv(students: TeacherStudentRecord[]): string {
  const header = [
    'No',
    'Nama Siswa',
    'Kelas',
    'Modul 1 (%)',
    'Modul 2 (%)',
    'Modul 3 (%)',
    'Modul 4 (%)',
    'Modul 5 (%)',
    'Rata-rata (%)',
  ];

  const rows: string[][] = [];

  // Hitung akumulator untuk baris ringkasan rata-rata kelas
  const sumByModule: Record<string, { sum: number; count: number }> = {
    'modul-1': { sum: 0, count: 0 },
    'modul-2': { sum: 0, count: 0 },
    'modul-3': { sum: 0, count: 0 },
    'modul-4': { sum: 0, count: 0 },
    'modul-5': { sum: 0, count: 0 },
  };

  students.forEach((s, idx) => {
    const m1 = s.moduleScores['modul-1'];
    const m2 = s.moduleScores['modul-2'];
    const m3 = s.moduleScores['modul-3'];
    const m4 = s.moduleScores['modul-4'];
    const m5 = s.moduleScores['modul-5'];

    if (typeof m1 === 'number') { sumByModule['modul-1'].sum += m1; sumByModule['modul-1'].count += 1; }
    if (typeof m2 === 'number') { sumByModule['modul-2'].sum += m2; sumByModule['modul-2'].count += 1; }
    if (typeof m3 === 'number') { sumByModule['modul-3'].sum += m3; sumByModule['modul-3'].count += 1; }
    if (typeof m4 === 'number') { sumByModule['modul-4'].sum += m4; sumByModule['modul-4'].count += 1; }
    if (typeof m5 === 'number') { sumByModule['modul-5'].sum += m5; sumByModule['modul-5'].count += 1; }

    const avg = calculateStudentAverage(s);

    rows.push([
      String(idx + 1),
      `"${s.studentName.replace(/"/g, '""')}"`,
      `"${s.className.replace(/"/g, '""')}"`,
      typeof m1 === 'number' ? String(m1) : '-',
      typeof m2 === 'number' ? String(m2) : '-',
      typeof m3 === 'number' ? String(m3) : '-',
      typeof m4 === 'number' ? String(m4) : '-',
      typeof m5 === 'number' ? String(m5) : '-',
      avg !== null ? String(avg) : '-',
    ]);
  });

  // Hitung rata-rata tiap kolom untuk baris penutup
  const avgM1 = sumByModule['modul-1'].count > 0 ? (sumByModule['modul-1'].sum / sumByModule['modul-1'].count).toFixed(1) : '-';
  const avgM2 = sumByModule['modul-2'].count > 0 ? (sumByModule['modul-2'].sum / sumByModule['modul-2'].count).toFixed(1) : '-';
  const avgM3 = sumByModule['modul-3'].count > 0 ? (sumByModule['modul-3'].sum / sumByModule['modul-3'].count).toFixed(1) : '-';
  const avgM4 = sumByModule['modul-4'].count > 0 ? (sumByModule['modul-4'].sum / sumByModule['modul-4'].count).toFixed(1) : '-';
  const avgM5 = sumByModule['modul-5'].count > 0 ? (sumByModule['modul-5'].sum / sumByModule['modul-5'].count).toFixed(1) : '-';

  const allScores = students.flatMap((s) => Object.values(s.moduleScores).filter((v): v is number => typeof v === 'number'));
  const overallAvg = allScores.length > 0 ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1) : '-';

  rows.push([
    '',
    '"RATA-RATA KELAS"',
    '""',
    avgM1,
    avgM2,
    avgM3,
    avgM4,
    avgM5,
    overallAvg,
  ]);

  // Tambahkan UTF-8 BOM (\uFEFF) agar Microsoft Excel membuka aksen dan karakter dengan rapi
  const csvContent = '\uFEFF' + [header.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  return csvContent;
}

