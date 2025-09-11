import {
  useAddUpdateCompanyProject,
  useGetAllProjectStatus,
  useGetCompanyProjectById,
} from "@/features/api/companyProject";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { useGetCompanyMeeting } from "@/features/api/companyMeeting";
import { useDdTaskType, useGetAllTaskStatus } from "@/features/api/companyTask";
import { useGetEmployeeDd } from "@/features/api/companyEmployee";

export default function useViewProject() {
  const methods = useForm();
  const navigate = useNavigate();
  const { id: companyProjectId } = useParams();
  const permission = useSelector(getUserPermission);
  const { data: projectApiData } = useGetCompanyProjectById(
    companyProjectId || "",
  );

  const [isMeetingSearch, setIsMeetingSearch] = useState("");
  const [isTypeSearch, setIsTypeSearch] = useState("");
  const [isStatusSearch, setIsStatusSearch] = useState("");
  const [isProjStatusSearch, setIsProjStatusSearch] = useState("");
  const [isEmployeeSearch, setIsEmployeeSearch] = useState("");

  const { data: projectStatusList } = useGetAllProjectStatus({
    filter: {
      search: isProjStatusSearch.length >= 3 ? isProjStatusSearch : undefined,
    },
    enable: isProjStatusSearch.length >= 3,
  });

  const { mutate: addProject } = useAddUpdateCompanyProject();
  const { data: taskTypeData } = useDdTaskType({
    filter: {
      search: isTypeSearch.length >= 3 ? isTypeSearch : undefined,
    },
    enable: isTypeSearch.length >= 3,
  });
  const { data: taskStatus } = useGetAllTaskStatus({
    filter: {
      search: isStatusSearch.length >= 3 ? isStatusSearch : undefined,
      pageSize: 25,
    },
    enable: isStatusSearch.length >= 3,
  });
  const { data: employeeData } = useGetEmployeeDd({
    filter: {
      isDeactivated: false,
      search: isEmployeeSearch.length >= 3 ? isEmployeeSearch : undefined,
      pageSize: 25,
    },
    enable: isEmployeeSearch.length >= 3,
  });

  const {
    register,
    control,
    formState: { errors },
    setValue,
  } = useForm();

  const { data: meetingData } = useGetCompanyMeeting({
    filter: {
      search: isMeetingSearch,
      pageSize: 25,
    },
  });

  const statusOptions = (projectStatusList?.data ?? []).map((item) => ({
    label: item.projectStatus,
    value: item.projectStatusId,
    color: item.color || "#2e3195",
  }));

  const meetingDataOption = (meetingData?.data ?? []).map((item) => ({
    label: item.meetingName ?? "",
    value: item.meetingId ?? "",
  }));
  const taskStatusOptions = taskStatus
    ? taskStatus.data.map((status) => ({
        label: status.taskStatus,
        value: status.taskStatusId,
      }))
    : [];

  const taskTypeOptions = taskTypeData
    ? taskTypeData.data.map((status) => ({
        label: status.taskTypeName || "Unnamed",
        value: status.taskTypeId || "", // Fallback to empty string
      }))
    : [];

  const employeeOptions = taskTypeData
    ? employeeData?.data.map((status) => ({
        label: status.employeeName || "Unnamed",
        value: status.employeeId || "",
      }))
    : [];

  const handleStatusChange = (ele: string) => {
    const payload = {
      projectStatusId: ele,
      projectId: companyProjectId,
    };
    addProject(payload);
  };

  useEffect(() => {
    if (projectApiData?.data?.projectStatus?.projectStatusId) {
      methods.reset({
        projectStatus: projectApiData.data?.projectStatus.projectStatusId,
      });
    }
  }, [projectApiData, methods]);

  return {
    projectApiData,
    navigate,
    statusOptions,
    methods,
    handleStatusChange,
    taskPermission: permission.TASK,
    permission: permission.PROJECT_LIST,
    meetingDataOption,
    register,
    control,
    errors,
    setValue,
    setIsMeetingSearch,
    setIsTypeSearch,
    setIsStatusSearch,
    setIsEmployeeSearch,
    taskTypeOptions,
    taskStatusOptions,
    employeeOptions,
    setIsProjStatusSearch,
  };
}
