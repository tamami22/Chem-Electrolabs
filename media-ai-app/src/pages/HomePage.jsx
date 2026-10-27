import { Link } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import {
  Zap, ArrowRight, BookOpen, FlaskConical, Calculator,
  Map, GraduationCap, Eye, Atom, Hash,
  ChevronRight, Play, Star, CheckCircle2
} from 'lucide-react'

/* ─── Data modul ─────────────────────────────────────────────────── */
const MODULES = [
  {
    num: 1, slug: '1-redoks', title: 'Reaksi Redoks',
    desc: 'Kenali transfer elektron, bilangan oksidasi, dan hubungan antar representasi dalam reaksi redoks.',
    icon: Zap, color: '#0EA5E9', colorBg: 'rgba(14,165,233,0.10)',
    tp: 'TP1', badge: 'Dasar', badgeColor: '#0EA5E9',
  },
  {
    num: 2, slug: '2-sel-volta', title: 'Sel Volta',
    desc: 'Eksplorasi sel volta interaktif: pilih elektrode, lihat aliran elektron, baca notasi sel dan E°sel.',
    icon: FlaskConical, color: '#10B981', colorBg: 'rgba(16,185,129,0.10)',
    tp: 'TP2 & TP3', badge: 'Simulasi ⭐', badgeColor: '#10B981',
  },
  {
    num: 3, slug: '3-elektrolisis', title: 'Elektrolisis',
    desc: 'Simulasikan proses elektrolisis berbagai larutan, produk anode-katode, dan reaksi setengah sel.',
    icon: FlaskConical, color: '#A855F7', colorBg: 'rgba(168,85,247,0.10)',
    tp: 'TP4', badge: 'Simulasi', badgeColor: '#A855F7',
  },
  {
    num: 4, slug: '4-faraday', title: 'Hukum Faraday',
    desc: 'Hitung massa/volume hasil elektrolisis langkah demi langkah: muatan ke mol elektron ke massa.',
    icon: Calculator, color: '#F59E0B', colorBg: 'rgba(245,158,11,0.10)',
    tp: 'TP5', badge: 'Kalkulator', badgeColor: '#F59E0B',
  },
  {
    num: 5, slug: '5-korosi', title: 'Korosi & Pencegahan',
    desc: 'Analisis korosi logam, faktor penyebab, dan strategi pencegahan berbasis elektrokimia.',
    icon: Zap, color: '#EF4444', colorBg: 'rgba(239,68,68,0.10)',
    tp: 'TP6', badge: 'Aplikasi', badgeColor: '#EF4444',
  },
]

const TRIPLE_REPS = [
  {
    id: 'makro', label: 'Makroskopik', icon: Eye, color: '#0EA5E9',
    desc: 'Gejala yang dapat diamati: perubahan warna, gelembung, endapan, nyala lampu, voltmeter.',
    example: 'Lampu menyala → ada arus listrik dalam rangkaian sel volta.',
  },
  {
    id: 'submikro', label: 'Submikroskopik', icon: Atom, color: '#10B981',
    desc: 'Penjelasan di level partikel: elektron di kabel, ion di larutan dan jembatan garam.',
    example: 'Elektron mengalir dari Zn (anode) ke Cu (katode) melalui kabel eksternal.',
  },
  {
    id: 'simbolik', label: 'Simbolik', icon: Hash, color: '#F59E0B',
    desc: 'Representasi matematis: persamaan, notasi sel, bilangan oksidasi, dan nilai E°sel.',
    example: 'Zn(s) | Zn²⁺(aq) || Cu²⁺(aq) | Cu(s)   E°sel = +1,10 V',
  },
]

const STATS = [
  { value: '5', label: 'Modul Interaktif' },
  { value: '3', label: 'Level Representasi' },
  { value: '7', label: 'Tujuan Pembelajaran' },
  { value: '0', label: 'Biaya Akses' },
]

function useModuleProgress() {
  const [progress, setProgress] = useState({})
  useEffect(() => {
    try {
      const raw = localStorage.getItem('chem-electrolabs.v1.progress')
      if (raw) setProgress(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])
  return progress
}

function useCountUp(target, duration, trigger) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!trigger) return
    const num = parseInt(target, 10)
    if (Number.isNaN(num)) { setVal(target); return }
    let start = null
    const step = (ts) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setVal(Math.floor(p * num))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, trigger])
  return val
}

