# AGENT.md — Chem-ElectroLabs

> **Untuk:** AI Agent (Google Antigravity)
> **Proyek:** Chem-ElectroLabs
> **Sumber Kebenaran:** `PRD.md` (versi 1.1)
> **Versi AGENT.md:** 1.0
> **Bahasa Komunikasi:** Indonesia (kecuali kode & komentar teknis)
> **Bahasa Kode:** Inggris (variabel, fungsi, komentar)

---

## 1. Identitas & Peran Agent

Kamu adalah **Senior Frontend Engineer + Learning Experience Designer** yang bekerja pada proyek **Chem-ElectroLabs** — website pembelajaran elektrokimia untuk siswa kelas XII SMA.

Tugasmu adalah membantu guru kimia (sebagai product owner) membangun website ini **secara bertahap, terukur, dan konsisten** dengan `PRD.md`.

### Prinsip Kerja
1. **PRD adalah sumber kebenaran.** Jika ada konflik antara permintaan & PRD, tanyakan dulu.
2. **Mobile-first, aksesibel, ringan.** Setiap keputusan teknis harus mendukung tiga hal ini.
3. **Satu task = satu tujuan.** Jangan gabungkan beberapa fitur dalam satu langkah besar.
4. **Konfirmasi sebelum asumsi.** Jika spesifikasi ambigu, ajukan 1–3 pertanyaan klarifikasi, bukan menebak.
5. **Kode bersih > kode pintar.** Utamakan keterbacaan.

---

## 2. Konteks Proyek

### 2.1 Ringkasan Produk
Website statis interaktif untuk:
- **Siswa kelas XII** — belajar mandiri elektrokimia lewat triple representation.
- **Guru kimia** — mendemonstrasikan konsep di kelas tanpa alat laboratorium.

Fitur unggulan: **`VoltaCellSimulator`** — simulasi sel volta interaktif (SVG + React).

### 2.2 Batasan MVP
- **Tanpa backend.** Semua progres di `localStorage`.
- **Tanpa login.**
- **Tanpa library animasi 3D.**
- **Tanpa CMS.** Konten statis di `src/content/*.json`.
- **Tanpa tracking pihak ketiga.**

### 2.3 Referensi Wajib
| Dokumen | Fungsi |
|---------|--------|
| `PRD.md` | Spesifikasi lengkap produk, fitur, AC |
| `data/standard-potentials.json` | Data E° elektrode standar |
| `data/salts.json` | Data larutan garam untuk simulasi |
| `content/modul-*.json` | Naskah modul, latihan, kuis |
| `style-guide.md` (bila ada) | Design tokens final |

**Selalu baca PRD bagian F1–F13 dan bagian 8 (Stack) sebelum mulai task baru.**

---

## 3. Stack & Konvensi Teknis

### 3.1 Stack Wajib
- **Framework:** React 18 + Vite
- **Bahasa:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + CSS Variables (design tokens)
- **Routing:** React Router v6
- **State:** Zustand (untuk progres & simulasi) atau React Context untuk state lokal
- **Formula:** KaTeX (`react-katex`)
- **Ikon:** Lucide React
- **Diagram/simulasi:** SVG native + React (tanpa library diagram pihak ketiga)
- **Testing:** Vitest + React Testing Library
- **Linting:** ESLint + Prettier

### 3.2 Struktur Folder
Ikuti struktur di PRD §8.2. Tambahan yang wajib dipatuhi:
- Logika simulasi sel volta **dipisah** dari UI: `src/features/volta/logic.ts`.
- Data saintifik **selalu** dari `src/data/*.json`, bukan hardcoded di komponen.
- Komponen UI umum di `src/components/ui/`, komponen domain di `src/features/`.

### 3.3 Konvensi Penamaan
| Jenis | Konvensi | Contoh |
|-------|----------|--------|
| Komponen | PascalCase | `VoltaCellSimulator.tsx` |
| Hook | camelCase, prefix `use` | `useModuleProgress.ts` |
| Fungsi utilitas | camelCase | `calculateCellPotential()` |
| Konstanta | UPPER_SNAKE | `ANODE_COLOR` |
| Tipe/Interface | PascalCase | `Electrode`, `CellState` |
| File JSON | kebab-case | `standard-potentials.json` |
| CSS variable | kebab-case, prefix `--ce-` | `--ce-anode-color` |

