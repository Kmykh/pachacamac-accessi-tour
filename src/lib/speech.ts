export function speak(text: string, opts?: { rate?: number; lang?: string }) {
  if (typeof window === "undefined") return;
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = opts?.lang ?? "es-PE";
  u.rate = opts?.rate ?? 1;
  window.speechSynthesis.speak(u);
}

export function stopSpeak() {
  if (typeof window === "undefined") return;
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}
