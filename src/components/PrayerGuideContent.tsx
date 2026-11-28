"use client";

import Link from "next/link";
import { CloudPuppy } from "@/components/CloudPuppy";

interface Bacaan {
  arabic: string;
  latin: string;
  meaning: string;
}

interface Step {
  title: string;
  text?: string;
  /** Step 3 of the prayer flow links out to the Surah page for Al-Fatihah. */
  fatihahLink?: boolean;
  readings?: Bacaan[];
}

const WAKTU = [
  { name: "Subuh", rakaat: 2, icon: "🌅" },
  { name: "Dzuhur", rakaat: 4, icon: "☀️" },
  { name: "Ashar", rakaat: 4, icon: "🌤️" },
  { name: "Maghrib", rakaat: 3, icon: "🌇" },
  { name: "Isya", rakaat: 4, icon: "🌙" },
];

const WUDU_STEPS: Step[] = [
  { title: "Niat dan baca basmalah", text: "Niat wudu di dalam hati, lalu ucapkan \"Bismillah\"." },
  { title: "Cuci kedua tangan", text: "Basuh kedua tangan sampai pergelangan, 3 kali." },
  { title: "Berkumur", text: "Kumur-kumur membersihkan mulut, 3 kali." },
  { title: "Masukkan air ke hidung", text: "Hirup air ke hidung lalu keluarkan, 3 kali." },
  { title: "Cuci wajah", text: "Basuh seluruh wajah sampai rata, 3 kali." },
  { title: "Cuci tangan sampai siku", text: "Mulai dari tangan kanan lalu kiri, 3 kali." },
  { title: "Usap kepala", text: "Usap sebagian kepala dengan tangan yang basah, 1 kali." },
  { title: "Usap telinga", text: "Usap telinga bagian dalam dan luar, 1 kali." },
  { title: "Cuci kaki sampai mata kaki", text: "Mulai dari kaki kanan lalu kiri, 3 kali." },
  {
    title: "Doa setelah wudu",
    text: "Selesai! Baca doa ini ya:",
    readings: [
      {
        arabic: "أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُوْلُهُ",
        latin: "Asyhadu allaa ilaaha illallaah, wa asyhadu anna Muhammadan 'abduhuu wa rasuuluh.",
        meaning: "Aku bersaksi tidak ada Tuhan selain Allah, dan aku bersaksi Nabi Muhammad adalah hamba dan utusan Allah.",
      },
    ],
  },
];

