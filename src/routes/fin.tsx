import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mic, Share2, Sparkles, Star } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { speak } from "@/lib/speech";

export const Route = createFileRoute("/fin")({
  head: () => ({
    meta: [
      { title: "¡Recorrido completado! — AccessiTour" },
      { name: "description", content: "Has completado el recorrido accesible de Pachacámac." },
    ],
  }),
  component: FinishPage,
});

function FinishPage() {
  const [rating, setRating] = useState(0);

  const giveVoice = () => {
    speak("Cuéntanos cómo fue tu experiencia. Estamos escuchando.");
  };

  const share = async () => {
    const data = {
      title: "AccessiTour — Pachacámac accesible",
      text: "Acabo de completar el recorrido accesible de Pachacámac.",
      url: typeof window !== "undefined" ? window.location.origin : "",
    };
    try {
      if (navigator.share) await navigator.share(data);
      else if (navigator.clipboard) {
        await navigator.clipboard.writeText(data.url);
      }
    } catch {}
  };

  return (
    <AppShell>
      <section className="px-5 pb-10 pt-6 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <Sparkles className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold leading-tight text-primary">
          ¡Completaste el recorrido!
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Exploraste Pachacámac de forma autónoma.
        </p>

        <dl className="mt-6 grid grid-cols-1 gap-3 rounded-2xl border-2 border-border bg-card p-5 text-left">
          <Stat label="Puntos visitados" value="6 de 6" />
          <Stat label="Accesibilidad del sitio" value="★★★★☆ 4.2/5" />
          <Stat label="Visitantes con discapacidad hoy" value="23 personas" />
        </dl>

        <div className="mt-8 rounded-2xl border-2 border-border bg-card p-5">
          <h2 className="text-lg font-bold">¿Cómo fue tu experiencia?</h2>
          <div
            role="radiogroup"
            aria-label="Calificación de 1 a 5 estrellas"
            className="mt-4 flex justify-between gap-2"
          >
            {[1, 2, 3, 4, 5].map((n) => {
              const active = n <= rating;
              return (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={rating === n}
                  aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
                  onClick={() => setRating(n)}
                  className={`grid h-14 w-14 place-items-center rounded-xl border-2 transition ${
                    active
                      ? "border-secondary bg-secondary text-secondary-foreground"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  <Star
                    className="h-7 w-7"
                    fill={active ? "currentColor" : "none"}
                    aria-hidden
                  />
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={giveVoice}
            aria-label="Dar valoración por voz"
            className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-base font-bold text-primary-foreground"
          >
            <Mic className="h-5 w-5" aria-hidden />
            Dar valoración por voz
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={share}
            aria-label="Compartir recorrido accesible"
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border-2 border-primary bg-background px-4 text-base font-bold text-primary"
          >
            <Share2 className="h-5 w-5" aria-hidden />
            Compartir recorrido accesible
          </button>
          <Link
            to="/"
            className="flex min-h-14 w-full items-center justify-center rounded-xl border-2 border-border bg-card px-4 text-base font-semibold text-foreground"
          >
            Volver al inicio
          </Link>
        </div>
      </section>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border pb-2 last:border-0 last:pb-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-base font-bold text-foreground">{value}</dd>
    </div>
  );
}
