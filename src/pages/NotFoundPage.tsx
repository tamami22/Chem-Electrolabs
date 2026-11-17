import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="py-20 text-center space-y-5 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-slate-200 text-slate-600 flex items-center justify-center mx-auto">
        <HelpCircle className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900">404 - Halaman Tidak Ditemukan</h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Alamat rute URL yang Anda tuju tidak terdaftar di Chem-ElectroLabs atau telah dipindahkan.
        </p>
      </div>
      <div className="flex items-center justify-center gap-3 pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-500 transition-colors min-h-[44px]"
        >
          <Home className="w-4 h-4" />
          <span>Ke Beranda</span>
        </Link>
        <Link
          to="/peta"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ke Peta Belajar</span>
        </Link>
      </div>
    </div>
  );
}

