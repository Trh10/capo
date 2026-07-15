import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const teachers = await prisma.teacher.findMany({
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
      _count: { select: { courses: true } },
    },
    orderBy: { user: { firstName: "asc" } },
  });

  return NextResponse.json({ teachers });
}
