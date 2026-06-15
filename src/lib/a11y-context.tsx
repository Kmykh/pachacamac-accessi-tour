import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type FontSize = "normal" | "grande" | "muy-grande";

type Ctx = {
  highContrast: boolean;
  toggleHighContrast: () => void;
  fontSize: FontSize;
  setFontSize: (s: FontSize) => void;
  reduceMotion: boolean;
  toggleReduceMotion: () => void;
  downloaded: boolean;
  setDownloaded: (v: boolean) => void;
};

const A11yContext = createContext<Ctx | null>(null);

const FONT_SCALE: Record<FontSize, number> = {
  normal: 1,
  grande: 1.15,
  "muy-grande": 1.3,
};

export function A11yProvider({ children }: { children: ReactNode }) {
  const [highContrast, setHC] = useState(false);
  const [fontSize, setFS] = useState<FontSize>("normal");
  const [reduceMotion, setRM] = useState(false);
  const [downloaded, setDl] = useState(false);

  // hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("accessitour:a11y");
      if (raw) {
        const v = JSON.parse(raw);
        if (typeof v.highContrast === "boolean") setHC(v.highContrast);
        if (v.fontSize) setFS(v.fontSize);
        if (typeof v.reduceMotion === "boolean") setRM(v.reduceMotion);
      }
      setDl(localStorage.getItem("accessitour:downloaded") === "1");
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "accessitour:a11y",
        JSON.stringify({ highContrast, fontSize, reduceMotion }),
      );
    } catch {}
    const root = document.documentElement;
    root.classList.toggle("hc", highContrast);
    root.classList.toggle("reduce-motion", reduceMotion);
    root.style.setProperty("--font-scale", String(FONT_SCALE[fontSize]));
  }, [highContrast, fontSize, reduceMotion]);

  useEffect(() => {
    try {
      localStorage.setItem("accessitour:downloaded", downloaded ? "1" : "0");
    } catch {}
  }, [downloaded]);

  return (
    <A11yContext.Provider
      value={{
        highContrast,
        toggleHighContrast: () => setHC((v) => !v),
        fontSize,
        setFontSize: setFS,
        reduceMotion,
        toggleReduceMotion: () => setRM((v) => !v),
        downloaded,
        setDownloaded: setDl,
      }}
    >
      {children}
    </A11yContext.Provider>
  );
}

export function useA11y() {
  const ctx = useContext(A11yContext);
  if (!ctx) throw new Error("useA11y must be used inside A11yProvider");
  return ctx;
}
