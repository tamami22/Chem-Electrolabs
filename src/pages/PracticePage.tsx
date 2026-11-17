import { Link } from 'react-router-dom';
import { modules } from '../content/index.ts';
import { BookOpen, ArrowRight, Award } from 'lucide-react';

export default function PracticePage() {
  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Bank Latihan Mandiri Interaktif</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Latihan Soal & Interaktif
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
          Uji pemahaman konsep elektrokimia melalui latihan interaktif mencocokkan (matching), klasifikasi peran reaksi, dan kuis pilihan ganda terstruktur per modul.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {modules.map((mod) => (
          <div key={mod.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                Modul {mod.moduleNumber}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {mod.quiz.length} Soal Kuis &bull; {mod.exercises.length} Latihan Interaktif
              </span>
            </div>

            <h2 className="text-lg font-bold text-slate-900">{mod.title}</h2>
            <p className="text-xs text-slate-600 leading-relaxed">{mod.subtitle}</p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <Link
                to={`/modul/${mod.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 min-h-[44px]"
              >
                <span>Buka Latihan di Modul</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="text-base font-bold text-white">Siap Menguji Penguasaan Menyeluruh?</h2>
          <p className="text-xs text-emerald-100">Ikuti Asesmen Akhir Berbasis TP1–TP6 dengan umpan balik terperinci.</p>
        </div>
        <Link
          to="/asesmen"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-800 font-bold text-xs rounded-xl hover:bg-emerald-50 transition-colors shrink-0 shadow-sm min-h-[44px]"
        >
          <Award className="w-4 h-4" />
          <span>Ke Halaman Asesmen</span>
        </Link>
      </div>
    </div>
  );
}

