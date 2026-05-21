import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  getUserDetail,
  getUserPermission,
} from "@/features/selectors/auth.selector";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import {
  useGetTeamPositions,
  useAddUpdateTeamPosition,
  useDeleteTeamPosition,
} from "@/features/api/companyTeam";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Edge,
  ConnectionLineType,
  useReactFlow,
  useViewport,
  Panel,
  Node,
  Connection,
} from "@xyflow/react";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import ModalData from "@/components/shared/Modal/ModalData";
import PageNotAccess from "../PageNoAccess";

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
  const { setBreadcrumbs } = useBreadcrumbs();
  const permission = useSelector(getUserPermission)?.ORG_STRUCTURE;
  useEffect(() => {
    setBreadcrumbs([{ label: "Organization Structure", href: "" }]);
  }, [setBreadcrumbs]);

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
  const [pendingDeletePositionId, setPendingDeletePositionId] = useState<
    string | null
  >(null);
  const [pendingRemoveEmployee, setPendingRemoveEmployee] = useState<{
    positionId: string;
    employeeId: string;
  } | null>(null);

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
    if (positionsList.length === 0) {
      setNodes([]);
      setEdges([]);
      setMaxLevel(1);
      setVisibleLevel(1);
      return;
    }

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
  }, [positionsList, setNodes, setEdges, direction]);

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

  const getAncestorEdges = useCallback(
    (nodeId: string, edgeList: Edge[]): string[] => {
      const parentEdges = edgeList.filter((e) => e.target === nodeId);
      return [
        ...parentEdges.map((e) => e.id),
        ...parentEdges.flatMap((e) => getAncestorEdges(e.source, edgeList)),
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

  const handleDelete = useCallback((nodeId: string) => {
    setPendingDeletePositionId(nodeId);
  }, []);

  const confirmDeletePosition = useCallback(() => {
    if (!pendingDeletePositionId) return;
    deletePosition(pendingDeletePositionId);
    setPendingDeletePositionId(null);
  }, [deletePosition, pendingDeletePositionId]);

  const closeDeletePositionModal = useCallback(() => {
    setPendingDeletePositionId(null);
  }, []);

  const handleRemoveEmployee = useCallback(
    (positionId: string, employeeId: string) => {
      setPendingRemoveEmployee({ positionId, employeeId });
    },
    [],
  );

  const confirmRemoveEmployee = useCallback(() => {
    if (!pendingRemoveEmployee) return;

    const targetPos = positionsList.find(
      (p) => p.positionId === pendingRemoveEmployee.positionId,
    );
    if (!targetPos) {
      setPendingRemoveEmployee(null);
      return;
    }

    const currentEmps =
      targetPos.employees && Array.isArray(targetPos.employees)
        ? targetPos.employees.map((e) => e.employeeId)
        : targetPos.employeeId
          ? [targetPos.employeeId]
          : [];

    const remainingEmps = currentEmps.filter(
      (id) => id !== pendingRemoveEmployee.employeeId,
    );

    addUpdatePosition(
      {
        teamPositionId: pendingRemoveEmployee.positionId,
        employeeId: remainingEmps.join(","),
        parentPositionId: targetPos.parentPositionId || null,
        seatTitle:
          targetPos.seatTitle || targetPos.designationName || "Position",
        isDeptHead: targetPos.isDeptHead || false,
        isManager: targetPos.isManager || false,
      },
      {
        onSuccess: () => {
          setPendingRemoveEmployee(null);
          setTimeout(() => fitView({ duration: 600 }), 300);
        },
      },
    );
  }, [positionsList, pendingRemoveEmployee, addUpdatePosition, fitView]);

  const closeRemoveEmployeeModal = useCallback(() => {
    setPendingRemoveEmployee(null);
  }, []);

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

  const activeAncestorEdgeIds = useMemo(() => {
    const selectedNode = nodes.find((n) => n.selected);
    if (!selectedNode) return new Set<string>();
    return new Set(getAncestorEdges(selectedNode.id, edges));
  }, [nodes, edges, getAncestorEdges]);

  const displayEdges = useMemo(
    () =>
      edges
        .filter((e) => {
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
        })
        .map((e) => {
          const isAncestor = activeAncestorEdgeIds.has(e.id);
          return {
            ...e,
            style: isAncestor
              ? { stroke: "#2e3090", strokeWidth: 2 }
              : { stroke: "#5d6063", strokeWidth: 0.9 },
          };
        }),
    [edges, hiddenNodes, nodes, visibleLevel, activeAncestorEdgeIds],
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

  const onConnect = useCallback(
    (connection: Connection) => {
      const { source, target } = connection;
      if (!source || !target) return;
      if (source === target) return;

      // Prevent circular dependency (e.g. connecting a node under its own subordinate)
      const descOfTarget = getDescendants(target, edges);
      if (descOfTarget.includes(source)) {
        toast.error("Cannot connect a parent node under its own subordinate!");
        return;
      }

      // Find the child position (target) to get its existing details
      const targetPos = positionsList.find((p) => p.positionId === target);
      if (!targetPos) return;

      const employeeIds =
        targetPos.employees && Array.isArray(targetPos.employees)
          ? targetPos.employees.map((e) => e.employeeId)
          : targetPos.employeeId
            ? [targetPos.employeeId]
            : [];

      // Update the position with the new parentId
      addUpdatePosition(
        {
          teamPositionId: target,
          employeeId: employeeIds.join(","),
          parentPositionId: source,
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
    },
    [positionsList, edges, getDescendants, addUpdatePosition, fitView],
  );

  if (permission && permission.View === false) {
    return <PageNotAccess />;
  }

  return (
    <div className="flex flex-col h-full w-full bg-gray-100 overflow-hidden">
      <Toolbar
        totalNodes={nodes.length}
        visibleLevel={visibleLevel}
        maxLevel={maxLevel}
        onLevelChange={setVisibleLevel}
        onSearch={setSearchQuery}
        onAddSeat={() => setIsAddOpen(true)}
        spanOfControl={spanOfControl}
        permission={permission}
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
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-gray-100">
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
            <Button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setInitialParentId(undefined);
                setIsAddOpen(true);
              }}
              variant={"outline"}
              className="py-2 bg-primary text-white h-10 w-fit"
            >
              <Plus className="w-4 h-4" /> Add First Position
            </Button>
          </div>
        )}

        {nodes.length > 0 && (
          <ReactFlow
            nodes={displayNodes}
            edges={displayEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            connectionLineType={ConnectionLineType.Step}
            fitView
            fitViewOptions={{ padding: 0.25 }}
            minZoom={0.05}
            maxZoom={2}
          >
            <Background
              variant={BackgroundVariant.Dots}
              color="#6b7280"
              gap={24}
              size={1}
            />
            <Panel
              position="bottom-left"
              className="m-6 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-gray-200 shadow-lg flex items-center gap-2 z-30 text-xs font-semibold text-gray-700"
            >
              <Button
                variant="ghost"
                onClick={() => zoomOut()}
                className="w-7 h-7 p-0 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all shadow-2xs cursor-pointer border-none"
                title="Zoom Out"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="min-w-[50px] text-center font-bold text-gray-800">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                onClick={() => zoomIn()}
                className="w-7 h-7 p-0 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all shadow-2xs cursor-pointer border-none"
                title="Zoom In"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <div className="w-px h-4 bg-gray-200 mx-1" />
              <Button
                variant="ghost"
                onClick={() => fitView({ duration: 500 })}
                className="w-7 h-7 p-0 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all shadow-2xs cursor-pointer border-none"
                title="Fit View"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  handleDirectionChange(direction === "TB" ? "LR" : "TB")
                }
                className="w-7 h-7 p-0 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all shadow-2xs cursor-pointer border-none"
                title="Change Orientation"
              >
                <Layers
                  className={`w-4 h-4 transition-transform duration-300 ${direction === "LR" ? "rotate-[-90deg]" : ""}`}
                />
              </Button>
            </Panel>
          </ReactFlow>
        )}
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
        isRoot={
          !positionsList.find((p) => p.positionId === editingNodeId)
            ?.parentPositionId
        }
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

      <ModalData
        isModalOpen={!!pendingDeletePositionId}
        modalTitle="Remove Position?"
        modalClose={closeDeletePositionModal}
        containerClass="!min-w-0 !max-w-[425px] !min-h-0 w-full"
        buttons={[
          {
            btnText: "Cancel",
            buttonCss:
              "py-1.5 px-5 bg-white border border-gray-300 text-black hover:bg-gray-50",
            btnClick: closeDeletePositionModal,
          },
          {
            btnText: "Remove",
            buttonCss: "py-1.5 px-5 bg-red-600 text-white hover:bg-red-700",
            btnClick: confirmDeletePosition,
          },
        ]}
      >
        <p className="text-sm text-gray-600">
          Remove this position and all its subordinates?
        </p>
      </ModalData>

      <ModalData
        isModalOpen={!!pendingRemoveEmployee}
        modalTitle="Unassign Employee?"
        modalClose={closeRemoveEmployeeModal}
        containerClass="!min-w-0 !max-w-[425px] !min-h-0 w-full"
        buttons={[
          {
            btnText: "Cancel",
            buttonCss:
              "py-1.5 px-5 bg-white border border-gray-300 text-black hover:bg-gray-50",
            btnClick: closeRemoveEmployeeModal,
          },
          {
            btnText: "Unassign",
            buttonCss: "py-1.5 px-5 bg-red-600 text-white hover:bg-red-700",
            btnClick: confirmRemoveEmployee,
            isLoading: isAdding,
          },
        ]}
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to unassign this employee from the seat?
        </p>
      </ModalData>
    </div>
  );
};
