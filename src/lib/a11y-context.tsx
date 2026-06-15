import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type FontSize = "normal" | "grande" | "muy-grande";
export type Profile = "none" | "visual" | "auditiva" | "cognitiva" | "motora";
export type AdvanceMode = "speech-end" | "next-only";

type Ctx = {
  highContrast: boolean;
  toggleHighContrast: () => void;
  fontSize: FontSize;
  setFontSize: (s: FontSize) => void;
  reduceMotion: boolean;
  toggleReduceMotion: () => void;
  downloaded: boolean;
  setDownloaded: (v: boolean) => void;
  profile: Profile;
  setProfile: (p: Profile) => void;
  voiceFirst: boolean;
  setVoiceFirst: (v: boolean) => void;
  easyReading: boolean;
  setEasyReading: (v: boolean) => void;
  advanceMode: AdvanceMode;
  setAdvanceMode: (m: AdvanceMode) => void;
  /** null = el usuario aún no eligió; true/false = guía con/sin audio. */
  audioGuide: boolean | null;
  setAudioGuide: (v: boolean) => void;
};

const A11yContext = createContext<Ctx | null>(null);

const FONT_SCALE: Record<FontSize, number> = {
  normal: 1,
  grande: 1.15,
  "muy-grande": 1.3,
};

export const PROFILE_LABEL: Record<Profile, string> = {
  none: "Sin perfil",
  visual: "Visual (ceguera / baja visión)",
  auditiva: "Auditiva (sordera / hipoacusia)",
  cognitiva: "Cognitiva (lectura fácil)",
  motora: "Motora (movilidad reducida)",
};

export function A11yProvider({ children }: { children: ReactNode }) {
  const [highContrast, setHC] = useState(false);
  const [fontSize, setFS] = useState<FontSize>("normal");
  const [reduceMotion, setRM] = useState(false);
  const [downloaded, setDl] = useState(false);
  const [profile, setProfileState] = useState<Profile>("none");
  const [voiceFirst, setVF] = useState(false);
  const [easyReading, setER] = useState(false);
  const [advanceMode, setAM] = useState<AdvanceMode>("speech-end");
  const [audioGuide, setAG] = useState<boolean | null>(null);

  // hydrate
  useEffect(() => {
    try {
      const raw = localStorage.getItem("accessitour:a11y");
      if (raw) {
        const v = JSON.parse(raw);
        if (typeof v.highContrast === "boolean") setHC(v.highContrast);
        if (v.fontSize) setFS(v.fontSize);
        if (typeof v.reduceMotion === "boolean") setRM(v.reduceMotion);
        if (v.profile) setProfileState(v.profile);
        if (typeof v.voiceFirst === "boolean") setVF(v.voiceFirst);
        if (typeof v.easyReading === "boolean") setER(v.easyReading);
        if (v.advanceMode) setAM(v.advanceMode);
        if (typeof v.audioGuide === "boolean") setAG(v.audioGuide);
      }
      setDl(localStorage.getItem("accessitour:downloaded") === "1");
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "accessitour:a11y",
        JSON.stringify({ highContrast, fontSize, reduceMotion, profile, voiceFirst, easyReading, advanceMode, audioGuide }),
      );
    } catch {}
    const root = document.documentElement;
    root.classList.toggle("hc", highContrast);
    root.classList.toggle("reduce-motion", reduceMotion);
    root.style.setProperty("--font-scale", String(FONT_SCALE[fontSize]));
  }, [highContrast, fontSize, reduceMotion, profile, voiceFirst, easyReading, advanceMode, audioGuide]);

  // La elección explícita de audio (con/sin) controla la guía automática.
  const setAudioGuide = (v: boolean) => {
    setAG(v);
    setVF(v);
  };

  useEffect(() => {
    try {
      localStorage.setItem("accessitour:downloaded", downloaded ? "1" : "0");
    } catch {}
  }, [downloaded]);

  // Aplicar preset según perfil de discapacidad
  const setProfile = (p: Profile) => {
    setProfileState(p);
    let presetVoice = false;
    if (p === "visual") {
      presetVoice = true;
      setFS("grande");
      setER(false);
      setAM("speech-end");
      setRM(true);
      setHC(true); // baja visión: alto contraste por defecto (WCAG)
    } else if (p === "auditiva") {
      presetVoice = false;
      setFS("normal");
      setER(false);
      setAM("next-only");
    } else if (p === "cognitiva") {
      presetVoice = false;
      setER(true);
      setFS("grande");
      setAM("next-only");
      setRM(true);
    } else if (p === "motora") {
      presetVoice = false;
      setFS("grande");
      setAM("speech-end");
    }
    // Si el usuario ya eligió audio sí/no, su elección manda sobre el preset.
    setVF(audioGuide ?? presetVoice);
  };

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
        profile,
        setProfile,
        voiceFirst,
        setVoiceFirst: setVF,
        easyReading,
        setEasyReading: setER,
        advanceMode,
        setAdvanceMode: setAM,
        audioGuide,
        setAudioGuide,
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
