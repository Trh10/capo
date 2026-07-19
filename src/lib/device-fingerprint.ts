export function generateDeviceFingerprint(
  userAgent: string,
  platform: string
): string {
  const raw = `${userAgent}|${platform}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `fp_${Math.abs(hash).toString(36)}`;
}

export function getClientDevicePlatform(): "MOBILE" | "WEB" {
  if (typeof window === "undefined") return "WEB";
  const cap = (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } })
    .Capacitor;
  if (cap?.isNativePlatform?.()) return "MOBILE";
  return "WEB";
}

export function getClientDeviceFingerprint(): string {
  if (typeof navigator === "undefined") return "fp_ssr";
  return generateDeviceFingerprint(
    navigator.userAgent || "unknown",
    getClientDevicePlatform()
  );
}
