import React, { useState, useEffect } from "react";
import ModalData from "@/components/shared/Modal/ModalData";
import { deleteKpiNoteMutation } from "@/features/api/kpiDashboard";

interface CommentModalProps {
  isModalOpen: boolean;
  modalClose: () => void;
  onSave: (comment: string) => void;
  initialComment?: string;
  noteId?: string;
}

const CommentModal: React.FC<CommentModalProps> = ({
  isModalOpen,
  modalClose,
  onSave,
  initialComment = "",
  noteId,
}) => {
  const [comment, setComment] = useState(initialComment);
  const [isEditable, setIsEditable] = useState(false);
  const deleteNoteMutation = deleteKpiNoteMutation();

  useEffect(() => {
    if (isModalOpen) {
      setComment(initialComment);
      setIsEditable(initialComment === "");
    }
  }, [isModalOpen, initialComment]);

  const handleSave = () => {
    if (comment.trim() === "") return;
    onSave(comment);
    modalClose();
  };

  const handleDelete = () => {
    deleteNoteMutation.mutate(noteId || "");
    modalClose();
  };

  const isCommentChanged = comment.trim() !== "" && comment !== initialComment;

  return (
    <ModalData
      isModalOpen={isModalOpen}
      modalClose={modalClose}
      modalTitle={initialComment ? "Edit Note" : "Add Note"}
      childclass="px-3 py-0"
      buttons={[
        ...(initialComment
          ? [
              {
                btnText: "Delete",
                buttonCss: "py-1.5 px-5 bg-red-600 text-white hover:bg-red-700",
                btnClick: handleDelete,
              },
            ]
          : []),
        ...(isCommentChanged
          ? [
              {
                btnText: "Save",
                buttonCss: "py-1.5 px-5",
                btnClick: handleSave,
              },
            ]
          : []),
        { btnText: "Cancel", buttonCss: "py-1.5 px-5", btnClick: modalClose },
      ]}
    >
      <div className="flex flex-col gap-2">
        <label className="font-semibold">Note:</label>
        <textarea
          rows={4}
          className={`w-full border rounded p-2 text-sm resize-none transition-all duration-200 ${
            isEditable ? "bg-white" : "text-gray-600 bg-gray-50 cursor-pointer"
          }`}
          value={comment}
          onClick={() => setIsEditable(true)}
          onChange={(e) => setComment(e.target.value)}
          readOnly={!isEditable}
          placeholder="Write your note here..."
        />
      </div>
    </ModalData>
  );
};

export default CommentModal;
