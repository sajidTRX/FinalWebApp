"use client";

import React from "react";
import { useEditor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Eraser,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface FormattingToolbarProps {
  editor: ReturnType<typeof useEditor> | null;
}

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32];
const LINE_HEIGHTS = ["1.0", "1.2", "1.4", "1.6", "1.8", "2.0"];

export function FormattingToolbar({ editor }: FormattingToolbarProps) {
  if (!editor) {
    return null;
  }

  // Force re-render when the selection changes so active states stay in sync
  const [, forceUpdate] = React.useState(0);
  React.useEffect(() => {
    if (!editor) return;
    const refresh = () => forceUpdate((v) => v + 1);
    editor.on("selectionUpdate", refresh);
    editor.on("transaction", refresh);
    return () => {
      editor.off("selectionUpdate", refresh);
      editor.off("transaction", refresh);
    };
  }, [editor]);

  const getCurrentFontSize = () => {
    const fontSize = editor.getAttributes("textStyle").fontSize;
    if (fontSize) {
      return parseInt(fontSize);
    }
    // Get default from editor DOM style
    const editorElement = editor.view.dom as HTMLElement;
    const computedStyle = window.getComputedStyle(editorElement);
    const fontSizePx = parseFloat(computedStyle.fontSize);
    return Math.round(fontSizePx) || 16;
  };

  const getCurrentLineHeight = () => {
    const lineHeight = editor.getAttributes("paragraph").lineHeight;
    return lineHeight || "1.6";
  };

  return (
    <div className="flex items-center gap-1 p-2 border-b border-[#a89880] bg-[#efe6d5] rounded-t-lg flex-wrap">
      {/* Undo/Redo */}
      <div className="flex items-center gap-1 border-r border-[#a89880] pr-2 mr-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-8 w-8 p-0 text-[#4a3f32] hover:bg-[#e8ddd0]"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="h-8 w-8 p-0 text-[#4a3f32] hover:bg-[#e8ddd0]"
          title="Redo (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Text Formatting */}
      <div className="flex items-center gap-1 border-r border-[#a89880] pr-2 mr-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "h-8 w-8 p-0 text-[#4a3f32] hover:bg-[#e8ddd0]",
            editor.isActive("bold") && "bg-[#e8ddd0]"
          )}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "h-8 w-8 p-0 text-[#4a3f32] hover:bg-[#e8ddd0]",
            editor.isActive("italic") && "bg-[#e8ddd0]"
          )}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn(
            "h-8 w-8 p-0 text-[#4a3f32] hover:bg-[#e8ddd0]",
            editor.isActive("underline") && "bg-[#e8ddd0]"
          )}
          title="Underline (Ctrl+U)"
        >
          <Underline className="h-4 w-4" />
        </Button>
      </div>

      {/* Headings */}
      <div className="flex items-center gap-1 border-r border-[#a89880] pr-2 mr-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn(
            "h-8 w-8 p-0 text-[#4a3f32] hover:bg-[#e8ddd0]",
            editor.isActive("heading", { level: 1 }) && "bg-[#e8ddd0]"
          )}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(
            "h-8 w-8 p-0 text-[#4a3f32] hover:bg-[#e8ddd0]",
            editor.isActive("heading", { level: 2 }) && "bg-[#e8ddd0]"
          )}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Lists */}
      <div className="flex items-center gap-1 border-r border-[#a89880] pr-2 mr-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "h-8 w-8 p-0 text-[#4a3f32] hover:bg-[#e8ddd0]",
            editor.isActive("bulletList") && "bg-[#e8ddd0]"
          )}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            "h-8 w-8 p-0 text-[#4a3f32] hover:bg-[#e8ddd0]",
            editor.isActive("orderedList") && "bg-[#e8ddd0]"
          )}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>

      {/* Quote */}
      <div className="flex items-center gap-1 border-r border-[#a89880] pr-2 mr-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(
            "h-8 w-8 p-0 text-[#4a3f32] hover:bg-[#e8ddd0]",
            editor.isActive("blockquote") && "bg-[#e8ddd0]"
          )}
          title="Quote Block"
        >
          <Quote className="h-4 w-4" />
        </Button>
      </div>

      {/* Font Size */}
      <div className="flex items-center gap-2 border-r border-[#a89880] pr-2 mr-1">
        <Select
          value={getCurrentFontSize().toString()}
          onValueChange={(value) => {
            editor.chain().focus().setFontSize(value).run();
          }}
        >
          <SelectTrigger className="h-8 w-16 text-xs bg-[#f5f0e8] border-[#a89880] text-[#3d3225]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#f5f0e8] border-[#a89880]">
            {FONT_SIZES.map((size) => (
              <SelectItem key={size} value={size.toString()} className="text-[#3d3225] focus:bg-[#e8ddd0]">
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Line Height */}
      <div className="flex items-center gap-2 border-r border-[#a89880] pr-2 mr-1">
        <Select
          value={getCurrentLineHeight()}
          onValueChange={(value) => {
            editor.chain().focus().setLineHeight(value).run();
          }}
        >
          <SelectTrigger className="h-8 w-16 text-xs bg-[#f5f0e8] border-[#a89880] text-[#3d3225]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#f5f0e8] border-[#a89880]">
            {LINE_HEIGHTS.map((lh) => (
              <SelectItem key={lh} value={lh} className="text-[#3d3225] focus:bg-[#e8ddd0]">
                {lh}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear Formatting */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        className="h-8 w-8 p-0 text-[#4a3f32] hover:bg-[#e8ddd0]"
        title="Clear Formatting"
      >
        <Eraser className="h-4 w-4" />
      </Button>
    </div>
  );
}

