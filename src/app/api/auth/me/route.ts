import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserDevices } from "@/lib/devices";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const devices = await getUserDevices(user.id);

  return NextResponse.json({ user, devices });
}
