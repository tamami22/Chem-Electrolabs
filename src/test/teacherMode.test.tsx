import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  sha256,
  verifyTeacherCode,
  calculateLockoutSeconds,
  parseAndValidateQuizPayload,
  calculateStudentAverage,
  exportRosterToCsv,
  DEFAULT_DEV_HASH,
  type TeacherStudentRecord,
} from '../features/teacher/teacherUtils.ts';
import {
  clearTeacherSession,
  getTeacherRoster,
  importQuizPayloadToRoster,
  clearTeacherRoster,
  TEACHER_SESSION_KEY,
} from '../features/teacher/teacherStorage.ts';
import * as teacherStorage from '../features/teacher/teacherStorage.ts';
import { signInWithEmailAndPassword } from 'firebase/auth';
import TeacherModePage from '../pages/TeacherModePage.tsx';

vi.mock('firebase/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/auth')>();
  return {
    ...actual,
    signInWithEmailAndPassword: vi.fn(),
  };
});

vi.mock('../lib/firebase.ts', () => ({
  auth: { currentUser: { uid: 'teacher-123' } },
  db: {},
  isFirebaseConfigured: true,
}));

describe('Teacher Mode Crypto & Rate Limiting Tests', () => {
  it('computes correct SHA-256 hash using Web Crypto API', async () => {
    // Hash SHA-256 dari 'KIMIA2026'
    const hash = await sha256('KIMIA2026');
    expect(hash).toBe(DEFAULT_DEV_HASH);
  });

  it('verifies teacher access code against target hash', async () => {
    const isCorrect = await verifyTeacherCode('KIMIA2026', DEFAULT_DEV_HASH);
    expect(isCorrect).toBe(true);

    const isWrong = await verifyTeacherCode('SALAH123', DEFAULT_DEV_HASH);
    expect(isWrong).toBe(false);

    const isEmpty = await verifyTeacherCode('', DEFAULT_DEV_HASH);
    expect(isEmpty).toBe(false);
  });

  it('calculates progressive lockout seconds properly', () => {
    expect(calculateLockoutSeconds(0)).toBe(0);
    expect(calculateLockoutSeconds(1)).toBe(0);
    expect(calculateLockoutSeconds(2)).toBe(0);
    expect(calculateLockoutSeconds(3)).toBe(5);
    expect(calculateLockoutSeconds(4)).toBe(15);
    expect(calculateLockoutSeconds(5)).toBe(30);
    expect(calculateLockoutSeconds(10)).toBe(30);
  });
});

describe('Teacher Mode Import & Payload Validation Tests', () => {
  it('accepts valid versioned JSON payload (schemaVersion: 1)', () => {
    const validJson = JSON.stringify({
      schemaVersion: 1,
      app: 'Chem-ElectroLabs',
      exportType: 'QUIZ_RESULT',
      exportedAt: new Date().toISOString(),
      student: {
        studentName: 'Ahmad Fauzi',
        className: 'XII MIPA 1',
      },
      result: {
        moduleId: 'modul-1',
        moduleTitle: 'Konsep Redoks',
        score: 6,
        total: 6,
        percent: 100,
        passed: true,
        attemptedAt: new Date().toISOString(),
      },
      summary: {
        bestPercent: 100,
        totalAttempts: 1,
      },
    });

    const res = parseAndValidateQuizPayload(validJson);
    expect(res.valid).toBe(true);
    if (res.valid) {
      expect(res.payload.student.studentName).toBe('Ahmad Fauzi');
      expect(res.payload.result.percent).toBe(100);
    }
  });

  it('rejects invalid JSON syntax and non-versioned payloads', () => {
    const invalidSyntax = '{ corrupted json';
    const res1 = parseAndValidateQuizPayload(invalidSyntax);
    expect(res1.valid).toBe(false);

    const wrongVersion = JSON.stringify({
      schemaVersion: 2,
      student: { studentName: 'Test', className: 'XII' },
      result: { moduleId: 'modul-1', score: 5, total: 5, percent: 100 },
    });
    const res2 = parseAndValidateQuizPayload(wrongVersion);
    expect(res2.valid).toBe(false);

    const missingStudent = JSON.stringify({
      schemaVersion: 1,
      result: { moduleId: 'modul-1', score: 5, total: 5, percent: 100 },
    });
    const res3 = parseAndValidateQuizPayload(missingStudent);
    expect(res3.valid).toBe(false);
  });
});

