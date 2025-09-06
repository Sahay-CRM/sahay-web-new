import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import {
  addUpdateDetailMeetingMutation,
  useGetMeetingTiming,
} from "@/features/api/detailMeeting";
import { useSelector } from "react-redux";
import { getUserPermission } from "@/features/selectors/auth.selector";

// Renamed function
export default function useAddDetailMeeting() {
  const { id: companyMeetingId } = useParams();
  const [isModalOpen, setModalOpen] = useState(false);
  const permission = useSelector(getUserPermission).LIVE_MEETING;

  const { mutate: addDetailMeeting, isPending } =
    addUpdateDetailMeetingMutation();
  const navigate = useNavigate();
  const { data: meetingApiData } = useGetMeetingTiming(companyMeetingId || "");

  const methods = useForm({
    mode: "onChange",
  });

  const { handleSubmit, trigger, reset, getValues, setValue } = methods;

  useEffect(() => {
    if (meetingApiData) {
      const data = meetingApiData;
      reset({
        meetingId: companyMeetingId || "",
        meetingName: data.meetingName || "",
        meetingDescription: data.meetingDescription || "",
        meetingDateTime: data.meetingDateTime
          ? new Date(data.meetingDateTime).toISOString()
          : null,
        meetingTypeId: data.meetingType || undefined,
        employeeId: data.joiners,
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
    const payload = companyMeetingId
      ? {
          meetingName: data?.meetingName,
          meetingDescription: data?.meetingDescription,
          meetingDateTime:
            data.meetingDateTime instanceof Date
              ? data.meetingDateTime.toISOString()
              : data.meetingDateTime,
          meetingTypeId: data?.meetingTypeId?.meetingTypeId,
          joiners: data?.employeeId?.map(
            (ele: { employeeId: string }) => ele?.employeeId,
          ),
          meetingId: companyMeetingId || "",
          teamLeaders: Array.isArray(data?.employeeId)
            ? data.employeeId
                .filter((emp: EmployeeDetails) => emp.isTeamLeader)
                .map((emp: EmployeeDetails) => emp.employeeId)
            : [],
          isDetailMeeting: true,
        }
      : {
          meetingName: data?.meetingName,
          meetingDescription: data?.meetingDescription,
          meetingDateTime:
            data.meetingDateTime instanceof Date
              ? data.meetingDateTime.toISOString()
              : data.meetingDateTime,
          meetingTypeId: data?.meetingTypeId?.meetingTypeId,
          joiners: data?.employeeId?.map(
            (ele: { employeeId: string }) => ele?.employeeId,
          ),
          teamLeaders: Array.isArray(data?.employeeId)
            ? data.employeeId
                .filter((emp: EmployeeDetails) => emp.isTeamLeader)
                .map((emp: EmployeeDetails) => emp.employeeId)
            : [],
          isDetailMeeting: true,
        };

    addDetailMeeting(payload, {
      onSuccess: () => {
        handleModalClose();
        if (searchParams.get("from") === "task") {
          navigate("/dashboard/tasks/add");
          window.location.reload();
        } else {
          navigate("/dashboard/meeting/detail");
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
    meetingPreview: getValues(),
    trigger,
    methods,
    companyMeetingId,
    isPending,
    meetingApiData,
    permission,
  };
}
