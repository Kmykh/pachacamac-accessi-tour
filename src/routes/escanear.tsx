import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, QrCode } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { DownloadOverlay } from "@/components/DownloadOverlay";
import { useA11y } from "@/lib/a11y-context";
import { speak } from "@/lib/speech";

export const Route = createFileRoute("/escanear")({
  head: () => ({
    meta: [
      { title: "Escanear QR — AccessiTour" },
      { name: "description", content: "Simulación de escaneo de código QR para iniciar el recorrido." },
    ],
  }),
  component: ScanQR,
});

type Phase = "searching" | "detected" | "downloading" | "done";

function ScanQR() {
  const navigate = useNavigate();
  const { setDownloaded } = useA11y();
  const [phase, setPhase] = useState<Phase>("searching");
  const [progress, setProgress] = useState(0);

  // simulated validation: searching → detected → download
  useEffect(() => {
    speak("Buscando código QR. Apunta la cámara al cartel del sitio.");
    const t1 = setTimeout(() => {
      setPhase("detected");
      speak("Código QR detectado. Iniciando descarga del recorrido.");
    }, 2200);
    const t2 = setTimeout(() => setPhase("downloading"), 3600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (phase !== "downloading") return;
    let p = 0;
    const id = setInterval(() => {
      p += 5;
      if (p >= 100) {
        clearInterval(id);
        setProgress(100);
        setPhase("done");
        setDownloaded(true);
        setTimeout(() => navigate({ to: "/mapa" }), 1100);
      } else {
        setProgress(p);
      }
    }, 60);
    return () => clearInterval(id);
  }, [phase, navigate, setDownloaded]);

  return (
    <AppShell>
      <section className="px-4 pb-10 pt-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            aria-label="Volver al inicio"
            className="grid h-11 w-11 place-items-center rounded-lg border-2 border-border bg-card"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </button>
          <h1 className="text-lg font-extrabold">Escanear código QR</h1>
        </div>

        {/* Simulated camera viewport */}
        <div
          role="img"
          aria-label="Vista simulada de la cámara apuntando al código QR"
          className="relative mx-auto mt-5 aspect-square w-full overflow-hidden rounded-2xl border-2 border-border bg-[oklch(0.18_0.01_60)]"
        >
          {/* fake "code" grid */}
          <div className="absolute inset-0 grid place-items-center">
            <div className="grid grid-cols-8 gap-1 opacity-70">
              {Array.from({ length: 64 }).map((_, i) => (
                <span
                  key={i}
                  className="h-3 w-3 rounded-sm"
                  style={{
                    background: (i * 13 + 7) % 3 === 0 ? "white" : "transparent",
                  }}
                />
              ))}
            </div>
          </div>

          {/* reticle */}
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="relative h-56 w-56">
              <Corner className="left-0 top-0" />
              <Corner className="right-0 top-0 rotate-90" />
              <Corner className="bottom-0 right-0 rotate-180" />
              <Corner className="bottom-0 left-0 -rotate-90" />
              {phase === "searching" && (
                <span className="scan-line absolute left-2 right-2 top-2 h-0.5 rounded-full bg-secondary shadow-[0_0_10px_var(--secondary)]" />
              )}
              {(phase === "detected" || phase === "downloading" || phase === "done") && (
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid h-20 w-20 place-items-center rounded-full bg-success text-success-foreground shadow-xl">
                    <Check className="h-10 w-10" aria-hidden />
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div
          role="status"
          aria-live="polite"
          className="mt-5 rounded-xl border-2 border-border bg-card p-4 text-center"
        >
          {phase === "searching" && (
            <p className="flex items-center justify-center gap-2 text-base font-semibold">
              <QrCode className="h-5 w-5 text-primary" aria-hidden />
              Buscando código QR...
            </p>
          )}
          {phase === "detected" && (
            <p className="text-base font-bold text-success">Código QR detectado ✓</p>
          )}
          {(phase === "downloading" || phase === "done") && (
            <p className="text-base font-bold text-primary">Validado. Preparando descarga...</p>
          )}
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Simulación de cámara. Mantén el código dentro del cuadro.
        </p>
      </section>

      {(phase === "downloading" || phase === "done") && (
        <DownloadOverlay progress={progress} done={phase === "done"} />
      )}

      <style>{`
        @keyframes scan-line { 0% { transform: translateY(0); } 50% { transform: translateY(13rem); } 100% { transform: translateY(0); } }
        .scan-line { animation: scan-line 2s ease-in-out infinite; }
        .reduce-motion .scan-line { animation: none; }
      `}</style>
    </AppShell>
  );
}

function Corner({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`absolute h-8 w-8 border-secondary ${className}`}
      style={{ borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 8 }}
    />
  );
}
