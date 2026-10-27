import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Menu, X, BookOpen, Map, Zap, GraduationCap, BookMarked } from 'lucide-react'

const navLinks = [
  { to: '/',       label: 'Beranda',     icon: BookOpen },
  { to: '/peta',   label: 'Peta Belajar',icon: Map },
  { to: '/latihan',label: 'Latihan',     icon: Zap },
  { to: '/glosarium', label: 'Glosarium',icon: BookMarked },
]

export default function Header() {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass shadow-lg shadow-black/20' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group" aria-label="Chem-ElectroLabs beranda">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--ce-primary)] to-[var(--ce-secondary)] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg leading-none">
            <span className="text-[var(--ce-primary)]">Chem</span>
            <span className="text-white">·</span>
            <span className="gradient-text">ElectroLabs</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Navigasi utama">
          {navLinks.map(({ to, label }) => {
            const active = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-[var(--ce-primary)]/20 text-[var(--ce-primary)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/8'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Link
            to="/guru"
            id="btn-mode-guru"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[var(--ce-accent)] to-orange-500 text-slate-900 hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-[var(--ce-accent)]/30 hover:scale-105"
            aria-label="Masuk Mode Guru"
          >
            <GraduationCap size={15} />
            Mode Guru
          </Link>

          {/* Mobile hamburger */}
          <button
            id="btn-mobile-menu"
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden glass border-t border-white/10 animate-fade-in">
          <nav className="px-4 py-3 flex flex-col gap-1" aria-label="Navigasi mobile">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-[var(--ce-primary)]/20 text-[var(--ce-primary)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/8'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              )
            })}
            <Link
              to="/guru"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-[var(--ce-accent)] to-orange-500 text-slate-900 mt-1"
            >
              <GraduationCap size={16} />
              Mode Guru
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
