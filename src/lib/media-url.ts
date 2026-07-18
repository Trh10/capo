/** Ajoute un cache-buster pour forcer le rechargement après upload. */
export function withUploadCacheBust(url: string): string {
  const base = url.split("?")[0] ?? url;
  return `${base}?v=${Date.now()}`;
}
