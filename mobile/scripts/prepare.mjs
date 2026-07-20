import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const mobileRoot = join(__dirname, "..");

const manifestPath = join(mobileRoot, "android", "app", "src", "main", "AndroidManifest.xml");
if (!existsSync(manifestPath)) {
  console.log("AndroidManifest absent — exécutez d'abord: npx cap add android");
  process.exit(0);
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
mkdirSync(networkConfigDir, { recursive: true });
writeFileSync(
  join(networkConfigDir, "network_security_config.xml"),
  `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <base-config cleartextTrafficPermitted="true">
    <trust-anchors>
      <certificates src="system" />
    </trust-anchors>
  </base-config>
  <domain-config cleartextTrafficPermitted="true">
    <domain includeSubdomains="true">51.255.200.11.sslip.io</domain>
    <domain includeSubdomains="true">51.255.200.11</domain>
    <domain includeSubdomains="true">sslip.io</domain>
  </domain-config>
</network-security-config>
`
);

let xml = readFileSync(manifestPath, "utf8");
if (!xml.includes('networkSecurityConfig="@xml/network_security_config"')) {
  xml = xml.replace(
    "<application",
    '<application android:networkSecurityConfig="@xml/network_security_config"'
  );
}
if (!xml.includes("usesCleartextTraffic")) {
  xml = xml.replace(
    "<application",
    '<application android:usesCleartextTraffic="true"'
  );
}
writeFileSync(manifestPath, xml);
console.log("AndroidManifest: HTTP cleartext OK");
