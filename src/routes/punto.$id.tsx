import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Pause, Play, Radio } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { getPoint, POINTS } from "@/lib/points";
import { pointAudioSrc } from "@/lib/narration";
import { useNarrator } from "@/hooks/use-narrator";
import { useA11y } from "@/lib/a11y-context";


export const Route = createFileRoute("/punto/$id")({
  head: ({ params }) => {
    const p = getPoint(params.id);
    const title = p ? `${p.name} — AccessiTour` : "Punto — AccessiTour";
    return {
      meta: [
        { title },
        { name: "description", content: p?.short ?? "Punto del recorrido accesible." },
      ],
    };
  },
  loader: ({ params }) => {
    const p = getPoint(params.id);
    if (!p) throw notFound();
    return { point: p };
  },
  notFoundComponent: () => (
    <AppShell>
      <div className="p-6 text-center">
        <p>Punto no encontrado.</p>
        <Link to="/mapa" className="mt-4 inline-block font-semibold text-primary underline">
          Volver al mapa
        </Link>
      </div>
    </AppShell>
  ),
  component: PointPage,
});

// Velocidades de lectura. Por defecto empieza "calmado" (0.85) — la voz ya
// viene pausada en el audio generado; esto la hace aún más tranquila.
const SPEEDS = [0.85, 1, 1.25] as const;

