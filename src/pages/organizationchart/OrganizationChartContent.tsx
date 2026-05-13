import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getUserDetail } from "@/features/selectors/auth.selector";
import {
  useGetTeamPositions,
  useAddUpdateTeamPosition,
  useDeleteTeamPosition,
} from "@/features/api/companyTeam";
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  Edge,
  ConnectionLineType,
  useReactFlow,
  Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Plus, LayoutTemplate, Loader2 } from "lucide-react";

import { OrgNode } from "./components/OrgNode";
import { Toolbar } from "./components/Toolbar";
import { AddSeatModal } from "./components/AddSeatModal";
import { EditSeatSheet } from "./components/EditSeatSheet";
import { getLayoutedElements } from "./utils/orgChartUtils";

interface OrgChartNodeData extends Record<string, unknown> {
  label: string;
  title: string;
  department: string;
  employeeId: string;
  depth: number;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: (id: string) => void;
  onAddChild?: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const nodeTypes = { org: OrgNode };

export const OrganizationChartContent = () => {
  const user = useSelector(getUserDetail);
  const { data: positionsRes, isLoading } = useGetTeamPositions(
    user?.companyId as string,
  );
  const { mutate: addUpdatePosition, isPending: isAdding } =
    useAddUpdateTeamPosition();
  const { mutate: deletePosition } = useDeleteTeamPosition();
  const { fitView } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<
    Node<OrgChartNodeData>
  >([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [hiddenNodes, setHiddenNodes] = useState<Set<string>>(new Set());
  const [direction, setDirection] = useState<"TB" | "LR">("TB");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [visibleLevel, setVisibleLevel] = useState(10); // Default to a high number to show all
  const [maxLevel, setMaxLevel] = useState(1);

  // Build graph from API
  useEffect(() => {
    if (!positionsRes?.data) return;

    // 1. First, build a map of parent -> children to calculate depths
    const childMap: Record<string, string[]> = {};
    const posMap: Record<string, TeamPosition> = {};
    (positionsRes.data as TeamPosition[]).forEach((p) => {
      posMap[p.positionId] = p;
      if (p.parentPositionId) {
        if (!childMap[p.parentPositionId]) childMap[p.parentPositionId] = [];
        childMap[p.parentPositionId].push(p.positionId);
      }
    });

    // 2. Find root(s) - nodes with no parent or parent not in the list
    const roots = (positionsRes.data as TeamPosition[]).filter(
      (p) => !p.parentPositionId || !posMap[p.parentPositionId],
    );

    // 3. Recursive function to assign depth
    const depths: Record<string, number> = {};
    let currentMaxLevel = 1;
    const calculateDepth = (id: string, depth: number) => {
      depths[id] = depth;
      if (depth > currentMaxLevel) currentMaxLevel = depth;
      (childMap[id] || []).forEach((childId) =>
        calculateDepth(childId, depth + 1),
      );
    };
    roots.forEach((root) => calculateDepth(root.positionId, 1));
    setMaxLevel(currentMaxLevel);
    setVisibleLevel(currentMaxLevel); // Initially show all levels

    const rawNodes = (positionsRes.data as TeamPosition[]).map((pos) => ({
      id: pos.positionId,
      type: "org",
      data: {
        label: pos.employeeName || "Unassigned",
        title: pos.designationName || pos.employeeType || "No Title",
        department: pos.departmentName || "General",
        employeeId: pos.employeeId || "",
        depth: depths[pos.positionId] || 1,
      },
      position: { x: 0, y: 0 },
    }));

    const rawEdges = (positionsRes.data as TeamPosition[])
      .filter(
        (p) => p.parentPositionId && typeof p.parentPositionId === "string",
      )
      .map((p) => ({
        id: `e-${p.parentPositionId}-${p.positionId}`,
        source: p.parentPositionId as string,
        target: p.positionId,
        type: "step",
        style: { stroke: "#cbd5e1", strokeWidth: 1.5 },
      }));

    const { nodes: ln, edges: le } = getLayoutedElements(
      rawNodes,
      rawEdges,
      direction,
    );
    setNodes(ln as Node<OrgChartNodeData>[]);
    setEdges(le as Edge[]);
  }, [positionsRes, setNodes, setEdges, direction]);

  // Collapse/Expand helpers
  const getDescendants = useCallback(
    (parentId: string, edgeList: Edge[]): string[] => {
      const children = edgeList
        .filter((e) => e.source === parentId)
        .map((e) => e.target);
      return [
        ...children,
        ...children.flatMap((c) => getDescendants(c, edgeList)),
      ];
    },
    [],
  );

  const handleToggleExpand = useCallback(
    (nodeId: string) => {
      setHiddenNodes((prev) => {
        const next = new Set(prev);
        const desc = getDescendants(nodeId, edges);
        const expanded = !desc.some((d) => next.has(d));
        desc.forEach((d) => (expanded ? next.add(d) : next.delete(d)));
        return next;
      });
    },
    [edges, getDescendants],
  );

  const handleCollapseAll = useCallback(() => {
    // Hide all non-root nodes
    const roots = nodes
      .filter((n) => !edges.some((e) => e.target === n.id))
      .map((n) => n.id);
    const toHide = nodes.filter((n) => !roots.includes(n.id)).map((n) => n.id);
    setHiddenNodes(new Set(toHide));
  }, [nodes, edges]);

  const handleExpandAll = useCallback(() => {
    setHiddenNodes(new Set());
  }, []);

  const handleDelete = useCallback(
    (nodeId: string) => {
      // eslint-disable-next-line no-alert
      if (window.confirm("Remove this position and all its subordinates?")) {
        deletePosition(nodeId);
      }
    },
    [deletePosition],
  );

  const handleAddSubmit = (data: AddSeatFormData) => {
    addUpdatePosition(
      {
        employeeId: data.employeeId.join(","),
        parentPositionId: data.parentPositionId || null,
        // Add any other fields if needed, like isManager if API supports it
      },
      {
        onSuccess: () => {
          setIsAddOpen(false);
          setTimeout(() => fitView({ duration: 600 }), 300);
        },
      },
    );
  };

  // Computed display nodes
  const displayNodes = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return nodes
      .filter((n) => {
        const isWithinLevel = n.data.depth <= visibleLevel;
        if (!isWithinLevel) return false;
        if (!q) return true;
        return (
          n.data.label?.toLowerCase().includes(q) ||
          n.data.title?.toLowerCase().includes(q) ||
          n.data.department?.toLowerCase().includes(q)
        );
      })
      .map((node) => {
        const children = edges.filter((e) => e.source === node.id);
        const isExpanded = !children.some((c) => hiddenNodes.has(c.target));
        return {
          ...node,
          hidden: hiddenNodes.has(node.id),
          data: {
            ...node.data,
            hasChildren: children.length > 0,
            isExpanded,
            onToggleExpand: handleToggleExpand,
            onAddChild: () => setIsAddOpen(true),
            onEdit: (id: string) => {
              setEditingNodeId(id);
              setIsEditOpen(true);
            },
            onDelete: handleDelete,
          },
        };
      });
  }, [
    nodes,
    edges,
    hiddenNodes,
    searchQuery,
    handleToggleExpand,
    handleDelete,
    visibleLevel,
  ]);

  const displayEdges = useMemo(
    () =>
      edges.filter((e) => {
        const sourceNode = nodes.find((n) => n.id === e.source);
        const targetNode = nodes.find((n) => n.id === e.target);
        const isVisible =
          sourceNode &&
          targetNode &&
          sourceNode.data.depth < visibleLevel &&
          targetNode.data.depth <= visibleLevel &&
          !hiddenNodes.has(e.source) &&
          !hiddenNodes.has(e.target);
        return isVisible;
      }),
    [edges, hiddenNodes, nodes, visibleLevel],
  );

  const handleDirectionChange = (d: "TB" | "LR") => {
    setDirection(d);
    const { nodes: ln, edges: le } = getLayoutedElements(
      nodes.map((n) => ({ ...n })),
      edges.map((e) => ({ ...e })),
      d,
    );
    setNodes(ln as Node<OrgChartNodeData>[]);
    setEdges(le as Edge[]);
    setTimeout(() => fitView({ duration: 500 }), 100);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-85px)] w-full bg-white overflow-hidden">
      <Toolbar
        totalNodes={nodes.length}
        visibleLevel={visibleLevel}
        maxLevel={maxLevel}
        onLevelChange={setVisibleLevel}
        direction={direction}
        onDirectionChange={handleDirectionChange}
        onCollapseAll={handleCollapseAll}
        onExpandAll={handleExpandAll}
        onFitView={() => fitView({ duration: 500 })}
        onSearch={setSearchQuery}
        onAddSeat={() => setIsAddOpen(true)}
      />

