import { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserX, Users, Loader2, X, Check, Pencil } from "lucide-react";
import { ImageBaseURL } from "@/features/utils/urls.utils";
import {
  useGetTeamPositions,
  useUserPositionAction,
} from "@/features/api/companyTeam/useTeamPosition";
import { useAddUpdateTeam } from "@/features/api/companyTeam";
import { useState } from "react";

interface EditTeamSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
}

interface PositionNode {
  positionId: string;
  parentPositionId?: string | null;
  photo?: string | null;
  employeeName?: string | null;
  designationName?: string | null;
  employeeType?: string | null;
  employeeId?: string | null;
  teams?: { teamId: string; teamName: string }[];
  children?: PositionNode[];
}

export default function EditTeamSidebar({
  isOpen,
  onClose,
  teamId,
  teamName,
}: EditTeamSidebarProps) {
  const { data: positionsRes, isLoading } = useGetTeamPositions(
    teamId,
    !!teamId && isOpen,
  );
  const { mutate: applyUserAction, isPending } = useUserPositionAction();
  const { mutate: updateTeam, isPending: isUpdatingTeam } = useAddUpdateTeam();

  const [editName, setEditName] = useState(teamName);
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEditName(teamName);
      setIsEditingName(false);
    }
  }, [teamName, isOpen]);

  const handleUpdateName = () => {
    if (editName.trim() && editName !== teamName) {
      updateTeam(
        { teamId, teamName: editName.trim() },
        { onSuccess: () => setIsEditingName(false) },
      );
    } else {
      setIsEditingName(false);
    }
  };

  const handleRemoveUserFromTeam = (employeeId: string, positionId: string) => {
    if (
      // eslint-disable-next-line no-alert
      window.confirm(
        "Are you sure you want to remove this employee from the team?",
      )
    ) {
      applyUserAction({
        employeeId,
        positionId,
        isTeamRemove: true,
      });
    }
  };

  const positions = (positionsRes?.data || []).filter((pos: PositionNode) =>
    pos.teams?.some((t) => t.teamId === teamId),
  );

  const buildTree = (data: PositionNode[]) => {
    const map = new Map<string, PositionNode>();
    const roots: PositionNode[] = [];
    data.forEach((item) => {
      map.set(item.positionId, { ...item, children: [] });
    });
    data.forEach((item) => {
      if (item.parentPositionId && map.has(item.parentPositionId)) {
        map
          .get(item.parentPositionId)
          ?.children?.push(map.get(item.positionId) as PositionNode);
      } else {
        roots.push(map.get(item.positionId) as PositionNode);
      }
    });
    return roots;
  };

  const renderTree = (nodes: PositionNode[], level = 0) => {
    return nodes.map((pos) => (
      <div key={pos.positionId} className="flex flex-col gap-2 w-full">
        <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl shadow-sm relative group">
          <div className="flex items-center gap-3 w-full">
            <Avatar className="h-10 w-10 border">
              {pos.photo && (
                <AvatarImage
                  src={`${ImageBaseURL}/share/profilePics/${pos.photo}`}
                />
              )}
              <AvatarFallback className="bg-primary text-white font-semibold text-xs">
                {pos.employeeName?.substring(0, 2).toUpperCase() || "??"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-gray-900 truncate">
                {pos.employeeName || "Unassigned"}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {pos.designationName || pos.employeeType || "No Title"}
              </div>
            </div>
          </div>

          {pos.employeeId && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0 rounded-full flex-shrink-0"
              onClick={() =>
                handleRemoveUserFromTeam(
                  pos.employeeId as string,
                  pos.positionId,
                )
              }
              disabled={isPending}
              title="Remove from team"
            >
              <UserX className="w-4 h-4" />
            </Button>
          )}
        </div>
        {pos.children && pos.children.length > 0 && (
          <div className="flex flex-col gap-2 relative pl-6 mt-1">
            {/* Vertical Line */}
            <div className="absolute left-[11px] top-[-8px] bottom-4 w-px bg-gray-200" />
            {renderTree(pos.children, level + 1).map((childNode, index) => (
              <div key={index} className="relative">
                {/* Horizontal connection line */}
                <div className="absolute left-[-24px] top-1/2 w-6 h-px bg-gray-200" />
                {childNode}
              </div>
            ))}
          </div>
        )}
      </div>
    ));
  };

  const treeData = buildTree(positions);

  return (
    <div
      className={`fixed top-[90px] right-0 w-[420px] h-[calc(100vh-100px)] bg-white shadow-2xl border-l transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b bg-gray-50/50">
        <div className="flex items-center gap-2 flex-1 mr-4">
          <Users className="w-5 h-5 text-primary flex-shrink-0" />
          {isEditingName ? (
            <div className="flex items-center gap-1 w-full">
              <input
                type="text"
                className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUpdateName();
                  if (e.key === "Escape") {
                    setEditName(teamName);
                    setIsEditingName(false);
                  }
                }}
              />
              <button
                onClick={handleUpdateName}
                disabled={isUpdatingTeam}
                className="p-1.5 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
              >
                {isUpdatingTeam ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
              </button>
              <button
                onClick={() => {
                  setEditName(teamName);
                  setIsEditingName(false);
                }}
                disabled={isUpdatingTeam}
                className="p-1.5 bg-gray-100 text-gray-500 rounded hover:bg-gray-200 disabled:opacity-50"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <h2 className="text-lg font-semibold truncate flex items-center gap-2 group">
              {teamName}
              <button
                onClick={() => setIsEditingName(true)}
                className=" p-1 text-gray-400 hover:text-primary transition-all"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </h2>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 border border-primary hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50">
        {!teamId ? (
          <div className="text-center text-gray-500 py-8">
            Please select a team to view its members.
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center h-32">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
            <p className="text-xs text-gray-400">Loading members...</p>
          </div>
        ) : positions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No members found in this team.
          </div>
        ) : (
          <div className="flex flex-col gap-3">{renderTree(treeData)}</div>
        )}
      </div>
    </div>
  );
}
