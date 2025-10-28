import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  useAddUpdateCompanyProject,
  useGetAllProjectStatus,
  useGetCompanyProjectById,
} from "@/features/api/companyProject";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { useGetCoreParameterDropdown } from "@/features/api/Business";
// import { queryClient } from "@/queryClient";
import { docUploadMutation } from "@/features/api/file";
import { queryClient } from "@/queryClient";

export default function useAddProject() {
  const { id: companyProjectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasInitializedData, setHasInitializedData] = useState(false);

  const [isStatusSearch, setIsStatusSearch] = useState("");
  const [isBusFuncSearch, setIsBusFuncSearch] = useState("");
  const { mutate: docUpload } = docUploadMutation();
  const permission = useSelector(getUserPermission).PROJECT_LIST;

  /** Dropdown options */
  const { data: StatusOptionsData } = useGetAllProjectStatus({
    filter: {
      search: isStatusSearch.length >= 3 ? isStatusSearch : undefined,
    },
    enable: isStatusSearch.length >= 3,
  });
  const { data: coreParams } = useGetCoreParameterDropdown({
    filter: {
      search: isBusFuncSearch.length >= 3 ? isBusFuncSearch : undefined,
    },
    enable: isBusFuncSearch.length >= 3,
  });

  const StatusOptions = (StatusOptionsData?.data || []).map((status) => ({
    value: status.projectStatusId,
    label: status.projectStatus,
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
  const methods = useForm({
    mode: "onChange",
  });
  const { handleSubmit, trigger, reset, watch, setValue, getValues } = methods;
  const isCoreParameterSelected = watch("coreParameterId");

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
          ? new Date(projectApiData.data.projectDeadline).toISOString()
          : null,
        projectStatusId: projectApiData.data.projectStatusId || "",
        subParameterId:
          projectApiData?.data.ProjectParameters?.subParameters?.map(
            (item) => item.subParameterId, // Store as array of IDs
          ) || [],
        coreParameterId:
          projectApiData.data.ProjectParameters?.coreParameter
            ?.coreParameterId || "", // ✅ fixed
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
          employeeId: [],
        });
      }
    }
  }, [projectApiData, reset, companyProjectId]);

  /** Clear subParameters when coreParameter changes */
  const watchedCoreParameter = watch("coreParameterId");
  const [previousCoreParameterId, setPreviousCoreParameterId] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    const currentCoreParameterId = watchedCoreParameter; // ✅ fixed (direct primitive)

    if (
      !isInitialLoad &&
      hasInitializedData &&
      currentCoreParameterId !== previousCoreParameterId
    ) {
      if (previousCoreParameterId !== undefined) {
        setValue("subParameterId", []); // clear sub-parameters
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

  /** Handlers */
  const handleClose = () => setModalOpen(false);

  const onFinish = useCallback(async () => {
    const isValid = await trigger();
    if (isValid) {
      setModalOpen(true);
    }
  }, [trigger]);

  const onSubmit = handleSubmit(async (data) => {
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
        handleModalClose();
        if (searchParams.get("from") === "task") {
          navigate(`/dashboard/tasks/add?projectId=${projectId}`);
        } else {
          navigate("/dashboard/projects");
        }
      },
    });
  });

  const handleFileOperations = async (
    projectId: string,
    currentFiles: (File | string | { fileId: string; fileName: string })[],
    removedIds: string[],
  ) => {
    const uploadProjectFile = (
      file: File | string,
      fileType: string = "2070",
    ) => {
      const formData = new FormData();
      formData.append("refId", projectId);
      formData.append("imageType", "PROJECT");
      formData.append("isMaster", "0");
      formData.append("fileType", fileType);
      if (file instanceof File || typeof file === "string") {
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
      }
    };

    const newFilesToUpload = currentFiles.filter(
      (file) => file instanceof File || typeof file === "string",
    ) as (File | string)[];

    newFilesToUpload.forEach((file) => {
      uploadProjectFile(file);
    });

    if (removedIds.length > 0) {
      const formData = new FormData();
      formData.append("refId", projectId);
      formData.append("imageType", "PROJECT");
      formData.append("isMaster", "0");
      formData.append("removedFiles", removedIds.join(",")); // Send as comma-separated string
      docUpload(formData, {
        onSuccess: () => {
          queryClient.resetQueries({
            queryKey: ["get-project-by-id", projectId],
          });
        },
      });
    }
  };

  const handleModalClose = () => {
    reset();
    setModalOpen(false);
  };

  return {
    isModalOpen,
    handleClose,
    onFinish,
    onSubmit,
    projectPreview: getValues(),
    trigger,
    methods,
    companyProjectId,
    isPending,
    isInitialLoad,
    hasInitializedData,
    projectApiData,
    permission,
    StatusOptions,
    bussinessFunctOptions,
    isCoreParameterSelected,
    setIsStatusSearch,
    setIsBusFuncSearch,
  };
}
