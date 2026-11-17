import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  Atom,
  Menu,
  X,
  BookOpen,
  Map,
  Award,
  BookMarked,
  Info,
  UserCheck,
  Lock,
  LogOut,
  Cloud,
} from 'lucide-react';
import { useStudentStore } from '../../stores/useStudentStore.ts';

const CURRENT_YEAR = 2026;

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const {
    studentName,
    className: studentClass,
    email,
    isEntered,
    leaveSession,
  } = useStudentStore();

  const handleLogout = () => {
    leaveSession();
    setMobileMenuOpen(false);
    navigate('/masuk');
  };

  const navItems = [
    { to: '/', label: 'Beranda', icon: Atom },
    { to: '/peta', label: 'Peta Belajar', icon: Map },
    { to: '/latihan', label: 'Latihan', icon: BookOpen },
    { to: '/asesmen', label: 'Asesmen', icon: Award },
    { to: '/glosarium', label: 'Glosarium & E°', icon: BookMarked },
    { to: '/tentang', label: 'Tentang', icon: Info },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased">
      {/* Header Navigasi Global */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Judul Aplikasi */}
            <Link
              to={isEntered ? '/' : '/masuk'}
              className="flex items-center gap-2.5 text-slate-900 font-bold text-lg hover:text-sky-600 transition-colors py-2 focus-visible:outline-2 focus-visible:outline-sky-500 rounded-lg"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-sky-500/20">
                <Atom className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="leading-tight font-extrabold tracking-tight">Chem-ElectroLabs</span>
                <span className="text-[10px] font-medium text-slate-500">Tiga Representasi Kimia SMA</span>
              </div>
            </Link>

            {/* Menu Navigasi Baru Muncul Setelah Siswa Masuk */}
            {isEntered ? (
              <>
                {/* Navigasi Desktop */}
                <div className="hidden md:flex items-center gap-2">
                  <nav className="flex items-center gap-1" aria-label="Navigasi Utama">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          end={item.to === '/'}
                          className={({ isActive }) =>
                            `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all min-h-[44px] ${
                              isActive
                                ? 'bg-sky-50 text-sky-700 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            }`
                          }
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span>{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </nav>

                  {/* Badge Identitas Siswa Aktif */}
                  <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 ml-1">
                    {email ? (
                      <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <UserCheck className="w-3.5 h-3.5 text-sky-600" />
                    )}
                    <span className="max-w-[130px] truncate" title={`${studentName} (${studentClass})${email ? ` • ${email}` : ''}`}>
                      {studentName}
                    </span>
                  </div>

                  {/* Tombol Keluar Sesi Siswa */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors min-h-[44px] cursor-pointer ml-1"
                    aria-label="Keluar sesi siswa"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span>Keluar</span>
                  </button>
                </div>

                {/* Tombol Hamburger Mobile */}
                <div className="flex md:hidden items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors min-h-[44px] cursor-pointer"
                    aria-label="Keluar sesi siswa"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span className="text-[11px]">Keluar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="inline-flex items-center justify-center p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-sky-500 min-w-[44px] min-h-[44px]"
                    aria-expanded={mobileMenuOpen}
                    aria-label="Menu Utama"
                  >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
                </div>
              </>
            ) : (
              /* Saat Belum Masuk: Tampilkan Tautan Kecil Masuk Guru di Pojok Header */
              <div className="flex items-center gap-2">
                <Link
                  to="/guru"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold py-2 px-3 rounded-lg hover:bg-slate-100 transition-colors min-h-[44px]"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Masuk Guru</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Menu Navigasi Mobile Dropdown (Hanya jika siswa sudah masuk) */}
        {isEntered && mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
            <div className="flex items-center justify-between gap-2 px-3 py-2 mb-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2 truncate">
                <UserCheck className="w-4 h-4 text-sky-600 shrink-0" />
                <span className="truncate">
                  Peserta: <strong>{studentName}</strong> ({studentClass})
                </span>
              </div>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold transition-all min-h-[44px] ${
                      isActive
                        ? 'bg-sky-50 text-sky-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </header>

      {/* Konten Utama */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Footer Global */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <span className="font-semibold text-slate-700">Chem-ElectroLabs &copy; {CURRENT_YEAR}</span>
            <span className="hidden sm:inline">&bull;</span>
            <span>Media Pembelajaran Kimia Elektrokimia Berbasis Tiga Representasi</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/glosarium" className="hover:text-sky-600 transition-colors py-1">
              Glosarium &amp; E°
            </Link>
            <Link to="/tentang" className="hover:text-sky-600 transition-colors py-1">
              Tentang
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