function FloatingParticles() {
  const pts = [
    { x:10,y:15,s:3,d:0,dr:5,c:'#0EA5E9' }, { x:85,y:20,s:2,d:1,dr:7,c:'#10B981' },
    { x:25,y:70,s:4,d:2,dr:4,c:'#F59E0B' }, { x:70,y:80,s:2,d:0.5,dr:6,c:'#FACC15' },
    { x:50,y:10,s:3,d:1.5,dr:5,c:'#EF4444' }, { x:90,y:55,s:2,d:3,dr:8,c:'#3B82F6' },
    { x:5,y:50,s:2,d:2.5,dr:6,c:'#0EA5E9' }, { x:60,y:30,s:3,d:0.8,dr:4,c:'#10B981' },
    { x:35,y:90,s:2,d:1.2,dr:7,c:'#A855F7' }, { x:80,y:40,s:3,d:3.5,dr:5,c:'#F59E0B' },
  ]
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {pts.map((p, i) => (
        <span key={i} className="absolute rounded-full opacity-35"
          style={{ left:`${p.x}%`, top:`${p.y}%`, width:p.s, height:p.s, background:p.c,
            animation:`particle-drift ${p.dr}s ${p.d}s ease-out infinite` }} />
      ))}
    </div>
  )
}

function HeroIllustration() {
  return (
    <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg"
      aria-label="Diagram sel volta: anode seng dan katode tembaga dalam larutan, dihubungkan kabel dengan voltmeter"
      role="img" className="w-full h-full drop-shadow-2xl">
      <title>Ilustrasi Sel Volta Zn-Cu</title>
      <desc>Sel volta dengan elektrode seng sebagai anode dan tembaga sebagai katode, menunjukkan aliran elektron dari anode ke katode.</desc>
      {/* Gelas kiri */}
      <rect x="20" y="80" width="100" height="100" rx="8" fill="rgba(14,165,233,0.08)" stroke="rgba(14,165,233,0.3)" strokeWidth="1.5"/>
      <rect x="22" y="120" width="96" height="58" rx="6" fill="rgba(14,165,233,0.15)"/>
      <rect x="60" y="72" width="12" height="90" rx="3" fill="#EF4444"/>
      <text x="66" y="67" textAnchor="middle" fontSize="10" fill="#EF4444" fontWeight="700">Zn</text>
      <text x="66" y="59" textAnchor="middle" fontSize="8" fill="#EF4444" opacity="0.8">ANODE</text>
      <text x="40" y="148" fontSize="9" fill="#BAE6FD" opacity="0.9">Zn²⁺</text>
      <text x="70" y="165" fontSize="9" fill="#BAE6FD" opacity="0.7">Zn²⁺</text>
      {/* Gelas kanan */}
      <rect x="200" y="80" width="100" height="100" rx="8" fill="rgba(16,185,129,0.08)" stroke="rgba(16,185,129,0.3)" strokeWidth="1.5"/>
      <rect x="202" y="120" width="96" height="58" rx="6" fill="rgba(16,185,129,0.15)"/>
      <rect x="250" y="72" width="12" height="90" rx="3" fill="#3B82F6"/>
      <text x="256" y="67" textAnchor="middle" fontSize="10" fill="#3B82F6" fontWeight="700">Cu</text>
      <text x="256" y="59" textAnchor="middle" fontSize="8" fill="#3B82F6" opacity="0.8">KATODE</text>
      <text x="215" y="148" fontSize="9" fill="#93C5FD" opacity="0.9">Cu²⁺</text>
      <text x="245" y="165" fontSize="9" fill="#93C5FD" opacity="0.7">Cu²⁺</text>
      {/* Jembatan garam */}
      <rect x="110" y="88" width="100" height="20" rx="10" fill="rgba(100,116,139,0.3)" stroke="rgba(100,116,139,0.5)" strokeWidth="1"/>
      <text x="160" y="102" textAnchor="middle" fontSize="8" fill="#94A3B8">Jembatan Garam</text>
      <text x="125" y="100" fontSize="7" fill="#FDE68A">K⁺</text>
      <text x="178" y="100" fontSize="7" fill="#FCA5A5">Cl⁻</text>
      {/* Kabel */}
      <path d="M66 72 L66 35 L256 35 L256 72" fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="4 2"/>
      {/* Voltmeter */}
      <circle cx="161" cy="20" r="16" fill="rgba(15,23,42,0.95)" stroke="#475569" strokeWidth="1.5"/>
      <text x="161" y="16" textAnchor="middle" fontSize="7" fill="#94A3B8">V</text>
      <text x="161" y="26" textAnchor="middle" fontSize="8" fill="#FACC15" fontWeight="700">1.10V</text>
      {/* Panah elektron */}
      <defs>
        <marker id="arrowGold" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#FACC15"/>
        </marker>
      </defs>
      <path d="M85 35 L155 35" stroke="#FACC15" strokeWidth="2" markerEnd="url(#arrowGold)"
        style={{ strokeDasharray:200, strokeDashoffset:0, animation:'electron-flow 2s linear infinite' }}/>
      <text x="120" y="29" textAnchor="middle" fontSize="8" fill="#FACC15">e⁻</text>
    </svg>
  )
}

