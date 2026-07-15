import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CourseCard } from "@/components/courses/CourseCard";
import { HeroSearch } from "@/components/home/HeroSearch";

export default async function HomePage() {
  const [courses, categories, stats] = await Promise.all([
    prisma.course.findMany({
      where: { isPublished: true },
      take: 6,
      include: {
        teacher: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        category: { select: { name: true } },
        _count: { select: { lessons: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    Promise.all([
      prisma.course.count({ where: { isPublished: true } }),
      prisma.teacher.count(),
      prisma.lesson.count(),
    ]),
  ]);

  const [courseCount, teacherCount, lessonCount] = stats;

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-32">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Cours créatifs en ligne
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Apprenez auprès des meilleurs.{" "}
            <span className="text-primary">Créez sans limites.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted">
            Illustration, artisanat, design, photo, mode… Des cours guidés par des
            professionnels passionnés. Accès illimité, à vie.
          </p>

          <HeroSearch />

          <div className="mt-12 flex flex-wrap gap-4">
            <Link
              href="/courses"
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
              Parcourir le catalogue
            </Link>
            <Link
              href="/teachers"
              className="rounded-full border border-border bg-card px-8 py-3.5 text-sm font-semibold transition hover:border-primary hover:text-primary"
            >
              Découvrir les professeurs
            </Link>
          </div>

          <div className="mt-16 flex flex-wrap gap-8 border-t border-border pt-10">
            {[
              { value: courseCount, label: "Cours" },
              { value: teacherCount, label: "Professeurs" },
              { value: lessonCount, label: "Leçons" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Explorer par discipline
            </h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/courses?category=${cat.slug}`}
                  className="rounded-full border border-border bg-background px-5 py-2 text-sm font-medium transition hover:border-primary hover:text-primary"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {courses.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold">Cours à la une</h2>
              <p className="mt-2 text-muted">
                Projets concrets, techniques professionnelles, résultats visibles.
              </p>
            </div>
            <Link
              href="/courses"
              className="hidden text-sm font-semibold text-primary hover:underline sm:block"
            >
              Tout voir →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                slug={course.slug}
                title={course.title}
                thumbnailUrl={course.thumbnailUrl}
                price={course.price}
                level={course.level}
                teacherName={`${course.teacher.user.firstName} ${course.teacher.user.lastName}`}
                lessonCount={course._count.lessons}
                categoryName={course.category?.name}
                durationMin={course.duration}
              />
            ))}
          </div>
          <Link
            href="/courses"
            className="mt-6 inline-block text-sm font-semibold text-primary hover:underline sm:hidden"
          >
            Tout voir →
          </Link>
        </section>
      )}

      <section className="bg-card">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <h2 className="text-center text-3xl font-bold">
            Pourquoi choisir CAPO ?
          </h2>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Des experts reconnus",
                desc: "Chaque cours est animé par un professionnel qui partage sa méthode, ses astuces et son expérience terrain.",
              },
              {
                title: "À votre rythme",
                desc: "Pas d'horaire imposé. Regardez, pausez, revenez quand vous voulez. Votre progression est sauvegardée.",
              },
              {
                title: "Vos cours, pour toujours",
                desc: "Un achat, un accès permanent. Téléchargez les leçons sur l'app pour apprendre même sans connexion.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-background p-8"
              >
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6">
        <h2 className="text-3xl font-bold">Prêt à créer ?</h2>
        <p className="mx-auto mt-4 max-w-lg text-muted">
          Rejoignez CAPO et accédez à des centaines de cours créatifs guidés
          par des passionnés.
        </p>
        <Link
          href="/register"
          className="mt-8 inline-block rounded-full bg-primary px-10 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          Commencer maintenant
        </Link>
      </section>
    </>
  );
}
