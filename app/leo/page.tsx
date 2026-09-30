"use client";

import Image from "next/image";
import { assetPath } from "@/lib/asset-path";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { TopNavigation } from "@/components/layout/TopNavigation";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Typography } from "@/components/ui/Typography";

type Message = {
  id: string;
  role: "leo" | "learner";
  lines: string[];
  tip?: string;
};

const openingMessages: Message[] = [
  {
    id: "msg-1",
    role: "leo",
    lines: ["Hi Alex! I'm Leo. Ready for a quick real-life conversation?"],
  },
  {
    id: "msg-2",
    role: "learner",
    lines: ["Yes — I want to practise ordering food in English."],
  },
  {
    id: "msg-3",
    role: "leo",
    lines: [
      "Great choice. Let's pretend you're at a café.",
      "The server has just walked up to your table. What do you say?",
    ],
  },
  {
    id: "msg-4",
    role: "leo",
    lines: ["Here's a model answer you can borrow:", "“Could I see the menu, please?”"],
    tip: "“Could I…” sounds polite and natural in most service situations.",
  },
];

const suggestions = [
  "Practise ordering at a café",
  "Introduce myself at work",
  "Help me sound more polite",
  "Explain a word I didn't understand",
];

function buildLeoReply(input: string): Message {
  const lowerCaseInput = input.toLowerCase();

  if (lowerCaseInput.includes("café") || lowerCaseInput.includes("cafe") || lowerCaseInput.includes("coffee")) {
    return {
      id: "reply-cafe",
      role: "leo",
      lines: ["Nice — let's run that scene.", "You're at the counter. The barista asks, “What can I get for you?”"],
      tip: "Try answering with “Could I get a…, please?”",
    };
  }

  if (lowerCaseInput.includes("polite") || lowerCaseInput.includes("rude")) {
    return {
      id: "reply-polite",
      role: "leo",
      lines: ["Politeness in English usually comes from softening the request, not from fancy words."],
      tip: "Swap “Give me water” for “Could I have some water, please?” — same meaning, much friendlier.",
    };
  }

  if (lowerCaseInput.includes("work") || lowerCaseInput.includes("meeting") || lowerCaseInput.includes("introduce")) {
    return {
      id: "reply-work",
      role: "leo",
      lines: ["Let's do a work introduction.", "You're joining a new team call. Say hello and share your role in one sentence."],
      tip: "A simple structure works well: name → role → what you're working on.",
    };
  }

  if (lowerCaseInput.includes("word") || lowerCaseInput.includes("mean")) {
    return {
      id: "reply-word",
      role: "leo",
      lines: ["Happy to help. Tell me the word and the sentence you heard it in, and I'll break it down."],
      tip: "Context matters more than the definition — the sentence around the word tells us the meaning.",
    };
  }

  if (lowerCaseInput.includes("hello") || lowerCaseInput.includes("hi ") || lowerCaseInput.trim() === "hi") {
    return {
      id: "reply-hello",
      role: "leo",
      lines: ["Hello! Good to hear from you.", "What would you like to practise today?"],
      tip: "Try a situation you actually have coming up — it makes practice stick.",
    };
  }

  return {
    id: "reply-default",
    role: "leo",
    lines: ["Good — I can work with that.", "Say it again as if you were speaking to someone out loud, and I'll show you a more natural version."],
    tip: "Speak your answer out loud first, then type it. It builds the habit faster.",
  };
}

