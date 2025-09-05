import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Calendar as CalendarIcon,
  Repeat,
  Paperclip,
  Plus,
  EllipsisVertical,
  Trash2,
  X,
  Edit,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buildRepetitionOptions, getRepeatTypeOrCustom } from "./repeatOption";
import CustomModalFile from "./CustomModal";
import {
  addTODONotesMutation,
  addUpdateToDoListMutation,
  useGetTodobyId,
  useGetTODONotes,
  useDeleteTODONote,
} from "@/features/api/ToDoList";

import { docUploadMutation } from "@/features/api/file";
import { queryClient } from "@/queryClient";
import { ImageBaseURL } from "@/features/utils/urls.utils";

export default function TodoListDrawer({
  open,
  onOpenChange,
  taskTitle,
  taskId,
}: TaskSheetProps) {
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<
    (File | { fileId: string; fileName: string })[]
  >([]);
  const [openCustomModal, setOpenCustomModal] = useState(false);
  const [showFullTitle, setShowFullTitle] = useState(false);
  const [removedFileIds, setRemovedFileIds] = useState<string[]>([]);
  const MAX_TITLE_LENGTH = 30; // truncate if longer than this
  const isLongTitle = taskTitle && taskTitle.length > MAX_TITLE_LENGTH;
  const displayedTitle =
    !isLongTitle || showFullTitle
      ? taskTitle
      : taskTitle.substring(0, MAX_TITLE_LENGTH) + "...";

  const [selectedRepeat, setSelectedRepeat] = useState<string>("");
  const { mutate: addNoteApi } = addTODONotesMutation();
  const { data: todoNotes, refetch: refetchMeetingNotes } = useGetTODONotes({
    filter: {
      toDoId: taskId,
    },
    enable: !!taskId,
  });
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleEdit = (note: TODONotesRes) => {
    setEditingNoteId(note.toDoNoteId);
    setEditValue(note.note);
  };

  const handleSaveEdit = (noteId: string) => {
    if (!editValue.trim()) return;

    addNoteApi({
      noteId,
      toDoId: taskId,
      note: editValue.trim(),
      noteType: "GENERAL",
    });

    setEditingNoteId(null);
    setEditValue("");
  };

  // ✅ Add note locally
  const handleAddNote = () => {
    if (!noteInput.trim() || !taskId) return;

    addNoteApi({
      note: noteInput.trim(),
      toDoId: taskId,
      noteType: "GENERAL",
    });
    refetchMeetingNotes();
    setNoteInput("");
    setIsAddingNote(false);
  };
  const { mutate: deleteNote } = useDeleteTODONote();
  // ✅ Delete note
  const handleDelete = (noteId: string) => {
    deleteNote(noteId);
  };
  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      const updatedFiles = [...selectedFiles, ...files];
      setSelectedFiles(updatedFiles);
    }
  };
  const { mutate: docUpload } = docUploadMutation();
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]); // store already uploaded file names

  const handleFileOperations = async (
    taskId: string,
    currentFiles: (File | { fileId: string; fileName: string })[],
    removedIds: string[],
  ) => {
    const uploadMeetingFile = (file: File) => {
      const formData = new FormData();
      formData.append("refId", taskId);
      formData.append("isMaster", "0");
      formData.append("fileType", "2060");
      formData.append("files", file);

      return new Promise<void>((resolve) => {
        docUpload(formData, {
          onSuccess: () => {
            queryClient.resetQueries({ queryKey: ["get-meeting-list"] });
            queryClient.resetQueries({ queryKey: ["get-meeting-dropdown"] });
            queryClient.resetQueries({ queryKey: ["get-meeting-list-by-id"] });
            resolve();
          },
        });
      });
    };

    const unUploaded = currentFiles.filter(
      (f) => f instanceof File && !uploadedFiles.includes(f.name),
    ) as File[];

    for (const file of unUploaded) {
      await uploadMeetingFile(file);
    }

    setUploadedFiles((prev) => [...prev, ...unUploaded.map((f) => f.name)]);

    if (removedIds.length > 0) {
      const formData = new FormData();
      formData.append("refId", taskId);
      formData.append("removedFiles", removedIds.join(","));

      await docUpload(formData, {
        onSuccess: () => {
          queryClient.resetQueries({ queryKey: ["get-meeting-list"] });
          queryClient.resetQueries({ queryKey: ["get-meeting-dropdown"] });
          queryClient.resetQueries({ queryKey: ["get-meeting-list-by-id"] });
        },
      });
    }
  };

  const handleRemoveFile = async (index: number) => {
    const fileToRemove = selectedFiles[index];

    if ("fileId" in fileToRemove) {
      await handleFileOperations(taskId || "", selectedFiles, [
        fileToRemove.fileId,
      ]);
    }

    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const { mutate: modifyTodo } = addUpdateToDoListMutation();

  type RepeatPayload = {
    toDoId: string;
    repeatType?: string;
    selectDate?: string;
    dueDate?: string;
  };

  const handleUpdateRepeat = (
    repeatValue: string | repeatTyped,
    dueDate?: string,
  ) => {
    if (!taskId) return;

    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const day = today.getDate().toString().padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    let payload: RepeatPayload;

    if (typeof repeatValue === "string") {
      payload = {
        toDoId: taskId,
        repeatType: repeatValue,
        selectDate: formattedDate,
        dueDate,
      };
    } else {
      payload = {
        toDoId: taskId,
        dueDate,
        ...repeatValue,
      };
    }

    const cleanedPayload: RepeatPayload = Object.fromEntries(
      Object.entries(payload).filter(
        ([, value]) => value !== null && value !== "",
      ),
    ) as RepeatPayload;

    modifyTodo(cleanedPayload);
  };
  interface FileItem {
    fileId: string;
    fileName: string; // ✅ add this
  }

  const { data: todoData, refetch: refetchTodo } = useGetTodobyId(taskId || "");
  useEffect(() => {
    if (open && taskId) {
      refetchTodo();
    }
  }, [open, taskId, refetchTodo]);

  const methods = useForm({ mode: "onChange" });
  const { reset } = methods;

  useEffect(() => {
    if (todoData) {
      const data = todoData;

      // Format dueDate from ISO to YYYY-MM-DD
      const formattedDueDate = data.dueDate
        ? new Date(data.dueDate).toISOString().split("T")[0]
        : "";

      reset({
        toDoId: data.toDoId || "",
        toDoName: data.toDoName || "",
        employeeId: data.employeeId || "",
        companyId: data.companyId || "",
        isCompleted: data.isCompleted || false,
        repeatType: data.repeatType || "",
        customObj: data.customObj || {},
      });

      setDueDate(formattedDueDate); // <-- set it here
      setSelectedRepeat(getRepeatTypeOrCustom(data));

      if (data.files && Array.isArray(data.files)) {
        const mapped: FileItem[] = (
          data.files as { fileId: string; fileName?: string; name?: string }[]
        ).map((f) => ({
          fileId: f.fileId,
          fileName: f.fileName ?? f.name ?? "",
        }));

        setSelectedFiles(mapped);
      }
    }
  }, [todoData, reset]);

  const repeatOptions = buildRepetitionOptions(new Date());
  const selectedRepeatLabel =
    repeatOptions.find((item) => item.value === selectedRepeat)?.label ||
    (selectedRepeat === "CUSTOMTYPE" ? "Custom" : "Repeat");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        aria-describedby={undefined}
        side="right"
        className="w-full sm:w-96 border-l bg-card overflow-auto"
      >
        <SheetHeader>
          <div className="flex flex-col mr-3">
            <SheetTitle className="font-semibold text-lg break-words">
              {displayedTitle || "Task Details"}
            </SheetTitle>
            {isLongTitle && (
              <button
                onClick={() => setShowFullTitle(!showFullTitle)}
                className="text-sm text-blue-500 hover:underline self-end "
              >
                {showFullTitle ? "See Less" : "See More"}
              </button>
            )}
          </div>

          {/* <SheetDescription>
            Here you can manage all details for this task.
          </SheetDescription> */}
        </SheetHeader>

        <div className="p-2 space-y-2">
          {/* -------- Due Date -------- */}
          <div className="divide-y divide-border rounded-md border">
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <div className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{dueDate ? `Due: ${dueDate}` : "Add due date"}</span>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2">
                <Calendar
                  mode="single"
                  selected={dueDate ? new Date(dueDate) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const year = date.getFullYear();
                      const month = (date.getMonth() + 1)
                        .toString()
                        .padStart(2, "0");
                      const day = date.getDate().toString().padStart(2, "0");

                      const formattedDueDate = `${year}-${month}-${day}`;
                      setDueDate(formattedDueDate);
                      setCalendarOpen(false);
                      handleUpdateRepeat(selectedRepeat, formattedDueDate);
                    }
                  }}
                />
              </PopoverContent>
            </Popover>

            {/* -------- Repeat -------- */}
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent">
                    <Repeat className="w-4 h-4" />
                    <span>{selectedRepeatLabel}</span>
                  </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start" className="w-fit">
                  {repeatOptions.map((item) => {
                    const isSelected = item.value === selectedRepeat;
                    return (
                      <DropdownMenuItem
                        key={item.value}
                        onClick={() => {
                          if (item.value === "CUSTOMTYPE") {
                            setOpenCustomModal(true);
                          } else {
                            setSelectedRepeat(item.value);
                            handleUpdateRepeat(item.value);
                          }
                        }}
                        className={`flex items-center justify-between ${
                          isSelected ? "bg-accent text-accent-foreground" : ""
                        }`}
                      >
                        <span>{item.label}</span>
                        {isSelected && <span className="ml-2">✔</span>}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Custom Modal */}
              <CustomModalFile
                open={openCustomModal}
                defaultValues={todoData?.customObj ?? undefined}
                onOpenChange={setOpenCustomModal}
                onSave={(data) => {
                  setSelectedRepeat("CUSTOMTYPE");
                  handleUpdateRepeat(data);
                }}
              />
            </div>
          </div>

          <div className="rounded-md border flex flex-col h-52 relative">
            <div
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent border-b"
              onClick={handleFileClick}
            >
              <Paperclip className="w-4 h-4" />
              <span>Add file</span>
            </div>

            <div className="overflow-y-auto px-2 py-2 flex flex-wrap gap-x-2 gap-y-1">
              {selectedFiles.map((file, idx) => {
                const isUploaded =
                  file instanceof File
                    ? uploadedFiles.includes(file.name)
                    : true;

                const fileName = "fileId" in file ? file.fileName : file.name;

                return (
                  <div
                    key={idx}
                    // className="relative flex items-center gap-1 group"
                    className={`relative h-7 group flex items-center rounded-full px-2 py-1 text-sm 
                      ${isUploaded ? "bg-gray-100 text-blue-600" : "bg-gray-100 text-gray-700"}`}
                  >
                    {isUploaded ? (
                      <a
                        href={`${ImageBaseURL}/share/toDoFiles/${fileName}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className=" underline cursor-pointer overflow-hidden whitespace-nowrap text-ellipsis max-w-[150px]"
                      >
                        {fileName}
                      </a>
                    ) : (
                      <span className="overflow-hidden whitespace-nowrap text-ellipsis max-w-[150px]">
                        {fileName}
                      </span>
                    )}
                    {idx < selectedFiles.length - 1 && (
                      <span className="overflow-hidden whitespace-nowrap text-ellipsis max-w-[150px]">
                        ,
                      </span>
                    )}

                    {/* Cross button */}
                    <button
                      onClick={() => handleRemoveFile(idx)}
                      className="absolute -top-1 -right-1 rounded-full bg-gray-300 text-gray-700 hover:bg-red-500 hover:text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              multiple
            />

            {/* Upload Button */}
            <button
              className="absolute top-2 right-2 bg-primary text-white text-xs px-3 py-1 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                !selectedFiles.some(
                  (f) => f instanceof File && !uploadedFiles.includes(f.name),
                )
              }
              onClick={async () => {
                if (!taskId) return;
                await handleFileOperations(
                  taskId,
                  selectedFiles,
                  removedFileIds,
                );
                setRemovedFileIds([]);
                refetchTodo();
              }}
            >
              Upload
            </button>
          </div>

          {/* -------- Notes -------- */}
          <div>
            {!isAddingNote ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddingNote(true)}
                  className="text-gray-500 hover:bg-gray-100 rounded-md border flex gap-3 items-center mr-2 text-sm w-full py-2 px-2"
                >
                  <Plus className="h-5 w-5" /> Take a Note...
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-md relative">
                <textarea
                  className="w-full rounded-md p-2 pr-16 text-black shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent resize-none"
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

                {/* Show Done & X only if noteInput has text */}
                <div className="absolute top-2 right-2 flex gap-2">
                  {noteInput.trim().length > 0 && (
                    <button
                      onClick={handleAddNote}
                      className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer"
                    >
                      Done
                    </button>
                  )}
                  <X
                    className="w-5 h-5 text-gray-500 hover:text-gray-700 cursor-pointer"
                    onClick={() => {
                      setIsAddingNote(false);
                      setNoteInput("");
                    }}
                  />
                </div>
              </div>
            )}

            {/* -------- Notes List -------- */}
            <div className="px-2 space-y-2 max-h-[calc(100vh-500px)] overflow-auto pb-2 mt-4">
              {todoNotes?.map((note) => (
                <div
                  key={note.toDoNoteId}
                  className="flex items-start bg-white rounded-lg border px-3 py-2 shadow-sm gap-2"
                >
                  <div className="flex-1 text-sm text-black">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-400">
                        {new Date(note.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="flex justify-between items-start gap-2 group">
                      {editingNoteId === note.toDoNoteId ? (
                        <div className="flex w-full gap-2">
                          <input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="border rounded-md px-2 py-1 text-sm flex-1"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(note.toDoNoteId)}
                            className="text-blue-600 text-sm px-2"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingNoteId(null)}
                            className="text-gray-500 text-sm px-2"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <p className="break-words">{note.note}</p>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="text-gray-500 items-center text-sm w-fit py-1.5 px-2">
                                <EllipsisVertical className="h-5 w-5" />
                              </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-full">
                              <DropdownMenuItem
                                onClick={() => handleEdit(note)}
                                className="px-2 py-1.5 "
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(note.toDoNoteId)}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50 px-2 py-1.5"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
