import React, { useState } from 'react';
import type { TripleRepContent, TripleRepLevel } from '../../content/types.ts';
import MathFormula from '../ui/MathFormula.tsx';
import {
  Eye,
  Atom,
  Binary,
  CheckCircle2,
  Zap,
  FileText,
  Info,
} from 'lucide-react';

export interface TripleRepTabsProps {
  tripleRep: TripleRepContent;
  initialLevel?: TripleRepLevel;
  onLevelChange?: (level: TripleRepLevel) => void;
  className?: string;
}

const TAB_LEVELS: {
  level: TripleRepLevel;
  label: string;
  badge: string;
  icon: typeof Eye;
  activeColor: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
}[] = [
  {
    level: 'makroskopik',
    label: 'Makroskopik',
    badge: 'Gejala Nyata',
    icon: Eye,
    activeColor: 'bg-amber-500 text-white shadow-amber-500/20',
    borderColor: 'border-amber-400',
    bgColor: 'bg-amber-50/70',
    textColor: 'text-amber-900',
  },
  {
    level: 'submikroskopik',
    label: 'Submikroskopik',
    badge: 'Partikel & Elektron',
    icon: Atom,
    activeColor: 'bg-sky-500 text-white shadow-sky-500/20',
    borderColor: 'border-sky-400',
    bgColor: 'bg-sky-50/70',
    textColor: 'text-sky-900',
  },
  {
    level: 'simbolik',
    label: 'Simbolik',
    badge: 'Rumus & Persamaan',
    icon: Binary,
    activeColor: 'bg-indigo-600 text-white shadow-indigo-500/20',
    borderColor: 'border-indigo-400',
    bgColor: 'bg-indigo-50/70',
    textColor: 'text-indigo-900',
  },
];