function PointPage() {
  const { point } = Route.useLoaderData();
  const navigate = useNavigate();
  const { voiceFirst, easyReading: easyDefault, advanceMode, setAdvanceMode, profile } = useA11y();
  const { playing, progress, duration, currentTime, play: playNarration, stop: stopNarration } = useNarrator();
  const [speed, setSpeed] = useState<number>(0.85);
  const [easy, setEasy] = useState(easyDefault);
  const [advancing, setAdvancing] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const text = easy ? point.easy : point.full;
  const src = pointAudioSrc(point.id, easy);
  // duración real del audio si existe; si no, estimación ~12 car/seg.
  const totalSec = duration || Math.max(6, text.length / (12 * speed));
  const elapsedSec = currentTime || (progress / 100) * totalSec;

  const idx = POINTS.findIndex((p) => p.id === point.id);
  const nextPoint = POINTS[idx + 1];

  const clearAdvance = () => {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
    setAdvancing(false);
  };

  const stop = () => {
    stopNarration();
    clearAdvance();
  };

  const handleSpeechEnd = () => {
    // Solo auto-avanzar si el modo es "al terminar lectura". Damos una pausa
    // amplia (4 s) para que no se sienta apresurado.
    if (advanceMode !== "speech-end") return;
    setAdvancing(true);
    if (nextPoint) {
      advanceTimer.current = setTimeout(() => {
        navigate({ to: "/beacon/$id", params: { id: nextPoint.id } });
      }, 4000);
    } else {
      advanceTimer.current = setTimeout(() => navigate({ to: "/fin" }), 4000);
    }
  };

  const play = () => {
    clearAdvance();
    playNarration({ src, text, rate: speed, onEnd: handleSpeechEnd });
  };

  // beacon auto-play on mount — solo si el perfil prefiere voz primero
  useEffect(() => {
    if (!voiceFirst) return;
    const t = setTimeout(play, 600);
    return () => {
      clearTimeout(t);
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [point.id, voiceFirst]);

  // reset when text/speed change
  useEffect(() => {
    stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [easy, speed]);

  const prev = POINTS[idx - 1];
  const next = nextPoint;
  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <AppShell>
      <article className="pb-10">
        <div className="flex items-center gap-3 px-4 pt-3">
          <button
            type="button"
            onClick={() => navigate({ to: "/mapa" })}
            aria-label="Volver al mapa"
            className="grid h-11 w-11 place-items-center rounded-lg border-2 border-border bg-card"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </button>
          <h1 className="min-w-0 flex-1 truncate text-lg font-extrabold">{point.name}</h1>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {point.number}
          </span>
        </div>

        {/* Hero image */}
        <div
          role="img"
          aria-label={`Imagen ilustrativa de ${point.name}`}
          className="relative mx-4 mt-4 aspect-[16/10] overflow-hidden rounded-2xl border-2 border-border bg-gradient-to-br from-[oklch(0.55_0.16_38)] via-[oklch(0.42_0.15_30)] to-[oklch(0.30_0.10_28)]"
        >
          <svg viewBox="0 0 200 120" className="absolute inset-0 h-full w-full opacity-40" aria-hidden>
            <path d="M0 90 L40 60 L70 80 L110 45 L150 75 L200 55 L200 120 L0 120 Z" fill="oklch(0.35 0.13 30)" />
            <path d="M0 105 L60 85 L120 100 L200 90 L200 120 L0 120 Z" fill="oklch(0.25 0.10 28)" />
            <circle cx="160" cy="25" r="12" fill="oklch(0.85 0.16 70)" />
          </svg>
          <span className="absolute bottom-3 left-3 rounded-md bg-foreground/70 px-2 py-1 text-xs font-semibold text-background">
            Punto {point.number}
          </span>
        </div>

        {/* Beacon banner */}
        <div
          role="status"
          aria-live="polite"
          className="beacon-banner mx-4 mt-4 flex items-center gap-3 rounded-xl border-2 border-secondary/60 px-4 py-3 text-sm font-semibold text-foreground"
        >
          <Radio className="h-5 w-5 shrink-0" aria-hidden />
          <span className="flex-1">
            {advancing
              ? next
                ? `Avanzando al punto ${next.number}: ${next.name}...`
                : "Recorrido completo. Yendo a la pantalla final..."
              : "Beacon detectado — reproduciendo automáticamente"}
          </span>
          {advancing && (
            <button
              type="button"
              onClick={clearAdvance}
              className="h-9 shrink-0 rounded-md border-2 border-foreground/30 bg-background px-3 text-xs font-bold"
            >
              Cancelar
            </button>
          )}
        </div>

        <div className="mx-4 mt-3 rounded-xl border-2 border-border bg-card p-3 text-sm">
          <p className="mb-2 font-semibold">¿Cuándo avanzar al siguiente punto?</p>
          <div role="radiogroup" aria-label="Modo de avance al siguiente punto" className="flex gap-2">
            <button
              type="button"
              role="radio"
              aria-checked={advanceMode === "speech-end"}
              onClick={() => {
                setAdvanceMode("speech-end");
              }}
              className={`flex min-h-12 flex-1 items-center justify-center rounded-lg border-2 px-2 text-xs font-bold ${
                advanceMode === "speech-end"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card"
              }`}
            >
              Al terminar la lectura
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={advanceMode === "next-only"}
              onClick={() => {
                setAdvanceMode("next-only");
                clearAdvance();
              }}
              className={`flex min-h-12 flex-1 items-center justify-center rounded-lg border-2 px-2 text-xs font-bold ${
                advanceMode === "next-only"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card"
              }`}
            >
              Solo con botón Siguiente
            </button>
          </div>
          {profile !== "none" && (
            <p className="mt-2 text-xs text-muted-foreground">
              Perfil activo: ajustamos voz, texto y avance automáticamente.
            </p>
          )}
        </div>


        {/* Audio player */}
        <div className="mx-4 mt-4 rounded-2xl border-2 border-border bg-card p-5">
          <div className="flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={playing ? stop : play}
              aria-label={playing ? "Pausar audio" : "Reproducir audio"}
              className="grid h-20 w-20 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg active:scale-95"
            >
              {playing ? (
                <Pause className="h-9 w-9" aria-hidden />
              ) : (
                <Play className="ml-1 h-9 w-9" aria-hidden />
              )}
            </button>
            <div className="w-full">
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress)}
                className="h-2 w-full overflow-hidden rounded-full bg-muted"
              >
                <div
                  className="h-full bg-primary transition-[width] duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-xs tabular-nums text-muted-foreground">
                <span>{fmt(elapsedSec)}</span>
                <span>{fmt(totalSec)}</span>
              </div>
            </div>
            <div
              role="group"
              aria-label="Velocidad de reproducción"
              className="flex w-full gap-2"
            >
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpeed(s)}
                  aria-pressed={speed === s}
                  aria-label={`Velocidad ${s}x`}
                  className={`flex h-12 flex-1 items-center justify-center rounded-lg border-2 text-sm font-bold ${
                    speed === s
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Text + easy read */}
        <div className="mx-4 mt-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold">Descripción</h2>
            <button
              type="button"
              onClick={() => setEasy((v) => !v)}
              aria-pressed={easy}
              className={`h-11 rounded-lg border-2 px-3 text-sm font-bold ${
                easy
                  ? "border-secondary bg-secondary text-secondary-foreground"
                  : "border-border bg-card text-foreground"
              }`}
            >
              Lectura fácil
            </button>
          </div>
          <p
            className={`mt-3 rounded-xl border-2 border-border bg-card p-4 leading-relaxed text-foreground ${
              easy ? "text-xl" : "text-base"
            }`}
          >
            {text}
          </p>
        </div>

        {/* Prev / Next */}
        <nav
          aria-label="Navegación entre puntos"
          className="mx-4 mt-6 flex items-stretch gap-3"
        >
          {prev ? (
            <Link
              to="/beacon/$id"
              params={{ id: prev.id }}
              className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-border bg-card px-3 text-sm font-bold"
              aria-label={`Punto anterior: ${prev.name}. Reconectar con su beacon.`}
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
              <span className="truncate">Anterior</span>
            </Link>
          ) : (
            <span className="flex-1" />
          )}
          {next ? (
            <Link
              to="/beacon/$id"
              params={{ id: next.id }}
              className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-bold text-primary-foreground"
              aria-label={`Siguiente punto: ${next.name}. Conectar con su beacon.`}
            >
              <span className="truncate">Siguiente</span>
              <ChevronRight className="h-5 w-5" aria-hidden />
            </Link>
          ) : (
            <Link
              to="/fin"
              className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-bold text-primary-foreground"
            >
              Finalizar
              <ChevronRight className="h-5 w-5" aria-hidden />
            </Link>
          )}
        </nav>
      </article>
    </AppShell>
  );
}
