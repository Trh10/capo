import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findOrCreateCategory } from "@/lib/categories";
import { getOwnedCourse, getTeacherContext } from "@/lib/teacher";
import { updateCourseSchema } from "@/lib/validations";

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

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const context = await getTeacherContext();
  if (!context) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;
  const course = await getOwnedCourse(id, context.teacher.id);

  if (!course) {
    return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });
  }

  return NextResponse.json({ course });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const context = await getTeacherContext();
  if (!context) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;
  const course = await getOwnedCourse(id, context.teacher.id);

  if (!course) {
    return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const parsed = updateCourseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const categoryId = await resolveCategoryId(data);

    if (data.slug && data.slug !== course.slug) {
      const existingSlug = await prisma.course.findUnique({
        where: { slug: data.slug },
      });
      if (existingSlug && existingSlug.id !== course.id) {
        return NextResponse.json(
          { error: "Ce slug est déjà utilisé" },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.course.update({
      where: { id: course.id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.shortDesc !== undefined && {
          shortDesc: data.shortDesc || null,
        }),
        ...(data.thumbnailUrl !== undefined && {
          thumbnailUrl: data.thumbnailUrl || null,
        }),
        ...(data.price !== undefined && { price: Math.round(data.price) }),
        ...(data.level !== undefined && { level: data.level }),
        ...(categoryId !== undefined && { categoryId }),
        ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
      },
    });

    return NextResponse.json({ course: updated });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const context = await getTeacherContext();
  if (!context) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;
  const course = await getOwnedCourse(id, context.teacher.id);

  if (!course) {
    return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });
  }

  await prisma.course.delete({ where: { id: course.id } });

  return NextResponse.json({ success: true });
}
