import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { removeDevice } from "@/lib/devices";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await removeDevice(user.id, id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Impossible de supprimer cet appareil" },
      { status: 404 }
    );
  }
}
