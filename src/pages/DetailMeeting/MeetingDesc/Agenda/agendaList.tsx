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
}: AgendaListProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item?.issueObjectiveId || "" });

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

  return (
    <li
      key={item?.issueObjectiveId}
      ref={setNodeRef}
      className={`group px-2 flex border w-full 
                ${meetingStatus === "STARTED" || meetingStatus === "NOT_STARTED" ? "h-14 bg-white text-black" : "h-20"}
                ${isSelectedAgenda === item?.issueObjectiveId ? "bg-primary text-white" : ""}
                mb-2 rounded-md shadow
                ${meetingStatus === "STARTED" || meetingStatus === "NOT_STARTED" ? "cursor-default" : "cursor-pointer"}`}
      onClick={() => {
        if (
          (meetingStatus !== "NOT_STARTED" &&
            meetingStatus !== "STARTED" &&
            follow) ||
          meetingStatus === "ENDED"
        ) {
          if (handleListClick && item) {
            handleListClick(item.issueObjectiveId ?? "");
          }
        }
      }}
      style={{
        alignItems: "center",
        justifyContent: "space-between",
        // transition: "border 0.2s ease",
        position: "relative",
        ...style,
      }}
    >
      {item?.departmentName && (
        <div className="absolute -top-2 left-2 w-fit h-fit">
          <div className="text-black text-[12px] bg-gray-200/80 pt-2 pb-0.5 px-3 rounded-full">
            {item?.departmentName}
          </div>
        </div>
      )}
      <div className="flex items-center w-full h-full">
        {isTeamLeader && (
          <span
            {...listeners}
            {...attributes}
            style={{ cursor: "grab" }}
            className="w-5 text-2xl mr-2 h-full flex flex-col items-center justify-center"
          >
            ⋮⋮
          </span>
        )}

        <span
          className={`w-fit mr-3 text-4xl text-primary text-center ${
            meetingStatus !== "STARTED" &&
            meetingStatus !== "NOT_STARTED" &&
            isSelectedAgenda === item?.issueObjectiveId
              ? "bg-primary text-white"
              : "text-primary"
          }`}
        >
          {idx! + 1}
        </span>

        {editing?.issueObjectiveId === item?.issueObjectiveId && canEdit ? (
          <div className="w-full flex items-center gap-1">
            <div className="relative w-full flex gap-2 items-center">
              <Input
                value={editing?.value}
                onChange={(e) => setEditingValue(e.target.value)}
                className="mr-2"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    updateEdit();
                  }
                }}
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-sm">
                <CornerDownLeft className="text-gray-400 w-4" />
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={cancelEdit}>
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
                isSelectedAgenda === item?.issueObjectiveId
                  ? "text-white"
                  : "text-black"
              }`}
            >
              {item?.name}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 relative">
        {/* {!canEdit && ( */}
        <div className="text-sm text-center w-20 text-gray-500 absolute top-0 right-0">
          <Badge variant="secondary" className="mb-0">
            {item?.ioType}
          </Badge>
        </div>
        {/* )} */}

        <div className="relative group flex items-center">
          {meetingStatus !== "STARTED" &&
            meetingStatus !== "NOT_STARTED" &&
            item?.issueObjectiveId && (
              <div className="text-sm text-center ml-2 font-medium text-primary">
                <div className="text-xs text-center w-20 text-gray-500">
                  <Badge variant="secondary" className="mb-1.5">
                    {item?.ioType}
                  </Badge>
                </div>
                {meetingStatus === "DISCUSSION" ? (
                  <Timer
                    actualTime={Number(
                      meetingResponse &&
                        meetingResponse?.timers.objectives?.[
                          item.issueObjectiveId
                        ]?.actualTime,
                    )}
                    defaultTime={Number(
                      meetingResponse &&
                        meetingResponse?.timers.objectives?.[
                          item.issueObjectiveId
                        ]?.actualTime,
                    )}
                    lastSwitchTimestamp={
                      isSelectedAgenda === item.issueObjectiveId
                        ? Number(
                            meetingResponse?.state.lastSwitchTimestamp ||
                              Date.now(),
                          )
                        : 0
                    }
                    isActive={isSelectedAgenda === item.issueObjectiveId}
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
                                con.issueObjectiveId === item.issueObjectiveId,
                            )?.actualTime
                          : 0,
                      ),
                    )}
                  </div>
                )}
              </div>
            )}

          {isTeamLeader && (
            <div
              className={`absolute -right-[2px] rounded-md w-fit flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity ${meetingStatus === "STARTED" || meetingStatus === "NOT_STARTED" ? "h-[40px] px-10" : "h-[75px]"} content-center ${isSelectedAgenda === item?.issueObjectiveId ? "bg-primary text-white" : "bg-white"}`}
            >
              <div className="">
                {editing?.issueObjectiveId !== item?.issueObjectiveId && (
                  <div className="flex gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            onClick={() => handleMarkAsSolved(item!)}
                            className="w-fit cursor-pointer hover:bg-transparent"
                          >
                            {item?.isResolved ? (
                              <CopyX className="w-7 h-7 text-red-600" />
                            ) : (
                              <CopyCheck className="w-7 h-7 text-green-600" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {item?.isResolved
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
                            onClick={(e) => {
                              e.stopPropagation();
                              if (item) {
                                startEdit(
                                  item.ioType === "OBJECTIVE"
                                    ? "OBJECTIVE"
                                    : "ISSUE",
                                  item.issueId || null,
                                  item.objectiveId || null,
                                  item.name,
                                  item.plannedTime || "0",
                                  item.issueObjectiveId,
                                );
                              }
                            }}
                            className="w-5 hover:bg-transparent"
                          >
                            <SquarePen
                              className={`h-4 w-4 ${
                                isSelectedAgenda === item?.issueObjectiveId
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item!);
                            }}
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
