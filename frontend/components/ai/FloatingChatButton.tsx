"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle } from "lucide-react";

interface Position {
  x: number;
  y: number;
}

const STORAGE_KEY = "neurosnap-chat-button-pos";
const DEFAULT_POSITION: Position = { x: 16, y: 200 };
const DRAG_THRESHOLD = 8;

export default function FloatingChatButton({ onClick }: { onClick: () => void }) {
  const [position, setPosition] = useState<Position>(DEFAULT_POSITION);

  const dragRef = useRef<{
    startX: number;
    startY: number;
    posX: number;
    posY: number;
  } | null>(null);
  const wasDragged = useRef(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setPosition(parsed);
        }
      }
    } catch (err) {
      console.warn("[FloatingChatButton] failed to parse saved position", err);
    }
  }, []);

  const savePosition = useCallback((pos: Position) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
    } catch (err) {
      console.warn("[FloatingChatButton] failed to save position", err);
    }
  }, []);

  const startDrag = useCallback(
    (clientX: number, clientY: number) => {
      wasDragged.current = false;
      dragRef.current = {
        startX: clientX,
        startY: clientY,
        posX: position.x,
        posY: position.y,
      };
    },
    [position]
  );

  const moveDrag = useCallback((clientX: number, clientY: number) => {
    if (!dragRef.current) return;

    const dx = clientX - dragRef.current.startX;
    const dy = clientY - dragRef.current.startY;

    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      wasDragged.current = true;
    }

    if (wasDragged.current) {
      const newX = Math.max(8, Math.min(window.innerWidth - 64, dragRef.current.posX + dx));
      const newY = Math.max(80, Math.min(window.innerHeight - 200, dragRef.current.posY + dy));
      setPosition({ x: newX, y: newY });
    }
  }, []);

  const endDrag = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragRef.current) return;

      if (wasDragged.current) {
        const dx = clientX - dragRef.current.startX;
        const dy = clientY - dragRef.current.startY;
        const newX = Math.max(8, Math.min(window.innerWidth - 64, dragRef.current.posX + dx));
        const newY = Math.max(80, Math.min(window.innerHeight - 200, dragRef.current.posY + dy));
        savePosition({ x: newX, y: newY });
      }

      dragRef.current = null;
    },
    [savePosition]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      startDrag(e.clientX, e.clientY);
    },
    [startDrag]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const t = e.touches[0];
      startDrag(t.clientX, t.clientY);
    },
    [startDrag]
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => moveDrag(e.clientX, e.clientY);
    const onMouseUp = (e: MouseEvent) => endDrag(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      moveDrag(t.clientX, t.clientY);
    };
    const onTouchEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      endDrag(t.clientX, t.clientY);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [moveDrag, endDrag]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (wasDragged.current) {
        e.preventDefault();
        e.stopPropagation();
        wasDragged.current = false;
        return;
      }
      onClick();
    },
    [onClick]
  );

  return (
    <button
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
      className="fixed z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 transition-transform duration-200 hover:scale-105 active:scale-95"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: "grab",
      }}
      suppressHydrationWarning
      aria-label="Deschide asistentul AI"
    >
      <MessageCircle className="h-6 w-6" />
    </button>
  );
}
