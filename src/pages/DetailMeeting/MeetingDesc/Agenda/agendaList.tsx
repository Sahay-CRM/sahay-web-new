import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CircleX,
  CopyCheck,
  CopyX,
  CornerDownLeft,
  SquarePen,
  Unlink,
} from "lucide-react";

import Timer from "../Timer";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function AgendaList({
  item,
  idx,
  meetingStatus,
  isSelectedAgenda,
  follow,
  editing,
  setEditingValue,
  updateEdit,
  cancelEdit,
  handleListClick,
  handleMarkAsSolved,
  startEdit,
  handleDelete,
  meetingResponse,
  conclusionTime,
  isTeamLeader,
  isUnFollow,
}: AgendaListProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item?.issueObjectiveId || `agenda-${idx}` });

  const canEdit = true;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatAgendaTime = (totalSeconds: number) => {
    if (!totalSeconds || isNaN(totalSeconds)) {
      return "00:00";
    }

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  if (!item) {
    return null;
  }

  const getTimerData = () => {
    if (!meetingResponse?.timers?.objectives?.[item.issueObjectiveId]) {
      return {
        actualTime: 0,
        lastSwitchTimestamp: 0,
        isActive: false,
      };
    }

    const objectiveTimer =
      meetingResponse.timers.objectives[item.issueObjectiveId];

    // ALWAYS use the same logic regardless of follow status
    const isActiveForMeeting =
      meetingResponse.state.currentAgendaItemId === item.issueObjectiveId;

    return {
      actualTime: objectiveTimer.actualTime,
      lastSwitchTimestamp: isActiveForMeeting
        ? Number(meetingResponse?.state.lastSwitchTimestamp || Date.now())
        : 0,
      isActive: isActiveForMeeting,
    };
  };

  const timerData = getTimerData();

  // Handle mark as solved/unsolved with event prevention
  const handleMarkAsSolvedClick = (
    e: React.MouseEvent,
    item: MeetingAgenda,
  ) => {
    e.stopPropagation(); // Prevent event from bubbling to li
    handleMarkAsSolved(item);
  };

  // Handle edit button click with event prevention
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling to li
    if (item) {
      startEdit(
        item.ioType === "OBJECTIVE" ? "OBJECTIVE" : "ISSUE",
        item.issueId || null,
        item.objectiveId || null,
        item.name,
        item.plannedTime || "0",
        item.issueObjectiveId,
      );
    }
  };

  // Handle delete button click with event prevention
  const handleDeleteClick = (e: React.MouseEvent, item: MeetingAgenda) => {
    e.stopPropagation(); // Prevent event from bubbling to li
    handleDelete(item);
  };

  const handleCancelEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    cancelEdit();
  };

  return (
    <li
      key={item.issueObjectiveId}
      ref={setNodeRef}
      className={`group px-2 flex border w-full 
        ${item.departmentName && "pt-2"} 
                ${meetingStatus === "STARTED" || meetingStatus === "NOT_STARTED" ? "h-16 bg-white text-black" : "h-20"}
                ${isSelectedAgenda === item.issueObjectiveId ? "bg-primary text-white" : ""}
                mb-2 rounded-md shadow
                ${meetingStatus === "STARTED" || meetingStatus === "NOT_STARTED" ? "cursor-default" : "cursor-pointer"}`}
      onClick={() => {
        if (
          (meetingStatus !== "NOT_STARTED" &&
            meetingStatus !== "STARTED" &&
            follow) ||
          isUnFollow
        ) {
          // Allow all users to click, regardless of follow status
          if (handleListClick) {
            handleListClick(item.issueObjectiveId, !!isUnFollow);
          }
        }
      }}
      style={{
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
        ...style,
      }}
    >
      {item.departmentName && (
        <div className="w-fit h-fit absolute top-0 right-2 z-10">
          <div className="text-black text-[10px] bg-gray-200 shadow-md shadow-primary/10 py-0 px-5 rounded-b-lg">
            {item.departmentName}
          </div>
        </div>
      )}
      <div className="flex items-center w-full h-full">
        {isTeamLeader && (
          <span
            {...listeners}
            {...attributes}
            style={{ cursor: "grab" }}
            className="w-5 text-2xl mr-2 pt-1 h-full flex flex-col items-center justify-center"
          >
            ⋮⋮
          </span>
        )}

        <span
          className={`w-fit mr-3 pt-2 text-4xl text-primary text-center ${
            meetingStatus !== "STARTED" &&
            meetingStatus !== "NOT_STARTED" &&
            isSelectedAgenda === item.issueObjectiveId
              ? "bg-primary text-white"
              : "text-primary"
          }`}
        >
          {(idx || 0) + 1}
        </span>

        {editing?.issueObjectiveId === item.issueObjectiveId && canEdit ? (
          <div className="w-full flex items-center gap-1 relative">
            <div className="relative w-[92%] flex gap-2 items-center">
              <Input
                value={editing?.value || ""}
                onChange={(e) => setEditingValue(e.target.value)}
                className="mr-2 pr-8"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    updateEdit();
                  }
                }}
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 z-10 text-muted-foreground pointer-events-none text-sm">
                <CornerDownLeft className="text-gray-400 w-4" />
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleCancelEditClick}>
              <CircleX className="text-black" />
            </Button>
          </div>
        ) : (
          <div className="w-full flex items-center">
            <div
              className={`text-sm ${
                meetingStatus === "STARTED" || meetingStatus === "NOT_STARTED"
                  ? "w-full pr-8 h-14 flex items-center"
                  : "w-full min-w-48"
              } overflow-hidden line-clamp-3 ${
                meetingStatus !== "STARTED" &&
                meetingStatus !== "NOT_STARTED" &&
                isSelectedAgenda === item.issueObjectiveId
                  ? "text-white"
                  : "text-black"
              }`}
            >
              {item.name}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 relative">
        {/* <div className="text-sm text-center w-20 text-gray-500 absolute top-0 right-0">
          <Badge variant="secondary" className="mb-0">
            {item.ioType}
          </Badge>
        </div> */}

        <div className="relative group flex items-center">
          {
            // meetingStatus !== "STARTED" &&
            //   meetingStatus !== "NOT_STARTED" &&
            item.issueObjectiveId && (
              <div className="text-sm text-center ml-2 font-medium text-primary">
                <div className="text-xs text-center w-20 text-gray-500">
                  <Badge variant="secondary" className="mb-1 mt-1">
                    {item.ioType}
                  </Badge>
                </div>

                {meetingStatus !== "STARTED" &&
                  meetingStatus !== "NOT_STARTED" && (
                    <>
                      {meetingStatus === "DISCUSSION" ? (
                        <Timer
                          actualTime={Number(timerData.actualTime)}
                          defaultTime={Number(timerData.actualTime)}
                          lastSwitchTimestamp={timerData.lastSwitchTimestamp}
                          isActive={timerData.isActive}
                          className={`text-xl ${
                            isSelectedAgenda === item.issueObjectiveId
                              ? "text-white"
                              : ""
                          }`}
                        />
                      ) : (
                        <div
                          className={`text-xl ${
                            isSelectedAgenda === item.issueObjectiveId
                              ? "text-white"
                              : ""
                          }`}
                        >
                          {formatAgendaTime(
                            Number(
                              conclusionTime
                                ? conclusionTime?.agenda?.find(
                                    (con) =>
                                      con.issueObjectiveId ===
                                      item.issueObjectiveId,
                                  )?.actualTime
                                : 0,
                            ),
                          )}
                        </div>
                      )}
                    </>
                  )}
              </div>
            )
          }

          {isTeamLeader && (
            <div
              className={`absolute -right-[2px] rounded-md w-fit flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity ${meetingStatus === "STARTED" || meetingStatus === "NOT_STARTED" ? "h-[40px] px-0" : "h-[75px]"} content-center ${isSelectedAgenda === item.issueObjectiveId ? "bg-primary text-white" : "bg-white"}`}
            >
              <div className="">
                {editing?.issueObjectiveId !== item.issueObjectiveId && (
                  <div className="flex gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            onClick={(e) => handleMarkAsSolvedClick(e, item)} // Use the new handler
                            className="w-fit cursor-pointer hover:bg-transparent"
                          >
                            {item.isResolved ? (
                              <CopyX className="w-7 h-7 text-red-600" />
                            ) : (
                              <CopyCheck className="w-7 h-7 text-green-600" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {item.isResolved
                              ? "Mark As Unresolved"
                              : "Mark As Resolved"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            onClick={handleEditClick} // Use the new handler
                            className="w-5 hover:bg-transparent"
                          >
                            <SquarePen
                              className={`h-4 w-4 ${
                                isSelectedAgenda === item.issueObjectiveId
                                  ? "text-white"
                                  : "text-primary"
                              }`}
                            />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit Issue Objective</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            onClick={(e) => handleDeleteClick(e, item)} // Use the new handler
                            className="w-5 hover:bg-transparent"
                          >
                            <Unlink className="h-4 w-4 text-red-500" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Unlink from this Meeting</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
