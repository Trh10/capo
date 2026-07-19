import bcrypt from "bcryptjs";
import { DeviceType, DownloadStatus } from "@prisma/client";
import { prisma } from "./prisma";

/** Connexion : pas de limite — plusieurs appareils peuvent regarder en ligne. */
export const MAX_DEVICES = null;

/** Téléchargement offline : une leçon = un seul appareil par compte. */
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
      data: { lastActiveAt: new Date(), name, type },
    });
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

/**
 * Règle anti-partage de compte pour le offline :
 * une leçon achetée ne peut être téléchargée que sur UN appareil du compte.
 * Les autres appareils peuvent regarder en streaming.
 */
export async function canDownloadLessonOnDevice(
  userId: string,
  lessonId: string,
  deviceId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const activeStatuses: DownloadStatus[] = ["PENDING", "READY"];

  const onOtherDevice = await prisma.download.findFirst({
    where: {
      userId,
      lessonId,
      deviceId: { not: deviceId },
      status: { in: activeStatuses },
    },
    include: { device: { select: { name: true } } },
  });

  if (onOtherDevice) {
    const label = onOtherDevice.device.name || "un autre appareil";
    return {
      allowed: false,
      reason: `Cette leçon a déjà été téléchargée sur « ${label} ». Vous pouvez la regarder en ligne, mais pas la retélécharger ici.`,
    };
  }

  return { allowed: true };
}

export { generateDeviceFingerprint } from "./device-fingerprint";
