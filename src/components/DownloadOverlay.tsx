import { Check } from "lucide-react";

export function DownloadOverlay({
  progress,
  done,
  label,
}: {
  progress: number;
  done: boolean;
  label?: string;
}) {
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
        {done ? "Listo. Funciona sin internet." : (label ?? "Descargando recorrido completo...")}
      </p>
    </div>
  );
}

export function useSimulatedDownload() {
  return (onDone: () => void, setProgress: (p: number) => void, setDone: (d: boolean) => void) => {
    let p = 0;
    setProgress(0);
    setDone(false);
    const id = setInterval(() => {
      p += 4;
      if (p >= 100) {
        clearInterval(id);
        setProgress(100);
        setDone(true);
        setTimeout(onDone, 1000);
      } else {
        setProgress(p);
      }
    }, 60);
    return () => clearInterval(id);
  };
}
