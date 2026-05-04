import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import dagre from "dagre";
import CustomNode from "./CustomNode";
import { Plus, ArrowLeft } from "lucide-react";
import {
  useGetTeamPositions,
  useAddUpdateTeamPosition,
  useDeleteTeamPosition,
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
  const { teamId } = useParams();
  const navigate = useNavigate();

  const { data: positionsRes } = useGetTeamPositions(teamId as string);
  const { mutate: addUpdatePosition } = useAddUpdateTeamPosition();
  const { mutate: deletePosition } = useDeleteTeamPosition();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<TeamNodeData>>(
    [],
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addingToParentId, setAddingToParentId] = useState<string | null>(null);
  const [hiddenNodes, setHiddenNodes] = useState<Set<string>>(new Set());

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
        addEdge({ ...params, type: "smoothstep", animated: true }, eds),
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
      setSelectedNodeId(node.id);
    },
    [],
  );

  const handleAddMemberSubmit = (data: { employeeId: string }) => {
    const payload = {
      teamId,
      employeeId: data.employeeId,
      parentPositionId: addingToParentId,
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
      deletePosition(nodeId);
    }
  };
  // Enhance nodes with interaction callbacks and visibility state
  const displayNodes = useMemo(() => {
    return nodes.map((node: Node<TeamNodeData>) => {
      const children = edges.filter((e) => e.source === node.id);
      const isExpanded = !children.some((child) =>
        hiddenNodes.has(child.target),
      );

      return {
        ...node,
        hidden: hiddenNodes.has(node.id),
        data: {
          ...node.data,
          hasChildren: children.length > 0,
          isExpanded,
          onToggleExpand: handleToggleExpand,
          onEdit: handleEditNode,
          onAddChild: handleAddChild,
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
  ]);

  const displayEdges = useMemo(() => {
    return edges.filter(
      (edge) => !hiddenNodes.has(edge.source) && !hiddenNodes.has(edge.target),
    );
  }, [edges, hiddenNodes]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="flex h-[calc(100vh-100px)] w-full overflow-hidden bg-gray-50/50">
      <div
        className={`flex-1 transition-all duration-300 ${selectedNodeId ? "mr-[400px]" : ""}`}
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
          maxZoom={1.5}
          attributionPosition="bottom-left"
        >
          <Background color="#ccc" gap={16} size={1} />
          <Controls className="bg-white shadow-md border-gray-200 rounded-md" />
          <Panel position="top-right" className="m-4 flex gap-4">
            <button
              onClick={() => navigate("/dashboard/team-organization")}
              className="bg-white text-gray-700 px-4 py-2 rounded-md shadow-md flex items-center gap-2 hover:bg-gray-50 border border-gray-200 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Teams
            </button>
            <button
              onClick={() => {
                setAddingToParentId(null);
                setIsAddModalOpen(true);
              }}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-md flex items-center gap-2 hover:brightness-110 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Root Member
            </button>
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
    </div>
  );
}
