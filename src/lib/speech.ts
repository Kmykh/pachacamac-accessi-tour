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
