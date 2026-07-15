import { slugify } from "./slug";
import { prisma } from "./prisma";

export async function findOrCreateCategory(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const slug = slugify(trimmed) || "categorie";

  return prisma.category.upsert({
    where: { slug },
    update: { name: trimmed },
    create: { name: trimmed, slug },
  });
}
