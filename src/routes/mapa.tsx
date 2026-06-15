import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { WifiOff, Play, Square } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { POINTS } from "@/lib/points";
import { speak, stopSpeak } from "@/lib/speech";

export const Route = createFileRoute("/mapa")({
  head: () => ({
    meta: [
      { title: "Mapa del recorrido — AccessiTour" },
      {
        name: "description",
        content: "Mapa accesible de Pachacámac con 6 puntos de interés y descripción de audio.",
      },
    ],
  }),
  component: MapPage,
});

const INTRO =
  "Recorrido accesible de Pachacámac. Hay seis puntos. Toca cualquier marcador en el mapa para escuchar su descripción.";

function MapPage() {
  const navigate = useNavigate();
  const [playing, setPlaying] = useState(false);

  const toggleIntro = () => {
    if (playing) {
      stopSpeak();
      setPlaying(false);
    } else {
      speak(INTRO);
      setPlaying(true);
      // best-effort: clear when finished
      window.speechSynthesis?.addEventListener?.(
        "end" as never,
        () => setPlaying(false),
        { once: true } as never,
      );
      setTimeout(() => setPlaying(false), 9000);
    }
  };

  return (
    <AppShell>
      <section className="px-4 pb-32 pt-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-extrabold leading-tight text-foreground">
            Pachacámac — Recorrido Accesible
          </h1>
          <span
            className="flex shrink-0 items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success"
            aria-label="Modo sin conexión activo"
          >
            <WifiOff className="h-3.5 w-3.5" aria-hidden />
            Sin internet ✓
          </span>
        </div>

        <div
          role="img"
          aria-label="Mapa de Pachacámac con seis puntos numerados"
          className="relative mt-4 aspect-[4/3] w-full overflow-hidden rounded-2xl border-2 border-border bg-gradient-to-br from-[oklch(0.85_0.08_70)] via-[oklch(0.78_0.10_55)] to-[oklch(0.62_0.13_40)] shadow-inner"
        >
          {/* terrain ornament */}
          <svg
            viewBox="0 0 400 300"
            className="absolute inset-0 h-full w-full opacity-30"
            aria-hidden
          >
            <path
              d="M0 220 Q 80 180 160 200 T 320 190 T 400 210 L 400 300 L 0 300 Z"
              fill="oklch(0.45 0.13 35)"
            />
            <path
              d="M0 250 Q 100 220 200 240 T 400 245 L 400 300 L 0 300 Z"
              fill="oklch(0.38 0.13 32)"
            />
          </svg>

          {/* path connecting markers */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
            <polyline
              points={POINTS.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="oklch(0.99 0.01 80 / 0.7)"
              strokeWidth="0.6"
              strokeDasharray="2 1.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {POINTS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => navigate({ to: "/beacon/$id", params: { id: p.id } })}
              aria-label={`Conectar con el beacon del punto ${p.number}: ${p.name}. ${p.short}`}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              <span className="pulse-beacon grid h-11 w-11 place-items-center rounded-full border-2 border-white bg-primary text-base font-extrabold text-primary-foreground shadow-lg">
                {p.number}
              </span>
            </button>
          ))}
        </div>

        <h2 className="mt-6 text-base font-bold text-foreground">Puntos del recorrido</h2>
        <div
          className="-mx-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2"
          aria-label="Lista de puntos"
        >
          {POINTS.map((p) => (
            <Link
              key={p.id}
              to="/beacon/$id"
              params={{ id: p.id }}
              className="flex w-60 shrink-0 snap-start flex-col gap-2 rounded-xl border-2 border-border bg-card p-4 text-left"
              aria-label={`Conectar con beacon del punto ${p.number}: ${p.name}`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {p.number}
              </span>
              <span className="text-base font-bold leading-tight">{p.name}</span>
              <span className="text-sm text-muted-foreground">{p.short}</span>
            </Link>
          ))}
        </div>

        <div className="mt-6">
          <Link
            to="/fin"
            className="block w-full rounded-xl border-2 border-border bg-card p-4 text-center text-base font-semibold text-foreground"
          >
            Terminar recorrido
          </Link>
        </div>
      </section>

      <button
        type="button"
        onClick={toggleIntro}
        aria-label={playing ? "Detener descripción general" : "Reproducir descripción general"}
        className="fixed bottom-5 left-1/2 z-20 flex h-14 -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-5 text-base font-bold text-primary-foreground shadow-xl"
        style={{ maxWidth: "calc(430px - 2.5rem)" }}
      >
        {playing ? <Square className="h-5 w-5" aria-hidden /> : <Play className="h-5 w-5" aria-hidden />}
        {playing ? "Detener descripción" : "Descripción general"}
      </button>
    </AppShell>
  );
}
