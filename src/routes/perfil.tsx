import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, Ear, Brain, Accessibility, ChevronRight, Check } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useA11y, type Profile } from "@/lib/a11y-context";
import { speak } from "@/lib/speech";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Tu perfil de accesibilidad — AccessiTour" },
      {
        name: "description",
        content:
          "Selecciona el perfil de discapacidad para adaptar AccessiTour: lector de voz para ceguera, lectura fácil para perfil cognitivo, y más.",
      },
    ],
  }),
  component: PerfilPage,
});

type Option = {
  id: Exclude<Profile, "none">;
  title: string;
  desc: string;
  adapts: string[];
  Icon: typeof Eye;
};

const OPTIONS: Option[] = [
  {
    id: "visual",
    title: "Discapacidad visual",
    desc: "Ceguera total o baja visión.",
    adapts: ["Lector de voz automático", "Texto más grande", "Animaciones reducidas"],
    Icon: Eye,
  },
  {
    id: "auditiva",
    title: "Discapacidad auditiva",
    desc: "Sordera o hipoacusia.",
    adapts: ["Texto primero, sin voz automática", "Vibración del beacon visible", "Subtítulos en cada punto"],
    Icon: Ear,
  },
  {
    id: "cognitiva",
    title: "Discapacidad cognitiva",
    desc: "Lectura más simple y pausada.",
    adapts: ["Lectura fácil siempre activa", "Texto más grande", "Avance solo con botón Siguiente"],
    Icon: Brain,
  },
  {
    id: "motora",
    title: "Discapacidad motora",
    desc: "Movilidad o destreza reducida.",
    adapts: ["Botones grandes", "Avance automático tras leer", "Menos toques necesarios"],
    Icon: Accessibility,
  },
];

function PerfilPage() {
  const navigate = useNavigate();
  const { profile, setProfile } = useA11y();
  const [sel, setSel] = useState<Profile>(profile === "none" ? "visual" : profile);

  const confirm = () => {
    setProfile(sel);
    const opt = OPTIONS.find((o) => o.id === sel);
    if (opt && sel === "visual") {
      speak(`Perfil ${opt.title} seleccionado. Activamos el lector de voz automáticamente.`);
    }
    navigate({ to: "/" });
  };

  return (
    <AppShell>
      <section className="px-4 pb-10 pt-4">
        <h1 className="text-2xl font-extrabold text-primary">¿Cómo prefieres recorrer?</h1>
        <p className="mt-2 text-base text-foreground">
          Cuéntanos tu perfil para adaptar AccessiTour. Los beacons del sitio funcionan para
          todas las personas; según tu perfil cambiamos cómo te llega el contenido.
        </p>

        <ul className="mt-5 flex flex-col gap-3" role="radiogroup" aria-label="Perfil de accesibilidad">
          {OPTIONS.map((o) => {
            const active = sel === o.id;
            return (
              <li key={o.id}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSel(o.id)}
                  className={`flex w-full items-start gap-3 rounded-2xl border-2 p-4 text-left transition ${
                    active
                      ? "border-primary bg-primary/5 ring-2 ring-primary"
                      : "border-border bg-card"
                  }`}
                >
                  <span
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${
                      active ? "bg-primary text-primary-foreground" : "bg-muted text-primary"
                    }`}
                    aria-hidden
                  >
                    <o.Icon className="h-6 w-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="block text-lg font-bold leading-tight">{o.title}</span>
                      {active && (
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground" aria-hidden>
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">{o.desc}</span>
                    <ul className="mt-2 flex flex-col gap-1">
                      {o.adapts.map((a) => (
                        <li key={a} className="flex items-start gap-2 text-sm">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={confirm}
          className="mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-bold text-primary-foreground"
        >
          Continuar
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Podrás cambiarlo en cualquier momento desde el inicio.
        </p>
      </section>
    </AppShell>
  );
}
