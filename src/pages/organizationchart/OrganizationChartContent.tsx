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
  useViewport,
  Panel,
  Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Plus,
  LayoutTemplate,
  Loader2,
  Minus,
  Maximize2,
  Layers,
} from "lucide-react";

import { OrgNode } from "./components/OrgNode";
import { Toolbar } from "./components/Toolbar";
import { AddSeatModal } from "./components/AddSeatModal";
import { EditSeatSheet } from "./components/EditSeatSheet";
import { getLayoutedElements } from "./utils/orgChartUtils";

interface OrgChartNodeData extends Record<string, unknown> {
  seatTitle: string;
  department: string;
  employees: AssignedEmployee[];
  depth: number;
  label?: string;
  title?: string;
  employeeId?: string;
  hasChildren?: boolean;
  isExpanded?: boolean;
  isDeptHead?: boolean;
  isManager?: boolean;
  onToggleExpand?: (id: string) => void;
  onAddChild?: (parentId?: string) => void;
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
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const { zoom } = useViewport();

  const [nodes, setNodes, onNodesChange] = useNodesState<
    Node<OrgChartNodeData>
  >([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [hiddenNodes, setHiddenNodes] = useState<Set<string>>(new Set());
  const [direction, setDirection] = useState<"TB" | "LR">("TB");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [initialParentId, setInitialParentId] = useState<string | undefined>();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [visibleLevel, setVisibleLevel] = useState(10); // Default to a high number to show all
  const [maxLevel, setMaxLevel] = useState(1);

  const positionsList: TeamPosition[] = useMemo(() => {
    if (!positionsRes?.data) return [];
    return positionsRes.data.positions || [];
  }, [positionsRes?.data]);

  const spanOfControl: SpanOfControl | null = useMemo(() => {
    if (!positionsRes?.data) return null;
    return positionsRes.data.spanOfControl || null;
  }, [positionsRes?.data]);

  // Build graph from API
  useEffect(() => {
    if (positionsList.length === 0) return;

    // 1. First, build a map of parent -> children to calculate depths
    const childMap: Record<string, string[]> = {};
    const posMap: Record<string, TeamPosition> = {};
    positionsList.forEach((p) => {
      posMap[p.positionId] = p;
      if (p.parentPositionId) {
        if (!childMap[p.parentPositionId]) childMap[p.parentPositionId] = [];
        childMap[p.parentPositionId].push(p.positionId);
      }
    });

    // 2. Find root(s) - nodes with no parent or parent not in the list
    const roots = positionsList.filter(
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

    const rawNodes = positionsList.map((pos) => {
      const employees: AssignedEmployee[] =
        pos.employees &&
        Array.isArray(pos.employees) &&
        pos.employees.length > 0
          ? pos.employees.map((e) => ({
              employeeId: e.employeeId,
              employeeName: e.employeeName,
              employeeEmail: e.employeeEmail,
              employeeMobile: e.employeeMobile,
              employeeType: e.employeeType,
              departmentName: e.departmentName || pos.departmentName,
              designationName: e.designationName || pos.designationName,
              photo: e.photo,
            }))
          : pos.employeeId
            ? [
                {
                  employeeId: pos.employeeId,
                  employeeName: pos.employeeName || "Employee",
                  designationName: pos.designationName,
                  departmentName: pos.departmentName,
                  employeeType: pos.employeeType,
                },
              ]
            : [];

      return {
        id: pos.positionId,
        type: "org",
        data: {
          seatTitle: pos.seatTitle || pos.designationName || "Position",
          department: pos.departmentName || "",
          employees,
          depth: depths[pos.positionId] || 1,
          isDeptHead: pos.isDeptHead,
          isManager: pos.isManager,
        },

        position: { x: 0, y: 0 },
      };
    });

    const rawEdges = positionsList
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

  const handleDelete = useCallback(
    (nodeId: string) => {
      // eslint-disable-next-line no-alert
      if (window.confirm("Remove this position and all its subordinates?")) {
        deletePosition(nodeId);
      }
    },
    [deletePosition],
  );

  const handleRemoveEmployee = useCallback(
    (positionId: string, employeeId: string) => {
      const targetPos = positionsList.find((p) => p.positionId === positionId);
      if (!targetPos) return;

      const currentEmps =
        targetPos.employees && Array.isArray(targetPos.employees)
          ? targetPos.employees.map((e) => e.employeeId)
          : targetPos.employeeId
            ? [targetPos.employeeId]
            : [];

      const remainingEmps = currentEmps.filter((id) => id !== employeeId);

      // eslint-disable-next-line no-alert
      if (
        window.confirm(
          "Are you sure you want to unassign this employee from the seat?",
        )
      ) {
        addUpdatePosition(
          {
            teamPositionId: positionId,
            employeeId: remainingEmps.join(","),
            parentPositionId: targetPos.parentPositionId || null,
            seatTitle:
              targetPos.seatTitle || targetPos.designationName || "Position",
            isDeptHead: targetPos.isDeptHead || false,
            isManager: targetPos.isManager || false,
          },
          {
            onSuccess: () => {
              setTimeout(() => fitView({ duration: 600 }), 300);
            },
          },
        );
      }
    },
    [positionsRes?.data, addUpdatePosition, fitView],
  );

  const handleAddSubmit = (data: AddSeatFormData) => {
    addUpdatePosition(
      {
        teamPositionId: editingNodeId || undefined,
        employeeId: data.employeeId.join(","),
        parentPositionId: data.parentPositionId || null,
        seatTitle: data.seatTitle,
        isDeptHead: data.isDeptHead,
        isManager: data.isManager,
      },

      {
        onSuccess: () => {
          setIsAddOpen(false);
          setIsEditOpen(false);
          setEditingNodeId(null);
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
        const inTitle =
          n.data.seatTitle?.toLowerCase().includes(q) ||
          n.data.department?.toLowerCase().includes(q);
        const inEmps = n.data.employees?.some(
          (e: AssignedEmployee) =>
            e.employeeName?.toLowerCase().includes(q) ||
            e.designationName?.toLowerCase().includes(q),
        );
        return inTitle || inEmps;
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
            onAddChild: (parentId?: string) => {
              setInitialParentId(parentId);
              setIsAddOpen(true);
            },

            onEdit: (id: string) => {
              setEditingNodeId(id);
              setIsEditOpen(true);
            },
            onDelete: handleDelete,
            onRemoveEmployee: (empId: string) =>
              handleRemoveEmployee(node.id, empId),
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
    handleRemoveEmployee,
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
        onSearch={setSearchQuery}
        onAddSeat={() => setIsAddOpen(true)}
        spanOfControl={spanOfControl}
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
          <Panel
            position="bottom-left"
            className="m-6 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-gray-200 shadow-lg flex items-center gap-2 z-30 text-xs font-semibold text-gray-700"
          >
            <button
              onClick={() => zoomOut()}
              className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all shadow-2xs"
              title="Zoom Out"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="min-w-[50px] text-center font-bold text-gray-800">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => zoomIn()}
              className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all shadow-2xs"
              title="Zoom In"
            >
              <Plus className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-gray-200 mx-1" />
            <button
              onClick={() => fitView({ duration: 500 })}
              className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all shadow-2xs"
              title="Fit View"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                handleDirectionChange(direction === "TB" ? "LR" : "TB")
              }
              className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all shadow-2xs"
              title="Change Orientation"
            >
              <Layers
                className={`w-4 h-4 transition-transform duration-300 ${direction === "LR" ? "rotate-[-90deg]" : ""}`}
              />
            </button>
          </Panel>
        </ReactFlow>
      </div>

      {/* Add Seat Modal */}
      <AddSeatModal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setInitialParentId(undefined);
        }}
        onSubmit={handleAddSubmit}
        isLoading={isAdding}
        positions={positionsList}
        companyId={user?.companyId}
        initialParentId={initialParentId}
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
        positions={positionsList}
        companyId={user?.companyId}
        initialData={(() => {
          const node = nodes.find((n) => n.id === editingNodeId);
          if (!node) return null;
          return {
            seatTitle: node.data.seatTitle || "",
            employeeId:
              node.data.employees?.map((e: AssignedEmployee) => e.employeeId) ||
              [],
            parentPositionId:
              positionsList.find((p) => p.positionId === editingNodeId)
                ?.parentPositionId || "",
            isDeptHead: node.data.isDeptHead || false,
            isManager: node.data.isManager || false,
            createAnother: false,
          };
        })()}
      />
    </div>
  );
};
