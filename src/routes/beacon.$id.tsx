import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Radio, Signal, MapPin, Check } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { getPoint } from "@/lib/points";
import { useA11y } from "@/lib/a11y-context";
import { speak } from "@/lib/speech";

export const Route = createFileRoute("/beacon/$id")({
  head: ({ params }) => {
    const p = getPoint(params.id);
    return {
      meta: [
        { title: p ? `Conectando con beacon ${p.number} — AccessiTour` : "Beacon — AccessiTour" },
        { name: "description", content: "Simulación de conexión Bluetooth con un beacon del sitio arqueológico." },
      ],
    };
  },
  loader: ({ params }) => {
    const p = getPoint(params.id);
    if (!p) throw notFound();
    return { point: p };
  },
  component: BeaconPage,
});

type Phase = "scanning" | "weak" | "medium" | "strong" | "connected";

const PHASES: { phase: Phase; rssi: number; meters: number; label: string }[] = [
  { phase: "scanning", rssi: -95, meters: 18, label: "Buscando beacons cercanos…" },
  { phase: "weak", rssi: -82, meters: 12, label: "Señal débil — acércate al punto" },
  { phase: "medium", rssi: -70, meters: 6, label: "Señal media — sigue caminando" },
  { phase: "strong", rssi: -55, meters: 2, label: "Señal fuerte — casi conectado" },
  { phase: "connected", rssi: -42, meters: 0, label: "Beacon conectado ✓" },
];

function BeaconPage() {
  const { point } = Route.useLoaderData();
  const navigate = useNavigate();
  const { voiceFirst, profile } = useA11y();
  const [step, setStep] = useState(0);
  const announced = useRef<Set<number>>(new Set());

  const current = PHASES[step];

  useEffect(() => {
    if (step >= PHASES.length - 1) {
      const t = setTimeout(() => navigate({ to: "/punto/$id", params: { id: point.id } }), 1200);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), 1100);
    return () => clearTimeout(t);
  }, [step, navigate, point.id]);

  // Anunciar progreso por voz si el perfil lo requiere (ciegos)
  useEffect(() => {
    if (!voiceFirst) return;
    if (announced.current.has(step)) return;
    announced.current.add(step);
    speak(current.label);
  }, [step, voiceFirst, current.label]);

  // signal "bars" 0..5
  const bars = Math.max(0, Math.min(5, Math.round(((-40 - current.rssi) / -55) * 5 + 5)));

  return (
    <AppShell>
      <section className="px-4 pb-10 pt-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate({ to: "/mapa" })}
            aria-label="Volver al mapa"
            className="grid h-11 w-11 place-items-center rounded-lg border-2 border-border bg-card"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </button>
          <h1 className="min-w-0 flex-1 truncate text-lg font-extrabold">
            Beacon {point.number}: {point.name}
          </h1>
        </div>

        {/* Radar / signal visualizer */}
        <div
          role="img"
          aria-label={`Simulación de conexión Bluetooth con el beacon ${point.number}. Estado: ${current.label}. Distancia simulada ${current.meters} metros.`}
          className="relative mx-auto mt-6 grid aspect-square w-full max-w-sm place-items-center overflow-hidden rounded-2xl border-2 border-border bg-card"
        >
          {/* rings */}
          {[1, 2, 3, 4].map((r) => (
            <span
              key={r}
              aria-hidden
              className={`beacon-ring absolute rounded-full border-2 ${
                step >= r ? "border-primary/60" : "border-border"
              }`}
              style={{
                width: `${r * 22}%`,
                height: `${r * 22}%`,
                animationDelay: `${r * 0.25}s`,
              }}
            />
          ))}
          {/* you (center) */}
          <span
            className={`relative grid h-20 w-20 place-items-center rounded-full ${
              current.phase === "connected" ? "bg-success text-success-foreground" : "bg-primary text-primary-foreground"
            } shadow-xl`}
            aria-hidden
          >
            {current.phase === "connected" ? <Check className="h-10 w-10" /> : <Radio className="h-10 w-10" />}
          </span>
          {/* beacon dot moving closer */}
          <span
            aria-hidden
            className="absolute grid h-8 w-8 place-items-center rounded-full border-2 border-secondary bg-background text-secondary transition-all duration-700"
            style={{
              top: `${50 - (step + 1) * 6}%`,
              right: `${10 + step * 4}%`,
              transform: "translate(0,0)",
            }}
          >
            <MapPin className="h-4 w-4" />
          </span>
        </div>

        {/* Status */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="mt-5 rounded-xl border-2 border-border bg-card p-4"
        >
          <p className="text-base font-bold">{current.label}</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm font-semibold">
              <Signal className="h-4 w-4 text-primary" aria-hidden />
              Señal: {current.rssi} dBm
            </span>
            <span className="text-sm font-semibold tabular-nums">
              Distancia ~{current.meters} m
            </span>
          </div>
          {/* bars */}
          <div className="mt-3 flex items-end gap-1" aria-hidden>
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`block w-3 rounded-sm transition-all ${
                  i < bars ? "bg-primary" : "bg-muted"
                }`}
                style={{ height: `${(i + 1) * 6 + 4}px` }}
              />
            ))}
          </div>
          {/* progress */}
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(((step + 1) / PHASES.length) * 100)}
            aria-label="Progreso de conexión con beacon"
            className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full bg-primary transition-[width] duration-500"
              style={{ width: `${((step + 1) / PHASES.length) * 100}%` }}
            />
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {profile === "visual"
            ? "Te estamos guiando con voz. Al conectarte se reproducirá la audioguía."
            : profile === "auditiva"
              ? "Cuando el beacon esté conectado verás el contenido en texto."
              : "Simulación de Bluetooth. Al conectarte verás el contenido del punto."}
        </p>
      </section>

      <style>{`
        @keyframes beacon-ring { 0% { opacity: 0; transform: scale(0.6); } 60% { opacity: 1; } 100% { opacity: 0.2; transform: scale(1); } }
        .beacon-ring { animation: beacon-ring 1.6s ease-out infinite; }
        .reduce-motion .beacon-ring { animation: none; opacity: 0.4; }
      `}</style>
    </AppShell>
  );
}