describe('Teacher Roster & CSV Export Tests', () => {
  beforeEach(() => {
    clearTeacherRoster();
    clearTeacherSession();
  });

  it('imports payloads and merges into student records with best score', () => {
    // Impor pertama: 75%
    const res1 = importQuizPayloadToRoster({
      schemaVersion: 1,
      app: 'Chem-ElectroLabs',
      exportType: 'QUIZ_RESULT',
      exportedAt: new Date().toISOString(),
      student: { studentName: 'Dewi Lestari', className: 'XII MIPA 3' },
      result: { moduleId: 'modul-1', score: 4, total: 6, percent: 67, passed: false, attemptedAt: new Date().toISOString() },
      summary: { bestPercent: 67, totalAttempts: 1 },
    });
    expect(res1.success).toBe(true);

    let roster = getTeacherRoster();
    expect(roster.length).toBe(1);
    expect(roster[0].moduleScores['modul-1']).toBe(67);

    // Impor kedua untuk siswa yang sama dengan nilai lebih tinggi: 100%
    const res2 = importQuizPayloadToRoster({
      schemaVersion: 1,
      app: 'Chem-ElectroLabs',
      exportType: 'QUIZ_RESULT',
      exportedAt: new Date().toISOString(),
      student: { studentName: 'Dewi Lestari', className: 'XII MIPA 3' },
      result: { moduleId: 'modul-1', score: 6, total: 6, percent: 100, passed: true, attemptedAt: new Date().toISOString() },
      summary: { bestPercent: 100, totalAttempts: 2 },
    });
    expect(res2.success).toBe(true);

    roster = getTeacherRoster();
    expect(roster.length).toBe(1); // Siswa tidak diduplikasi
    expect(roster[0].moduleScores['modul-1']).toBe(100); // Skor terbaik diperbarui ke 100%
  });

  it('calculates student averages and generates valid CSV with BOM', () => {
    const dummyRecord: TeacherStudentRecord = {
      studentName: 'Budi Santoso',
      className: 'XII MIPA 1',
      moduleScores: {
        'modul-1': 80,
        'modul-2': 90,
      },
      lastUpdated: new Date().toISOString(),
    };

    const avg = calculateStudentAverage(dummyRecord);
    expect(avg).toBe(85);

    const csv = exportRosterToCsv([dummyRecord]);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('Nama Siswa');
    expect(csv).toContain('"Budi Santoso"');
    expect(csv).toContain('85');
    expect(csv).toContain('"RATA-RATA KELAS"');
  });
});

