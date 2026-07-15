import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/devices";

const prisma = new PrismaClient();

const DEMO_VIDEO_URL =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

async function main() {
  const passwordHash = await hashPassword("password123");

  const teacherUser = await prisma.user.upsert({
    where: { email: "julie.robert@capo.fr" },
    update: { avatarUrl: "/images/teacher-julie.png" },
    create: {
      email: "julie.robert@capo.fr",
      passwordHash,
      firstName: "Julie",
      lastName: "Robert",
      role: "TEACHER",
      emailVerified: true,
      avatarUrl: "/images/teacher-julie.png",
      teacherProfile: {
        create: {
          bio: "Artisane textile passionnée. Je déconstruis et renouvelle des techniques anciennes pour créer des suspensions, coussins et décorations murales uniques.",
          specialty: "Art textile",
          location: "Six-Fours-les-Plages, France",
        },
      },
    },
    include: { teacherProfile: true },
  });

  const craft = await prisma.category.upsert({
    where: { slug: "craft" },
    update: {},
    create: {
      name: "Artisanat",
      slug: "craft",
      description: "Cours de création artisanale et fait-main",
    },
  });

  const textile = await prisma.category.upsert({
    where: { slug: "art-textile" },
    update: {},
    create: {
      name: "Art textile",
      slug: "art-textile",
      description: "Tissage, broderie et créations textiles",
    },
  });

  const animation = await prisma.category.upsert({
    where: { slug: "animation" },
    update: {},
    create: {
      name: "Animation",
      slug: "animation",
      description: "Motion design et animation vidéo",
    },
  });

  const jacobinUser = await prisma.user.upsert({
    where: { email: "jacobin.diwatesa@capo.fr" },
    update: { avatarUrl: "/images/teacher-jacobin.png" },
    create: {
      email: "jacobin.diwatesa@capo.fr",
      passwordHash,
      firstName: "Jacobin",
      lastName: "Diwatesa",
      role: "TEACHER",
      emailVerified: true,
      avatarUrl: "/images/teacher-jacobin.png",
      teacherProfile: {
        create: {
          bio: "Motion designer et formateur After Effects. J'accompagne les créatifs pour maîtriser l'animation, les effets visuels et la composition vidéo.",
          specialty: "After Effects & Motion Design",
          location: "Paris, France",
        },
      },
    },
    include: { teacherProfile: true },
  });

  const course = await prisma.course.upsert({
    where: { slug: "suspension-tissee-corde-epaisse" },
    update: { price: 599, thumbnailUrl: "/images/course-textile.png" },
    create: {
      title: "Créez une suspension tissée avec une corde épaisse",
      slug: "suspension-tissee-corde-epaisse",
      description:
        "Découvrez comment transformer une simple corde épaisse en une suspension tissée élégante et texturée. Apprenez le point plat, la tresse, la création de volume, et finalisez avec l'assemblage de la partie lumineuse.",
      shortDesc: "Suspension tissée en corde épaisse avec finitions artisanales",
      thumbnailUrl: "/images/course-textile.png",
      price: 599,
      level: "Débutant",
      duration: 107,
      isPublished: true,
      teacherId: teacherUser.teacherProfile!.id,
      categoryId: textile.id,
      lessons: {
        create: [
          {
            title: "Les outils et les matériaux",
            slug: "outils-materiaux",
            order: 1,
            duration: 300,
            isFree: true,
          },
          {
            title: "L'esquisse à l'acrylique",
            slug: "esquisse-acrylique",
            order: 2,
            duration: 373,
          },
          {
            title: "La technique de base : le point plat",
            slug: "point-plat",
            order: 3,
            duration: 1235,
          },
          {
            title: "La technique de la tresse",
            slug: "tresse",
            order: 4,
            duration: 573,
          },
          {
            title: "La création de volume",
            slug: "creation-volume",
            order: 5,
            duration: 852,
          },
          {
            title: "Préparation de l'armature et des fibres",
            slug: "armature-fibres",
            order: 6,
            duration: 365,
          },
          {
            title: "La mise en application des points",
            slug: "application-points",
            order: 7,
            duration: 1243,
          },
          {
            title: "Les finitions textiles",
            slug: "finitions-textiles",
            order: 8,
            duration: 600,
          },
          {
            title: "Les composants de la lampe",
            slug: "composants-lampe",
            order: 9,
            duration: 480,
          },
        ],
      },
    },
  });

  await prisma.course.deleteMany({ where: { slug: "coussins-multi-techniques" } });

  const course2 = await prisma.course.upsert({
    where: { slug: "after-effects" },
    update: {
      title: "After Effects",
      price: 599,
      thumbnailUrl: "/images/course-after-effects.png",
      teacherId: jacobinUser.teacherProfile!.id,
      categoryId: animation.id,
    },
    create: {
      title: "After Effects",
      slug: "after-effects",
      description:
        "Maîtrisez After Effects de A à Z. Apprenez à animer, composer et exporter vos projets vidéo avec des techniques professionnelles de motion design.",
      shortDesc: "Motion design et animation avec After Effects",
      thumbnailUrl: "/images/course-after-effects.png",
      price: 599,
      level: "Intermédiaire",
      duration: 90,
      isPublished: true,
      teacherId: jacobinUser.teacherProfile!.id,
      categoryId: animation.id,
      lessons: {
        create: [
          {
            title: "Introduction à After Effects",
            slug: "introduction",
            order: 1,
            duration: 420,
            isFree: true,
          },
          {
            title: "Les bases de l'animation",
            slug: "bases-animation",
            order: 2,
            duration: 900,
          },
          {
            title: "Composition et export",
            slug: "composition-export",
            order: 3,
            duration: 600,
          },
        ],
      },
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "eleve@capo.fr" },
    update: {},
    create: {
      email: "eleve@capo.fr",
      passwordHash,
      firstName: "Marie",
      lastName: "Dupont",
      role: "STUDENT",
      emailVerified: true,
    },
  });

  console.log("Seed terminé :");
  console.log(`  Professeur : ${teacherUser.email} / password123`);
  console.log(`  Professeur : ${jacobinUser.email} / password123`);
  console.log(`  Élève     : ${student.email} / password123`);
  console.log(`  Cours     : ${course.title}`);
  console.log(`  Cours     : ${course2.title}`);

  await prisma.lesson.updateMany({
    data: { videoUrl: DEMO_VIDEO_URL },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
