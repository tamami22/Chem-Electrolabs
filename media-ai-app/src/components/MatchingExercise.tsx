import React, { useState, useMemo } from 'react';
import { ExerciseData, MatchingItem, ExercisesJSON } from '../types/content';
import exercisesDataRaw from '../content/exercises.json';
import { LatexText } from './LatexText';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Link as LinkIcon,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';

const exercisesData = exercisesDataRaw as unknown as ExercisesJSON;

export interface MatchingExerciseProps {
  /**
   * Data latihan mencocokkan. Jika tidak diberikan, default memuat dari exercises.json
   */
  exercise?: ExerciseData;
  /**
   * Module ID untuk memuat latihan jika `exercise` tidak disediakan (contoh: 'module1', 'module2')
   */
  moduleId?: string;
  /**
   * Indeks latihan dalam modul (0-based)
   */
  exerciseIndex?: number;
  /**
   * Callback saat latihan selesai diperiksa
   */
  onComplete?: (score: number, total: number) => void;
  /**
   * Class name tambahan untuk wrapper
   */
  className?: string;
}

export const MatchingExercise: React.FC<MatchingExerciseProps> = ({
  exercise: propExercise,
  moduleId = 'module1',
  exerciseIndex = 0,
  onComplete,
  className = '',
}) => {
  // Ambil data exercise dari props atau fallback ke exercises.json
  const activeExercise: ExerciseData = useMemo(() => {
    if (propExercise) return propExercise;
    const moduleList = exercisesData[moduleId] || exercisesData.module1;
    const found = moduleList.find((ex) => ex.type === 'matching') || moduleList[exerciseIndex] || moduleList[0];
    return found;
  }, [propExercise, moduleId, exerciseIndex]);

  // Filter hanya MatchingItem dari items
  const matchingItems = useMemo(() => {
    return (activeExercise.items as MatchingItem[]).filter(
      (item) => item.categoryId !== undefined || item.matchId !== undefined || item.matchText !== undefined
    );
  }, [activeExercise]);

  const hasCategories = Boolean(activeExercise.categories && activeExercise.categories.length > 0);

  // -------------------------------------------------------------
  // STATE UNTUK KATEGORI MATCHING (Mode A: Drag / Tap to Category)
  // -------------------------------------------------------------
  // Map item ID -> category ID yang dipilih user
  const [categoryAssignments, setCategoryAssignments] = useState<Record<string, string>>({});
  // Item yang sedang aktif dipilih (untuk interaksi tap/click)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // -------------------------------------------------------------
  // STATE UNTUK PASANGAN MATCHING (Mode B: Pair matching 1-to-1)
  // -------------------------------------------------------------
  // Map item ID -> matched target ID/text
  const [pairAssignments, setPairAssignments] = useState<Record<string, string>>({});
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [shuffleSeed, setShuffleSeed] = useState<number>(0);

  // Target pasangan yang diacak untuk Mode B (pure seeded pseudo-random shuffle)
  const shuffledTargets = useMemo(() => {
    if (hasCategories) return [];
    const list = matchingItems.map((item) => ({
      targetId: item.matchId || item.id,
      matchText: item.matchText || item.text,
    }));

    // Seeded pseudo-random generator (pure function)
    let seed = 123456789 + shuffleSeed * 987654321;
    for (let i = 0; i < activeExercise.id.length; i++) {
      seed += activeExercise.id.charCodeAt(i) * (i + 1);
    }

    const pseudoRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(pseudoRandom() * (i + 1));
      const temp = list[i];
      list[i] = list[j];
      list[j] = temp;
    }
    return list;
  }, [matchingItems, hasCategories, activeExercise.id, shuffleSeed]);

  // Status submisi & evaluasi
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Drag-and-drop state
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  // Reset exercise state
  const handleReset = () => {
    setCategoryAssignments({});
    setPairAssignments({});
    setSelectedItemId(null);
    setSelectedLeftId(null);
    setIsSubmitted(false);
    setShuffleSeed((prev) => prev + 1);
  };

  // -------------------------------------------------------------
  // LOGIKA MODE A: Kategori
  // -------------------------------------------------------------
  const handleSelectPoolItem = (itemId: string) => {
    if (isSubmitted) return;
    setSelectedItemId((prev) => (prev === itemId ? null : itemId));
  };

  const handleAssignCategory = (categoryId: string) => {
    if (isSubmitted || !selectedItemId) return;
    setCategoryAssignments((prev) => ({
      ...prev,
      [selectedItemId]: categoryId,
    }));
    setSelectedItemId(null);
  };

  const handleRemoveCategoryAssignment = (itemId: string) => {
    if (isSubmitted) return;
    setCategoryAssignments((prev) => {
      const copy = { ...prev };
      delete copy[itemId];
      return copy;
    });
  };

  // Drag and drop handlers untuk Mode A
  const handleDragStart = (itemId: string) => {
    if (isSubmitted) return;
    setDraggedItemId(itemId);
  };

  const handleDropToCategory = (categoryId: string) => {
    if (isSubmitted || !draggedItemId) return;
    setCategoryAssignments((prev) => ({
      ...prev,
      [draggedItemId]: categoryId,
    }));
    setDraggedItemId(null);
  };

  // -------------------------------------------------------------
  // LOGIKA MODE B: Pair Matching
  // -------------------------------------------------------------
  const handleSelectLeft = (itemId: string) => {
    if (isSubmitted) return;
    setSelectedLeftId((prev) => (prev === itemId ? null : itemId));
  };

  const handleSelectRight = (targetId: string) => {
    if (isSubmitted || !selectedLeftId) return;

    // Pasangkan leftId dengan targetId
    setPairAssignments((prev) => {
      const updated = { ...prev };
      // Hapus pasangan targetId jika sebelumnya sudah terpakai
      Object.keys(updated).forEach((key) => {
        if (updated[key] === targetId) {
          delete updated[key];
        }
      });
      updated[selectedLeftId] = targetId;
      return updated;
    });

    setSelectedLeftId(null);
  };

  const handleRemovePair = (leftId: string) => {
    if (isSubmitted) return;
    setPairAssignments((prev) => {
      const copy = { ...prev };
      delete copy[leftId];
      return copy;
    });
  };

  // -------------------------------------------------------------
  // PERIKSA JAWABAN & SKOR
  // -------------------------------------------------------------
  const evaluation = useMemo(() => {
    let correctCount = 0;
    const total = matchingItems.length;

    const details = matchingItems.map((item) => {
      if (hasCategories) {
        const assigned = categoryAssignments[item.id];
        const isCorrect = assigned === item.categoryId;
        if (isCorrect) correctCount++;
        return {
          item,
          isCorrect,
          assigned,
          expected: item.categoryId,
        };
      } else {
        const assigned = pairAssignments[item.id];
        const expected = item.matchId || item.id;
        const isCorrect = assigned === expected;
        if (isCorrect) correctCount++;
        return {
          item,
          isCorrect,
          assigned,
          expected,
        };
      }
    });

    return { correctCount, total, details };
  }, [matchingItems, hasCategories, categoryAssignments, pairAssignments]);

  const handleSubmit = () => {
    setIsSubmitted(true);
    if (onComplete) {
      onComplete(evaluation.correctCount, evaluation.total);
    }
  };

  const allAssigned = hasCategories
    ? matchingItems.every((item) => categoryAssignments[item.id] !== undefined)
    : matchingItems.every((item) => pairAssignments[item.id] !== undefined);

  return (
    <div
      className={`glass rounded-2xl border border-white/10 p-6 sm:p-8 shadow-xl bg-slate-900/80 backdrop-blur-md relative overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Decorative top bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 via-sky-500 to-indigo-500" />

      {/* Header Latihan */}
      <div className="mb-6 pb-4 border-b border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-teal-500/15 text-teal-400 border border-teal-500/30 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            Latihan Interaktif (Mencocokkan)
          </span>
          <span className="text-xs text-slate-400 font-mono">
            ID: {activeExercise.id}
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
          {activeExercise.title}
        </h3>

        <p className="text-sm sm:text-base text-slate-300 flex items-center gap-2">
          <Info className="w-4 h-4 text-sky-400 flex-shrink-0" />
          <LatexText text={activeExercise.instruction} />
        </p>
      </div>

      {/* ========================================================= */}
      {/* TAMPILAN MODE A: KATEGORI (Triple Representation, dll.)    */}
      {/* ========================================================= */}
      {hasCategories && (
        <div className="space-y-6">
          {/* Instruksi Interaktivitas */}
          <div className="text-xs text-slate-400 bg-slate-800/40 p-3 rounded-xl border border-white/5 flex items-center justify-between">
            <span>
              💡 <strong>Tips:</strong> Klik/ketuk kartu di bawah lalu pilih kategori tujuan, atau drag-and-drop kartu langsung ke wadah kategori.
            </span>
          </div>

          {/* Area Kategori (Drop Targets / Selection Targets) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeExercise.categories?.map((cat) => {
              // Cari item-item yang ditempatkan di kategori ini
              const assignedItems = matchingItems.filter(
                (item) => categoryAssignments[item.id] === cat.id
              );

              return (
                <div
                  key={cat.id}
                  onClick={() => handleAssignCategory(cat.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDropToCategory(cat.id)}
                  className={`rounded-2xl p-4 border transition-all duration-200 min-h-[180px] flex flex-col ${
                    selectedItemId
                      ? 'border-sky-400/60 bg-sky-500/10 hover:bg-sky-500/20 cursor-pointer ring-2 ring-sky-400/30'
                      : 'border-white/10 bg-slate-800/40'
                  }`}
                >
                  {/* Category Title */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                    <span className="font-bold text-sm sm:text-base text-sky-300">
                      {cat.label}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-300 font-mono">
                      {assignedItems.length} item
                    </span>
                  </div>

                  {/* List Item yang Ditempatkan di Kategori Ini */}
                  <div className="flex-1 space-y-2">
                    {assignedItems.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-xs text-slate-500 italic py-6 text-center">
                        {selectedItemId
                          ? 'Ketuk di sini untuk meletakkan item'
                          : 'Tarik / letakkan item ke sini'}
                      </div>
                    ) : (
                      assignedItems.map((item) => {
                        const isItemCorrect = item.categoryId === cat.id;

                        let itemBadge = 'border-white/15 bg-slate-800 text-slate-200';
                        if (isSubmitted) {
                          itemBadge = isItemCorrect
                            ? 'border-emerald-500/80 bg-emerald-500/20 text-emerald-100 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                            : 'border-rose-500/80 bg-rose-500/20 text-rose-100 shadow-[0_0_12px_rgba(244,63,94,0.3)]';
                        }

                        return (
                          <div
                            key={item.id}
                            className={`p-3 rounded-xl border text-xs sm:text-sm transition-all duration-200 relative group ${itemBadge}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="leading-relaxed">
                                <LatexText text={item.text} />
                              </span>
                              {!isSubmitted && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveCategoryAssignment(item.id);
                                  }}
                                  className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                                  title="Kembalikan ke daftar"
                                >
                                  ×
                                </button>
                              )}
                              {isSubmitted && (
                                <div className="flex-shrink-0 pt-0.5">
                                  {isItemCorrect ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-rose-400" />
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Penjelasan jika sudah disubmit */}
                            {isSubmitted && (
                              <div className="mt-2 pt-2 border-t border-white/10 text-[11px] sm:text-xs text-slate-300 leading-normal">
                                <strong className="text-slate-400">Penjelasan:</strong>{' '}
                                <LatexText text={item.explanation} />
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Kolom Item Yang Belum Ditempatkan */}
          <div className="pt-2">
            <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <span>Item Pilihan ({matchingItems.filter((i) => !categoryAssignments[i.id]).length} tersisa):</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {matchingItems
                .filter((item) => !categoryAssignments[item.id])
                .map((item) => {
                  const isSelected = selectedItemId === item.id;
                  return (
                    <div
                      key={item.id}
                      draggable={!isSubmitted}
                      onDragStart={() => handleDragStart(item.id)}
                      onClick={() => handleSelectPoolItem(item.id)}
                      className={`p-4 rounded-xl border text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer select-none ${
                        isSelected
                          ? 'border-sky-400 bg-sky-500/20 text-white ring-2 ring-sky-400/50 shadow-lg shadow-sky-500/20 scale-[1.02]'
                          : 'border-white/10 bg-slate-800/80 hover:bg-slate-700/80 hover:border-sky-400/40 text-slate-200'
                      }`}
                    >
                      <LatexText text={item.text} />
                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
                        <span>{isSelected ? '✓ Terpilih (klik kategori)' : 'Klik untuk memilih'}</span>
                        <span className="font-mono">drag & drop</span>
                      </div>
                    </div>
                  );
                })}
            </div>

            {matchingItems.filter((i) => !categoryAssignments[i.id]).length === 0 && !isSubmitted && (
              <div className="text-center py-4 text-emerald-400 text-sm font-medium bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                ✓ Semua item telah ditempatkan! Silakan periksa jawabanmu.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAMPILAN MODE B: PASANGAN 1-to-1 (Komponen & Fungsi)      */}
      {/* ========================================================= */}
      {!hasCategories && (
        <div className="space-y-6">
          <div className="text-xs text-slate-400 bg-slate-800/40 p-3 rounded-xl border border-white/5">
            💡 <strong>Cara Memasangkan:</strong> Klik item di kolom kiri, lalu klik pasangannya di kolom kanan.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kolom Kiri: Istilah / Komponen */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-sky-400 flex items-center gap-1.5 pb-1">
                <span>Komponen / Istilah</span>
              </h4>

              {matchingItems.map((item) => {
                const isSelected = selectedLeftId === item.id;
                const assignedTargetId = pairAssignments[item.id];
                const matchedTarget = shuffledTargets.find((t) => t.targetId === assignedTargetId);

                let itemStyle = 'border-white/10 bg-slate-800/60 hover:border-sky-500/50 text-slate-200';
                if (isSelected) {
                  itemStyle = 'border-sky-400 bg-sky-500/20 text-white ring-2 ring-sky-400';
                } else if (assignedTargetId) {
                  itemStyle = 'border-indigo-500/60 bg-indigo-500/10 text-slate-100';
                }

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectLeft(item.id)}
                    className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${itemStyle}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm sm:text-base">
                        <LatexText text={item.text} />
                      </span>
                      {assignedTargetId && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                          <LinkIcon className="w-3 h-3" />
                          Terhubung
                        </span>
                      )}
                    </div>

                    {/* Jika ada pasangan yang terhubung */}
                    {matchedTarget && (
                      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-start justify-between text-xs text-slate-300">
                        <span className="italic flex items-center gap-1 text-indigo-300">
                          <ArrowRight className="w-3 h-3" />
                          <LatexText text={matchedTarget.matchText} />
                        </span>
                        {!isSubmitted && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemovePair(item.id);
                            }}
                            className="text-slate-400 hover:text-rose-400 p-1"
                            title="Putuskan pasangan"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Kolom Kanan: Deskripsi / Fungsi Pasangan */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 pb-1">
                <span>Fungsi / Deskripsi</span>
              </h4>

              {shuffledTargets.map((target) => {
                // Periksa apakah target ini sudah terpasang dengan leftId
                const linkedLeftId = Object.keys(pairAssignments).find(
                  (k) => pairAssignments[k] === target.targetId
                );

                let targetStyle =
                  'border-white/10 bg-slate-800/60 hover:border-emerald-500/50 text-slate-200';
                if (selectedLeftId) {
                  targetStyle =
                    'border-emerald-400/60 bg-emerald-500/10 hover:bg-emerald-500/20 cursor-pointer ring-1 ring-emerald-400/40 text-white';
                } else if (linkedLeftId) {
                  targetStyle = 'border-indigo-500/60 bg-indigo-500/10 text-slate-100';
                }

                return (
                  <div
                    key={target.targetId}
                    onClick={() => handleSelectRight(target.targetId)}
                    className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${targetStyle}`}
                  >
                    <div className="text-sm sm:text-base leading-relaxed">
                      <LatexText text={target.matchText} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ACTION & HASIL EVALUASI                                   */}
      {/* ========================================================= */}
      <div className="mt-8 pt-4 border-t border-white/10">
        {!isSubmitted ? (
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {allAssigned
                ? 'Semua pasangan telah terisi. Siap diperiksa!'
                : 'Lengkapi semua pasangan sebelum memeriksa.'}
            </span>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!allAssigned}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 hover:scale-105 shadow-lg shadow-teal-500/20"
              style={{
                background: allAssigned
                  ? 'linear-gradient(135deg, var(--ce-primary), var(--ce-secondary))'
                  : 'rgba(51, 65, 85, 0.5)',
              }}
            >
              <Sparkles className="w-4 h-4" />
              Periksa Jawaban
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {/* Skor Banner */}
            <div
              className={`p-5 rounded-2xl border flex items-center justify-between gap-4 ${
                evaluation.correctCount === evaluation.total
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {evaluation.correctCount === evaluation.total ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-400 flex-shrink-0" />
                ) : (
                  <HelpCircle className="w-7 h-7 text-amber-400 flex-shrink-0" />
                )}
                <div>
                  <h4 className="font-bold text-base sm:text-lg">
                    Skor: {evaluation.correctCount} / {evaluation.total} Benar
                  </h4>
                  <p className="text-xs sm:text-sm opacity-90">
                    {evaluation.correctCount === evaluation.total
                      ? 'Luar biasa! Kamu memahami konsep ini dengan sempurna.'
                      : 'Bagus! Pelajari penjelasan di bawah untuk memperbaiki pemahamanmu.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-white/10 transition-colors cursor-pointer flex-shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
                Coba Lagi
              </button>
            </div>

            {/* List Penjelasan Khusus untuk Mode B jika ada */}
            {!hasCategories && (
              <div className="space-y-2 mt-4">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Ulasan Jawaban & Penjelasan:
                </h5>
                <div className="space-y-2">
                  {evaluation.details.map((detail, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border text-xs sm:text-sm ${
                        detail.isCorrect
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
                          : 'border-rose-500/30 bg-rose-500/10 text-rose-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-semibold mb-1">
                        {detail.isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400" />
                        )}
                        <span>
                          <LatexText text={detail.item.text} />
                        </span>
                      </div>
                      <div className="text-slate-300 text-xs pl-6">
                        <strong className="text-slate-400">Penjelasan:</strong>{' '}
                        <LatexText text={detail.item.explanation} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchingExercise;
