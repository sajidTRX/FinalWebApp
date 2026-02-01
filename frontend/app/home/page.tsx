"use client";

import React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  FileText,
  Minimize2,
  Clock,
  HistoryIcon,
  Sliders,
  Star,
  ChevronRight,
  ChevronDown,
  User,
  Bell,
  HelpCircle,
  Settings,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/ui/back-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UserIcon from "@/components/ui/user-icon";

const modes = [
  {
    id: "novel",
    name: "Novel",
    path: "/novel/documents",
    icon: <BookOpen className="h-12 w-12 text-[#4a3f32]" />,
    description:
      "For writing long-form fiction with chapter management and creative tools.",
    features: [
      "Chapter organization",
      "AI writing assistance",
      "Character development",
    ],
    lastUsed: "2 hours ago",
    isFavorite: true,
    color: "bg-[#f5f0e8]",
  },
  {
    id: "note",
    name: "Note",
    path: "/note/documents",
    icon: <ClipboardList className="h-12 w-12 text-[#4a3f32]" />,
    description:
      "For academic notes with mathematical symbols and study tools.",
    features: ["Symbol insertion", "Formula support", "AI study assistance"],
    lastUsed: "Yesterday",
    isFavorite: true,
    color: "bg-[#f5f0e8]",
  },
  {
    id: "journal",
    name: "Journal",
    path: "/journal",
    icon: <Minimize2 className="h-12 w-12 text-[#4a3f32]" />,
    description: "Minimal interface for focused writing without distractions.",
    features: ["Hidden controls", "Focus timer", "Minimal UI"],
    lastUsed: "3 days ago",
    isFavorite: false,
    color: "bg-[#f5f0e8]",
  },
];

function CurrentClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formattedTime = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const formattedDate = time.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="text-right text-[#6b5d4d]">
      <div className="font-medium text-[clamp(0.75rem,1.5vw,0.875rem)]">{formattedTime}</div>
      <div className="text-[clamp(0.625rem,1.25vw,0.75rem)]">{formattedDate}</div>
    </div>
  );
}

