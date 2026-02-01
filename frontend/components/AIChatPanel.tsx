"use client";
import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  FormEvent,
  useCallback,
} from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { usePathname } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

// Minimal, permissive component overrides; props typed as any to avoid TS noise with react-markdown versions.
const MARKDOWN_COMPONENTS: Components = {
  code: (props: any) => {
    const { inline, className, children } = props;
    if (inline) {
      return (
        <code className="px-1 py-0.5 rounded bg-gray-800/70 text-gray-100">
          {children}
        </code>
      );
    }
    return (
      <pre className="rounded-md bg-gray-300 text-black p-3 text-xs whitespace-pre-wrap break-words overflow-x-hidden">
        <code className={className}>{children}</code>
      </pre>
    );
  },
  ul: (props: any) => (
    <ul className="list-disc ml-5 space-y-1">{props.children}</ul>
  ),
  ol: (props: any) => (
    <ol className="list-decimal ml-5 space-y-1">{props.children}</ol>
  ),
  p: (props: any) => <p className="mb-2 last:mb-0">{props.children}</p>,
  strong: (props: any) => (
    <strong className="font-semibold">{props.children}</strong>
  ),
  em: (props: any) => <em className="italic">{props.children}</em>,
};
import { X, Send, MessageCircle, Crown } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AIChatPanelProps {
  open: boolean;
  onClose: () => void;
  className?: string;
}

const DEFAULT_WIDTH = 420;
const MIN_WIDTH = 220;
const MAX_WIDTH = 720;
const MIN_TEXTAREA_HEIGHT = 36;
const MAX_TEXTAREA_HEIGHT = 200;

// Default (creative writing) suggestions used outside study-focused routes
const WRITING_SUGGESTIONS = [
  { emoji: "🧠", label: "Character development ideas" },
  { emoji: "📘", label: "Plot twists and story ideas" },
  { emoji: "✍️", label: "Writing style improvements" },
  { emoji: "💬", label: "Dialogue writing tips" },
  { emoji: "🗺️", label: "Scene and setting ideas" },
];

// Study suggestions for /note (subject oriented)
const STUDY_SUGGESTIONS = [
  { emoji: "🧪", label: "Explain this chemical reaction step-by-step" },
  { emoji: "🧬", label: "Describe the stages of cell division (mitosis)" },
  { emoji: "🧲", label: "Help me understand electromagnetic induction" },
  { emoji: "∫", label: "Solve a calculus integral with full reasoning" },
  { emoji: "💻", label: "Analyze algorithm time complexity example" },
  { emoji: "📜", label: "Compare two historical events (causes & impacts)" },
  { emoji: "📚", label: "Summarize a literature passage and its theme" },
  { emoji: "🧠", label: "Create mnemonic to remember biology terms" },
];

