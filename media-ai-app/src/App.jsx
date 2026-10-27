import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/ui/Header'
import Footer from './components/ui/Footer'
import HomePage from './pages/HomePage'
import LearningMapPage from './pages/LearningMapPage'

/* ─── Placeholder component untuk halaman yang belum dibuat ──────── */
function ComingSoon({ title }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16 text-center">
      <div className="glass border border-white/12 rounded-3xl p-12 max-w-md w-full">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[var(--ce-primary)] to-[var(--ce-secondary)] flex items-center justify-center mb-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className="w-7 h-7 text-white" aria-hidden="true">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">{title}</h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          Halaman ini sedang dalam pengembangan dan akan segera hadir.
          Kembali ke beranda untuk mulai belajar.
        </p>
        <a href="/" className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
          style={{ background:'linear-gradient(135deg,var(--ce-primary),var(--ce-primary-dark))' }}>
          ← Kembali ke Beranda
        </a>
      </div>
    </main>
  )
}

/* ─── Layout wrapper ─────────────────────────────────────────────── */
function Layout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}

/* ─── App ────────────────────────────────────────────────────────── */
export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Beranda */}
          <Route path="/" element={<HomePage />} />

          {/* Peta Belajar */}
          <Route path="/peta" element={<LearningMapPage />} />

          {/* Modul 1–5 */}
          <Route path="/modul/:slug" element={<ComingSoon title="Modul Elektrokimia" />} />

          {/* Latihan */}
          <Route path="/latihan" element={<ComingSoon title="Latihan Interaktif" />} />

          {/* Asesmen Akhir */}
          <Route path="/asesmen" element={<ComingSoon title="Asesmen Akhir" />} />

          {/* Mode Guru */}
          <Route path="/guru" element={<ComingSoon title="Mode Guru" />} />

          {/* Glosarium */}
          <Route path="/glosarium" element={<ComingSoon title="Glosarium & Tabel Data" />} />

          {/* Tabel Potensial Standar */}
          <Route path="/data/potensial-elektrode" element={<ComingSoon title="Tabel Potensial Elektrode Standar" />} />

          {/* Tentang */}
          <Route path="/tentang" element={<ComingSoon title="Tentang & Referensi" />} />

          {/* 404 */}
          <Route path="*" element={<ComingSoon title="Halaman Tidak Ditemukan" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
