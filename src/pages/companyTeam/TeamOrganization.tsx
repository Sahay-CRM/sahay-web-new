import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { getUserDetail } from "@/features/selectors/auth.selector";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionLineType,
  Panel,
  Node,
  Edge,
  Connection,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import dagre from "dagre";
import CustomNode from "./CustomNode";
import { Plus, Users, UserPlus } from "lucide-react";
import CreateTeamModal from "./CreateTeamModal";
import AssignToTeamModal from "./AssignToTeamModal";
import "./team-flow.css";
import {
  useGetTeamPositions,
  useAddUpdateTeamPosition,
  useDeleteTeamPosition,
  useAddUpdateTeam,
  useGetTeam,
} from "@/features/api/companyTeam";

import { ImageBaseURL } from "@/features/utils/urls.utils";
import SidebarDetails from "./SidebarDetails";
import AddMemberModal from "./AddMemberModal";

const nodeTypes = {
  custom: CustomNode,
};

const getLayoutedElements = (
  nodes: Node<TeamNodeData>[],
  edges: Edge[],
  direction = "TB",
): { nodes: Node<TeamNodeData>[]; edges: Edge[] } => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 280;
  const nodeHeight = 150;

  dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export default function TeamOrganization() {
  return (
    <ReactFlowProvider>
      <TeamOrganizationContent />
    </ReactFlowProvider>
  );
}

