import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  prepareShuffledQuestion,
  isAnswerCorrect,
  calculateQuizScore,
} from '../components/quiz/quizUtils.ts';
import {
  saveQuizScore,
  resetProgress,
  recordQuizAttempt,
  getAllAttempts,
  generateQuizExportPayload,
  saveStudentProfile,
  getStudentProfile,
} from '../lib/storage.ts';
import { useStudentStore } from '../stores/useStudentStore.ts';
import QuickCheckCard from '../components/quiz/QuickCheckCard.tsx';
import QuizPlayer from '../components/quiz/QuizPlayer.tsx';
import AssessmentPage from '../pages/AssessmentPage.tsx';
import type { QuickCheck, QuizQuestion } from '../content/types.ts';

describe('Quiz Utilities Logic Tests', () => {
  it('correctly shuffles options and updates correct answer index without breaking keys', () => {
    const options = ['Opsi 0 (Salah)', 'Opsi 1 (Benar)', 'Opsi 2 (Salah)', 'Opsi 3 (Salah)'];
    const originalCorrectIndex = 1;

    // Gunakan fungsi random deterministik
    const reverseRandom = () => 0;
    const { shuffledOptions, newCorrectAnswer, shuffledToOriginal } = prepareShuffledQuestion(
      options,
      originalCorrectIndex,
      reverseRandom
    );

    expect(shuffledOptions.length).toBe(4);
    // Teks jawaban benar pada indeks baru harus persis sama dengan opsi di indeks asli 1
    expect(shuffledOptions[newCorrectAnswer]).toBe(options[originalCorrectIndex]);
    expect(shuffledToOriginal[newCorrectAnswer]).toBe(originalCorrectIndex);
  });

  it('evaluates answer correctness properly', () => {
    expect(isAnswerCorrect(2, 2)).toBe(true);
    expect(isAnswerCorrect(1, 2)).toBe(false);
    expect(isAnswerCorrect(null, 2)).toBe(false);
    expect(isAnswerCorrect(-1, 2)).toBe(false);
  });

  it('calculates score summary and passing threshold accurately (≥75%)', () => {
    const passedResults = [true, true, true, false]; // 3/4 = 75%
    const scorePass = calculateQuizScore(passedResults);
    expect(scorePass.correct).toBe(3);
    expect(scorePass.total).toBe(4);
    expect(scorePass.percentage).toBe(75);
    expect(scorePass.passed).toBe(true);

    const failedResults = [true, false, true, false]; // 2/4 = 50%
    const scoreFail = calculateQuizScore(failedResults);
    expect(scoreFail.correct).toBe(2);
    expect(scoreFail.total).toBe(4);
    expect(scoreFail.percentage).toBe(50);
    expect(scoreFail.passed).toBe(false);
  });
});

