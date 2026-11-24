import { Link, useNavigate } from 'react-router-dom';
import { modules } from '../content/index.ts';
import { useStudentStore } from '../stores/useStudentStore.ts';
import {
  ArrowRight,
  Sparkles,
  Layers,
  Clock,
  Eye,
  Atom,
  Binary,
  UserCheck,
  ShieldCheck,
  Lock,
} from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const { studentName, isEntered } = useStudentStore();

  const handleStartLearning = () => {
    navigate('/peta');
  };

  return (
    <div className="space-y-12 sm:space-y-16 py-4">
      {/* =========================================================================
          1. HERO SECTION (Kontras Tinggi WCAG 2.1 AA >= 4.5:1)
         ========================================================================= */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-12 shadow-xl relative overflow-hidden border border-slate-800">
        {/* Dekorasi Latar Lembut */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-5 relative z-10">
          {/* Badge Pengenal Platform */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-sky-950/80 text-sky-200 border border-sky-400/40 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-sky-300" />
            <span>Laboratorium Elektrokimia Virtual SMA Kelas XII</span>
          </div>

          {/* Judul Hero dengan Kontras Sangat Terang (White & Sky-300 pada Slate-900) */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
            Kuasai Elektrokimia Lewat{' '}
            <span className="text-sky-300">Tiga Representasi Kimia</span>
          </h1>

          {/* Satu Kalimat Penjelasan Ringkas & Lugas */}
          <p className="text-slate-100 text-base sm:text-lg leading-relaxed font-normal max-w-2xl">
            Hubungkan gejala fisik kasat mata (makroskopik), perpindahan partikel elektron dan ion (submikroskopik), serta perumusan persamaan reaksi dan potensial sel standar (simbolik) secara paralel.
          </p>

          {/* Tombol Utama & Tautan Guru */}
          <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {isEntered && studentName ? (
              <>
                <button
                  type="button"
                  onClick={handleStartLearning}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-extrabold bg-sky-400 hover:bg-sky-300 text-slate-950 shadow-md shadow-sky-500/25 transition-all min-h-[44px] cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-slate-900" />
                  <span>Lanjutkan sebagai {studentName}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/masuk')}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-slate-100 border border-white/20 transition-all min-h-[44px] cursor-pointer"
                >
                  <span>Ganti Identitas Siswa</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleStartLearning}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-extrabold bg-sky-400 hover:bg-sky-300 text-slate-950 shadow-md shadow-sky-500/25 transition-all min-h-[44px] cursor-pointer"
              >
                <span>Mulai Belajar</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            )}

            {/* Tautan Kecil Masuk Guru */}
            <div className="sm:ml-3 flex items-center justify-center sm:justify-start">
              <Link
                to="/guru"
                className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white underline underline-offset-4 font-medium py-2 px-2 transition-colors min-h-[44px]"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Masuk Guru &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. TIGA KARTU REPRESENTASI KIMIA (Johnstone Triplet)
         ========================================================================= */}
      <section className="space-y-4">
        <div className="space-y-1">
          <span className="text-xs font-bold text-sky-700 uppercase tracking-wider block">
            Pendekatan Pembelajaran Johnstone
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Tiga Sudut Pandang Pembelajaran Elektrokimia
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            Sains elektrokimia dipahami secara utuh ketika fenomena laboratorium dihubungkan langsung dengan dinamika partikel mikroskopis dan formula simbolik.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Kartu 1: Makroskopik */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-amber-300 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Representasi Makroskopik</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Gejala kasat mata nyata yang dapat diamati: warna larutan tembaga yang memudar, gelembung gas hidrogen &amp; oksigen di elektrode, endapan logam, dan angka tegangan voltmeter.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 text-[11px] font-semibold text-amber-700">
              Pengamatan Fisik Laboratorium
            </div>
          </div>

          {/* Kartu 2: Submikroskopik */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-sky-300 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                <Atom className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Representasi Submikroskopik</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Visualisasi partikel tak kasat mata: aliran elektron melalui kawat logam penghantar, transfer elektron di permukaan elektrode, serta migrasi kation dan anion melalui jembatan garam.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 text-[11px] font-semibold text-sky-700">
              Model Partikel &amp; Elektron
            </div>
          </div>

          {/* Kartu 3: Simbolik */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Binary className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Representasi Simbolik</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Formula matematika dan notasi kimia: persamaan reaksi setengah sel reduksi-oksidasi, notasi diagram sel volta, kalkulasi nilai potensial sel standar (E° sel), dan hukum Faraday.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 text-[11px] font-semibold text-indigo-700">
              Persamaan &amp; Notasi Formal
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. KARTU LIMA MODUL PEMBELAJARAN (Membaca modul-N.json)
         ========================================================================= */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-sky-700 uppercase tracking-wider block">
              Kurikulum Elektrokimia SMA
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Lima Modul Pembelajaran Interaktif
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Materi terstruktur selaras Alur Capaian Tujuan Pembelajaran Kimia Fase F (Kelas XII).
            </p>
          </div>

          <button
            type="button"
            onClick={handleStartLearning}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 inline-flex items-center gap-1.5 py-2 self-start sm:self-auto cursor-pointer min-h-[44px]"
          >
            <span>Buka Peta Belajar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className="group p-6 rounded-3xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-sky-50 text-sky-700">
                    Modul {mod.moduleNumber}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{mod.tpCodes.join(', ')}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-sky-600 transition-colors">
                  {mod.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {mod.subtitle}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {mod.estimatedMinutes} Menit
                </span>

                <button
                  type="button"
                  onClick={() => navigate(`/modul/${mod.slug}`)}
                  aria-label={`Pelajari Modul ${mod.moduleNumber}: ${mod.title}`}
                  className="font-bold text-sky-600 hover:text-sky-700 inline-flex items-center gap-1 cursor-pointer py-1 min-h-[36px]"
                >
                  <span>Pelajari Modul</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          4. BAGIAN CARA BELAJAR TIGA LANGKAH
         ========================================================================= */}
      <section className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-100 to-sky-50/50 border border-slate-200 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold text-sky-700 uppercase tracking-wider block">
            Panduan Belajar Mandiri
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Cara Belajar Mandiri di Chem-ElectroLabs
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Ikuti 3 tahapan sistematis untuk menguasai setiap modul elektrokimia secara komprehensif.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Langkah 1 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
              01
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              Amati Fenomena Nyata &amp; Gejala Fisik
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mulai dari pengamatan laboratorium: perubahan warna larutan, gelembung gas, pelarutan elektrode, atau pembentukan karat logam.
            </p>
          </div>

          {/* Langkah 2 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
              02
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              Telusuri Perpindahan Partikel Submikroskopik
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Lihat bagaimana elektron mengalir dari anode ke katode serta bagaimana ion positif dan negatif bermigrasi menjaga kenetralan muatan larutan.
            </p>
          </div>

          {/* Langkah 3 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
              03
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              Rumuskan Persamaan &amp; Uji Kuis Mandiri
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tuliskan persamaan reaksi redoks, hitung potensial sel standar, dan kerjakan kuis interaktif dengan umpan balik langsung.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. FOOTER RINGKAS CATATAN PRIVASI SISWA
         ========================================================================= */}
      <section className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-600 leading-relaxed text-left">
            <span className="font-bold text-slate-900 block">Jaminan Privasi Siswa:</span>
            Hanya nama dan kelas Anda yang disimpan secara lokal di perangkat ini untuk mencatat kemajuan belajar. Tidak ada data yang dikirim ke server luar.
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/masuk')}
            className="text-xs font-bold text-sky-700 hover:text-sky-800 underline py-2 min-h-[44px] cursor-pointer"
          >
            Pengaturan Profil Siswa
          </button>
          <span className="text-slate-300">|</span>
          <Link
            to="/guru"
            className="text-xs font-bold text-slate-600 hover:text-slate-900 underline py-2 min-h-[44px]"
          >
            Masuk Guru &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
