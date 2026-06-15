import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Radio } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { DownloadOverlay } from "@/components/DownloadOverlay";
import { useA11y } from "@/lib/a11y-context";
import { speak } from "@/lib/speech";

export const Route = createFileRoute("/nfc")({
  head: () => ({
    meta: [
      { title: "Tocar NFC — AccessiTour" },
      { name: "description", content: "Simulación de lectura NFC para iniciar el recorrido." },
    ],
  }),
  component: NfcPage,
});

type Phase = "waiting" | "reading" | "validated" | "downloading" | "done";

function NfcPage() {
  const navigate = useNavigate();
  const { setDownloaded } = useA11y();
  const [phase, setPhase] = useState<Phase>("waiting");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    speak("Acerca tu teléfono al lector NFC del sitio.");
    const t1 = setTimeout(() => {
      setPhase("reading");
      speak("Leyendo etiqueta NFC.");
    }, 1500);
    const t2 = setTimeout(() => {
      setPhase("validated");
      speak("Etiqueta validada. Iniciando descarga.");
    }, 3000);
    const t3 = setTimeout(() => setPhase("downloading"), 4000);
    return () => {
      [t1, t2, t3].forEach(clearTimeout);
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

  const status =
    phase === "waiting"
      ? "Esperando dispositivo NFC..."
      : phase === "reading"
        ? "Leyendo etiqueta NFC..."
        : "Etiqueta NFC validada ✓";

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
          <h1 className="text-lg font-extrabold">Tocar etiqueta NFC</h1>
        </div>

        <div
          role="img"
          aria-label={
            phase === "waiting"
              ? "Animación de antenas NFC pulsando, esperando un dispositivo."
              : phase === "reading"
                ? "Antenas NFC pulsando, leyendo etiqueta."
                : "Antena NFC con marca de verificación verde, etiqueta validada."
          }
          className="relative mx-auto mt-8 grid aspect-square w-full max-w-sm place-items-center rounded-2xl border-2 border-border bg-card"
        >
          {/* expanding rings while waiting/reading - decorativo */}
          {(phase === "waiting" || phase === "reading") && (
            <>
              <span aria-hidden className="nfc-ring absolute h-40 w-40 rounded-full border-4 border-secondary/60" />
              <span aria-hidden className="nfc-ring nfc-ring-2 absolute h-40 w-40 rounded-full border-4 border-secondary/40" />
              <span aria-hidden className="nfc-ring nfc-ring-3 absolute h-40 w-40 rounded-full border-4 border-secondary/20" />
            </>
          )}
          <span
            aria-hidden
            className={`relative grid h-32 w-32 place-items-center rounded-full ${
              phase === "validated" || phase === "downloading" || phase === "done"
                ? "bg-success text-success-foreground"
                : "bg-primary text-primary-foreground"
            } shadow-lg`}
          >
            {phase === "validated" || phase === "downloading" || phase === "done" ? (
              <Check className="h-14 w-14" />
            ) : (
              <Radio className="h-14 w-14" />
            )}
          </span>
        </div>

        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="mt-6 rounded-xl border-2 border-border bg-card p-4 text-center text-base font-bold"
        >
          {status}
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Simulación de lectura NFC. Mantén el teléfono cerca del lector.
        </p>
      </section>

      {(phase === "downloading" || phase === "done") && (
        <DownloadOverlay progress={progress} done={phase === "done"} />
      )}

      <style>{`
        @keyframes nfc-ring { 0% { transform: scale(0.6); opacity: 0.9; } 100% { transform: scale(1.6); opacity: 0; } }
        .nfc-ring { animation: nfc-ring 1.8s ease-out infinite; }
        .nfc-ring-2 { animation-delay: 0.6s; }
        .nfc-ring-3 { animation-delay: 1.2s; }
        .reduce-motion .nfc-ring { animation: none; opacity: 0.3; }
      `}</style>
    </AppShell>
  );
}
