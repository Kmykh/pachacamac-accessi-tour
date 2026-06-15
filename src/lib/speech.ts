export function speak(
  text: string,
  opts?: { rate?: number; lang?: string; onEnd?: () => void },
) {
  if (typeof window === "undefined") return;
  if (!("speechSynthesis" in window)) {
    // fallback so callers can still chain something
    if (opts?.onEnd) setTimeout(opts.onEnd, Math.min(8000, text.length * 60));
    return;
  }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = opts?.lang ?? "es-PE";
  u.rate = opts?.rate ?? 1;
  if (opts?.onEnd) u.onend = () => opts.onEnd?.();
  window.speechSynthesis.speak(u);
}

export function stopSpeak() {
  if (typeof window === "undefined") return;
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}

// ---- Reconocimiento de voz (para valorar hablando) ----

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: { results: { 0: { 0: { transcript: string } } } }) => void) | null;
  onerror: (() => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition || w.webkitSpeechRecognition || null) as
    | (new () => SpeechRecognitionLike)
    | null;
}

export function speechRecognitionSupported(): boolean {
  return getRecognitionCtor() !== null;
}

/**
 * Escucha una frase del usuario y devuelve el texto reconocido. Si el navegador
 * no soporta reconocimiento de voz, llama a onError.
 */
export function listen(opts: {
  lang?: string;
  onResult: (transcript: string) => void;
  onError?: () => void;
  onStart?: () => void;
  onEnd?: () => void;
}): SpeechRecognitionLike | null {
  const Ctor = getRecognitionCtor();
  if (!Ctor) {
    opts.onError?.();
    return null;
  }
  const rec = new Ctor();
  rec.lang = opts.lang ?? "es-PE";
  rec.interimResults = false;
  rec.maxAlternatives = 3;
  rec.onstart = () => opts.onStart?.();
  rec.onend = () => opts.onEnd?.();
  rec.onerror = () => opts.onError?.();
  rec.onresult = (e) => opts.onResult(e.results[0][0].transcript);
  rec.start();
  return rec;
}
