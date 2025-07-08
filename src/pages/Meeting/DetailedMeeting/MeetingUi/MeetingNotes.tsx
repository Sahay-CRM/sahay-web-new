import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import userDummy from "@/assets/userDummy.jpg";

interface Joiner {
  employeeId: string;
  employeeName: string;
  photo?: string;
}

interface Note {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
}

interface MeetingNotesProps {
  joiners: Joiner[];
  userId: string;
}

const MeetingNotes: React.FC<MeetingNotesProps> = ({ joiners, userId }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteInput, setNoteInput] = useState("");

  const currentUser = joiners.find((j) => j.employeeId === userId);

  const handleAddNote = () => {
    if (!noteInput.trim()) return;
    setNotes([
      ...notes,
      {
        id: Date.now().toString(),
        text: noteInput,
        authorId: userId,
        authorName: currentUser?.employeeName || "",
        authorPhoto: currentUser?.photo,
      },
    ]);
    setNoteInput("");
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
      <div className="px-2 pb-3 pt-2 space-y-2 bg-white">
        {notes.map((note) => {
          const author = joiners.find((j) => j.employeeId === note.authorId);
          return (
            <div
              key={note.id}
              className="flex items-center bg-white rounded-lg border px-3 py-2 shadow-sm"
            >
              <div className="flex-1 text-sm text-black break-words">
                {note.text}
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
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MeetingNotes;
