import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import {
  verifyPassword,
  registerDevice,
  generateDeviceFingerprint,
  DeviceLimitError,
} from "@/lib/devices";
import { loginSchema } from "@/lib/validations";
import { DeviceType } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password, deviceName, deviceType } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    const userAgent = request.headers.get("user-agent") || "unknown";
    const fingerprint = generateDeviceFingerprint(userAgent, deviceType || "WEB");

    try {
      await registerDevice(
        user.id,
        fingerprint,
        deviceName || "Navigateur web",
        (deviceType as DeviceType) || "WEB"
      );
    } catch (error) {
      if (error instanceof DeviceLimitError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      throw error;
    }

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la connexion" },
      { status: 500 }
    );
  }
}
