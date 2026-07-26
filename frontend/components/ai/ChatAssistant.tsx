"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, User, Bot, Loader2, BookOpen, TrendingUp, Trash2 } from "lucide-react";
import type { ChatContext } from "@/lib/types";
import { useAIChat } from "@/hooks/useAIChat";
import { fetchNorthStar } from "@/lib/api/four-levels";
import { Portal } from "@/components/ui/Portal";

interface ChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  context: ChatContext | null;
}

function parseMarkdown(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);

    let firstMatch:
      | { type: "bold"; index: number; length: number; content: string }
      | { type: "italic"; index: number; length: number; content: string }
      | null = null;

    if (boldMatch && boldMatch.index !== undefined) {
      firstMatch = { type: "bold", index: boldMatch.index, length: boldMatch[0].length, content: boldMatch[1] };
    }

    if (italicMatch && italicMatch.index !== undefined) {
      if (!firstMatch || italicMatch.index < firstMatch.index) {
        firstMatch = { type: "italic", index: italicMatch.index, length: italicMatch[0].length, content: italicMatch[1] };
      }
    }

    if (!firstMatch) {
      nodes.push(remaining);
      break;
    }

    if (firstMatch.index > 0) {
      nodes.push(remaining.slice(0, firstMatch.index));
    }

    if (firstMatch.type === "bold") {
      nodes.push(<strong key={key++} className="font-semibold text-zinc-900">{firstMatch.content}</strong>);
    } else {
      nodes.push(<em key={key++} className="italic text-emerald-700">{firstMatch.content}</em>);
    }

    remaining = remaining.slice(firstMatch.index + firstMatch.length);
  }

  return nodes;
}

function parseContent(text: string): {
  bodyNodes: React.ReactNode[];
  scores: string[];
  citation: string | null;
} {
  const citationMatch = text.match(/\(([^)]*\d{4}[^)]*)\)/);
  const citation = citationMatch ? citationMatch[1] : null;

  const body = citationMatch
    ? text.slice(0, citationMatch.index).trim() + " " + text.slice(citationMatch.index! + citationMatch[0].length).trim()
    : text;

  const scoreRegex = /\b(\d{1,3}\/\d{1,3}|[+-]?\d+[.,]\d+\s*(ani|ani\/an|x)|[+-]?\d+[.,]\d+)\b/g;
  const scores: string[] = [];
  let m;
  while ((m = scoreRegex.exec(text)) !== null) {
    if (!scores.includes(m[0])) scores.push(m[0]);
  }

  const bodyNodes = parseMarkdown(body);

  return { bodyNodes, scores, citation };
}

