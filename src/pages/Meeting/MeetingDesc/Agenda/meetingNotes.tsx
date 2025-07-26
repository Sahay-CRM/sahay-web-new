import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import userDummy from "@/assets/userDummy.jpg";
import {
  addMeetingNotesMutation,
  useGetMeetingNotes,
} from "@/features/api/companyMeeting";
import { CornerDownLeft, Trash2 } from "lucide-react";
import { deleteCompanyMeetingMutation } from "@/features/api/companyMeeting";

interface Joiner {
  employeeId: string;
  employeeName: string;
  photo?: string;
}

interface MeetingNotesProps {
  joiners: Joiner[];
  employeeId: string;
  meetingId: string;
  // height: string;
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
  // console.log(joiners, employeeId, meetingId);

  const [noteInput, setNoteInput] = useState("");
  // const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  // const [editInput, setEditInput] = useState<string>("");

  // const { data: meetingNotes } = useGetMeetingNotes(detailMeetingId ?? "");
  const { data: meetingNotes, refetch: refetchMeetingNotes } =
    useGetMeetingNotes(detailMeetingId ?? "");

  const { mutate: addNote } = addMeetingNotesMutation();
  const deleteNoteMutation = deleteCompanyMeetingMutation();

  const handleDelete = (id: string) => {
    deleteNoteMutation.mutate(id);
  };

  // const currentUser = joiners.find((j) => j.employeeId === employeeId);

  const handleAddNote = () => {
    if (!noteInput.trim()) return;
    const payload = {
      meetingId,
      employeeId,
      note: noteInput,
      detailMeetingId,
      createdAt: new Date().toISOString(),
    };

    addNote(payload, {
      onSuccess: () => {
        setNoteInput("");
        refetchMeetingNotes(); // 🔁 Refresh notes immediately
      },
    });
  };

  // const handleUpdate = (note: MeetingNotesRes) => {
  //   setEditingNoteId(note.detailMeetingNoteId);
  //   setEditInput(note.note);
  // };

  // const handleSaveEdit = (note: MeetingNotesRes) => {
  //   addNote(
  //     {
  //       meetingId: meetingId,
  //       employeeId: note.employeeId,
  //       note: editInput,
  //       detailMeetingNoteId: note.detailMeetingNoteId,
  //       detailMeetingId: detailMeetingId,
  //     },
  //     {
  //       onSuccess: () => {
  //         setEditingNoteId(null);
  //         setEditInput("");
  //       },
  //     }
  //   );
  // };

  return (
    <div className=" overflow-hidden">
      <div className="flex items-center gap-2">
        <div className="relative w-full">
          <Input
            className="rounded-full bg-white border-gray-500 text-black h-9 pr-10 w-full shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Create a quick Note"
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && noteInput.trim()) handleAddNote();
            }}
          />

          <button
            onClick={handleAddNote}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#303290] hover:text-black"
          >
            <CornerDownLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      <div
        className={`px-2 pt-2 mb-5 space-y-2 pb-2 min-h-10 overflow-y-auto ${className}`}
      >
        {Array.isArray(meetingNotes?.data) &&
          meetingNotes.data.map((note: MeetingNotesRes, idx: number) => {
            const author = joiners.find(
              (j) => j.employeeId === note.employeeId,
            );
            // const isEditing = editingNoteId === note.detailMeetingNoteId;

            return (
              <div
                key={note.detailMeetingNoteId || idx}
                className="flex items-start bg-white rounded-lg border px-3 py-2 shadow-sm gap-2"
              >
                {/* Avatar */}
                <Avatar className="h-8 w-8 mt-0.5">
                  <AvatarFallback>
                    <img
                      src={author?.photo || userDummy}
                      alt="profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </AvatarFallback>
                </Avatar>

                {/* Note Content */}
                <div className="flex-1 text-sm text-black">
                  {/* Top Row: Name + Time */}
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

                  {/* Note + Delete Button in Row */}
                  <div className="flex justify-between items-start gap-2">
                    <p className="break-words">{note.note}</p>
                    <button
                      onClick={() => handleDelete(note.detailMeetingNoteId)}
                      className=" text-red-600 hover:bg-red-100 rounded-full shrink-0 "
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
