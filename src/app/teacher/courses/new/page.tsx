import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireTeacher } from "@/lib/teacher";
import { CourseForm } from "@/components/teacher/CourseForm";

export default async function NewCoursePage() {
  await requireTeacher();

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { name: true },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href="/teacher"
        className="text-sm text-muted transition hover:text-primary"
      >
        ← Retour au tableau de bord
      </Link>
      <h1 className="mt-4 text-3xl font-bold">Nouveau cours</h1>
      <p className="mt-2 text-muted">
        D&apos;abord les infos du cours, ensuite l&apos;upload de vos fichiers.
      </p>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <CourseForm
          mode="create"
          categorySuggestions={categories.map((c) => c.name)}
        />
      </div>
    </div>
  );
}