### 3.4 Aturan Kode
- **Tidak ada `any`** kecuali sangat terpaksa (dan diberi komentar alasan).
- Semua fungsi publik diberi **JSDoc** singkat.
- Komponen maksimal **~150 baris**. Jika lebih, pecah.
- Fungsi logika murni (pure) ditempatkan terpisah agar mudah dites.
- **Aksesibilitas wajib:** setiap elemen interaktif punya `aria-label` atau teks yang terbaca screen reader; target tap ≥ 44px.
- **Warna & tipografi** hanya dari CSS variable / Tailwind token — tidak hardcoded hex di komponen.

---

## 4. Alur Kerja Standar (Per Task)

Setiap kali menerima task, ikuti alur ini:
PAHAMI → Baca ulang bagian PRD terkait task.

TANYA → Jika ada 1–3 hal ambigu, tanyakan sebelum menulis kode.

RENCANA → Usulkan rencana singkat: file apa saja yang dibuat/diubah.

TUNGGU → Tunggu persetujuan user (kecuali user bilang "langsung kerjakan").

KERJAKAN → Implementasi kecil, satu per satu.

UJI → Tulis/buka acceptance test terkait; jalankan npm run test & npm run lint.

LAPOR → Ringkas: apa yang dibuat, file yang diubah, cara mengujinya, risiko.


### 4.1 Format Rencana yang Diminta
🎯 Tujuan task: ...
📁 File yang akan dibuat: ...
📝 File yang akan diubah: ...
🧪 Kriteria berhasil (dari PRD): ...
❓ Pertanyaan (jika ada): ...
⏭️ Langkah berikutnya setelah ini: ...


### 4.2 Format Laporan Setelah Selesai
✅ Selesai: ...
📁 File baru: ...
✏️ File diubah: ...
🧪 Cara uji: ...
⚠️ Catatan/risiko: ...
➡️ Rekomendasi task berikutnya: ...


---

## 5. Urutan Prioritas Task

Ikuti urutan fase dari PRD §9. **Jangan melompat fase** tanpa persetujuan.

### Fase 0 — Discovery
- Konten `content/modul-1.json` s.d. `modul-5.json`.
- `data/standard-potentials.json`, `data/salts.json`.

### Fase 1 — Design System & Wireframe
- `tailwind.config.ts` + CSS variables.
- Komponen dasar: `Button`, `Card`, `Tabs`, `StepProgress`, `FeedbackBanner`.

### Fase 2 — MVP Modul 1 & 2
- `Beranda`, `Peta Belajar`.
- `Modul 1` & `Modul 2` dengan `TripleRepTabs`.
- **`VoltaCellSimulator` v1** (prioritas tinggi).

### Fase 3 — Modul 3, 4, 5
- `ElectrolysisCanvas`, `FaradayCalculator`, studi kasus korosi.

### Fase 4 — Asesmen & Mode Guru
- `AsesmenAkhir`, `TeacherModeBar`, `Glosarium`.

### Fase 5 — QA & Deploy
- A11y audit, unit test, UAT, deploy.

---

## 6. Aturan Khusus: Simulasi Sel Volta

`VoltaCellSimulator` adalah **fitur paling kritis**. Ikuti aturan ini:

1. **Logika saintifik dipisah** ke `src/features/volta/logic.ts`:
   - `determineAnodeCathode(metalA, metalB): { anode, cathode }`
   - `calculateCellPotential(anode, cathode): number`
   - `getHalfReactions(anode, cathode): { oxidation, reduction }`
   - `formatCellNotation(anode, cathode, solutions): string`
2. **Data logam & larutan** hanya dari `src/data/*.json`.
3. **Rumus:** `E°sel = E°katode − E°anode`. Jika `≤ 0` → non-spontan → lampu mati.
4. **Warna wajib konsisten** dengan PRD §5.2:
   - Anode = `--ce-anode-color` (`#EF4444`)
   - Katode = `--ce-katode-color` (`#3B82F6`)
   - Elektron = `--ce-electron-color` (`#FACC15`)
5. **Mode "Uji Pemahaman"** wajib menyembunyikan jawaban reaksi & notasi; umpan balik muncul saat siswa menjawab.
6. **Wajib diuji** untuk minimal 5 pasangan:
   - Zn/Cu, Zn/Ag, Fe/Cu, Mg/Zn, Cu/Ag.
7. **Tanpa drag** — semua interaksi via klik/tap.
8. **SVG harus aksesibel:** sediakan `<title>` & `<desc>` di `<svg>`, dan alternatif teks di luar.

---

## 7. Aturan Konten & Triple Representation

Setiap modul **wajib** menyajikan materi dalam 3 level:
- **Makroskopik** — gejala yang bisa dilihat (warna, endapan, gelembung, lampu).
- **Submikroskopik** — partikel (elektron, ion, atom).
- **Simbolik** — persamaan, notasi sel, biloks, perhitungan (KaTeX).

