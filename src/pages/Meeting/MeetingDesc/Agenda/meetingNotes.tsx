import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import userDummy from "@/assets/userDummy.jpg";
import {
  addMeetingNotesMutation,
  useGetMeetingNotes,
} from "@/features/api/companyMeeting";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

interface Joiner {
  employeeId: string;
  employeeName: string;
  photo?: string;
}

interface MeetingNotesProps {
  joiners: Joiner[];
  employeeId: string;
  meetingId: string;
  detailMeetingId?: string;
}

const MeetingNotes: React.FC<MeetingNotesProps> = ({
  joiners,
  employeeId,
  meetingId,
  detailMeetingId,
}) => {
  // console.log(joiners, employeeId, meetingId);

  const [noteInput, setNoteInput] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState<string>("");

  const { data: meetingNotes } = useGetMeetingNotes(detailMeetingId ?? "");
  const { mutate: addNote } = addMeetingNotesMutation();

  const currentUser = joiners.find((j) => j.employeeId === employeeId);

  const handleAddNote = () => {
    const payload = {
      meetingId: meetingId,
      employeeId: employeeId,
      note: noteInput,
      detailMeetingId: detailMeetingId,
    };
    addNote(payload, {
      onSuccess: () => {
        setNoteInput("");
      },
    });
  };

  const handleUpdate = (note: MeetingNotesRes) => {
    setEditingNoteId(note.detailMeetingNoteId);
    setEditInput(note.note);
  };

  const handleSaveEdit = (note: MeetingNotesRes) => {
    addNote(
      {
        meetingId: meetingId,
        employeeId: note.employeeId,
        note: editInput,
        detailMeetingNoteId: note.detailMeetingNoteId,
        detailMeetingId: detailMeetingId,
      },
      {
        onSuccess: () => {
          setEditingNoteId(null);
          setEditInput("");
        },
      },
    );
  };

  const handleDelete = (note: MeetingNotesRes) => {
    // TODO: Implement delete logic (e.g., call delete mutation)
    console.log("Delete note", note);
  };

  return (
    <div className="rounded-xl bg-white border w-full max-w-xs shadow p-0 overflow-hidden">
      <div className="bg-[#303290] px-4 pt-3 pb-2 rounded-t-xl flex items-center justify-between">
        <span className="text-white font-semibold text-lg">Notes</span>
        <Avatar className="h-8 w-8 ml-2">
          <AvatarFallback>
            <img
              src={currentUser?.photo || userDummy}
              alt="profile"
              className="w-full h-full rounded-full object-cover"
            />
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="px-4 pt-2 pb-3 bg-[#303290] flex items-center gap-2">
        <Input
          className="rounded-full bg-white text-black placeholder:text-gray-400 h-9 flex-1"
          placeholder="Create a quick Note"
          value={noteInput}
          onChange={(e) => setNoteInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddNote();
          }}
        />
        <Button
          className="rounded-full bg-white text-[#303290] hover:bg-gray-100 h-9 px-3"
          onClick={handleAddNote}
        >
          <span className="text-xl">↵</span>
        </Button>
      </div>
      <div className="px-2 pt-2 space-y-2 bg-white max-h-[500px] pb-2 min-h-10 overflow-y-auto">
        {Array.isArray(meetingNotes?.data) &&
          meetingNotes.data.map((note: MeetingNotesRes, idx: number) => {
            const author = joiners.find(
              (j) => j.employeeId === note.employeeId,
            );
            const isEditing = editingNoteId === note.detailMeetingNoteId;
            return (
              <div
                key={note.detailMeetingNoteId || idx}
                className="flex items-center bg-white rounded-lg border px-3 py-2 shadow-sm"
              >
                <div className="flex-1 text-sm text-black break-words">
                  {isEditing ? (
                    <input
                      className="border rounded px-2 py-1 w-full"
                      value={editInput}
                      onChange={(e) => setEditInput(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    note.note
                  )}
                </div>
                <Avatar className="h-8 w-8 ml-2">
                  <AvatarFallback>
                    <img
                      src={author?.photo || userDummy}
                      alt="profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </AvatarFallback>
                </Avatar>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="ml-2 p-1 rounded-full hover:bg-gray-200">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleUpdate(note)}>
                      Update
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(note)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {isEditing && (
                  <button
                    className="ml-2 px-2 py-1 bg-blue-500 text-white rounded"
                    onClick={() => handleSaveEdit(note)}
                  >
                    Save
                  </button>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default MeetingNotes;
