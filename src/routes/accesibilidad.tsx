import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Check, Contrast, Eye, Type, Wand2, X, Zap } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useA11y } from "@/lib/a11y-context";
import { speak } from "@/lib/speech";

export const Route = createFileRoute("/accesibilidad")({
  head: () => ({
    meta: [
      { title: "Checklist de accesibilidad — AccessiTour" },
      {
        name: "description",
        content:
          "Verifica contraste, tamaño de fuente, reducción de movimiento y lectura fácil antes de iniciar el recorrido.",
      },
    ],
  }),
  component: A11yChecklist,
});

const SAMPLE_EASY = "Aquí estás en Pachacámac. Es un lugar muy antiguo. Vas a ver seis lugares.";
const SAMPLE_FULL =
  "Te encuentras en el complejo arqueológico de Pachacámac, un sitio ceremonial precolombino con más de 1500 años de antigüedad.";

function A11yChecklist() {
  const navigate = useNavigate();
  const {
    highContrast,
    toggleHighContrast,
    fontSize,
    setFontSize,
    reduceMotion,
    toggleReduceMotion,
  } = useA11y();
  const [easyPreview, setEasyPreview] = useState(false);
  const [confirmed, setConfirmed] = useState({
    contrast: false,
    font: false,
    motion: false,
    easy: false,
  });

  const total = 4;
  const completed = useMemo(
    () => Object.values(confirmed).filter(Boolean).length,
    [confirmed],
  );

  const allDone = completed === total;

  return (
    <AppShell>
      <section className="px-4 pb-12 pt-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            aria-label="Volver"
            className="grid h-11 w-11 place-items-center rounded-lg border-2 border-border bg-card"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </button>
          <h1 className="text-xl font-extrabold">Checklist de accesibilidad</h1>
        </div>

        <p className="mt-3 text-base text-muted-foreground">
          Ajusta cada opción a tu gusto y confírmala. Verás un ejemplo antes de iniciar el recorrido.
        </p>

        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={completed}
          aria-label={`${completed} de ${total} verificaciones completadas`}
          className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full bg-primary transition-[width]"
            style={{ width: `${(completed / total) * 100}%` }}
          />
        </div>
        <p className="mt-1 text-sm font-semibold text-foreground">
          {completed} de {total} verificados
        </p>

        {/* Contraste */}
        <Card
          icon={<Contrast className="h-6 w-6" aria-hidden />}
          title="Contraste alto"
          desc="Aumenta el contraste de los colores para mayor legibilidad."
          done={confirmed.contrast}
        >
          <button
            type="button"
            onClick={toggleHighContrast}
            aria-pressed={highContrast}
            className={`h-12 flex-1 rounded-lg border-2 px-3 font-bold ${
              highContrast
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card"
            }`}
          >
            {highContrast ? "Activado" : "Activar"}
          </button>
          <Sample>
            <p className="text-base font-semibold text-foreground">Texto de ejemplo</p>
            <p className="text-sm text-muted-foreground">¿Lees todo con claridad?</p>
          </Sample>
          <ConfirmButton
            checked={confirmed.contrast}
            onToggle={() => setConfirmed((c) => ({ ...c, contrast: !c.contrast }))}
            label="Confirmo que el contraste es adecuado"
          />
        </Card>

        {/* Fuente */}
        <Card
          icon={<Type className="h-6 w-6" aria-hidden />}
          title="Tamaño de fuente"
          desc="Elige el tamaño que más te acomode."
          done={confirmed.font}
        >
          <div role="group" aria-label="Tamaño de fuente" className="flex w-full gap-2">
            {(["normal", "grande", "muy-grande"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFontSize(s)}
                aria-pressed={fontSize === s}
                className={`h-12 flex-1 rounded-lg border-2 text-sm font-bold ${
                  fontSize === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card"
                }`}
              >
                {s === "normal" ? "Normal" : s === "grande" ? "Grande" : "Muy grande"}
              </button>
            ))}
          </div>
          <Sample>
            <p className="text-foreground">
              Texto de muestra a este tamaño. ¿Lo lees cómodamente?
            </p>
          </Sample>
          <ConfirmButton
            checked={confirmed.font}
            onToggle={() => setConfirmed((c) => ({ ...c, font: !c.font }))}
            label="Confirmo el tamaño de texto"
          />
        </Card>

        {/* Reducción de movimiento */}
        <Card
          icon={<Zap className="h-6 w-6" aria-hidden />}
          title="Reducir movimiento"
          desc="Desactiva animaciones y transiciones."
          done={confirmed.motion}
        >
          <button
            type="button"
            onClick={toggleReduceMotion}
            aria-pressed={reduceMotion}
            className={`h-12 flex-1 rounded-lg border-2 px-3 font-bold ${
              reduceMotion
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card"
            }`}
          >
            {reduceMotion ? "Activado" : "Activar"}
          </button>
          <Sample>
            <div className="flex items-center gap-3">
              <span className="motion-demo grid h-10 w-10 place-items-center rounded-full bg-secondary text-secondary-foreground">
                <Eye className="h-5 w-5" aria-hidden />
              </span>
              <p className="text-sm">
                {reduceMotion
                  ? "Sin animación: el ícono permanece quieto."
                  : "Con animación: el ícono pulsa."}
              </p>
            </div>
          </Sample>
          <ConfirmButton
            checked={confirmed.motion}
            onToggle={() => setConfirmed((c) => ({ ...c, motion: !c.motion }))}
            label="Confirmo la opción de movimiento"
          />
        </Card>

        {/* Lectura fácil */}
        <Card
          icon={<Wand2 className="h-6 w-6" aria-hidden />}
          title="Lectura fácil"
          desc="Texto simplificado para comprensión más sencilla."
          done={confirmed.easy}
        >
          <button
            type="button"
            onClick={() => {
              setEasyPreview((v) => !v);
              speak(!easyPreview ? SAMPLE_EASY : SAMPLE_FULL);
            }}
            aria-pressed={easyPreview}
            className={`h-12 flex-1 rounded-lg border-2 px-3 font-bold ${
              easyPreview
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card"
            }`}
          >
            {easyPreview ? "Vista fácil activada" : "Previsualizar lectura fácil"}
          </button>
          <Sample>
            <p className={`text-foreground ${easyPreview ? "text-lg font-semibold" : ""}`}>
              {easyPreview ? SAMPLE_EASY : SAMPLE_FULL}
            </p>
          </Sample>
          <ConfirmButton
            checked={confirmed.easy}
            onToggle={() => setConfirmed((c) => ({ ...c, easy: !c.easy }))}
            label="Entiendo cómo activar lectura fácil"
          />
        </Card>

        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          disabled={!allDone}
          className="mt-8 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-base font-bold text-primary-foreground disabled:opacity-50"
        >
          {allDone ? "Continuar al inicio" : `Completa ${total - completed} ${total - completed === 1 ? "verificación" : "verificaciones"} más`}
        </button>
      </section>

      <style>{`
        @keyframes motion-demo { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }
        .motion-demo { animation: motion-demo 1.2s ease-in-out infinite; }
        .reduce-motion .motion-demo { animation: none; }
      `}</style>
    </AppShell>
  );
}

function Card({
  icon,
  title,
  desc,
  done,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <article
      className={`mt-4 rounded-2xl border-2 p-4 ${
        done ? "border-success bg-success/5" : "border-border bg-card"
      }`}
    >
      <header className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        <div className="flex-1">
          <h2 className="text-base font-bold">{title}</h2>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
        {done && (
          <span
            aria-label="Verificado"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-success text-success-foreground"
          >
            <Check className="h-5 w-5" aria-hidden />
          </span>
        )}
      </header>
      <div className="mt-3 flex flex-col gap-3">{children}</div>
    </article>
  );
}

function Sample({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border-2 border-dashed border-border bg-background p-3">
      {children}
    </div>
  );
}

function ConfirmButton({
  checked,
  onToggle,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      className={`flex min-h-12 items-center justify-center gap-2 rounded-lg border-2 px-3 text-sm font-bold ${
        checked
          ? "border-success bg-success text-success-foreground"
          : "border-border bg-card text-foreground"
      }`}
    >
      {checked ? <Check className="h-5 w-5" aria-hidden /> : <X className="h-5 w-5" aria-hidden />}
      {label}
    </button>
  );
}
