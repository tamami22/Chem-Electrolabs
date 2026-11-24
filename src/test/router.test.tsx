import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../App.tsx';
import { useStudentStore } from '../stores/useStudentStore.ts';

describe('Router & Navigation Skeleton Tests', () => {
  beforeEach(() => {
    useStudentStore.getState().setProfile('Siswa Uji', 'XII-1');
    useStudentStore.getState().enterSession();
  });
  it('renders HomePage at root route "/"', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText(/Kuasai Elektrokimia Lewat/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Chem-ElectroLabs/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders LearningMapPage at "/peta"', () => {
    render(
      <MemoryRouter initialEntries={['/peta']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText(/Peta Belajar Elektrokimia Interaktif/i)).toBeInTheDocument();
    expect(screen.getByText(/Modul 1 • TP1/i)).toBeInTheDocument();
  });

  it('renders ModulePage at valid "/modul/1-redoks"', () => {
    render(
      <MemoryRouter initialEntries={['/modul/1-redoks']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText(/Konsep Reaksi Redoks dalam Elektrokimia/i)).toBeInTheDocument();
    expect(screen.getByText(/Langkah Pembelajaran/i)).toBeInTheDocument();
  });

  it('renders module not found message for invalid module slug', () => {
    render(
      <MemoryRouter initialEntries={['/modul/invalid-slug']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText(/Modul Tidak Ditemukan/i)).toBeInTheDocument();
  });

  it('renders GlossaryPage at "/glosarium"', () => {
    render(
      <MemoryRouter initialEntries={['/glosarium']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText(/Glosarium & Tabel Potensial Standar/i)).toBeInTheDocument();
  });

  it('renders ResetPasswordPage at "/reset-password"', () => {
    render(
      <MemoryRouter initialEntries={['/reset-password']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText(/Pemulihan & Reset Kata Sandi Akun/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Minta Tautan Reset Kata Sandi/i })).toBeInTheDocument();
  });

  it('renders NotFoundPage at unknown route', () => {
    render(
      <MemoryRouter initialEntries={['/halaman-tidak-ada']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText(/404 - Halaman Tidak Ditemukan/i)).toBeInTheDocument();
  });
});