      <div className="flex-1 relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm font-semibold text-slate-500">
                Building chart...
              </p>
            </div>
          </div>
        )}

        {!isLoading && nodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <LayoutTemplate className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-700">
                No positions yet
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Click "Add Position" to start building your org chart
              </p>
            </div>
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-all"
            >
              <Plus className="w-4 h-4" /> Add First Position
            </button>
          </div>
        )}

        <ReactFlow
          nodes={displayNodes}
          edges={displayEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          connectionLineType={ConnectionLineType.Step}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          minZoom={0.05}
          maxZoom={2}
        >
          <Background color="#f1f5f9" gap={24} size={1} />
        </ReactFlow>
      </div>

      {/* Add Seat Modal */}
      <AddSeatModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAddSubmit}
        isLoading={isAdding}
        positions={positionsRes?.data || []}
        companyId={user?.companyId}
      />

      {/* Edit Seat Sheet (Right Sidebar) */}
      <EditSeatSheet
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingNodeId(null);
        }}
        onSubmit={handleAddSubmit}
        isLoading={isAdding}
        positions={positionsRes?.data || []}
        companyId={user?.companyId}
        initialData={(() => {
          const node = nodes.find((n) => n.id === editingNodeId);
          if (!node) return null;
          return {
            seatTitle: node.data.title,
            employeeId: node.data.employeeId ? [node.data.employeeId] : [],
            roles: [{ value: "Lead and Manage" }],
            parentPositionId:
              (positionsRes?.data as TeamPosition[])?.find(
                (p) => p.positionId === editingNodeId,
              )?.parentPositionId || "",
            isDeptHead: false,
            isManager: false,
            createAnother: false,
          };
        })()}
      />
    </div>
  );
};