function AIChatBubble({ content, isStreaming }: { content: string; isStreaming: boolean }) {
  if (!content && isStreaming) {
    return (
      <div className="flex justify-start mb-5">
        <div className="flex max-w-[88%] gap-2.5">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/60 text-emerald-500 shadow-sm">
            <Bot className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-white/40 bg-white/20 px-4 py-3 shadow-sm backdrop-blur-md">
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400 [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400 [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400 [animation-delay:300ms]" />
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!content) return null;

  const { bodyNodes, scores, citation } = parseContent(content);

  return (
    <div className="flex justify-start mb-5">
      <div className="flex max-w-[88%] gap-2.5">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/60 text-emerald-500 shadow-sm">
          <Bot className="h-4 w-4" />
        </div>

        <div className="min-w-0 overflow-hidden rounded-[22px] border border-white/40 bg-white/20 shadow-[0_4px_20px_rgba(20,83,45,0.06)] backdrop-blur-md">
          <div className="px-4 pt-3.5 pb-3 text-sm leading-relaxed text-zinc-700">
            {bodyNodes}
          </div>

          {scores.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-4 pb-2">
              {scores.map((s, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-100/60 px-2 py-0.5 text-[11px] font-semibold text-emerald-700"
                >
                  <TrendingUp className="h-3 w-3" />
                  {s}
                </span>
              ))}
            </div>
          )}

          {citation && (
            <div className="border-t border-white/30 px-4 py-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-50/60 px-2 py-0.5 text-[10px] font-medium text-sky-600">
                <BookOpen className="h-3 w-3" />
                {citation}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UserChatBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end mb-5">
      <div className="flex max-w-[85%] gap-2.5 flex-row-reverse">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm">
          <User className="h-4 w-4" />
        </div>
        <div className="rounded-2xl rounded-tr-md bg-gradient-to-br from-emerald-500 to-emerald-600 px-4 py-3 text-sm leading-relaxed text-white shadow-md shadow-emerald-500/20">
          {content}
        </div>
      </div>
    </div>
  );
}

function SuggestedQuestions({
  questions,
  onSelect,
}: {
  questions: string[];
  onSelect: (q: string) => void;
}) {
  if (questions.length === 0) return null;

  return (
    <div className="mb-4 space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
        Întrebări sugerate
      </p>
      <div className="flex flex-wrap gap-2">
        {questions.map((q, i) => (
          <button
            key={i}
            onClick={() => onSelect(q)}
            className="rounded-full border border-white/30 bg-white/10 px-3.5 py-2 text-xs font-medium text-zinc-600 shadow-sm backdrop-blur-sm transition-all hover:bg-white/25 hover:text-zinc-800 active:scale-[0.97]"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ChatAssistant({ isOpen, onClose, context }: ChatAssistantProps) {
  const [northStar, setNorthStar] = useState<string | undefined>(undefined);
  const [values, setValues] = useState<string[] | undefined>(undefined);

  useEffect(() => {
    if (isOpen && !northStar) {
      fetchNorthStar().then((data) => {
        setNorthStar(data.northStar || undefined);
        setValues(data.values?.length ? data.values : undefined);
      }).catch(() => {});
    }
  }, [isOpen, northStar]);

  const { messages, isLoading, isStreaming, error, suggestedQuestions, sendMessage, clearChat, abortStream } =
    useAIChat({ context, northStar, values, userId: context?.userId });

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      abortStream();
    }
  }, [isOpen, abortStream]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedQuestion = (q: string) => {
    sendMessage(q);
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-x-0 top-4 bottom-0 z-[60] mx-auto w-full max-w-[430px] animate-chat-pop flex flex-col rounded-[28px] border border-white/30 bg-white/60 shadow-[0_-16px_60px_rgba(20,83,45,0.12)] backdrop-blur-2xl overflow-hidden">
        <div className="flex shrink-0 items-center justify-between rounded-t-[28px] border-b border-white/40 bg-white/50 px-5 py-3.5 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-md shadow-emerald-500/20">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-800">Asistent AI</h2>
              <p className="text-[10px] text-zinc-600">
                {context
                  ? `Vârsta Stilului de Viață: ${context.biologicalAge} ani`
                  : "Asistent personal de longevitate"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-white/50 hover:text-zinc-600"
                aria-label="Șterge conversația"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-white/50 hover:text-zinc-600"
              aria-label="Închide"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/30 text-emerald-500 backdrop-blur-sm">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-800">
                Bună{context ? `, ${context.displayName}` : ""}!
              </h3>
              <p className="mt-1 max-w-xs text-xs leading-relaxed text-zinc-700">
                Sunt asistentul tău personal de longevitate. Întreabă-mă orice despre
                scorurile tale, cum să le îmbunătățești, sau despre studiile din spatele
                recomandărilor.
              </p>
            </div>
          )}

          {messages.length === 0 && !isLoading && suggestedQuestions.length > 0 && (
            <SuggestedQuestions questions={suggestedQuestions} onSelect={handleSuggestedQuestion} />
          )}

          {messages.map((msg) =>
            msg.role === "user" ? (
              <UserChatBubble key={msg.id} content={msg.content} />
            ) : (
              <AIChatBubble
                key={msg.id}
                content={msg.content}
                isStreaming={isStreaming && msg === messages[messages.length - 1]}
              />
            )
          )}

          {error && (
            <div className="mb-3 rounded-2xl border border-red-200 bg-red-50/50 px-4 py-2.5 text-xs text-red-600">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="shrink-0 px-4 py-3">
          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-2 py-1.5 backdrop-blur-xl shadow-lg">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Scrie mesajul tău..."
              disabled={isStreaming}
              className="flex-1 bg-transparent px-3 py-1.5 text-sm text-zinc-700 placeholder-zinc-400 outline-none disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 disabled:opacity-40 disabled:shadow-none"
              aria-label="Trimite"
            >
              {isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes chatPop {
          0% { opacity: 0; transform: scale(0.92); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-chat-pop {
          animation: chatPop 0.2s ease-out;
        }
      `}      </style>
    </Portal>
  );
}
