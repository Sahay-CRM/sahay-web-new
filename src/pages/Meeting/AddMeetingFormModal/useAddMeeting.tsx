import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  useAddUpdateCompanyMeeting,
  useGetCompanyMeetingById,
} from "@/features/api/companyMeeting";
import { docUploadMutation } from "@/features/api/file";
import { queryClient } from "@/queryClient";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import { getUserDetail } from "@/features/selectors/auth.selector";
import { AxiosError } from "axios";
import { toast } from "sonner";

// Renamed function
export default function useAddMeeting() {
  const { id: companyMeetingId } = useParams();
  const [isModalOpen, setModalOpen] = useState(false);
  const userDetail = useSelector(getUserDetail);

  const [isConfModalOpen, setIsConfModalOpen] = useState(false);
  const [reasons, setReasons] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [savedPayload, setSavedPayload] = useState<any>(null);

  const { mutate: addMeeting, isPending } = useAddUpdateCompanyMeeting();
  const navigate = useNavigate();
  const { data: meetingApiData } = useGetCompanyMeetingById(
    companyMeetingId || "",
  );

  const { mutate: docUpload } = docUploadMutation(); // Renamed for clarity

  const methods = useForm({
    mode: "onChange",
  });

  const { handleSubmit, trigger, reset, getValues, setValue, watch } = methods;

  useEffect(() => {
    if (meetingApiData?.data) {
      const data = meetingApiData.data;
      reset({
        meetingId: companyMeetingId || "",
        meetingName: data.meetingName || "",
        meetingDescription: data.meetingDescription || "",
        meetingDateTime: data.meetingDateTime
          ? new Date(data.meetingDateTime).toISOString()
          : null,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
        meetingStatusId: data.meetingStatus?.meetingStatusId || undefined,
        meetingTypeId: data.meetingType || undefined,
        employeeId: data.joiners,
        meetingDocuments: Array.isArray(data.files)
          ? data.files.map((f: { fileId: string; fileName: string }) => ({
              fileId: f.fileId,
              fileName: f.fileName,
            }))
          : [],
        removedFileIdsArray: [],
      });
    } else {
      if (!companyMeetingId) {
        reset({
          meetingId: "",
          meetingName: "",
          meetingDescription: "",
          meetingDateTime: null,
          endDate: null,
          meetingStatusId: undefined,
          meetingTypeId: undefined,
          employeeId: userDetail?.employeeId
            ? [
                {
                  ...userDetail,
                  isTeamLeader: false,
                },
              ]
            : [],
          meetingDocuments: [],
          removedFileIdsArray: [],
        });
      }
    }
  }, [meetingApiData, reset, companyMeetingId, setValue, userDetail]);

  const handleClose = () => setModalOpen(false);

  const onFinish = useCallback(async () => {
    const isValid = await trigger();
    if (isValid) {
      setModalOpen(true);
    }
  }, [trigger]);

  const [searchParams] = useSearchParams();

  const onSubmit = handleSubmit(async (data) => {
    const payload = {
      meetingName: data?.meetingName,
      meetingDescription: data?.meetingDescription,
      meetingDateTime:
        data.meetingDateTime instanceof Date
          ? data.meetingDateTime.toISOString()
          : data.meetingDateTime,
      endDate:
        data.endDate instanceof Date
          ? data.endDate.toISOString()
          : data.endDate,
      meetingTypeId: data?.meetingTypeId?.meetingTypeId,
      meetingStatusId:
        data?.meetingStatusId?.meetingStatusId || data?.meetingStatusId,
      joiners: data?.employeeId?.map(
        (ele: { employeeId: string }) => ele?.employeeId,
      ),
      companyMeetingId: companyMeetingId || "",
    };

    addMeeting(payload, {
      onSuccess: (response) => {
        const meetingId = Array.isArray(response?.data)
          ? response?.data[0]?.meetingId
          : (response?.data as { meetingId?: string })?.meetingId;

        if (typeof meetingId === "string" && meetingId) {
          handleFileOperations(
            meetingId,
            data.meetingDocuments || [],
            data.removedFileIdsArray || [],
          );
        }

        handleModalClose();

        const from = searchParams.get("from");
        const projectId = searchParams.get("projectId");
        const taskId = searchParams.get("taskId");

        // ✅ Decide base path
        let basePath = "/dashboard/meeting";

        if (from === "task") {
          basePath = taskId ? `/dashboard/tasks/edit/${taskId}` : "/dashboard/tasks/add";
        } else if (from === "tasksrepeat") {
          basePath = taskId ? `/dashboard/tasksrepeat/edit/${taskId}` : "/dashboard/tasksrepeat/add";
        }

        // ✅ If it's meeting (no task path), go direct
        if (basePath === "/dashboard/meeting") {
          navigate(basePath);
          return;
        }

        // ✅ Navigate to task or repeat task path
        navigate(
          `${basePath}?meetingId=${meetingId}${
            projectId ? `&projectId=${String(projectId)}` : ""
          }`,
        );
      },
      onError: (error: Error) => {
        const axiosError = error as AxiosError<{
          message?: string;
          status: number;
        }>;

        if (axiosError.response?.data?.status === 417 || axiosError.response?.status === 417) {
          setSavedPayload(payload);
          setReasons("");
          setIsConfModalOpen(true);
        } else {
          toast.error(
            `Error: ${
              axiosError.response?.data?.message || "An error occurred"
            }`,
          );
        }
      },
    });
  });

  const handleFileOperations = async (
    meetingId: string,
    currentFiles: (File | string | { fileId: string; fileName: string })[],
    removedIds: string[],
  ) => {
    const uploadMeetingFile = (
      file: File | string,
      fileType: string = "2040",
    ) => {
      const formData = new FormData();
      formData.append("refId", meetingId);
      formData.append("imageType", "MEETING");
      formData.append("isMaster", "0");
      formData.append("fileType", fileType);
      if (file instanceof File || typeof file === "string") {
        formData.append("files", file);
        docUpload(formData, {
          onSuccess: () => {
            queryClient.resetQueries({
              queryKey: ["get-meeting-list-by-id", meetingId],
            });

            queryClient.resetQueries({ queryKey: ["get-meeting-list"] });
            queryClient.resetQueries({ queryKey: ["get-meeting-dropdown"] });
          },
        });
      }
    };

    const newFilesToUpload = currentFiles.filter(
      (file) => file instanceof File || typeof file === "string",
    ) as (File | string)[];

    newFilesToUpload.forEach((file) => {
      uploadMeetingFile(file);
    });

    if (removedIds.length > 0) {
      const formData = new FormData();
      formData.append("refId", meetingId);
      formData.append("imageType", "MEETING");
      formData.append("isMaster", "0");
      formData.append("removedFiles", removedIds.join(",")); // Send as comma-separated string
      docUpload(formData, {
        onSuccess: () => {
          queryClient.resetQueries({
            queryKey: ["get-meeting-list-by-id", meetingId],
          });
        },
      });
    }
  };

  const handleModalClose = () => {
    reset();
    setModalOpen(false);
  };

  const [
    watchedName,
    watchedDesc,
    watchedDateTime,
    watchedEndDate,
    watchedStatusId,
    watchedType,
    watchedJoiners,
    watchedDocs,
    watchedRemovedIds,
  ] = watch([
    "meetingName",
    "meetingDescription",
    "meetingDateTime",
    "endDate",
    "meetingStatusId",
    "meetingTypeId",
    "employeeId",
    "meetingDocuments",
    "removedFileIdsArray",
  ]);

  const isFormDirty = (() => {
    if (!meetingApiData?.data) return false;
    const data = meetingApiData.data;

    const nameChanged =
      (watchedName || "").trim() !== (data.meetingName || "").trim();
    const descChanged =
      (watchedDesc || "").trim() !== (data.meetingDescription || "").trim();

    const originalStart = data.meetingDateTime
      ? new Date(data.meetingDateTime).toISOString()
      : null;
    const currentStart = watchedDateTime
      ? new Date(watchedDateTime).toISOString()
      : null;
    const startChanged = currentStart !== originalStart;

    const originalEnd = data.endDate
      ? new Date(data.endDate).toISOString()
      : null;
    const currentEnd = watchedEndDate
      ? new Date(watchedEndDate).toISOString()
      : null;
    const endChanged = currentEnd !== originalEnd;

    const originalStatusId = data.meetingStatus?.meetingStatusId || undefined;
    const statusChanged = watchedStatusId !== originalStatusId;

    const originalTypeId = data.meetingType?.meetingTypeId || data.meetingType;
    const currentTypeId = watchedType?.meetingTypeId || watchedType;
    const typeChanged = currentTypeId !== originalTypeId;

    const originalJoiners = (data.joiners || []) as (string | Joiners)[];
    const currentJoiners = (watchedJoiners || []) as (string | Joiners)[];

    const getJoinerId = (j: string | Joiners): string => {
      return typeof j === "string" ? j : j.employeeId;
    };

    const getJoinerIsTeamLeader = (j: string | Joiners): boolean => {
      return typeof j === "string" ? false : !!j.isTeamLeader;
    };

    const originalJoinerIds = originalJoiners
      .map(getJoinerId)
      .filter(Boolean)
      .sort();
    const currentJoinerIds = currentJoiners
      .map(getJoinerId)
      .filter(Boolean)
      .sort();
    const joinersListChanged =
      originalJoinerIds.join(",") !== currentJoinerIds.join(",");

    const originalTLIds = originalJoiners
      .filter(getJoinerIsTeamLeader)
      .map(getJoinerId)
      .filter(Boolean)
      .sort();
    const currentTLIds = currentJoiners
      .filter(getJoinerIsTeamLeader)
      .map(getJoinerId)
      .filter(Boolean)
      .sort();
    const teamLeadersChanged =
      originalTLIds.join(",") !== currentTLIds.join(",");

    const hasNewUploads = (watchedDocs || []).some(
      (file: File | string | FileType) =>
        file instanceof File || typeof file === "string",
    );
    const hasRemovedFiles = (watchedRemovedIds || []).length > 0;

    return (
      nameChanged ||
      descChanged ||
      startChanged ||
      endChanged ||
      statusChanged ||
      typeChanged ||
      joinersListChanged ||
      teamLeadersChanged ||
      hasNewUploads ||
      hasRemovedFiles
    );
  })();

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

    addMeeting(finalPayload, {
      onSuccess: (response) => {
        setIsConfModalOpen(false);
        const meetingId = Array.isArray(response?.data)
          ? response?.data[0]?.meetingId
          : (response?.data as { meetingId?: string })?.meetingId;

        if (typeof meetingId === "string" && meetingId) {
          handleFileOperations(
            meetingId,
            methods.getValues().meetingDocuments || [],
            methods.getValues().removedFileIdsArray || [],
          );
        }

        handleModalClose();

        const from = searchParams.get("from");
        const projectId = searchParams.get("projectId");
        const taskId = searchParams.get("taskId");

        // ✅ Decide base path
        let basePath = "/dashboard/meeting";

        if (from === "task") {
          basePath = taskId ? `/dashboard/tasks/edit/${taskId}` : "/dashboard/tasks/add";
        } else if (from === "tasksrepeat") {
          basePath = taskId ? `/dashboard/tasksrepeat/edit/${taskId}` : "/dashboard/tasksrepeat/add";
        }

        // ✅ If it's meeting (no task path), go direct
        if (basePath === "/dashboard/meeting") {
          navigate(basePath);
          return;
        }

        // ✅ Navigate to task or repeat task path
        navigate(
          `${basePath}?meetingId=${meetingId}${
            projectId ? `&projectId=${String(projectId)}` : ""
          }`,
        );
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
    isModalOpen,
    handleClose,
    onFinish,
    onSubmit,
    meetingPreview: getValues(), // This can still be used for the modal preview
    trigger,
    methods, // Export methods for FormProvider
    companyMeetingId,
    isPending,
    meetingApiData,
    isFormDirty,
    isConfModalOpen,
    setIsConfModalOpen,
    reasons,
    setReasons,
    onConfirmSubmit,
  };
}
