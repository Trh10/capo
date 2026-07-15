import { slugify } from "./slugify";

export { slugify };

export async function uniqueCourseSlug(
  title: string,
  excludeId?: string
): Promise<string> {
  const { prisma } = await import("./prisma");
  const base = slugify(title) || "cours";
  let slug = base;
  let counter = 2;

  while (true) {
    const existing = await prisma.course.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${counter}`;
    counter++;
  }
}

export async function uniqueLessonSlug(
  courseId: string,
  title: string,
  excludeId?: string
): Promise<string> {
  const { prisma } = await import("./prisma");
  const base = slugify(title) || "lecon";
  let slug = base;
  let counter = 2;

  while (true) {
    const existing = await prisma.lesson.findUnique({
      where: { courseId_slug: { courseId, slug } },
    });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${counter}`;
    counter++;
  }
}
