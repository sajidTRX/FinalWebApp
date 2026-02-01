"use client";

import React from "react";
import { Editor } from "@tiptap/react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { useConceptMap } from "@/hooks/use-concept-map";

interface SelectionPopupProps {
	editor: Editor | null;
}

interface SelectionRect {
	top: number;
	left: number;
	width: number;
	height: number;
	bottom: number;
}

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

export function ConceptMapSelectionPopup({ editor }: SelectionPopupProps) {
	const { addNodeFromSelection } = useConceptMap();
	const [visible, setVisible] = React.useState(false);
	const [position, setPosition] = React.useState<{ top: number; left: number } | null>(
		null
	);

	React.useEffect(() => {
		if (!editor) return;

		   const update = () => {
			   const rect = getSelectionRect(editor);
			   if (!rect) {
				   setVisible(false);
				   return;
			   }
			   const viewportWidth = window.innerWidth;
			   const pillWidth = 160;
			   const padding = 12;
			   let left = rect.left + rect.width / 2 - pillWidth / 2;
			   left = Math.max(padding, Math.min(left, viewportWidth - pillWidth - padding));
			   // Place well below the AI bubble (which is pillHeight + padding below selection)
			   const aiBubbleHeight = 44; // match pillHeight in AISelectionBubble
			   const aiBubblePadding = 12; // match padding in AISelectionBubble
			   const mapButtonSpacing = 12; // extra space between AI bubble and map button
			   const top = rect.bottom + aiBubblePadding + aiBubbleHeight + mapButtonSpacing;
			   setPosition({ top, left });
			   setVisible(true);
		   };

		editor.on("selectionUpdate", update);
		return () => {
			editor.off("selectionUpdate", update);
		};
	}, [editor]);

	const handleAdd = React.useCallback(() => {
		if (!editor) return;
		const { from, to } = editor.state.selection;
		if (from === to) return;
		const text = editor.state.doc.textBetween(from, to, "\n");
		
		// Generate a unique ID for the concept node
		const nodeId = crypto.randomUUID();
		
		// Apply highlight mark to the selected text
		editor.chain()
			.setTextSelection({ from, to })
			.setConceptHighlight(nodeId)
			.run();
		
		// Add the node with the generated ID
		addNodeFromSelection({ text, from, to }, nodeId);
		setVisible(false);
	}, [editor, addNodeFromSelection]);

	return (
		<AnimatePresence>
			{editor && visible && position && (
				<motion.button
					type="button"
					initial={{ opacity: 0, scale: 0.9, y: 4 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.9, y: 4 }}
					transition={{ type: "spring", stiffness: 400, damping: 25 }}
					onMouseDown={(e) => e.preventDefault()}
					onClick={handleAdd}
					className="fixed z-[60] flex items-center gap-1 rounded-full bg-[#4a3f32] px-3 py-1 text-xs text-[#efe6d5] shadow-lg border border-black/10"
					style={{
						top: position.top,
						left: position.left,
					}}
				>
					<Plus className="h-3 w-3" />
					<span>Add to Map</span>
				</motion.button>
			)}
		</AnimatePresence>
	);
}

