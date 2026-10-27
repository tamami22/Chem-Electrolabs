import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Zap, FlaskConical, Calculator, Shield, BookOpen, GraduationCap,
  CheckCircle2, Circle, Lock, Unlock, ArrowRight, ChevronRight,
  Info, Sparkles, RotateCcw, Eye, Atom, Hash, Clock, Target, Compass
} from 'lucide-react'
import learningPathData from '../data/learning-path.json'

// Icon mapping per node
const NODE_ICONS = {
  'node-prereq': BookOpen,
  'node-1': Zap,
  'node-2': FlaskConical,
  'node-3': FlaskConical,
  'node-4': Calculator,
  'node-5': Shield,
  'node-assessment': Target,
}

export default function LearningMapPage() {
  const [progress, setProgress] = useState({})
  const [selectedNodeId, setSelectedNodeId] = useState('node-1')
  const [filterTrack, setFilterTrack] = useState('all') // 'all' | 'volta' | 'elektrolisis' | 'aplikasi'
  const [showTpMatrix, setShowTpMatrix] = useState(false)

  // Load progress from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('chem-electrolabs.v1.progress')
      if (raw) setProgress(JSON.parse(raw))
    } catch {
      // ignore
    }
  }, [])

  // Calculate overall stats
  const completedModules = [1, 2, 3, 4, 5].filter(num => progress[`module_${num}_done`])
  const overallPercentage = Math.round((completedModules.length / 5) * 100)

  // Determine node status
  const getNodeStatus = (node) => {
    if (node.type === 'prereq') return { status: 'completed', label: 'Pondasi Siap', pct: 100 }
    if (node.type === 'assessment') {
      const isDone = progress['assessment_done']
      if (isDone) return { status: 'completed', label: 'Selesai', pct: 100 }
      // Unlocked if at least mod 1 & mod 2 done
      const prereqsMet = progress['module_1_done'] && progress['module_2_done']
      return prereqsMet
        ? { status: 'ready', label: 'Siap Diikuti', pct: 0 }
        : { status: 'locked', label: 'Terkunci', pct: 0 }
    }

    const isDone = progress[`module_${node.num}_done`]
    const pct = progress[`module_${node.num}_pct`] || (isDone ? 100 : 0)

    if (isDone) return { status: 'completed', label: 'Selesai', pct: 100 }
    if (pct > 0) return { status: 'in-progress', label: `Sedang Belajar (${pct}%)`, pct }

    // Check prerequisites
    const isUnlocked = node.prerequisites.every(preId => {
      if (preId === 'node-prereq') return true
      const preNum = preId.replace('node-', '')
      return progress[`module_${preNum}_done`]
    })

    if (node.num === 1 || isUnlocked) {
      return { status: 'ready', label: 'Siap Dimulai', pct: 0 }
    }
    return { status: 'locked', label: 'Terkunci', pct: 0 }
  }

  // Find next module to continue
  const getNextRecommendedModule = () => {
    for (let i = 1; i <= 5; i++) {
      if (!progress[`module_${i}_done`]) return `/modul/${i === 1 ? '1-redoks' : i === 2 ? '2-sel-volta' : i === 3 ? '3-elektrolisis' : i === 4 ? '4-faraday' : '5-korosi'}`
    }
    return '/asesmen'
  }

  // Reset or simulate progress for demo / testing
  const handleToggleDemoProgress = () => {
    if (completedModules.length === 5) {
      localStorage.removeItem('chem-electrolabs.v1.progress')
      setProgress({})
    } else {
      const mock = {
        module_1_done: true, module_1_pct: 100,
        module_2_done: true, module_2_pct: 100,
        module_3_done: false, module_3_pct: 45,
        module_4_done: false, module_4_pct: 0,
        module_5_done: false, module_5_pct: 0,
      }
      localStorage.setItem('chem-electrolabs.v1.progress', JSON.stringify(mock))
      setProgress(mock)
    }
  }

  const selectedNode = learningPathData.nodes.find(n => n.id === selectedNodeId) || learningPathData.nodes[1]
  const selectedStatus = getNodeStatus(selectedNode)

  // Track filtering logic
  const isNodeVisible = (nodeId) => {
    if (filterTrack === 'all') return true
    if (filterTrack === 'volta') return ['node-prereq', 'node-1', 'node-2', 'node-5', 'node-assessment'].includes(nodeId)
    if (filterTrack === 'elektrolisis') return ['node-prereq', 'node-1', 'node-3', 'node-4', 'node-assessment'].includes(nodeId)
    if (filterTrack === 'aplikasi') return ['node-2', 'node-3', 'node-5', 'node-assessment'].includes(nodeId)
    return true
  }

  return (
    <main id="main-content" className="min-h-screen pt-24 pb-20 px-4 sm:px-6 max-w-7xl mx-auto">

      {/* ── BREADCRUMB & HEADER ────────────────────────────────────── */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/" className="hover:text-white transition-colors">Beranda</Link>
          <ChevronRight size={12} />
          <span className="text-[var(--ce-primary)] font-medium">Peta Belajar</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold glass border border-white/10 text-slate-300 mb-3">
              <Compass size={14} className="text-[var(--ce-primary)]" />
              Alur Kurikulum Terpadu & Triple Representation
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Peta Belajar <span className="gradient-text">Elektrokimia</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
              Jelajahi keterkaitan antar konsep dari reaksi redoks dasar, sel volta & elektrolisis,
              perhitungan Faraday, hingga aplikasi perlindungan korosi di kehidupan nyata.
            </p>
          </div>

          {/* Quick Progress Card */}
          <div className="glass rounded-2xl border border-white/12 p-4 sm:p-5 flex items-center gap-5 min-w-[280px]">
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/10"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[var(--ce-primary)] transition-all duration-1000 ease-out"
                  strokeDasharray={`${overallPercentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-bold text-sm text-white">{overallPercentage}%</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300">Progres Belajar</span>
                {completedModules.length === 5 && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">Lulus</span>
                )}
              </div>
              <span className="text-sm font-bold text-white">
                {completedModules.length} dari 5 Modul Selesai
              </span>
              <div className="flex items-center gap-3 mt-1">
                <Link
                  to={getNextRecommendedModule()}
                  className="text-xs font-semibold text-[var(--ce-primary)] hover:underline inline-flex items-center gap-1"
                >
                  Lanjutkan <ArrowRight size={12} />
                </Link>
                <button
                  onClick={handleToggleDemoProgress}
                  title="Simulasi / reset status progres untuk demo"
                  className="text-[11px] text-slate-500 hover:text-slate-300 inline-flex items-center gap-1 transition-colors"
                >
                  <RotateCcw size={10} /> Demo Progress
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TRACK FILTERS & VIEW CONTROLS ──────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div className="flex flex-wrap items-center gap-1.5 p-1 glass rounded-xl border border-white/8 text-xs font-medium">
          <span className="text-slate-400 px-3 py-1.5">Fokus Alur:</span>
          {[
            { id: 'all', label: 'Semua Alur' },
            { id: 'volta', label: 'Jalur Sel Volta (Kimia → Listrik)' },
            { id: 'elektrolisis', label: 'Jalur Elektrolisis & Faraday' },
            { id: 'aplikasi', label: 'Jalur Korosi & Aplikasi' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterTrack(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterTrack === tab.id
                  ? 'bg-[var(--ce-primary)] text-white shadow-md font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowTpMatrix(prev => !prev)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold glass border border-white/10 hover:border-white/20 text-slate-300 transition-all hover:scale-105"
        >
          <Target size={14} className="text-[var(--ce-accent)]" />
          {showTpMatrix ? 'Sembunyikan Matriks TP' : 'Lihat Matriks TP1–TP7'}
        </button>
      </div>

      {/* ── TP MATRIX ACCORDION (COLLAPSIBLE) ───────────────────────── */}
      {showTpMatrix && (
        <section aria-label="Tabel Matriks Tujuan Pembelajaran" className="mb-10 animate-fade-in">
          <div className="glass rounded-2xl border border-white/12 p-6 overflow-x-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Target size={18} className="text-[var(--ce-primary)]" />
                Matriks Pemetaan 7 Tujuan Pembelajaran (TP) Elektrokimia
              </h2>
              <span className="text-xs text-slate-400">Kelas XII SMA • Kurikulum Merdeka</span>
            </div>
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-semibold">
                  <th className="py-2.5 px-3">Kode</th>
                  <th className="py-2.5 px-3">Tujuan Pembelajaran</th>
                  <th className="py-2.5 px-3">Modul Terkait</th>
                  <th className="py-2.5 px-3">Fokus Representasi</th>
                  <th className="py-2.5 px-3">Bentuk Asesmen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { code: 'TP1', text: 'Menjelaskan reaksi redoks dalam elektrokimia menghubungkan gejala makro, pergerakan elektron/ion submikro, dan simbolik persamaan & biloks.', mod: 'Modul 1', rep: 'Makro, Submikro, Simbolik', test: 'Latihan Menjodohkan & Biloks' },
                  { code: 'TP2', text: 'Membedakan sel volta dan sel elektrolisis (spontanitas, kutub elektrode, konversi energi).', mod: 'Modul 2 & 3', rep: 'Makro & Simbolik', test: 'Tabel Komparasi & Kuis Cepat' },
                  { code: 'TP3', text: 'Menganalisis prinsip kerja sel volta: anode-katode, aliran elektron/ion, notasi sel, dan E°sel.', mod: 'Modul 2', rep: 'Submikro & Simbolik', test: 'VoltaCellSimulator & Notasi Sel' },
                  { code: 'TP4', text: 'Menganalisis elektrolisis larutan/lelehan, elektrode inert/aktif, dan reaksi setengah sel.', mod: 'Modul 3', rep: 'Makro & Submikro', test: 'Prediksi Produk Gas/Endapan' },
                  { code: 'TP5', text: 'Menerapkan Hukum Faraday I & II untuk menghitung massa/volume hasil elektrolisis.', mod: 'Modul 4', rep: 'Simbolik & Matematis', test: 'Kalkulator Faraday Bertahap' },
                  { code: 'TP6', text: 'Menganalisis proses korosi logam dan strategi pencegahan (perlindungan katodik).', mod: 'Modul 5', rep: 'Makro & Simbolik', test: 'Studi Kasus & Analisis Gambar' },
                  { code: 'TP7', text: 'Mengomunikasikan hasil analisis elektrokimia menggunakan minimal tiga representasi.', mod: 'Asesmen Akhir', rep: 'Triple Representation', test: '15 Butir Soal Representasional' },
                ].map(row => (
                  <tr key={row.code} className="hover:bg-white/3 transition-colors">
                    <td className="py-3 px-3 font-bold text-[var(--ce-primary)]">{row.code}</td>
                    <td className="py-3 px-3 leading-relaxed text-slate-200">{row.text}</td>
                    <td className="py-3 px-3 font-semibold text-white whitespace-nowrap">{row.mod}</td>
                    <td className="py-3 px-3 text-slate-400">{row.rep}</td>
                    <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">{row.test}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── MAIN WORKSPACE: GRAPH + NODE INSPECTOR ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* ── LEARNING GRAPH FLOW (COL 7) ───────────────────────────── */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 bg-white/3 p-3 rounded-xl border border-white/6">
            <span className="font-semibold text-slate-300">Status Node:</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-400" /> Selesai</span>
            <span className="flex items-center gap-1.5"><Sparkles size={13} className="text-amber-400" /> Sedang Belajar</span>
            <span className="flex items-center gap-1.5"><Circle size={13} className="text-[var(--ce-primary)]" /> Siap Dipelajari</span>
            <span className="flex items-center gap-1.5"><Lock size={13} className="text-slate-500" /> Terkunci</span>
          </div>

          {/* Interactive Flow Nodes */}
          <div className="relative flex flex-col gap-5">

            {learningPathData.nodes.map((node, index) => {
              const visible = isNodeVisible(node.id)
              const statusInfo = getNodeStatus(node)
              const isSelected = selectedNodeId === node.id
              const Icon = NODE_ICONS[node.id] || Zap

              return (
                <div
                  key={node.id}
                  className={`transition-all duration-300 ${!visible ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}
                >
                  {/* Flow Connector Arrow between nodes */}
                  {index > 0 && (
                    <div className="flex items-center justify-center -my-2.5 relative z-0">
                      <div className="h-6 w-0.5 bg-gradient-to-b from-white/20 to-white/10" />
                      <div className="absolute text-[10px] font-mono text-slate-500 bg-[var(--ce-dark)] px-2 py-0.5 rounded border border-white/5">
                        {node.id === 'node-2' ? 'Reaksi Spontan (Sel Volta)'
                          : node.id === 'node-3' ? 'Reaksi Non-Spontan (Elektrolisis)'
                          : node.id === 'node-4' ? 'Perhitungan Kuantitatif'
                          : node.id === 'node-5' ? 'Aplikasi Korosi'
                          : node.id === 'node-assessment' ? 'Uji Kompetensi TP7'
                          : 'Prasyarat'}
                      </div>
                    </div>
                  )}

                  {/* Node Card */}
                  <div
                    onClick={() => setSelectedNodeId(node.id)}
                    id={`node-${node.id}`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedNodeId(node.id) }}
                    aria-label={`Pilih ${node.title}, status ${statusInfo.label}`}
                    aria-selected={isSelected}
                    className={`group relative flex items-center justify-between p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? 'border-[var(--ce-primary)] shadow-xl shadow-[var(--ce-primary)]/10 bg-white/7 scale-[1.01]'
                        : 'border-white/8 hover:border-white/20 bg-white/3 hover:bg-white/5'
                    }`}
                  >
                    {/* Left Accent Bar */}
                    <div
                      className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full transition-all"
                      style={{ background: isSelected ? node.color : 'rgba(255,255,255,0.1)' }}
                    />

                    {/* Node Info */}
                    <div className="flex items-center gap-4 pl-2">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:scale-105"
                        style={{
                          background: `linear-gradient(135deg, ${node.color}25, ${node.color}10)`,
                          border: `1px solid ${node.color}40`,
                        }}
                      >
                        <Icon size={22} style={{ color: node.color }} />
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-mono font-bold text-slate-400">
                            {node.tpCode}
                          </span>
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: `${node.color}20`, color: node.color, border: `1px solid ${node.color}35` }}
                          >
                            {node.badge}
                          </span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Clock size={11} /> {node.duration}
                          </span>
                        </div>

                        <h2 className="font-bold text-white text-base leading-snug group-hover:text-[var(--ce-primary)] transition-colors">
                          {node.title}
                        </h2>
                        <p className="text-xs text-slate-400 hidden sm:block">
                          {node.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Right Status Badge */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0 pl-2">
                      {statusInfo.status === 'completed' && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                          <CheckCircle2 size={13} />
                          <span className="hidden sm:inline">Selesai</span>
                        </div>
                      )}
                      {statusInfo.status === 'in-progress' && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full animate-pulse">
                          <Sparkles size={13} />
                          <span className="hidden sm:inline">{statusInfo.pct}%</span>
                        </div>
                      )}
                      {statusInfo.status === 'ready' && (
                        <div className="flex items-center gap-1.5 text-xs text-[var(--ce-primary)] font-semibold bg-[var(--ce-primary)]/10 border border-[var(--ce-primary)]/20 px-2.5 py-1 rounded-full">
                          <Circle size={13} />
                          <span className="hidden sm:inline">Siap</span>
                        </div>
                      )}
                      {statusInfo.status === 'locked' && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                          <Lock size={13} />
                          <span className="hidden sm:inline">Kunci</span>
                        </div>
                      )}

                      <span className="text-[11px] text-slate-500 group-hover:text-slate-300 flex items-center gap-0.5">
                        Detail <ChevronRight size={13} />
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── NODE INSPECTOR DETAIL CARD (COL 5) ────────────────────── */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="glass rounded-3xl border border-white/12 p-6 sm:p-7 shadow-2xl flex flex-col gap-6">

            {/* Header info of selected node */}
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${selectedNode.color}30, ${selectedNode.color}10)`,
                    border: `1px solid ${selectedNode.color}50`,
                  }}
                >
                  {(() => {
                    const Icon = NODE_ICONS[selectedNode.id] || Zap
                    return <Icon size={24} style={{ color: selectedNode.color }} />
                  })()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[var(--ce-primary)]">
                      {selectedNode.tpCode}
                    </span>
                    <span className="text-xs text-slate-500">• {selectedNode.duration}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white leading-tight mt-0.5">
                    {selectedNode.title}
                  </h2>
                </div>
              </div>

              {/* Status pill */}
              <span
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap"
                style={{
                  background: `${selectedNode.color}15`,
                  color: selectedNode.color,
                  borderColor: `${selectedNode.color}35`,
                }}
              >
                {selectedStatus.label}
              </span>
            </div>

            {/* Description & Learning Goal */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                <Target size={13} /> Capaian Pembelajaran
              </p>
              <p className="text-sm text-slate-300 leading-relaxed bg-white/3 p-3.5 rounded-xl border border-white/6">
                {selectedNode.tpDesc}
              </p>
            </div>

            {/* Triple Representation Breakdown */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ce-secondary)] mb-2 flex items-center gap-1.5">
                <Sparkles size={13} /> Representasi yang Dipelajari
              </p>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/6">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Eye size={14} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-sky-400">Makroskopik</span>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      {selectedNode.tripleRep.makro}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/6">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Atom size={14} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-400">Submikroskopik</span>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      {selectedNode.tripleRep.submikro}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/6">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Hash size={14} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-400">Simbolik</span>
                    <p className="text-xs text-slate-300 mt-0.5 font-mono leading-relaxed">
                      {selectedNode.tripleRep.simbolik}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Indicators Checklist */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Indikator Keberhasilan
              </p>
              <ul className="flex flex-col gap-1.5 text-xs text-slate-300">
                {selectedNode.indicators.map((ind, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{ind}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Direct CTA Button */}
            <div className="pt-2">
              <Link
                to={
                  selectedNode.type === 'prereq'
                    ? '/modul/1-redoks'
                    : selectedNode.type === 'assessment'
                    ? '/asesmen'
                    : `/modul/${selectedNode.slug}`
                }
                id="btn-buka-modul-peta"
                className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-bold text-white shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, ${selectedNode.color}, var(--ce-primary-dark))`,
                }}
              >
                {selectedStatus.status === 'completed' ? 'Ulangi Modul Ini' : 'Buka Modul Ini Sekarang'}
                <ArrowRight size={16} />
              </Link>
            </div>

          </div>
        </div>

      </div>

      {/* ── FOOTER CALLOUT: MODE GURU & DOKUMENTASI ───────────────── */}
      <section className="mt-16 glass rounded-2xl border border-white/8 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--ce-accent)]/20 border border-[var(--ce-accent)]/30 flex items-center justify-center shrink-0">
            <GraduationCap size={22} className="text-[var(--ce-accent)]" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base">Panduan untuk Pengajar & Guru</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Gunakan alur peta belajar ini untuk merancang RPP / Modul Ajar dan menentukan urutan demonstrasi simulasi di kelas.
            </p>
          </div>
        </div>
        <Link
          to="/guru"
          className="shrink-0 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-gradient-to-r from-[var(--ce-accent)] to-orange-500 transition-all hover:scale-105 shadow-lg"
        >
          Masuk Mode Guru →
        </Link>
      </section>

    </main>
  )
}
