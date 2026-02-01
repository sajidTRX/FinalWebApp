"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  X, 
  Send, 
  Check, 
  Undo2, 
  ChevronDown,
  Wand2,
  Minimize2,
  RefreshCw,
  Scissors,
  BookOpen,
  CheckCircle,
  MessageSquare,
  Clock,
  ArrowDown,
  Replace,
  GitCompare,
  Map
} from "lucide-react";
import { Editor } from "@tiptap/react";
import { useConceptMap } from "@/hooks/use-concept-map";
import { toast } from "@/components/ui/use-toast";

// ============ Types & Interfaces ============

interface AISelectionBubbleProps {
  editor: Editor | null;
}

interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  icon: React.ReactNode;
  color: string;
}

interface SelectionRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
}

interface AIEditHistory {
  id: string;
  action: string;
  originalText: string;
  newText: string;
  timestamp: Date;
}

type ToneOption = "professional" | "casual" | "friendly" | "academic";
type LengthOption = "short" | "medium" | "long";
type OutputMode = "replace" | "suggest" | "insert";
type UIState = "hidden" | "peek" | "expanded";

// ============ Constants ============

const QUICK_ACTIONS: QuickAction[] = [
  { 
    id: "rewrite", 
    label: "Rewrite", 
    prompt: "Rewrite this text to be clearer and more engaging:", 
    icon: <RefreshCw className="w-3.5 h-3.5" />,
    color: "from-blue-500 to-indigo-500"
  },
  { 
    id: "shorten", 
    label: "Shorten", 
    prompt: "Make this text more concise while keeping the meaning:", 
    icon: <Scissors className="w-3.5 h-3.5" />,
    color: "from-amber-500 to-orange-500"
  },
  { 
    id: "expand", 
    label: "Expand", 
    prompt: "Expand this text with more detail and depth:", 
    icon: <BookOpen className="w-3.5 h-3.5" />,
    color: "from-green-500 to-emerald-500"
  },
  { 
    id: "grammar", 
    label: "Fix grammar", 
    prompt: "Fix any grammar, spelling, or punctuation errors in this text:", 
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    color: "from-purple-500 to-violet-500"
  },
  { 
    id: "tone", 
    label: "Change tone", 
    prompt: "Rewrite this text in a different tone:", 
    icon: <MessageSquare className="w-3.5 h-3.5" />,
    color: "from-pink-500 to-rose-500"
  },
  { 
    id: "concept-map", 
    label: "AI Concept Map", 
    prompt: "", 
    icon: <Map className="w-3.5 h-3.5" />,
    color: "from-teal-500 to-cyan-500"
  },
];

const TONE_OPTIONS: { value: ToneOption; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "friendly", label: "Friendly" },
  { value: "academic", label: "Academic" },
];

const LENGTH_OPTIONS: { value: LengthOption; label: string }[] = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
];

// ============ Animation Variants ============

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const pillVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: "spring" as const, stiffness: 400, damping: 25 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8, 
    y: 10,
    transition: { duration: 0.15 }
  }
};

const expandedVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 }
  },
  exit: { 
    opacity: 0, 
    y: 20, 
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

const confirmPillVariants = {
  hidden: { opacity: 0, scale: 0.8, y: -5 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: "spring" as const, stiffness: 500, damping: 30, delay: 0.1 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    transition: { duration: 0.1 }
  }
};

const shimmerVariants = {
  initial: { backgroundPosition: "-200% 0" },
  animate: { 
    backgroundPosition: "200% 0",
    transition: { duration: 1.5, ease: "linear" as const, repeat: Infinity }
  }
};

// ============ Utility Functions ============

function getSelectionRect(editor: Editor): SelectionRect | null {
  const { view } = editor;
  const { from, to } = view.state.selection;
  
  if (from === to) return null;
  
  const start = view.coordsAtPos(from);
  const end = view.coordsAtPos(to);
  
  return {
    top: Math.min(start.top, end.top),
    left: Math.min(start.left, end.left),
    width: Math.abs(end.left - start.left) || 100,
    height: Math.abs(end.bottom - start.top),
    bottom: Math.max(start.bottom, end.bottom),
  };
}

function calculatePillPosition(
  selectionRect: SelectionRect,
  pillWidth: number = 180,
  pillHeight: number = 44
): { top: number; left: number; placement: "above" | "below" } {
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  const padding = 12;
  
  const spaceBelow = viewportHeight - selectionRect.bottom;
  const placement = spaceBelow > pillHeight + padding * 2 ? "below" : "above";
  
  const top = placement === "below" 
    ? selectionRect.bottom + padding 
    : selectionRect.top - pillHeight - padding;
  
  let left = selectionRect.left + (selectionRect.width / 2) - (pillWidth / 2);
  left = Math.max(padding, Math.min(left, viewportWidth - pillWidth - padding));
  
  return { top, left, placement };
}

// ============ Sub-Components ============

function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`
      bg-white/80 dark:bg-gray-900/80
      backdrop-blur-xl backdrop-saturate-150
      border border-white/20 dark:border-gray-700/50
      shadow-2xl shadow-black/10
      ${className}
    `}>
      {children}
    </div>
  );
}

function ActionChip({ 
  action, 
  onClick, 
  disabled 
}: { 
  action: QuickAction; 
  onClick: () => void; 
  disabled: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative group flex items-center gap-1.5 px-3 py-1.5
        bg-gray-100/80 hover:bg-gray-200/80 dark:bg-gray-800/80 dark:hover:bg-gray-700/80
        text-gray-700 dark:text-gray-300 text-sm font-medium
        rounded-full border border-gray-200/50 dark:border-gray-600/50
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      <span className={`
        p-0.5 rounded-full bg-gradient-to-r ${action.color}
        text-white
      `}>
        {action.icon}
      </span>
      {action.label}
    </motion.button>
  );
}

