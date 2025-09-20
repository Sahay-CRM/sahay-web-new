import {
  useGetAllTaskStatus,
  useGetCompanyTaskById,
} from "@/features/api/companyTask";
import useAddUpdateCompanyTask from "@/features/api/companyTask/useAddUpdateCompanyTask";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  addUpdateTaskCommentMutation,
  deleteCommentMutation,
  useGetTaskComments,
} from "@/features/api/companyTask";
export default function useViewCompanyTask() {
  const permission = useSelector(getUserPermission).TASK;
  const methods = useForm();
  const navigate = useNavigate();
  const { id: taskId } = useParams();
  const { data: taskApiData } = useGetCompanyTaskById(taskId || "");
  const { data: taskStatus } = useGetAllTaskStatus({
    filter: {},
  });
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>("");
  const [newComment, setNewComment] = useState("");
  const { mutate: updateCompanyTask } = useAddUpdateCompanyTask();
  const { mutate: addcomment, isPending } = addUpdateTaskCommentMutation();
  const { mutate: deleteComment } = deleteCommentMutation();

  const [showCommentInput, setShowCommentInput] = useState(false);
  const commentsData = useGetTaskComments(taskId || "");
  const statusOptions = (taskStatus?.data ?? []).map((item) => ({
    label: item.taskStatus,
    value: item.taskStatusId,
    color: item.color || "#2e3195",
  }));

  const handleSaveComment = (taskCommentId?: string) => {
    if (!editingText.trim()) return;

    addcomment({
      taskId: taskId!,
      comment: editingText,
      taskCommentId,
    });

    setEditingCommentId(null);
    setEditingText("");
  };
  const handleEditComment = (taskCommentId: string, currentText: string) => {
    setEditingCommentId(taskCommentId);
    setEditingText(currentText);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingText("");
  };

  const handleDeleteComment = (id: string) => {
    deleteComment(id);
  };

  const onSubmitComment = () => {
    if (!newComment.trim()) return;

    addcomment({
      taskId: taskId!,
      comment: newComment,
    });

    setShowCommentInput(false);
    setNewComment("");
  };
  const handleStatusChange = (data: string) => {
    const payload = {
      taskStatusId: data,
      taskId: taskId,
    };

    updateCompanyTask(payload);
  };

  useEffect(() => {
    if (taskApiData?.data?.taskStatusId) {
      methods.reset({
        taskStatus: taskApiData.data?.taskStatusId,
      });
    }
  }, [taskApiData, methods]);

  return {
    taskApiData,
    navigate,
    statusOptions,
    methods,
    handleStatusChange,
    permission,
    taskId,
    deleteComment,
    addcomment,
    isPending,
    commentsData,
    editingCommentId,
    setShowCommentInput,
    onSubmitComment,
    handleDeleteComment,
    handleCancelEdit,
    handleEditComment,
    handleSaveComment,
    showCommentInput,
    setEditingText,
    editingText,
    newComment,
    setNewComment,
  };
}
