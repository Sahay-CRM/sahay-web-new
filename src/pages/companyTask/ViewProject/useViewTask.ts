import {
  useGetAllTaskStatus,
  useGetCompanyTaskById,
} from "@/features/api/companyTask";
import useAddUpdateCompanyTask from "@/features/api/companyTask/useAddUpdateCompanyTask";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

export default function useViewCompanyTask() {
  const methods = useForm();
  const navigate = useNavigate();
  const { id: taskId } = useParams();
  const { data: taskApiData } = useGetCompanyTaskById(taskId || "");
  const { data: taskStatus } = useGetAllTaskStatus({
    filter: {},
  });
  const { mutate: updateCompanyTask } = useAddUpdateCompanyTask();

  const statusOptions = (taskStatus?.data ?? []).map((item) => ({
    label: item.taskStatus,
    value: item.taskStatusId,
  }));

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
  };
}
