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
  const isHorizontal = direction === "LR";
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 60, ranksep: 80 });
  nodes.forEach((n) => {
    const employeesCount =
      n.data?.employees && Array.isArray(n.data.employees)
        ? n.data.employees.length
        : 1;
    const nodeHeight = 60 + Math.max(1, employeesCount) * 45;
    g.setNode(n.id, { width: 220, height: nodeHeight });
  });
  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);

  const rankMap = new Map<number, number>();
  nodes.forEach((n) => {
    const pos = g.node(n.id);
    const coord = Math.round(isHorizontal ? pos.x : pos.y);
    const size = isHorizontal ? pos.width : pos.height;
    if (!rankMap.has(coord)) {
      rankMap.set(coord, size);
    } else {
      rankMap.set(coord, Math.max(rankMap.get(coord)!, size));
    }
  });

  return {
    nodes: nodes.map((n) => {
      const pos = g.node(n.id);
      if (isHorizontal) {
        const maxWidth = rankMap.get(Math.round(pos.x))!;
        return {
          ...n,
          position: { x: pos.x - maxWidth / 2, y: pos.y - pos.height / 2 },
        };
      } else {
        const maxHeight = rankMap.get(Math.round(pos.y))!;
        return {
          ...n,
          position: { x: pos.x - 110, y: pos.y - maxHeight / 2 },
        };
      }
    }),
    edges,
  };
}
