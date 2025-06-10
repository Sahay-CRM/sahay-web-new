import {
  useAddUpdateCompanyProject,
  useGetAllProjectStatus,
  useGetCompanyProjectById,
} from "@/features/api/companyProject";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getUserPermission } from "@/features/selectors/auth.selector";

export default function useViewProject() {
  const methods = useForm();
  const navigate = useNavigate();
  const { id: companyProjectId } = useParams();
  const permission = useSelector(getUserPermission);
  const { data: projectApiData } = useGetCompanyProjectById(
    companyProjectId || "",
  );
  const { data: projectStatusList } = useGetAllProjectStatus();
  const statusOptions = (projectStatusList?.data ?? []).map((item) => ({
    label: item.projectStatus,
    value: item.projectStatusId,
    color: item.color || "#2e3195",
  }));
  const { mutate: addProject } = useAddUpdateCompanyProject();

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
  };
}
