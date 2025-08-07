import React, { useEffect, useRef, useState } from "react";
import {
  addMeetingNotesMutation,
  useGetMeetingNotes,
} from "@/features/api/companyMeeting";
import {
  Trash2,
  Plus,
  EllipsisVertical,
  X,
  Edit,
  Copy,
  Share2,
} from "lucide-react";
import { deleteCompanyMeetingMutation } from "@/features/api/companyMeeting";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import TaskDrawer from "../Tasks/taskDrawer";
import ProjectDrawer from "../Projects/projectDrawer";

interface MeetingNotesProps {
  joiners: Joiners[];
  employeeId: string;
  meetingId: string;
  detailMeetingId?: string;
  className?: string;
  meetingName?: string;
  meetingStatus?: string;
}

interface TaskData {
  [key: string]: string | null;
}

const MeetingNotes: React.FC<MeetingNotesProps> = ({
  joiners,
  employeeId,
  meetingId,
  detailMeetingId,
  className,
  meetingName,
  meetingStatus,
}) => {
  const [noteInput, setNoteInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerProj, setDrawerProj] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskGetPaging | TaskData>();
  const [selectedProject, setSelectedProject] = useState<
    CompanyProjectDataProps | TaskData
  >();
  // const [isAdded, setIsAdded] = useState<string>();

  const { data: meetingNotes, refetch: refetchMeetingNotes } =
    useGetMeetingNotes({
      filter: {
        meetingId: detailMeetingId,
      },
      enable: !!detailMeetingId,
    });
  const { mutate: addNote } = addMeetingNotesMutation();
  const deleteNoteMutation = deleteCompanyMeetingMutation();

  const handleDelete = (id: string) => {
    deleteNoteMutation.mutate(id);
  };

  const handleAddTask = (data: MeetingNotesRes) => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 15);

    const payload = {
      taskName: data.note,
      taskDescription: `${data.note} created in ${meetingName}`,
      taskDeadline: deadline.toISOString(),
      detailMeetingNoteId: data.detailMeetingNoteId,
    };
    setSelectedTask(payload);
    setDrawerOpen(true);
  };

  const handleAddProject = (data: MeetingNotesRes) => {
    const payload = {
      projectName: data.note,
      projectDescription: `${data.note} created in ${meetingName}`,
      detailMeetingNoteId: data.detailMeetingNoteId,
    };
    setSelectedProject(payload);
    setDrawerProj(true);
  };

  const handleUpdateNotes = (data: MeetingNotesRes, type: string) => {
    const payload = {
      meetingId,
      employeeId,
      note: data.note,
      detailMeetingId,
      noteType: type.toLocaleUpperCase(),
      detailMeetingNoteId: data.detailMeetingNoteId,
    };
    addNote(payload, {
      onSuccess: () => {
        setTitleInput("");
        setNoteInput("");
        setIsAddingNote(false);
        refetchMeetingNotes();
      },
    });
  };

  const handleStartAddNote = () => {
    setIsAddingNote(true);
  };

  const handleAddNote = () => {
    const payload = {
      meetingId,
      employeeId,
      title: titleInput,
      note: noteInput,
      detailMeetingId,
      createdAt: new Date().toISOString(),
    };

    addNote(payload, {
      onSuccess: () => {
        setTitleInput("");
        setNoteInput("");
        setIsAddingNote(false);
        refetchMeetingNotes();
      },
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={cn(
        "overflow-y-auto max-h-[calc(100vh-250px)] px-2",
        className,
      )}
    >
      {meetingStatus !== "ENDED" && (
        <>
          {!isAddingNote ? (
            <div className="flex items-center gap-2">
              <div className="relative w-full flex gap-2 justify-between">
                <button
                  onClick={handleStartAddNote}
                  className="text-gray-500 hover:bg-gray-100 rounded-full flex gap-3 items-center mr-2 text-sm w-full py-2 px-2 "
                >
                  <Plus className="h-5 w-5" /> Take a Note...
                </button>
                <button
                  onClick={handleStartAddNote}
                  className="text-gray-500 hover:bg-gray-100 rounded-full flex gap-3 items-center mr-2 text-sm w-fit py-1.5 px-2 "
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border px-3 py-2 shadow-sm relative">
              <textarea
                className="w-[80%] border-none text-black px-0 pr-1 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                placeholder="Take a note..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                autoFocus
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddNote();
                  }
                }}
              />

              <div className="flex justify-end items-center mt-2">
                <button
                  onClick={handleAddNote}
                  className="text-sm text-gray-600 cursor-pointer flex flex-col z-50"
                >
                  Done
                </button>
              </div>
              <div className="absolute top-2 right-2 flex items-center">
                <DropdownMenu
                  open={dropdownOpen === "new"}
                  onOpenChange={(open) => setDropdownOpen(open ? "new" : null)}
                >
                  <DropdownMenuTrigger asChild>
                    <button
                      onClick={() => setDropdownOpen("new")}
                      className="text-gray-500 items-center text-sm w-fit py-1.5 px-2"
                    >
                      <EllipsisVertical className="h-5 w-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      onClick={() => {
                        setNoteInput("");
                        setTitleInput("");
                        setIsAddingNote(false);
                      }}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50 px-2 py-1.5"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                    <DropdownMenuItem className="px-2 py-1.5">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="px-2 py-1.5">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </DropdownMenuItem>
                    <DropdownMenuItem className="px-2 py-1.5">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <X
                  className="w-5 h-5 text-gray-500 cursor-pointer"
                  onClick={() => setIsAddingNote(false)}
                />
              </div>
            </div>
          )}
        </>
      )}

      <div className={`px-2 space-y-2 pb-2 overflow-y-auto ${className}`}>
        {Array.isArray(meetingNotes?.data) &&
          meetingNotes.data.map((note: MeetingNotesRes, idx: number) => {
            const author = joiners.find(
              (j) => j.employeeId === note.employeeId,
            );

            return (
              <div
                key={note.detailMeetingNoteId || idx}
                className="flex items-start bg-white rounded-lg border px-3 py-2 shadow-sm gap-2"
              >
                <div className="flex-1 text-sm text-black">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-xs text-gray-600">
                      {author?.employeeName || "Unknown"}
                    </span>
                    <div>
                      {note.noteType && (
                        <span className="text-xs text-gray-600 mr-2 bg-gray-200/80 p-0.5 rounded-full px-2">
                          {note.noteType}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {note?.createdAt
                          ? new Date(note.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-start gap-2 group">
                    <p className="break-words">{note.note}</p>
                    {meetingStatus !== "ENDED" && (
                      <div>
                        <DropdownMenu
                          open={dropdownOpen === note.detailMeetingNoteId}
                          onOpenChange={(open) =>
                            setDropdownOpen(
                              open ? note.detailMeetingNoteId : null,
                            )
                          }
                        >
                          <DropdownMenuTrigger asChild>
                            <button
                              onClick={() =>
                                setDropdownOpen(note.detailMeetingNoteId)
                              }
                              className="text-gray-500 items-center text-sm w-fit py-1.5 px-2"
                            >
                              <EllipsisVertical className="h-5 w-5" />
                            </button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end" className="w-full">
                            {!note.noteType && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleAddTask(note)}
                                  className="px-2 py-1.5"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Add to Task
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleAddProject(note)}
                                  className="px-2 py-1.5"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Add to Project
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateNotes(note, "updates")
                                  }
                                  className="px-2 py-1.5"
                                >
                                  <Share2 className="h-4 w-4 mr-2" />
                                  Mark as Updates
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateNotes(note, "appreciation")
                                  }
                                  className="px-2 py-1.5"
                                >
                                  <Share2 className="h-4 w-4 mr-2" />
                                  Mark as Appreciation
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem
                              onClick={() =>
                                handleDelete(note.detailMeetingNoteId)
                              }
                              className="text-red-600 focus:text-red-600 focus:bg-red-50 px-2 py-1.5"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
      {drawerOpen && (
        <TaskDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          taskData={selectedTask as TaskGetPaging}
          // detailMeetingAgendaIssueId=""
          detailMeetingId={detailMeetingId}
        />
      )}
      {drawerProj && (
        <ProjectDrawer
          open={drawerProj}
          onClose={() => setDrawerProj(false)}
          projectData={selectedProject as CompanyProjectDataProps}
          // detailMeetingAgendaIssueId={meetingAgendaIssueId}
          detailMeetingId={detailMeetingId}
        />
      )}
    </div>
  );
};

export default MeetingNotes;