describe('Student Profile & Attempt Records Storage Tests', () => {
  beforeEach(() => {
    resetProgress();
    useStudentStore.getState().reset();
  });

  it('saves and retrieves student profile in localStorage', () => {
    const profile = saveStudentProfile('Dewi Sartika', 'XII MIPA 3');
    expect(profile.studentName).toBe('Dewi Sartika');
    expect(profile.className).toBe('XII MIPA 3');

    const retrieved = getStudentProfile();
    expect(retrieved.studentName).toBe('Dewi Sartika');
    expect(retrieved.className).toBe('XII MIPA 3');
  });

  it('records each attempt with full details, preserves all attempts, and computes best score', () => {
    // Percobaan 1: 4 dari 6 (67%)
    const { attempt: att1, bestScore: best1 } = recordQuizAttempt({
      studentName: 'Ahmad Fauzi',
      className: 'XII MIPA 1',
      moduleId: 'modul-1',
      score: 4,
      total: 6,
      percent: 67,
    });

    expect(att1.studentName).toBe('Ahmad Fauzi');
    expect(att1.className).toBe('XII MIPA 1');
    expect(att1.percent).toBe(67);
    expect(best1.score).toBe(67);
    expect(best1.passed).toBe(false);

    // Percobaan 2: 6 dari 6 (100%)
    const { attempt: att2, bestScore: best2 } = recordQuizAttempt({
      studentName: 'Ahmad Fauzi',
      className: 'XII MIPA 1',
      moduleId: 'modul-1',
      score: 6,
      total: 6,
      percent: 100,
    });

    expect(att2.percent).toBe(100);
    expect(best2.score).toBe(100);
    expect(best2.passed).toBe(true);
    expect(best2.attemptsCount).toBe(2);

    // Percobaan 3: 5 dari 6 (83%) - skor terbaik harus tetap 100%
    const { bestScore: best3 } = recordQuizAttempt({
      studentName: 'Ahmad Fauzi',
      className: 'XII MIPA 1',
      moduleId: 'modul-1',
      score: 5,
      total: 6,
      percent: 83,
    });

    expect(best3.score).toBe(100);
    expect(best3.attemptsCount).toBe(3);

    // Seluruh riwayat percobaan tersimpan lengkap
    const allAttempts = getAllAttempts();
    expect(allAttempts.length).toBe(3);
    expect(allAttempts[0].percent).toBe(67);
    expect(allAttempts[1].percent).toBe(100);
    expect(allAttempts[2].percent).toBe(83);
  });

  it('generates valid versioned export payload (schemaVersion: 1)', () => {
    const { attempt } = recordQuizAttempt({
      studentName: 'Budi Santoso',
      className: 'XII MIPA 2',
      moduleId: 'modul-2',
      score: 7,
      total: 8,
      percent: 88,
    });

    const payload = generateQuizExportPayload(attempt, 'Sel Volta dan Potensial Sel');
    expect(payload.schemaVersion).toBe(1);
    expect(payload.app).toBe('Chem-ElectroLabs');
    expect(payload.exportType).toBe('QUIZ_RESULT');
    expect(payload.student.studentName).toBe('Budi Santoso');
    expect(payload.student.className).toBe('XII MIPA 2');
    expect(payload.result.moduleId).toBe('modul-2');
    expect(payload.result.score).toBe(7);
    expect(payload.result.total).toBe(8);
    expect(payload.result.percent).toBe(88);
    expect(payload.result.passed).toBe(true);
    expect(payload.summary.bestPercent).toBe(88);
    expect(payload.summary.totalAttempts).toBe(1);
  });

  it('updates state reactively via Zustand useStudentStore', () => {
    const store = useStudentStore.getState();
    store.setProfile('Rina Anggraini', 'XII Kimia 1');

    expect(useStudentStore.getState().studentName).toBe('Rina Anggraini');
    expect(useStudentStore.getState().className).toBe('XII Kimia 1');

    const recorded = store.recordAttempt({
      moduleId: 'modul-4',
      score: 7,
      total: 7,
      percent: 100,
    });

    expect(recorded.studentName).toBe('Rina Anggraini');
    expect(useStudentStore.getState().attempts.length).toBe(1);
  });
});

describe('QuickCheckCard Component Tests', () => {
  const dummyQC: QuickCheck = {
    question: 'Mengapa ion Cu²⁺ tereduksi di katoda?',
    options: [
      'Karena Cu²⁺ menangkap 2 elektron',
      'Karena Cu²⁺ melepaskan proton',
      'Karena Cu²⁺ menyerap panas',
      'Karena larutan bersifat basa',
    ],
    correctAnswer: 0,
    explanation: 'Ion Cu²⁺ menangkap 2 elektron dari katoda membentuk padatan Cu(s).',
  };

  it('renders question, radio options with A-D badges, and disabled check button initially', () => {
    render(<QuickCheckCard quickCheck={dummyQC} />);
    expect(screen.getByText(/Cek Pemahaman Cepat/i)).toBeInTheDocument();
    expect(screen.getByText(/Mengapa ion Cu²⁺ tereduksi di katoda\?/i)).toBeInTheDocument();

    const checkBtn = screen.getByRole('button', { name: /Periksa Jawaban/i });
    expect(checkBtn).toBeDisabled();
  });

  it('enables check button on option selection and reveals feedback with explanation upon check', () => {
    const handleChecked = vi.fn();
    render(<QuickCheckCard quickCheck={dummyQC} onAnswerChecked={handleChecked} />);

    const radioButtons = screen.getAllByRole('radio');
    expect(radioButtons.length).toBe(4);

    // Pilih salah satu opsi
    fireEvent.click(radioButtons[0]);

    const checkBtn = screen.getByRole('button', { name: /Periksa Jawaban/i });
    expect(checkBtn).not.toBeDisabled();

    // Klik periksa
    fireEvent.click(checkBtn);
    expect(handleChecked).toHaveBeenCalledTimes(1);

    // Penjelasan konsep harus muncul
    expect(screen.getByText(/Ion Cu²⁺ menangkap 2 elektron dari katoda/i)).toBeInTheDocument();
  });
});

