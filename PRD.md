# PRD — Chem-ElectroLabs

> **Versi:** 1.0 (MVP)
> **Status:** Draft
> **Pemilik Produk:** Guru Kimia SMA
> **Target Platform:** Website responsif (smartphone & laptop)
> **Bahasa Antarmuka:** Indonesia
> **Dibangun dengan:** Google Antigravity (AI-assisted IDE)

---

## 0. Asumsi & Keputusan yang Perlu Dikonfirmasi

Bagian ini bukan bagian dari PRD final, tetapi dipakai sebagai catatan negosiasi.

| No | Topik | Asumsi Default | Perlu Konfirmasi? |
|----|-------|----------------|-------------------|
| 1 | Backend / database | **Tanpa backend pada MVP.** Progres siswa disimpan di `localStorage`. | Ya, jika ingin multi-perangkat & login. |
| 2 | Autentikasi | Tidak ada login pada MVP. | Ya, jika ingin tracking siswa. |
| 3 | Framework | **React + Vite + TypeScript + Tailwind CSS.** | Boleh diganti Next.js jika butuh SSR/SEO. |
| 4 | Hosting | Vercel / Netlify / GitHub Pages. | — |
| 5 | Konten | Statis (Markdown/JSON di dalam repo), bukan CMS. | — |
| 6 | Animasi | Gunakan CSS transitions + SVG animasi ringan. Tanpa library 3D. | — |
| 7 | Matematika | Rumus memakai **KaTeX**. | — |

Jika asumsi di atas tidak sesuai, revisi PRD sebelum masuk Fase 1.

---

## 1. Identitas

| Field | Nilai |
|-------|-------|
| **Nama Produk** | Chem-ElectroLabs |
| **Nama Internal/Repo** | `chem-electrolabs` |
| **Tagline** | "Belajar Elektrokimia dalam Tiga Representasi" |
| **Kategori** | Media pembelajaran digital kimia SMA |
| **Mata Pelajaran** | Kimia |
| **Kelas** | XII SMA |
| **Materi Pokok** | Elektrokimia |
| **Bentuk** | Website statis interaktif |
| **Lisensi Konten** | (TBD — mis. CC BY-NC-SA untuk guru) |

---

## 2. Ringkasan Eksekutif & Tujuan Produk

### 2.1 Ringkasan
Chem-ElectroLabs adalah website pembelajaran elektrokimia untuk siswa kelas XII SMA yang menyajikan materi melalui **triple representation** — makroskopik, submikroskopik, dan simbolik — secara bertahap dan visual. Website dirancang agar dapat digunakan **mandiri oleh siswa** di smartphone maupun laptop, sekaligus sebagai **media peraga digital di kelas** oleh guru, tanpa memerlukan alat dan bahan kimia konvensional.

### 2.2 Masalah yang Diselesaikan
- Materi elektrokimia bersifat abstrak (transfer elektron, ion, notasi sel) sehingga sulit dipahami tanpa representasi visual.
- Praktikum konvensional membutuhkan alat, bahan, dan waktu yang tidak selalu tersedia.
- Media yang ada sering hanya satu representasi (teks atau gambar) dan tidak runtut langkah demi langkah.
- Guru membutuhkan media demonstrasi kelas yang praktis dan tidak membosankan.

### 2.3 Solusi
- Modul terstruktur yang konsisten menyajikan tiga level representasi secara paralel.
- Diagram interaktif, latihan melabeli, kalkulator perhitungan bertahap, dan kuis dengan umpan balik.
- Mode Guru untuk presentasi kelas.
- Tampilan responsif yang lancar di HP dan laptop.

### 2.4 Tujuan Produk
1. Menyediakan media pembelajaran elektrokimia yang **visual, runtut, dan multi-representasi**.
2. Meningkatkan pemahaman konseptual siswa terhadap redoks, sel volta, elektrolisis, Hukum Faraday, dan korosi.
3. Memberi guru alat demonstrasi digital yang siap pakai di kelas.
4. Dapat diakses lancar di perangkat low-to-mid range tanpa instalasi.

### 2.5 Metrik Keberhasilan (MVP)
- ≥ 80% siswa menyelesaikan minimal 3 dari 5 modul pada sesi uji coba.
- Rata-rata skor asesmen akhir ≥ 70.
- Waktu muat awal (LCP) < 2,5 detik pada 4G.
- Guru menilai media "layak digunakan di kelas" pada uji coba terbatas.

