import dagre from "dagre";
import { Node, Edge } from "@xyflow/react";

export function getInitials(name: string) {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

export const AVATAR_COLORS = [
  "#2e3090",
  "#4f46e5",
  "#0891b2",
  "#0d9488",
  "#16a34a",
  "#ca8a04",
  "#dc2626",
  "#9333ea",
  "#db2777",
  "#ea580c",
];

export function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction = "TB",
) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 60, ranksep: 80 });
  nodes.forEach((n) => g.setNode(n.id, { width: 220, height: 160 }));
  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);
  return {
    nodes: nodes.map((n) => {
      const pos = g.node(n.id);
      return { ...n, position: { x: pos.x - 110, y: pos.y - 80 } };
    }),
    edges,
  };
}
