import { useState } from 'react'
import { Eye, Atom, Hash, Sparkles, CheckCircle2, HelpCircle } from 'lucide-react'
import { InlineMath, BlockMath } from '../ui/MathFormula'

const TABS = [
  {
    id: 'makro',
    label: 'Makroskopik',
    icon: Eye,
    color: 'var(--ce-primary)',
    badgeBg: 'rgba(14,165,233,0.12)',
    badgeBorder: 'rgba(14,165,233,0.3)',
    hint: 'Apa yang teramati di laboratorium',
  },
  {
    id: 'submikro',
    label: 'Submikroskopik',
    icon: Atom,
    color: 'var(--ce-secondary)',
    badgeBg: 'rgba(16,185,129,0.12)',
    badgeBorder: 'rgba(16,185,129,0.3)',
    hint: 'Perilaku partikel, atom, dan elektron',
  },
  {
    id: 'simbolik',
    label: 'Simbolik',
    icon: Hash,
    color: 'var(--ce-accent)',
    badgeBg: 'rgba(245,158,11,0.12)',
    badgeBorder: 'rgba(245,158,11,0.3)',
    hint: 'Persamaan reaksi, biloks, dan matematika',
  },
]

export default function TripleRepTabs({ stepData }) {
  const [activeTab, setActiveTab] = useState('makro')

  if (!stepData || !stepData.content) {
    return null
  }

  const { makro, submikro, simbolik } = stepData.content

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
      {/* Tab Header Buttons */}
      <div
        role="tablist"
        aria-label="Tiga Level Representasi Kimia"
        className="flex items-center border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1.5 overflow-x-auto"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              style={{
                backgroundColor: isActive ? tab.badgeBg : 'transparent',
                border: isActive ? `1px solid ${tab.badgeBorder}` : '1px solid transparent',
              }}
            >
              <Icon
                size={16}
                style={{ color: isActive ? tab.color : 'currentColor' }}
                aria-hidden="true"
              />
              <span className="font-semibold">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content Panes */}
      <div className="p-5 sm:p-7">
        {/* TAB 1: MAKROSKOPIK */}
        {activeTab === 'makro' && (
          <div
            role="tabpanel"
            id="tabpanel-makro"
            aria-labelledby="tab-makro"
            className="space-y-5 animate-fade-in"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
                <Eye size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{makro.title}</h3>
                <p className="text-slate-300 text-sm mt-1 leading-relaxed">{makro.description}</p>
              </div>
            </div>

            {/* Observations List */}
            {makro.observations && (
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 sm:p-5 space-y-3">
                <h4 className="text-xs uppercase tracking-wider font-bold text-sky-400 flex items-center gap-1.5">
                  <CheckCircle2 size={15} />
                  Gejala Nyata yang Teramati:
                </h4>
                <ul className="space-y-2.5 text-sm text-slate-200">
                  {makro.observations.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                      <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                        {idx + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key Question Callout */}
            {makro.keyQuestion && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <HelpCircle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-amber-200 text-xs sm:text-sm font-medium leading-relaxed">
                  <span className="font-bold text-amber-300">Fokus Pengamatan: </span>
                  {makro.keyQuestion}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SUBMIKROSKOPIK */}
        {activeTab === 'submikro' && (
          <div
            role="tabpanel"
            id="tabpanel-submikro"
            aria-labelledby="tab-submikro"
            className="space-y-5 animate-fade-in"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                <Atom size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{submikro.title}</h3>
                <p className="text-slate-300 text-sm mt-1 leading-relaxed">{submikro.description}</p>
              </div>
            </div>

            {/* Particle Points */}
            {submikro.points && (
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 sm:p-5 space-y-3">
                <h4 className="text-xs uppercase tracking-wider font-bold text-emerald-400 flex items-center gap-1.5">
                  <Atom size={15} />
                  Mekanisme Partikulat & Transfer Elektron:
                </h4>
                <ul className="space-y-3 text-sm text-slate-200">
                  {submikro.points.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800/60 leading-relaxed">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                        {idx + 1}
                      </span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Submicroscopic Highlight Insight */}
            {submikro.highlight && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                <Sparkles size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-emerald-200 text-xs sm:text-sm font-medium leading-relaxed">
                  <span className="font-bold text-emerald-300">Wawasan Kunci: </span>
                  {submikro.highlight}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SIMBOLIK */}
        {activeTab === 'simbolik' && (
          <div
            role="tabpanel"
            id="tabpanel-simbolik"
            aria-labelledby="tab-simbolik"
            className="space-y-5 animate-fade-in"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                <Hash size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{simbolik.title}</h3>
                <p className="text-slate-300 text-sm mt-1 leading-relaxed">{simbolik.description}</p>
              </div>
            </div>

            {/* Half Reactions Section */}
            {simbolik.halfReactions && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {simbolik.halfReactions.map((item, idx) => {
                  const isOxidation = item.type.toLowerCase().includes('oksidasi')
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border bg-slate-950/50"
                      style={{
                        borderColor: isOxidation ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.3)',
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                          style={{
                            color: isOxidation ? 'var(--ce-anode-color)' : 'var(--ce-katode-color)',
                            backgroundColor: isOxidation ? 'rgba(239,68,68,0.12)' : 'rgba(59,130,246,0.12)',
                          }}
                        >
                          {item.type}
                        </span>
                      </div>
                      <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 my-2">
                        <BlockMath math={item.equation} />
                      </div>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                        {item.explanation}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Total Equation */}
            {simbolik.totalEquation && (
              <div className="bg-slate-950/60 border border-amber-500/30 rounded-xl p-4 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
                  Persamaan Reaksi Total:
                </span>
                <BlockMath math={simbolik.totalEquation} className="text-lg text-amber-200" />
              </div>
            )}

            {/* Mapping Table (e.g. for Step 2) */}
            {simbolik.mapping && (
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Istilah</th>
                      <th className="py-2.5 px-4">Spesi Kimia</th>
                      <th className="py-2.5 px-4">Alasan Ilmiah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                    {simbolik.mapping.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 px-4 font-semibold text-white whitespace-nowrap">
                          {row.term}
                        </td>
                        <td className="py-2.5 px-4 text-sky-300 font-mono">
                          <InlineMath math={row.species} />
                        </td>
                        <td className="py-2.5 px-4 text-slate-300 text-xs leading-relaxed">
                          {row.reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Bilox Summary */}
            {simbolik.biloxSummary && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
                <BlockMath math={simbolik.biloxSummary} className="text-sm text-slate-200" />
              </div>
            )}

            {/* Mnemonic / Golden Rule */}
            {simbolik.mnemonic && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-3">
                <Sparkles size={18} className="text-amber-400 shrink-0" />
                <p className="text-amber-300 text-xs sm:text-sm font-semibold">
                  {simbolik.mnemonic}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
