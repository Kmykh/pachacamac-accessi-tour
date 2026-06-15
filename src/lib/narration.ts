// Reproducción de audio pregenerado (ElevenLabs) con respaldo a la voz del
// navegador (Web Speech API) si el .mp3 no existe o el navegador bloquea el
// autoplay. Así la app funciona aunque todavía no se hayan generado los audios.

import { speak, stopSpeak } from "./speech";
import type { BeaconPhase } from "./narration-content";

/** URL del audio de un punto. Convención: /audio/punto-<id>-<full|easy>.mp3 */
export function pointAudioSrc(id: string, easy: boolean): string {
  return `/audio/punto-${id}-${easy ? "easy" : "full"}.mp3`;
}

/** URL del audio de una fase de conexión del beacon. */
export function beaconAudioSrc(phase: BeaconPhase): string {
  return `/audio/beacon-${phase}.mp3`;
}

let current: HTMLAudioElement | null = null;

/**
 * Reproduce un audio una sola vez (sin controles). Si el archivo falla,
 * recurre a la voz del navegador con el texto plano de respaldo.
 */
export function narrateOnce(
  src: string,
  fallbackText: string,
  opts?: { rate?: number },
) {
  if (typeof window === "undefined") return;
  stopNarration();

  const rate = opts?.rate ?? 0.9;
  let usedFallback = false;
  const fallback = () => {
    if (usedFallback) return;
    usedFallback = true;
    if (current === audio) current = null;
    speak(fallbackText, { rate });
  };

  const audio = new Audio(src);
  audio.playbackRate = rate;
  audio.onerror = fallback;
  current = audio;
  audio.play().catch(fallback);
}

/** Detiene cualquier narración en curso (archivo o voz del navegador). */
export function stopNarration() {
  stopSpeak();
  if (current) {
    current.pause();
    current.onerror = null;
    current = null;
  }
}