export default function AIChatPanel({
  open,
  onClose,
  className = "",
}: AIChatPanelProps) {
  const pathname = usePathname();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState(MIN_TEXTAREA_HEIGHT);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [panelWidth, setPanelWidth] = useState(DEFAULT_WIDTH);
  const panelWidthRef = useRef(panelWidth);
  const isResizingRef = useRef(false);
  const resizeStateRef = useRef({ startX: 0, startWidth: DEFAULT_WIDTH });
  const adjustTextareaHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.overflow = "hidden";
    el.style.height = "auto";
    const hasContent = input.trim().length > 0;
    const measuredHeight = hasContent
      ? el.scrollHeight
      : MIN_TEXTAREA_HEIGHT;
    const nextHeight = Math.min(
      Math.max(measuredHeight, MIN_TEXTAREA_HEIGHT),
      MAX_TEXTAREA_HEIGHT
    );
    el.style.height = `${nextHeight}px`;
    setTextareaHeight(nextHeight);
  }, [input]);

  // Decide which suggestion set to use based on current route.
  // For now we treat any path starting with /note as study mode.
  const activeSuggestions = pathname?.startsWith("/note")
    ? STUDY_SUGGESTIONS
    : WRITING_SUGGESTIONS;

  // Auto scroll on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  useEffect(() => {
    panelWidthRef.current = panelWidth;
  }, [panelWidth]);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!isResizingRef.current) return;
    event.preventDefault();
    const deltaX = event.clientX - resizeStateRef.current.startX;
    let newWidth = resizeStateRef.current.startWidth - deltaX;
    if (newWidth < MIN_WIDTH) newWidth = MIN_WIDTH;
    if (newWidth > MAX_WIDTH) newWidth = MAX_WIDTH;
    panelWidthRef.current = newWidth;
    if (panelRef.current) {
      panelRef.current.style.setProperty("--panel-width", `${newWidth}px`);
    }
  }, []);

  const stopResizing = useCallback(() => {
    if (isResizingRef.current) {
      isResizingRef.current = false;
      document.body.style.cursor = "";
      if (panelRef.current) {
        panelRef.current.classList.remove("resizing");
      }
    }
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", stopResizing);
    window.removeEventListener("pointercancel", stopResizing);
    setPanelWidth(panelWidthRef.current);
  }, [handlePointerMove]);

  useEffect(() => {
    return () => {
      stopResizing();
    };
  }, [stopResizing]);

  const beginResize = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!open) return;
      isResizingRef.current = true;
      resizeStateRef.current = {
        startX: event.clientX,
        startWidth: panelWidthRef.current,
      };
      document.body.style.cursor = "ew-resize";
      if (panelRef.current) {
        panelRef.current.classList.add("resizing");
      }
      window.addEventListener("pointermove", handlePointerMove, { passive: false });
      window.addEventListener("pointerup", stopResizing);
      window.addEventListener("pointercancel", stopResizing);
      event.preventDefault();
      event.stopPropagation();
    },
    [handlePointerMove, stopResizing, open]
  );

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);
    try {
      const res = await fetch("http://localhost:8000/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages,
            { role: "user", content: content.trim() },
          ].map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Request failed (${res.status})`);
      }
      const data = await res.json();
      const assistant: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply || "(Empty response)",
      };
      setMessages((prev) => [...prev, assistant]);
    } catch (e: any) {
      const assistant: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Error: ${e.message}`,
      };
      setMessages((prev) => [...prev, assistant]);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const showSuggestions = messages.length === 0;

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const widthValue = open ? panelWidth : 0;
    el.style.setProperty("--panel-width", `${widthValue}px`);
  }, [panelWidth, open]);

  useEffect(() => {
    if (!open) {
      stopResizing();
    }
  }, [open, stopResizing]);

  useLayoutEffect(() => {
    adjustTextareaHeight();
  }, [adjustTextareaHeight]);

  useEffect(() => {
    if (!open) return;
    adjustTextareaHeight();
  }, [adjustTextareaHeight, open]);

  return (
    <div
      ref={panelRef}
      className={`relative h-full transition-all duration-300 ease-in-out ${open ? "w-[420px] opacity-100" : "w-0 opacity-0"} border-l border-gray-200 bg-white overflow-hidden flex flex-col ${className}`}
      role="complementary"
      aria-label="AI writing chat panel"
    >
      {open && (
        <div
          className="absolute top-0 left-0 h-full w-1 cursor-ew-resize"
          onPointerDown={beginResize}
          aria-hidden="true"
        />
      )}
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-800 font-mono">
            AI Writing Assistant
          </h3>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
            <Crown className="h-3 w-3 text-yellow-600" /> Premium
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close AI Chat"
          className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Suggestions */}
      {showSuggestions && (
        <div className="p-4 border-b border-gray-200 bg-white">
          <p className="text-[11px] font-medium text-gray-600 mb-3 font-mono">
            Try asking me about:
          </p>
          <div className="grid grid-cols-1 gap-2">
            {activeSuggestions.map((s) => (
              <button
                key={s.label}
                onClick={() => sendMessage(s.label)}
                className="flex items-center gap-2 text-[11px] font-mono text-left rounded-md border border-gray-200 px-3 py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <span className="text-base leading-none">{s.emoji}</span>
                <span className="leading-snug">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-4 custom-scrollbar"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`prose prose-invert:prose-invert max-w-full text-sm font-mono leading-relaxed rounded-lg px-3 py-2 whitespace-pre-wrap markdown-content ${m.role === "user" ? "bg-gray-900 text-gray-100 ml-auto" : "bg-gray-100 text-gray-800 mr-auto"}`}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={MARKDOWN_COMPONENTS as Components}
            >
              {m.content}
            </ReactMarkdown>
          </div>
        ))}
        {sending && (
          <div className="text-xs text-gray-500 font-mono">Thinking...</div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-200 p-3 bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!sending && input.trim()) {
                  sendMessage(input);
                }
              }
            }}
            placeholder="Ask me anything"
            className="flex-1 min-h-[56px] max-h-[200px] whitespace-pre-wrap rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none overflow-hidden transition-[height] duration-200 ease-in-out"
            style={{ height: `${textareaHeight}px` }}
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={!input.trim() || sending}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 h-9 rounded-md px-3"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>

      <style jsx>{`
        div[role="complementary"] {
          width: var(--panel-width, ${DEFAULT_WIDTH}px);
        }
        div[role="complementary"].resizing {
          transition: none !important;
        }
      `}</style>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}