---

## 3. Tujuan Pembelajaran

Mengacu pada 7 TP yang telah disusun. Website wajib memetakan setiap fitur ke salah satu TP berikut:

| Kode | Tujuan Pembelajaran | Modul Terkait |
|------|---------------------|----------------|
| **TP1** | Menjelaskan reaksi redoks dalam elektrokimia dengan menghubungkan gejala makroskopik, gambaran submikroskopik (transfer elektron/ion), dan representasi simbolik (persamaan & biloks). | Modul 1 |
| **TP2** | Membedakan sel volta dan sel elektrolisis berdasarkan spontanitas, perubahan energi, peran anode–katode, arah elektron, dan jenis reaksi setengah sel. | Modul 2 & 3 |
| **TP3** | Menganalisis prinsip kerja sel volta: anode–katode, arah elektron/ion, reaksi setengah sel, notasi sel, dan E°sel. | Modul 2 |
| **TP4** | Menganalisis proses elektrolisis: produk anode–katode pada larutan/lelehan, reaksi setengah sel dan total, elektrode inert/aktif. | Modul 3 |
| **TP5** | Menerapkan Hukum Faraday untuk menghitung massa/volume hasil elektrolisis. | Modul 4 |
| **TP6** | Menganalisis korosi logam dan cara pencegahannya. | Modul 5 |
| **TP7** | Mengomunikasikan hasil analisis elektrokimia menggunakan minimal tiga representasi. | Asesmen Akhir |

---

## 4. Sasaran Pengguna & Kebutuhan

### 4.1 Persona 1 — Siswa Kelas XII
- **Usia:** 17–18 tahun
- **Perangkat:** mayoritas smartphone Android mid-range; sebagian laptop.
- **Kebutuhan:**
  - Materi yang bisa dipelajari mandiri, kapan saja.
  - Visual yang jelas dan langkah demi langkah.
  - Latihan dengan umpan balik langsung.
  - Navigasi sederhana, tidak banyak klik.
- **Pain points:** teks padat, istilah abstrak, tidak tahu urutan belajar.

### 4.2 Persona 2 — Guru Kimia SMA
- **Kebutuhan:**
  - Media demonstrasi kelas tanpa alat kimia.
  - Ringkasan triple representation per TP.
  - Lembar aktivitas & kunci jawaban.
  - Tampilan presentasi yang terbaca dari jauh.
- **Pain points:** waktu menyiapkan media, keterbatasan laboratorium.

### 4.3 Persona 3 (sekunder) — Siswa Remedial / Orang Tua
- **Kebutuhan:** modul ringkas & jelas untuk pengulangan materi.
- **Pain points:** bingung harus mulai dari mana.

### 4.4 Kebutuhan Non-Fungsional Pengguna
- Dapat digunakan **offline setelah kunjungan pertama** (opsional, lihat Fase 6).
- Ramah sentuhan (target tap ≥ 44px).
- Teks dapat diperbesar tanpa merusak layout.

---

## 5. Konsep Desain & Identitas Visual (UI/UX)

### 5.1 Prinsip Desain
1. **Mobile-first** — layout dirancang untuk layar 360px ke atas.
2. **Low cognitive load** — satu ide utama per layar.
3. **Triple representation selalu tampil paralel** — Makro | Submikro | Simbolik.
4. **Langkah demi langkah** — materi dipecah jadi step yang bisa dilalui bertahap.
5. **Aksesibel** — kontras WCAG AA, alt text, navigasi keyboard.

### 5.2 Palet Warna
| Peran | Warna | Hex | Penggunaan |
|-------|-------|-----|------------|
| Primary | Sky Blue | `#0EA5E9` | Aksi utama, header, tautan |
| Secondary | Emerald | `#10B981` | Umpan balik benar, reduksi |
| Accent/Warning | Amber | `#F59E0B` | Energi, peringatan |
| Anode (Oksidasi) | Red | `#EF4444` | Label anode, kehilangan elektron |
| Katode (Reduksi) | Blue | `#3B82F6` | Label katode, penangkapan elektron |
| Aliran Elektron | Gold | `#FACC15` | Arah panah elektron |
| Netral Gelap | Slate 900 | `#0F172A` | Teks utama |
| Netral Terang | Slate 50 | `#F8FAFC` | Latar |

> Konvensi warna anode/katode konsisten di seluruh diagram. Ini juga jadi **isyarat pembelajaran**.