const SHOLAT_STEPS: Step[] = [
  { title: "Berdiri tegak menghadap kiblat", text: "Berdiri dengan tenang menghadap Ka'bah, lalu niat sholat di dalam hati." },
  {
    title: "Takbiratul ihram",
    text: "Angkat kedua tangan sejajar telinga sambil mengucapkan:",
    readings: [{ arabic: "اللهُ أَكْبَرُ", latin: "Allaahu akbar.", meaning: "Allah Maha Besar." }],
  },
  {
    title: "Baca Al-Fatihah dan surah pendek",
    fatihahLink: true,
  },
  {
    title: "Rukuk",
    text: "Membungkuk dengan punggung rata, tangan memegang lutut, lalu baca 3 kali:",
    readings: [
      {
        arabic: "سُبْحَانَ رَبِّيَ الْعَظِيْمِ",
        latin: "Subhaana rabbiyal 'azhiim.",
        meaning: "Maha Suci Tuhanku Yang Maha Agung.",
      },
    ],
  },
  {
    title: "I'tidal — berdiri lagi",
    text: "Bangkit dari rukuk sambil mengucapkan bacaan pertama, lalu saat sudah berdiri tegak ucapkan bacaan kedua:",
    readings: [
      {
        arabic: "سَمِعَ اللهُ لِمَنْ حَمِدَهُ",
        latin: "Sami'allaahu liman hamidah.",
        meaning: "Allah mendengar orang yang memuji-Nya.",
      },
      {
        arabic: "رَبَّنَا لَكَ الْحَمْدُ",
        latin: "Rabbanaa lakal hamd.",
        meaning: "Ya Tuhan kami, hanya untuk-Mu segala puji.",
      },
    ],
  },
  {
    title: "Sujud",
    text: "Turun bersujud — dahi, hidung, kedua tangan, lutut, dan ujung kaki menyentuh lantai — lalu baca 3 kali:",
    readings: [
      {
        arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
        latin: "Subhaana rabbiyal a'laa.",
        meaning: "Maha Suci Tuhanku Yang Maha Tinggi.",
      },
    ],
  },
  {
    title: "Duduk di antara dua sujud",
    text: "Duduk dengan tenang, lalu baca doa ini:",
    readings: [
      {
        arabic: "رَبِّ اغْفِرْ لِيْ وَارْحَمْنِيْ وَاجْبُرْنِيْ وَارْفَعْنِيْ وَارْزُقْنِيْ وَاهْدِنِيْ وَعَافِنِيْ وَاعْفُ عَنِّيْ",
        latin: "Rabbighfirlii warhamnii wajburnii warfa'nii warzuqnii wahdinii wa 'aafinii wa'fu 'annii.",
        meaning:
          "Ya Allah, ampunilah aku, sayangilah aku, cukupkanlah aku, angkatlah derajatku, berilah aku rezeki, berilah aku petunjuk, sehatkanlah aku, dan maafkanlah aku.",
      },
    ],
  },
  { title: "Sujud kedua", text: "Sujud lagi seperti sujud pertama, dengan bacaan yang sama. Satu rakaat selesai!" },
  { title: "Rakaat kedua", text: "Berdiri lagi dan ulangi seperti rakaat pertama. Setelah sujud kedua, duduk untuk tasyahud." },
  {
    title: "Tasyahud",
    text: "Duduk tasyahud sambil membaca bacaan ini, lalu dilanjutkan dengan shalawat kepada Nabi:",
    readings: [
      {
        arabic:
          "التَّحِيَّاتُ الْمُبَارَكَاتُ الصَّلَوَاتُ الطَّيِّبَاتُ لِلَّهِ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللهِ الصَّالِحِيْنَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُوْلُ اللهِ",
        latin:
          "Attahiyyaatul mubaarakaatush shalawaatuth thayyibaatu lillaah. Assalaamu 'alaika ayyuhan nabiyyu wa rahmatullaahi wa barakaatuh. Assalaamu 'alainaa wa 'alaa 'ibaadillaahish shaalihiin. Asyhadu allaa ilaaha illallaah, wa asyhadu anna Muhammadar rasuulullaah.",
        meaning:
          "Segala penghormatan yang penuh berkah, shalawat, dan kebaikan adalah milik Allah. Salam sejahtera untukmu wahai Nabi, beserta rahmat dan berkah Allah. Salam sejahtera untuk kami dan hamba-hamba Allah yang saleh. Aku bersaksi tidak ada Tuhan selain Allah, dan aku bersaksi Nabi Muhammad adalah utusan Allah.",
      },
      {
        arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ",
        latin: "Allaahumma shalli 'alaa Muhammad, wa 'alaa aali Muhammad.",
        meaning: "Ya Allah, berikanlah shalawat kepada Nabi Muhammad dan keluarga Nabi Muhammad.",
      },
    ],
  },
  {
    title: "Salam",
    text: "Menoleh ke kanan lalu ke kiri sambil mengucapkan:",
    readings: [
      {
        arabic: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللهِ",
        latin: "Assalaamu 'alaikum wa rahmatullaah.",
        meaning: "Semoga keselamatan dan rahmat Allah untuk kalian.",
      },
    ],
  },
];

function BacaanBlock({ bacaan }: { bacaan: Bacaan }) {
  return (
    <div className="mt-3 rounded-2xl bg-sky-50 p-4 ring-2 ring-sky-100">
      <p className="arabic text-right text-2xl leading-loose text-sky-800" dir="rtl" lang="ar">
        {bacaan.arabic}
      </p>
      <p className="mt-2 text-base font-bold text-sky-700 italic">{bacaan.latin}</p>
      <p className="mt-1 text-sm font-semibold text-sky-900/70">Artinya: {bacaan.meaning}</p>
    </div>
  );
}

function StepCard({ index, step }: { index: number; step: Step }) {
  return (
    <li className="flex gap-4 rounded-[1.75rem] bg-white/90 p-4 shadow-md ring-4 ring-white/60 sm:p-5">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-blue-500 text-lg font-extrabold text-white shadow-md ring-4 ring-white">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-extrabold text-sky-800 sm:text-xl">{step.title}</h3>
        {step.text && <p className="mt-1 text-base font-medium leading-relaxed text-sky-900/85">{step.text}</p>}
        {step.fatihahLink && (
          <p className="mt-1 text-base font-medium leading-relaxed text-sky-900/85">
            Membaca surah Al-Fatihah (sudah ada di{" "}
            <Link href="/surah" className="font-bold text-sky-600 underline">
              halaman Surah
            </Link>{" "}
            ya!), lalu lanjutkan dengan surah pendek pilihanmu.
          </p>
        )}
        {step.readings?.map((b) => <BacaanBlock key={b.latin} bacaan={b} />)}
      </div>
    </li>
  );
}

