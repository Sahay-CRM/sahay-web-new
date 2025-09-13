import {
  useAddUpdateCompanyProject,
  useGetAllProjectStatus,
  useGetCompanyProjectById,
} from "@/features/api/companyProject";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getUserPermission } from "@/features/selectors/auth.selector";

export default function useViewProject() {
  const { id: projectId } = useParams();

  const navigate = useNavigate();
  const { id: companyProjectId } = useParams();
  const permission = useSelector(getUserPermission);
  const { data: projectApiData } = useGetCompanyProjectById(
    companyProjectId || "",
  );
  // const { mutate: addUpdateTask } = addUpdateCompanyTaskMutation();
  // const [isMeetingSearch, setIsMeetingSearch] = useState("");
  // const [isTypeSearch, setIsTypeSearch] = useState("");
  // const [isStatusSearch, setIsStatusSearch] = useState("");
  const [isProjStatusSearch, setIsProjStatusSearch] = useState("");

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const { data: projectStatusList } = useGetAllProjectStatus({
    filter: {
      search: isProjStatusSearch.length >= 3 ? isProjStatusSearch : undefined,
    },
    enable: isProjStatusSearch.length >= 3,
  });

  const { mutate: addProject } = useAddUpdateCompanyProject();
  // const { data: taskTypeData } = useDdTaskType({
  //   filter: {
  //     search: isTypeSearch.length >= 3 ? isTypeSearch : undefined,
  //   },
  //   enable: isTypeSearch.length >= 3,
  // });
  // const { data: taskStatus } = useGetAllTaskStatus({
  //   filter: {
  //     search: isStatusSearch.length >= 3 ? isStatusSearch : undefined,
  //     pageSize: 25,
  //   },
  //   enable: isStatusSearch.length >= 3,
  // });
  // const { data: employeedata } = useGetEmployeeDd({
  //   filter: { isDeactivated: false },
  // });

  // const employeeOption = employeedata
  //   ? employeedata.data.map((status) => ({
  //       label: status.employeeName,
  //       value: status.employeeId,
  //     }))
  //   : [];

  // const { data: meetingData } = useGetCompanyMeeting({
  //   filter: {
  //     search: isMeetingSearch,
  //     pageSize: 25,
  //   },
  // });

  const statusOptions = (projectStatusList?.data ?? []).map((item) => ({
    label: item.projectStatus,
    value: item.projectStatusId,
    color: item.color || "#2e3195",
  }));

  // const meetingDataOption = (meetingData?.data ?? []).map((item) => ({
  //   label: item.meetingName ?? "",
  //   value: item.meetingId ?? "",
  // }));
  // const taskStatusOptions = taskStatus
  //   ? taskStatus.data.map((status) => ({
  //       label: status.taskStatus,
  //       value: status.taskStatusId,
  //     }))
  //   : [];

  // const taskTypeOptions = taskTypeData
  //   ? taskTypeData.data.map((status) => ({
  //       label: status.taskTypeName || "Unnamed",
  //       value: status.taskTypeId || "", // Fallback to empty string
  //     }))
  //   : [];

  const handleStatusChange = (ele: string) => {
    const payload = {
      projectStatusId: ele,
      projectId: companyProjectId,
    };
    addProject(payload);
  };

  // const onSubmittask = handleSubmit(async (data) => {
  //   const assigneeIds = data.assignUsers;

  //   const payload = {
  //     taskName: data.taskName,
  //     taskDescription: data.taskDescription,
  //     taskDeadline: data.taskDeadline ? new Date(data.taskDeadline) : null,
  //     taskStatusId: data?.taskStatusId,
  //     employeeIds: assigneeIds,
  //     projectId: projectId,
  //     meetingId: data.meetingId,
  //     taskTypeId: data.taskTypeId,
  //   };

  //   addUpdateTask(payload, {
  //     onSuccess: () => {
  //       queryClient.resetQueries({
  //         queryKey: ["get-project-by-id", projectId],
  //       });
  //       setIsAddTaskOpen(false);
  //     },
  //   });
  // });

  return {
    projectApiData,
    projectId,
    navigate,
    statusOptions,
    // methods,
    handleStatusChange,
    taskPermission: permission.TASK,
    permission: permission.PROJECT_LIST,
    // meetingDataOption,
    // register,
    // control,
    // errors,
    // setValue,
    // setIsMeetingSearch,
    // setIsTypeSearch,
    // setIsStatusSearch,
    // taskTypeOptions,
    // taskStatusOptions,
    setIsProjStatusSearch,
    setIsAddTaskOpen,
    isAddTaskOpen,
    // employeeOption,
    // onSubmittask,
  };
}
