/**
 * Genera los audios de la audioguía con ElevenLabs (Text-to-Speech) y los
 * guarda en public/audio/. Se ejecuta UNA sola vez (o cuando cambie el texto),
 * así no gastas créditos en cada visita y la app funciona offline.
 *
 * Uso:
 *   1. Pon tu API key en .env:   ELEVENLABS_API_KEY=sk_...
 *      (opcional)                ELEVENLABS_VOICE_ID=<id de la voz>
 *   2. npm run audio
 *
 *   Para regenerar todo aunque ya existan los .mp3:  FORCE=1 npm run audio
 *
 * Tono: voz calmada y pausada (pausas reales con <break/>), pensada para una
 * persona con discapacidad visual.
 */
import process from "node:process";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { POINTS } from "../src/lib/points";
import { BEACON_LINES } from "../src/lib/narration-content";

// Cargar variables de .env (Node 20.12+).
try {
  process.loadEnvFile(path.resolve(".env"));
} catch {
  // sin .env: dependemos de las variables ya presentes en el entorno
}

const API_KEY = process.env.ELEVENLABS_API_KEY;
// Voz por defecto (multilingüe, sirve para español). Cámbiala con ELEVENLABS_VOICE_ID.
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? "EXAVITQu4vr4xnSDxMaL";
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID ?? "eleven_multilingual_v2";
const FORCE = process.env.FORCE === "1" || process.argv.includes("--force");

const OUT_DIR = path.resolve("public", "audio");

// Ajustes de voz para un tono sereno: estabilidad alta = entonación calmada.
const VOICE_SETTINGS = {
  stability: 0.65,
  similarity_boost: 0.8,
  style: 0.0,
  use_speaker_boost: true,
};

/** Inserta pausas reales entre frases para un ritmo tranquilo. */
function withPauses(text: string, breakSec = 0.7): string {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .join(` <break time="${breakSec}s" /> `);
}

async function tts(text: string, outPath: string) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY as string,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        voice_settings: VOICE_SETTINGS,
      }),
    },
  );
  if (!res.ok) {
    throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(outPath, buf);
}

type Job = { name: string; text: string };

function buildJobs(): Job[] {
  const jobs: Job[] = [];

  // Audio de cada punto: versión completa y versión de lectura fácil.
  for (const p of POINTS) {
    const intro = `${p.name}. <break time="0.9s" /> `;
    jobs.push({ name: `punto-${p.id}-full`, text: intro + withPauses(p.full) });
    jobs.push({ name: `punto-${p.id}-easy`, text: intro + withPauses(p.easy, 0.9) });
  }

  // Audio de cada fase de conexión del beacon (compartido por todos los puntos).
  for (const [phase, line] of Object.entries(BEACON_LINES)) {
    jobs.push({ name: `beacon-${phase}`, text: withPauses(line, 0.5) });
  }

  return jobs;
}

async function main() {
  if (!API_KEY) {
    console.error(
      "✗ Falta ELEVENLABS_API_KEY. Crea un archivo .env con:\n  ELEVENLABS_API_KEY=sk_tu_key_aqui",
    );
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });
  const jobs = buildJobs();
  console.log(`Voz: ${VOICE_ID} · modelo: ${MODEL_ID} · ${jobs.length} audios\n`);

  let made = 0;
  let skipped = 0;
  for (const job of jobs) {
    const outPath = path.join(OUT_DIR, `${job.name}.mp3`);
    if (!FORCE && existsSync(outPath)) {
      console.log(`• ${job.name}.mp3 (ya existe, omitido)`);
      skipped++;
      continue;
    }
    process.stdout.write(`• ${job.name}.mp3 … `);
    await tts(job.text, outPath);
    console.log("✓");
    made++;
    // pequeña pausa para ser amables con el límite de peticiones
    await new Promise((r) => setTimeout(r, 350));
  }

  console.log(
    `\nListo. Generados: ${made} · Omitidos: ${skipped}. Archivos en public/audio/`,
  );
  if (made > 0) {
    console.log(
      "Nota: el plan gratuito de ElevenLabs requiere atribución (uso no comercial).",
    );
  }
}

main().catch((err) => {
  console.error("\n✗ Error:", err.message ?? err);
  process.exit(1);
});
