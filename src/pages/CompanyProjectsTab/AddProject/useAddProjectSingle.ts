import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  useAddUpdateCompanyProject,
  useGetAllProjectStatus,
  useGetCompanyProjectById,
  useGetSubParaFilter,
} from "@/features/api/companyProject";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { getUserPermission, getUserDetail } from "@/features/selectors/auth.selector";
import { useGetCoreParameterDropdown } from "@/features/api/Business";
import { docUploadMutation } from "@/features/api/file";
import { queryClient } from "@/queryClient";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { getEmployee } from "@/features/api/companyEmployee";

interface FormValues {
  projectId?: string;
  projectName: string;
  projectDescription: string;
  projectDeadline: Date | null;
  projectStatusId: string;
  coreParameterId?: string;
  subParameterId: string[];
  employeeId: string[];
  projectDocuments: (File | { fileId: string; fileName: string })[];
  removedFileIdsArray: string[];
}

export default function useAddProjectSingle() {
  const { id: companyProjectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasInitializedData, setHasInitializedData] = useState(false);

  const [isStatusSearch, setIsStatusSearch] = useState("");
  const [isBusFuncSearch, setIsBusFuncSearch] = useState("");
  const { mutate: docUpload } = docUploadMutation();
  const permission = useSelector(getUserPermission).PROJECT_LIST;
  const userDetail = useSelector(getUserDetail);
  const [isConfModalOpen, setIsConfModalOpen] = useState(false);
  const [reasons, setReasons] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [savedPayload, setSavedPayload] = useState<any>(null);

  const [paginationFilterEmployee, setPaginationFilterEmployee] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 100,
    search: "",
  });

  const [paginationFilterSubPara, setPaginationFilterSubPara] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 100,
    search: "",
  });

  /** Dropdown options */
  const { data: StatusOptionsData, isLoading: statusLoading } = useGetAllProjectStatus({
    filter: {
      search: isStatusSearch.length >= 3 ? isStatusSearch : undefined,
    },
    enable: isStatusSearch.length >= 3,
  });

  const { data: coreParams, isLoading: coreParamsLoading } = useGetCoreParameterDropdown({
    filter: {
      search: isBusFuncSearch.length >= 3 ? isBusFuncSearch : undefined,
    },
    enable: isBusFuncSearch.length >= 3,
  });

  const StatusOptions = (StatusOptionsData?.data || []).map((status) => ({
    value: status.projectStatusId,
    label: status.projectStatus,
    color: status.color,
  }));

  const bussinessFunctOptions = (coreParams?.data || []).map((status) => ({
    value: status.coreParameterId,
    label: status.coreParameterName,
  }));

  /** Mutations & API */
  const { mutate: addProject, isPending } = useAddUpdateCompanyProject();
  const { data: projectApiData } = useGetCompanyProjectById(
    companyProjectId || "",
  );

  /** Form setup */
  const methods = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      projectId: "",
      projectName: "",
      projectDescription: "",
      projectDeadline: null,
      projectStatusId: "",
      subParameterId: [],
      coreParameterId: "",
      employeeId: userDetail?.employeeId ? [userDetail.employeeId] : [],
      projectDocuments: [],
      removedFileIdsArray: [],
    },
  });

  const { reset, watch, setValue } = methods;
  const watchedCoreParameter = watch("coreParameterId");

  /** Fetch Key Result Area (SubParameters) */
  const { data: subParameterData, isLoading: subParaLoading } = useGetSubParaFilter({
    filter: {
      ...paginationFilterSubPara,
      coreParameterId: watchedCoreParameter,
    },
    enable: !!watchedCoreParameter && (!isInitialLoad || hasInitializedData),
  });

  /** Fetch Employees */
  const { data: employeeData, isLoading: employeeLoading } = getEmployee({
    filter: { ...paginationFilterEmployee, isDeactivated: false },
  });

  /** Reset with API data */
  useEffect(() => {
    if (projectApiData?.data) {
      setIsInitialLoad(true);
      setHasInitializedData(false);

      reset({
        projectId: companyProjectId || "",
        projectName: projectApiData?.data.projectName || "",
        projectDescription: projectApiData?.data.projectDescription || "",
        projectDeadline: projectApiData.data.projectDeadline
          ? new Date(projectApiData.data.projectDeadline)
          : null,
        projectStatusId: projectApiData.data.projectStatusId || "",
        subParameterId:
          projectApiData?.data.ProjectParameters?.subParameters?.map(
            (item) => item.subParameterId,
          ) || [],
        coreParameterId:
          projectApiData.data.ProjectParameters?.coreParameter
            ?.coreParameterId || "",
        employeeId:
          projectApiData.data.ProjectEmployees?.map(
            (item) => item.employeeId,
          ) || [],
        projectDocuments: Array.isArray(projectApiData.data.files)
          ? projectApiData.data.files.map(
              (f: { fileId: string; fileName: string }) => ({
                fileId: f.fileId,
                fileName: f.fileName,
              }),
            )
          : [],
        removedFileIdsArray: [],
      });

      setTimeout(() => {
        setIsInitialLoad(false);
        setHasInitializedData(true);
      }, 0);
    } else {
      setIsInitialLoad(false);
      setHasInitializedData(false);

      if (!companyProjectId) {
        reset({
          projectId: "",
          projectName: "",
          projectDescription: "",
          projectDeadline: null,
          projectStatusId: "",
          subParameterId: [],
          coreParameterId: "",
          employeeId: userDetail?.employeeId ? [userDetail.employeeId] : [],
          projectDocuments: [],
          removedFileIdsArray: [],
        });
      }
    }
  }, [projectApiData, reset, companyProjectId, userDetail]);

  const defaultStatus = (StatusOptionsData?.data || [])
    .slice()
    .sort((a, b) => (a.projectStatusOrder || 0) - (b.projectStatusOrder || 0))[0];

  useEffect(() => {
    if (!companyProjectId && defaultStatus && !watch("projectStatusId")) {
      setValue("projectStatusId", defaultStatus.projectStatusId);
    }
  }, [defaultStatus, companyProjectId, setValue, watch]);

  /** Clear subParameters when coreParameter changes */
  const [previousCoreParameterId, setPreviousCoreParameterId] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    const currentCoreParameterId = watchedCoreParameter;

    if (
      !isInitialLoad &&
      hasInitializedData &&
      currentCoreParameterId !== previousCoreParameterId
    ) {
      if (previousCoreParameterId !== undefined) {
        setValue("subParameterId", []);
      }
    }
    setPreviousCoreParameterId(currentCoreParameterId);
  }, [
    watchedCoreParameter,
    setValue,
    isInitialLoad,
    hasInitializedData,
    previousCoreParameterId,
  ]);

  /** File operations helper */
  const handleFileOperations = async (
    projectId: string,
    currentFiles: (File | { fileId: string; fileName: string })[],
    removedIds: string[],
  ) => {
    const uploadProjectFile = (
      file: File,
      fileType: string = "2070",
    ) => {
      const formData = new FormData();
      formData.append("refId", projectId);
      formData.append("imageType", "PROJECT");
      formData.append("isMaster", "0");
      formData.append("fileType", fileType);
      formData.append("files", file);
      docUpload(formData, {
        onSuccess: () => {
          queryClient.resetQueries({
            queryKey: ["get-project-by-id", projectId],
          });
          queryClient.resetQueries({
            queryKey: ["get-project-list-meeting"],
          });
        },
      });
    };

    const newFilesToUpload = currentFiles.filter(
      (file) => file instanceof File,
    ) as File[];

    newFilesToUpload.forEach((file) => {
      uploadProjectFile(file);
    });

    if (removedIds.length > 0) {
      const formData = new FormData();
      formData.append("refId", projectId);
      formData.append("imageType", "PROJECT");
      formData.append("isMaster", "0");
      formData.append("removedFiles", removedIds.join(","));
      docUpload(formData, {
        onSuccess: () => {
          queryClient.resetQueries({
            queryKey: ["get-project-by-id", projectId],
          });
        },
      });
    }
  };

  /** Submit Handler */
  const onSubmit = async (data: FormValues) => {
    const payload = companyProjectId
      ? {
          projectId: companyProjectId,
          projectName: data.projectName,
          projectDescription: data.projectDescription,
          projectDeadline: data.projectDeadline,
          projectStatusId: data.projectStatusId,
          subParameterIds: data.subParameterId,
          otherProjectEmployees: data.employeeId,
        }
      : {
          projectName: data.projectName,
          projectDescription: data.projectDescription,
          projectDeadline: data.projectDeadline,
          projectStatusId: data.projectStatusId,
          subParameterIds: data.subParameterId,
          otherProjectEmployees: data.employeeId,
        };

    addProject(payload, {
      onSuccess: (response) => {
        const projectId = response.data.projectId;
        if (typeof projectId === "string" && projectId) {
          handleFileOperations(
            projectId,
            data.projectDocuments || [],
            data.removedFileIdsArray || [],
          );
        }

        const from = searchParams.get("from");
        const taskId = searchParams.get("taskId");

        let basePath = "/dashboard/projects";

        if (from === "task") {
          basePath = taskId ? `/dashboard/tasks/edit/${taskId}` : "/dashboard/tasks/add";
        } else if (from === "tasksrepeat") {
          basePath = taskId ? `/dashboard/tasksrepeat/edit/${taskId}` : "/dashboard/tasksrepeat/add";
        }

        if (basePath === "/dashboard/projects") {
          navigate(basePath);
          return;
        }

        navigate(`${basePath}?projectId=${projectId}`);
      },
      onError: (error: Error) => {
        const axiosError = error as AxiosError<{
          message?: string;
          status: number;
        }>;

        if (axiosError.response?.data?.status === 417) {
          setSavedPayload(payload);
          setReasons("");
          setIsConfModalOpen(true);
        } else if (axiosError.response?.data.status !== 417) {
          toast.error(
            `Error: ${
              axiosError.response?.data?.message || "An error occurred"
            }`,
          );
        }
      },
    });
  };

  const onConfirmSubmit = () => {
    if (!reasons.trim()) {
      toast.error("Please provide a reason.");
      return;
    }

    const finalPayload = {
      ...savedPayload,
      isForceChangeDeadline: true,
      reasons: reasons,
    };

    addProject(finalPayload, {
      onSuccess: (response) => {
        setIsConfModalOpen(false);
        const projectId = response.data.projectId;

        const from = searchParams.get("from");
        const taskId = searchParams.get("taskId");
        let basePath = "/dashboard/projects";

        if (from === "task") {
          basePath = taskId ? `/dashboard/tasks/edit/${taskId}` : "/dashboard/tasks/add";
        } else if (from === "tasksrepeat") {
          basePath = taskId ? `/dashboard/tasksrepeat/edit/${taskId}` : "/dashboard/tasksrepeat/add";
        }

        if (basePath === "/dashboard/projects") {
          navigate(basePath);
          return;
        }

        navigate(`${basePath}?projectId=${projectId}`);
      },
      onError: (error: Error) => {
        const axiosError = error as AxiosError<{
          message?: string;
          status: number;
        }>;
        toast.error(
          `Error: ${axiosError.response?.data?.message || "An error occurred"}`,
        );
      },
    });
  };

  return {
    onSubmit,
    methods,
    employeeData,
    setPaginationFilterEmployee,
    setPaginationFilterSubPara,
    subParameterData,
    companyProjectId,
    isPending,
    projectApiData,
    permission,
    StatusOptions,
    bussinessFunctOptions,
    watchedCoreParameter,
    setIsStatusSearch,
    setIsBusFuncSearch,
    isConfModalOpen,
    setIsConfModalOpen,
    reasons,
    setReasons,
    onConfirmSubmit,
    statusLoading,
    coreParamsLoading,
    subParaLoading,
    employeeLoading,
  };
}