describe('TeacherModePage Component Access & Session Tests', () => {
  beforeEach(() => {
    sessionStorage.clear();
    clearTeacherRoster();
    vi.restoreAllMocks();
  });

  it('starts in locked mode with code input and light protection note', () => {
    render(<TeacherModePage />);
    expect(screen.getByText(/Akses Mode Guru/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Kode Akses Pendidik/i)).toBeInTheDocument();
    expect(screen.getByText(/Catatan Perlindungan Ringan:/i)).toBeInTheDocument();
  });

  it('renders teacher email login form with email, password, and eye icon button', () => {
    render(<TeacherModePage />);
    expect(screen.getByLabelText(/Email Pendidik \/ Guru/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Kata Sandi Guru/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Tampilkan kata sandi/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Masuk Akun Guru & Buka Dashboard/i })).toBeInTheDocument();
  });

  it('toggles password visibility with eye icon button without submitting', () => {
    render(<TeacherModePage />);
    const passInput = screen.getByLabelText(/Kata Sandi Guru/i, { selector: 'input' });
    const toggleBtn = screen.getByLabelText(/Tampilkan kata sandi/i);

    expect(passInput).toHaveAttribute('type', 'password');
    expect(toggleBtn).toHaveAttribute('type', 'button');

    fireEvent.click(toggleBtn);
    expect(passInput).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText(/Sembunyikan kata sandi/i)).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(passInput).toHaveAttribute('type', 'password');
  });

  it('unlocks dashboard upon valid teacher email login and fetches Firestore records', async () => {
    vi.mocked(signInWithEmailAndPassword).mockResolvedValue({
      user: { uid: 'teacher-1', email: 'guru.kimia@gmail.com' },
    } as unknown as Awaited<ReturnType<typeof signInWithEmailAndPassword>>);

    const mockRecords: TeacherStudentRecord[] = [
      {
        uid: 'stud-1',
        studentName: 'Siti Rahma',
        className: 'XII MIPA 1',
        moduleScores: { 'modul-1': 100, 'modul-2': 80 },
        attempts: [
          { id: '1', studentName: 'Siti Rahma', className: 'XII MIPA 1', moduleId: 'modul-1', score: 5, total: 5, percent: 100, attemptedAt: '2026-01-01' },
          { id: '2', studentName: 'Siti Rahma', className: 'XII MIPA 1', moduleId: 'modul-1', score: 4, total: 5, percent: 80, attemptedAt: '2026-01-01' },
        ],
        lastUpdated: new Date().toISOString(),
      },
    ];
    vi.spyOn(teacherStorage, 'getAllFirestoreProgress').mockResolvedValue(mockRecords);

    render(<TeacherModePage />);

    const emailInput = screen.getByLabelText(/Email Pendidik \/ Guru/i);
    const passInput = screen.getByLabelText(/Kata Sandi Guru/i, { selector: 'input' });
    const submitBtn = screen.getByRole('button', { name: /Masuk Akun Guru & Buka Dashboard/i });

    fireEvent.change(emailInput, { target: { value: 'guru.kimia@gmail.com' } });
    fireEvent.change(passInput, { target: { value: 'rahasia123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Tabel Rekapitulasi Nilai Kuis/i)).toBeInTheDocument();
      expect(screen.getByText('Siti Rahma')).toBeInTheDocument();
      expect(screen.getByRole('cell', { name: 'XII MIPA 1' })).toBeInTheDocument();
      expect(screen.getByText('(2x)')).toBeInTheDocument(); // badge jumlah percobaan / remedial
    });
  });

  it('displays clear empty state message when Firestore returns no student records', async () => {
    sessionStorage.setItem(TEACHER_SESSION_KEY, 'unlocked');
    vi.spyOn(teacherStorage, 'getAllFirestoreProgress').mockResolvedValue([]);

    render(<TeacherModePage />);

    await waitFor(() => {
      expect(screen.getByText(/Belum ada data progres siswa di Firestore/i)).toBeInTheDocument();
    });
  });

  it('displays clear error message when Firestore access is denied (permission-denied)', async () => {
    sessionStorage.setItem(TEACHER_SESSION_KEY, 'unlocked');
    const permError = new Error('Missing or insufficient permissions') as Error & { code?: string };
    permError.code = 'permission-denied';
    vi.spyOn(teacherStorage, 'getAllFirestoreProgress').mockRejectedValue(permError);

    render(<TeacherModePage />);

    await waitFor(() => {
      expect(screen.getByText(/Akses ditolak \(Permission Denied\)/i)).toBeInTheDocument();
    });
  });

  it('unlocks dashboard upon valid code and locks upon clicking Kunci', async () => {
    const testCode = 'TEST_PASSPHRASE_SAMPLE';
    const testHash = await sha256(testCode);
    vi.stubEnv('VITE_TEACHER_CODE_HASH', testHash);

    render(<TeacherModePage />);

    const input = screen.getByLabelText(/Kode Akses Pendidik/i);
    const submitBtn = screen.getByRole('button', { name: /Buka Mode Guru/i });

    // Masukkan kode akses pengujian
    fireEvent.change(input, { target: { value: testCode } });
    fireEvent.click(submitBtn);

    // Tunggu hingga dashboard terbuka
    await waitFor(() => {
      expect(screen.getByText(/Sesi Pendidik Aktif/i)).toBeInTheDocument();
      expect(screen.getByText(/Tabel Rekapitulasi Nilai Kuis/i)).toBeInTheDocument();
    });

    // Sesi harus tersimpan di sessionStorage
    expect(sessionStorage.getItem(TEACHER_SESSION_KEY)).toBe('unlocked');

    // Klik tombol Kunci Mode Guru
    const lockBtn = screen.getByRole('button', { name: /Kunci Mode Guru/i });
    fireEvent.click(lockBtn);

    // Harus kembali ke tampilan terkunci
    expect(screen.getByText(/Akses Mode Guru/i)).toBeInTheDocument();
    expect(sessionStorage.getItem(TEACHER_SESSION_KEY)).toBeNull();

    vi.unstubAllEnvs();
  });
});