### 5.3 Tipografi
- **Body:** Plus Jakarta Sans / Inter (Google Fonts, subset latin).
- **Heading:** Plus Jakarta Sans, weight 600–700.
- **Formula:** KaTeX default (serif math).
- **Ukuran:** base 16px mobile, 17px desktop; line-height 1.6.

### 5.4 Ikonografi
- Library: Lucide Icons (konsisten, ringan).
- Ikon tambahan untuk anode/katode/elektron dibuat sebagai SVG kustom.

### 5.5 Komponen UI Utama
- `ModuleCard`, `StepProgress`, `TripleRepTabs`, `DiagramVolta`, `ElectrolysisCanvas`, `FaradayCalculator`, `QuizCard`, `FeedbackBanner`, `TeacherModeBar`, `GlossaryPopover`.
- Semua komponen punya **state**: default, hover, aktif, selesai, error.

### 5.6 Aksesibilitas
- Kontras minimum AA (≥ 4.5:1 untuk teks biasa).
- `aria-label` pada diagram interaktif.
- Alternatif teks untuk setiap visual (deskripsi singkat).
- Navigasi keyboard penuh di latihan & kuis.

### 5.7 Prinsip UX Navigasi
- **≤ 3 klik** dari beranda ke materi mana pun.
- Tombol "Lanjut" dan "Kembali" selalu terlihat.
- Progress tersimpan otomatis (localStorage).

---

## 6. Struktur Arsitektur & Alur Navigasi

### 6.1 Peta Situs

