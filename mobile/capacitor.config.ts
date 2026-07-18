import type { CapacitorConfig } from "@capacitor/cli";

/** URL prod CAPO — données réelles en ligne */
const PROD_URL =
  process.env.CAPO_APP_URL ??
  "http://t13kzxjdw7jzvip57w31g0oq.51.255.200.11.sslip.io";

const config: CapacitorConfig = {
  appId: "fr.capo.studio",
  appName: "CAPO Studio",
  webDir: "www",
  server: {
    url: PROD_URL,
    cleartext: true,
    androidScheme: "http",
  },
  android: {
    allowMixedContent: true,
    backgroundColor: "#f8f4f4",
  },
};

export default config;
