import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUserDevices } from "@/lib/devices";
import { prisma } from "@/lib/prisma";
import { MediaImage } from "@/components/media/MediaImage";
import { DeviceList } from "@/components/account/DeviceList";
import { LogoutButton } from "@/components/account/LogoutButton";
import { ProfileForm } from "@/components/account/ProfileForm";
import { OfflineDownloadsList } from "@/components/offline/OfflineDownloadsList";

type PurchasedCourse = {
  slug: string;
  title: string;
  thumbnailUrl: string | null;
  lessons: { id: string }[];
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [devices, purchases, teacherProfile] = await Promise.all([
    getUserDevices(user.id),
    prisma.purchase.findMany({
      where: { userId: user.id, status: "COMPLETED" },
      include: {
        course: {
          select: {
            slug: true,
            title: true,
            thumbnailUrl: true,
            lessons: { select: { id: true } },
          },
        },
      },
      orderBy: { purchasedAt: "desc" },
    }),
    user.role === "TEACHER"
      ? prisma.teacher.findUnique({ where: { userId: user.id } })
      : Promise.resolve(null),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-10">
      <p className="text-xs font-semibold uppercase tracking-[.14em] text-primary-deep">
        Compte
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Mon compte</h1>
      <p className="mt-2 text-muted">Modifiez votre profil et gérez vos cours.</p>

      <section className="mt-8 border-2 border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Mon profil</h2>
        <div className="mt-4">
          <ProfileForm
            initial={{
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              role: user.role,
              avatarUrl: user.avatarUrl,
              bio: teacherProfile?.bio,
              specialty: teacherProfile?.specialty,
              location: teacherProfile?.location,
            }}
          />
        </div>
      </section>

      {user.role === "TEACHER" && (
        <section className="mt-6 border-2 border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Espace professeur</h2>
          <p className="mt-2 text-sm text-muted">
            Gérez vos cours et uploadez vos contenus.
          </p>
          <Link
            href="/teacher"
            className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Aller à l&apos;espace prof →
          </Link>
        </section>
      )}

      <section className="mt-6 border-2 border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Mes cours ({purchases.length})</h2>
        {purchases.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            Vous n&apos;avez pas encore de cours.{" "}
            <Link href="/courses" className="font-medium text-primary hover:underline">
              Parcourir le catalogue
            </Link>
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {purchases.map(({ course }: { course: PurchasedCourse }) => (
              <Link
                key={course.slug}
                href={`/watch/${course.slug}`}
                className="flex items-center gap-4 border border-border-soft bg-background p-3 transition hover:border-primary/40"
              >
                <div className="relative h-14 w-20 shrink-0 overflow-hidden bg-secondary/10">
                  {course.thumbnailUrl && (
                    <MediaImage
                      src={course.thumbnailUrl}
                      alt={course.title}
                      fill
                      className="object-cover grayscale contrast-[1.08]"
                      sizes="80px"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{course.title}</p>
                  <p className="text-xs text-muted">
                    {course.lessons.length} leçons · Continuer →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 border-2 border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Téléchargements hors ligne</h2>
        <p className="mt-1 text-sm text-muted">
          Contenus enregistrés sur cet appareil pour une lecture sans connexion.
        </p>
        <OfflineDownloadsList />
      </section>

      <section className="mt-6 border-2 border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Mes appareils ({devices.length})</h2>
        <div className="mt-4">
          <DeviceList
            devices={devices.map((d: (typeof devices)[number]) => ({
              id: d.id,
              name: d.name,
              type: d.type,
              lastActiveAt: d.lastActiveAt.toISOString(),
            }))}
          />
        </div>
      </section>

      <div className="mt-6">
        <LogoutButton />
      </div>
    </div>
  );
}
