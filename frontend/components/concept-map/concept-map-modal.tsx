"use client";

import React from "react";
import { Editor } from "@tiptap/react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapIcon, ListTree, Link2, Trash2, Plus, Minus } from "lucide-react";
import { useConceptMap } from "@/hooks/use-concept-map";
import type { ConceptNode, ConceptLink, ConceptRelationshipType } from "@/lib/types/concept-map";

interface ConceptMapModalProps {
	editor: Editor | null;
}

type ViewMode = "outline" | "map";

export function ConceptMapModal({ editor }: ConceptMapModalProps) {
	const {
		state,
		deleteNode,
		renameNode,
		deleteLink,
		addLink,
		setSelectedNode,
		setModalOpen,
		updateNodePosition,
	} = useConceptMap();
	const [view, setView] = React.useState<ViewMode>("outline");
	const [linkDialogOpen, setLinkDialogOpen] = React.useState(false);
	const [linkSourceId, setLinkSourceId] = React.useState<string | null>(null);

	const close = () => {
		setModalOpen(false);
	};

	// Single click just selects the node (no navigation)
	const handleSelectNode = (node: ConceptNode) => {
		setSelectedNode(node.id);
	};

	// Double click navigates to the text in the editor
	const handleDoubleClickNode = (node: ConceptNode) => {
		setSelectedNode(node.id);
		if (!editor) return;
		const { linkedTextStart: from, linkedTextEnd: to } = node;
		editor.commands.setTextSelection({ from, to });
		editor.commands.scrollIntoView();
		// Close modal so user can see the highlighted text
		close();
	};

	// Delete node and remove highlight from editor
	const handleDeleteNode = (nodeId: string) => {
		// Find the node to get its text positions
		const node = state.nodes.find((n) => n.id === nodeId);
		if (node && editor) {
			// Remove the highlight mark from the text range
			const { linkedTextStart: from, linkedTextEnd: to } = node;
			editor.chain()
				.setTextSelection({ from, to })
				.unsetConceptHighlight()
				.setTextSelection({ from: to, to }) // Move cursor to end to deselect
				.run();
		}
		// Delete the node from state
		deleteNode(nodeId);
	};

	const handleDeleteLink = (link: ConceptLink) => {
		deleteLink(link.id);
	};

	const handleOpenLinkDialog = (nodeId: string) => {
		setLinkSourceId(nodeId);
		setLinkDialogOpen(true);
	};

	const handleCreateLink = (targetId: string, type: ConceptRelationshipType, label?: string) => {
		if (linkSourceId && targetId !== linkSourceId) {
			addLink(linkSourceId, targetId, type, label);
		}
		setLinkDialogOpen(false);
		setLinkSourceId(null);
	};

	return (
		<AnimatePresence>
			{state.isModalOpen && (
				<>
					<motion.div
						className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={close}
					/>
					<motion.div
						className="fixed inset-4 z-[80] flex items-center justify-center"
						initial={{ opacity: 0, scale: 0.96, y: 8 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.96, y: 8 }}
						transition={{ type: "spring", stiffness: 320, damping: 26 }}
					>
						<div className="relative flex h-full max-h-[85vh] w-full max-w-6xl flex-col rounded-2xl border border-[#a89880] bg-[#f5f0e8] shadow-2xl">
							<div className="flex items-center justify-between border-b border-[#a89880] px-4 py-2 bg-[#efe6d5] rounded-t-2xl">
								<div className="flex items-center gap-2">
									<MapIcon className="h-4 w-4 text-[#4a3f32]" />
									<div className="flex flex-col">
										<span className="text-xs font-semibold text-[#3d3225]">
											Concept Map
										</span>
										<span className="text-[10px] text-[#6b5d4d]">
											Outline and visual map of key ideas
										</span>
									</div>
								</div>
								<button
									type="button"
									onClick={close}
									className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#a89880] bg-[#f5f0e8] text-[#4a3f32] hover:bg-[#e8ddd0]"
								>
									<X className="h-3 w-3" />
								</button>
							</div>

							<div className="flex items-center justify-between border-b border-[#a89880] px-4 py-1 text-[11px] bg-[#f5f0e8]">
								<div className="inline-flex gap-1 rounded-full bg-[#e0d4c2] p-0.5">
									<button
										type="button"
										onClick={() => setView("outline")}
										className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${
											view === "outline"
												? "bg-[#4a3f32] text-[#efe6d5]"
												: "text-[#4a3f32]"
										}`}
									>
										<ListTree className="h-3 w-3" /> Outline
									</button>
									<button
										type="button"
										onClick={() => setView("map")}
										className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${
											view === "map"
												? "bg-[#4a3f32] text-[#efe6d5]"
												: "text-[#4a3f32]"
										}`}
									>
										<MapIcon className="h-3 w-3" /> Map
									</button>
								</div>
								<span className="text-[10px] text-[#6b5d4d]">
									{state.nodes.length} concepts · {state.links.length} links
								</span>
							</div>

							<div className="flex-1 overflow-hidden p-3">
								{view === "outline" ? (
									<OutlineView
										nodes={state.nodes}
										links={state.links}
										selectedNodeId={state.selectedNodeId}
										onSelectNode={handleSelectNode}
										onDoubleClickNode={handleDoubleClickNode}
										onRenameNode={renameNode}
										onDeleteNode={handleDeleteNode}
										onDeleteLink={handleDeleteLink}
										onOpenLinkDialog={handleOpenLinkDialog}
									/>
								) : (
									<MapView
										nodes={state.nodes}
										links={state.links}
										selectedNodeId={state.selectedNodeId}
										onSelectNode={handleSelectNode}
										onDoubleClickNode={handleDoubleClickNode}
										onNodePositionChange={updateNodePosition}
									/>
								)}
							</div>
						</div>
					</motion.div>
					{/* Link Dialog */}
					{linkDialogOpen && linkSourceId && (
						<LinkDialog
							sourceNode={state.nodes.find((n) => n.id === linkSourceId)!}
							targetNodes={state.nodes.filter((n) => n.id !== linkSourceId)}
							onClose={() => {
								setLinkDialogOpen(false);
								setLinkSourceId(null);
							}}
							onCreateLink={handleCreateLink}
						/>
					)}				</>
			)}
		</AnimatePresence>
	);
}

