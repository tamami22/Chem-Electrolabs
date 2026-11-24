/**
 * Chem-ElectroLabs - Quiz & Assessment Utilities
 * Fungsi murni untuk pengacakan opsi, pelacakan kunci jawaban, dan penghitungan skor.
 */

export interface ShuffledQuestionData {
  shuffledOptions: string[];
  newCorrectAnswer: number;
  shuffledToOriginal: number[];
}

/**
 * Mengacak urutan opsi pilihan ganda tanpa merusak integritas kunci jawaban.
 * @param options Array teks opsi asli
 * @param correctAnswer Indeks jawaban benar pada array asli
 * @param randomFn Fungsi penghasil bilangan acak opsional (untuk deterministik dalam testing)
 */
export function prepareShuffledQuestion(
  options: string[],
  correctAnswer: number,
  randomFn: () => number = Math.random
): ShuffledQuestionData {
  if (!options || options.length === 0) {
    return {
      shuffledOptions: [],
      newCorrectAnswer: -1,
      shuffledToOriginal: [],
    };
  }

  // Buat pasangan opsi dengan indeks aslinya
  const indexed = options.map((option, origIndex) => ({
    option,
    origIndex,
  }));

  // Algoritma Fisher-Yates shuffle
  const shuffled = [...indexed];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const shuffledOptions = shuffled.map((item) => item.option);
  const shuffledToOriginal = shuffled.map((item) => item.origIndex);
  const newCorrectAnswer = shuffled.findIndex((item) => item.origIndex === correctAnswer);

  return {
    shuffledOptions,
    newCorrectAnswer,
    shuffledToOriginal,
  };
}

/**
 * Mengevaluasi kebenaran jawaban pengguna
 */
export function isAnswerCorrect(
  selectedShuffledIndex: number | null,
  newCorrectAnswer: number
): boolean {
  if (selectedShuffledIndex === null || selectedShuffledIndex < 0) {
    return false;
  }
  return selectedShuffledIndex === newCorrectAnswer;
}

export interface QuizScoreSummary {
  correct: number;
  total: number;
  percentage: number;
  passed: boolean; // Ambang penguasaan kompetensi ≥ 75%
}

/**
 * Menghitung ringkasan skor akhir kuis
 */
export function calculateQuizScore(results: boolean[]): QuizScoreSummary {
  const total = results.length;
  if (total === 0) {
    return { correct: 0, total: 0, percentage: 0, passed: false };
  }
  const correct = results.filter(Boolean).length;
  const percentage = Math.round((correct / total) * 100);
  return {
    correct,
    total,
    percentage,
    passed: percentage >= 75,
  };
}

