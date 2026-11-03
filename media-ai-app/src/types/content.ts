// src/types/content.ts

// === Tipe untuk F8 (Latihan Interaktif) ===
export interface MatchingItem {
  id: string;
  text: string;
  categoryId?: string; // Untuk mencocokkan kategori
  matchId?: string;    // Untuk mencocokkan pasangan
  matchText?: string;
  explanation: string;
}

export interface OrderingItem {
  id: string;
  text: string;
  order: number;
}

export interface ExerciseData {
  id: string;
  type: 'matching' | 'ordering';
  title: string;
  instruction: string;
  categories?: { id: string; label: string }[];
  items: (MatchingItem | OrderingItem)[];
}

// === Tipe untuk F9 (Kuis) ===
export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctAnswer: string;
  explanation: string;
}

// Root Types untuk JSON
export interface ExercisesJSON {
  [moduleId: string]: ExerciseData[];
}

export interface QuizzesJSON {
  [moduleId: string]: QuizQuestion[];
}