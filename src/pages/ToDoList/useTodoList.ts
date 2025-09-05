import { useState } from "react";
import {
  addUpdateToDoListMutation,
  deleteToDoMutation,
  useGetAllTodoList,
} from "@/features/api/ToDoList";

export function useTodoList() {
  const [newTask, setNewTask] = useState("");
  const [selectedTask, setSelectedTask] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const { data: tasks } = useGetAllTodoList();
  const { mutate: modifyTodo } = addUpdateToDoListMutation();
  const { mutate: deleteTodo } = deleteToDoMutation();

  // Add task
  const handleAddTask = () => {
    const payload = {
      toDoName: newTask.trim().replace(/\s+/g, " "),
    };
    modifyTodo(payload);

    setNewTask("");
  };

  // Open drawer
  const handleOpenDrawer = (taskId: string, taskName: string) => {
    setSelectedTask({ id: taskId, name: taskName });
    setIsDrawerOpen(true);
  };

  // Toggle complete
  const toggleComplete = (toDoId: string) => {
    const payload = {
      toDoId: toDoId,
      isCompleted: true,
    };
    modifyTodo(payload);
  };

  const handleUpdateTodo = (toDoId: string) => {
    const payload = {
      toDoId: toDoId,
      toDoName: editValue.trim().replace(/\s+/g, " "),
    };

    modifyTodo(payload);
  };

  const handleDelete = (toDoId: string) => {
    if (toDoId) {
      deleteTodo(toDoId);
    }
  };

  return {
    tasks,
    newTask,
    selectedTask,
    isDrawerOpen,
    setNewTask,
    setIsDrawerOpen,
    handleAddTask,
    handleOpenDrawer,
    toggleComplete,
    setEditValue,
    setEditIndex,
    editIndex,
    editValue,
    handleUpdateTodo,
    handleDelete,
  };
}
