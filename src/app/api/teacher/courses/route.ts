import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findOrCreateCategory } from "@/lib/categories";
import { uniqueCourseSlug } from "@/lib/slug";
import { getTeacherContext } from "@/lib/teacher";
import { createCourseSchema } from "@/lib/validations";

async function resolveCategoryId(data: {
  categoryName?: string;
  categoryId?: string;
}) {
  if (data.categoryName !== undefined) {
    if (!data.categoryName.trim()) return null;
    const category = await findOrCreateCategory(data.categoryName);
    return category?.id ?? null;
  }
  if (data.categoryId !== undefined) return data.categoryId || null;
  return undefined;
}

export async function GET() {
  const context = await getTeacherContext();
  if (!context) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const courses = await prisma.course.findMany({
    where: { teacherId: context.teacher.id },
    include: {
      _count: { select: { lessons: true, purchases: true } },
      category: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ courses });
}

export async function POST(request: NextRequest) {
  const context = await getTeacherContext();
  if (!context) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = createCourseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const slug = await uniqueCourseSlug(data.title);
    const categoryId = await resolveCategoryId(data);

    const course = await prisma.course.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        shortDesc: data.shortDesc || null,
        thumbnailUrl: data.thumbnailUrl || null,
        price: Math.round(data.price),
        level: data.level,
        categoryId: categoryId ?? null,
        isPublished: data.isPublished ?? false,
        teacherId: context.teacher.id,
      },
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la création" },
      { status: 500 }
    );
  }
}