interface OutlineProps {
	nodes: ConceptNode[];
	links: ConceptLink[];
	selectedNodeId: string | null;
	onSelectNode: (node: ConceptNode) => void;
	onDoubleClickNode: (node: ConceptNode) => void;
	onRenameNode: (id: string, title: string) => void;
	onDeleteNode: (id: string) => void;
	onDeleteLink: (link: ConceptLink) => void;
	onOpenLinkDialog: (nodeId: string) => void;
}

function OutlineView({
	nodes,
	links,
	selectedNodeId,
	onSelectNode,
	onDoubleClickNode,
	onRenameNode,
	onDeleteNode,
	onDeleteLink,
	onOpenLinkDialog,
}: OutlineProps) {
	const [editingId, setEditingId] = React.useState<string | null>(null);
	const [draftTitle, setDraftTitle] = React.useState("");

	const beginEdit = (node: ConceptNode) => {
		setEditingId(node.id);
		setDraftTitle(node.title);
	};

	const commitEdit = (id: string) => {
		const title = draftTitle.trim();
		if (title) {
			onRenameNode(id, title);
		}
		setEditingId(null);
	};

	return (
		<div className="flex h-full gap-3">
			<div className="flex-1 overflow-y-auto rounded-lg border border-[#d1c3ad] bg-[#f9f3ea] p-2 space-y-1 text-[11px]">
				{nodes.length === 0 && (
					<p className="py-4 text-center text-[#6b5d4d] text-[11px]">
						Select text in the editor and use "Add to Map" to create your first
						concept.
					</p>
				)}
				{nodes.map((node) => {
					const nodeLinks = links.filter(
						(l) => l.sourceNodeId === node.id || l.targetNodeId === node.id
					);
					return (
						<div
							key={node.id}
							className={`rounded-md border px-2 py-1.5 cursor-pointer flex flex-col gap-1 ${
								selectedNodeId === node.id
									? "border-[#4a3f32] bg-[#e4d6c2]"
									: "border-[#d1c3ad] bg-[#fdf8f1] hover:bg-[#f3e5d3]"
							}`}
							onClick={() => onSelectNode(node)}
							onDoubleClick={() => onDoubleClickNode(node)}
							title="Double-click to jump to text in editor"
						>
							<div className="flex items-center justify-between gap-2">
								{editingId === node.id ? (
									<input
										value={draftTitle}
										onChange={(e) => setDraftTitle(e.target.value)}
										onBlur={() => commitEdit(node.id)}
										onKeyDown={(e) => {
											if (e.key === "Enter") commitEdit(node.id);
											if (e.key === "Escape") setEditingId(null);
										}}
										autoFocus
										className="min-w-0 flex-1 rounded bg-white px-1 py-0.5 text-[11px] text-[#3d3225] border border-[#c0b29b]"
									/>
								) : (
									<div className="min-w-0 flex-1 truncate font-medium text-[#3d3225]">
										{node.title}
									</div>
								)}
								<span className="ml-1 rounded-full bg-[#4a3f32] px-2 py-0.5 text-[10px] text-[#efe6d5] capitalize">
									{node.type}
								</span>
							</div>
							{nodeLinks.length > 0 && (
								<div className="flex flex-wrap gap-1 text-[10px] text-[#6b5d4d]">
									{nodeLinks.map((link) => (
										<button
											key={link.id}
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												onDeleteLink(link);
											}}
											className="inline-flex items-center gap-1 rounded-full bg-[#e0d4c2] px-2 py-0.5 hover:bg-[#d3c2aa]"
										>
											<Link2 className="h-2.5 w-2.5" />
											<span>{link.type}</span>
											<Trash2 className="h-2.5 w-2.5" />
										</button>
									))}
								</div>
							)}
							<div className="flex justify-end gap-1 text-[10px]">
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										onOpenLinkDialog(node.id);
									}}
									className="rounded border border-[#c0b29b] px-1 py-0.5 text-[#4a3f32] hover:bg-[#e8ddd0] flex items-center gap-1"
									disabled={nodes.length < 2}
									title={nodes.length < 2 ? "Add more concepts to create links" : "Link to another concept"}
								>
									<Link2 className="h-2.5 w-2.5" />
									Link
								</button>
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										beginEdit(node);
									}}
									className="rounded border border-[#c0b29b] px-1 py-0.5 text-[#4a3f32] hover:bg-[#e8ddd0]"
								>
									Rename
								</button>
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										onDeleteNode(node.id);
									}}
									className="rounded border border-[#c0b29b] px-1 py-0.5 text-[#4a3f32] hover:bg-[#e8ddd0] flex items-center gap-1"
								>
									<Trash2 className="h-2.5 w-2.5" />
									Delete
								</button>
							</div>
						</div>
					);
				})}
			</div>
			<div className="w-40 flex flex-col rounded-lg border border-[#d1c3ad] bg-[#f9f3ea] p-2 text-[10px] text-[#4a3f32]">
				<p className="mb-1 font-semibold text-[11px]">Tips</p>
				<ul className="space-y-1 list-disc pl-4">
					<li>Use Cmd/Ctrl+M to toggle this map.</li>
					<li>
						Double-click a concept to jump to its highlighted text in the editor.
					</li>
					<li>
						Drag nodes in Map view to organize your story structure visually.
					</li>
					<li>
						Concept text is highlighted in the editor with a light cream color.
					</li>
				</ul>
			</div>
		</div>
	);
}

