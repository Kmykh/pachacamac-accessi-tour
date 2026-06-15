import { useCallback, useEffect, useRef, useState } from "react";
import { speak, stopSpeak } from "@/lib/speech";

// Reproductor de audioguía con controles. Prefiere el .mp3 pregenerado
// (progreso y duración reales, pausa real, control de velocidad por
// playbackRate). Si el archivo no existe o el autoplay se bloquea, recurre a
// la voz del navegador estimando el progreso por longitud del texto.

type PlayOpts = {
  /** URL del .mp3 a reproducir. */
  src: string;
  /** Texto de respaldo si el .mp3 no está disponible. */
  text: string;
  /** Velocidad (1 = natural; <1 = más calmado). */
  rate?: number;
  /** Se llama al terminar la reproducción. */
  onEnd?: () => void;
};

export function useNarrator() {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..100
  const [duration, setDuration] = useState(0); // segundos (0 = desconocido)
  const [currentTime, setCurrentTime] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onEndRef = useRef<(() => void) | null>(null);
  const rafRef = useRef<number | null>(null);
  const ttsStart = useRef(0);
  const ttsDur = useRef(0);

  const cancelRaf = () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  const stop = useCallback(() => {
    stopSpeak();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.ontimeupdate = null;
      audioRef.current = null;
    }
    cancelRaf();
    setPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  }, []);

  const play = useCallback(
    (opts: PlayOpts) => {
      stop();
      const rate = opts.rate ?? 1;
      onEndRef.current = opts.onEnd ?? null;

      const finish = () => {
        setPlaying(false);
        setProgress(100);
        cancelRaf();
        onEndRef.current?.();
      };

      // Respaldo: voz del navegador con progreso estimado.
      const startTts = () => {
        const dur = Math.max(6, opts.text.length / (12 * rate));
        ttsDur.current = dur;
        ttsStart.current = performance.now();
        setDuration(dur);
        setPlaying(true);
        speak(opts.text, { rate, onEnd: finish });
        const tick = () => {
          const elapsed = (performance.now() - ttsStart.current) / 1000;
          const pct = Math.min(100, (elapsed / ttsDur.current) * 100);
          setProgress(pct);
          setCurrentTime(Math.min(ttsDur.current, elapsed));
          if (pct < 100) rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      };

      let usedFallback = false;
      const fallback = () => {
        if (usedFallback) return;
        usedFallback = true;
        audioRef.current = null;
        startTts();
      };

      const audio = new Audio(opts.src);
      audio.playbackRate = rate;
      audioRef.current = audio;
      audio.onerror = fallback;
      audio.onloadedmetadata = () => {
        if (Number.isFinite(audio.duration)) setDuration(audio.duration);
      };
      audio.ontimeupdate = () => {
        if (!audio.duration) return;
        setCurrentTime(audio.currentTime);
        setProgress((audio.currentTime / audio.duration) * 100);
      };
      audio.onended = finish;
      audio.play().then(() => setPlaying(true)).catch(fallback);
    },
    [stop],
  );

  useEffect(() => () => stop(), [stop]);

  return { playing, progress, duration, currentTime, play, stop };
}
