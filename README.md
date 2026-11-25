# Belajar Ngaji

Aplikasi belajar Al-Qur'an interaktif untuk anak-anak, bertema **Dreamy Sky**:
langit biru lembut, awan putih, dan pink pastel yang fluffy dan membulat.
Maskot barunya adalah **Awan**, anak anjing awan putih orisinal berambut
panjang dengan pita biru langit dan pipi pink (SVG inline di
`src/components/CloudPuppy.tsx` — karya orisinal, bukan karakter pihak ketiga).
Antarmuka tersedia dalam Bahasa Indonesia, Inggris, dan Jepang.

## Fitur

| Halaman | Deskripsi |
|---|---|
| `/` | Halaman utama dengan kartu kegiatan belajar |
| `/surah` | Daftar 114 surah lengkap (nama, arti, jumlah ayat) |
| `/surah/[id]` | Baca surah: tulisan Arab + terjemahan Indonesia + audio murottal |
| `/kuis` | Kuis pilihan ganda "Apa arti surah X?" — confetti bila benar, animasi bom bila salah |
| `/cocokkan` | Cocokkan nama surah dengan artinya |
| `/tebak-ayat` | Tebak jumlah ayat dari sebuah surah |
| `/sambung` | Sambung ayat — pilih ayat lanjutan dari surah juz 30 (latih hafalan) |
| `/ular-tangga` | Ular tangga Qur'an — lempar dadu, jawab soal acak, naik tangga atau turun ular |
| `/dekorasi` | **Dekorasi Kamar Ngaji** — kamar perspektif dengan perabot SVG gambar tangan: jawab soal dulu untuk +1 token, ketuk untuk menaruh barang lalu SERET untuk memindah (seret ke awan sampah untuk membuang); ganti warna dinding juga memakai token |
| `/salon` | **Salon Hijab Cantik** — salon alat-dandan: pilih alat & warna lalu KETUK bagian tubuhnya (pipi/bibir/kelopak/hijab/baju); tiap pemakaian 1 token dari menjawab soal; ada Acak Cantik dan Foto Cantikku |
| `/bangun-masjid` | **Bangun Masjid Blok** — bangun ISOMETRIK 3D di papan 8×6: kubus SVG 3 sisi yang bisa DITUMPUK, kubah, menara, pintu, jendela, bulan sabit; jawab soal untuk +5 blok, kubus 1 blok / istimewa 2–3 blok; tantangan kubah + 2 menara + pintu |

## Tech Stack

- **Next.js 16** (App Router, RSC, Route Handlers)
- **React 19**
- **Tailwind CSS 4**
- **canvas-confetti** untuk efek rayakan jawaban benar
- **TypeScript** strict mode

## Sumber Data

Teks Al-Qur'an dan terjemahan diambil dari [fawazahmed0/quran-api](https://github.com/fawazahmed0/quran-api):
- Arab: `ara-quranindopak` (script Indopak, mudah dibaca)
- Indonesia: `ind-indonesianislam` (Kemenag RI)

Permintaan API di-cache di edge selama 30 hari karena data Al-Qur'an tidak pernah berubah.

Audio murottal diambil dari [mp3quran.net](https://mp3quran.net) (Mishary Rashid Alafasy).

Data juz 30 untuk game **Sambung Ayat** di-pre-fetch saat build via
`npm run gen:juz30` dan disimpan sebagai static module di
`src/data/juz30.ts` agar permainan berjalan instan tanpa hit API.

## Menjalankan Secara Lokal

```bash
npm install
npm run dev
```

Buka http://localhost:3000

## Deploy ke Vercel

1. Push repository ke GitHub.
2. Import project di [vercel.com](https://vercel.com/new) — Vercel akan otomatis mendeteksi Next.js.
3. Klik *Deploy*. Tidak ada environment variable yang dibutuhkan.

Build menggunakan `generateStaticParams` untuk pre-render semua 114 halaman surah sehingga sangat cepat di edge.

## Lisensi

MIT — silakan dipakai dan dikembangkan untuk kebaikan.
Karakter maskot adalah karya orisinal: **Awan** si anak anjing awan
(`src/components/CloudPuppy.tsx`, tema *Dreamy Sky* — tema default) serta
pixel art orisinal 6 karakter (Nadia, Sinta, Maya, Rian, Dimas, Bayu) di
`src/components/PixelMascot.tsx` sebagai tema alternatif — bebas lisensi,
tanpa file gambar eksternal dan bukan karakter pihak ketiga. Seluruh
antarmuka kini memakai gaya lembut, membulat, dan fluffy.

> **Catatan menu game:** menu Games kini hanya menampilkan 3 game kreatif
> baru (`/dekorasi`, `/salon`, `/bangun-masjid`). Game lama (kuis, cocokkan,
> tebak ayat, sambung, ular tangga, berkebun, tukang burger, kotak rahasia,
> tic tac toe) **masih bisa dibuka lewat URL langsung** — file rutenya sengaja
> tidak dihapus agar tautan & riwayat lama tidak rusak.

## Tema v2 — Dreamy Sky (satu tema rumah)

v2 memakai SATU tema rumah "Dreamy Sky" untuk semua perangkat (pemilih tema
lama dihapus; kunci penyimpanan tema diganti ke `belajarngaji:theme:v2`
agar tema lama di browser anak tidak menimpa tampilan baru). Semua komponen
memakai bahasa desain yang sama: biru langit + putih + pink bayi, tombol
pil `.btn-candy`, kartu awan `.card-cloud`, maskot anjing awan orisinal
"Awan". Semua game v2 memakai pola **jawab-dulu**: soal lembut (arti surah,
jumlah ayat, hijaiyah) memberi token/blok, baru anak beraksi. Tanpa emoji
sebagai aset game — semua visual SVG gambar tangan. Tata letak mobile-first
(kontrol ≥48px, baki alat bisa digeser horizontal, kanvas SVG skala %).
