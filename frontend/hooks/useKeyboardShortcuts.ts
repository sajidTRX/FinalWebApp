"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

/**
 * Global keyboard shortcuts hook
 * Handles mode navigation shortcuts that work across all pages
 */
export function useGlobalKeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when Ctrl (or Cmd on Mac) is pressed
      if (!e.ctrlKey && !e.metaKey) return;

      // Prevent default browser behavior for our shortcuts
      const key = e.key.toLowerCase();

      // Global mode navigation shortcuts
      switch (key) {
        case "j":
          e.preventDefault();
          router.push("/journal");
          break;
        case "n":
          e.preventDefault();
          router.push("/novel/documents");
          break;
        case "t":
          e.preventDefault();
          router.push("/note/documents");
          break;
        case "h":
          e.preventDefault();
          router.push("/home");
          break;
        case "l":
          e.preventDefault();
          router.push("/landing");
          break;
        case "b":
          // Only go back if not on landing/home
          if (pathname !== "/landing" && pathname !== "/home" && pathname !== "/unlock") {
            e.preventDefault();
            router.back();
          }
          break;
        default:
          return; // Don't prevent default for other shortcuts
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router, pathname]);
}