export default function HomeScreen() {
  const [selectedMode, setSelectedMode] = useState("note");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const router = useRouter();

  const currentMode = modes.find((m) => m.id === selectedMode) || modes[1];

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "ArrowLeft") {
        e.preventDefault();
        router.back();
      }

      if (e.key === "Enter" && !isDropdownOpen) {
        router.push(currentMode.path);
      }

      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        if (isDropdownOpen) {
          e.preventDefault();
          const currentIndex = modes.findIndex((m) => m.id === selectedMode);
          if (e.key === "ArrowUp" && currentIndex > 0) {
            setSelectedMode(modes[currentIndex - 1].id);
          } else if (e.key === "ArrowDown" && currentIndex < modes.length - 1) {
            setSelectedMode(modes[currentIndex + 1].id);
          }
        }
      }

      if (e.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedMode, isDropdownOpen, currentMode.path, router]);

  const handleSelectMode = () => {
    router.push(currentMode.path);
  };

  return (
    <div className="flex h-screen w-full flex-col bg-[#f5e6c8] overflow-hidden">
      {/* Top Navigation Bar - touch-friendly tap targets */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <BackButton href="/landing" className="text-[#3d3225] min-h-[48px] min-w-[48px] px-3 py-2 rounded-xl focus-visible:ring-2 focus-visible:ring-[#4a3f32] focus-visible:ring-offset-2" aria-label="Back to landing" />
          <h1 className="text-[clamp(1rem,2.5vw,1.5rem)] font-semibold text-[#3d3225]">Tagore</h1>
        </div>
        <CurrentClock />
      </div>

      <div className="flex flex-1 overflow-auto min-h-0">
        {/* Main Content - white card fills width left and right */}
        <div className="flex-1 flex flex-col items-stretch justify-start px-2 sm:px-3 py-[2vh] min-h-0 w-full max-w-[98vw] sm:max-w-[96vw] mx-auto">
          {/* Header */}
          <div className="text-center mb-6 flex-shrink-0">
            <h1 className="text-[clamp(1.25rem,4vw,2rem)] font-serif text-[#3d3225]">
              What do you want to write?
            </h1>
          </div>

          {/* Mode Selection Card - full width of content area */}
          <div className="w-full flex-shrink-0">
            <div className="bg-[#fffcf7] rounded-2xl shadow-lg border border-[#e8dcc8]">
              <div className="p-6 sm:p-8 pb-8">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-xl bg-[#f5ede0] border border-[#d4c4a8]" aria-hidden="true">
                    {React.cloneElement(currentMode.icon, { className: "h-10 w-10 sm:h-12 sm:w-12 text-[#4a3f32]", "aria-hidden": "true" })}
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-[clamp(1rem,2vw,1.25rem)] font-semibold text-[#3d3225] text-center mb-1">
                  {currentMode.name}
                </h2>

                {/* Description */}
                <p className="text-[clamp(0.8rem,1.2vw,0.9rem)] text-[#6b5d4d] text-center mb-4 leading-relaxed">
                  {currentMode.description}
                </p>

                {/* Feature Tags */}
                <div className="flex flex-wrap justify-center gap-2 mb-5">
                  {currentMode.features.map((feature, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-[#d4c4a8] bg-[#f8f3eb] px-3 py-1.5 text-[clamp(0.7rem,1vw,0.8rem)] text-[#4a3f32]"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Mode Selector Dropdown - opens upward so all options (Novel, Note, Journal) stay visible */}
                <div className="mb-6">
                  <label id="mode-select-label" className="block text-[clamp(0.8rem,1.1vw,0.875rem)] text-[#6b5d4d] mb-2 font-medium">
                    Select Writing Mode
                  </label>
                  <div className="relative overflow-visible">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      aria-expanded={isDropdownOpen}
                      aria-haspopup="listbox"
                      aria-labelledby="mode-select-label"
                      className="w-full min-h-[48px] flex items-center justify-between px-4 py-3 bg-[#f8f3eb] border-2 border-[#d4c4a8] rounded-xl text-[clamp(0.9rem,1.2vw,1rem)] text-[#3d3225] hover:border-[#a89880] active:bg-[#f0ebe3] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4a3f32] focus-visible:ring-offset-2"
                    >
                      <span>{currentMode.name}</span>
                      <ChevronDown className={`h-6 w-6 text-[#6b5d4d] transition-transform flex-shrink-0 ${isDropdownOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                    </button>

                    {isDropdownOpen && (
                      <div
                        role="listbox"
                        aria-labelledby="mode-select-label"
                        className="absolute bottom-full left-0 right-0 mb-2 bg-[#fffcf7] border-2 border-[#d4c4a8] rounded-xl shadow-lg z-20 overflow-visible"
                      >
                        {modes.map((mode) => (
                          <button
                            key={mode.id}
                            type="button"
                            role="option"
                            aria-selected={selectedMode === mode.id}
                            onClick={() => {
                              setSelectedMode(mode.id);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full min-h-[48px] flex items-center gap-3 px-4 py-3 text-left text-[clamp(0.9rem,1.2vw,1rem)] hover:bg-[#f5f0e8] active:bg-[#efe6d5] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4a3f32] ${
                              selectedMode === mode.id ? "bg-[#f5f0e8]" : ""
                            }`}
                          >
                            <div className="flex-shrink-0" aria-hidden="true">
                              {React.cloneElement(mode.icon, { className: "h-6 w-6 text-[#4a3f32]" })}
                            </div>
                            <span className="text-[#3d3225]">{mode.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Select Mode Button - fully inside card with padding */}
                <button
                  type="button"
                  onClick={handleSelectMode}
                  className="w-full min-h-[48px] py-3.5 px-4 bg-[#8B4513] hover:bg-[#6d3610] active:bg-[#5a2d0d] text-white text-[clamp(0.95rem,1.2vw,1.05rem)] font-semibold rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4a3f32] focus-visible:ring-offset-2"
                >
                  Select Mode
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating User Icon - Bottom Left (48px min touch target) */}
      <div className="fixed bottom-6 left-4 sm:bottom-8 sm:left-6 z-40">
        <button
          type="button"
          onClick={() => router.push("/profile")}
          aria-label="Open profile"
          className="min-h-[48px] min-w-[48px] h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-[#2c3e50] text-white flex items-center justify-center text-lg font-semibold shadow-lg hover:bg-[#34495e] active:scale-95 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4a3f32] focus-visible:ring-offset-2"
        >
          N
        </button>
      </div>

      {/* Floating Settings Icon - Bottom Right (48px min touch target) */}
      <div className="fixed bottom-6 right-4 sm:bottom-8 sm:right-6 z-50">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            aria-label={isSettingsOpen ? "Close menu" : "Open menu"}
            aria-expanded={isSettingsOpen}
            aria-haspopup="menu"
            className="min-h-[48px] min-w-[48px] h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-[#4a3f32] text-white flex items-center justify-center shadow-lg hover:bg-[#5a4a3a] active:scale-95 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4a3f32] focus-visible:ring-offset-2"
          >
            <Settings className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
          </button>

          {isSettingsOpen && (
            <div
              role="menu"
              aria-label="Settings menu"
              className="absolute bottom-full right-0 mb-3 bg-[#fffcf7] border-2 border-[#d4c4a8] rounded-xl shadow-lg overflow-hidden min-w-[180px]"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  router.push("/device-settings");
                  setIsSettingsOpen(false);
                }}
                className="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 text-left text-base hover:bg-[#f5f0e8] active:bg-[#efe6d5] transition-colors text-[#3d3225] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4a3f32]"
              >
                <Settings className="h-5 w-5 text-[#4a3f32] flex-shrink-0" aria-hidden="true" />
                <span>Settings</span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  router.push("/profile");
                  setIsSettingsOpen(false);
                }}
                className="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 text-left text-base hover:bg-[#f5f0e8] active:bg-[#efe6d5] transition-colors text-[#3d3225] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4a3f32]"
              >
                <User className="h-5 w-5 text-[#4a3f32] flex-shrink-0" aria-hidden="true" />
                <span>Profile</span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  router.push("/help");
                  setIsSettingsOpen(false);
                }}
                className="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 text-left text-base hover:bg-[#f5f0e8] active:bg-[#efe6d5] transition-colors text-[#3d3225] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4a3f32]"
              >
                <HelpCircle className="h-5 w-5 text-[#4a3f32] flex-shrink-0" aria-hidden="true" />
                <span>Help</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
