import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category");
  const teacher = searchParams.get("teacher");

  const courses = await prisma.course.findMany({
    where: {
      isPublished: true,
      ...(q && {
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
          { teacher: { user: { firstName: { contains: q } } } },
          { teacher: { user: { lastName: { contains: q } } } },
        ],
      }),
      ...(category && { category: { slug: category } }),
      ...(teacher && { teacher: { user: { id: teacher } } }),
    },
    include: {
      teacher: {
        include: {
          user: {
            select: { firstName: true, lastName: true, avatarUrl: true },
          },
        },
      },
      category: { select: { name: true, slug: true } },
      _count: { select: { lessons: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ courses });
}
