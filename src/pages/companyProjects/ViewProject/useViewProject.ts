import {
  useAddUpdateCompanyProject,
  useGetAllProjectStatus,
  useGetCompanyProjectById,
} from "@/features/api/companyProject";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
export default function useViewProject() {
  const methods = useForm();
  const navigate = useNavigate();
  const { id: companyProjectId } = useParams();
  const { data: projectApiData } = useGetCompanyProjectById(
    companyProjectId || "",
  );
  const { data: projectStatusList } = useGetAllProjectStatus();
  const statusOptions = (projectStatusList?.data ?? []).map((item) => ({
    label: item.projectStatus,
    value: item.projectStatusId,
  }));
  const { mutate: addProject } = useAddUpdateCompanyProject();

  const handleStatusChange = (ele, projectId) => {
    const payload = {
      projectStatusId: {
        projectStatusId: ele,
      },
      projectId: projectId,
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
  };
}
