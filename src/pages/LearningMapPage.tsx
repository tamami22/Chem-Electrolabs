import { Link } from 'react-router-dom';
import { modules } from '../content/index.ts';
import { Map, ArrowRight, CheckCircle2, Circle } from 'lucide-react';

export default function LearningMapPage() {
  return (
    <div className="space-y-8 py-4">
      {/* Header Halaman */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800">
          <Map className="w-3.5 h-3.5" />
          <span>Alur Tujuan Pembelajaran (ATP) Kimia SMA</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Peta Belajar Elektrokimia Interaktif
        </h1>
        <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
          Ikuti alur konsep pembelajaran secara bertahap mulai dari pemahaman reaksi redoks dasar, sel elektrokimia (Volta & Elektrolisis), aspek kuantitatif Hukum Faraday, hingga aplikasi nyata proteksi korosi.
        </p>
      </div>

      {/* Alur Garis Waktu Modul (Interactive Roadmap) */}
      <div className="relative border-l-2 border-sky-200 ml-4 sm:ml-6 space-y-8 py-2">
        {modules.map((mod, index) => (
          <div key={mod.id} className="relative pl-6 sm:pl-8 group">
            {/* Titik Penanda Langkah */}
            <div className="absolute -left-[17px] top-1.5 w-8 h-8 rounded-full bg-white border-2 border-sky-500 text-sky-600 font-bold text-xs flex items-center justify-center shadow-xs group-hover:bg-sky-500 group-hover:text-white transition-colors">
              {index + 1}
            </div>

            {/* Kartu Modul Roadmap */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-sm transition-all space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700">
                  Modul {mod.moduleNumber} &bull; {mod.tpCodes.join(', ')}
                </span>
                <span className="text-xs font-medium text-slate-500">Estimasi {mod.estimatedMinutes} Menit</span>
              </div>

              <h2 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                {mod.title}
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed">
                {mod.subtitle}
              </p>

              {/* Tujuan Pembelajaran Khusus */}
              <div className="pt-2">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Tujuan Pembelajaran (Learning Objectives):
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {mod.learningObjectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Circle className="w-3 h-3 text-sky-500 shrink-0 mt-0.5 fill-sky-500" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tombol Akses Modul */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <CheckCircle2 className="w-4 h-4 text-slate-300" />
                  <span>{mod.steps.length} Langkah Representasi</span>
                </div>
                <Link
                  to={`/modul/${mod.slug}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-xs transition-colors min-h-[44px]"
                >
                  <span>Buka Modul</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

