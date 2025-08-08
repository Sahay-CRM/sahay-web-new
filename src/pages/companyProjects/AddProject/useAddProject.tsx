import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  useAddUpdateCompanyProject,
  useGetCompanyProjectById,
} from "@/features/api/companyProject";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

export default function useAddProject() {
  const { id: companyProjectId } = useParams();
  const [searchParams] = useSearchParams();

  const [isModalOpen, setModalOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasInitializedData, setHasInitializedData] = useState(false);

  const { mutate: addProject, isPending } = useAddUpdateCompanyProject();
  const { data: projectApiData } = useGetCompanyProjectById(
    companyProjectId || "",
  );
  const navigate = useNavigate();
  const methods = useForm({
    mode: "onChange",
  });

  const { handleSubmit, trigger, reset, watch, setValue, getValues } = methods;

  useEffect(() => {
    if (projectApiData?.data) {
      setIsInitialLoad(true); // Set true before reset to manage dependent effects
      setHasInitializedData(false); // Set false before reset
      reset({
        projectId: companyProjectId || "",
        projectName: projectApiData?.data.projectName || "",
        projectDescription: projectApiData?.data.projectDescription || "",
        projectDeadline: projectApiData.data.projectDeadline
          ? new Date(projectApiData.data.projectDeadline).toISOString()
          : null,
        projectStatusId: projectApiData?.data.projectStatus || "", // Store the whole object if API returns it
        subParameterId:
          projectApiData?.data.ProjectParameters?.subParameters?.map(
            (item) => item.subParameterId, // Store as array of IDs
          ) || [],
        coreParameterId:
          projectApiData?.data.ProjectParameters?.coreParameter || undefined, // Store the whole object
        employeeId:
          projectApiData?.data?.ProjectEmployees?.map(
            (item) => item.employeeId, // Store as array of IDs
          ) || [],
      });
      // Set flags after form data is set and effects might have run
      setTimeout(() => {
        setIsInitialLoad(false);
        setHasInitializedData(true);
      }, 0); // Use setTimeout to allow one render cycle for reset to apply
    } else {
      setIsInitialLoad(false);
      setHasInitializedData(false);
      // Optionally reset form to defaults if no data and not editing
      if (!companyProjectId) {
        reset({
          projectId: "",
          projectName: "",
          projectDescription: "",
          projectDeadline: "",
          projectStatusId: undefined,
          subParameterId: [],
          coreParameterId: undefined,
          employeeId: [],
        });
      }
    }
  }, [projectApiData, reset, companyProjectId]);

  const watchedCoreParameter = watch("coreParameterId");
  const [previousCoreParameterId, setPreviousCoreParameterId] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    const currentCoreParameterId = watchedCoreParameter?.coreParameterId;

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
    previousCoreParameterId, // Add as dependency
  ]);

  const handleClose = () => setModalOpen(false);

  const onFinish = useCallback(async () => {
    const isValid = await trigger();
    if (isValid) {
      setModalOpen(true);
    }
  }, [trigger]);

  const onSubmit = handleSubmit(async (data) => {
    const projectStatusIdValue =
      data.projectStatusId?.projectStatusId || data.projectStatusId;

    const payload = companyProjectId
      ? {
          projectId: companyProjectId || "",
          projectName: data.projectName,
          projectDescription: data.projectDescription,
          projectDeadline: data.projectDeadline,
          projectStatusId: projectStatusIdValue,
          subParameterIds: data.subParameterId, // Should be array of IDs
          otherProjectEmployees: data.employeeId, // Should be array of IDs
        }
      : {
          projectName: data.projectName,
          projectDescription: data.projectDescription,
          projectDeadline: data.projectDeadline,
          projectStatusId: projectStatusIdValue,
          subParameterIds: data.subParameterId, // Should be array of IDs
          otherProjectEmployees: data.employeeId, // Should be array of IDs
        };

    addProject(payload, {
      onSuccess: () => {
        handleModalClose();
        if (searchParams.get("from") === "task") {
          navigate("/dashboard/tasks/add");
          // window.location.reload(); // Consider if reload is necessary or if cache invalidation is enough
        } else {
          navigate(`/dashboard/projects`);
          // window.location.reload();
        }
      },
    });
  });

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
  };
}
