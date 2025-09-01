import { useState } from "react";

import {
  ArrowUp,
  Calendar,
  CircleX,
  Clock,
  CornerDownLeft,
  FileText,
  SquarePen,
  Target,
  Trash2,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { Badge } from "@/components/ui/badge";
import MeetingTimer from "./meetingTimer";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDetailRepeatMeeting } from "./useDetailRepeatMeeting";

function IssueModal({
  open,
  onClose,
  issue,
  defaultType = "",
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  issue: string;
  defaultType?: string;
  onSubmit?: (data: { type: string; value: string }) => void;
}) {
  const [selectedType, setSelectedType] = useState(defaultType);
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div className="bg-white w-96 p-5 rounded-md shadow-2xl border-2">
        <p>Value: {issue}</p>
        <div className="my-3">
          <RadioGroup value={selectedType} onValueChange={setSelectedType}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ISSUE" id="r1" />
              <label htmlFor="r1">Issue</label>
              <RadioGroupItem value="OBJECTIVE" id="r2" className="ml-6" />
              <label htmlFor="r2">Objective</label>
            </div>
          </RadioGroup>
        </div>
        <Button
          onClick={() => {
            if (selectedType && onSubmit) {
              onSubmit({ type: selectedType, value: issue });
            }
          }}
          disabled={!selectedType}
        >
          Submit
        </Button>
        <Button onClick={onClose} style={{ marginLeft: 8 }}>
          Close
        </Button>
      </div>
    </div>
  );
}

interface AgendaProps {
  meetingName: string;
  meetingStatus?: string;
  meetingResponse?: MeetingResFire | null;
  joiners: Joiners[];
  meetingTime?: string;
  isTeamLeader: boolean | undefined;
  isCheckIn?: boolean;
  follow?: boolean;
}