function SelectDropdown<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  label: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center justify-between gap-2 w-full px-3 py-1.5
          bg-gray-100/80 dark:bg-gray-800/80
          border border-gray-200/50 dark:border-gray-600/50
          rounded-lg text-sm text-gray-700 dark:text-gray-300
          hover:bg-gray-200/80 dark:hover:bg-gray-700/80
          transition-colors
        "
      >
        {options.find(o => o.value === value)?.label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="
                absolute top-full left-0 right-0 mt-1 z-20
                bg-white dark:bg-gray-800 
                border border-gray-200 dark:border-gray-700
                rounded-lg shadow-lg overflow-hidden
              "
            >
              {options.map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full px-3 py-2 text-left text-sm
                    hover:bg-gray-100 dark:hover:bg-gray-700
                    ${value === option.value ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-300"}
                  `}
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function OutputModeToggle({
  value,
  onChange,
}: {
  value: OutputMode;
  onChange: (value: OutputMode) => void;
}) {
  const modes: { value: OutputMode; label: string; icon: React.ReactNode }[] = [
    { value: "replace", label: "Replace", icon: <Replace className="w-3.5 h-3.5" /> },
    { value: "suggest", label: "Suggest", icon: <GitCompare className="w-3.5 h-3.5" /> },
    { value: "insert", label: "Insert", icon: <ArrowDown className="w-3.5 h-3.5" /> },
  ];
  
  return (
    <div>
      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Output</label>
      <div className="flex bg-gray-100/80 dark:bg-gray-800/80 rounded-lg p-0.5 border border-gray-200/50 dark:border-gray-600/50">
        {modes.map(mode => (
          <button
            key={mode.value}
            onClick={() => onChange(mode.value)}
            className={`
              flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-md text-xs font-medium
              transition-all duration-200
              ${value === mode.value 
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" 
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }
            `}
          >
            {mode.icon}
            <span className="hidden sm:inline">{mode.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function HistoryItem({ 
  edit, 
  onRestore 
}: { 
  edit: AIEditHistory; 
  onRestore: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="
        flex items-start gap-2 p-2
        bg-gray-50/50 dark:bg-gray-800/50
        rounded-lg border border-gray-100 dark:border-gray-700/50
      "
    >
      <Clock className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{edit.action}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{edit.newText.slice(0, 40)}...</p>
      </div>
      <button
        onClick={onRestore}
        className="text-xs text-blue-500 hover:text-blue-600 font-medium"
      >
        Restore
      </button>
    </motion.div>
  );
}

function LoadingShimmer() {
  return (
    <motion.div
      variants={shimmerVariants}
      initial="initial"
      animate="animate"
      className="
        absolute inset-0 rounded-2xl
        bg-gradient-to-r from-transparent via-white/40 to-transparent
        bg-[length:200%_100%]
      "
    />
  );
}

// ============ Main Component ============

export function AISelectionBubble({ editor }: AISelectionBubbleProps) {
  const { setConceptMapFromAI } = useConceptMap();

  // Core state
  const [uiState, setUIState] = useState<UIState>("hidden");
  const [selectedText, setSelectedText] = useState("");
  const [selectionRange, setSelectionRange] = useState<{ from: number; to: number } | null>(null);
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null);
  
  // AI state
  const [customPrompt, setCustomPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [originalText, setOriginalText] = useState("");
  const [showConfirmPill, setShowConfirmPill] = useState(false);
  const [confirmPillPosition, setConfirmPillPosition] = useState({ top: 0, left: 0 });
  
  // Options state
  const [tone, setTone] = useState<ToneOption>("professional");
  const [length, setLength] = useState<LengthOption>("medium");
  const [outputMode, setOutputMode] = useState<OutputMode>("replace");
  
  // History state
  const [editHistory, setEditHistory] = useState<AIEditHistory[]>([]);
  
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  
  // Derived state
  const wordCount = useMemo(() => 
    selectedText.split(/\s+/).filter(Boolean).length, 
    [selectedText]
  );
  
  // Track text selection
  useEffect(() => {
    if (!editor) return;
    
    const handleSelectionUpdate = () => {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, " ");
      
      if (text.trim().length > 0) {
        setSelectedText(text);
        setSelectionRange({ from, to });
        const rect = getSelectionRect(editor);
        setSelectionRect(rect);
        
        if (uiState === "hidden" && !showConfirmPill) {
          setUIState("peek");
        }
      } else if (!showConfirmPill) {
        setUIState("hidden");
        setSelectedText("");
        setSelectionRange(null);
        setSelectionRect(null);
      }
    };
    
    editor.on("selectionUpdate", handleSelectionUpdate);
    
    const handleScroll = () => {
      if (editor && selectionRange) {
        const rect = getSelectionRect(editor);
        setSelectionRect(rect);
      }
    };
    
    window.addEventListener("scroll", handleScroll, true);
    
    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [editor, uiState, showConfirmPill, selectionRange]);
  
  // Focus input when expanded
  useEffect(() => {
    if (uiState === "expanded" && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [uiState]);
  
  // AI call function
  const callAI = useCallback(async (prompt: string, text: string): Promise<string> => {
    let enhancedPrompt = prompt;
    if (tone !== "professional") {
      enhancedPrompt += ` Use a ${tone} tone.`;
    }
    if (length === "short") {
      enhancedPrompt += " Keep it brief and concise.";
    } else if (length === "long") {
      enhancedPrompt += " Make it detailed and comprehensive.";
    }
    
    const response = await fetch("http://localhost:8000/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: `${enhancedPrompt}\n\n"${text}"\n\nProvide only the rewritten text, no explanations or quotes.`,
          },
        ],
      }),
    });
    
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const detail = errBody.detail;
      let message = `AI request failed (${response.status})`;
      if (typeof detail === "string") message = detail;
      else if (Array.isArray(detail) && detail[0]?.msg) message = detail.map((d: { msg?: string }) => d.msg).join("; ");
      else if (detail && typeof detail === "object" && "message" in detail) message = String((detail as { message: string }).message);
      throw new Error(message);
    }
    
    const data = await response.json();
    return data.reply || text;
  }, [tone, length]);
  
  // Apply AI result with animation
  const applyAIResult = useCallback(async (prompt: string, actionLabel: string) => {
    if (!editor || !selectionRange || !selectedText) return;
    
    setIsLoading(true);
    setOriginalText(selectedText);
    
    try {
      const result = await callAI(prompt, selectedText);
      
      if (outputMode === "replace") {
        const editorElement = editor.view.dom;
        
        editorElement.classList.add("ai-shimmer-active");
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        editor
          .chain()
          .focus()
          .setTextSelection(selectionRange)
          .deleteSelection()
          .insertContent(result)
          .run();
        
        const newTo = selectionRange.from + result.length;
        setSelectionRange({ from: selectionRange.from, to: newTo });
        
        editorElement.classList.remove("ai-shimmer-active");
        editorElement.classList.add("ai-applied-success");
        
        setTimeout(() => {
          editorElement.classList.remove("ai-applied-success");
        }, 1000);
        
        const newRect = getSelectionRect(editor);
        if (newRect) {
          setConfirmPillPosition({
            top: newRect.bottom + 8,
            left: newRect.left + (newRect.width / 2) - 80,
          });
        }
        
        setEditHistory(prev => [
          {
            id: Date.now().toString(),
            action: actionLabel,
            originalText: selectedText,
            newText: result,
            timestamp: new Date(),
          },
          ...prev.slice(0, 2),
        ]);
        
        setSelectedText(result);
        setShowConfirmPill(true);
        setUIState("hidden");
        
      } else if (outputMode === "insert") {
        editor
          .chain()
          .focus()
          .setTextSelection(selectionRange.to)
          .insertContent(`\n\n${result}`)
          .run();
          
        setUIState("hidden");
      }
      
      setCustomPrompt("");
      
    } catch (error) {
      console.error("AI error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [editor, selectionRange, selectedText, callAI, outputMode]);
  
  // Generate concept map from document text via AI
  const handleAIConceptMap = useCallback(async () => {
    if (!editor) return;
    const doc = editor.state.doc;
    const fullText = doc.textBetween(0, doc.content.size, "\n");
    if (!fullText.trim()) {
      toast({
        title: "AI Concept Map",
        description: "Add some text to your document first, then try again.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/ai/concept-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: fullText }),
      });
      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        const detail = errBody.detail ?? `Request failed (${response.status})`;
        throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
      }
      const data = await response.json();
      const nodes = data.nodes ?? [];
      const links = data.links ?? [];
      setConceptMapFromAI(fullText, nodes, links);
      setUIState("hidden");
    } catch (error) {
      console.error("AI Concept Map error:", error);
      toast({
        title: "AI Concept Map",
        description: error instanceof Error ? error.message : "Failed to generate concept map.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [editor, setConceptMapFromAI]);

  // Handle quick action
  const handleQuickAction = useCallback((action: QuickAction) => {
    if (action.id === "concept-map") {
      handleAIConceptMap();
      return;
    }
    applyAIResult(action.prompt, action.label);
  }, [applyAIResult, handleAIConceptMap]);
  
  // Handle custom submit
  const handleCustomSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (customPrompt.trim()) {
      applyAIResult(customPrompt, "Custom edit");
    }
  }, [customPrompt, applyAIResult]);
  
  // Handle undo
  const handleUndo = useCallback(() => {
    if (!editor || !selectionRange || !originalText) return;
    
    editor
      .chain()
      .focus()
      .setTextSelection(selectionRange)
      .deleteSelection()
      .insertContent(originalText)
      .run();
    
    setSelectedText(originalText);
    setShowConfirmPill(false);
    setOriginalText("");
    setUIState("hidden");
    setSelectionRange(null);
  }, [editor, selectionRange, originalText]);
  
  // Handle keep
  const handleKeep = useCallback(() => {
    setShowConfirmPill(false);
    setOriginalText("");
    setUIState("hidden");
    setSelectedText("");
    setSelectionRange(null);
    
    if (editor) {
      const { to } = editor.state.selection;
      editor.commands.setTextSelection(to);
    }
  }, [editor]);
  
  // Handle history restore
  const handleRestoreFromHistory = useCallback((edit: AIEditHistory) => {
    if (!editor) return;
    
    editor
      .chain()
      .focus()
      .insertContent(edit.originalText)
      .run();
  }, [editor]);
  
  // Handle close
  const handleClose = useCallback(() => {
    setUIState("hidden");
    setSelectedText("");
    setSelectionRange(null);
    setSelectionRect(null);
    setCustomPrompt("");
    setShowConfirmPill(false);
    setOriginalText("");
  }, []);
  
  // Calculate pill position
  const pillPosition = useMemo(() => {
    if (!selectionRect) return { top: 100, left: 100, placement: "below" as const };
    return calculatePillPosition(selectionRect);
  }, [selectionRect]);
  
  if (!editor) return null;
  
  return (
    <>
      {/* Backdrop for expanded state - transparent, no blur */}
      <AnimatePresence>
        {uiState === "expanded" && (
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 z-40"
            onClick={() => setUIState("peek")}
          />
        )}
      </AnimatePresence>
      
      {/* Floating Peek Pill - Anchored near selection */}
      <AnimatePresence>
        {uiState === "peek" && selectionRect && !isLoading && (
          <motion.div
            ref={pillRef}
            variants={pillVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              position: "fixed",
              top: pillPosition.top,
              left: pillPosition.left,
              zIndex: 50,
            }}
          >
            <GlassPanel className="rounded-full">
              <div className="flex items-center gap-1 p-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setUIState("expanded")}
                  className="
                    flex items-center gap-2 px-3 py-2
                    bg-gradient-to-r from-violet-600 to-indigo-600
                    text-white text-sm font-medium
                    rounded-full
                    shadow-lg shadow-violet-500/25
                  "
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Tagore AI</span>
                </motion.button>
                
                <div className="hidden sm:flex items-center gap-1 px-1">
                  {QUICK_ACTIONS.slice(0, 2).map(action => (
                    <motion.button
                      key={action.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleQuickAction(action)}
                      className="
                        p-2 rounded-full
                        text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white
                        hover:bg-gray-100 dark:hover:bg-gray-800
                        transition-colors
                      "
                      title={action.label}
                    >
                      {action.icon}
                    </motion.button>
                  ))}
                </div>
                
                <button
                  onClick={handleClose}
                  className="
                    p-2 rounded-full
                    text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                    hover:bg-gray-100 dark:hover:bg-gray-800
                    transition-colors
                  "
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Loading Pill */}
      <AnimatePresence>
        {isLoading && selectionRect && (
          <motion.div
            variants={pillVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              position: "fixed",
              top: pillPosition.top,
              left: pillPosition.left,
              zIndex: 50,
            }}
          >
            <GlassPanel className="rounded-full overflow-hidden">
              <div className="relative flex items-center gap-2 px-4 py-2.5">
                <LoadingShimmer />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 text-violet-600" />
                </motion.div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tagore AI is thinking...
                </span>
              </div>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Expanded Panel - Bottom sheet anchored to bottom */}
      <AnimatePresence>
        {uiState === "expanded" && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50"
          >
            <GlassPanel className="rounded-t-3xl overflow-hidden border-t border-gray-200/50 dark:border-gray-700/50">
              <div className="max-w-4xl mx-auto p-5">
                {/* Drag handle */}
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                </div>
                
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="
                      p-2 rounded-xl
                      bg-gradient-to-br from-violet-600 to-indigo-600
                      shadow-lg shadow-violet-500/25
                    ">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Tagore AI</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {wordCount} word{wordCount !== 1 ? "s" : ""} selected
                      </p>
                    </div>
                  </div>
                  
                  {/* Quick actions in header for desktop */}
                  <div className="hidden md:flex items-center gap-2 flex-1 justify-center px-4">
                    {QUICK_ACTIONS.map(action => (
                      <ActionChip
                        key={action.id}
                        action={action}
                        onClick={() => handleQuickAction(action)}
                        disabled={isLoading}
                      />
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setUIState("peek")}
                      className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                    >
                      <Minimize2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleClose}
                      className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Quick actions for mobile */}
                <div className="flex md:hidden flex-wrap gap-2 mb-4">
                  {QUICK_ACTIONS.map(action => (
                    <ActionChip
                      key={action.id}
                      action={action}
                      onClick={() => handleQuickAction(action)}
                      disabled={isLoading}
                    />
                  ))}
                </div>
                
                {/* Main content row - horizontal layout */}
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Selected text preview */}
                  <div className="flex-1 p-3 bg-gray-50/80 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Selected text</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      "{selectedText}"
                    </p>
                  </div>
                  
                  {/* Options */}
                  <div className="flex gap-3 items-end">
                    <SelectDropdown
                      value={tone}
                      onChange={setTone}
                      options={TONE_OPTIONS}
                      label="Tone"
                    />
                    <SelectDropdown
                      value={length}
                      onChange={setLength}
                      options={LENGTH_OPTIONS}
                      label="Length"
                    />
                    <OutputModeToggle
                      value={outputMode}
                      onChange={setOutputMode}
                    />
                  </div>
                </div>
                
                {/* Custom prompt input */}
                <form onSubmit={handleCustomSubmit} className="mt-4">
                  <div className="
                    flex items-center gap-2 p-2
                    bg-gray-100/80 dark:bg-gray-800/80
                    rounded-xl border border-gray-200/50 dark:border-gray-600/50
                    focus-within:ring-2 focus-within:ring-violet-500/50 focus-within:border-violet-500
                    transition-all
                  ">
                    <Wand2 className="w-4 h-4 text-gray-400 ml-2" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Tell Tagore AI what to do..."
                      className="
                        flex-1 bg-transparent text-sm
                        text-gray-900 dark:text-white
                        placeholder-gray-400
                        focus:outline-none
                      "
                      disabled={isLoading}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={!customPrompt.trim() || isLoading}
                      className="
                        p-2 rounded-lg
                        bg-gradient-to-r from-violet-600 to-indigo-600
                        text-white
                        disabled:opacity-50 disabled:cursor-not-allowed
                        shadow-lg shadow-violet-500/25
                      "
                    >
                      <Send className="w-4 h-4" />
                    </motion.button>
                  </div>
                </form>
                
                {/* Edit history - horizontal scrolling */}
                {editHistory.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center gap-3">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Recent edits:</p>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {editHistory.map(edit => (
                          <button
                            key={edit.id}
                            onClick={() => handleRestoreFromHistory(edit)}
                            className="
                              flex items-center gap-1.5 px-2 py-1
                              bg-gray-100/80 hover:bg-gray-200/80 dark:bg-gray-800/50 dark:hover:bg-gray-700/50
                              rounded-lg text-xs text-gray-600 dark:text-gray-400
                              whitespace-nowrap transition-colors
                            "
                          >
                            <Clock className="w-3 h-3" />
                            {edit.action}
                            <span className="text-blue-500 hover:text-blue-600">Restore</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Keep/Undo Confirmation Pill - Near edited text */}
      <AnimatePresence>
        {showConfirmPill && (
          <motion.div
            variants={confirmPillVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              position: "fixed",
              top: confirmPillPosition.top,
              left: Math.max(16, Math.min(confirmPillPosition.left, window.innerWidth - 176)),
              zIndex: 50,
            }}
          >
            <GlassPanel className="rounded-full">
              <div className="flex items-center gap-1 p-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUndo}
                  className="
                    flex items-center gap-1.5 px-3 py-1.5
                    text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white
                    text-sm font-medium
                    rounded-full
                    hover:bg-gray-100 dark:hover:bg-gray-800
                    transition-colors
                  "
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  Undo
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleKeep}
                  className="
                    flex items-center gap-1.5 px-3 py-1.5
                    bg-gradient-to-r from-green-500 to-emerald-500
                    text-white text-sm font-medium
                    rounded-full
                    shadow-lg shadow-green-500/25
                  "
                >
                  <Check className="w-3.5 h-3.5" />
                  Keep
                </motion.button>
              </div>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

}