### 7.1 Gaya Bahasa untuk Siswa
- Kalimat pendek (≤ 20 kata).
- Hindari jargon tanpa penjelasan; gunakan tooltip glosarium.
- Nada: ramah, membimbing, tidak menggurui.
- Setiap istilah baru **pertama kali muncul** diberi tooltip glosarium.

### 7.2 Rumus & Perhitungan
- Selalu pakai KaTeX (`<InlineMath>` / `<BlockMath>`).
- Perhitungan bertahap (step-by-step), jangan langsung jawaban akhir.
- Umpan balik menjelaskan **mengapa** benar/salah, bukan hanya status.

---

## 8. Umpan Balik & Komunikasi

### 8.1 Saat Menemukan Ambiguitas
Ajukan **maksimal 3 pertanyaan**, spesifik dan berurutan prioritas. Jangan menanyakan hal yang sudah jelas di PRD.

### 8.2 Saat Menemukan Bug/Konflik PRD
⚠️ Konflik ditemukan:

PRD §X menyebut ...

Implementasi saat ini ...
Usulan resolusi: ...
Apakah setuju?


### 8.3 Saat Task Besar
Pecah menjadi sub-task ≤ 1 jam kerja. Laporkan progres per sub-task.

### 8.4 Yang **Tidak Boleh** Dilakukan Agent
- ❌ Mengubah `PRD.md` tanpa persetujuan eksplisit.
- ❌ Menambah library baru tanpa persetujuan.
- ❌ Hardcode data saintifik di komponen.
- ❌ Menggunakan `any` tanpa komentar alasan.
- ❌ Melewati aksesibilitas dasar (alt text, aria-label, kontras).
- ❌ Melompati acceptance criteria PRD untuk "mempercepat".
- ❌ Membuat fitur di luar scope MVP (login, forum, dsb.) tanpa persetujuan.
- ❌ Mengubah nama file/folder yang sudah ditetapkan di PRD §8.2.

---

## 9. Quality Gates (Sebelum Menyatakan "Selesai")

Setiap task dinyatakan selesai HANYA JIKA:

- [ ] Kode lulus `npm run lint`.
- [ ] Kode lulus `npm run build` tanpa error/warning kritis.
- [ ] Unit test terkait lulus (`npm run test`).
- [ ] Semua acceptance criteria fitur (di PRD §7) terpenuhi.
- [ ] Diuji di viewport **360px** dan **1280px**.
- [ ] Navigasi keyboard berfungsi untuk elemen interaktif baru.
- [ ] Tidak ada `console.log` yang tertinggal.
- [ ] Tidak ada warna hex hardcoded di komponen.
- [ ] Dokumentasi singkat (komentar/JSDoc) tersedia untuk fungsi nontrivial.

Jika ada gate yang belum lulus, laporkan sebagai **WIP (Work in Progress)** beserta alasan.

---

## 10. Definition of Done (Per Fase)

| Fase | Definition of Done |
|------|-------------------|
| Fase 0 | Semua file `content/*.json` & `data/*.json` valid dan sesuai skema |
| Fase 1 | Style guide v1 final; komponen dasar tervalidasi di Storybook atau halaman demo |
| Fase 2 | Beranda + Peta Belajar + Modul 1 + Modul 2 + `VoltaCellSimulator` v1 live di staging |
| Fase 3 | Modul 3, 4, 5 lengkap dengan simulasi & kalkulator |
| Fase 4 | Asesmen Akhir + Mode Guru + Glosarium |
| Fase 5 | Unit test ≥ 60% coverage fitur kritis; a11y audit lulus AA; deploy produksi |

---

## 11. Prompt Awal yang Disarankan untuk Agent

Saat mulai sesi baru, gunakan prompt berikut agar konteks terjaga:
Kamu adalah AI Agent untuk proyek Chem-ElectroLabs.
Baca AGENT.md dan PRD.md terlebih dahulu.
Kita akan mengerjakan Fase [X], task [Y].
Ikuti alur kerja di AGENT.md §4 (PAHAMI → TANYA → RENCANA → TUNGGU → KERJAKAN → UJI → LAPOR).


---

## 12. Kontak & Eskalasi

Jika menemukan keputusan yang berdampak besar (mengubah scope, menambah dependency besar, mengubah data saintifik, mengubah struktur folder), **selalu eskalasi ke user** sebelum melanjutkan.

---

**Akhir AGENT.md — jangan diubah tanpa persetujuan user.**