export default function DetailRepeatMeeting({
  meetingName,
  meetingStatus,
  meetingResponse,
  meetingTime,
  // isTeamLeader,
  // isCheckIn,
  // follow,
  // joiners,
}: AgendaProps) {
  const {
    issueInput,
    editing,
    modalOpen,
    modalIssue,
    dropdownVisible,
    agendaList,
    filteredIssues,
    searchOptions,
    setIssueInput,
    setEditingValue,
    setModalOpen,
    setDropdownVisible,
    handleAddIssue,
    startEdit,
    cancelEdit,
    updateEdit,
    handleDelete,
    handleUpdateSelectedObjective,
    handleModalSubmit,
    handleTimeUpdate,
    isUpdatingTime,
    setResolutionFilter,
  } = useDetailRepeatMeeting({
    meetingStatus,
    meetingResponse,
    canEdit: true,
  });

  const canEdit = true;

  const tips: TipItem[] = [
    {
      icon: <Target className="w-8 h-8 text-blue-500" />,
      title: "DEFINE PURPOSE AND KEY POINTS",
      description: "Summarize the goal, list discussion points",
    },
    {
      icon: <Calendar className="w-8 h-8 text-blue-500" />,
      title: "BREAK DOWN AGENDA INTO TIME-BOXED TOPICS",
      description: "Use focused, time boxed topics",
    },
    {
      icon: <ArrowUp className="w-8 h-8 text-blue-500" />,
      title: "PRIORITIZE HIGH IMPACT ITEMS",
      description: "Address them first",
    },
    {
      icon: <User className="w-8 h-8 text-blue-500" />,
      title: "ASSIGN TOPIC OWNERS AND TIME ESTIMATES",
      description: "Add leaders and time estimates",
    },
    {
      icon: <Clock className="w-8 h-8 text-blue-500" />,
      title: "KEEP MEETING ON TRACK AND LEAVE ROOM FOR QUESTIONS",
      description: "Stick to the agenda, allocate time questions",
    },
    {
      icon: <FileText className="w-8 h-8 text-blue-500" />,
      title: "ALLOCATE TIME FOR ADDITIONAL",
      description: "Allow a few minutes at the end",
    },
  ];

  return (
    <div>
      {/* radio button modal */}
      <IssueModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        issue={modalIssue}
        defaultType=""
        onSubmit={handleModalSubmit}
      />

      <div className="flex justify-between">
        <div className="w-full flex h-[40px] border border-gray-300 rounded-[10px] items-center px-4 mr-4">
          <div className="flex-1 text-lg  w-[30%] text-primary ml-3 font-semibold truncate">
            {meetingName}
          </div>

          <div className="hidden md:block w-[50%] text-gray-500  text-lg truncate ml-4">
            Meeting Agenda
          </div>
        </div>

        <div className="flex flex-wrap md:flex-nowrap items-center gap-3 md:w-auto">
          <div className="w-fit pr-2 h-[40px] border-gray-300 rounded-[10px] flex items-center justify-center">
            <MeetingTimer
              meetingTime={Number(meetingTime) || 0}
              className="text-xl sm:text-2xl md:text-3xl font-semibold text-primary"
              onTimeUpdate={handleTimeUpdate}
              meetingStatus={meetingStatus}
              isUpdating={isUpdatingTime}
            />
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <div className={"w-[50%]"}>
          <div className="flex gap-2 relative">
            <div className="flex gap-2 relative w-full">
              <Input
                value={issueInput}
                onChange={(e) => {
                  setIssueInput(e.target.value);
                  setDropdownVisible(true);
                }}
                placeholder="Add or Create Agenda (Issue or Objective)"
                onFocus={() => setDropdownVisible(true)}
                onBlur={() => setTimeout(() => setDropdownVisible(false), 150)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddIssue();
                  }
                }}
                className="w-full h-[45px] sm:h-[50px] border-0 border-b-2 border-gray-300 rounded-none pr-10 text-sm sm:text-base focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[0px] "
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <CornerDownLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
              {dropdownVisible && filteredIssues.length > 0 && (
                <ul
                  style={{
                    position: "absolute",
                    top: "110%",
                    left: 0,
                    right: 0,
                    background: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: 6,
                    zIndex: 10,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    maxHeight: 180,
                    overflowY: "auto",
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                  }}
                >
                  {searchOptions.map((item) => (
                    <li
                      key={item.id}
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                      onMouseDown={() => {
                        handleUpdateSelectedObjective(item);
                      }}
                    >
                      {item.name} ({item.ioType})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="mt-2 h-[calc(100vh-215px)] relative pr-1 w-full overflow-auto">
            <div className="mb-3">
              <Tabs
                defaultValue="unsolved"
                onValueChange={(value) =>
                  setResolutionFilter(value as "solved" | "unsolved")
                }
                className="w-full"
              >
                <TabsList className="grid w-64 grid-cols-2">
                  <TabsTrigger
                    value="unsolved"
                    className="data-[state=active]:bg-primary data-[state=active]:text-white"
                  >
                    Unsolved
                  </TabsTrigger>
                  <TabsTrigger
                    value="solved"
                    className="data-[state=active]:bg-primary data-[state=active]:text-white"
                  >
                    Solved
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="unsolved" className="mt-0"></TabsContent>
                <TabsContent value="solved" className="mt-0"></TabsContent>
              </Tabs>
            </div>

            {agendaList && agendaList.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {agendaList.map((item, idx) => (
                  <li
                    key={item.issueObjectiveId}
                    className={`group px-2 flex w-full h-14 bg-white text-black`}
                    style={{
                      cursor: "default",
                      border: "1px solid #eee",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "border 0.2s ease",
                      position: "relative",
                    }}
                  >
                    <div className="flex items-center w-full">
                      <span
                        className={`w-10 mr-3 text-4xl text-primary text-center `}
                      >
                        {idx + 1}
                      </span>

                      {editing.issueObjectiveId === item.issueObjectiveId &&
                      canEdit ? (
                        <div className="w-full flex items-center gap-1">
                          <div className="relative w-full flex gap-2 items-center">
                            <Input
                              value={editing.value}
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={cancelEdit}
                          >
                            <CircleX />
                          </Button>
                        </div>
                      ) : (
                        <div className="w-full flex items-center">
                          <div
                            className={`text-sm overflow-hidden line-clamp-3`}
                          >
                            {item.name}
                          </div>
                        </div>
                      )}
                    </div>
                    {}
                    <div className="flex items-center gap-2 relative">
                      <div className="text-xs text-center w-20 text-gray-500 absolute top-0 right-0">
                        <Badge variant="secondary" className="mb-1.5">
                          {item.ioType}
                        </Badge>
                      </div>

                      {canEdit && (
                        <div className="flex-shrink-0 opacity-0 z-30 pl-5 bg-white w-20 text-left group-hover:opacity-100 transition-opacity">
                          {!(
                            editing.issueObjectiveId === item.issueObjectiveId
                          ) && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
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
                                }}
                                className="w-5"
                              >
                                <SquarePen className="h-4 w-4 text-primary" />
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(item);
                                }}
                                className="w-5"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {item.issueObjectiveId && (
                        <div className="text-sm text-center ml-2 font-medium text-primary">
                          <div className="text-xs text-center w-20 text-gray-500">
                            <Badge variant="secondary" className="mb-1.5">
                              {item.ioType}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No issues added</p>
            )}
          </div>
        </div>
        <div className=" w-[50%] py-5">
          <div
            className={`flex justify-center h-[calc(100vh-200px)] overflow-scroll w-full relative border-primary}`}
          >
            <div className="max-w-3xl border rounded-sm overflow-y-scroll h-fit">
              <div className="p-6">
                <div className="text-center mb-6">
                  <h1
                    className="text-2xl font-bold text-navy-900 mb-2"
                    style={{ color: "#1e3a8a" }}
                  >
                    TIPS FOR WRITING A CLEAR & EFFECTIVE
                  </h1>
                  <h3
                    className="text-2xl font-bold text-navy-900 mb-2"
                    style={{ color: "#1e3a8a" }}
                  >
                    MEETING AGENDA
                  </h3>
                  <div className="w-20 h-1 bg-orange-400 mx-auto"></div>
                </div>

                <div className="space-y-6">
                  {tips.map((tip, index) => (
                    <div key={index} className="flex items-start space-x-6">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        {tip.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
                          {tip.title}
                        </h4>
                        <p className="text-gray-600 text-base leading-relaxed">
                          {tip.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