function ModuleCard({ mod, progress, index }) {
  const Icon = mod.icon
  const done = progress?.[`module_${mod.num}_done`]
  const pct = progress?.[`module_${mod.num}_pct`] ?? 0
  return (
    <Link to={`/modul/${mod.slug}`} id={`module-card-${mod.num}`}
      aria-label={`Buka Modul ${mod.num}: ${mod.title}`}
      className="group relative flex flex-col rounded-2xl border border-white/8 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-white/20"
      style={{ animationDelay:`${index*0.1}s` }}>
      <div className="h-1 w-full" style={{ background:`linear-gradient(90deg,${mod.color},transparent)` }}/>
      <div className="flex flex-col flex-1 p-5 gap-4" style={{ background:mod.colorBg }}>
        <div className="flex items-start justify-between">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"
            style={{ background:`linear-gradient(135deg,${mod.color}30,${mod.color}18)`, border:`1px solid ${mod.color}40` }}>
            <Icon size={20} style={{ color:mod.color }}/>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background:`${mod.badgeColor}20`, color:mod.badgeColor, border:`1px solid ${mod.badgeColor}30` }}>
              {mod.badge}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">{mod.tp}</span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono text-slate-500">Modul {mod.num}</span>
            {done && <CheckCircle2 size={13} className="text-emerald-400" aria-label="Modul selesai"/>}
          </div>
          <h3 className="font-semibold text-white text-base leading-snug mb-2 group-hover:text-[var(--ce-primary)] transition-colors">{mod.title}</h3>
          <p className="text-sm text-slate-400 leading-relaxed">{mod.desc}</p>
        </div>
        <div className="mt-auto">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>{done ? 'Selesai' : pct > 0 ? 'Sedang belajar' : 'Belum dimulai'}</span>
            <span>{pct}%</span>
          </div>
          <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width:`${pct}%`, background:mod.color }}/>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-medium" style={{ color:mod.color }}>
          {done ? 'Ulangi Modul' : pct > 0 ? 'Lanjutkan' : 'Mulai Belajar'}
          <ChevronRight size={15} className="transition-transform group-hover:translate-x-1"/>
        </div>
      </div>
    </Link>
  )
}

