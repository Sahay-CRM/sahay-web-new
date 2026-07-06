import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import {
  addUpdateDetailMeetingMutation,
  useGetMeetingTiming,
} from "@/features/api/detailMeeting";
import { useSelector } from "react-redux";
import { getUserPermission, getUserDetail } from "@/features/selectors/auth.selector";

// Renamed function
export default function useAddDetailMeeting() {
  const { id: companyMeetingId } = useParams();
  const [isModalOpen, setModalOpen] = useState(false);
  const permission = useSelector(getUserPermission).LIVE_MEETING;
  const userDetail = useSelector(getUserDetail);

  const { mutate: addDetailMeeting, isPending } =
    addUpdateDetailMeetingMutation();
  const navigate = useNavigate();
  const { data: meetingData } = useGetMeetingTiming(companyMeetingId || "");

  const meetingApiData = meetingData?.data as CompanyMeetingDataProps;

  const methods = useForm({
    mode: "onChange",
  });

  const { handleSubmit, trigger, reset, getValues, setValue, watch } = methods;

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
    } else {
      if (!companyMeetingId) {
        reset({
          meetingId: "",
          meetingName: "",
          meetingDescription: "",
          meetingDateTime: null,
          meetingTypeId: undefined,
          employeeId: userDetail?.employeeId ? [{ employeeId: userDetail.employeeId }] : [],
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

  const [
    watchedName,
    watchedDesc,
    watchedDateTime,
    watchedType,
    watchedJoiners,
  ] = watch([
    "meetingName",
    "meetingDescription",
    "meetingDateTime",
    "meetingTypeId",
    "employeeId",
  ]);

  const isFormDirty = (() => {
    if (!meetingApiData) return false;

    const nameChanged =
      (watchedName || "").trim() !== (meetingApiData.meetingName || "").trim();
    const descChanged =
      (watchedDesc || "").trim() !==
      (meetingApiData.meetingDescription || "").trim();

    const originalStart = meetingApiData.meetingDateTime
      ? new Date(meetingApiData.meetingDateTime).toISOString()
      : null;
    const currentStart = watchedDateTime
      ? new Date(watchedDateTime).toISOString()
      : null;
    const startChanged = currentStart !== originalStart;

    const originalTypeId =
      meetingApiData.meetingType?.meetingTypeId || meetingApiData.meetingTypeId;
    const currentTypeId = watchedType?.meetingTypeId || watchedType;
    const typeChanged = currentTypeId !== originalTypeId;

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
      startChanged ||
      typeChanged ||
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
    companyMeetingId,
    isPending,
    meetingApiData,
    permission,
    isFormDirty,
  };
}
