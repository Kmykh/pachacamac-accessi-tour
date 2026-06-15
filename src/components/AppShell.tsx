import type { ReactNode } from "react";
import { useA11y } from "@/lib/a11y-context";
import { Contrast, Type } from "lucide-react";

export function AppShell({ children }: { children: ReactNode }) {
  const { highContrast, toggleHighContrast, fontSize, setFontSize } = useA11y();

  const cycleFont = () => {
    const order: Array<"normal" | "grande" | "muy-grande"> = [
      "normal",
      "grande",
      "muy-grande",
    ];
    const i = order.indexOf(fontSize);
    setFontSize(order[(i + 1) % order.length]);
  };

  const fontLabel =
    fontSize === "normal" ? "A" : fontSize === "grande" ? "A+" : "A++";

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-background text-foreground">
      <a href="#main" className="skip-link">
        Saltar al contenido
      </a>
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <span className="text-base font-bold tracking-tight text-primary">
          AccessiTour
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={cycleFont}
            aria-label={`Tamaño de texto: ${fontSize}. Tocar para cambiar.`}
            className="flex h-11 min-w-11 items-center justify-center rounded-lg border-2 border-border bg-card px-2 text-sm font-bold text-foreground"
          >
            <Type className="mr-1 h-4 w-4" aria-hidden />
            {fontLabel}
          </button>
          <button
            type="button"
            onClick={toggleHighContrast}
            aria-label="Alternar alto contraste"
            aria-pressed={highContrast}
            className="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-border bg-card text-foreground"
          >
            <Contrast className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </header>
      <main id="main" className="flex-1">
        {children}
      </main>
    </div>
  );
}
