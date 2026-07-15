import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { completePurchase } from "@/lib/purchases";
import { getAppUrl, getStripe } from "@/lib/stripe";
import { checkoutSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Connectez-vous pour acheter un cours" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { slug: parsed.data.courseSlug, isPublished: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });
    }

    const existing = await prisma.purchase.findUnique({
      where: {
        userId_courseId: { userId: user.id, courseId: course.id },
      },
    });

    if (existing?.status === "COMPLETED") {
      return NextResponse.json({
        success: true,
        redirectUrl: `/courses/${course.slug}`,
      });
    }

    const stripe = getStripe();

    if (!stripe) {
      if (process.env.NODE_ENV !== "development") {
        return NextResponse.json(
          { error: "Paiement indisponible pour le moment" },
          { status: 503 }
        );
      }

      await completePurchase(user.id, course.id, course.price);

      return NextResponse.json({
        success: true,
        redirectUrl: `/courses/${course.slug}?purchased=1`,
      });
    }

    const appUrl = getAppUrl();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: course.price,
            product_data: {
              name: course.title,
              description: course.shortDesc || course.description.slice(0, 200),
            },
          },
        },
      ],
      metadata: {
        userId: user.id,
        courseId: course.id,
      },
      success_url: `${appUrl}/courses/${course.slug}?purchased=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/courses/${course.slug}?cancelled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors du paiement" },
      { status: 500 }
    );
  }
}
