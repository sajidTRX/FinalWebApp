"use client";

import React from "react";
import { MapIcon } from "lucide-react";
import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { useConceptMap } from "@/hooks/use-concept-map";

interface ConceptMapToggleProps {
	editor: Editor | null;
}

export function ConceptMapToggle({ editor }: ConceptMapToggleProps) {
	const { state, setModalOpen } = useConceptMap();

	React.useEffect(() => {
		if (!editor) return;

		const handler = (event: KeyboardEvent) => {
			const isModifier = event.metaKey || event.ctrlKey;
			if (isModifier && event.key.toLowerCase() === "m") {
				event.preventDefault();
				setModalOpen(!state.isModalOpen);
			}
			if (event.key === "Escape") {
				setModalOpen(false);
			}
		};

		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [editor, state.isModalOpen, setModalOpen]);

	const hasNodes = state.nodes.length > 0;

	return (
		<Button
			type="button"
			variant={hasNodes ? "default" : "outline"}
			size="sm"
			className="h-8 px-2 text-xs flex items-center gap-1 bg-[#4a3f32] text-[#efe6d5] hover:bg-[#3d3225]"
			onClick={() => setModalOpen(!state.isModalOpen)}
			title="Toggle concept map (Ctrl/Cmd+M)"
		>
			<MapIcon className="h-3 w-3" />
			<span className="hidden sm:inline">Concept Map</span>
			{state.nodes.length > 0 && (
				<span className="ml-1 rounded-full bg-[#efe6d5]/20 px-1 text-[10px]">
					{state.nodes.length}
				</span>
			)}
		</Button>
	);
}

