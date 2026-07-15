import { prisma } from "./prisma";

export async function completePurchase(
  userId: string,
  courseId: string,
  amount: number,
  stripePaymentId?: string
) {
  return prisma.purchase.upsert({
    where: {
      userId_courseId: { userId, courseId },
    },
    create: {
      userId,
      courseId,
      amount,
      status: "COMPLETED",
      stripePaymentId,
    },
    update: {
      amount,
      status: "COMPLETED",
      stripePaymentId,
    },
  });
}
