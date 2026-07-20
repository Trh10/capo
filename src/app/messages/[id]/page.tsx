import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getConversationForUser } from "@/lib/messaging";
import { ChatThread } from "@/components/messages/ChatThread";

interface ConversationPageProps {
  params: Promise<{ id: string }>;
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/messages");

  const { id } = await params;
  const conversation = await getConversationForUser(id, user.id);

  if (!conversation) notFound();

  const isTeacher = user.id === conversation.teacherUserId;
  const other = isTeacher ? conversation.student : conversation.teacher;
  const otherName = `${other.firstName} ${other.lastName}`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-10">
      <ChatThread
        conversationId={conversation.id}
        currentUserId={user.id}
        otherName={otherName}
        courseTitle={conversation.course.title}
      />
    </div>
  );
}
