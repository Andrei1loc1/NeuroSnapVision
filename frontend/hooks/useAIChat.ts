"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { ChatMessage, ChatContext, ChatStreamChunk } from "@/lib/types";
import { getSuggestedQuestions } from "@/lib/ai/knowledge-base";

interface UseAIChatOptions {
  context: ChatContext | null;
  northStar?: string;
  values?: string[];
  userId?: string;
}

interface UseAIChatResult {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  suggestedQuestions: string[];
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => void;
  abortStream: () => void;
}

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function loadMessages(userId: string): ChatMessage[] {
  if (typeof window === "undefined" || !userId) return [];
  try {
    const key = `neurosnap_chat_${userId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const dayMs = 24 * 60 * 60 * 1000;
    return parsed.filter((m: ChatMessage) => m.timestamp && Date.now() - m.timestamp < dayMs);
  } catch {
    return [];
  }
}

function saveMessages(userId: string, messages: ChatMessage[]) {
  if (typeof window === "undefined" || !userId) return;
  try {
    const key = `neurosnap_chat_${userId}`;
    const dayMs = 24 * 60 * 60 * 1000;
    const recent = messages.filter((m) => m.timestamp && Date.now() - m.timestamp < dayMs);
    localStorage.setItem(key, JSON.stringify(recent));
  } catch (err) {
    console.warn("[useAIChat] failed to persist chat messages", err);
  }
}

export function useAIChat({ context, northStar, values, userId }: UseAIChatOptions): UseAIChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (userId) return loadMessages(userId);
    return [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (userId && messages.length === 0) {
      const saved = loadMessages(userId);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved.length > 0) setMessages(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const suggestedQuestions = context
    ? getSuggestedQuestions(context.leverageDimension)
    : [];

  const sendMessage = useCallback(
    async (text: string) => {
      if (!context || !text.trim()) return;

      setError(null);
      setIsLoading(true);
      setIsStreaming(true);

      const userMsg: ChatMessage = {
        id: generateId(),
        role: "user",
        content: text,
        timestamp: Date.now(),
      };

      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        sources: [],
      };

      const newMessages = [...messages, userMsg, assistantMsg];
      setMessages(newMessages);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch("/api/ai-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            history: messages.slice(-6),
            context,
            northStar,
            values,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({ error: "Unknown error" }));
          setError(errData.error || `HTTP ${response.status}`);
          setIsLoading(false);
          setIsStreaming(false);
          const failMsgs = newMessages.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: "Eroare la comunicarea cu AI-ul. Încearcă din nou." }
              : m
          );
          setMessages(failMsgs);
          saveMessages(userId ?? "", failMsgs);
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          setError("No response body");
          setIsLoading(false);
          setIsStreaming(false);
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";
        let accumulatedContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (!data.trim()) continue;

            try {
              const chunk: ChatStreamChunk = JSON.parse(data);

              if (chunk.type === "text" && chunk.content) {
                accumulatedContent += chunk.content;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsg.id
                      ? { ...m, content: accumulatedContent }
                      : m
                  )
                );
              }

              if (chunk.type === "done") {
                setIsStreaming(false);
                setIsLoading(false);
                setMessages((prev) => {
                  const final = prev.map((m) =>
                    m.id === assistantMsg.id
                      ? { ...m, content: accumulatedContent }
                      : m
                  );
                  saveMessages(userId ?? "", final);
                  return final;
                });
              }
            } catch {
              // skip
            }
          }
        }

        setIsStreaming(false);
        setIsLoading(false);
        setMessages((prev) => {
          const final = prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: accumulatedContent || "Fără răspuns." }
              : m
          );
          saveMessages(userId ?? "", final);
          return final;
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          setIsStreaming(false);
          setIsLoading(false);
          saveMessages(userId ?? "", [...messages, userMsg]);
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to send message");
        setIsLoading(false);
        setIsStreaming(false);
        const failMsgs = newMessages.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: "Eroare de conexiune. Verifică dacă backend-ul rulează." }
            : m
        );
        setMessages(failMsgs);
        saveMessages(userId ?? "", failMsgs);
      }
    },
    [context, messages, northStar, values, userId]
  );

  const abortStream = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
    setIsLoading(false);
  }, []);

  const clearChat = useCallback(() => {
    abortStream();
    setMessages([]);
    setError(null);
    if (userId) {
      try {
        localStorage.removeItem(`neurosnap_chat_${userId}`);
      } catch (err) {
        console.warn("[useAIChat] failed to clear chat storage", err);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    suggestedQuestions,
    sendMessage,
    clearChat,
    abortStream,
  };
}