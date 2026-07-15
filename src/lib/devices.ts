import bcrypt from "bcryptjs";
import { DeviceType } from "@prisma/client";
import { prisma } from "./prisma";

export const MAX_DEVICES = 2;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function registerDevice(
  userId: string,
  fingerprint: string,
  name: string,
  type: DeviceType
) {
  const existing = await prisma.device.findUnique({
    where: { userId_fingerprint: { userId, fingerprint } },
  });

  if (existing) {
    return prisma.device.update({
      where: { id: existing.id },
      data: { lastActiveAt: new Date(), name },
    });
  }

  const deviceCount = await prisma.device.count({ where: { userId } });

  if (deviceCount >= MAX_DEVICES) {
    throw new DeviceLimitError();
  }

  return prisma.device.create({
    data: { userId, fingerprint, name, type },
  });
}

export async function getUserDevices(userId: string) {
  return prisma.device.findMany({
    where: { userId },
    orderBy: { lastActiveAt: "desc" },
  });
}

export async function removeDevice(userId: string, deviceId: string) {
  const device = await prisma.device.findFirst({
    where: { id: deviceId, userId },
  });

  if (!device) {
    throw new Error("Appareil introuvable");
  }

  await prisma.download.updateMany({
    where: { deviceId },
    data: { status: "REVOKED" },
  });

  return prisma.device.delete({ where: { id: deviceId } });
}

export class DeviceLimitError extends Error {
  constructor() {
    super(
      `Limite de ${MAX_DEVICES} appareils atteinte. Déconnectez un appareil pour continuer.`
    );
    this.name = "DeviceLimitError";
  }
}

export function generateDeviceFingerprint(
  userAgent: string,
  platform: string
): string {
  const raw = `${userAgent}|${platform}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `fp_${Math.abs(hash).toString(36)}`;
}
