import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ConversationList } from "@/components/messages/ConversationList";

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/messages");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-10">
      <p className="text-xs font-semibold uppercase tracking-[.14em] text-primary-deep">
        Messagerie
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Messages</h1>
      <p className="mt-2 text-muted">
        {user.role === "TEACHER"
          ? "Répondez aux questions de vos élèves en privé."
          : "Vos conversations privées avec les professeurs."}
      </p>

      <div className="mt-8">
        <ConversationList
          currentUserId={user.id}
          isTeacher={user.role === "TEACHER"}
        />
      </div>
    </div>
  );
}