interface MapViewProps {
	nodes: ConceptNode[];
	links: ConceptLink[];
	selectedNodeId: string | null;
	onSelectNode: (node: ConceptNode) => void;
	onDoubleClickNode: (node: ConceptNode) => void;
  onNodePositionChange: (id: string, position: { x: number; y: number }) => void;
}

function MapView({
	nodes,
	links,
	selectedNodeId,
	onSelectNode,
	onDoubleClickNode,
	onNodePositionChange,
}: MapViewProps) {
	const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
	const [draggingId, setDraggingId] = React.useState<string | null>(null);
	const [zoom, setZoom] = React.useState<number>(1);
	const offsetRef = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });
	const lastClickTimeRef = React.useRef<number>(0);
	const lastClickNodeRef = React.useRef<string | null>(null);

	const handleZoomIn = () => {
		setZoom((prev) => Math.min(prev + 0.2, 3)); // Max zoom 3x
	};

	const handleZoomOut = () => {
		setZoom((prev) => Math.max(prev - 0.2, 0.4)); // Min zoom 0.4x
	};

	const handleResetZoom = () => {
		setZoom(1);
	};

	React.useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const dpr = window.devicePixelRatio || 1;
		const rect = canvas.getBoundingClientRect();
		canvas.width = rect.width * dpr;
		canvas.height = rect.height * dpr;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

		// Compute centering offset based on node positions
		if (nodes.length > 0) {
			let minX = nodes[0].position.x;
			let maxX = nodes[0].position.x;
			let minY = nodes[0].position.y;
			let maxY = nodes[0].position.y;
			nodes.forEach((n) => {
				minX = Math.min(minX, n.position.x);
				maxX = Math.max(maxX, n.position.x);
				minY = Math.min(minY, n.position.y);
				maxY = Math.max(maxY, n.position.y);
			});
			const width = Math.max(maxX - minX, 1);
			const height = Math.max(maxY - minY, 1);
			const centerX = minX + width / 2;
			const centerY = minY + height / 2;
			const offsetX = rect.width / 2 - centerX * zoom;
			const offsetY = rect.height / 2 - centerY * zoom;
			offsetRef.current = { x: offsetX, y: offsetY };
		} else {
			offsetRef.current = { x: rect.width / 2, y: rect.height / 2 };
		}

		ctx.clearRect(0, 0, rect.width, rect.height);
		ctx.fillStyle = "#f5f0e8";
		ctx.fillRect(0, 0, rect.width, rect.height);

		// Optional subtle grid (scaled)
		const gridSize = 40 * zoom;
		ctx.strokeStyle = "#e2d6c4";
		ctx.lineWidth = 0.5;
		for (let x = 0; x < rect.width; x += gridSize) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, rect.height);
			ctx.stroke();
		}
		for (let y = 0; y < rect.height; y += gridSize) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(rect.width, y);
			ctx.stroke();
		}

		// Draw links
		ctx.strokeStyle = "#b19b7a";
		ctx.lineWidth = 1 * zoom;
		links.forEach((link) => {
			const source = nodes.find((n) => n.id === link.sourceNodeId);
			const target = nodes.find((n) => n.id === link.targetNodeId);
			if (!source || !target) return;
			const sx = source.position.x * zoom + offsetRef.current.x;
			const sy = source.position.y * zoom + offsetRef.current.y;
			const tx = target.position.x * zoom + offsetRef.current.x;
			const ty = target.position.y * zoom + offsetRef.current.y;

			ctx.beginPath();
			ctx.moveTo(sx, sy);
			ctx.lineTo(tx, ty);
			ctx.stroke();

			const midX = (sx + tx) / 2;
			const midY = (sy + ty) / 2;
			ctx.fillStyle = "#4a3f32";
			ctx.font = `${10 * zoom}px system-ui`;
			const label = link.label || link.type;
			ctx.fillText(label, midX + 4, midY - 4);
		});

		// Draw nodes
		nodes.forEach((node) => {
			const radius = 18 * zoom;
			const x = node.position.x * zoom + offsetRef.current.x;
			const y = node.position.y * zoom + offsetRef.current.y;
			
			// Draw circle
			ctx.beginPath();
			ctx.fillStyle =
				selectedNodeId === node.id ? "#4a3f32" : "#e0d4c2";
			ctx.strokeStyle = "#4a3f32";
			ctx.lineWidth = (selectedNodeId === node.id ? 2.5 : 1.5) * zoom;
			ctx.arc(x, y, radius, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();

			// Draw label below the circle
			ctx.fillStyle = "#3d3225";
			ctx.font = `${11 * zoom}px system-ui`;
			ctx.textAlign = "center";
			ctx.textBaseline = "top";
			
			// Draw background for text readability
			const text = node.title.length > 24 ? `${node.title.slice(0, 22)}…` : node.title;
			const textWidth = ctx.measureText(text).width;
			const labelY = y + radius + 6 * zoom;
			
			ctx.fillStyle = "#f5f0e8";
			ctx.fillRect(x - textWidth / 2 - 4, labelY - 2, textWidth + 8, 16 * zoom);
			
			// Draw text
			ctx.fillStyle = selectedNodeId === node.id ? "#4a3f32" : "#5a4d3d";
			ctx.font = selectedNodeId === node.id ? `bold ${11 * zoom}px system-ui` : `${11 * zoom}px system-ui`;
			ctx.fillText(text, x, labelY);
		});
	}, [nodes, links, selectedNodeId, zoom]);

	const handlePointerDown = (
		event: React.PointerEvent<HTMLCanvasElement>
	) => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		const hit = nodes.find((node) => {
			const nx = node.position.x * zoom + offsetRef.current.x;
			const ny = node.position.y * zoom + offsetRef.current.y;
			const dx = x - nx;
			const dy = y - ny;
			return Math.sqrt(dx * dx + dy * dy) <= 22 * zoom;
		});
		if (hit) {
			const now = Date.now();
			const isDoubleClick = 
				now - lastClickTimeRef.current < 300 && 
				lastClickNodeRef.current === hit.id;
			
			if (isDoubleClick) {
				// Double-click: navigate to text
				onDoubleClickNode(hit);
				lastClickTimeRef.current = 0;
				lastClickNodeRef.current = null;
			} else {
				// Single click: select and prepare for drag
				setDraggingId(hit.id);
				onSelectNode(hit);
				canvas.style.cursor = "grabbing";
				lastClickTimeRef.current = now;
				lastClickNodeRef.current = hit.id;
			}
		}
	};

	const handlePointerMove = (
		event: React.PointerEvent<HTMLCanvasElement>
	) => {
		if (!draggingId) return;
		const canvas = canvasRef.current;
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		// Convert back to logical coordinates before persisting (accounting for zoom)
		const logicalX = (x - offsetRef.current.x) / zoom;
		const logicalY = (y - offsetRef.current.y) / zoom;
		onNodePositionChange(draggingId, { x: logicalX, y: logicalY });
	};

	const handlePointerUp = () => {
		setDraggingId(null);
		const canvas = canvasRef.current;
		if (canvas) canvas.style.cursor = "default";
	};

	return (
		<div className="relative h-full w-full rounded-lg border border-[#d1c3ad] bg-[#f9f3ea] overflow-hidden">
			<canvas
				ref={canvasRef}
				className="h-full w-full"
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				onPointerLeave={handlePointerUp}
			/>
			{/* Zoom Controls - Google Maps style */}
			<div className="absolute bottom-3 right-3 flex flex-col gap-1 z-10">
				<button
					type="button"
					onClick={handleZoomIn}
					className="flex h-8 w-8 items-center justify-center rounded-md border border-[#a89880] bg-white shadow-md hover:bg-[#f5f0e8] transition-colors"
					title="Zoom in"
				>
					<Plus className="h-4 w-4 text-[#4a3f32]" />
				</button>
				<button
					type="button"
					onClick={handleResetZoom}
					className="flex h-8 w-8 items-center justify-center rounded-md border border-[#a89880] bg-white shadow-md hover:bg-[#f5f0e8] transition-colors text-[10px] font-medium text-[#4a3f32]"
					title="Reset zoom"
				>
					{Math.round(zoom * 100)}%
				</button>
				<button
					type="button"
					onClick={handleZoomOut}
					className="flex h-8 w-8 items-center justify-center rounded-md border border-[#a89880] bg-white shadow-md hover:bg-[#f5f0e8] transition-colors"
					title="Zoom out"
				>
					<Minus className="h-4 w-4 text-[#4a3f32]" />
				</button>
			</div>
		</div>
	);
}