function TripleRepCard({ rep, active, onClick }) {
  const Icon = rep.icon
  return (
    <button id={`triple-rep-${rep.id}`} onClick={onClick} aria-pressed={active}
      aria-label={`Tampilkan representasi ${rep.label}`}
      className={`flex flex-col items-start gap-3 p-5 rounded-2xl border text-left w-full cursor-pointer transition-all duration-300 ${
        active ? 'border-white/20 shadow-lg scale-[1.02]' : 'border-white/8 hover:border-white/15 hover:scale-[1.01]'}`}
      style={{ background: active ? `linear-gradient(135deg,${rep.color}18,${rep.color}06)` : 'rgba(255,255,255,0.03)' }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background:`${rep.color}22`, border:`1px solid ${rep.color}40` }}>
        <Icon size={18} style={{ color:rep.color }}/>
      </div>
      <div>
        <p className="font-semibold text-white text-sm mb-1">{rep.label}</p>
        <p className="text-xs text-slate-400 leading-relaxed">{rep.desc}</p>
      </div>
      {active && (
        <div className="mt-1 text-xs font-mono px-2 py-1 rounded-lg w-full"
          style={{ background:`${rep.color}18`, color:rep.color }}>
          Contoh: {rep.example}
        </div>
      )}
    </button>
  )
}

function StatItem({ stat, visible, delay }) {
  const num = parseInt(stat.value, 10)
  const isNum = !Number.isNaN(num)
  const counted = useCountUp(num, 1200, visible)
  return (
    <div className="flex flex-col items-center gap-1" style={{ animationDelay:`${delay}ms` }}>
      <span className="text-4xl font-bold gradient-text">
        {isNum ? (visible ? counted : 0) : stat.value}
      </span>
      <span className="text-sm text-slate-400">{stat.label}</span>
    </div>
  )
}