describe('QuizPlayer Component Tests', () => {
  beforeEach(() => {
    resetProgress();
    useStudentStore.getState().reset();
  });

  const dummyQuestions: QuizQuestion[] = [
    {
      id: 'q1',
      type: 'multiple_choice',
      tpCode: 'TP1',
      tripleRepLevel: 'simbolik',
      question: 'Apa peran Zn pada reaksi Zn + Cu²⁺ → Zn²⁺ + Cu?',
      options: ['Reduktor', 'Oksidator', 'Katalis', 'Pelarut'],
      correctAnswer: 0,
      explanation: 'Zn mengalami kenaikan bilangan oksidasi sehingga bertindak sebagai reduktor.',
    },
    {
      id: 'q2',
      type: 'multiple_choice',
      tpCode: 'TP2',
      tripleRepLevel: 'makroskopik',
      question: 'Kutub muatan anoda pada sel volta adalah...',
      options: ['Negatif', 'Positif', 'Netral', 'Bergantian'],
      correctAnswer: 0,
      explanation: 'Pada sel volta, anoda merupakan kutub negatif tempat pelepasan elektron.',
    },
  ];

  it('prompts student identity before quiz starts if not filled, then proceeds to questions', () => {
    render(
      <MemoryRouter>
        <QuizPlayer
          questions={dummyQuestions}
          title="Kuis Uji Coba"
          moduleSlug="1-redoks"
          moduleId="modul-1"
        />
      </MemoryRouter>
    );

    // Formulir identitas siswa harus muncul terlebih dahulu
    expect(screen.getByText(/Identitas Siswa Sebelum Kuis/i)).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/Nama Lengkap Siswa/i);
    const classInput = screen.getByLabelText(/Kelas \/ Rombel/i);
    const submitBtn = screen.getByRole('button', { name: /Mulai Kerjakan Kuis/i });

    // Isi nama dan kelas
    fireEvent.change(nameInput, { target: { value: 'Siti Rahma' } });
    fireEvent.change(classInput, { target: { value: 'XII MIPA 1' } });
    fireEvent.click(submitBtn);

    // Setelah disubmit, soal nomor 1 langsung terbuka
    expect(screen.getByText(/Soal 1 dari 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Siti Rahma/i)).toBeInTheDocument();
    expect(screen.getByText(/XII MIPA 1/i)).toBeInTheDocument();
  });

  it('runs quiz, presents final score, copies result code and triggers download', async () => {
    // Siapkan identitas terlebih dahulu
    useStudentStore.getState().setProfile('Ahmad Fauzi', 'XII MIPA 2');

    const handleFinish = vi.fn();
    const handleBack = vi.fn();

    // Mock clipboard
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <MemoryRouter>
        <QuizPlayer
          questions={dummyQuestions}
          title="Kuis Uji Coba"
          moduleTitle="Reaksi Redoks"
          moduleSlug="1-redoks"
          moduleId="modul-1"
          onFinish={handleFinish}
          onBackToList={handleBack}
        />
      </MemoryRouter>
    );

    // Langsung berada di soal 1 karena identitas sudah terisi
    expect(screen.getByText(/Soal 1 dari 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Ahmad Fauzi/i)).toBeInTheDocument();

    // Jawab soal 1
    const optionsQ1 = screen.getAllByRole('radio');
    fireEvent.click(optionsQ1[0]);
    fireEvent.click(screen.getByRole('button', { name: /Periksa Jawaban/i }));

    // Lanjut ke soal 2
    fireEvent.click(screen.getByRole('button', { name: /Lanjut ke Soal Berikutnya/i }));

    // Jawab soal 2
    const optionsQ2 = screen.getAllByRole('radio');
    fireEvent.click(optionsQ2[0]);
    fireEvent.click(screen.getByRole('button', { name: /Periksa Jawaban/i }));

    // Buka ringkasan skor
    fireEvent.click(screen.getByRole('button', { name: /Lihat Hasil & Skor Kuis/i }));

    // Ringkasan skor & identitas muncul
    expect(screen.getByText(/Ringkasan Hasil Evaluasi Kuis/i)).toBeInTheDocument();
    expect(screen.getByText(/Nilai Akhir/i)).toBeInTheDocument();
    expect(handleFinish).toHaveBeenCalledTimes(1);

    // Tombol ekspor hasil ke guru
    const copyBtn = screen.getByRole('button', { name: /Salin Kode Hasil/i });
    expect(copyBtn).toBeInTheDocument();
    fireEvent.click(copyBtn);
    expect(writeTextMock).toHaveBeenCalledTimes(1);

    const downloadBtn = screen.getByRole('button', { name: /Unduh File Hasil/i });
    expect(downloadBtn).toBeInTheDocument();
    fireEvent.click(downloadBtn);

    // Tombol lihat payload JSON
    const previewBtn = screen.getByRole('button', { name: /Lihat Format JSON/i });
    fireEvent.click(previewBtn);
    expect(screen.getByText(/"schemaVersion": 1/i)).toBeInTheDocument();

    // Tombol navigasi akhir
    expect(screen.getByRole('button', { name: /Ulangi Kuis/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Kembali ke Daftar Kuis/i })[0]).toBeInTheDocument();
    expect(screen.getByText(/Pelajari Materi Modul/i)).toBeInTheDocument();
  });
});

