import { useState } from "react";
import { CircleX, CornerDownLeft, Pencil, Trash2 } from "lucide-react";
import { getDatabase, ref, update } from "firebase/database";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  addAgendaObjectiveMutation,
  addMeetingAgendaMutation,
  deleteMeetingIssueMutation,
  deleteMeetingObjectiveMutation,
  useGetMeetingIssue,
  useGetMeetingObjective,
} from "@/features/api/companyMeeting";

interface AgendaProps {
  meetingId: string;
  meetingStart: boolean;
  isTeamLeader: boolean;
}

export default function Agenda({
  meetingId,
  meetingStart,
  isTeamLeader,
}: AgendaProps) {
  const [issueInput, setIssueInput] = useState("");
  const [objectiveInput, setObjectiveInput] = useState("");
  const [editing, setEditing] = useState<{
    type: "issue" | "objective" | null;
    id: string | null;
    value: string;
  }>({ type: null, id: null, value: "" });
  const startEdit = (
    type: "issue" | "objective",
    id: string,
    value: string,
  ) => {
    if (!canEdit) return;
    setEditing({ type, id, value });
  };
  const setEditingValue = (value: string) => {
    setEditing((prev) => ({ ...prev, value }));
  };

  const cancelEdit = () => {
    setEditing({ type: null, id: null, value: "" });
  };

  const { mutate: addIssueAgenda } = addMeetingAgendaMutation();
  const { mutate: addObjectiveAgenda } = addAgendaObjectiveMutation();

  const { mutate: deleteIssue } = deleteMeetingIssueMutation();
  const { mutate: deleteObjective } = deleteMeetingObjectiveMutation();

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

  const agendaFireBase = () => {
    if (meetingStart) {
      const db = getDatabase();
      const meetRef = ref(db, `meetings/${meetingId}/agenda`);
      update(meetRef, {
        updatedAt: Date.now(),
      });
    }
  };

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
            agendaFireBase();
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
            agendaFireBase();
            setObjectiveInput("");
          },
        },
      );
    }
  };

  const updateEdit = () => {
    if (!canEdit) return;
    if (!editing.type || !editing.id || !meetingId) return;
    if (editing.type === "issue") {
      addIssueAgenda(
        {
          detailMeetingAgendaIssueId: editing.id,
          agendaIssue: editing.value,
          meetingId,
        },
        {
          onSuccess: () => {
            agendaFireBase();
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
        },
        {
          onSuccess: () => {
            agendaFireBase();
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
          agendaFireBase();
          setIssueInput("");
        },
      });
    } else if (type === "Objective") {
      deleteObjective(id, {
        onSuccess: () => {
          agendaFireBase();
          setIssueInput("");
        },
      });
    }
  };

  const canEdit = isTeamLeader;

  return (
    <div className="space-y-4">
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
                        <div className="relative w-full">
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
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-sm">
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
                      <>
                        <span>{item.agendaIssue}</span>
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
                        <div className="relative w-full">
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
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-sm">
                            <CornerDownLeft className="text-gray-400 w-4" />
                          </span>
                        </div>

                        <Button variant="ghost" size="sm" onClick={cancelEdit}>
                          <CircleX />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span>{item.agendaObjective}</span>
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
