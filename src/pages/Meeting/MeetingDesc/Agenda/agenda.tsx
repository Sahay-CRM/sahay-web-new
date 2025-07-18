import { useState } from "react";
import { CircleX, CornerDownLeft, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import {
  addMeetingAgendaMutation,
  // addMeetingTimeMutation,
  deleteMeetingObjectiveMutation,
  useGetDetailMeetingAgenda,
  useGetDetailMeetingObj,
} from "@/features/api/companyMeeting";
import Timer from "../Timer";
import { addUpdateIssues } from "@/features/api/Issues";
import { addUpdateObjective } from "@/features/api/Objective";
import { queryClient } from "@/queryClient";

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
      <div
        className="bg-white w-96 p-5 rounded-md shadow-2xl border-2"
        // style={{
        //   background: "white",
        //   padding: 24,
        //   borderRadius: 8,
        //   minWidth: 300,
        // }}
      >
        <p>Value: {issue}</p>
        <div className="my-3">
          <RadioGroup value={selectedType} onValueChange={setSelectedType}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="issue" id="r1" />
              <label htmlFor="r1">Issue</label>
              <RadioGroupItem value="objective" id="r2" className="ml-6" />
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
  meetingId: string;
  meetingStatus?: string;
  meetingResponse?: MeetingResFire | null;
  agendaPlannedTime: number | string | undefined;
  detailMeetingId: string | undefined;
}