function TeamOrganizationContent() {
  const { teamId: paramTeamId } = useParams();
  // const navigate = useNavigate();
  const user = useSelector(getUserDetail);
  const teamId = paramTeamId || user?.companyId;

  const { data: positionsRes } = useGetTeamPositions(teamId as string);
  const { data: teamsRes } = useGetTeam({
    filter: { companyId: user?.companyId },
    enable: true,
  });
  const { mutate: addUpdatePosition } = useAddUpdateTeamPosition();
  const { mutate: deletePosition } = useDeleteTeamPosition();
  const { mutate: createTeam } = useAddUpdateTeam();
  const { fitView } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<TeamNodeData>>(
    [],
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addingToParentId, setAddingToParentId] = useState<string | null>(null);
  const [hiddenNodes, setHiddenNodes] = useState<Set<string>>(new Set());
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [filterTeamId, setFilterTeamId] = useState<string>("all");

  // Map API data to React Flow nodes and edges
  useEffect(() => {
    if (!positionsRes?.data) return;

    const initialNodes: Node<TeamNodeData>[] = positionsRes.data.map(
      (pos: TeamPosition) => ({
        id: pos.positionId,
        type: "custom",
        data: {
          label: pos.employeeName || "Unassigned",
          position: pos.designationName || pos.employeeType || "No Title",
          color: "blue",
          department: pos.departmentName || "General",
          image: pos.photo
            ? `${ImageBaseURL}/share/profilePics/${pos.photo}`
            : null,
          employeeId: pos.employeeId,
          email: pos.employeeEmail,
          phone: pos.employeeMobile,
          teamIds: pos.teams?.map((t) => t.teamId) || [],
        },
        position: { x: 0, y: 0 },
      }),
    );

    const initialEdges: Edge[] = positionsRes.data
      .filter(
        (pos: TeamPosition) =>
          pos.parentPositionId && typeof pos.parentPositionId === "string",
      )
      .map((pos: TeamPosition) => ({
        id: `e${pos.parentPositionId}-${pos.positionId}`,
        source: pos.parentPositionId as string,
        target: pos.positionId,
        type: "smoothstep",
        animated: true,
        style: { stroke: "#646464", strokeWidth: 2 },
      }));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges,
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [positionsRes, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "smoothstep",
            animated: true,
            style: { stroke: "#646464", strokeWidth: 2 },
          } as Edge,
          eds,
        ),
      ),
    [setEdges],
  );

  const getDescendants = useCallback(
    (
      parentId: string,
      currentEdges: Edge[],
      visited = new Set<string>(),
    ): string[] => {
      if (visited.has(parentId)) return [];
      visited.add(parentId);

      const children = currentEdges
        .filter((e) => e.source === parentId)
        .map((e) => e.target);

      let descendants = [...children];
      children.forEach((childId) => {
        descendants = [
          ...descendants,
          ...getDescendants(childId, currentEdges, visited),
        ];
      });

      return descendants;
    },
    [],
  );

  const handleToggleExpand = useCallback(
    (nodeId: string) => {
      setHiddenNodes((prev) => {
        const newHidden = new Set(prev);
        const descendants = getDescendants(nodeId, edges);
        const isCurrentlyExpanded = !descendants.some((d) => newHidden.has(d));

        if (isCurrentlyExpanded) {
          descendants.forEach((id) => newHidden.add(id));
        } else {
          descendants.forEach((id) => newHidden.delete(id));
        }
        return newHidden;
      });
    },
    [edges, getDescendants],
  );

  const handleEditNode = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
  }, []);

  const handleAddChild = useCallback((nodeId: string) => {
    setAddingToParentId(nodeId);
    setIsAddModalOpen(true);
  }, []);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<TeamNodeData>) => {
      if (addingToParentId === "GROUP_MODE") {
        const selectedIds = window.pendingGroupSelection || [];
        if (selectedIds.length > 0) {
          selectedIds.forEach((posId: string) => {
            const posData = positionsRes?.data?.find(
              (p: TeamPosition) => p.positionId === posId,
            );
            if (posData) {
              addUpdatePosition({
                teamPositionId: posData.positionId,
                employeeId: posData.employeeId as string,
                parentPositionId: node.id,
              });
            }
          });
          // eslint-disable-next-line no-alert
          alert(
            `Successfully assigned ${selectedIds.length} employees to ${node.data.label}`,
          );
          setAddingToParentId(null);
          window.pendingGroupSelection = [];
        }
        return;
      }
      if (isSelectionMode) {
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id === node.id) {
              return { ...n, selected: !n.selected };
            }
            return n;
          }),
        );
        return;
      }
      setSelectedNodeId(node.id);
    },
    [
      addingToParentId,
      positionsRes,
      addUpdatePosition,
      isSelectionMode,
      setNodes,
    ],
  );

  const handleAddMemberSubmit = (data: { employeeId: string }) => {
    const payload = {
      employeeId: data.employeeId,
      parentPositionId: addingToParentId,
      // If we have a teamId from URL, use it. otherwise use companyId
      ...(paramTeamId
        ? { teamId: paramTeamId }
        : { companyId: user?.companyId }),
    };

    addUpdatePosition(payload, {
      onSuccess: () => {
        setIsAddModalOpen(false);
        setAddingToParentId(null);
      },
    });
  };

  const handleDeleteMember = (nodeId: string) => {
    if (
      // eslint-disable-next-line no-alert
      window.confirm(
        "Are you sure you want to delete this position and all its descendants?",
      )
    ) {
      deletePosition(nodeId, {
        onSuccess: () => {
          setSelectedNodeId(null);
        },
      });
    }
  };

  // Enhance nodes with interaction callbacks and visibility state
  const displayNodes = useMemo(() => {
    return nodes
      .filter((node) => {
        if (filterTeamId === "all") return true;
        const nodeTeamIds = node.data.teamIds || [];
        return nodeTeamIds.includes(filterTeamId);
      })
      .map((node: Node<TeamNodeData>) => {
        const children = edges.filter((e) => e.source === node.id);
        const isExpanded = !children.some((child) =>
          hiddenNodes.has(child.target),
        );

        return {
          ...node,
          hidden: hiddenNodes.has(node.id),
          selectable: isSelectionMode,
          data: {
            ...node.data,
            hasChildren: children.length > 0,
            isExpanded,
            onToggleExpand: handleToggleExpand,
            onEdit: handleEditNode,
            onAddChild: handleAddChild,
            isSelectionMode,
          },
        };
      });
  }, [
    nodes,
    edges,
    hiddenNodes,
    handleToggleExpand,
    handleEditNode,
    handleAddChild,
    filterTeamId,
    isSelectionMode,
  ]);

  const displayEdges = useMemo(() => {
    return edges.filter(
      (edge) => !hiddenNodes.has(edge.source) && !hiddenNodes.has(edge.target),
    );
  }, [edges, hiddenNodes]);

  const selectedNodes = useMemo(() => nodes.filter((n) => n.selected), [nodes]);
  const hasSelection = selectedNodes.length > 0;

  const handleCreateTeamFromSelection = (data: { teamName: string }) => {
    const { teamName } = data;
    createTeam(
      {
        teamName,
        companyId: user?.companyId,
        positions: selectedNodes.map((n) => ({
          positionId: n.id,
          employeeId: n.data.employeeId,
        })),
      },
      {
        onSuccess: (res) => {
          setIsCreateTeamModalOpen(false);
          setIsSelectionMode(false);
          if (res?.data?.teamId) {
            setFilterTeamId(res.data.teamId);
          }
          // Clear selection after creation
          setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
          setTimeout(() => fitView({ duration: 800 }), 100);
        },
      },
    );
  };

  const handleAssignToTeam = (selectedTeamId: string) => {
    const selectedTeam = teamsRes?.data?.find(
      (t: Team) => t.teamId === selectedTeamId,
    );
    if (!selectedTeam) return;

    createTeam(
      {
        ...selectedTeam,
        positions: selectedNodes.map((n) => ({
          positionId: n.id,
          employeeId: n.data.employeeId,
        })),
      },
      {
        onSuccess: () => {
          setIsAssignModalOpen(false);
          setIsSelectionMode(false);
          setFilterTeamId(selectedTeamId);
          setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
          setTimeout(() => fitView({ duration: 800 }), 100);
        },
      },
    );
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="flex h-[calc(100vh-100px)] w-full overflow-hidden bg-gray-50/50">
      <div
        className={`flex-1 transition-all duration-300 ${selectedNodeId ? "mr-[420px]" : ""}`}
      >
        <ReactFlow
          nodes={displayNodes}
          edges={displayEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          connectionLineType={ConnectionLineType.SmoothStep}
          fitView
          minZoom={0.1}
          maxZoom={1.8}
          attributionPosition="bottom-left"
        >
          <Background
            variant={BackgroundVariant.Lines}
            color="#ededed"
            gap={10}
            size={1}
          />
          <Controls className="bg-white shadow-md border-gray-200 rounded-md" />
          <Panel position="top-right" className="m-4 flex gap-4">
            <div className="bg-white rounded-md shadow-md border border-gray-200 flex items-center gap-2">
              <select
                className="text-sm px-2 py-2 font-semibold text-gray-700 bg-transparent border-none focus:ring-0 cursor-pointer"
                value={filterTeamId}
                onChange={(e) => setFilterTeamId(e.target.value)}
              >
                <option value="all">All Members</option>
                {teamsRes?.data?.map((team: Team) => (
                  <option key={team.teamId} value={team.teamId}>
                    {team.teamName}
                  </option>
                ))}
              </select>
            </div>
            {isSelectionMode && hasSelection && (
              <>
                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="bg-primary text-white px-4 py-2 rounded-md shadow-md flex items-center gap-2 hover:bg-primary/80 transition-all border-none"
                >
                  <UserPlus className="w-4 h-4" /> Assign to Team (
                  {selectedNodes.length})
                </button>
                <button
                  onClick={() => setIsCreateTeamModalOpen(true)}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-md shadow-md flex items-center gap-2 hover:bg-emerald-700 transition-all border-none"
                >
                  <Users className="w-4 h-4" /> Create Team (
                  {selectedNodes.length})
                </button>
              </>
            )}
            <button
              onClick={() => {
                setIsSelectionMode(!isSelectionMode);
                if (isSelectionMode) {
                  // Clear selection when exiting selection mode
                  setNodes((nds) =>
                    nds.map((n) => ({ ...n, selected: false })),
                  );
                }
              }}
              className={`${isSelectionMode ? "bg-amber-600 hover:bg-amber-700" : "bg-blue-600 hover:bg-blue-700"} text-white px-4 py-2 rounded-md shadow-md flex items-center gap-2 transition-all border-none`}
            >
              <Users className="w-4 h-4" />
              {isSelectionMode ? "Exit Selection" : "Bulk Selection"}
            </button>
            {nodes.length === 0 && (
              <button
                onClick={() => {
                  setAddingToParentId(null);
                  setIsAddModalOpen(true);
                }}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-md flex items-center gap-2 hover:brightness-110 transition-all"
              >
                <Plus className="w-4 h-4" /> Add Root Member
              </button>
            )}
          </Panel>
        </ReactFlow>
      </div>

      <SidebarDetails
        isOpen={!!selectedNodeId}
        onClose={() => setSelectedNodeId(null)}
        nodeData={selectedNode?.data}
        nodeId={selectedNodeId}
        onDelete={handleDeleteMember}
      />

      {isCreateTeamModalOpen && (
        <CreateTeamModal
          isOpen={isCreateTeamModalOpen}
          onClose={() => setIsCreateTeamModalOpen(false)}
          onSubmit={handleCreateTeamFromSelection}
          selectedCount={selectedNodes.length}
        />
      )}

      {isAddModalOpen && (
        <AddMemberModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddMemberSubmit}
          parentName={
            addingToParentId
              ? nodes.find((n) => n.id === addingToParentId)?.data.label
              : "Root"
          }
        />
      )}
      {isAssignModalOpen && (
        <AssignToTeamModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          onSubmit={handleAssignToTeam}
          teams={teamsRes?.data || []}
          selectedCount={selectedNodes.length}
        />
      )}
    </div>
  );
}
