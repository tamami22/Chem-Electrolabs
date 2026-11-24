import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ModulePage from '../pages/ModulePage.tsx';
import { useStudentStore } from '../stores/useStudentStore.ts';
import { resetProgress } from '../lib/storage.ts';

describe('Module Learning & Triple Representation Page Tests', () => {
  beforeEach(() => {
    resetProgress();
    useStudentStore.getState().reset();
    useStudentStore.getState().setProfile('Siswa Uji', 'XII-1');
    useStudentStore.getState().enterSession();
  });

  const renderModule = (slug: string) => {
    return render(
      <MemoryRouter initialEntries={[`/modul/${slug}`]}>
        <Routes>
          <Route path="/modul/:slug" element={<ModulePage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders Module 1 header, learning objectives, and initial step with progress bar', () => {
    renderModule('1-redoks');

    // 1. Header modul & TP
    expect(
      screen.getByRole('heading', { level: 1, name: /Konsep Reaksi Redoks dalam Elektrokimia/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/TP1/i)).toBeInTheDocument();
    expect(screen.getByText(/35 Menit/i)).toBeInTheDocument();

    // 2. Tujuan pembelajaran khusus
    expect(
      screen.getByText(/Menjelaskan konsep oksidasi dan reduksi berdasarkan pelepasan dan penerimaan elektron/i)
    ).toBeInTheDocument();

    // 3. Progres Langkah (Step 1 dari 2)
    expect(screen.getByText(/Langkah Pembelajaran 1 dari 2:/i)).toBeInTheDocument();
    expect(screen.getByText(/Progres: 50%/i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /Fenomena Reaksi Seng dalam Larutan Tembaga\(II\) Sulfat/i })
    ).toBeInTheDocument();
  });

  it('provides accessible triple representation tabs (Makroskopik, Submikroskopik, Simbolik) per step', () => {
    renderModule('1-redoks');

    // Tablist tiga level
    const tablist = screen.getByRole('tablist', { name: /Tiga Level Representasi Kimia Johnstone/i });
    expect(tablist).toBeInTheDocument();

    const makroTab = screen.getByRole('tab', { name: /Makroskopik/i });
    const submikroTab = screen.getByRole('tab', { name: /Submikroskopik/i });
    const simbolikTab = screen.getByRole('tab', { name: /Simbolik/i });

    expect(makroTab).toHaveAttribute('aria-selected', 'true');
    expect(submikroTab).toHaveAttribute('aria-selected', 'false');
    expect(simbolikTab).toHaveAttribute('aria-selected', 'false');

    // Konten Makroskopik aktif secara default
    expect(screen.getByText(/Level Makroskopik • Gejala Fisik Teramati/i)).toBeInTheDocument();
    expect(screen.getByText(/Lempeng logam seng \(Zn\) menipis dan permukaannya kasar/i)).toBeInTheDocument();

    // Berpindah ke Tab Submikroskopik
    fireEvent.click(submikroTab);
    expect(submikroTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/Level Submikroskopik • Partikel Atom, Ion & Elektron/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Dua elektron berpindah secara langsung dari atom Zn ke ion Cu²⁺/i)
    ).toBeInTheDocument();

    // Berpindah ke Tab Simbolik
    fireEvent.click(simbolikTab);
    expect(simbolikTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/Level Simbolik • Notasi Kimia & KaTeX/i)).toBeInTheDocument();
    expect(screen.getByText(/Rumus & Persamaan Reaksi \(KaTeX\):/i)).toBeInTheDocument();
    expect(screen.getByText(/KAT-RED/i)).toBeInTheDocument();
    expect(screen.getByText(/AN-OKS/i)).toBeInTheDocument();
  });

  it('renders QuickCheck card for step 1 formatif check', () => {
    renderModule('1-redoks');

    // Pertanyaan QuickCheck muncul
    expect(screen.getByText(/Cek Pemahaman Cepat \(Quick Check\)/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Mengapa warna biru larutan CuSO₄ memudar seiring berjalannya reaksi\?/i)
    ).toBeInTheDocument();
  });

  it('navigates through steps one by one using previous/next and step pills', () => {
    renderModule('1-redoks');

    const prevBtn = screen.getByRole('button', { name: /Langkah Sebelumnya/i });
    const nextBtn = screen.getByRole('button', { name: /Lanjut ke Langkah 2/i });

    // Pada langkah 1, tombol sebelumnya dinonaktifkan
    expect(prevBtn).toBeDisabled();

    // Klik lanjut ke langkah 2
    fireEvent.click(nextBtn);

    // Langkah 2 aktif, progres 100%
    expect(screen.getByText(/Langkah Pembelajaran 2 dari 2:/i)).toBeInTheDocument();
    expect(screen.getByText(/Progres: 100%/i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /Konsep Reduktor, Oksidator, dan Transfer Elektron/i })
    ).toBeInTheDocument();

    // Pada langkah terakhir, tombol selesai muncul
    expect(screen.getByText(/Seluruh langkah materi telah diselesaikan!/i)).toBeInTheDocument();

    // Tombol sebelumnya sekarang aktif
    expect(prevBtn).not.toBeDisabled();
    fireEvent.click(prevBtn);

    // Kembali ke langkah 1
    expect(screen.getByText(/Langkah Pembelajaran 1 dari 2:/i)).toBeInTheDocument();

    // Navigasi lewat pill tombol langkah
    const step2Pill = screen.getByRole('button', { name: /Langkah 2: Konsep Reduktor/i });
    fireEvent.click(step2Pill);
    expect(screen.getByText(/Langkah Pembelajaran 2 dari 2:/i)).toBeInTheDocument();
  });

  it('keeps full quiz separate and provides assessment link', () => {
    renderModule('1-redoks');

    // Banner evaluasi mandiri terhubung ke halaman Asesmen
    expect(screen.getByText(/Uji Penguasaan Konsep Mandiri/i)).toBeInTheDocument();
    const assessLink = screen.getByRole('link', { name: /Buka Kuis Asesmen Modul 1/i });
    expect(assessLink).toBeInTheDocument();
    expect(assessLink).toHaveAttribute('href', '/asesmen?modul=modul-1');
  });

  it('renders 404 card when invalid module slug is requested', () => {
    renderModule('modul-tidak-valid');

    expect(screen.getByText(/Modul Tidak Ditemukan/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Kembali ke Peta Belajar/i })).toBeInTheDocument();
  });
});

