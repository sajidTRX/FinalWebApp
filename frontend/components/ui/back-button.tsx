"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  /** Optional href to navigate to instead of router.back() */
  href?: string;
  className?: string;
  /** Optional aria-label; defaults to "Back" */
  "aria-label"?: string;
}

export function BackButton({ href, className, "aria-label": ariaLabel = "Back" }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={`hover:bg-[#e8ddd0] text-[#3d3225] ${className ?? ""}`}
      aria-label={ariaLabel}
    >
      <ArrowLeft className="h-4 w-4 mr-2 shrink-0" />
      Back
    </Button>
  );
}
