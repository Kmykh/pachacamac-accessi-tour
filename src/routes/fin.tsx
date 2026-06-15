import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Mic, Share2, Sparkles, Star, Check, X, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { speak, listen, speechRecognitionSupported } from "@/lib/speech";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { useA11y } from "@/lib/a11y-context";

// Interpreta lo que dijo el usuario y lo convierte en una calificación 1-5.
function parseRating(text: string): number {
  const t = text.toLowerCase();
  const m = t.match(/[1-5]/);
  if (m) return Number(m[0]);
  const words: Record<string, number> = {
    "muy malo": 1,
    pésimo: 1,
    pesimo: 1,
    una: 1,
    uno: 1,
    dos: 2,
    malo: 2,
    tres: 3,
    regular: 3,
    "más o menos": 3,
    cuatro: 4,
    bueno: 4,
    cinco: 5,
    excelente: 5,
    genial: 5,
    increíble: 5,
    increible: 5,
    "muy bueno": 5,
    perfecto: 5,
  };
  for (const [k, v] of Object.entries(words)) {
    if (t.includes(k)) return v;
  }
  return 0;
}

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
  const { voiceFirst } = useA11y();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);
  const [listening, setListening] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useFocusTrap(dialogRef, sent, () => setSent(false));

  // Valoración por voz: pregunta, escucha y convierte la respuesta en estrellas.
  const giveVoice = () => {
    if (!speechRecognitionSupported()) {
      speak("Tu navegador no permite valorar por voz. Por favor, toca las estrellas.");
      return;
    }
    speak("Del uno al cinco, ¿cómo estuvo tu experiencia? Habla después del aviso.", {
      onEnd: () => {
        setListening(true);
        listen({
          lang: "es-PE",
          onResult: (text) => {
            const r = parseRating(text);
            if (r) {
              setRating(r);
              speak(`Registré ${r} ${r === 1 ? "estrella" : "estrellas"}. ¡Gracias!`);
            } else {
              speak("No te entendí bien. Puedes intentarlo de nuevo o tocar las estrellas.");
            }
          },
          onError: () => {
            setListening(false);
            speak("No pude escucharte. Por favor, toca las estrellas.");
          },
          onEnd: () => setListening(false),
        });
      },
    });
  };

  // Enviar la encuesta abre la ventana de confirmación.
  const submit = () => {
    if (rating === 0) return;
    setSent(true);
  };

  // Al abrir la ventana, aviso por voz si el perfil usa audio (el foco lo
  // gestiona useFocusTrap).
  useEffect(() => {
    if (!sent) return;
    if (voiceFirst) {
      speak(
        `¡Gracias por tu valoración de ${rating} ${rating === 1 ? "estrella" : "estrellas"}! Tu opinión nos ayuda a mejorar la accesibilidad.`,
      );
    }
  }, [sent, voiceFirst, rating]);

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
            disabled={listening}
            aria-label="Dar valoración por voz"
            className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border-2 border-primary bg-background px-4 text-base font-bold text-primary disabled:opacity-70"
          >
            {listening ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            ) : (
              <Mic className="h-5 w-5" aria-hidden />
            )}
            {listening ? "Escuchando…" : "Dar valoración por voz"}
          </button>
          <p className="sr-only" role="status" aria-live="assertive">
            {listening ? "Escuchando tu valoración" : ""}
          </p>

          <button
            type="button"
            onClick={submit}
            disabled={rating === 0}
            aria-label="Enviar valoración"
            className="mt-3 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-base font-bold text-primary-foreground disabled:opacity-50"
          >
            Enviar valoración
          </button>
          {rating === 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Toca las estrellas para calificar antes de enviar.
            </p>
          )}
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

      {/* Ventana de encuesta / confirmación */}
      {sent && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4"
          onClick={() => setSent(false)}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="encuesta-titulo"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") setSent(false);
            }}
            className="w-full max-w-sm rounded-2xl border-2 border-border bg-card p-6 text-center shadow-xl outline-none"
          >
            <div className="flex items-center justify-between">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-success text-success-foreground">
                <Check className="h-6 w-6" aria-hidden />
              </span>
              <button
                type="button"
                onClick={() => setSent(false)}
                aria-label="Cerrar ventana"
                className="grid h-10 w-10 place-items-center rounded-lg border-2 border-border bg-background"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <h2 id="encuesta-titulo" className="mt-4 text-xl font-extrabold text-primary">
              ¡Gracias por tu valoración!
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Calificaste con {rating} {rating === 1 ? "estrella" : "estrellas"}. Tu opinión nos
              ayuda a mejorar la accesibilidad de Pachacámac.
            </p>

            <div className="mt-3 flex justify-center gap-1" aria-hidden>
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className="h-6 w-6 text-secondary"
                  fill={n <= rating ? "currentColor" : "none"}
                />
              ))}
            </div>

            <label htmlFor="encuesta-comentario" className="mt-5 block text-left text-sm font-semibold">
              ¿Algo que podamos mejorar? (opcional)
            </label>
            <textarea
              id="encuesta-comentario"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Escribe aquí tu comentario…"
              className="mt-2 w-full resize-none rounded-xl border-2 border-border bg-background p-3 text-sm text-foreground"
            />

            <div className="mt-5 flex flex-col gap-3">
              <Link
                to="/"
                className="flex min-h-14 w-full items-center justify-center rounded-xl bg-primary px-4 text-base font-bold text-primary-foreground"
              >
                Listo, volver al inicio
              </Link>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="flex min-h-12 w-full items-center justify-center rounded-xl border-2 border-border bg-card px-4 text-sm font-semibold text-foreground"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
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