// ============ Link Dialog ============

const RELATIONSHIP_TYPES: { value: ConceptRelationshipType; label: string; description: string }[] = [
	{ value: "causes", label: "Causes", description: "This concept leads to or triggers the other" },
	{ value: "supports", label: "Supports", description: "This concept reinforces or backs up the other" },
	{ value: "conflicts", label: "Conflicts", description: "These concepts are in tension or opposition" },
	{ value: "relates-to", label: "Relates to", description: "General connection between concepts" },
	{ value: "contrasts", label: "Contrasts", description: "These concepts highlight differences" },
	{ value: "extends", label: "Extends", description: "This concept builds upon or elaborates the other" },
];

interface LinkDialogProps {
	sourceNode: ConceptNode;
	targetNodes: ConceptNode[];
	onClose: () => void;
	onCreateLink: (targetId: string, type: ConceptRelationshipType, label?: string) => void;
}

function LinkDialog({ sourceNode, targetNodes, onClose, onCreateLink }: LinkDialogProps) {
	const [selectedTargetId, setSelectedTargetId] = React.useState<string | null>(
		targetNodes.length > 0 ? targetNodes[0].id : null
	);
	const [selectedType, setSelectedType] = React.useState<ConceptRelationshipType>("relates-to");
	const [customLabel, setCustomLabel] = React.useState("");

	const handleSubmit = () => {
		if (!selectedTargetId) return;
		onCreateLink(selectedTargetId, selectedType, customLabel.trim() || undefined);
	};

	return (
		<motion.div
			className="fixed inset-0 z-[90] flex items-center justify-center"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
		>
			<div
				className="absolute inset-0 bg-black/30"
				onClick={onClose}
			/>
			<motion.div
				className="relative z-10 w-full max-w-md rounded-xl border border-[#a89880] bg-[#f5f0e8] shadow-2xl"
				initial={{ scale: 0.95, y: 10 }}
				animate={{ scale: 1, y: 0 }}
				exit={{ scale: 0.95, y: 10 }}
				transition={{ type: "spring", stiffness: 400, damping: 30 }}
			>
				<div className="flex items-center justify-between border-b border-[#a89880] px-4 py-3 bg-[#efe6d5] rounded-t-xl">
					<div className="flex items-center gap-2">
						<Link2 className="h-4 w-4 text-[#4a3f32]" />
						<span className="text-sm font-semibold text-[#3d3225]">Create Link</span>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#a89880] bg-[#f5f0e8] text-[#4a3f32] hover:bg-[#e8ddd0]"
					>
						<X className="h-3 w-3" />
					</button>
				</div>

				<div className="p-4 space-y-4">
					{/* Source Node */}
					<div>
						<label className="block text-[10px] font-medium text-[#6b5d4d] mb-1">From</label>
						<div className="rounded-md border border-[#d1c3ad] bg-[#fdf8f1] px-3 py-2 text-sm text-[#3d3225]">
							{sourceNode.title}
							<span className="ml-2 rounded-full bg-[#4a3f32] px-2 py-0.5 text-[10px] text-[#efe6d5] capitalize">
								{sourceNode.type}
							</span>
						</div>
					</div>

					{/* Target Node Select */}
					<div>
						<label className="block text-[10px] font-medium text-[#6b5d4d] mb-1">To</label>
						{targetNodes.length === 0 ? (
							<p className="text-xs text-[#6b5d4d] italic">No other concepts available</p>
						) : (
							<select
								value={selectedTargetId || ""}
								onChange={(e) => setSelectedTargetId(e.target.value)}
								className="w-full rounded-md border border-[#d1c3ad] bg-[#fdf8f1] px-3 py-2 text-sm text-[#3d3225] focus:outline-none focus:ring-1 focus:ring-[#4a3f32]"
							>
								{targetNodes.map((node) => (
									<option key={node.id} value={node.id}>
										{node.title} ({node.type})
									</option>
								))}
							</select>
						)}
					</div>

					{/* Relationship Type */}
					<div>
						<label className="block text-[10px] font-medium text-[#6b5d4d] mb-1">Relationship</label>
						<div className="grid grid-cols-2 gap-1.5">
							{RELATIONSHIP_TYPES.map((rt) => (
								<button
									key={rt.value}
									type="button"
									onClick={() => setSelectedType(rt.value)}
									className={`rounded-md border px-2 py-1.5 text-left text-[11px] transition-colors ${
										selectedType === rt.value
											? "border-[#4a3f32] bg-[#4a3f32] text-[#efe6d5]"
											: "border-[#d1c3ad] bg-[#fdf8f1] text-[#3d3225] hover:bg-[#f3e5d3]"
									}`}
									title={rt.description}
								>
									{rt.label}
								</button>
							))}
						</div>
						<p className="mt-1 text-[10px] text-[#6b5d4d]">
							{RELATIONSHIP_TYPES.find((rt) => rt.value === selectedType)?.description}
						</p>
					</div>

					{/* Custom Label (optional) */}
					<div>
						<label className="block text-[10px] font-medium text-[#6b5d4d] mb-1">
							Custom Label <span className="text-[#a89880]">(optional)</span>
						</label>
						<input
							type="text"
							value={customLabel}
							onChange={(e) => setCustomLabel(e.target.value)}
							placeholder="e.g., 'foreshadows', 'inspires'"
							className="w-full rounded-md border border-[#d1c3ad] bg-[#fdf8f1] px-3 py-2 text-sm text-[#3d3225] placeholder:text-[#b5a68f] focus:outline-none focus:ring-1 focus:ring-[#4a3f32]"
						/>
					</div>
				</div>

				{/* Actions */}
				<div className="flex justify-end gap-2 border-t border-[#a89880] px-4 py-3 bg-[#efe6d5] rounded-b-xl">
					<button
						type="button"
						onClick={onClose}
						className="rounded-md border border-[#a89880] bg-[#f5f0e8] px-3 py-1.5 text-xs font-medium text-[#4a3f32] hover:bg-[#e8ddd0]"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={handleSubmit}
						disabled={!selectedTargetId || targetNodes.length === 0}
						className="rounded-md bg-[#4a3f32] px-3 py-1.5 text-xs font-medium text-[#efe6d5] hover:bg-[#3d3225] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
					>
						<Plus className="h-3 w-3" />
						Create Link
					</button>
				</div>
			</motion.div>
		</motion.div>
	);
}
