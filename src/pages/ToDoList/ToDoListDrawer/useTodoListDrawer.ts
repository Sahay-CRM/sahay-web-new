import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  addTODONotesMutation,
  addUpdateToDoListMutation,
  useGetTodobyId,
  useGetTODONotes,
  useDeleteTODONote,
} from "@/features/api/ToDoList";
import { docUploadMutation } from "@/features/api/file";
import { queryClient } from "@/queryClient";
import { buildRepetitionOptions, getRepeatTypeOrCustom } from "../repeatOption";

export function useTodoListDrawer(taskId?: string, taskTitle?: string) {
  interface FileItem {
    fileId: string;
    fileName: string;
    name: string;
  }
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
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [selectedRepeat, setSelectedRepeat] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const MAX_TITLE_LENGTH = 30;
  const isLongTitle = taskTitle && taskTitle.length > MAX_TITLE_LENGTH;
  const displayedTitle =
    !isLongTitle || showFullTitle
      ? taskTitle
      : taskTitle.substring(0, MAX_TITLE_LENGTH) + "...";

  const { mutate: addNoteApi } = addTODONotesMutation();
  const { mutate: deleteNote } = useDeleteTODONote();
  const { mutate: modifyTodo } = addUpdateToDoListMutation();
  const { mutate: docUpload } = docUploadMutation();

  const { data: todoNotes, refetch: refetchMeetingNotes } = useGetTODONotes({
    filter: { toDoId: taskId },
    enable: !!taskId,
  });
  const { data: todoData, refetch: refetchTodo } = useGetTodobyId(taskId || "");

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

  const handleAddNote = () => {
    if (!noteInput.trim() || !taskId) return;
    addNoteApi({ note: noteInput.trim(), toDoId: taskId, noteType: "GENERAL" });
    refetchMeetingNotes();
    setNoteInput("");
    setIsAddingNote(false);
  };

  const handleDelete = (noteId: string) => deleteNote(noteId);

  const handleFileClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) setSelectedFiles([...selectedFiles, ...files]);
  };

  const handleFileOperations = async (
    taskId: string,
    currentFiles: (File | { fileId: string; fileName: string })[],
    removedIds: string[],
  ) => {
    const unUploaded = currentFiles.filter(
      (f) => f instanceof File && !uploadedFiles.includes(f.name),
    ) as File[];

    if (unUploaded.length > 0) {
      const formData = new FormData();
      formData.append("refId", taskId);
      formData.append("isMaster", "0");
      formData.append("fileType", "2060");
      unUploaded.forEach((file) => formData.append("files", file));

      await new Promise<void>((resolve) => {
        docUpload(formData, {
          onSuccess: () => {
            queryClient.resetQueries({ queryKey: ["get-meeting-list"] });
            queryClient.resetQueries({ queryKey: ["get-meeting-dropdown"] });
            queryClient.resetQueries({ queryKey: ["get-meeting-list-by-id"] });
            resolve();
          },
        });
      });
      setUploadedFiles((prev) => [...prev, ...unUploaded.map((f) => f.name)]);
    }

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
  const methods = useForm({ mode: "onChange" });
  const { reset } = methods;

  useEffect(() => {
    if (todoData) {
      const data = todoData;
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
      setDueDate(formattedDueDate);
      setSelectedRepeat(getRepeatTypeOrCustom(data));
      if (data.files && Array.isArray(data.files)) {
        setSelectedFiles(
          (data.files as FileItem[]).map((f) => ({
            fileId: f.fileId,
            fileName: f.fileName ?? f.name ?? "",
          })),
        );
      }
    }
  }, [todoData, reset]);

  const repeatOptions = buildRepetitionOptions(new Date());

  return {
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
    methods,
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
  };
}
