import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { QrCode, Radio, Link as LinkIcon, Check } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useA11y } from "@/lib/a11y-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AccessiTour — Pachacámac accesible" },
      {
        name: "description",
        content:
          "Empieza tu recorrido accesible por Pachacámac. Escanea QR, toca NFC o ingresa con un enlace.",
      },
    ],
  }),
  component: WelcomePage,
});

function WelcomePage() {
  const navigate = useNavigate();
  const { setDownloaded } = useA11y();
  const [progress, setProgress] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const start = () => {
    if (progress !== null) return;
    setProgress(0);
    setDone(false);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p === null) return p;
        const next = p + 4;
        if (next >= 100) {
          clearInterval(interval);
          setDone(true);
          setDownloaded(true);
          setTimeout(() => navigate({ to: "/mapa" }), 1100);
          return 100;
        }
        return next;
      });
    }, 60);
  };

  return (
    <AppShell>
      <section className="flex flex-col items-center px-5 pb-10 pt-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">
          AccessiTour
        </h1>
        <p className="mt-2 text-lg font-medium text-foreground">
          Pachacámac accesible
        </p>
        <p className="mt-2 max-w-xs text-base text-muted-foreground">
          Recorrido guiado para todas las personas.
        </p>

        <div className="mt-8 w-full rounded-2xl border-2 border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-left text-lg font-bold">¿Cómo quieres entrar?</h2>
          <div className="flex flex-col gap-3">
            <AccessButton
              icon={<QrCode className="h-7 w-7" aria-hidden />}
              label="Escanear QR"
              hint="Apunta la cámara al código del sitio"
              onClick={start}
            />
            <AccessButton
              icon={<Radio className="h-7 w-7" aria-hidden />}
              label="Tocar NFC"
              hint="Acerca tu teléfono al lector"
              onClick={start}
            />
            <AccessButton
              icon={<LinkIcon className="h-7 w-7" aria-hidden />}
              label="Ingresar con enlace"
              hint="Usa el enlace que te compartieron"
              onClick={start}
            />
          </div>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Una vez descargado, el recorrido funciona sin internet.
        </p>
      </section>

      {progress !== null && (
        <DownloadOverlay progress={progress} done={done} />
      )}
    </AppShell>
  );
}

function AccessButton({
  icon,
  label,
  hint,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label}. ${hint}`}
      className="flex min-h-[64px] w-full items-center gap-4 rounded-xl bg-primary px-4 py-3 text-left text-primary-foreground transition active:scale-[0.98]"
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary-foreground/15">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-lg font-bold leading-tight">{label}</span>
        <span className="block text-sm opacity-90">{hint}</span>
      </span>
    </button>
  );
}

function DownloadOverlay({ progress, done }: { progress: number; done: boolean }) {
  const r = 70;
  const c = 2 * Math.PI * r;
  const offset = c - (progress / 100) * c;
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={done ? "Descarga completada" : `Descargando ${progress} por ciento`}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur"
    >
      <div className="relative h-44 w-44">
        <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
          <circle cx="80" cy="80" r={r} stroke="var(--muted)" strokeWidth="10" fill="none" />
          <circle
            cx="80"
            cy="80"
            r={r}
            stroke={done ? "var(--success)" : "var(--primary)"}
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-100"
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          {done ? (
            <span className="grid h-20 w-20 place-items-center rounded-full bg-success text-success-foreground">
              <Check className="h-12 w-12" aria-hidden />
            </span>
          ) : (
            <span className="text-3xl font-extrabold text-primary">{progress}%</span>
          )}
        </div>
      </div>
      <p className="mt-6 px-6 text-center text-lg font-semibold">
        {done ? "Listo. Funciona sin internet." : "Descargando recorrido completo..."}
      </p>
    </div>
  );
}