export default function TripleRepTabs({
  tripleRep,
  initialLevel = 'makroskopik',
  onLevelChange,
  className = '',
}: TripleRepTabsProps) {
  const [activeLevel, setActiveLevel] = useState<TripleRepLevel>(initialLevel);

  const handleSelectLevel = (level: TripleRepLevel) => {
    setActiveLevel(level);
    if (onLevelChange) {
      onLevelChange(level);
    }
  };

  // Keyboard Navigation WAI-ARIA
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (index + 1) % TAB_LEVELS.length;
      handleSelectLevel(TAB_LEVELS[nextIndex].level);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (index - 1 + TAB_LEVELS.length) % TAB_LEVELS.length;
      handleSelectLevel(TAB_LEVELS[prevIndex].level);
    }
  };

  const currentTabConfig =
    TAB_LEVELS.find((t) => t.level === activeLevel) || TAB_LEVELS[0];

  return (
    <div
      className={`bg-white border-2 border-slate-200 rounded-3xl shadow-xs overflow-hidden ${className}`}
    >
      {/* =========================================================================
          TAB SELEKTOR HORIZONTAL (Triple Representation Tabs)
         ========================================================================= */}
      <div className="p-2 sm:p-3 bg-slate-100/80 border-b border-slate-200">
        <div
          role="tablist"
          aria-label="Tiga Level Representasi Kimia Johnstone"
          className="grid grid-cols-3 gap-1.5 sm:gap-2.5"
        >
          {TAB_LEVELS.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activeLevel === tab.level;

            return (
              <button
                key={tab.level}
                type="button"
                role="tab"
                id={`tab-${tab.level}`}
                aria-selected={isActive}
                aria-controls={`panel-${tab.level}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => handleSelectLevel(tab.level)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 sm:px-4 rounded-2xl transition-all min-h-[48px] cursor-pointer text-center sm:text-left focus-visible:outline-2 focus-visible:outline-sky-500 ${
                  isActive
                    ? `${tab.activeColor} shadow-md font-extrabold`
                    : 'bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <div className="flex flex-col leading-tight">
                  <span className="text-xs sm:text-sm font-bold tracking-tight">
                    {tab.label}
                  </span>
                  <span
                    className={`text-[10px] hidden sm:inline ${
                      isActive ? 'opacity-90' : 'text-slate-500 font-medium'
                    }`}
                  >
                    {tab.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          KONTEN PANEL (Berubah Tanpa Reload Sesuai Tab Terpilih)
         ========================================================================= */}
      <div className="p-5 sm:p-7">
        {/* PANEL 1: MAKROSKOPIK */}
        {activeLevel === 'makroskopik' && (
          <div
            role="tabpanel"
            id="panel-makroskopik"
            aria-labelledby="tab-makroskopik"
            className="space-y-6 animate-in fade-in duration-200"
          >
            {/* Header Level */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Eye className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider block">
                  Level Makroskopik • Gejala Fisik Teramati
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {tripleRep.macroscopic.title}
                </h3>
              </div>
            </div>

            {/* Deskripsi Pengamatan */}
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              {tripleRep.macroscopic.description}
            </p>

            {/* Daftar Observasi Poin demi Poin */}
            {tripleRep.macroscopic.observations &&
              tripleRep.macroscopic.observations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    <span>Poin Pengamatan Laboratorium:</span>
                  </h4>
                  <ul className="grid grid-cols-1 gap-2.5">
                    {tripleRep.macroscopic.observations.map((obs, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed"
                      >
                        <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-900 font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{obs}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Kotak Ilustrasi / Alt Text */}
            {tripleRep.macroscopic.visualAlt && (
              <div className="p-3.5 rounded-xl bg-slate-100/70 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">
                    Ilustrasi Pengamatan:{' '}
                  </span>
                  <span>{tripleRep.macroscopic.visualAlt}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PANEL 2: SUBMIKROSKOPIK */}
        {activeLevel === 'submikroskopik' && (
          <div
            role="tabpanel"
            id="panel-submikroskopik"
            aria-labelledby="tab-submikroskopik"
            className="space-y-6 animate-in fade-in duration-200"
          >
            {/* Header Level */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-sky-50/80 border border-sky-200">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Atom className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-extrabold text-sky-800 uppercase tracking-wider block">
                  Level Submikroskopik • Partikel Atom, Ion &amp; Elektron
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {tripleRep.submicroscopic.title}
                </h3>
              </div>
            </div>

            {/* Deskripsi Partikel */}
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              {tripleRep.submicroscopic.description}
            </p>

            {/* Daftar Partikel Poin demi Poin */}
            {tripleRep.submicroscopic.particles &&
              tripleRep.submicroscopic.particles.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-4 h-4 text-sky-600" />
                    <span>Dinamika Partikel &amp; Aliran Elektron:</span>
                  </h4>
                  <ul className="grid grid-cols-1 gap-2.5">
                    {tripleRep.submicroscopic.particles.map((part, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed"
                      >
                        <span className="w-5 h-5 rounded-md bg-sky-100 text-sky-900 font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{part}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Kotak Ilustrasi / Alt Text */}
            {tripleRep.submicroscopic.visualAlt && (
              <div className="p-3.5 rounded-xl bg-slate-100/70 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">
                    Model Partikel:{' '}
                  </span>
                  <span>{tripleRep.submicroscopic.visualAlt}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PANEL 3: SIMBOLIK */}
        {activeLevel === 'simbolik' && (
          <div
            role="tabpanel"
            id="panel-simbolik"
            aria-labelledby="tab-simbolik"
            className="space-y-6 animate-in fade-in duration-200"
          >
            {/* Header Level */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Binary className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-extrabold text-indigo-800 uppercase tracking-wider block">
                  Level Simbolik • Notasi Kimia &amp; KaTeX
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {tripleRep.symbolic.title}
                </h3>
              </div>
            </div>

            {/* Rumus Matematika / LaTeX Formula (dengan KaTeX) */}
            {tripleRep.symbolic.latexFormulas &&
              tripleRep.symbolic.latexFormulas.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>Rumus &amp; Persamaan Reaksi (KaTeX):</span>
                  </h4>
                  <div className="space-y-2 bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-inner overflow-x-auto">
                    {tripleRep.symbolic.latexFormulas.map((formula, idx) => (
                      <div
                        key={idx}
                        className="py-1 text-sky-200 font-mono text-center sm:text-left"
                      >
                        <MathFormula formula={formula} displayMode />
                      </div>
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-500 italic block">
                    Garis dapat digulir horizontal pada layar ponsel.
                  </span>
                </div>
              )}

            {/* Daftar Reaksi Singkat */}
            {tripleRep.symbolic.reactions &&
              tripleRep.symbolic.reactions.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Ringkasan Persamaan Reaksi:
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {tripleRep.symbolic.reactions.map((rxn, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-2.5 rounded-xl bg-indigo-50/50 border border-indigo-200/80 font-mono text-xs sm:text-sm text-indigo-950 font-semibold flex items-center gap-2"
                      >
                        <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                        <span>{rxn}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Penjelasan Makna Simbolik */}
            {tripleRep.symbolic.explanation && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Penjelasan Konseptual Notasi:
                </h4>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                  {tripleRep.symbolic.explanation}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Indikator Level Terpilih */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <currentTabConfig.icon className="w-3.5 h-3.5" />
          <span>
            Menampilkan Representasi <strong>{currentTabConfig.label}</strong>
          </span>
        </span>
        <span className="text-[11px] font-semibold text-slate-400">
          Pendekatan Johnstone (1991)
        </span>
      </div>
    </div>
  );
}

