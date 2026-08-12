import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  useCloneAdminMeetingTemplateToMeeting,
} from "@/features/api/detailMeeting";
import { useSelector } from "react-redux";
import { getUserPermission } from "@/features/selectors/auth.selector";

export default function useCloneDetailMeeting() {
  const [isModalOpen, setModalOpen] = useState(false);
  const permission = useSelector(getUserPermission).CLONE_MEETING;

  const { mutate: cloneMeeting, isPending } = useCloneAdminMeetingTemplateToMeeting();
  const navigate = useNavigate();

  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      templateId: "",
      templateName: "",
      meetingName: "",
      meetingDescription: "",
      meetingDateTime: "",
      meetingTimePlanned: "",
      meetingTypeId: "",
      employeeId: [],
    },
  });

  const { handleSubmit, trigger, reset, getValues, watch } = methods;

  const handleClose = () => setModalOpen(false);

  const onFinish = useCallback(async () => {
    const isValid = await trigger();
    if (isValid) {
      setModalOpen(true);
    }
  }, [trigger]);

  const onSubmit = handleSubmit(async (data) => {
    const payload = {
      meetingName: data?.meetingName,
      meetingDescription: data?.meetingDescription,
      meetingDateTime: data?.meetingDateTime,
      meetingTypeId:  data?.meetingTypeId,
      joiners: data?.employeeId?.map(
        (ele: { employeeId: string }) => ele?.employeeId,
      ),
      teamLeaders: Array.isArray(data?.employeeId)
        ? data.employeeId
            .filter((emp: EmployeeDetails) => emp.isTeamLeader)
            .map((emp: EmployeeDetails) => emp.employeeId)
        : [],
      meetingTimePlanned: data?.meetingTimePlanned
        ? String(Number(data.meetingTimePlanned) * 60)
        : undefined,
    };

    cloneMeeting(
      {
        id: data.templateId,
        payload,
      },
      {
        onSuccess: () => {
          handleModalClose();
          navigate("/dashboard/meeting/detail");
        },
      },
    );
  });

  const handleModalClose = () => {
    reset();
    setModalOpen(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const watchedMeetingType = watch("meetingTypeId") as any || "";
  const selectedTemplateName = watch("templateName") || "";

  return {
    isModalOpen,
    handleClose,
    onFinish,
    onSubmit,
    meetingPreview: {
      ...getValues(),
      meetingTypeName: watchedMeetingType?.meetingTypeName  || selectedTemplateName,
    },
    trigger,
    methods,
    isPending,
    permission,
  };
}
