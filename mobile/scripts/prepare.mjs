import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const mobileRoot = join(__dirname, "..");
const repoRoot = join(mobileRoot, "..");

const iconSrc = join(repoRoot, "logos", "logos", "flavicon app.png");
const iconDst = join(mobileRoot, "www", "icon.png");

if (existsSync(iconSrc)) {
  copyFileSync(iconSrc, iconDst);
  console.log("Icône copiée vers mobile/www/icon.png");
} else {
  console.warn("Icône introuvable:", iconSrc);
}

const manifestPath = join(mobileRoot, "android", "app", "src", "main", "AndroidManifest.xml");
if (existsSync(manifestPath)) {
  let xml = readFileSync(manifestPath, "utf8");
  if (!xml.includes("usesCleartextTraffic")) {
    xml = xml.replace(
      "<application",
      '<application android:usesCleartextTraffic="true"'
    );
    writeFileSync(manifestPath, xml);
    console.log("AndroidManifest: cleartext HTTP activé");
  }
}

const networkConfigDir = join(
  mobileRoot,
  "android",
  "app",
  "src",
  "main",
  "res",
  "xml"
);
const networkConfigPath = join(networkConfigDir, "network_security_config.xml");
if (existsSync(join(mobileRoot, "android"))) {
  mkdirSync(networkConfigDir, { recursive: true });
  writeFileSync(
    networkConfigPath,
    `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <domain-config cleartextTrafficPermitted="true">
    <domain includeSubdomains="true">51.255.200.11.sslip.io</domain>
    <domain includeSubdomains="true">51.255.200.11</domain>
    <domain includeSubdomains="true">sslip.io</domain>
  </domain-config>
</network-security-config>
`
  );

  let xml = readFileSync(manifestPath, "utf8");
  if (!xml.includes("networkSecurityConfig")) {
    xml = xml.replace(
      "<application",
      '<application android:networkSecurityConfig="@xml/network_security_config"'
    );
    writeFileSync(manifestPath, xml);
    console.log("AndroidManifest: network security config ajouté");
  }
}

console.log("Préparation mobile terminée.");