```text
/                               → Beranda
/peta                           → Peta Belajar
/modul/1-redoks                 → Modul 1
/modul/2-sel-volta              → Modul 2
/modul/3-elektrolisis           → Modul 3
/modul/4-faraday                → Modul 4
/modul/5-korosi                 → Modul 5
/latihan                        → Latihan per TP
/asesmen                        → Asesmen Akhir
/guru                           → Mode Guru
/glosarium                      → Glosarium
/data/potensial-elektrode       → Tabel Potensial Standar
/tentang                        → Tentang & Referensi

6.2 Alur Navigasi Siswa
text
Beranda
  → Pilih Modul (atau Peta Belajar)
    → Tujuan Modul
      → Step 1..N (Triple Rep)
        → Simulasi (jika ada di modul)
        → Latihan
          → Cek Pemahaman
            → Lanjut Modul berikutnya
  → Asesmen Akhir → Hasil & Umpan Balik
6.3 Alur Navigasi Guru
text
Beranda → Mode Guru
  → Pilih Modul Presentasi
    → Tampilan Slide Besar (Diagram + Triple Rep + Simulasi)
    → Akses Panduan Demonstrasi & Lembar Aktivitas
6.4 Navigasi Global (Header)
Logo + Nama.

Menu: Beranda · Peta Belajar · Latihan · Glosarium.

Tombol cepat: Mode Guru.

Indikator progress modul.

6.5 Footer
Ringkasan TP, referensi, tautan sumber, versi.

7. Detail Spesifikasi Fitur Utama
Setiap fitur punya tujuan, deskripsi, komponen, dan acceptance criteria (AC).

F1. Beranda
Tujuan: orientasi & pintu masuk.

Isi: hero singkat, tagline, tombol "Mulai Belajar", kartu 5 modul, ringkasan triple representation, CTA Mode Guru.

AC:

LCP < 2.5s pada 4G.

Kartu modul menampilkan status progres.

Responsif tanpa horizontal scroll pada 360px.

F2. Peta Belajar
Tujuan: menunjukkan urutan & keterkaitan 5 modul + asesmen.

Isi: flowchart interaktif (SVG) dengan status progres.

AC:

Klik node membuka modul terkait.

Status node berubah sesuai progres di localStorage.

F3. Template Modul (berlaku untuk Modul 1–5)
Struktur seragam:

Header: judul modul & kode TP.
Tujuan & indikator.
Langkah-langkah materi (step 1..N).
Simulasi (jika relevan).
Latihan interaktif.
Cek Pemahaman (kuis).
AC:

Progress bar per step.

Tombol Lanjut/Kembali.

State selesai tersimpan.

F4. Komponen Triple Representation (TripleRepTabs)
Tujuan: menyajikan satu konsep dalam 3 level.

Deskripsi: tab horizontal "Makroskopik | Submikroskopik | Simbolik" dengan isi sinkron.

AC:

Perpindahan tab tanpa reload.

Setiap tab punya konten teks + visual.

Deskripsi alt text pada semua visual.

F5. Simulasi Sel Volta (VoltaCellSimulator) ⭐ FITUR UNGGULAN
Tujuan: mendukung TP2 & TP3 — menggantikan praktikum sel volta konvensional dan menjadi media peraga guru di kelas.

Deskripsi: Simulasi interaktif sel volta berbasis SVG + state React, tanpa alat kimia.

F5.1 Anatomi visual simulasi
Dua elektrode (kiri = anode, kanan = katode) dengan label logam (mis. Zn, Cu, Fe, Ag, Mg).

Dua larutan garam (mis. ZnSO₄, CuSO₄) di dalam gelas kimia.

Jembatan garam (salt bridge) dengan ion K⁺ dan Cl⁻ bergerak.

Kabel penghubung + voltmeter digital yang menampilkan nilai E°sel.

Lampu indikator (menyala jika E°sel > 0, redup/mati jika ≤ 0).

Panah aliran elektron (warna gold) di kabel.

Panel data di samping: anode, katode, reaksi setengah sel, notasi sel, E°sel.

F5.2 Interaksi pengguna
Interaksi	Perilaku
Pilih logam elektrode kiri (dropdown)	Data & reaksi sisi kiri berubah
Pilih logam elektrode kanan (dropdown)	Data & reaksi sisi kanan berubah
Pilih larutan garam (ZnSO₄, CuSO₄, FeSO₄, dst)	Menyesuaikan ion di gelas
Tombol "Jalankan Simulasi"	Panah elektron bergerak, voltmeter menampilkan E°sel, lampu menyala/mati
Tombol "Tampilkan Reaksi Setengah Sel"	Reveal anoda & katoda step by step
Tombol "Tampilkan Notasi Sel"	Reveal notasi, mis. Zn(s) | Zn²⁺(aq) || Cu²⁺(aq) | Cu(s)
Mode "Uji Pemahaman"	Semua jawaban (reaksi, notasi, E°sel) disembunyikan; siswa mengisi sendiri
Tombol "Reset"	Mengembalikan ke kondisi awal
F5.3 Logika saintifik
Data potensial reduksi standar disimpan di data/standard-potentials.json.

Elektrode dengan E° lebih negatif = anode (oksidasi).

Elektrode dengan E° lebih positif = katode (reduksi).

E°sel = E°katode − E°anode.

Jika E°sel ≤ 0 → reaksi non-spontan → lampu mati, tampil peringatan "Sel tidak menghasilkan arus".

Reaksi setengah sel di-generate dari data logam terpilih.

F5.4 Representasi triple dalam satu layar
Makro: voltmeter, lampu, panah elektron, gelembung/endapan pada elektrode.

Submikro: ion K⁺/Cl⁻ di jembatan garam, ion logam di larutan, elektron di kabel.

Simbolik: reaksi setengah sel, notasi sel, nilai E°sel (KaTeX).

F5.5 Acceptance Criteria
□ Memilih logam berbeda otomatis memperbarui anode/katode sesuai data E° standar.
□ Voltmeter menampilkan E°sel yang benar (selisih 0,01 V dari hitungan manual).
□ Lampu menyala saat E°sel > 0, mati saat ≤ 0.
□ Panah elektron mengarah dari anode → katode dan konsisten.
□ Reaksi setengah sel & notasi sel akurat untuk minimal 5 pasangan logam umum (Zn/Cu, Zn/Ag, Fe/Cu, Mg/Zn, Cu/Ag).
□ Mode "Uji Pemahaman" menyembunyikan jawaban & memberi umpan balik saat siswa menjawab.
□ Dapat dioperasikan penuh dengan tap/klik, tidak butuh drag.
□ State simulasi tidak hilang saat berpindah tab browser (localStorage terpisah).
□ Dioptimalkan untuk viewport 360px (tumpukan vertikal) dan 1280px (2 kolom).
F6. Simulasi Elektrolisis (ElectrolysisCanvas)
Tujuan: mendukung TP4.

Deskripsi: pilih larutan (NaCl, CuSO₄, H₂SO₄, dll) + elektrode (inert/aktif). Tampilkan produk di anode/katode.

AC:

Pemilihan larutan menampilkan produk yang benar.

Reaksi setengah sel dan total muncul bertahap.

Mode "Uji Pemahaman" menyembunyikan jawaban.

F7. Kalkulator Hukum Faraday (FaradayCalculator)
Tujuan: TP5.

Deskripsi: input arus (A), waktu (s), massa molar; tampilkan langkah: muatan → mol e⁻ → mol zat → massa/volume.

AC:

Perhitungan benar untuk minimal 3 studi kasus.

Setiap langkah dapat dibuka/tutup.

Validasi input dan pesan kesalahan jelas.

F8. Latihan Interaktif (Drag-and-Drop & Mencocokkan)
Tujuan: TP1–TP4.

Deskripsi: melabeli bagian diagram, mencocokkan tiga representasi, memilih produk elektrolisis.

AC:

Bisa dilakukan dengan tap (bukan hanya drag) — aksesibilitas mobile.

Umpan balik langsung per item.

Skor & progres tersimpan.

F9. Cek Pemahaman (Kuis)
Tujuan: formatif per modul.

Deskripsi: 5–8 soal pilihan ganda + 1 soal uraian singkat (self-check).

AC:

Umpan balik konsep, bukan hanya "benar/salah".

Bisa diulang.

Hasil tersimpan per modul.

F10. Mode Guru
Tujuan: demonstrasi kelas tanpa alat kimia.

Deskripsi: tampilan slide besar (font ≥ 28px), navigasi panah, akses cepat ke VoltaCellSimulator, ElectrolysisCanvas, FaradayCalculator.

Isi tambahan: Panduan Demonstrasi, Ringkasan Triple Rep per TP, Lembar Aktivitas (PDF/unduhan), Kunci Jawaban.

AC:

Dapat masuk tanpa login.

Fokus penuh (fullscreen) dengan tombol Esc.

Teks tetap terbaca pada proyektor 1280×720.

Simulasi sel volta tetap dapat dimainkan dalam mode presentasi.

F11. Glosarium & Tabel Data
Tujuan: rujukan cepat.

Isi: daftar istilah + tooltip; tabel potensial elektrode standar (dapat diurutkan & dicari).

AC:

Pencarian instan (client-side).

Tautan istilah dari dalam modul membuka glosarium.

F12. Asesmen Akhir
Tujuan: mengukur TP7 (sintesis triple representation).

Deskripsi: 15 soal campuran (pilihan ganda, mencocokkan, uraian singkat) + 1 tugas menyusun penjelasan 3 representasi.

AC:

Skor total + rincian per TP.

Umpan balik per TP.

Bisa dicetak/diunduh sebagai ringkasan.

F13. Penyimpanan Progres (localStorage)
Kunci: chem-electrolabs.v1.progress

Isi: status modul, skor kuis, terakhir diakses, konfigurasi terakhir simulasi sel volta.

AC:

Persist antar sesi di perangkat yang sama.

Tombol "Reset Progres" pada halaman Tentang.

8. Spesifikasi Teknis & Stack Implementasi
8.1 Stack (MVP)
Lapisan	Teknologi	Alasan
Framework UI	React 18 + Vite	Ringan, cepat, cocok untuk Antigravity
Bahasa	TypeScript	Tipe aman untuk kalkulator & data
Styling	Tailwind CSS + CSS Variables	Utility-first, mudah responsif
Routing	React Router v6	Standar de-facto
State	Zustand (ringan) atau React Context	Cukup untuk MVP & simulasi
Formula	KaTeX	Cepat, akurat, tanpa gambar
Ikon	Lucide React	Konsisten, ringan
Diagram & simulasi	SVG native + React	Kontrol penuh, aksesibel, ringan
Konten	JSON/MDX dalam src/content/	Mudah diubah guru
Persistensi	localStorage	Tanpa backend
Testing	Vitest + React Testing Library	Unit test komponen kritis
Linting	ESLint + Prettier	Konsistensi kode
Deploy	Vercel / Netlify / GitHub Pages	Statis, gratis, cepat
8.2 Struktur Folder (usulan)
text
chem-electrolabs/
├─ public/
├─ src/
│  ├─ assets/
│  ├─ components/
│  │  ├─ ui/
│  │  ├─ modules/
│  │  └─ diagrams/
│  ├─ content/
│  │  ├─ modul-1.json
│  │  ├─ modul-2.json
│  │  └─ ...
│  ├─ data/
│  │  ├─ standard-potentials.json
│  │  └─ salts.json
│  ├─ features/
│  │  ├─ volta/           ← VoltaCellSimulator + logika E°sel
│  │  ├─ electrolysis/
│  │  └─ faraday/
│  ├─ pages/
│  ├─ hooks/
│  ├─ lib/
│  ├─ styles/
│  ├─ App.tsx
│  └─ main.tsx
├─ tests/
├─ index.html
├─ tailwind.config.ts
├─ vite.config.ts
└─ package.json
8.3 Kebutuhan Non-Fungsional
Performa: LCP < 2.5s (4G), bundle awal < 200 KB gzip.

Responsif: breakpoint 360 / 768 / 1024 / 1440.

Aksesibilitas: WCAG 2.1 AA (kontras, fokus, keyboard, alt).

Kompatibilitas: Chrome/Edge/Firefox/Safari versi 2 tahun terakhir.

SEO dasar: meta title, description, OG image per halaman.

Privasi: tanpa tracking pihak ketiga; tanpa cookie wajib.

8.4 Prinsip untuk Antigravity
Semua keputusan desain & konten tertuang di PRD + content/*.json + data/*.json agar prompt ke AI konsisten.

Komponen dibuat kecil, satu tanggung jawab.

Logika simulasi sel volta dipisahkan dari komponen UI (features/volta/logic.ts).

Setiap fitur wajib punya acceptance test singkat.

9. Rencana Roadmap Pelaksanaan
Fase 0 — Discovery & Konten (Minggu 1)
Finalisasi PRD.

Penulisan naskah Modul 1–5 (teks, latihan, kuis).

Kumpulkan standard-potentials.json & data garam.

Deliverable: konten content/*.json v0 + data/*.json v1.

Fase 1 — Design System & Wireframe (Minggu 2)
Tokens (warna, tipografi, spacing).

Wireframe low-fi: Beranda, Modul, VoltaCellSimulator, Mode Guru.

Komponen dasar: Button, Card, Tabs, Progress.

Deliverable: Style guide v1 + wireframe.

Fase 2 — MVP Modul 1 & 2 + Simulasi Sel Volta (Minggu 3–4)
Implementasi Beranda, Peta Belajar.

Modul 1 & 2 lengkap + TripleRepTabs.

VoltaCellSimulator v1 (pilih logam, arah elektron, voltmeter, reaksi setengah sel, notasi sel, mode uji pemahaman).

Deliverable: MVP deployable ke staging.

Fase 3 — Modul 3, 4, 5 (Minggu 5–6)
ElectrolysisCanvas (Modul 3).

FaradayCalculator (Modul 4).

Studi kasus korosi (Modul 5).

Deliverable: kelima modul lengkap.

Fase 4 — Asesmen & Mode Guru (Minggu 7)
Asesmen Akhir + rubrik.

Mode Guru (tampilan presentasi + panduan + simulasi sel volta besar).

Glosarium & Tabel Data.

Deliverable: versi fitur lengkap MVP.

Fase 5 — QA, UAT, Deploy (Minggu 8)
Unit test & a11y audit (termasuk uji simulasi sel volta untuk 5 pasangan logam).

Uji coba terbatas 1 kelas + 1 guru.

Perbaikan bug kritis.

Deploy produksi + dokumentasi guru.

Deliverable: rilis v1.0.

Fase 6 — Pasca-MVP (Opsional, setelah v1.0)
Login siswa + backend (Supabase/Firebase) untuk tracking multi-perangkat.

PWA / offline penuh.

Bank soal adaptif.

Forum diskusi / kelas virtual.

Laporan guru (dashboard kelas).

Multi-materi.

9.1 Prioritas (MoSCoW)
Must: F1, F2, F3, F4, F5 (Simulasi Sel Volta), F6, F7, F9, F11, F13.

Should: F8, F10, F12.

Could: unduhan PDF, PWA.

Won't (MVP): login, forum, sertifikat.

10. Lampiran
A. Matriks TP–Konten–Aktivitas–Asesmen (lihat dokumen terpisah).

B. Rumusan 7 Tujuan Pembelajaran Elektrokimia.

C. Tabel Potensial Elektrode Standar (sumber & tahun).

D. Daftar Logam & Larutan untuk Simulasi Sel Volta:

Logam: Zn, Cu, Fe, Ag, Mg, Pb, Ni, Sn.

Larutan garam: ZnSO₄, CuSO₄, FeSO₄, AgNO₃, MgSO₄, Pb(NO₃)₂, NiSO₄, SnSO₄.

E. Panduan gaya penulisan konten (nada, panjang kalimat, istilah).