import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../App.tsx';
import { useStudentStore } from '../stores/useStudentStore.ts';
import { resetProgress } from '../lib/storage.ts';

describe('Student Entry Flow & Route Guarding Tests', () => {
  beforeEach(() => {
    resetProgress();
    useStudentStore.getState().reset();
  });

  it('redirects unentered student from protected routes (/, /peta) to /masuk with direct email login form', () => {
    // 1. Coba buka "/" tanpa masuk
    const { unmount } = render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );

    // Otomatis dialihkan ke form login email siswa (tanpa tab)
    expect(screen.getByRole('heading', { name: /Masuk Akun Siswa/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Alamat Email Siswa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Kata Sandi/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Masuk Akun Siswa/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Daftar di sini/i })).toBeInTheDocument();
    unmount();

    // 2. Coba buka "/peta" langsung tanpa masuk
    render(
      <MemoryRouter initialEntries={['/peta']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Masuk Akun Siswa/i })).toBeInTheDocument();
  });

  it('allows access to Mode Guru (/guru) without being blocked by student gate', () => {
    render(
      <MemoryRouter initialEntries={['/guru']}>
        <AppRoutes />
      </MemoryRouter>
    );

    // Halaman Mode Guru terbuka (meminta kode akses guru, bukan form login siswa)
    expect(screen.getByText(/Akses Mode Guru/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Kode Akses Pendidik/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Alamat Email Siswa/i)).not.toBeInTheDocument();
  });

  it('validates email and password on the login form', () => {
    render(
      <MemoryRouter initialEntries={['/masuk']}>
        <AppRoutes />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Alamat Email Siswa/i);
    const passwordInput = screen.getByLabelText(/Kata Sandi/i, { selector: 'input' });
    const loginBtn = screen.getByRole('button', { name: /Masuk Akun Siswa/i });

    // 1. Submit tanpa email
    fireEvent.change(emailInput, { target: { value: '' } });
    fireEvent.click(loginBtn);
    expect(screen.getByRole('alert')).toHaveTextContent(/masukkan alamat email yang valid/i);

    // 2. Submit dengan format email salah
    fireEvent.change(emailInput, { target: { value: 'email-tidak-valid' } });
    fireEvent.click(loginBtn);
    expect(screen.getByRole('alert')).toHaveTextContent(/masukkan alamat email yang valid/i);

    // 3. Email valid tapi tanpa kata sandi
    fireEvent.change(emailInput, { target: { value: 'siswa@sekolah.sch.id' } });
    fireEvent.change(passwordInput, { target: { value: '' } });
    fireEvent.click(loginBtn);
    expect(screen.getByRole('alert')).toHaveTextContent(/masukkan kata sandi akun Anda/i);
  });

  it('toggles password visibility with eye icon button without submitting the form', () => {
    render(
      <MemoryRouter initialEntries={['/masuk']}>
        <AppRoutes />
      </MemoryRouter>
    );

    const passwordInput = screen.getByLabelText(/Kata Sandi/i, { selector: 'input' });
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Tombol berjenis type="button" dengan aria-label Tampilkan kata sandi
    const toggleBtn = screen.getByRole('button', { name: /Tampilkan kata sandi/i });
    expect(toggleBtn).toHaveAttribute('type', 'button');

    // Klik 1: menampilkan kata sandi
    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /Sembunyikan kata sandi/i })).toBeInTheDocument();

    // Klik 2: menyembunyikan kata sandi
    fireEvent.click(screen.getByRole('button', { name: /Sembunyikan kata sandi/i }));
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: /Tampilkan kata sandi/i })).toBeInTheDocument();
  });

  it('toggles between login form and registration form (Nama, Kelas, Email, Kata Sandi)', () => {
    render(
      <MemoryRouter initialEntries={['/masuk']}>
        <AppRoutes />
      </MemoryRouter>
    );

    // Klik tombol switch ke pendaftaran: "Daftar di sini"
    const switchToRegisterBtn = screen.getByRole('button', { name: /Daftar di sini/i });
    fireEvent.click(switchToRegisterBtn);

    // Sekarang tampil form registrasi baru
    expect(screen.getByRole('heading', { name: /Daftar Akun Siswa/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Nama Lengkap Siswa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Kelas \/ Rombel/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Daftar & Mulai Belajar/i })).toBeInTheDocument();

    const regNameInput = screen.getByLabelText(/Nama Lengkap Siswa/i);
    const regSubmitBtn = screen.getByRole('button', { name: /Daftar & Mulai Belajar/i });

    // Validasi nama siswa
    fireEvent.change(regNameInput, { target: { value: '   ' } });
    fireEvent.click(regSubmitBtn);
    expect(screen.getByRole('alert')).toHaveTextContent(/Nama lengkap wajib diisi minimal 2 karakter/i);

    // Klik kembali ke form login: "Masuk di sini"
    const switchToLoginBtn = screen.getByRole('button', { name: /Masuk di sini/i });
    fireEvent.click(switchToLoginBtn);

    // Kembali ke form login
    expect(screen.getByRole('heading', { name: /Masuk Akun Siswa/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/Nama Lengkap Siswa/i)).not.toBeInTheDocument();
  });

  it('displays "Lanjutkan sebagai [nama]" when session/data already exists', () => {
    // Data siswa sudah tersimpan
    useStudentStore.getState().setProfile('Budi Santoso', 'XII-1');
    useStudentStore.getState().leaveSession(); // Tab sesi belum aktif

    render(
      <MemoryRouter initialEntries={['/masuk']}>
        <AppRoutes />
      </MemoryRouter>
    );

    // Menampilkan kartu konfirmasi sesi tersimpan
    expect(screen.getByText(/Sesi Akun Siswa Aktif/i)).toBeInTheDocument();
    expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
    expect(screen.getByText(/Kelas: XII-1/i)).toBeInTheDocument();

    const continueBtn = screen.getByRole('button', { name: /Lanjutkan sebagai Budi Santoso/i });
    expect(continueBtn).toBeInTheDocument();

    // Klik Lanjutkan
    fireEvent.click(continueBtn);
    expect(useStudentStore.getState().isEntered).toBe(true);
  });

  it('shows student name and logout button in navigation when entered, and logs out on click', () => {
    // Siswa aktif masuk
    useStudentStore.getState().setProfile('Rian Pratama', 'XII-4');
    useStudentStore.getState().enterSession();

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );

    // Nama siswa dan tombol Keluar muncul di navigasi
    expect(screen.getAllByText(/Rian Pratama/i).length).toBeGreaterThanOrEqual(1);
    const logoutBtn = screen.getAllByRole('button', { name: /Keluar/i })[0];
    expect(logoutBtn).toBeInTheDocument();

    // Klik Keluar
    fireEvent.click(logoutBtn);

    // Sesi berakhir dan kembali dialihkan ke /masuk
    expect(useStudentStore.getState().isEntered).toBe(false);
    expect(screen.getByText(/Sesi Akun Siswa Aktif/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Lanjutkan sebagai Rian Pratama/i })).toBeInTheDocument();
  });

  it('allows toggling to "Lupa kata sandi" form and returning to login', () => {
    render(
      <MemoryRouter initialEntries={['/masuk']}>
        <AppRoutes />
      </MemoryRouter>
    );

    // Pastikan tombol "Lupa kata sandi?" ada di form login
    const forgotBtn = screen.getByRole('button', { name: /Lupa kata sandi\?/i });
    expect(forgotBtn).toBeInTheDocument();

    // Klik tombol lupa kata sandi
    fireEvent.click(forgotBtn);

    // Harus menampilkan heading dan form Lupa Kata Sandi
    expect(screen.getByRole('heading', { name: /Lupa Kata Sandi/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Alamat Email Akun Siswa/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Kirim Tautan Pemulihan Kata Sandi/i })).toBeInTheDocument();

    // Klik Kembali ke Halaman Masuk
    const backBtn = screen.getByRole('button', { name: /Kembali ke Halaman Masuk/i });
    fireEvent.click(backBtn);

    // Kembali ke form login
    expect(screen.getByRole('heading', { name: /Masuk Akun Siswa/i })).toBeInTheDocument();
  });
});
