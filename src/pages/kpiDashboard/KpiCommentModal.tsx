import React, { useState, useEffect } from "react";
import ModalData from "@/components/shared/Modal/ModalData";

interface CommentModalProps {
  isModalOpen: boolean;
  modalClose: () => void;
  onSave: (comment: string) => void;
  modalTitle?: string;
  initialComment?: string;
}

const CommentModal: React.FC<CommentModalProps> = ({
  isModalOpen,
  modalClose,
  onSave,
  initialComment = "",
}) => {
  const [comment, setComment] = useState(initialComment);
  const [isEditable, setIsEditable] = useState(false);

  // Dynamic modal title
  const modalTitleText = initialComment ? "Edit Note" : "Add Note";

  useEffect(() => {
    if (isModalOpen) {
      setComment(initialComment);
      setIsEditable(initialComment === ""); // enable only if new note
    }
  }, [isModalOpen, initialComment]);

  const handleSave = () => {
    if (comment.trim() === "") return;
    onSave(comment);
    setComment("");
    modalClose();
  };

  const handleCancel = () => {
    setComment("");
    modalClose();
  };

  const isCommentChanged = comment.trim() !== "" && comment !== initialComment;

  return (
    <ModalData
      isModalOpen={isModalOpen}
      modalClose={modalClose}
      modalTitle={modalTitleText}
      childclass={"px-3 py-0"}
      buttons={[
        {
          btnText: "Cancel",
          buttonCss: "py-1.5 px-5",
          btnClick: handleCancel,
        },
        // 👇 Show Save button only when something is typed
        ...(isCommentChanged
          ? [
              {
                btnText: "Save",
                buttonCss: "py-1.5 px-5 ",
                btnClick: handleSave,
              },
            ]
          : []),
      ]}
    >
      <div className="flex flex-col gap-2">
        <label className="font-semibold">Note:</label>
        <textarea
          rows={4}
          className={`w-full border rounded p-2 text-sm resize-none transition-all duration-200 ${
            !isEditable ? "text-gray-600 bg-gray-50 cursor-pointer" : "bg-white"
          }`}
          value={comment}
          onClick={() => setIsEditable(true)}
          onChange={(e) => isEditable && setComment(e.target.value)}
          readOnly={!isEditable}
          placeholder="Write your Note here..."
        />
      </div>
    </ModalData>
  );
};

export default CommentModal;
