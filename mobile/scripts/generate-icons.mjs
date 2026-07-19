import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const mobileRoot = join(__dirname, "..");
const repoRoot = join(mobileRoot, "..");

const ICON_SOURCES = [
  join(repoRoot, "public", "favicon.png"),
  join(repoRoot, "logos", "logos", "flavicon app rouge.png"),
  join(repoRoot, "logos", "logos", "flavicon app.png"),
];

const iconSrc = ICON_SOURCES.find((p) => existsSync(p));
if (!iconSrc) {
  console.error("Aucune icône CAPO trouvée (public/favicon.png ou logos/)");
  process.exit(1);
}

const wwwIcon = join(mobileRoot, "www", "icon.png");
copyFileSync(iconSrc, wwwIcon);
console.log("Icône source:", iconSrc);

const androidRes = join(mobileRoot, "android", "app", "src", "main", "res");
if (!existsSync(androidRes)) {
  console.log("Dossier android/res absent — icône www seulement");
  process.exit(0);
}

const densities = ["mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi"];

for (const density of densities) {
  const dir = join(androidRes, `mipmap-${density}`);
  mkdirSync(dir, { recursive: true });
  for (const name of [
    "ic_launcher.png",
    "ic_launcher_round.png",
    "ic_launcher_foreground.png",
  ]) {
    copyFileSync(iconSrc, join(dir, name));
  }
}

// Fond sombre CAPO pour icône adaptive Android 8+
const valuesDir = join(androidRes, "values");
mkdirSync(valuesDir, { recursive: true });
writeFileSync(
  join(valuesDir, "ic_launcher_background.xml"),
  `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#201E1D</color>
</resources>
`
);

console.log("Icônes Android mipmap-* mises à jour (launcher + foreground).");
