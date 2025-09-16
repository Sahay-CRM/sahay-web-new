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
import CustomModalFile from "../CustomModal";
import { ImageBaseURL } from "@/features/utils/urls.utils";
import { useTodoListDrawer } from "./useTodoListDrawer";

export default function TodoListDrawer({
  open,
  onOpenChange,
  taskTitle,
  taskId,
}: TaskSheetProps) {
  const {
    todoData,
    dueDate,
    calendarOpen,
    isAddingNote,
    noteInput,
    editingNoteId,
    editValue,
    selectedRepeat,
    openCustomModal,
    removedFileIds,
    uploadedFiles,
    selectedFiles,
    showFullTitle,
    displayedTitle,
    isLongTitle,
    repeatOptions,
    todoNotes,
    fileInputRef,
    setCalendarOpen,
    setIsAddingNote,
    setNoteInput,
    setEditingNoteId,
    setEditValue,
    setSelectedRepeat,
    setOpenCustomModal,
    setRemovedFileIds,
    setShowFullTitle,
    setDueDate,
    handleEdit,
    handleSaveEdit,
    handleAddNote,
    handleDelete,
    handleFileClick,
    handleFileChange,
    handleFileOperations,
    handleRemoveFile,
    handleUpdateRepeat,
    refetchTodo,
  } = useTodoListDrawer(taskId ?? undefined, taskTitle ?? undefined);

  const selectedRepeatLabel =
    repeatOptions.find((item) => item.value === selectedRepeat)?.label ||
    (selectedRepeat === "CUSTOMTYPE" ? "Custom" : "Repeat");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-96  overflow-auto border-l bg-card flex flex-col"
      >
        <SheetHeader>
          <div className="flex flex-col mr-3">
            <SheetTitle className="font-semibold mr-1 text-lg break-words">
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
        </SheetHeader>

        <div className="p-2 flex flex-col gap-2 flex-1 overflow-hidden">
          {/* Due Date & Repeat */}
          <div className="divide-y divide-border rounded-md border flex-shrink-0">
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
                  disabled={{ before: new Date() }}
                  selected={dueDate ? new Date(dueDate) : undefined}
                  onSelect={(date) => {
                    if (!date) return;
                    const formattedDueDate = `${date.getFullYear()}-${(
                      date.getMonth() + 1
                    )
                      .toString()
                      .padStart(2, "0")}-${date
                      .getDate()
                      .toString()
                      .padStart(2, "0")}`;
                    setDueDate(formattedDueDate);
                    setCalendarOpen(false);
                    handleUpdateRepeat(selectedRepeat, formattedDueDate);
                  }}
                />
              </PopoverContent>
            </Popover>

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
                        if (item.value === "CUSTOMTYPE")
                          setOpenCustomModal(true);
                        else {
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

          {/* File Section */}
          <div className="rounded-md border flex flex-col relative flex-shrink-0">
            <div
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent border-b"
              onClick={handleFileClick}
            >
              <Paperclip className="w-4 h-4" />
              <span>Add file</span>
            </div>

            <div
              className={`flex flex-wrap gap-x-2 gap-y-1 max-h-32 overflow-y-auto ${
                selectedFiles.length > 0 ? "px-2 py-2" : ""
              }`}
            >
              {selectedFiles.map((file, idx) => {
                const isUploaded =
                  file instanceof File
                    ? uploadedFiles.includes(file.name)
                    : true;
                const fileName = "fileId" in file ? file.fileName : file.name;
                const localURL =
                  file instanceof File ? URL.createObjectURL(file) : null;

                return (
                  <div
                    key={idx}
                    className={`relative h-7 group flex items-center rounded-full px-2 py-1 text-sm text-blue-600`}
                  >
                    <a
                      href={
                        isUploaded
                          ? `${ImageBaseURL}/share/toDoFiles/${fileName}`
                          : localURL || ""
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      download={!isUploaded ? fileName : undefined}
                      title={fileName}
                      className="underline cursor-pointer overflow-hidden whitespace-nowrap text-ellipsis max-w-[150px]"
                    >
                      {fileName}
                    </a>
                    {idx < selectedFiles.length - 1 && (
                      <span className="overflow-hidden whitespace-nowrap text-ellipsis max-w-[150px]">
                        ,
                      </span>
                    )}
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
            <button
              className="absolute top-2 right-2 bg-primary text-white text-xs px-3 py-1 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              hidden={
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

          {/* Notes Section */}
          <div className="flex-1 flex flex-col overflow-hidden">
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
                  className="w-full rounded-md p-2 pr-16 text-black shadow-none bg-transparent resize-none border focus:ring-0"
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

            <div className="px-2 space-y-2 flex-1 overflow-auto pb-2 mt-4">
              {todoNotes?.map((note) => (
                <div
                  key={note.toDoNoteId}
                  className="flex items-start justify-between bg-white rounded-lg border px-3 py-2 shadow-sm"
                >
                  <div className="flex-1 text-sm text-black pr-2">
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
                          className="w-10 text-primary text-sm px-2"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="w-12 text-gray-500 text-sm px-2"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start w-full">
                        <div className="flex flex-col flex-1 pr-2">
                          <span className="text-xs text-gray-400">
                            {new Date(note.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <p className="break-words break-all overflow-wrap-anywhere mt-1">
                            {note.note}
                          </p>
                        </div>
                        <DropdownMenu>
                          <div className="flex justify-center">
                            <DropdownMenuTrigger asChild>
                              <button className="flex mt-3 items-center justify-center text-gray-500 text-sm">
                                <EllipsisVertical className="h-5 w-5" />
                              </button>
                            </DropdownMenuTrigger>
                          </div>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => handleEdit(note)}>
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(note.toDoNoteId)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
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
