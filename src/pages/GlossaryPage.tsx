import { useState } from 'react';
import { glossary } from '../content/index.ts';
import { standardPotentials, salts } from '../data/index.ts';
import MathFormula from '../components/ui/MathFormula.tsx';
import { BookMarked, Search, Layers, Table, FlaskConical } from 'lucide-react';

export default function GlossaryPage() {
  const [activeTab, setActiveTab] = useState<'glossary' | 'potentials' | 'salts'>('glossary');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGlossary = glossary.filter((term) =>
    term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    term.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPotentials = standardPotentials.filter((pot) =>
    pot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pot.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pot.halfReactionReduction.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSalts = salts.filter((salt) =>
    salt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    salt.formula.toLowerCase().includes(searchTerm.toLowerCase()) ||
    salt.cation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    salt.anion.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 py-4">
      {/* Header Halaman */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800">
          <BookMarked className="w-3.5 h-3.5" />
          <span>Sumber Acuan Baku & Definisi Konsep</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Glosarium &amp; Tabel Potensial Standar (E°)
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
          Kamus terminologi kimia elektrokimia resmi SMA dan data potensial reduksi standar terstandar vs SHE pada kondisi standar (25 °C, 1 M, 1 atm).
        </p>
      </div>

      {/* Kontrol Tab & Pencarian */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-200/70 p-1 rounded-xl text-xs font-bold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('glossary')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all min-h-[44px] shrink-0 ${
              activeTab === 'glossary'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Glosarium ({glossary.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('potentials')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all min-h-[44px] shrink-0 ${
              activeTab === 'potentials'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Tabel E° ({standardPotentials.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('salts')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all min-h-[44px] shrink-0 ${
              activeTab === 'salts'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>Larutan Garam ({salts.length})</span>
          </button>
        </div>

        {/* Input Pencarian */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari istilah, simbol, atau reaksi..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent min-h-[44px]"
          />
        </div>
      </div>

      {/* Konten Tab Glosarium */}
      {activeTab === 'glossary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGlossary.map((term) => (
            <div
              key={term.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 hover:border-sky-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">{term.term}</h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600">
                  {term.category}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {term.definition}
              </p>
              {term.tripleRepRole && (
                <div className="pt-2 text-[11px] text-sky-700 font-medium">
                  Peran Representasi: {term.tripleRepRole}
                </div>
              )}
            </div>
          ))}
          {filteredGlossary.length === 0 && (
            <div className="col-span-2 py-12 text-center text-xs text-slate-500">
              Tidak ada istilah glosarium yang cocok dengan kata kunci "{searchTerm}".
            </div>
          )}
        </div>
      )}

      {/* Konten Tab Tabel E° */}
      {activeTab === 'potentials' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[640px]">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                <tr>
                  <th className="py-3 px-4 w-36">Spesi</th>
                  <th className="py-3 px-4">Persamaan Setengah Reaksi Reduksi</th>
                  <th className="py-3 px-4 text-right w-28">E° (Volt vs SHE)</th>
                  <th className="py-3 px-4 min-w-[200px]">Wujud & Karakteristik Makroskopik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPotentials.map((pot) => (
                  <tr key={pot.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {pot.name} ({pot.symbol})
                    </td>
                    <td className="py-3 px-4 text-slate-900 overflow-x-auto">
                      <MathFormula formula={pot.halfReactionReduction} />
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                      <span
                        className={
                          pot.standardPotential > 0
                            ? 'text-sky-700'
                            : pot.standardPotential === 0
                            ? 'text-slate-700'
                            : 'text-red-600'
                        }
                      >
                        {pot.standardPotential >= 0 ? `+${pot.standardPotential.toFixed(2)}` : pot.standardPotential.toFixed(2)} V
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {pot.macroscopicVisual}
                    </td>
                  </tr>
                ))}
                {filteredPotentials.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      Tidak ada data potensial standar yang cocok dengan pencarian "{searchTerm}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Konten Tab Larutan Garam */}
      {activeTab === 'salts' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[640px]">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                <tr>
                  <th className="py-3 px-4 w-44">Garam / Elektrolit</th>
                  <th className="py-3 px-4 w-36">Kation</th>
                  <th className="py-3 px-4 w-36">Anion</th>
                  <th className="py-3 px-4 w-44">Visual Larutan</th>
                  <th className="py-3 px-4">Deskripsi &amp; Peran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSalts.map((salt) => (
                  <tr key={salt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{salt.name}</div>
                      <div className="text-slate-600 pt-0.5">
                        <MathFormula formula={salt.formattedFormula} />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">
                        <MathFormula formula={salt.cation.formula} />
                      </div>
                      <div className="text-[11px] text-slate-500">{salt.cation.name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">
                        <MathFormula formula={salt.anion.formula} />
                      </div>
                      <div className="text-[11px] text-slate-500">{salt.anion.name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border border-slate-300 shrink-0"
                          style={{ backgroundColor: salt.solutionColor }}
                        />
                        <span className="text-[11px] text-slate-600">{salt.colorDescription}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      <div className="flex gap-1 mb-1">
                        {salt.category.map((cat) => (
                          <span key={cat} className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {cat}
                          </span>
                        ))}
                      </div>
                      <div>{salt.description}</div>
                    </td>
                  </tr>
                ))}
                {filteredSalts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      Tidak ada data larutan garam yang cocok dengan pencarian "{searchTerm}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
