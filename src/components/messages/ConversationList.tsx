"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface ConversationItem {
  id: string;
  student: { id: string; firstName: string; lastName: string };
  teacher: { id: string; firstName: string; lastName: string };
  course: { title: string; slug: string };
  updatedAt: string;
  lastMessage: {
    body: string;
    senderId: string;
    createdAt: string;
  } | null;
  unreadCount: number;
}

interface ConversationListProps {
  currentUserId: string;
  isTeacher: boolean;
}

export function ConversationList({
  currentUserId,
  isTeacher,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/messages/conversations");
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Impossible de charger les messages");
          return;
        }

        setConversations(data.conversations);
      } catch {
        setError("Erreur réseau");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  function otherName(conversation: ConversationItem) {
    const person = isTeacher ? conversation.student : conversation.teacher;
    return `${person.firstName} ${person.lastName}`;
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  }

  if (loading) {
    return <p className="text-sm text-muted">Chargement de vos messages...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (conversations.length === 0) {
    return (
      <div className="border-2 border-border bg-card p-8 text-center">
        <p className="font-medium">Aucune conversation</p>
        <p className="mt-2 text-sm text-muted">
          {isTeacher
            ? "Les élèves pourront vous écrire depuis la page de lecture d'un cours."
            : "Regardez un cours et cliquez sur « Contacter ce professeur » pour poser une question."}
        </p>
        {!isTeacher && (
          <Link
            href="/courses"
            className="mt-4 inline-block text-sm font-semibold text-primary hover:text-primary-dark"
          >
            Parcourir les cours →
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="divide-y divide-border-soft border-2 border-border">
      {conversations.map((conversation) => (
        <Link
          key={conversation.id}
          href={`/messages/${conversation.id}`}
          className="flex items-start gap-3 bg-card px-4 py-4 transition hover:bg-background"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-primary/10 text-sm font-bold text-primary-deep">
            {otherName(conversation)[0]}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="truncate font-semibold">{otherName(conversation)}</p>
              <span className="shrink-0 text-xs text-muted">
                {formatDate(conversation.updatedAt)}
              </span>
            </div>
            <p className="truncate text-xs text-muted">
              {conversation.course.title}
            </p>
            {conversation.lastMessage && (
              <p className="mt-1 truncate text-sm text-foreground/80">
                {conversation.lastMessage.senderId === currentUserId
                  ? "Vous : "
                  : ""}
                {conversation.lastMessage.body}
              </p>
            )}
          </div>
          {conversation.unreadCount > 0 && (
            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
          )}
        </Link>
      ))}
    </div>
  );
}
