import sharp from "sharp";
import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
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
  console.error("Aucune icône CAPO trouvée");
  process.exit(1);
}

const androidRes = join(mobileRoot, "android", "app", "src", "main", "res");
if (!existsSync(androidRes)) {
  console.error("Dossier android/res absent — lancez: npx cap add android");
  process.exit(1);
}

console.log("Source icône:", iconSrc);

// Icône web Capacitor
const wwwIcon = join(mobileRoot, "www", "icon.png");
await sharp(iconSrc).resize(512, 512, { fit: "contain", background: "#201E1D" }).png().toFile(wwwIcon);

// Tailles legacy Android (utilisées si pas d'adaptive icon)
const LAUNCHER_SIZES = {
  mdpi: 48,
  hdpi: 72,
  xhdpi: 96,
  xxhdpi: 144,
  xxxhdpi: 192,
};

// Tailles adaptive foreground (Android 8+)
const FOREGROUND_SIZES = {
  mdpi: 108,
  hdpi: 162,
  xhdpi: 216,
  xxhdpi: 324,
  xxxhdpi: 432,
};

async function writeIcon(outputPath, size) {
  await sharp(iconSrc)
    .resize(size, size, { fit: "contain", background: "#201E1D" })
    .png()
    .toFile(outputPath);
}

for (const [density, size] of Object.entries(LAUNCHER_SIZES)) {
  const dir = join(androidRes, `mipmap-${density}`);
  mkdirSync(dir, { recursive: true });
  await writeIcon(join(dir, "ic_launcher.png"), size);
  await writeIcon(join(dir, "ic_launcher_round.png"), size);
  const fgSize = FOREGROUND_SIZES[density];
  await writeIcon(join(dir, "ic_launcher_foreground.png"), fgSize);
}

// Supprimer l'icône vectorielle Capacitor (X bleu) qui prend le dessus
const vectorForeground = join(androidRes, "drawable-v24", "ic_launcher_foreground.xml");
if (existsSync(vectorForeground)) {
  rmSync(vectorForeground);
  console.log("Supprimé: drawable-v24/ic_launcher_foreground.xml");
}

// Adaptive icon : logo CAPO sur fond sombre
const anydpiDir = join(androidRes, "mipmap-anydpi-v26");
mkdirSync(anydpiDir, { recursive: true });
writeFileSync(
  join(anydpiDir, "ic_launcher.xml"),
  `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`
);
writeFileSync(
  join(anydpiDir, "ic_launcher_round.xml"),
  `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`
);

writeFileSync(
  join(androidRes, "values", "ic_launcher_background.xml"),
  `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#201E1D</color>
</resources>
`
);

// Splash CAPO
const SPLASH_SIZES = {
  "drawable-port-mdpi": 320,
  "drawable-port-hdpi": 480,
  "drawable-port-xhdpi": 720,
  "drawable-port-xxhdpi": 960,
  "drawable-port-xxxhdpi": 1280,
  "drawable-land-mdpi": 320,
  "drawable-land-hdpi": 480,
  "drawable-land-xhdpi": 720,
  "drawable-land-xxhdpi": 960,
  "drawable-land-xxxhdpi": 1280,
  drawable: 480,
};

for (const [folder, width] of Object.entries(SPLASH_SIZES)) {
  const dir = join(androidRes, folder);
  mkdirSync(dir, { recursive: true });
  const logoSize = Math.round(width * 0.35);
  const splash = sharp({
    create: {
      width,
      height: folder.includes("land") ? Math.round(width * 0.625) : Math.round(width * 1.778),
      channels: 4,
      background: "#F8F4F4",
    },
  });
  const logo = await sharp(iconSrc)
    .resize(logoSize, logoSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await splash
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(join(dir, "splash.png"));
}

console.log("Icônes CAPO générées (tailles Android correctes).");
