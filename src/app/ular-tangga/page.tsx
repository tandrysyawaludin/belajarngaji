import { ScopedSnakeLadderGame } from "@/components/ScopedSnakeLadderGame";
import { strings } from "@/lib/strings";

export const metadata = {
  title: `${strings.navSnakeLadder} — ${strings.siteTitle}`,
  description: "Game ular tangga Al-Qur'an dengan soal acak di setiap kotak.",
};

export default function SnakeLadderPage() {
  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-3xl bg-white/90 p-5 shadow-md ring-2 ring-emerald-100">
        <h1 className="text-2xl font-extrabold text-emerald-600 sm:text-3xl">
          {strings.navSnakeLadder}
        </h1>
        <p className="mt-1 text-base font-semibold text-emerald-900/70">
          Lempar dadu, jawab soal Al-Quran acak, lalu naik tangga atau turun ular.
          Kalau salah, kembali ke kotak sebelumnya.
        </p>
      </section>
      <ScopedSnakeLadderGame />
    </div>
  );
}
