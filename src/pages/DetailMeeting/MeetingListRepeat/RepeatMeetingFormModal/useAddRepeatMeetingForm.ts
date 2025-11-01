import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  addUpdateRepeatMeetingMutation,
  useGetRepeatMeetingById,
} from "@/features/api/RepeatMeetingApi";
import { useSelector } from "react-redux";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { queryClient } from "@/queryClient";

// Renamed function
export default function useAddRepeatMeetingForm() {
  const { id: repetitiveMeetingId } = useParams();
  const permission = useSelector(getUserPermission).LIVE_MEETING_TEMPLATES;
  const [CustomRepeatData, setCustomRepeatData] = useState<CustomObj>();
  const [isModalOpen, setModalOpen] = useState(false);

  const { mutate: addDetailMeeting, isPending } =
    addUpdateRepeatMeetingMutation();
  const navigate = useNavigate();

  const { data: meetingApiData } = useGetRepeatMeetingById(
    repetitiveMeetingId || "",
  );

  const methods = useForm({
    mode: "onChange",
  });

  const { handleSubmit, trigger, reset, getValues, setValue } = methods;

  useEffect(() => {
    if (meetingApiData) {
      const data = meetingApiData;
      reset({
        repetitiveMeetingId: repetitiveMeetingId || "",
        meetingName: data.meetingName || "",
        meetingDescription: data.meetingDescription || "",
        meetingTypeId: data.meetingType,
        meetingDateTime: data.meetingDateTime
          ? new Date(data.meetingDateTime).toISOString()
          : null,
        employeeId: data.joiners,
        repeatType: data.repeatType,
        customObj: data.customObj,
      });
    }
  }, [meetingApiData, reset, repetitiveMeetingId, setValue]);

  const handleClose = () => setModalOpen(false);

  const onFinish = useCallback(async () => {
    const isValid = await trigger();
    if (isValid) {
      setModalOpen(true);
    }
  }, [trigger]);

  const onSubmit = handleSubmit(async (data) => {
    const payload = repetitiveMeetingId
      ? {
          repetitiveMeetingId: repetitiveMeetingId || "",
          meetingName: data?.meetingName,
          meetingDescription: data?.meetingDescription,
          meetingDateTime:
            data.meetingDateTime instanceof Date
              ? data.meetingDateTime.toISOString()
              : data.meetingDateTime,
          meetingTypeId: data?.meetingTypeId?.meetingTypeId,
          joinerIds: data?.employeeId?.map(
            (ele: { employeeId: string }) => ele?.employeeId,
          ),
          teamLeaderIds: Array.isArray(data?.employeeId)
            ? data.employeeId
                .filter((emp: EmployeeDetails) => emp.isTeamLeader)
                .map((emp: EmployeeDetails) => emp.employeeId)
            : [],
          isDetailMeeting: true,
          repeatType: data.repeatType,
          customObj: data.customObj,
        }
      : {
          meetingName: data?.meetingName,
          meetingDescription: data?.meetingDescription,
          meetingDateTime:
            data.meetingDateTime instanceof Date
              ? data.meetingDateTime.toISOString()
              : data.meetingDateTime,
          meetingTypeId: data?.meetingTypeId?.meetingTypeId,
          joinerIds: data?.employeeId?.map(
            (ele: { employeeId: string }) => ele?.employeeId,
          ),
          teamLeaderIds: Array.isArray(data?.employeeId)
            ? data.employeeId
                .filter((emp: EmployeeDetails) => emp.isTeamLeader)
                .map((emp: EmployeeDetails) => emp.employeeId)
            : [],
          isDetailMeeting: true,
          repeatType: data.repeatType,
          customObj: data.customObj,
        };
    addDetailMeeting(payload, {
      onSuccess: () => {
        queryClient.resetQueries({ queryKey: ["get-detail-meeting-list"] });
        handleModalClose();
        navigate("/dashboard/repeat-meeting");
      },
    });
  });

  const handleModalClose = () => {
    reset();
    setModalOpen(false);
  };

  const handleSaveCustomRepeatData = useCallback((customData: CustomObj) => {
    setCustomRepeatData(customData);
  }, []);
  return {
    isModalOpen,
    handleClose,
    onFinish,
    onSubmit,
    meetingPreview: getValues(),
    trigger,
    methods,
    repetitiveMeetingId,
    isPending,
    meetingApiData,
    saveCustomRepeatData: handleSaveCustomRepeatData,
    CustomRepeatData,
    permission,
  };
}
