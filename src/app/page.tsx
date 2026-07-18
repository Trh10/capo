import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CourseCard } from "@/components/courses/CourseCard";
import { HeroSearch } from "@/components/home/HeroSearch";
import { Logo } from "@/components/brand/Logo";

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
  const featured = courses[0];
  const marqueeItems = [...categories, ...categories];

  return (
    <>
      <section className="border-b-2 border-border">
        <div className="grid lg:grid-cols-2">
          <div className="px-4 py-14 sm:px-10 sm:py-20 lg:border-r-2 lg:border-border">
            <p className="animate-[fade-up_.6s_ease_both] text-xs font-semibold uppercase tracking-[.14em] text-primary-deep sm:text-sm">
              Cours créatifs en ligne
            </p>
            <h1 className="mt-5 animate-[fade-up_.6s_.08s_ease_both] text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl">
              Apprenez auprès des meilleurs.{" "}
              <span className="text-primary">Créez sans limites.</span>
            </h1>
            <p className="mt-7 max-w-xl animate-[fade-up_.6s_.16s_ease_both] text-base leading-relaxed text-muted sm:text-lg">
              Illustration, artisanat, design, photo, mode… Des cours guidés par
              des professionnels passionnés. Accès illimité, à vie.
            </p>

            <HeroSearch />

            <div className="mt-9 flex animate-[fade-up_.6s_.24s_ease_both] flex-col gap-3 sm:flex-row">
              <Link
                href="/courses"
                className="inline-flex justify-start bg-primary px-7 py-3.5 text-sm font-semibold text-background transition hover:bg-primary-dark"
              >
                Parcourir le catalogue
              </Link>
              <Link
                href="/teachers"
                className="inline-flex justify-start border-2 border-border px-7 py-3 text-sm font-semibold transition hover:border-primary hover:text-primary"
              >
                Découvrir les professeurs
              </Link>
            </div>

            <div className="mt-16 grid grid-cols-3 border-t-2 border-border">
              {[
                { value: courseCount, label: "Cours" },
                { value: teacherCount, label: "Professeurs" },
                { value: lessonCount, label: "Leçons" },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className={`pt-5 ${i > 0 ? "border-l border-border-soft pl-4" : "pr-4"} ${i === 1 ? "pr-4" : ""}`}
                >
                  <p className="text-3xl font-extrabold sm:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block">
            {featured?.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={featured.thumbnailUrl}
                alt={featured.title}
                className="h-full min-h-[520px] w-full object-cover grayscale contrast-[1.08]"
              />
            ) : (
              <div className="h-full min-h-[520px] w-full bg-card" />
            )}
            {featured && (
              <div className="absolute bottom-0 left-0 border-r-2 border-t-2 border-border bg-background px-5 py-3.5 text-xs font-semibold uppercase tracking-[.1em]">
                {featured.title} — {featured.teacher.user.firstName}{" "}
                {featured.teacher.user.lastName}
              </div>
            )}
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="overflow-hidden border-b-2 border-border py-3.5 whitespace-nowrap">
          <div className="inline-flex animate-[marquee_24s_linear_infinite] gap-12 pr-12 will-change-transform">
            {marqueeItems.map((cat, i) => (
              <span
                key={`${cat.slug}-${i}`}
                className="inline-flex items-center gap-12"
              >
                <Link
                  href={`/courses?category=${cat.slug}`}
                  className="text-sm font-semibold uppercase tracking-[.1em] transition hover:text-primary"
                >
                  {cat.name}
                </Link>
                <span className="text-primary" aria-hidden>
                  ●
                </span>
              </span>
            ))}
          </div>
        </section>
      )}

      {courses.length > 0 && (
        <section className="border-b-2 border-border px-4 py-16 sm:px-10">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.14em] text-primary-deep">
                Catalogue
              </p>
              <h2 className="mt-2.5 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Cours à la une
              </h2>
            </div>
            <Link
              href="/courses"
              className="hidden text-sm font-semibold text-primary-deep hover:underline sm:block"
            >
              Tout voir →
            </Link>
          </div>
          <div className="mt-10 grid gap-[2px] border-2 border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
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
            className="mt-6 inline-block text-sm font-semibold text-primary-deep hover:underline sm:hidden"
          >
            Tout voir →
          </Link>
        </section>
      )}

      <section className="border-b-2 border-border px-4 py-16 sm:px-10">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Pourquoi choisir CAPO ?
        </h2>
        <div className="mt-10 grid border-t-2 border-border md:grid-cols-3">
          {[
            {
              num: "01",
              title: "Des experts reconnus",
              desc: "Chaque cours est animé par un professionnel qui partage sa méthode, ses astuces et son expérience terrain.",
            },
            {
              num: "02",
              title: "À votre rythme",
              desc: "Pas d'horaire imposé. Regardez, pausez, revenez quand vous voulez. Votre progression est sauvegardée.",
            },
            {
              num: "03",
              title: "Vos cours, pour toujours",
              desc: "Un achat, un accès permanent. Téléchargez les leçons sur l'app pour apprendre même sans connexion.",
            },
          ].map((item, i) => (
            <div
              key={item.num}
              className={`pt-7 ${i > 0 ? "md:border-l md:border-border-soft md:pl-6" : "md:pr-6"} ${i === 1 ? "md:pr-6" : ""}`}
            >
              <p className="text-sm font-extrabold text-primary">{item.num}</p>
              <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-primary">
        <div className="px-4 py-16 sm:px-10 sm:py-20">
          <Logo variant="red" href={null} className="h-11" />
          <h2 className="mt-7 max-w-4xl text-5xl font-black leading-none tracking-tight text-background sm:text-7xl">
            Prêt à créer ?
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-background/85 sm:text-lg">
            Rejoignez CAPO Studio et accédez à des centaines de cours créatifs
            guidés par des passionnés.
          </p>
          <Link
            href="/register"
            className="mt-9 inline-flex justify-start bg-background px-8 py-3.5 text-sm font-semibold text-primary-deep transition hover:bg-[#ffe0d9]"
          >
            Commencer maintenant
          </Link>
        </div>
      </section>
    </>
  );
}