export default function Agenda({
  meetingId,
  meetingStatus,
  meetingResponse,
  agendaPlannedTime = 0,
  detailMeetingId,
}: AgendaProps) {
  const [issueInput, setIssueInput] = useState("");
  // const [objectiveInput, setObjectiveInput] = useState("");
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

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIssue, setModalIssue] = useState("");
  // Dropdown state
  const [dropdownVisible, setDropdownVisible] = useState(false);

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

  const { mutate: deleteObjective } = deleteMeetingObjectiveMutation();
  // const { mutate: updateAgendaTime } = addMeetingTimeMutation();

  const { mutate: addIssueAgenda } = addMeetingAgendaMutation();
  const { data: selectedAgenda } = useGetDetailMeetingAgenda({
    filter: {
      detailMeetingId: detailMeetingId,
    },
    enable: !!detailMeetingId,
  });
  const { mutate: addIssue } = addUpdateIssues();
  const { mutate: addObjective } = addUpdateObjective();

  const shouldFetch = issueInput.length >= 3;
  const { data: issueData } = useGetDetailMeetingObj({
    filter: {
      search: issueInput,
    },
    enable: !!shouldFetch,
  });

  // Filtered issues for dropdown
  const filteredIssues = (issueData?.data ?? []).filter(
    (item) =>
      item.name.toLowerCase().includes(issueInput.toLowerCase()) &&
      issueInput.trim() !== "",
  );

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
    setModalIssue(issueInput);
    setModalOpen(true);
    setDropdownVisible(false);
  };

  const updateEdit = () => {
    if (!canEdit) return;
    if (!editing.type || !editing.id || !meetingId) return;
    if (editing.type === "issue") {
      addIssue(
        {
          issueId: editing.id,
          issueName: editing.value,
        },
        {
          onSuccess: () => {
            queryClient.resetQueries({
              queryKey: ["get-detail-meeting-agenda-issue-obj"],
            });
            cancelEdit();
          },
        },
      );
    } else if (editing.type === "objective") {
      addObjective(
        {
          objectiveId: editing.id,
          objectiveName: editing.value,
        },
        {
          onSuccess: () => {
            queryClient.resetQueries({
              queryKey: ["get-detail-meeting-agenda-issue-obj"],
            });
          },
        },
      );
    }
  };

  const handleDelete = (item: MeetingAgenda) => {
    if (item && item.detailMeetingAgendaIssueId) {
      deleteObjective(item.detailMeetingAgendaIssueId);
    }
  };

  const canEdit = true;

  // const handleTimerUpdate = (newTime: number) => {
  //   updateAgendaTime({
  //     meetingId: meetingId,
  //     agendaTimePlanned: String(newTime),
  //   });
  // };

  const searchOptions = (issueData?.data ?? []).map((item) => ({
    name: item.name,
    id: item.id,
    type: item.type,
  }));

  const handleUpdateSelectedObjective = (data: DetailMeetingObjectives) => {
    const payload = {
      detailMeetingId: detailMeetingId,
      issueObjectiveId: data.id,
      meetingId: meetingId,
      agendaType: data.type,
    };
    addIssueAgenda(payload, {
      onSuccess: () => {
        setIssueInput("");
      },
    });
  };

  const handleModalSubmit = (data: { type: string; value: string }) => {
    if (data.type === "issue") {
      addIssue(
        {
          issueName: data.value,
        },
        {
          onSuccess: (res) => {
            const payload = {
              detailMeetingId: detailMeetingId,
              issueObjectiveId: res.data.issueId,
              meetingId: meetingId,
              agendaType: "issue",
            };

            addIssueAgenda(payload, {
              onSuccess: () => {
                setIssueInput("");
                queryClient.resetQueries({
                  queryKey: ["get-detail-meeting-agenda-issue-obj"],
                });
                cancelEdit();
                setModalOpen(false);
              },
            });
          },
        },
      );
    } else if (data.type === "objective") {
      addObjective(
        {
          objectiveName: data.value,
        },
        {
          onSuccess: (res) => {
            const payload = {
              detailMeetingId: detailMeetingId,
              issueObjectiveId: res.data.objectiveId,
              meetingId: meetingId,
              agendaType: "objective",
            };

            addIssueAgenda(payload, {
              onSuccess: () => {
                setIssueInput("");
                queryClient.resetQueries({
                  queryKey: ["get-detail-meeting-agenda-issue-obj"],
                });
                cancelEdit();
                setModalOpen(false);
              },
            });
          },
        },
      );
    }
  };

  return (
    <div className="space-y-4">
      <IssueModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        issue={modalIssue}
        defaultType=""
        onSubmit={handleModalSubmit}
      />
      <div className="flex gap-5 items-center">
        <h2 className="text-lg">Agenda</h2>
        <Timer
          plannedTime={Number(agendaPlannedTime)}
          actualTime={0}
          lastSwitchTimestamp={Number(
            meetingResponse?.state.lastSwitchTimestamp,
          )}
          meetingStart={meetingStatus === "STARTED"}
          // onTimeUpdate={handleTimerUpdate}
          // defaultTime={Number(agendaPlannedTime)}
        />
      </div>
      <div className="">
        <div className="px-4">
          <h4 className="font-medium">Issues</h4>
          {canEdit && (
            <div className="flex gap-2 relative">
              <Input
                value={issueInput}
                onChange={(e) => {
                  setIssueInput(e.target.value);
                  setDropdownVisible(true);
                }}
                placeholder="Enter an issue"
                onFocus={() => setDropdownVisible(true)}
                onBlur={() => setTimeout(() => setDropdownVisible(false), 150)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddIssue();
                  }
                }}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-sm">
                <CornerDownLeft className="text-gray-400 w-4" />
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
                      style={{ padding: "8px 12px", cursor: "pointer" }}
                      onMouseDown={() => {
                        handleUpdateSelectedObjective(item);
                      }}
                    >
                      {item.name} ({item.type})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <div className="mt-2 space-y-2">
            {selectedAgenda && selectedAgenda.length > 0 ? (
              <ul className="space-y-2">
                {selectedAgenda.map((item) => (
                  <li
                    key={item.issueObjectiveId}
                    className="flex items-center justify-between px-2 border rounded"
                  >
                    {editing.type === item.agendaType &&
                    editing.id === item.issueObjectiveId &&
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
                        <span>{item.name} </span>
                        <div className="flex gap-4 items-center">
                          <span className="text-sm">({item.agendaType}) </span>

                          <span className="text-xs font-medium">
                            (
                            {(() => {
                              const total =
                                parseInt(String(item.name), 10) || 0;
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
                                    item.agendaType === "objective"
                                      ? "objective"
                                      : "issue",
                                    item.issueObjectiveId,
                                    item.name,
                                    item.agendaType || "",
                                  )
                                }
                              >
                                <Pencil className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(item)}
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
      </div>
    </div>
  );
}
