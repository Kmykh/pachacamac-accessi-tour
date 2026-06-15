// Texto de narración compartido entre la app (reproducción / respaldo por voz)
// y el script de generación de audio (scripts/generate-audio.ts).
//
// Mantener AQUÍ las frases de los beacons evita duplicarlas: el script las
// convierte en .mp3 (con pausas) y la app las usa como respaldo hablado.
//
// Tono: calmado, amable y sin prisa — pensado para una persona con
// discapacidad visual que escucha mientras camina.

export type BeaconPhase = "scanning" | "weak" | "medium" | "strong" | "connected";

/** Frases en texto plano (sin etiquetas) para mostrar y para el respaldo TTS. */
export const BEACON_LINES: Record<BeaconPhase, string> = {
  scanning: "Estamos buscando el punto más cercano. Tómate tu tiempo, no hay prisa.",
  weak: "Vamos acercándonos. Sigue caminando con calma.",
  medium: "Muy bien. Ya casi llegamos.",
  strong: "Estás muy cerca. Un paso más.",
  connected: "Listo, te has conectado. Ahora comienza tu audioguía.",
};

/** Etiqueta corta y amable para mostrar en pantalla durante cada fase. */
export const BEACON_LABELS: Record<BeaconPhase, string> = {
  scanning: "Buscando el punto más cercano…",
  weak: "Acércate con calma al punto",
  medium: "Muy bien, sigue avanzando",
  strong: "Estás muy cerca",
  connected: "Conectado ✓ — empieza tu audioguía",
};
