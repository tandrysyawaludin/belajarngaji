# Belajar Ngaji

Aplikasi belajar Al-Qur'an interaktif untuk anak-anak, bertema *kawaii* pastel.
Antarmuka sepenuhnya dalam Bahasa Indonesia.

## Fitur

| Halaman | Deskripsi |
|---|---|
| `/` | Halaman utama dengan empat kartu kegiatan |
| `/surah` | Daftar 114 surah lengkap (nama, arti, jumlah ayat) |
| `/surah/[id]` | Baca surah: tulisan Arab + terjemahan Indonesia + audio murottal |
| `/kuis` | Kuis pilihan ganda "Apa arti surah X?" — confetti bila benar, animasi bom bila salah |
| `/cocokkan` | Cocokkan nama surah dengan artinya |
| `/tebak-ayat` | Tebak jumlah ayat dari sebuah surah |
| `/sambung` | Sambung ayat — pilih ayat lanjutan dari surah juz 30 (latih hafalan) |

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
Karakter maskot adalah karya asli, terinspirasi gaya *kawaii* pastel namun bukan
karakter Sanrio.
