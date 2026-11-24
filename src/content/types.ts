/**
 * Chem-ElectroLabs - Content Types
 * Definisi tipe data untuk Modul Pembelajaran (Triple Representation), Latihan, Kuis, dan Glosarium.
 */

export type TripleRepLevel = 'makroskopik' | 'submikroskopik' | 'simbolik';

export interface MacroscopicContent {
  title: string;
  description: string;
  visualAlt: string;
  observations: string[];
}

export interface SubmicroscopicContent {
  title: string;
  description: string;
  visualAlt: string;
  particles: string[];
}

export interface SymbolicContent {
  title: string;
  latexFormulas: string[];
  explanation: string;
  reactions: string[];
}

export interface TripleRepContent {
  macroscopic: MacroscopicContent;
  submicroscopic: SubmicroscopicContent;
  symbolic: SymbolicContent;
}

export interface QuickCheck {
  question: string;
  options: string[];
  correctAnswer: number;
  correctIndex?: number;
  explanation: string;
}

export interface ModuleStep {
  stepNumber: number;
  title: string;
  summary: string;
  tripleRep: TripleRepContent;
  quickCheck?: QuickCheck;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'short_answer';
  tpCode: string;
  tripleRepLevel: TripleRepLevel;
  question: string;
  options?: string[];
  correctAnswer: number | string;
  correctIndex?: number;
  explanation: string; // Umpan balik konsep mendalam
}

export interface InteractiveExerciseItem {
  id: string;
  prompt: string;
  targetCategory: string;
}

export interface InteractiveExercise {
  id: string;
  title: string;
  instruction: string;
  type: 'matching' | 'labeling' | 'classification';
  categories: string[];
  items: InteractiveExerciseItem[];
}

export interface ModuleContent {
  id: string;
  moduleNumber: number;
  slug: string;
  title: string;
  subtitle: string;
  tpCodes: string[];
  learningObjectives: string[];
  estimatedMinutes: number;
  simulationType?: 'volta' | 'electrolysis' | 'faraday';
  steps: ModuleStep[];
  exercises: InteractiveExercise[];
  quiz: QuizQuestion[];
}

export interface GlossaryTerm {
  id: string;
  term: string;
  category: 'redoks' | 'volta' | 'elektrolisis' | 'faraday' | 'korosi' | 'umum';
  definition: string;
  tripleRepRole?: string;
  relatedModuleId: string;
}

