import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { QrCode, Radio, Link as LinkIcon, Accessibility, UserCog } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { DownloadOverlay } from "@/components/DownloadOverlay";
import { useA11y, PROFILE_LABEL } from "@/lib/a11y-context";
import { speak } from "@/lib/speech";

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
  const { setDownloaded, profile, voiceFirst } = useA11y();
  const [progress, setProgress] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  // Si aún no hay perfil definido, llevar al usuario a /perfil
  useEffect(() => {
    if (profile === "none") {
      navigate({ to: "/perfil" });
    } else if (voiceFirst) {
      speak("Bienvenido a AccessiTour. Elige cómo quieres entrar al recorrido.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startLinkDownload = () => {
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
      <section className="flex flex-col items-center px-5 pb-10 pt-6 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">
          AccessiTour
        </h1>
        <p className="mt-2 text-lg font-medium text-foreground">
          Pachacámac accesible
        </p>
        <p className="mt-2 max-w-xs text-base text-muted-foreground">
          Recorrido guiado para todas las personas.
        </p>

        {profile !== "none" && (
          <Link
            to="/perfil"
            className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full border-2 border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary"
            aria-label={`Perfil actual: ${PROFILE_LABEL[profile]}. Tocar para cambiar.`}
          >
            <UserCog className="h-4 w-4" aria-hidden />
            <span className="truncate">Perfil: {PROFILE_LABEL[profile]}</span>
          </Link>
        )}

        <div className="mt-6 w-full rounded-2xl border-2 border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-left text-lg font-bold">¿Cómo quieres entrar?</h2>
          <div className="flex flex-col gap-3">
            <AccessButton
              icon={<QrCode className="h-7 w-7" aria-hidden />}
              label="Escanear QR"
              hint="Apunta la cámara al código del sitio"
              onClick={() => navigate({ to: "/escanear" })}
            />
            <AccessButton
              icon={<Radio className="h-7 w-7" aria-hidden />}
              label="Tocar NFC"
              hint="Acerca tu teléfono al lector"
              onClick={() => navigate({ to: "/nfc" })}
            />
            <AccessButton
              icon={<LinkIcon className="h-7 w-7" aria-hidden />}
              label="Ingresar con enlace"
              hint="Usa el enlace que te compartieron"
              onClick={startLinkDownload}
            />
          </div>
        </div>

        <Link
          to="/accesibilidad"
          className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-border bg-card px-4 py-2 text-base font-bold text-foreground"
        >
          <Accessibility className="h-5 w-5 text-primary" aria-hidden />
          Checklist de accesibilidad
        </Link>

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
