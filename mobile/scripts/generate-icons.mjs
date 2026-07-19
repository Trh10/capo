import sharp from "sharp";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
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

// Logo recadré (sans grandes marges noires)
const trimmedLogo = await sharp(iconSrc)
  .trim({ threshold: 15 })
  .png()
  .toBuffer();

console.log("Source icône:", iconSrc);

/** Zone sûre adaptive icon Android : ~66 % du centre → logo à ~50 % max */
const ADAPTIVE_LOGO_RATIO = 0.5;
/** Icône legacy carrée : un peu plus grand */
const LEGACY_LOGO_RATIO = 0.82;
const BG_COLOR = "#000000";

async function writeLegacyIcon(outputPath, canvasSize) {
  const logoSize = Math.round(canvasSize * LEGACY_LOGO_RATIO);
  const logo = await sharp(trimmedLogo)
    .resize(logoSize, logoSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: canvasSize,
      height: canvasSize,
      channels: 4,
      background: BG_COLOR,
    },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(outputPath);
}

async function writeAdaptiveForeground(outputPath, canvasSize) {
  const logoSize = Math.round(canvasSize * ADAPTIVE_LOGO_RATIO);
  const logo = await sharp(trimmedLogo)
    .resize(logoSize, logoSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: canvasSize,
      height: canvasSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(outputPath);
}

// Icône web Capacitor
const wwwIcon = join(mobileRoot, "www", "icon.png");
await writeLegacyIcon(wwwIcon, 512);

const LAUNCHER_SIZES = {
  mdpi: 48,
  hdpi: 72,
  xhdpi: 96,
  xxhdpi: 144,
  xxxhdpi: 192,
};

const FOREGROUND_SIZES = {
  mdpi: 108,
  hdpi: 162,
  xhdpi: 216,
  xxhdpi: 324,
  xxxhdpi: 432,
};

for (const [density, size] of Object.entries(LAUNCHER_SIZES)) {
  const dir = join(androidRes, `mipmap-${density}`);
  mkdirSync(dir, { recursive: true });
  await writeLegacyIcon(join(dir, "ic_launcher.png"), size);
  await writeLegacyIcon(join(dir, "ic_launcher_round.png"), size);
  await writeAdaptiveForeground(
    join(dir, "ic_launcher_foreground.png"),
    FOREGROUND_SIZES[density]
  );
}

const vectorForeground = join(
  androidRes,
  "drawable-v24",
  "ic_launcher_foreground.xml"
);
if (existsSync(vectorForeground)) {
  rmSync(vectorForeground);
}

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
    <color name="ic_launcher_background">#000000</color>
</resources>
`
);

// Splash
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
  const height = folder.includes("land")
    ? Math.round(width * 0.625)
    : Math.round(width * 1.778);
  const logoSize = Math.round(Math.min(width, height) * 0.28);
  const logo = await sharp(trimmedLogo)
    .resize(logoSize, logoSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: "#F8F4F4",
    },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(join(dir, "splash.png"));
}

console.log(
  "Icônes CAPO générées avec marge safe-zone (50 % adaptive, 82 % legacy)."
);
