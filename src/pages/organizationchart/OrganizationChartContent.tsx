import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  getUserDetail,
  getUserPermission,
} from "@/features/selectors/auth.selector";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import {
  useGetTeamPositions,
  useSaveMultipleTeamPositions,
} from "@/features/api/companyTeam";
import { useGetEmployeeDd } from "@/features/api/companyEmployee";
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

  const { data: positionsRes, isLoading: isPositionsLoading, dataUpdatedAt } = useGetTeamPositions(
    user?.companyId as string,
  );
  
  const { data: employeesRes, isLoading: isEmployeesLoading } = useGetEmployeeDd({
    filter: { companyId: user?.companyId as string, search: "" },
    enable: Boolean(user?.companyId),
  });

  const { mutate: saveMultiplePositions, isPending: isSaving } = useSaveMultipleTeamPositions();

  const isLoading = isPositionsLoading || isEmployeesLoading;

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

  const [localPositions, setLocalPositions] = useState<TeamPosition[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(0);

  const [history, setHistory] = useState<TeamPosition[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const hasChanges = useMemo(() => {
    if (localPositions.length !== positionsList.length) return true;
    for (const local of localPositions) {
      const original = positionsList.find((p) => p.positionId === local.positionId);
      if (!original) return true;
      if (local.seatTitle !== original.seatTitle) return true;
      if (local.employeeId !== original.employeeId) return true;
      if (local.parentPositionId !== original.parentPositionId) return true;
      if (Boolean(local.isDeptHead) !== Boolean(original.isDeptHead)) return true;
      if (Boolean(local.isManager) !== Boolean(original.isManager)) return true;
    }
    return false;
  }, [localPositions, positionsList]);

  // 1. Initial load from localStorage (prioritized) or fallback to positionsList when ready
  useEffect(() => {
    if (!user?.companyId) return;

    const storageKey = `org_chart_local_changes_${user.companyId}`;
    const cached = localStorage.getItem(storageKey);

    if (cached && !isInitialized) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setLocalPositions(parsed);
          setHistory([parsed]);
          setHistoryIndex(0);
          setIsInitialized(true);
          return;
        }
      } catch (e) {
        console.error("Error parsing local positions from localStorage", e);
      }
    }

    if (positionsList.length > 0 && !isInitialized) {
      setLocalPositions(positionsList);
      setHistory([positionsList]);
      setHistoryIndex(0);
      setIsInitialized(true);
    }
  }, [positionsList, user?.companyId, isInitialized]);

  // 2. Keep localStorage in sync when changes are made
  useEffect(() => {
    if (!user?.companyId || !isInitialized) return;

    const storageKey = `org_chart_local_changes_${user.companyId}`;
    if (hasChanges) {
      localStorage.setItem(storageKey, JSON.stringify(localPositions));
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [localPositions, hasChanges, user?.companyId, isInitialized]);

  // 3. Tab/Browser Close Guard: prompt when there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "Please save your changes";
        return "Please save your changes";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasChanges]);

  // 4. Sync from database AFTER a successful save (waits until background query refetches new data)
  useEffect(() => {
    if (lastSyncTime > 0 && dataUpdatedAt > lastSyncTime) {
      setLocalPositions(positionsList);
      setHistory([positionsList]);
      setHistoryIndex(0);
      setLastSyncTime(0);
      setIsInitialized(true);
    }
  }, [positionsList, dataUpdatedAt, lastSyncTime]);

  const updatePositionsAndHistory = useCallback(
    (nextValue: TeamPosition[] | ((prev: TeamPosition[]) => TeamPosition[])) => {
      setLocalPositions((prev) => {
        const next = typeof nextValue === "function" ? nextValue(prev) : nextValue;
        setHistory((prevHistory) => {
          const truncated = prevHistory.slice(0, historyIndex + 1);
          const updated = [...truncated, next];
          setHistoryIndex(updated.length - 1);
          return updated;
        });
        return next;
      });
    },
    [historyIndex],
  );

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      const prevState = history[nextIndex];
      setLocalPositions(prevState);
      setHistoryIndex(nextIndex);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextState = history[nextIndex];
      setLocalPositions(nextState);
      setHistoryIndex(nextIndex);
    }
  }, [history, historyIndex]);

  // Keypress event listener for Undo/Redo hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (
        activeEl.tagName === "INPUT" || 
        activeEl.tagName === "TEXTAREA" || 
        activeEl.getAttribute("contenteditable") === "true"
      );
      if (isInput) return; // Do not intercept standard input undo/redo typing

      if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
        if (e.key === "z" || e.key === "Z") {
          e.preventDefault();
          handleUndo();
        } else if (e.key === "y" || e.key === "Y") {
          e.preventDefault();
          handleRedo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleUndo, handleRedo]);

  const spanOfControl: SpanOfControl | null = useMemo(() => {
    if (!positionsRes?.data) return null;
    return positionsRes.data.spanOfControl || null;
  }, [positionsRes?.data]);

  // Build graph from localPositions
  useEffect(() => {
    if (localPositions.length === 0) {
      setNodes([]);
      setEdges([]);
      setMaxLevel(1);
      setVisibleLevel(1);
      return;
    }

    // 1. First, build a map of parent -> children to calculate depths
    const childMap: Record<string, string[]> = {};
    const posMap: Record<string, TeamPosition> = {};
    localPositions.forEach((p) => {
      posMap[p.positionId] = p;
      if (p.parentPositionId) {
        if (!childMap[p.parentPositionId]) childMap[p.parentPositionId] = [];
        childMap[p.parentPositionId].push(p.positionId);
      }
    });

    // 2. Find root(s) - nodes with no parent or parent not in the list
    const roots = localPositions.filter(
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

    const employeeMap = new Map<string, EmployeeData>();
    (employeesRes?.data || []).forEach((emp) => {
      employeeMap.set(emp.employeeId, emp);
    });

    const rawNodes = localPositions.map((pos) => {
      const empIds =
        pos.employees && Array.isArray(pos.employees) && pos.employees.length > 0
          ? pos.employees.map((e) => e.employeeId)
          : pos.employeeId
            ? pos.employeeId.split(",").map((id) => id.trim()).filter(Boolean)
            : [];
      const uniqueEmpIds = Array.from(new Set(empIds));
      const employees: AssignedEmployee[] = uniqueEmpIds.map((id) => {
        const lookup = employeeMap.get(id);
        const original = pos.employees?.find((e) => e.employeeId === id);
        return {
          employeeId: id,
          employeeName: lookup?.employeeName || original?.employeeName || "Employee",
          employeeEmail: lookup?.employeeEmail || original?.employeeEmail || "",
          employeeMobile: lookup?.employeeMobile || original?.employeeMobile || "",
          employeeType: lookup?.employeeType || original?.employeeType || "",
          departmentName: lookup?.departmentName || original?.departmentName || pos.departmentName || "",
          designationName: lookup?.designationName || original?.designationName || pos.designationName || "",
        };
      });

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

    const rawEdges = localPositions
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
  }, [localPositions, employeesRes, setNodes, setEdges, direction]);

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
    const descendants = getDescendants(pendingDeletePositionId, edges);
    const toDelete = new Set([pendingDeletePositionId, ...descendants]);
    updatePositionsAndHistory((prev) =>
      prev.filter((p) => !toDelete.has(p.positionId)),
    );
    setPendingDeletePositionId(null);
    setTimeout(() => fitView({ duration: 600 }), 300);
  }, [pendingDeletePositionId, edges, getDescendants, fitView, updatePositionsAndHistory]);

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

    updatePositionsAndHistory((prev) =>
      prev.map((p) => {
        if (p.positionId === pendingRemoveEmployee.positionId) {
          const currentEmps =
            p.employees && Array.isArray(p.employees)
              ? p.employees.map((e) => e.employeeId)
              : p.employeeId
                ? p.employeeId.split(",")
                : [];
          const remainingEmps = currentEmps.filter(
            (id) => id !== pendingRemoveEmployee.employeeId,
          );
          return {
            ...p,
            employeeId: remainingEmps.join(","),
            employees: undefined, // Clear so mapping resolves it from list
          };
        }
        return p;
      }),
    );
    setPendingRemoveEmployee(null);
    setTimeout(() => fitView({ duration: 600 }), 300);
  }, [pendingRemoveEmployee, fitView, updatePositionsAndHistory]);

  const closeRemoveEmployeeModal = useCallback(() => {
    setPendingRemoveEmployee(null);
  }, []);

  const handleAddSubmit = (data: AddSeatFormData) => {
    if (editingNodeId) {
      updatePositionsAndHistory((prev) =>
        prev.map((p) => {
          if (p.positionId === editingNodeId) {
            return {
              ...p,
              employeeId: data.employeeId.join(","),
              parentPositionId: data.parentPositionId || null,
              seatTitle: data.seatTitle,
              isDeptHead: data.isDeptHead,
              isManager: data.isManager,
              employees: undefined, // Clear so mapping resolves it from list
            };
          }
          return p;
        }),
      );
      setIsEditOpen(false);
      setEditingNodeId(null);
      setTimeout(() => fitView({ duration: 600 }), 300);
    } else {
      const newPosId = `temp-${Date.now()}`;
      const newPos: TeamPosition = {
        positionId: newPosId,
        employeeId: data.employeeId.join(","),
        parentPositionId: data.parentPositionId || null,
        seatTitle: data.seatTitle,
        isDeptHead: data.isDeptHead,
        isManager: data.isManager,
        designationName: data.seatTitle,
      };
      updatePositionsAndHistory((prev) => [...prev, newPos]);
      setIsAddOpen(false);
      setInitialParentId(undefined);
      setTimeout(() => fitView({ duration: 600 }), 300);
    }
  };

  const handleSave = () => {
    const payload = localPositions.map((p) => {
      const empIdStr =
        p.employees && Array.isArray(p.employees) && p.employees.length > 0
          ? p.employees.map((e) => e.employeeId).join(",")
          : (p.employeeId || "");
      return {
        positionId: p.positionId,
        employeeId: empIdStr,
        parentPositionId: p.parentPositionId || null,
        seatTitle: p.seatTitle || p.designationName || "Position",
        isDeptHead: Boolean(p.isDeptHead),
        isManager: Boolean(p.isManager),
      };
    });
    saveMultiplePositions(payload, {
      onSuccess: () => {
        if (user?.companyId) {
          localStorage.removeItem(`org_chart_local_changes_${user.companyId}`);
        }
        setLastSyncTime(Date.now());
      },
    });
  };

  const handleDiscard = () => {
    if (user?.companyId) {
      localStorage.removeItem(`org_chart_local_changes_${user.companyId}`);
    }
    setLocalPositions(positionsList);
    setHistory([positionsList]);
    setHistoryIndex(0);
    toast.info("Unsaved changes discarded.");
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

      updatePositionsAndHistory((prev) =>
        prev.map((p) => {
          if (p.positionId === target) {
            return {
              ...p,
              parentPositionId: source,
            };
          }
          return p;
        }),
      );
      setTimeout(() => fitView({ duration: 600 }), 300);
    },
    [edges, getDescendants, fitView, updatePositionsAndHistory],
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
        hasChanges={hasChanges}
        onSave={handleSave}
        isSaving={isSaving}
        onDiscard={handleDiscard}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
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
        isLoading={isSaving}
        positions={localPositions}
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
        isLoading={isSaving}
        positions={localPositions}
        companyId={user?.companyId}
        editingNodeId={editingNodeId || undefined}
        isRoot={
          !localPositions.find((p) => p.positionId === editingNodeId)
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
              localPositions.find((p) => p.positionId === editingNodeId)
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
            isLoading: isSaving,
          },
        ]}
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to unassign this employee from the position?
        </p>
      </ModalData>
    </div>
  );
};
