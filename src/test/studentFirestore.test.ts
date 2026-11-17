import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveStudentProfile,
  recordQuizAttempt,
  resetProgress,
  getStoredProgress,
  saveQuizScore,
  getBestQuizScore,
} from '../lib/storage.ts';
import { useStudentStore } from '../stores/useStudentStore.ts';

describe('Student Firestore & Offline Storage Tests', () => {
  beforeEach(() => {
    resetProgress();
    useStudentStore.getState().reset();
  });

  it('maintains offline fallback by saving profile and attempts directly to localStorage', () => {
    saveStudentProfile('Nurul Hidayah', 'XII-2', '24');
    const local1 = getStoredProgress();
    expect(local1.student.studentName).toBe('Nurul Hidayah');
    expect(local1.student.className).toBe('XII-2');
    expect(local1.student.attendanceNumber).toBe('24');

    recordQuizAttempt({
      studentName: 'Nurul Hidayah',
      className: 'XII-2',
      moduleId: '1-redoks',
      score: 5,
      total: 5,
      percent: 100,
    });

    const local2 = getStoredProgress();
    expect(local2.attempts.length).toBe(1);
    expect(local2.quizScores['1-redoks'].score).toBe(100);
    expect(local2.quizScores['1-redoks'].passed).toBe(true);
  });

  it('correctly records multiple quiz attempts and computes best score per module', () => {
    saveQuizScore('1-redoks', 3, 5); // 60%
    expect(getBestQuizScore('1-redoks')?.score).toBe(60);
    expect(getBestQuizScore('1-redoks')?.passed).toBe(false);

    saveQuizScore('1-redoks', 4, 5); // 80% (naik)
    expect(getBestQuizScore('1-redoks')?.score).toBe(80);
    expect(getBestQuizScore('1-redoks')?.passed).toBe(true);
    expect(getBestQuizScore('1-redoks')?.attemptsCount).toBe(2);

    saveQuizScore('1-redoks', 2, 5); // 40% (tidak menurunkan skor terbaik)
    expect(getBestQuizScore('1-redoks')?.score).toBe(80);
    expect(getBestQuizScore('1-redoks')?.attemptsCount).toBe(3);
  });

  it('clears student session and credentials on logout', async () => {
    useStudentStore.getState().setProfile('Siti Aminah', 'XII-3');
    useStudentStore.getState().enterSession();
    expect(useStudentStore.getState().isEntered).toBe(true);

    await useStudentStore.getState().logout();
    expect(useStudentStore.getState().isEntered).toBe(false);
    expect(useStudentStore.getState().uid).toBeNull();
  });

  it('resets progress cleanly across store and local storage', () => {
    useStudentStore.getState().setProfile('Ahmad Dani', 'XII-7');
    useStudentStore.getState().recordAttempt({
      moduleId: '2-volta',
      score: 5,
      total: 5,
      percent: 100,
    });
    expect(useStudentStore.getState().attempts.length).toBe(1);

    useStudentStore.getState().reset();
    expect(useStudentStore.getState().studentName).toBe('');
    expect(useStudentStore.getState().attempts.length).toBe(0);
    expect(getStoredProgress().attempts.length).toBe(0);
  });
});
