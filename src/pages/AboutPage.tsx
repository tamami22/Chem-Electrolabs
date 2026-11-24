import { useState } from 'react';
import { Info, RotateCcw, Check, Database, Award, ShieldAlert } from 'lucide-react';
import { resetProgress } from '../lib/storage.ts';

export default function AboutPage() {
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetProgress = () => {
    if (window.confirm('Apakah Anda yakin ingin mereset seluruh progres belajar dan riwayat latihan? Tindakan ini tidak dapat dibatalkan.')) {
      resetProgress();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 4000);
    }
  };

  return (
    <div className="space-y-8 py-4 max-w-4xl mx-auto">
      {/* Header Halaman */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800">
          <Info className="w-3.5 h-3.5" />
          <span>Informasi Aplikasi & Rujukan</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Tentang Chem-ElectroLabs
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Chem-ElectroLabs adalah media laboratorium elektrokimia virtual berbasis web yang dikembangkan khusus untuk siswa dan guru Kimia SMA Kelas XII dengan pendekatan Tiga Representasi Kimia (Johnstone).
        </p>
      </div>

      {/* Landasan Pedagogis & Tiga Representasi */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-sky-800 font-bold text-base">
          <Award className="w-5 h-5 text-sky-600" />
          <span>Landasan Pedagogis: Tiga Tingkat Representasi Kimia (Johnstone)</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Banyak miskonsepsi elektrokimia terjadi karena siswa menghafal simbol rumus matematis tanpa memahami fenomena fisik dan pergerakan partikel submikroskopik di balik elektrode. Chem-ElectroLabs menyajikan ketiga level ini secara simultan:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-amber-50 border border-amber-200/60 rounded-xl space-y-1">
            <span className="font-bold text-amber-900">1. Makroskopik</span>
            <p className="text-amber-800/80">Voltmeter, nyala lampu, perubahan warna larutan, dan endapan logam.</p>
          </div>
          <div className="p-3 bg-sky-50 border border-sky-200/60 rounded-xl space-y-1">
            <span className="font-bold text-sky-900">2. Submikroskopik</span>
            <p className="text-sky-800/80">Partikel elektron mengalir di kawat luar dan ion menyeimbangkan larutan.</p>
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-200/60 rounded-xl space-y-1">
            <span className="font-bold text-indigo-900">3. Simbolik</span>
            <p className="text-indigo-800/80">Reaksi redoks, notasi sel volta standar, dan rumus E°sel = E°katoda - E°anoda.</p>
          </div>
        </div>
      </div>

      {/* Rujukan Saintifik Baku */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <Database className="w-5 h-5 text-slate-700" />
          <span>Sumber Acuan Nilai Potensial Standar (E°) &amp; Data Saintifik</span>
        </div>
        <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
          <li><strong>IUPAC (2007):</strong> <em>Compendium of Chemical Terminology (Gold Book)</em> — Definisi standar sel volta, elektrode pembanding SHE, dan aturan penulisan notasi sel.</li>
          <li><strong>CRC Handbook of Chemistry and Physics (97th Edition):</strong> Tabel nilai potensial elektrode standar (E°) dalam larutan air pada 298,15 K (25 °C), 1 atm, dan 1 M.</li>
          <li><strong>Petrucci, R. H., et al. (2017):</strong> <em>General Chemistry: Principles and Modern Applications (11th Ed.)</em> — Konsep kuantitatif Hukum Faraday dan mekanisme korosi elektrokimia.</li>
          <li><strong>Chang, R. &amp; Goldsby, K. A. (2016):</strong> <em>Chemistry (12th Edition)</em> — Pedoman aturan reduksi katoda dan oksidasi anoda pada sel elektrolisis larutan.</li>
        </ul>
      </div>

      {/* Manajemen Progres Belajar (LocalStorage) */}
      <div className="bg-red-50/70 border border-red-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-red-900 font-bold text-base">
          <ShieldAlert className="w-5 h-5 text-red-600" />
          <span>Manajemen Progres Belajar Lokal</span>
        </div>
        <p className="text-xs sm:text-sm text-red-950/80 leading-relaxed">
          Seluruh progres pengerjaan modul, skor kuis, dan latihan tersimpan secara otomatis di peramban Anda (kunci: <code className="bg-white px-1.5 py-0.5 rounded text-[11px] font-mono border border-red-200">chem-electrolabs.v1.progress</code>) tanpa memerlukan akun login. Jika ingin memulai pembelajaran dari awal, Anda dapat mereset data di bawah ini.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleResetProgress}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-xs min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Seluruh Progres Belajar</span>
          </button>
          {resetSuccess && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg">
              <Check className="w-4 h-4" />
              <span>Progres berhasil dibersihkan!</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
