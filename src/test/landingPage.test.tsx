import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage.tsx';
import AppLayout from '../components/layout/AppLayout.tsx';
import { useStudentStore } from '../stores/useStudentStore.ts';
import { resetProgress } from '../lib/storage.ts';

describe('Public Landing Page & Student Header Tests', () => {
  beforeEach(() => {
    resetProgress();
    useStudentStore.getState().reset();
  });

  it('renders landing page with hero, three representations, five modules, 3-step guide, and privacy note', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <HomePage />
      </MemoryRouter>
    );

    // 1. Hero dengan judul kontras tinggi dan satu kalimat penjelasan
    expect(screen.getByText(/Kuasai Elektrokimia Lewat/i)).toBeInTheDocument();
    expect(screen.getByText(/Tiga Representasi Kimia/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Hubungkan gejala fisik kasat mata \(makroskopik\)/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mulai Belajar/i })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Masuk Guru/i }).length).toBeGreaterThanOrEqual(1);

    // 2. Tiga kartu representasi
    expect(screen.getByText(/Representasi Makroskopik/i)).toBeInTheDocument();
    expect(screen.getByText(/Representasi Submikroskopik/i)).toBeInTheDocument();
    expect(screen.getByText(/Representasi Simbolik/i)).toBeInTheDocument();

    // 3. Kartu lima modul membaca judul dan estimatedMinutes dari modul-N.json
    expect(screen.getByText(/Konsep Reaksi Redoks dalam Elektrokimia/i)).toBeInTheDocument();
    expect(screen.getAllByText(/35 Menit/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Sel Volta dan Potensial Sel Standar/i)).toBeInTheDocument();
    expect(screen.getAllByText(/45 Menit/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Sel Elektrolisis dan Aturan Reaksi Elektrode/i)).toBeInTheDocument();
    expect(screen.getByText(/Hukum Faraday dan Stoikiometri Elektrokimia/i)).toBeInTheDocument();
    expect(screen.getByText(/Korosi Logam dan Metode Pencegahannya/i)).toBeInTheDocument();

    // 4. Bagian Cara Belajar tiga langkah
    expect(screen.getByText(/Cara Belajar Mandiri di Chem-ElectroLabs/i)).toBeInTheDocument();
    expect(screen.getByText(/Amati Fenomena Nyata & Gejala Fisik/i)).toBeInTheDocument();
    expect(screen.getByText(/Telusuri Perpindahan Partikel Submikroskopik/i)).toBeInTheDocument();
    expect(screen.getByText(/Rumuskan Persamaan & Uji Kuis Mandiri/i)).toBeInTheDocument();

    // 5. Footer dengan catatan privasi singkat
    expect(screen.getByText(/Jaminan Privasi Siswa:/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Hanya nama dan kelas Anda yang disimpan secara lokal di perangkat ini/i)
    ).toBeInTheDocument();
  });

  it('hides main app navigation menu until student enters, then shows nav and logout', () => {
    // Saat siswa belum masuk:
    const { unmount } = render(
      <MemoryRouter initialEntries={['/']}>
        <AppLayout />
      </MemoryRouter>
    );

    // Navigasi menu aplikasi belum muncul di header
    expect(screen.queryByRole('navigation', { name: /Navigasi Utama/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/Peta Belajar/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Latihan/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Asesmen/i)).not.toBeInTheDocument();

    unmount();

    // Simulasikan siswa masuk:
    useStudentStore.getState().setProfile('Ahmad Fauzi', 'XII-1');

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppLayout />
      </MemoryRouter>
    );

    // Navigasi menu aplikasi sekarang muncul di header
    expect(screen.getByRole('navigation', { name: /Navigasi Utama/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Peta Belajar/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Latihan/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Asesmen/i })).toBeInTheDocument();
    expect(screen.getByText(/Ahmad Fauzi/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Keluar/i }).length).toBeGreaterThanOrEqual(1);
  });

  it('displays "Lanjutkan sebagai [nama]" and option to change identity if already entered', () => {
    useStudentStore.getState().setProfile('Rian Pratama', 'XII-4');
    useStudentStore.getState().enterSession();

    render(
      <MemoryRouter initialEntries={['/']}>
        <HomePage />
      </MemoryRouter>
    );

    // Tombol melanjutkan dengan nama tersimpan
    expect(
      screen.getByRole('button', { name: /Lanjutkan sebagai Rian Pratama/i })
    ).toBeInTheDocument();

    // Tombol ganti identitas siswa
    const changeBtn = screen.getByRole('button', { name: /Ganti Identitas Siswa/i });
    expect(changeBtn).toBeInTheDocument();
  });
});
