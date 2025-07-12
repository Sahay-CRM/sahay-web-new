import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  useAddUpdateCompanyMeeting,
  useGetCompanyMeetingById,
} from "@/features/api/companyMeeting";
import { docUploadMutation } from "@/features/api/file";
import { queryClient } from "@/queryClient";
import { format, parseISO } from "date-fns";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useState } from "react";

// Renamed function
export default function useAddMeeting() {
  const { id: companyMeetingId } = useParams();
  const [isModalOpen, setModalOpen] = useState(false);

  const { mutate: addMeeting, isPending } = useAddUpdateCompanyMeeting();
  const navigate = useNavigate();
  const { data: meetingApiData } = useGetCompanyMeetingById(
    companyMeetingId || "",
  );

  const { mutate: docUpload } = docUploadMutation(); // Renamed for clarity

  const methods = useForm({
    mode: "onChange",
  });

  const { handleSubmit, trigger, reset, getValues, setValue } = methods;

  useEffect(() => {
    if (meetingApiData?.data) {
      const data = meetingApiData.data;
      reset({
        meetingId: companyMeetingId || "",
        meetingName: data.meetingName || "",
        meetingDescription: data.meetingDescription || "",
        meetingDateTime: data.meetingDateTime
          ? format(parseISO(data.meetingDateTime), "yyyy-MM-dd")
          : "",
        meetingStatusId: data.meetingStatus || undefined,
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
    }
  }, [meetingApiData, reset, companyMeetingId, setValue]);

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
      meetingDateTime: data?.meetingDateTime,
      meetingTypeId: data?.meetingTypeId?.meetingTypeId,
      meetingStatusId: data?.meetingStatusId?.meetingStatusId,
      joiners: data?.employeeId?.map(
        (ele: { employeeId: string }) => ele?.employeeId,
      ),
      companyMeetingId: companyMeetingId || "",
      teamLeaders: Array.isArray(data?.employeeId)
        ? data.employeeId
            .filter((emp: EmployeeDetails) => emp.isTeamLeader)
            .map((emp: EmployeeDetails) => emp.employeeId)
        : [],
    };

    addMeeting(payload, {
      onSuccess: (response) => {
        const meetingId = Array.isArray(response?.data)
          ? response?.data[0]?.companyMeetingId || companyMeetingId
          : (response?.data as { companyMeetingId?: string })
              ?.companyMeetingId || companyMeetingId;

        if (typeof meetingId === "string" && meetingId) {
          handleFileOperations(
            meetingId,
            data.meetingDocuments || [],
            data.removedFileIdsArray || [],
          );
        }

        handleModalClose();
        if (searchParams.get("from") === "task") {
          navigate("/dashboard/tasks/add");
          window.location.reload();
        } else {
          navigate("/dashboard/meeting");
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
            queryClient.resetQueries({ queryKey: ["get-meeting-list"] });
            queryClient.resetQueries({ queryKey: ["get-meeting-dropdown"] });
            queryClient.resetQueries({ queryKey: ["get-meeting-list-by-id"] });
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
      docUpload(formData);
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
    meetingPreview: getValues(), // This can still be used for the modal preview
    trigger,
    methods, // Export methods for FormProvider
    companyMeetingId,
    isPending,
    meetingApiData,
  };
}
