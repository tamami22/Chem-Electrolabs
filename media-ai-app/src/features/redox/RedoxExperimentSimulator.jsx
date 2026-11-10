import { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, ArrowDownCircle, ArrowUpCircle, Eye, Atom, Hash, Sparkles } from 'lucide-react'
import { InlineMath, BlockMath } from '../../components/ui/MathFormula'

export default function RedoxExperimentSimulator() {
  const [isImmersed, setIsImmersed] = useState(true)
  const [timeSeconds, setTimeSeconds] = useState(0) // 0 to 60
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeView, setActiveView] = useState('makro') // 'makro' | 'submikro' | 'simbolik'

  // Animation timer loop
  useEffect(() => {
    if (!isPlaying || !isImmersed) return

    const interval = setInterval(() => {
      setTimeSeconds((prev) => {
        if (prev >= 60) {
          setIsPlaying(false)
          return 60
        }
        return prev + 1
      })
    }, 200)

    return () => clearInterval(interval)
  }, [isPlaying, isImmersed])

  // Progress ratio (0 to 1)
  const progress = isImmersed ? timeSeconds / 60 : 0

  // Dynamic visual calculations
  // Solution color: from rich blue (rgb(14, 165, 233)) to pale greenish blue (rgb(20, 184, 166))
  const blueAmount = Math.max(0.15, 1 - progress * 0.7)
  const greenAmount = 0.5 + progress * 0.35
  const solutionFill = `rgba(14, ${Math.floor(165 * greenAmount)}, 233, ${blueAmount})`

  // Copper coating thickness & opacity on iron nail
  const copperOpacity = Math.min(0.95, progress * 1.1)

  const handleReset = () => {
    setIsPlaying(false)
    setTimeSeconds(0)
  }

  const toggleImmersion = () => {
    setIsImmersed((prev) => {
      const next = !prev
      if (!next) setIsPlaying(false)
      return next
    })
  }

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Simulation Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              Laboratorium Virtual: Reaksi Paku Besi (Fe) dalam Larutan CuSO₄
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Eksplorasi eksperimen transfer elektron dalam tiga representasi secara langsung
          </p>
        </div>

        {/* View Mode Selector */}
        <div
          role="tablist"
          aria-label="Pilih Representasi Simulasi"
          className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1"
        >
          <button
            role="tab"
            aria-selected={activeView === 'makro'}
            onClick={() => setActiveView('makro')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'makro'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye size={14} />
            Makroskopik
          </button>
          <button
            role="tab"
            aria-selected={activeView === 'submikro'}
            onClick={() => setActiveView('submikro')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'submikro'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Atom size={14} />
            Submikroskopik
          </button>
          <button
            role="tab"
            aria-selected={activeView === 'simbolik'}
            onClick={() => setActiveView('simbolik')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'simbolik'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Hash size={14} />
            Simbolik
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 sm:p-7 items-center">
        {/* Canvas Area (SVG Visualization) */}
        <div className="lg:col-span-7 bg-slate-950/90 rounded-2xl p-4 sm:p-6 border border-slate-800/80 shadow-inner flex flex-col items-center relative overflow-hidden">
          {/* Background Ambient Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

          {/* VIEW 1: MAKROSKOPIK (Gelas Kimia + Paku) */}
          {activeView === 'makro' && (
            <div className="w-full flex flex-col items-center animate-fade-in relative z-10">
              <svg
                viewBox="0 0 360 280"
                className="w-full max-w-[340px] sm:max-w-[380px] h-auto drop-shadow-lg"
                aria-label="Diagram Gelas Kimia dengan Larutan CuSO4 dan Paku Besi"
              >
                <title>Eksperimen Makroskopik Fe dalam CuSO4</title>
                <desc>Gelas kimia berisi larutan tembaga(II) sulfat dengan paku besi yang tercelup</desc>

                {/* Beaker Outline */}
                <rect
                  x="80"
                  y="70"
                  width="200"
                  height="180"
                  rx="16"
                  fill="none"
                  stroke="#64748B"
                  strokeWidth="3.5"
                  strokeDasharray="4 0"
                />
                {/* Lip / Beaker rim */}
                <path
                  d="M 70 70 L 90 70 M 270 70 L 290 70"
                  stroke="#94A3B8"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                {/* Beaker Measurement Lines */}
                <line x1="85" y1="110" x2="110" y2="110" stroke="#475569" strokeWidth="2" />
                <text x="115" y="114" fill="#64748B" fontSize="9" fontFamily="sans-serif">150 mL</text>
                <line x1="85" y1="150" x2="110" y2="150" stroke="#475569" strokeWidth="2" />
                <text x="115" y="154" fill="#64748B" fontSize="9" fontFamily="sans-serif">100 mL</text>
                <line x1="85" y1="190" x2="110" y2="190" stroke="#475569" strokeWidth="2" />
                <text x="115" y="194" fill="#64748B" fontSize="9" fontFamily="sans-serif">50 mL</text>

                {/* Liquid in Beaker */}
                <rect
                  x="84"
                  y="105"
                  width="192"
                  height="141"
                  rx="12"
                  fill={solutionFill}
                  className="transition-colors duration-500"
                />
                {/* Liquid Surface Meniscus */}
                <ellipse
                  cx="180"
                  cy="105"
                  rx="96"
                  ry="9"
                  fill="rgba(56, 189, 248, 0.3)"
                />

                {/* Paku Besi (Iron Nail) */}
                {/* Immersion Y-offset */}
                <g
                  transform={`translate(0, ${isImmersed ? 0 : -65})`}
                  className="transition-transform duration-500 ease-out"
                >
                  {/* Nail Head */}
                  <rect x="156" y="25" width="48" height="10" rx="2" fill="#94A3B8" stroke="#475569" strokeWidth="1.5" />
                  {/* Nail Body Top (Unsubmerged or above liquid) */}
                  <polygon
                    points="174,35 186,35 186,105 174,105"
                    fill="#94A3B8"
                    stroke="#475569"
                    strokeWidth="1.5"
                  />
                  {/* Nail Body Submerged (With dynamic Copper coating) */}
                  <polygon
                    points="174,105 186,105 183,215 180,225 177,215"
                    fill="#94A3B8"
                    stroke="#475569"
                    strokeWidth="1.5"
                  />

                  {/* Copper Coating Layer overlay */}
                  {isImmersed && (
                    <polygon
                      points="173,106 187,106 184,215 180,226 176,215"
                      fill="#EA580C"
                      opacity={copperOpacity}
                      className="transition-opacity duration-300"
                    />
                  )}

                  {/* Nail Texture/Glint */}
                  <line x1="177" y1="36" x2="177" y2="100" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
                </g>

                {/* Floating Labels / Legend in SVG */}
                <g transform="translate(195, 80)">
                  <rect x="0" y="0" width="85" height="20" rx="5" fill="#0F172A" stroke="#38BDF8" strokeWidth="1" opacity="0.9" />
                  <text x="42" y="14" fill="#38BDF8" fontSize="10" fontWeight="bold" textAnchor="middle">
                    {timeSeconds < 30 ? 'CuSO₄ (Biru)' : 'FeSO₄ + Cu²⁺ memudar'}
                  </text>
                </g>

                <g transform="translate(40, 40)">
                  <rect x="0" y="0" width="90" height="20" rx="5" fill="#0F172A" stroke="#94A3B8" strokeWidth="1" opacity="0.9" />
                  <text x="45" y="14" fill="#E2E8F0" fontSize="10" fontWeight="bold" textAnchor="middle">
                    Paku Besi (Fe)
                  </text>
                </g>

                {isImmersed && timeSeconds > 10 && (
                  <g transform="translate(195, 185)">
                    <rect x="0" y="0" width="105" height="20" rx="5" fill="#0F172A" stroke="#EA580C" strokeWidth="1" opacity="0.9" />
                    <text x="52" y="14" fill="#FB923C" fontSize="9" fontWeight="bold" textAnchor="middle">
                      Endapan Cu(s) Merah
                    </text>
                  </g>
                )}
              </svg>
            </div>
          )}

          {/* VIEW 2: SUBMIKROSKOPIK (Zoom Atomik & Transfer Elektron) */}
          {activeView === 'submikro' && (
            <div className="w-full flex flex-col items-center animate-fade-in relative z-10">
              <svg
                viewBox="0 0 360 280"
                className="w-full max-w-[340px] sm:max-w-[380px] h-auto drop-shadow-lg"
                aria-label="Diagram Submikroskopik Transfer Elektron pada Antarmuka Logam dan Larutan"
              >
                <title>Tingkat Submikroskopik Fe melepaskan 2e- ke Cu2+</title>

                {/* Left Side: Solid Iron Lattice (Besi Fe) */}
                <rect x="15" y="20" width="135" height="240" rx="8" fill="#1E293B" stroke="#475569" strokeWidth="2" />
                <text x="82" y="42" fill="#94A3B8" fontSize="12" fontWeight="bold" textAnchor="middle">
                  Batang Besi [Fe(s)]
                </text>

                {/* Iron Atoms Grid in solid lattice */}
                {[
                  { cx: 45, cy: 75 }, { cx: 85, cy: 75 }, { cx: 125, cy: 75 },
                  { cx: 45, cy: 115 }, { cx: 85, cy: 115 }, { cx: 125, cy: 115 },
                  { cx: 45, cy: 155 }, { cx: 85, cy: 155 }, { cx: 125, cy: 155 },
                  { cx: 45, cy: 195 }, { cx: 85, cy: 195 }, { cx: 125, cy: 195 },
                  { cx: 45, cy: 235 }, { cx: 85, cy: 235 },
                ].map((pos, idx) => (
                  <g key={idx}>
                    <circle cx={pos.cx} cy={pos.cy} r="14" fill="#334155" stroke="#94A3B8" strokeWidth="1.5" />
                    <text x={pos.cx} y={pos.cy + 4} fill="#F1F5F9" fontSize="10" fontWeight="bold" textAnchor="middle">Fe</text>
                  </g>
                ))}

                {/* Right Side: Solution (Larutan Air) */}
                <rect x="150" y="20" width="195" height="240" rx="8" fill={solutionFill} stroke="#38BDF8" strokeWidth="1.5" />
                <text x="247" y="42" fill="#38BDF8" fontSize="12" fontWeight="bold" textAnchor="middle">
                  Larutan Air [CuSO₄]
                </text>

                {/* Boundary line */}
                <line x1="150" y1="20" x2="150" y2="260" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="3 3" />

                {/* Submicroscopic Action: Fe dissolves as Fe2+, releases 2 electrons */}
                <g className="animate-pulse">
                  {/* Releasing Fe2+ */}
                  <circle cx="185" cy="115" r="15" fill="#047857" stroke="#10B981" strokeWidth="2" />
                  <text x="185" y="119" fill="#ECFDF5" fontSize="10" fontWeight="bold" textAnchor="middle">Fe²⁺</text>
                  <path d="M 130 115 Q 155 100 170 115" fill="none" stroke="#10B981" strokeWidth="2" markerEnd="url(#arrow-green)" />

                  {/* Transfering Electrons */}
                  <circle cx="140" cy="155" r="6" fill="#FACC15" />
                  <text x="140" y="158" fill="#0F172A" fontSize="7" fontWeight="bold" textAnchor="middle">e⁻</text>

                  <circle cx="140" cy="170" r="6" fill="#FACC15" />
                  <text x="140" y="173" fill="#0F172A" fontSize="7" fontWeight="bold" textAnchor="middle">e⁻</text>
                </g>

                {/* Cu2+ ion approaching and getting reduced to Cu(s) */}
                <g>
                  {/* Cu2+ approaching */}
                  <circle cx="230" cy="165" r="15" fill="#0284C7" stroke="#38BDF8" strokeWidth="2" />
                  <text x="230" y="169" fill="#F0F9FF" fontSize="10" fontWeight="bold" textAnchor="middle">Cu²⁺</text>
                  {/* Arrow indicating Cu2+ moves to surface */}
                  <line x1="210" y1="165" x2="165" y2="165" stroke="#FACC15" strokeWidth="2" strokeDasharray="4 2" />

                  {/* Deposited Cu(s) atom on boundary */}
                  <circle cx="150" cy="215" r="14" fill="#C2410C" stroke="#EA580C" strokeWidth="2" />
                  <text x="150" y="219" fill="#FFF7ED" fontSize="10" fontWeight="bold" textAnchor="middle">Cu(s)</text>
                </g>

                {/* Spectator SO4 2- */}
                <circle cx="280" cy="110" r="14" fill="#1E293B" stroke="#64748B" strokeWidth="1.5" />
                <text x="280" y="114" fill="#94A3B8" fontSize="8" fontWeight="bold" textAnchor="middle">SO₄²⁻</text>
                <circle cx="270" cy="220" r="14" fill="#1E293B" stroke="#64748B" strokeWidth="1.5" />
                <text x="270" y="224" fill="#94A3B8" fontSize="8" fontWeight="bold" textAnchor="middle">SO₄²⁻</text>
              </svg>
            </div>
          )}

          {/* VIEW 3: SIMBOLIK (Live Data & Perhitungan) */}
          {activeView === 'simbolik' && (
            <div className="w-full flex flex-col justify-center space-y-3.5 animate-fade-in p-2 relative z-10 text-left">
              <div className="bg-slate-900/90 border border-red-500/30 rounded-xl p-3.5">
                <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                  Setengah Reaksi Oksidasi (Pelepasan Elektron):
                </span>
                <BlockMath math="\text{Fe}(s) \rightarrow \text{Fe}^{2+}(aq) + 2e^- \quad [E^\circ = -0{,}44\text{ V}]" className="text-sm text-red-200" />
                <p className="text-xs text-slate-300">
                  Atom Fe melepaskan 2e⁻ ke kation Cu²⁺; bilangan oksidasi Fe naik dari 0 ke +2.
                </p>
              </div>

              <div className="bg-slate-900/90 border border-blue-500/30 rounded-xl p-3.5">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  Setengah Reaksi Reduksi (Penangkapan Elektron):
                </span>
                <BlockMath math="\text{Cu}^{2+}(aq) + 2e^- \rightarrow \text{Cu}(s) \quad [E^\circ = +0{,}34\text{ V}]" className="text-sm text-blue-200" />
                <p className="text-xs text-slate-300">
                  Kation Cu²⁺ menangkap 2e⁻; bilangan oksidasi Cu turun dari +2 menjadi 0.
                </p>
              </div>

              <div className="bg-slate-900/90 border border-amber-500/40 rounded-xl p-3.5 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Potensial Reaksi Standar (Spontanitas):
                </span>
                <BlockMath math="E^\circ_\text{reaksi} = E^\circ_\text{reduksi} - E^\circ_\text{oksidasi} = (+0{,}34) - (-0{,}44) = +0{,}78\text{ V}" className="text-base text-amber-300" />
                <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                  <Sparkles size={14} />
                  Reaksi Berlangsung Spontan (E° &gt; 0)
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Control & Live Feedback Panel */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          {/* Status Box */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                Kondisi Eksperimen
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  isImmersed
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {isImmersed ? 'Paku Tercelup' : 'Paku Diangkat'}
              </span>
            </div>

            {/* Time Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                <span>Waktu Perendaman:</span>
                <span className="font-mono font-bold text-sky-400">{timeSeconds} detik</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="5"
                value={timeSeconds}
                disabled={!isImmersed}
                onChange={(e) => setTimeSeconds(Number(e.target.value))}
                className="w-full accent-sky-400 h-2 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-50"
                aria-label="Waktu perendaman dalam detik"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0s (Awal)</span>
                <span>30s</span>
                <span>60s (Jenuh)</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={!isImmersed || timeSeconds >= 60}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold text-white transition-all bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-lg shadow-sky-500/20"
                aria-label={isPlaying ? 'Jeda Simulasi' : 'Jalankan Reaksi'}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                {isPlaying ? 'Jeda' : 'Jalankan Reaksi'}
              </button>

              <button
                type="button"
                onClick={toggleImmersion}
                className="flex items-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer border border-slate-700"
                aria-label={isImmersed ? 'Angkat Paku' : 'Celupkan Paku'}
              >
                {isImmersed ? <ArrowUpCircle size={16} /> : <ArrowDownCircle size={16} />}
                {isImmersed ? 'Angkat' : 'Celupkan'}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="p-2.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer border border-slate-700"
                title="Reset Eksperimen"
                aria-label="Reset Eksperimen"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* Educational Observation Guide */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-xs sm:text-sm leading-relaxed space-y-2">
            <h4 className="text-xs uppercase tracking-wider font-bold text-sky-400 flex items-center gap-1.5">
              <Sparkles size={14} />
              Catatan Laboratorium:
            </h4>
            {timeSeconds === 0 && (
              <p className="text-slate-300">
                Paku besi masih bersih dan mengilap. Larutan tembaga(II) sulfat berwarna biru pekat karena konsentrasi ion <InlineMath math="\text{Cu}^{2+}" /> masih maksimal.
              </p>
            )}
            {timeSeconds > 0 && timeSeconds < 30 && (
              <p className="text-slate-300">
                Reaksi dimulai! Atom Fe mulai mendonorkan 2e⁻ ke kation <InlineMath math="\text{Cu}^{2+}" />. Mulai terbentuk bintik-bintik endapan merah bata tembaga di permukaan paku.
              </p>
            )}
            {timeSeconds >= 30 && (
              <p className="text-slate-300">
                Endapan tembaga padat <InlineMath math="\text{Cu}(s)" /> semakin tebal menyelimuti paku. Warna biru larutan tampak jelas memudar karena ion <InlineMath math="\text{Cu}^{2+}" /> tereduksi dan larutan terisi oleh ion <InlineMath math="\text{Fe}^{2+}" />.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