export default function HomePage() {
  const progress = useModuleProgress()
  const [activeRep, setActiveRep] = useState('makro')
  const [statsVisible, setStatsVisible] = useState(false)
  const statsRef = useRef(null)

  useEffect(() => {
    if (!statsRef.current) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true) },
      { threshold: 0.4 }
    )
    obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  const completedCount = MODULES.filter(m => progress?.[`module_${m.num}_done`]).length

  return (
    <main id="main-content" className="min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section aria-label="Hero beranda Chem-ElectroLabs"
        className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-24 pb-16 overflow-hidden">
        {/* BG blobs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl animate-pulse-glow"
            style={{ background:'radial-gradient(circle,#0EA5E9,transparent)' }}/>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl"
            style={{ background:'radial-gradient(circle,#10B981,transparent)', animation:'pulse-glow 3.5s ease-in-out infinite reverse' }}/>
        </div>
        {/* Grid bg */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none" aria-hidden="true"
          style={{ backgroundImage:'linear-gradient(#64748B 1px,transparent 1px),linear-gradient(90deg,#64748B 1px,transparent 1px)', backgroundSize:'48px 48px' }}/>
        <FloatingParticles/>

        <div className="relative z-10 max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className="flex flex-col gap-6 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 self-start">
              <span className="px-3 py-1 rounded-full text-xs font-semibold glass border border-white/15 text-slate-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
                Media Pembelajaran Kimia XII SMA
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-white">Belajar </span>
              <span className="gradient-text">Elektrokimia</span>
              <br/>
              <span className="text-white">dalam Tiga </span>
              <span className="shimmer-text">Representasi</span>
            </h1>

            <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
              Eksplorasi reaksi redoks, sel volta, elektrolisis, Hukum Faraday, dan korosi —
              dari gejala nyata, level partikel, hingga persamaan kimia — secara visual dan interaktif.
            </p>

            {completedCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-emerald-400">
                <CheckCircle2 size={16}/>
                <span>{completedCount} dari 5 modul sudah diselesaikan</span>
              </div>
            )}

            <div className="flex flex-wrap gap-3 mt-2">
              <Link to="/modul/1-redoks" id="btn-mulai-belajar"
                aria-label="Mulai belajar dari Modul 1: Reaksi Redoks"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                style={{ background:'linear-gradient(135deg,var(--ce-primary),var(--ce-primary-dark))' }}>
                <Play size={16}/>Mulai Belajar<ArrowRight size={15}/>
              </Link>
              <Link to="/peta" id="btn-peta-belajar"
                aria-label="Lihat peta belajar elektrokimia"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white glass border border-white/15 transition-all duration-300 hover:scale-105 hover:border-white/30">
                <Map size={16}/>Peta Belajar
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              {['✓ Simulasi sel volta interaktif','✓ Triple representation','✓ Tanpa biaya','✓ Mobile-friendly'].map(f => (
                <span key={f} className="text-xs text-slate-400 bg-white/5 border border-white/8 px-2.5 py-1 rounded-full">{f}</span>
              ))}
            </div>
          </div>

          {/* Illustration */}
          <div className="relative flex items-center justify-center animate-fade-in-up delay-300">
            <div className="absolute w-72 h-72 rounded-full opacity-15 animate-pulse-glow pointer-events-none"
              style={{ background:'radial-gradient(circle,#0EA5E9 0%,transparent 70%)' }} aria-hidden="true"/>
            <div className="relative w-full max-w-sm glass rounded-3xl border border-white/12 p-6 shadow-2xl animate-float">
              <div className="aspect-[320/220] w-full"><HeroIllustration/></div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  { label:'Anode', color:'#EF4444', sub:'Oksidasi' },
                  { label:'E°sel', color:'#FACC15', sub:'+1,10 V' },
                  { label:'Katode', color:'#3B82F6', sub:'Reduksi' },
                ].map(item => (
                  <div key={item.label} className="flex flex-col items-center gap-0.5">
                    <span className="text-xs font-bold" style={{ color:item.color }}>{item.label}</span>
                    <span className="text-[10px] text-slate-500">{item.sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 animate-bounce" aria-hidden="true">
          <span className="text-xs text-slate-600">Gulir ke bawah</span>
          <div className="w-px h-8 bg-gradient-to-b from-slate-600 to-transparent"/>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────── */}
      <section ref={statsRef} aria-label="Statistik ringkasan Chem-ElectroLabs"
        className="py-14 border-y border-white/8" style={{ background:'var(--ce-dark-2)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map((s, i) => (
              <StatItem key={s.label} stat={s} visible={statsVisible} delay={i * 150}/>
            ))}
          </div>
        </div>
      </section>

      {/* ── MODUL ─────────────────────────────────────────────────── */}
      <section aria-labelledby="section-modul-heading" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--ce-primary)] mb-3">Kurikulum</p>
          <h2 id="section-modul-heading" className="text-3xl sm:text-4xl font-bold text-white mb-4">
            5 Modul Elektrokimia
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-base leading-relaxed">
            Setiap modul dirancang bertahap — dari konsep dasar hingga aplikasi nyata —
            dengan simulasi interaktif dan latihan dengan umpan balik langsung.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODULES.map((mod, i) => (
            <ModuleCard key={mod.num} mod={mod} progress={progress} index={i}/>
          ))}
          <Link to="/peta" id="card-peta-belajar"
            aria-label="Lihat Peta Belajar semua modul"
            className="group relative flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/15 p-8 text-center transition-all duration-300 hover:border-[var(--ce-primary)]/50 hover:bg-[var(--ce-primary)]/5 hover:-translate-y-1 sm:col-span-2 lg:col-span-1 min-h-[180px]">
            <div className="w-12 h-12 rounded-xl bg-[var(--ce-primary)]/12 border border-[var(--ce-primary)]/25 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Map size={22} className="text-[var(--ce-primary)]"/>
            </div>
            <div>
              <p className="font-semibold text-white mb-1">Lihat Peta Belajar</p>
              <p className="text-sm text-slate-400">Urutan modul dan keterkaitan konsep secara visual</p>
            </div>
            <ArrowRight size={16} className="text-[var(--ce-primary)] group-hover:translate-x-1 transition-transform"/>
          </Link>
        </div>
      </section>

      {/* ── TRIPLE REP ────────────────────────────────────────────── */}
      <section aria-labelledby="section-triple-heading" className="py-20 px-4 sm:px-6" style={{ background:'var(--ce-dark-2)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--ce-secondary)] mb-3">Pendekatan Pembelajaran</p>
            <h2 id="section-triple-heading" className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Triple Representation
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-base leading-relaxed">
              Setiap konsep disajikan dalam <strong className="text-white">tiga level representasi secara paralel</strong> —
              cara paling efektif membangun pemahaman kimia yang mendalam dan tahan lama.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TRIPLE_REPS.map(rep => (
              <TripleRepCard key={rep.id} rep={rep} active={activeRep === rep.id}
                onClick={() => setActiveRep(rep.id)}/>
            ))}
          </div>
          {/* Summary diagram */}
          <div className="mt-10 glass rounded-2xl border border-white/8 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-6 text-center">
              Contoh: Sel Volta Zn–Cu dilihat dari tiga level
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {TRIPLE_REPS.map(rep => (
                <div key={rep.id} className="flex flex-col items-center gap-3 text-center">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background:`${rep.color}22`, border:`1px solid ${rep.color}44` }}>
                    <rep.icon size={16} style={{ color:rep.color }}/>
                  </div>
                  <p className="text-sm font-semibold" style={{ color:rep.color }}>{rep.label}</p>
                  <p className="text-xs text-slate-400 italic leading-relaxed">{rep.example}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA GURU ──────────────────────────────────────────────── */}
      <section aria-labelledby="section-guru-heading" className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12 text-center"
            style={{ background:'linear-gradient(135deg,rgba(245,158,11,0.12),rgba(239,68,68,0.07),rgba(245,158,11,0.05))' }}>
            <div className="absolute inset-0 rounded-3xl border border-[var(--ce-accent)]/25 pointer-events-none" aria-hidden="true"/>
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-12 blur-3xl pointer-events-none"
              style={{ background:'radial-gradient(circle,#F59E0B,transparent)' }} aria-hidden="true"/>
            <div className="relative z-10 flex flex-col items-center gap-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background:'linear-gradient(135deg,var(--ce-accent),#EA580C)' }}>
                <GraduationCap size={26} className="text-white"/>
              </div>
              <div>
                <h2 id="section-guru-heading" className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  Untuk Guru Kimia
                </h2>
                <p className="text-slate-300 leading-relaxed max-w-xl mx-auto">
                  Akses <strong className="text-[var(--ce-accent)]">Mode Guru</strong> untuk demonstrasi kelas:
                  tampilan slide besar, simulasi sel volta interaktif, panduan demonstrasi,
                  dan lembar aktivitas siap cetak — tanpa alat laboratorium.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {['✓ Font besar untuk proyektor','✓ Simulasi langsung di kelas','✓ Panduan demonstrasi','✓ Lembar aktivitas','✓ Tanpa login'].map(f => (
                  <span key={f} className="text-xs text-slate-400 bg-white/5 border border-white/8 px-2.5 py-1 rounded-full">{f}</span>
                ))}
              </div>
              <Link to="/guru" id="btn-cta-mode-guru"
                aria-label="Masuk ke Mode Guru untuk demonstrasi kelas"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-slate-900 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                style={{ background:'linear-gradient(135deg,var(--ce-accent),#EA580C)' }}>
                <GraduationCap size={18}/>Masuk Mode Guru<ArrowRight size={16}/>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── QUICK LINKS ───────────────────────────────────────────── */}
      <section aria-labelledby="section-fitur-heading" className="pb-20 px-4 sm:px-6" style={{ background:'var(--ce-dark-2)' }}>
        <div className="max-w-6xl mx-auto pt-16">
          <h2 id="section-fitur-heading" className="text-center text-2xl font-bold text-white mb-8">
            Jelajahi Fitur Lainnya
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { to:'/latihan', label:'Latihan Interaktif', icon:Star, color:'#0EA5E9', desc:'Soal per TP dengan umpan balik' },
              { to:'/asesmen', label:'Asesmen Akhir', icon:BookOpen, color:'#10B981', desc:'15 soal campuran tiga representasi' },
              { to:'/glosarium', label:'Glosarium', icon:BookOpen, color:'#A855F7', desc:'Istilah dan tabel potensial elektrode' },
              { to:'/tentang', label:'Tentang', icon:BookOpen, color:'#F59E0B', desc:'Referensi dan panduan penggunaan' },
            ].map(item => (
              <Link key={item.to} to={item.to} id={`quick-link-${item.to.slice(1)}`}
                aria-label={item.label}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-white/8 text-center transition-all duration-300 hover:border-white/20 hover:-translate-y-0.5 hover:bg-white/3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ background:`${item.color}20`, border:`1px solid ${item.color}30` }}>
                  <item.icon size={18} style={{ color:item.color }}/>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </main>
  )
}

