import { Link } from 'react-router-dom'
import { Zap, ExternalLink, Mail } from 'lucide-react'

const modules = [
  { num: 1, label: 'Reaksi Redoks' },
  { num: 2, label: 'Sel Volta' },
  { num: 3, label: 'Elektrolisis' },
  { num: 4, label: 'Hukum Faraday' },
  { num: 5, label: 'Korosi' },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/8 bg-[var(--ce-dark-2)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--ce-primary)] to-[var(--ce-secondary)] flex items-center justify-center">
                <Zap size={15} className="text-white" />
              </div>
              <span className="font-bold text-base">
                <span className="text-[var(--ce-primary)]">Chem</span>
                <span className="text-white">·</span>
                <span className="gradient-text">ElectroLabs</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-[260px]">
              Media pembelajaran elektrokimia kelas XII SMA berbasis <em>triple representation</em> — visual, interaktif, gratis.
            </p>
            <p className="mt-4 text-xs text-slate-500">Versi 1.0 (MVP) · Kimia XII SMA</p>
          </div>

          {/* Modul */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Modul Elektrokimia</h3>
            <ul className="space-y-2.5">
              {modules.map(m => (
                <li key={m.num}>
                  <Link
                    to={`/modul/${m.num}`}
                    className="text-sm text-slate-400 hover:text-[var(--ce-primary)] transition-colors"
                  >
                    Modul {m.num} — {m.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Tautan</h3>
            <ul className="space-y-2.5">
              {[
                { to: '/peta',      label: 'Peta Belajar' },
                { to: '/latihan',   label: 'Latihan Interaktif' },
                { to: '/asesmen',   label: 'Asesmen Akhir' },
                { to: '/glosarium', label: 'Glosarium' },
                { to: '/guru',      label: 'Mode Guru' },
                { to: '/tentang',   label: 'Tentang & Referensi' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-slate-400 hover:text-[var(--ce-primary)] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2025 Chem-ElectroLabs · Konten CC BY-NC-SA · Kode MIT</p>
          <div className="flex items-center gap-4">
            <a href="mailto:" aria-label="Email" className="hover:text-slate-300 transition-colors"><Mail size={14} /></a>
            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub" className="hover:text-slate-300 transition-colors"><ExternalLink size={14} /></a>
          </div>
        </div>
      </div>
    </footer>
  )
}
