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

/**
 * Sube/baja el volumen de un <audio> de forma gradual (fundido) para que el
 * audio no arranque ni termine de golpe. Devuelve una función para cancelar.
 */
export function fadeAudio(audio: HTMLAudioElement, to: number, ms: number) {
  const steps = Math.max(1, Math.round(ms / 40));
  const from = audio.volume;
  const delta = (to - from) / steps;
  let i = 0;
  const id = setInterval(() => {
    i += 1;
    audio.volume = Math.max(0, Math.min(1, from + delta * i));
    if (i >= steps) clearInterval(id);
  }, 40);
  return () => clearInterval(id);
}

const FADE_MS = 450; // duración del fundido de entrada/salida

let current: HTMLAudioElement | null = null;

/**
 * Reproduce un audio una sola vez (sin controles). Si el archivo falla,
 * recurre a la voz del navegador con el texto plano de respaldo.
 */
export function narrateOnce(
  src: string,
  fallbackText: string,
  opts?: { rate?: number; onEnd?: () => void },
) {
  if (typeof window === "undefined") {
    opts?.onEnd?.();
    return;
  }
  stopNarration();

  const rate = opts?.rate ?? 0.9;
  let ended = false;
  const finish = () => {
    if (ended) return;
    ended = true;
    opts?.onEnd?.();
  };

  let usedFallback = false;
  const fallback = () => {
    if (usedFallback) return;
    usedFallback = true;
    if (current === audio) current = null;
    // El respaldo por voz también avisa al terminar.
    speak(fallbackText, { rate, onEnd: finish });
  };

  const audio = new Audio(src);
  audio.playbackRate = rate;
  audio.volume = 0;
  audio.onerror = fallback;
  audio.onended = finish;
  let fadedOut = false;
  audio.ontimeupdate = () => {
    if (!audio.duration) return;
    // fundido de salida en los últimos ~0.45 s
    if (audio.duration - audio.currentTime <= FADE_MS / 1000 && !fadedOut) {
      fadedOut = true;
      fadeAudio(audio, 0, FADE_MS);
    }
  };
  current = audio;
  audio
    .play()
    .then(() => fadeAudio(audio, 1, FADE_MS)) // fundido de entrada
    .catch(fallback);
}

/** Detiene cualquier narración en curso (archivo o voz del navegador). */
export function stopNarration() {
  stopSpeak();
  if (current) {
    current.pause();
    current.onerror = null;
    current.onended = null;
    current.ontimeupdate = null;
    current = null;
  }
}
