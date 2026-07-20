import { copyFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const mobileRoot = join(__dirname, "..");
const dest = join(mobileRoot, "www", "splash.mp4");

const sources = [
  process.env.CAPO_SPLASH_VIDEO,
  join(process.env.USERPROFILE || "", "Downloads", "Retrait Fmonie agent.mp4"),
  join(mobileRoot, "assets", "splash.mp4"),
].filter(Boolean);

if (existsSync(dest)) {
  console.log("splash.mp4 déjà présent dans www/");
  process.exit(0);
}

for (const src of sources) {
  if (src && existsSync(src)) {
    copyFileSync(src, dest);
    console.log("Vidéo intro copiée → www/splash.mp4");
    process.exit(0);
  }
}

console.warn(
  "Aucune vidéo splash trouvée. Placez splash.mp4 dans mobile/www/ ou définissez CAPO_SPLASH_VIDEO."
);
