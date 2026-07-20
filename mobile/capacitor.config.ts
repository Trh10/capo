import type { CapacitorConfig } from "@capacitor/cli";

/** URL prod CAPO — injectée dans www/config.js au build */
const PROD_URL =
  process.env.CAPO_APP_URL ??
  "http://t13kzxjdw7jzvip57w31g0oq.51.255.200.11.sslip.io";

export { PROD_URL };

const config: CapacitorConfig = {
  appId: "fr.capo.studio",
  appName: "CAPO Studio",
  webDir: "www",
  /** Pas de server.url : vidéo intro locale puis redirection vers la prod. */
  android: {
    allowMixedContent: true,
    backgroundColor: "#000000",
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: "#000000",
      showSpinner: false,
    },
  },
};

export default config;
