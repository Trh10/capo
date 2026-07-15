import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Rejoignez CAPO"
      subtitle="Choisissez votre profil : élève pour apprendre, professeur pour créer et vendre vos contenus."
    >
      <Suspense>
        <AuthForm mode="register" />
      </Suspense>
    </AuthLayout>
  );
}