function SectionTitle({ icon, children }: { icon: string; children: string }) {
  return (
    <h2 className="flex items-center gap-3 text-2xl font-extrabold text-sky-700 sm:text-3xl">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-2xl shadow-md ring-4 ring-sky-100" aria-hidden="true">
        {icon}
      </span>
      {children}
    </h2>
  );
}

export function PrayerGuideContent() {
  return (
    <div className="flex flex-col gap-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-200 via-white to-amber-50 p-6 shadow-lg ring-4 ring-white/70 sm:p-8">
        <div className="dotted absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative flex flex-col items-center gap-4 sm:flex-row">
          <div className="floaty">
            <CloudPuppy size={130} />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-base font-bold text-sky-500">Belajar ibadah pelan-pelan ya ✨</p>
            <h1 className="mt-1 text-3xl font-extrabold text-sky-700 sm:text-4xl">🕌 Tuntunan Sholat</h1>
            <p className="mt-2 text-lg font-semibold text-sky-900/80">
              Panduan sholat yang mudah untuk anak: lima waktu sholat, cara wudu, dan gerakan sholat beserta bacaannya.
            </p>
          </div>
        </div>
      </section>

      <section className="card-cloud flex items-center gap-4 p-5">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-sky-100 text-3xl shadow-inner" aria-hidden="true">
          🐾
        </span>
        <p className="text-base font-semibold leading-relaxed text-sky-900/85 sm:text-lg">
          Ikuti urutan nomornya dari atas ke bawah ya. Tidak perlu terburu-buru — yang penting tertib dan khusyuk.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <SectionTitle icon="🕐">Lima Waktu Sholat</SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {WAKTU.map((w) => (
            <div key={w.name} className="card-cloud flex flex-col items-center gap-1 p-4 text-center">
              <span className="text-4xl" aria-hidden="true">
                {w.icon}
              </span>
              <span className="text-xl font-extrabold text-sky-800">{w.name}</span>
              <span className="rounded-full bg-sky-100 px-3 py-0.5 text-sm font-bold text-sky-700">{w.rakaat} rakaat</span>
            </div>
          ))}
        </div>
        <p className="rounded-3xl bg-amber-100/70 px-5 py-3 text-center text-base font-bold text-amber-800 ring-2 ring-amber-200">
          🎁 Sholat lima waktu adalah hadiah istimewa dari peristiwa Isra Mi'raj Nabi Muhammad ﷺ.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <SectionTitle icon="💧">Wudu Dulu Yuk</SectionTitle>
        <ol className="flex flex-col gap-3">
          {WUDU_STEPS.map((s, i) => (
            <StepCard key={s.title} index={i} step={s} />
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-4">
        <SectionTitle icon="🕌">Gerakan dan Bacaan Sholat</SectionTitle>
        <ol className="flex flex-col gap-3">
          {SHOLAT_STEPS.map((s, i) => (
            <StepCard key={s.title} index={i} step={s} />
          ))}
        </ol>
        <div className="flex gap-4 rounded-[1.75rem] bg-gradient-to-br from-pink-100 to-rose-100 p-5 shadow-md ring-4 ring-white/60">
          <span className="text-4xl" aria-hidden="true">
            🤲
          </span>
          <div>
            <h3 className="text-lg font-extrabold text-rose-700 sm:text-xl">Setelah sholat</h3>
            <p className="mt-1 text-base font-medium leading-relaxed text-sky-900/85">
              Ucapkan istighfar 3 kali, lalu berdoalah. Berdoa dengan bahasa sendiri juga boleh — Allah pasti mendengar.
            </p>
          </div>
        </div>
      </section>

      <p className="rounded-3xl bg-white/70 px-5 py-4 text-center text-sm font-semibold text-sky-900/60 ring-2 ring-sky-100">
        Sumber bacaan untuk Ayah/Bunda:{" "}
        <a
          href="https://dn790000.ca.archive.org/0/items/ebook_aswaja/Tuntunan-Shalat-Lengkap.pdf"
          target="_blank"
          rel="noreferrer"
          className="font-bold text-sky-600 underline"
        >
          Tuntunan Shalat Lengkap (PDF)
        </a>
      </p>
    </div>
  );
}
