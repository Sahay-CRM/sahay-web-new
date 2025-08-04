import React, { useEffect, useRef, useState } from "react";
import {
  addMeetingNotesMutation,
  useGetMeetingNotes,
} from "@/features/api/companyMeeting";
import { Trash2, Plus, EllipsisVertical, X } from "lucide-react";
import { deleteCompanyMeetingMutation } from "@/features/api/companyMeeting";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface MeetingNotesProps {
  joiners: Joiners[];
  employeeId: string;
  meetingId: string;
  detailMeetingId?: string;
  className?: string;
}

const MeetingNotes: React.FC<MeetingNotesProps> = ({
  joiners,
  employeeId,
  meetingId,
  detailMeetingId,
  className,
}) => {
  const [noteInput, setNoteInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const { data: meetingNotes, refetch: refetchMeetingNotes } =
    useGetMeetingNotes(detailMeetingId ?? "");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { mutate: addNote } = addMeetingNotesMutation();
  const deleteNoteMutation = deleteCompanyMeetingMutation();

  const handleDelete = (id: string) => {
    deleteNoteMutation.mutate(id);
  };

  const handleStartAddNote = () => {
    setIsAddingNote(true);
  };

  const handleAddNote = () => {
    console.log(noteInput);

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
        setDropdownOpen(false);
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
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="text-gray-500 items-center text-sm w-fit py-1.5 px-2"
                >
                  <EllipsisVertical className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-14">
                <DropdownMenuItem
                  onClick={() => {
                    setNoteInput("");
                    setTitleInput("");
                    setIsAddingNote(false);
                  }}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 px-2 py-0.5"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
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
                    <span className="text-xs text-gray-400">
                      {note?.createdAt
                        ? new Date(note.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </div>

                  <div className="flex justify-between items-start gap-2 group">
                    <p className="break-words">{note.note}</p>
                    <button
                      onClick={() => handleDelete(note.detailMeetingNoteId)}
                      className="text-red-600 hover:bg-red-100 rounded-full shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      title="Delete Note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default MeetingNotes;