export default function LeoPage() {
  const [messages, setMessages] = useState<Message[]>(openingMessages);
  const [draft, setDraft] = useState("");
  const [isLeoReplying, setIsLeoReplying] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [conversationKey, setConversationKey] = useState(0);

  const endOfConversationRef = useRef<HTMLDivElement>(null);
  const replyTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (replyTimeoutRef.current !== null) {
        window.clearTimeout(replyTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    endOfConversationRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLeoReplying]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();

    if (!trimmed || isLeoReplying) {
      return;
    }

    setMessages((current) => [
      ...current,
      { id: `learner-${conversationKey}-${current.length}`, role: "learner", lines: [trimmed] },
    ]);
    setDraft("");
    setIsLeoReplying(true);

    replyTimeoutRef.current = window.setTimeout(() => {
      setMessages((current) => [...current, buildLeoReply(trimmed)]);
      setIsLeoReplying(false);
      replyTimeoutRef.current = null;
    }, 900);
  };

  const startNewConversation = () => {
    if (replyTimeoutRef.current !== null) {
      window.clearTimeout(replyTimeoutRef.current);
      replyTimeoutRef.current = null;
    }

    setMessages(openingMessages);
    setDraft("");
    setIsLeoReplying(false);
    setMenuOpen(false);
    setConversationKey((current) => current + 1);
  };

  return (
    <AppShell
      activeNavigationItem="Leo"
      hideBottomNavigation
      topNavigation={
        <TopNavigation
          title="Leo"
          rightAction={
            <div className="relative">
              <Button
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-label="Conversation options"
                variant="ghost"
                className="h-[52px] w-[52px] px-0"
                onClick={() => setMenuOpen((current) => !current)}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
                  <path
                    d="M12 6.5a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5Zm0 7.25a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5Zm0 7.25a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5Z"
                    fill="currentColor"
                  />
                </svg>
              </Button>
              {menuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-40 mt-1 w-56 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-white)] p-2 shadow-lg shadow-[#001a4d]/10"
                >
                  <Typography variant="label" as="p" className="px-3 py-2 text-[var(--color-text-muted)]">
                    B1 · Intermediate learner
                  </Typography>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={startNewConversation}
                    className="w-full rounded-[var(--radius-sm)] px-3 py-3 text-left text-sm font-semibold text-[var(--color-primary-navy)] transition-colors hover:bg-[var(--color-navy-tint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]"
                  >
                    Start a new conversation
                  </button>
                </div>
              ) : null}
            </div>
          }
        />
      }
      contentClassName="[&>div]:max-w-[640px] [&>div]:py-4"
    >
      <div className="flex min-h-[calc(100vh-190px)] flex-col">
        <section aria-label="Conversation with Leo" className="flex-1 space-y-4">
          {messages.map((message) => {
            const isLeo = message.role === "leo";

            return (
              <div key={`${conversationKey}-${message.id}`} className={`flex items-end gap-2.5 ${isLeo ? "" : "flex-row-reverse"}`}>
                {isLeo ? (
                  <Image
                    src={assetPath("/images/leo-character.png")}
                    alt=""
                    width={40}
                    height={40}
                    className="mb-1 h-10 w-10 shrink-0 object-contain"
                  />
                ) : null}
                <div className={`max-w-[80%] ${isLeo ? "" : "flex flex-col items-end"}`}>
                  <div
                    className={`rounded-[var(--radius-lg)] px-4 py-3 ${
                      isLeo
                        ? "rounded-bl-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-white)]"
                        : "rounded-br-[var(--radius-sm)] bg-[var(--color-primary-navy)] text-[var(--color-white)]"
                    }`}
                  >
                    {message.lines.map((line, index) => (
                      <Typography
                        key={line}
                        variant="body"
                        as="p"
                        className={`${index > 0 ? "mt-2" : ""} ${isLeo ? "" : "text-[var(--color-white)]"}`}
                      >
                        {line}
                      </Typography>
                    ))}
                  </div>
                  {message.tip ? (
                    <div className="mt-2 flex items-start gap-2 rounded-[var(--radius-md)] bg-[var(--color-navy-tint)] px-3.5 py-3">
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary-navy)]">
                        <path
                          d="M12 2a7 7 0 0 0-4 12.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26A7 7 0 0 0 12 2Zm-2 18a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-1H10v1Z"
                          fill="currentColor"
                        />
                      </svg>
                      <Typography variant="caption" as="p" className="text-[var(--color-primary-navy)]">
                        {message.tip}
                      </Typography>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}

          {isLeoReplying ? (
            <div className="flex items-end gap-2.5">
              <Image src={assetPath("/images/leo-character.png")} alt="" width={40} height={40} className="mb-1 h-10 w-10 shrink-0 object-contain" />
              <div aria-hidden="true" className="flex items-center gap-1.5 rounded-[var(--radius-lg)] rounded-bl-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-white)] px-4 py-4">
                <span className="h-2 w-2 animate-bounce rounded-[var(--radius-pill)] bg-[var(--color-text-muted)] [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-[var(--radius-pill)] bg-[var(--color-text-muted)] [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-[var(--radius-pill)] bg-[var(--color-text-muted)]" />
              </div>
              <span role="status" className="sr-only">
                Leo is responding
              </span>
            </div>
          ) : null}

          <div ref={endOfConversationRef} />
        </section>

        <div className="sticky bottom-20 z-30 -mx-[var(--space-4)] mt-5 border-t border-[var(--color-border)] bg-[var(--color-background)]/95 px-[var(--space-4)] pb-[var(--space-2)] pt-[var(--space-3)] backdrop-blur">
          <div aria-label="Suggested prompts" className="flex gap-2 overflow-x-auto pb-[var(--space-3)] [scrollbar-width:none]">
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion}
                variant="secondary"
                onClick={() => sendMessage(suggestion)}
                disabled={isLeoReplying}
                className="min-h-10 shrink-0 rounded-[var(--radius-pill)] px-4 text-xs"
              >
                {suggestion}
              </Button>
            ))}
          </div>

          <form
            className="flex items-end gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage(draft);
            }}
          >
            <label htmlFor="leo-message" className="sr-only">
              Message Leo
            </label>
            <input
              id="leo-message"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Message Leo…"
              autoComplete="off"
              className="min-h-[52px] flex-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-white)] px-4 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus-visible:border-[var(--color-primary-navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]"
            />
            <Button
              type="submit"
              aria-label="Send message"
              disabled={draft.trim().length === 0 || isLeoReplying}
              className="h-[52px] w-[52px] shrink-0 px-0"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
                <path
                  d="M3.4 20.4 21 12 3.4 3.6 3.4 10l12.6 2-12.6 2v4.4Z"
                  fill="currentColor"
                />
              </svg>
            </Button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
