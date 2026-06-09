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
import { AxiosError } from "axios";
import { toast } from "sonner";
import { getRepeatTypeOrCustomForRepeatMeeting } from "@/components/shared/RepeatOption/repeatOption";
import { convertUtcTimeToLocal } from "@/features/utils/app.utils";

// Renamed function
export default function useAddRepeatMeetingForm() {
  const { id: repetitiveMeetingId } = useParams();
  const permission = useSelector(getUserPermission).LIVE_MEETING_TEMPLATES;
  const [CustomRepeatData, setCustomRepeatData] = useState<
    CustomObjREPT | undefined
  >();
  const [isModalOpen, setModalOpen] = useState(false);

  const [selectedRepeat, setSelectedRepeat] = useState<string>("");
  const { mutate: addDetailMeeting, isPending } =
    addUpdateRepeatMeetingMutation();
  const navigate = useNavigate();

  const [isChildData, setIsChildData] = useState<string | undefined>("");
  const { data: meetingApiData } = useGetRepeatMeetingById(
    repetitiveMeetingId || "",
  );

  const methods = useForm({
    mode: "onChange",
  });

  const { handleSubmit, trigger, reset, getValues, setValue, watch } = methods;
  const selectedRepeatlabel = watch("repeatType");

  useEffect(() => {
    if (meetingApiData) {
      const data = meetingApiData;

      reset({
        repetitiveMeetingId: repetitiveMeetingId || "",
        meetingName: data.meetingName || "",
        meetingDescription: data.meetingDescription || "",
        meetingTypeId: data.meetingType,
        repeatTime: convertUtcTimeToLocal(data.repeatTime),
        employeeId: data.joiners,
        repeatType: data.repeatType,
        customObj: data.customObj,
        isActive: data.isActive,
        nextDate: data.nextDate,
      });
      if (data.customObj) {
        setCustomRepeatData(data.customObj);
      }
      setSelectedRepeat(getRepeatTypeOrCustomForRepeatMeeting(data));
    } else {
      setSelectedRepeat("");
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
          repeatTime: data.repeatTime,
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
          isChildDataKey: data.additionalKey,
          isActive: data.isActive,
        }
      : {
          meetingName: data?.meetingName,
          meetingDescription: data?.meetingDescription,
          repeatTime: data.repeatTime,
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
          isActive: true,
        };

    addDetailMeeting(payload, {
      onSuccess: () => {
        queryClient.resetQueries({ queryKey: ["get-detail-meeting-list"] });
        handleModalClose();
        navigate("/dashboard/repeat-meeting");
      },
      onError: (error: Error) => {
        const axiosError = error as AxiosError<{
          message?: string;
          status: number;
        }>;

        if (axiosError.response?.data?.status === 417) {
          setIsChildData(axiosError.response?.data?.message);
        } else if (axiosError.response?.data.status !== 417) {
          toast.error(
            `Error: ${axiosError.response?.data?.message || "An error occurred"}`,
          );
        }
      },
    });
  });

  const handleModalClose = () => {
    reset();
    setModalOpen(false);
  };

  const handleSaveCustomRepeatData = useCallback(
    (customData: CustomObjREPT) => {
      setCustomRepeatData(customData);
    },
    [],
  );

  const handleKeepAll = () => {
    setValue("additionalKey", "UPDATE_ALL");
    onSubmit();
  };

  const handleDeleteAll = () => {
    setValue("additionalKey", "DELETE_ALL");
    onSubmit();
  };

  const [
    watchedName,
    watchedDesc,
    watchedType,
    watchedTime,
    watchedRepeatType,
    watchedCustomObj,
    watchedJoiners,
  ] = watch([
    "meetingName",
    "meetingDescription",
    "meetingTypeId",
    "repeatTime",
    "repeatType",
    "customObj",
    "employeeId",
  ]);

  const isFormDirty = (() => {
    if (!meetingApiData) return false;

    const nameChanged =
      (watchedName || "").trim() !== (meetingApiData.meetingName || "").trim();
    const descChanged =
      (watchedDesc || "").trim() !==
      (meetingApiData.meetingDescription || "").trim();

    const originalTypeId =
      meetingApiData.meetingType?.meetingTypeId || meetingApiData.meetingTypeId;
    const currentTypeId = watchedType?.meetingTypeId || watchedType;
    const typeChanged = currentTypeId !== originalTypeId;

    const originalLocalTime = convertUtcTimeToLocal(meetingApiData.repeatTime);
    const timeChanged = watchedTime !== originalLocalTime;

    const repeatTypeChanged = watchedRepeatType !== meetingApiData.repeatType;

    const customObjChanged =
      JSON.stringify(watchedCustomObj || null) !==
      JSON.stringify(meetingApiData.customObj || null);

    const originalJoiners = (meetingApiData.joiners || []) as (
      | string
      | Joiners
    )[];
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

    return (
      nameChanged ||
      descChanged ||
      typeChanged ||
      timeChanged ||
      repeatTypeChanged ||
      customObjChanged ||
      joinersListChanged ||
      teamLeadersChanged
    );
  })();

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
    isChildData,
    handleKeepAll,
    setSelectedRepeat,
    selectedRepeat,
    handleDeleteAll,
    setCustomRepeatData,
    selectedRepeatlabel,
    isFormDirty,
  };
}
