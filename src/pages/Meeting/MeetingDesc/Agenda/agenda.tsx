import { useState } from "react";
import { CircleX, CornerDownLeft, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  addAgendaObjectiveMutation,
  addMeetingAgendaMutation,
  addMeetingTimeMutation,
  deleteMeetingIssueMutation,
  deleteMeetingObjectiveMutation,
  useGetMeetingIssue,
  useGetMeetingObjective,
} from "@/features/api/companyMeeting";
import Timer from "../Timer";
// import { getDatabase, ref, update } from "firebase/database";

interface AgendaProps {
  meetingId: string;
  meetingStatus?: string;
  meetingResponse?: MeetingResFire | null;
  agendaPlannedTime: number | string | undefined;
}

export default function Agenda({
  meetingId,
  meetingStatus,
  meetingResponse,
  agendaPlannedTime = 0,
}: AgendaProps) {
  const [issueInput, setIssueInput] = useState("");
  const [objectiveInput, setObjectiveInput] = useState("");
  const [editing, setEditing] = useState<{
    type: "issue" | "objective" | null;
    id: string | null;
    value: string;
    plannedMinutes: string;
    plannedSeconds: string;
  }>({
    type: null,
    id: null,
    value: "",
    plannedMinutes: "",
    plannedSeconds: "",
  });
  const [editingPart, setEditingPart] = useState<"minutes" | "seconds" | null>(
    null,
  );

  const startEdit = (
    type: "issue" | "objective",
    id: string,
    value: string,
    plannedTime: string,
  ) => {
    if (!canEdit) return;
    const totalSeconds = plannedTime ? parseInt(plannedTime, 10) : 0;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    setEditing({
      type,
      id,
      value,
      plannedMinutes: String(minutes),
      plannedSeconds: String(seconds),
    });
  };
  const setEditingValue = (value: string) => {
    setEditing((prev) => ({ ...prev, value }));
  };
  const cancelEdit = () => {
    setEditing({
      type: null,
      id: null,
      value: "",
      plannedMinutes: "",
      plannedSeconds: "",
    });
  };

  const { mutate: addIssueAgenda } = addMeetingAgendaMutation();
  const { mutate: addObjectiveAgenda } = addAgendaObjectiveMutation();

  const { mutate: deleteIssue } = deleteMeetingIssueMutation();
  const { mutate: deleteObjective } = deleteMeetingObjectiveMutation();
  const { mutate: updateAgendaTime } = addMeetingTimeMutation();

  const { data: issueData } = useGetMeetingIssue({
    filter: {
      meetingId: meetingId,
    },
  });
  const { data: objectiveData } = useGetMeetingObjective({
    filter: {
      meetingId: meetingId,
    },
  });

  // const agendaFireBase = (id: string) => {
  //   if (meetingStatus) {
  //     const db = getDatabase();
  //     const meetRef = ref(db, `meetings/${meetingId}/timers/issues/${id}`);
  //     update(meetRef, {
  //       updatedAt: Date.now(),
  //     });
  //   }
  // };

  const handleAddIssue = () => {
    if (!canEdit) return;
    if (meetingId) {
      addIssueAgenda(
        {
          agendaIssue: issueInput,
          meetingId: meetingId,
        },
        {
          onSuccess: () => {
            // agendaFireBase();
            setIssueInput("");
          },
        },
      );
    }
  };

  const handleAddObjective = () => {
    if (!canEdit) return;
    if (meetingId) {
      addObjectiveAgenda(
        {
          agendaObjective: objectiveInput,
          meetingId: meetingId,
        },
        {
          onSuccess: () => {
            // agendaFireBase();
            setObjectiveInput("");
          },
        },
      );
    }
  };

  const updateEdit = () => {
    if (!canEdit) return;
    if (!editing.type || !editing.id || !meetingId) return;
    const plannedTimeInSeconds =
      (Number(editing.plannedMinutes) || 0) * 60 +
      (Number(editing.plannedSeconds) || 0);
    if (editing.type === "issue") {
      addIssueAgenda(
        {
          detailMeetingAgendaIssueId: editing.id,
          agendaIssue: editing.value,
          meetingId,
          issuePlannedTime: String(plannedTimeInSeconds),
        },
        {
          onSuccess: () => {
            // agendaFireBase();
            cancelEdit();
          },
        },
      );
    } else if (editing.type === "objective") {
      addObjectiveAgenda(
        {
          detailMeetingAgendaObjectiveId: editing.id,
          agendaObjective: editing.value,
          meetingId,
          objectivePlannedTime: String(plannedTimeInSeconds),
        },
        {
          onSuccess: () => {
            // agendaFireBase();
            cancelEdit();
          },
        },
      );
    }
  };

  const handleDelete = (id: string, type: string) => {
    if (!canEdit) return;
    if (type === "Issue") {
      deleteIssue(id, {
        onSuccess: () => {
          // agendaFireBase();
          setIssueInput("");
        },
      });
    } else if (type === "Objective") {
      deleteObjective(id, {
        onSuccess: () => {
          // agendaFireBase();
          setIssueInput("");
        },
      });
    }
  };

  const canEdit = true;

  const handleTimerUpdate = (newTime: number) => {
    updateAgendaTime({
      meetingId: meetingId,
      agendaTimePlanned: String(newTime),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-5 items-center">
        <h2 className="text-lg">Agenda</h2>
        <Timer
          plannedTime={Number(agendaPlannedTime)}
          actualTime={0}
          lastSwitchTimestamp={Number(
            meetingResponse?.state.lastSwitchTimestamp,
          )}
          meetingStart={meetingStatus === "STARTED"}
          onTimeUpdate={handleTimerUpdate}
          // defaultTime={Number(agendaPlannedTime)}
        />
      </div>
      <div className="grid grid-cols-2 border rounded-lg">
        <div className="space-y-2 border-r pr-5 py-2 px-4">
          <h4 className="font-medium">Issues</h4>
          {canEdit && (
            <div className="flex gap-2 relative">
              <Input
                value={issueInput}
                onChange={(e) => setIssueInput(e.target.value)}
                placeholder="Enter an issue"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddIssue();
                  }
                }}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-sm">
                <CornerDownLeft className="text-gray-400 w-4" />
              </span>
            </div>
          )}
          <div className="mt-2 space-y-2">
            {issueData?.data && issueData.data.length > 0 ? (
              <ul className="space-y-2">
                {issueData?.data.map((item) => (
                  <li
                    key={item.detailMeetingAgendaIssueId}
                    className="flex items-center justify-between px-2 border rounded"
                  >
                    {editing.type === "issue" &&
                    editing.id === item.detailMeetingAgendaIssueId &&
                    canEdit ? (
                      <div className="w-full flex items-center gap-1">
                        <div className="relative w-full flex gap-2 items-center">
                          <Input
                            value={editing.value}
                            onChange={(e) => setEditingValue(e.target.value)}
                            className="mr-2"
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
                        <div
                          style={{
                            fontSize: "1.5rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          {editingPart === "minutes" ? (
                            <input
                              type="text"
                              value={editing.plannedMinutes}
                              maxLength={2}
                              onChange={(e) => {
                                let val = e.target.value.replace(/[^0-9]/g, "");
                                if (val.length > 2) val = val.slice(0, 2);
                                setEditing((prev) => ({
                                  ...prev,
                                  plannedMinutes: val,
                                }));
                              }}
                              onBlur={(e) => {
                                const val = e.target.value.replace(
                                  /[^0-9]/g,
                                  "",
                                );
                                const num = Math.max(
                                  0,
                                  Math.min(60, Number(val)),
                                );
                                setEditing((prev) => ({
                                  ...prev,
                                  plannedMinutes: String(num),
                                }));
                                setEditingPart(null);
                                updateEdit();
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const val = (
                                    e.target as HTMLInputElement
                                  ).value.replace(/[^0-9]/g, "");
                                  const num = Math.max(
                                    0,
                                    Math.min(60, Number(val)),
                                  );
                                  setEditing((prev) => ({
                                    ...prev,
                                    plannedMinutes: String(num),
                                  }));
                                  setEditingPart(null);
                                  updateEdit();
                                }
                              }}
                              style={{
                                width: "2.5rem",
                                fontSize: "1.5rem",
                                textAlign: "right",
                              }}
                              autoFocus
                            />
                          ) : (
                            <span
                              onClick={() => setEditingPart("minutes")}
                              style={{
                                cursor: "pointer",
                                minWidth: "2rem",
                                textAlign: "right",
                              }}
                            >
                              {editing.plannedMinutes.padStart(2, "0")}
                            </span>
                          )}
                          <span>:</span>
                          {editingPart === "seconds" ? (
                            <input
                              type="text"
                              value={editing.plannedSeconds}
                              maxLength={2}
                              onChange={(e) => {
                                let val = e.target.value.replace(/[^0-9]/g, "");
                                if (val.length > 2) val = val.slice(0, 2);
                                setEditing((prev) => ({
                                  ...prev,
                                  plannedSeconds: val,
                                }));
                              }}
                              onBlur={(e) => {
                                const val = e.target.value.replace(
                                  /[^0-9]/g,
                                  "",
                                );
                                const num = Math.max(
                                  0,
                                  Math.min(59, Number(val)),
                                );
                                setEditing((prev) => ({
                                  ...prev,
                                  plannedSeconds: String(num),
                                }));
                                setEditingPart(null);
                                updateEdit();
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const val = (
                                    e.target as HTMLInputElement
                                  ).value.replace(/[^0-9]/g, "");
                                  const num = Math.max(
                                    0,
                                    Math.min(59, Number(val)),
                                  );
                                  setEditing((prev) => ({
                                    ...prev,
                                    plannedSeconds: String(num),
                                  }));
                                  setEditingPart(null);
                                  updateEdit();
                                }
                              }}
                              style={{
                                width: "2.5rem",
                                fontSize: "1.5rem",
                                textAlign: "left",
                              }}
                              autoFocus
                            />
                          ) : (
                            <span
                              onClick={() => setEditingPart("seconds")}
                              style={{
                                cursor: "pointer",
                                minWidth: "2rem",
                                textAlign: "left",
                              }}
                            >
                              {editing.plannedSeconds.padStart(2, "0")}
                            </span>
                          )}
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
                      <>
                        <span>{item.agendaIssue} </span>
                        <div className="flex gap-4 items-center">
                          <span className="text-xs font-medium">
                            (
                            {(() => {
                              const total =
                                parseInt(String(item.issuePlannedTime), 10) ||
                                0;
                              const min = Math.floor(total / 60);
                              const sec = total % 60;
                              if (min && sec) return `${min}m ${sec}s`;
                              if (min) return `${min}m`;
                              if (sec) return `${sec}s`;
                              return "No time";
                            })()}
                            )
                          </span>
                          {canEdit && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  startEdit(
                                    "issue",
                                    item.detailMeetingAgendaIssueId,
                                    item.agendaIssue,
                                    item.issuePlannedTime || "",
                                  )
                                }
                              >
                                <Pencil className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDelete(
                                    item.detailMeetingAgendaIssueId,
                                    "Issue",
                                  )
                                }
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No issues added</p>
            )}
          </div>
        </div>

        <div className="space-y-2 py-2 px-4">
          <h4 className="font-medium">Objective</h4>
          {canEdit && (
            <div className="flex gap-2 relative">
              <Input
                value={objectiveInput}
                onChange={(e) => setObjectiveInput(e.target.value)}
                placeholder="Enter a suggestion"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddObjective();
                  }
                }}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-sm">
                <CornerDownLeft className="text-gray-400 w-4" />
              </span>
            </div>
          )}
          <div className="mt-2 space-y-2">
            {objectiveData?.data && objectiveData.data.length > 0 ? (
              <ul className="space-y-2">
                {objectiveData.data.map((item) => (
                  <li
                    key={item.detailMeetingAgendaObjectiveId}
                    className="flex items-center justify-between px-2 border rounded"
                  >
                    {editing.type === "objective" &&
                    editing.id === item.detailMeetingAgendaObjectiveId &&
                    canEdit ? (
                      <div className="w-full flex items-center gap-1">
                        <div className="relative w-full flex gap-2 items-center">
                          <Input
                            value={editing.value}
                            onChange={(e) => setEditingValue(e.target.value)}
                            className="mr-2"
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
                        <div
                          style={{
                            fontSize: "1.5rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          {editingPart === "minutes" ? (
                            <input
                              type="text"
                              value={editing.plannedMinutes}
                              maxLength={2}
                              onChange={(e) => {
                                let val = e.target.value.replace(/[^0-9]/g, "");
                                if (val.length > 2) val = val.slice(0, 2);
                                setEditing((prev) => ({
                                  ...prev,
                                  plannedMinutes: val,
                                }));
                              }}
                              onBlur={(e) => {
                                const val = e.target.value.replace(
                                  /[^0-9]/g,
                                  "",
                                );
                                const num = Math.max(
                                  0,
                                  Math.min(60, Number(val)),
                                );
                                setEditing((prev) => ({
                                  ...prev,
                                  plannedMinutes: String(num),
                                }));
                                setEditingPart(null);
                                updateEdit();
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const val = (
                                    e.target as HTMLInputElement
                                  ).value.replace(/[^0-9]/g, "");
                                  const num = Math.max(
                                    0,
                                    Math.min(60, Number(val)),
                                  );
                                  setEditing((prev) => ({
                                    ...prev,
                                    plannedMinutes: String(num),
                                  }));
                                  setEditingPart(null);
                                  updateEdit();
                                }
                              }}
                              style={{
                                width: "2.5rem",
                                fontSize: "1.5rem",
                                textAlign: "right",
                              }}
                              autoFocus
                            />
                          ) : (
                            <span
                              onClick={() => setEditingPart("minutes")}
                              style={{
                                cursor: "pointer",
                                minWidth: "2rem",
                                textAlign: "right",
                              }}
                            >
                              {editing.plannedMinutes.padStart(2, "0")}
                            </span>
                          )}
                          <span>:</span>
                          {editingPart === "seconds" ? (
                            <input
                              type="text"
                              value={editing.plannedSeconds}
                              maxLength={2}
                              onChange={(e) => {
                                let val = e.target.value.replace(/[^0-9]/g, "");
                                if (val.length > 2) val = val.slice(0, 2);
                                setEditing((prev) => ({
                                  ...prev,
                                  plannedSeconds: val,
                                }));
                              }}
                              onBlur={(e) => {
                                const val = e.target.value.replace(
                                  /[^0-9]/g,
                                  "",
                                );
                                const num = Math.max(
                                  0,
                                  Math.min(59, Number(val)),
                                );
                                setEditing((prev) => ({
                                  ...prev,
                                  plannedSeconds: String(num),
                                }));
                                setEditingPart(null);
                                updateEdit();
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const val = (
                                    e.target as HTMLInputElement
                                  ).value.replace(/[^0-9]/g, "");
                                  const num = Math.max(
                                    0,
                                    Math.min(59, Number(val)),
                                  );
                                  setEditing((prev) => ({
                                    ...prev,
                                    plannedSeconds: String(num),
                                  }));
                                  setEditingPart(null);
                                  updateEdit();
                                }
                              }}
                              style={{
                                width: "2.5rem",
                                fontSize: "1.5rem",
                                textAlign: "left",
                              }}
                              autoFocus
                            />
                          ) : (
                            <span
                              onClick={() => setEditingPart("seconds")}
                              style={{
                                cursor: "pointer",
                                minWidth: "2rem",
                                textAlign: "left",
                              }}
                            >
                              {editing.plannedSeconds.padStart(2, "0")}
                            </span>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" onClick={cancelEdit}>
                          <CircleX />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span>{item.agendaObjective} </span>
                        <div className="flex gap-4 items-center">
                          <span className="text-xs font-medium">
                            (
                            {(() => {
                              const total =
                                parseInt(
                                  String(item.objectivePlannedTime),
                                  10,
                                ) || 0;
                              const min = Math.floor(total / 60);
                              const sec = total % 60;
                              if (min && sec) return `${min}m ${sec}s`;
                              if (min) return `${min}m`;
                              if (sec) return `${sec}s`;
                              return "No time";
                            })()}
                            )
                          </span>
                          {canEdit && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  startEdit(
                                    "objective",
                                    item.detailMeetingAgendaObjectiveId,
                                    item.agendaObjective,
                                    item.objectivePlannedTime || "",
                                  )
                                }
                              >
                                <Pencil className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDelete(
                                    item.detailMeetingAgendaObjectiveId,
                                    "Objective",
                                  )
                                }
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No Objective added</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
