/** Chemins sans barre retour (accueil + listes principales). */
const ROOT_PATHS = new Set(["/", "/courses", "/teachers", "/login", "/register"]);

export function isRootPath(pathname: string): boolean {
  return ROOT_PATHS.has(pathname);
}

/** Retour parent logique quand l'historique est vide (deep link APK). */
export function getFallbackHref(pathname: string): string {
  if (pathname.startsWith("/watch/")) {
    const slug = pathname.split("/")[2];
    return slug ? `/courses/${slug}` : "/courses";
  }
  if (pathname.startsWith("/courses/")) return "/courses";
  if (pathname.startsWith("/teachers/")) return "/teachers";
  if (pathname.startsWith("/teacher/courses/")) return "/teacher";
  if (pathname.startsWith("/teacher")) return "/";
  if (pathname === "/my-courses" || pathname === "/account") return "/";
  return "/";
}