describe('AssessmentPage Component Tests', () => {
  beforeEach(() => {
    resetProgress();
    useStudentStore.getState().reset();
  });

  it('renders 5 module cards with titles, multiple choice questions count, and status', () => {
    render(
      <MemoryRouter initialEntries={['/asesmen']}>
        <AssessmentPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Kuis Diagnostik Elektrokimia Berbasis TP1–TP6/i)).toBeInTheDocument();
    expect(screen.getByText(/Konsep Reaksi Redoks dalam Elektrokimia/i)).toBeInTheDocument();
    expect(screen.getByText(/Sel Volta dan Potensial Sel Standar/i)).toBeInTheDocument();
    expect(screen.getByText(/Sel Elektrolisis dan Aturan Reaksi Elektrode/i)).toBeInTheDocument();
    expect(screen.getByText(/Hukum Faraday dan Stoikiometri Elektrokimia/i)).toBeInTheDocument();
    expect(screen.getByText(/Korosi Logam dan Metode Pencegahannya/i)).toBeInTheDocument();

    const startButtons = screen.getAllByRole('button', { name: /Mulai Kuis Modul/i });
    expect(startButtons.length).toBe(5);
  });

  it('displays active participant banner and recorded best score badge when progress is present', () => {
    useStudentStore.getState().setProfile('Rian Pratama', 'XII MIPA 4');
    saveQuizScore('modul-1', 6, 6); // 100%

    render(
      <MemoryRouter initialEntries={['/asesmen']}>
        <AssessmentPage />
      </MemoryRouter>
    );

    // Banner peserta aktif di header
    expect(screen.getByText(/Peserta Aktif:/i)).toBeInTheDocument();
    expect(screen.getByText(/Rian Pratama/i)).toBeInTheDocument();

    // Badge skor terbaik pada kartu modul 1
    expect(screen.getByText(/Skor Terbaik: 100%/i)).toBeInTheDocument();
    expect(screen.getByText('Lulus')).toBeInTheDocument();
  });

  it('opens module quiz player when a module query param is provided', () => {
    useStudentStore.getState().setProfile('Rian Pratama', 'XII MIPA 4');

    render(
      <MemoryRouter initialEntries={['/asesmen?modul=modul-1']}>
        <AssessmentPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Kuis Pemahaman Modul 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Soal 1 dari 6/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Kembali ke Daftar Kuis/i })).toBeInTheDocument();
  });
});
