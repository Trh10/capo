"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  body: string;
  senderId: string;
  readAt: string | null;
  createdAt: string;
}

interface ChatThreadProps {
  conversationId: string;
  currentUserId: string;
  otherName: string;
  courseTitle: string;
}

export function ChatThread({
  conversationId,
  currentUserId,
  otherName,
  courseTitle,
}: ChatThreadProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages/conversations/${conversationId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Impossible de charger la conversation");
        return;
      }

      setMessages(data.messages);
      setError(null);
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    void loadMessages();
    const interval = setInterval(() => {
      void loadMessages();
    }, 5000);

    return () => clearInterval(interval);
  }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setError(null);

    try {
      const res = await fetch(`/api/messages/conversations/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Impossible d'envoyer le message");
        return;
      }

      setMessages((prev) => [...prev, data.message]);
      setBody("");
    } catch {
      setError("Erreur réseau");
    } finally {
      setSending(false);
    }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="flex min-h-[60vh] flex-col border-2 border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <Link
          href="/messages"
          className="text-xs font-medium text-primary transition hover:text-primary-dark"
        >
          ← Retour aux messages
        </Link>
        <p className="mt-2 font-semibold">{otherName}</p>
        <p className="text-xs text-muted">Cours : {courseTitle}</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {loading && messages.length === 0 && (
          <p className="text-center text-sm text-muted">Chargement...</p>
        )}

        {!loading && messages.length === 0 && (
          <p className="text-center text-sm text-muted">
            Aucun message pour le moment. Envoyez le premier !
          </p>
        )}

        {messages.map((message) => {
          const mine = message.senderId === currentUserId;

          return (
            <div
              key={message.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-3 py-2 text-sm ${
                  mine
                    ? "bg-primary text-white"
                    : "border border-border bg-background text-foreground"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.body}</p>
                <p
                  className={`mt-1 text-[10px] ${
                    mine ? "text-white/70" : "text-muted"
                  }`}
                >
                  {formatTime(message.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-border bg-background p-4"
      >
        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={2}
            placeholder="Votre message..."
            className="min-h-[44px] flex-1 resize-none border-2 border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
            maxLength={2000}
          />
          <button
            type="submit"
            disabled={sending || !body.trim()}
            className="shrink-0 self-end rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
          >
            {sending ? "..." : "Envoyer"}
          </button>
        </div>
      </form>
    </div>
  );
}
