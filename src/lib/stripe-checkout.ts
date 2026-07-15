import { completePurchase } from "./purchases";
import { prisma } from "./prisma";
import { getStripe } from "./stripe";

export async function confirmCheckoutSession(
  sessionId: string,
  userId: string
): Promise<boolean> {
  const stripe = getStripe();
  if (!stripe) return false;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") return false;
    if (session.metadata?.userId !== userId) return false;

    const courseId = session.metadata?.courseId;
    if (!courseId) return false;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return false;

    await completePurchase(
      userId,
      courseId,
      course.price,
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : undefined
    );

    return true;
  } catch {
    return false;
  }
}

export function isStripeEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
