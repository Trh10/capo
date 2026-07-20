import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const mobileRoot = join(__dirname, "..");

const prodUrl =
  process.env.CAPO_APP_URL ||
  "http://51.255.200.11:3002";

const configJs = `/** Généré par scripts/inject-config.mjs — ne pas éditer à la main */
window.CAPO_APP_URL = ${JSON.stringify(prodUrl)};
window.CAPO_APP_URL_FALLBACK = ${JSON.stringify(
  process.env.CAPO_APP_URL_FALLBACK ||
    "http://t13kzxjdw7jzvip57w31g0oq.51.255.200.11.sslip.io"
)};
`;

writeFileSync(join(mobileRoot, "www", "config.js"), configJs, "utf8");
console.log("config.js →", prodUrl);
