import { getDatabase, off, onValue, ref, update } from "firebase/database";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { queryClient } from "@/queryClient";

import {
  addMeetingTimeMutation,
  createMeetingMutation,
  endMeetingMutation,
  useGetCompanyMeetingById,
  useGetMeetingTiming,
} from "@/features/api/companyMeeting";

import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { getUserId } from "@/features/selectors/auth.selector";

export default function useDetailedMeeting() {
  const { id: meetingId } = useParams();
  const [isMeetingStart, setIsMeetingStart] = useState(false);

  const { data: meetingData, failureReason } = useGetCompanyMeetingById(
    meetingId ?? "",
  );
  const { mutate: createMeet } = createMeetingMutation();
  const { mutate: endMeet } = endMeetingMutation();

  const { data: meetingTiming } = useGetMeetingTiming(meetingId ?? "");

  const [meetingResponse, setMeetingResponse] = useState<MeetingResFire | null>(
    null,
  );

  const userId = useSelector(getUserId);

  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Meeting", href: "/dashboard/meeting" },
      { label: "Meeting Detail", href: "" },
      { label: `${meetingData?.data.meetingName}`, href: "" },
    ]);
  }, [meetingData?.data.meetingName, setBreadcrumbs]);

  const { mutate: updateTime } = addMeetingTimeMutation();

  // Ref to store latest tab times
  const latestTimesRef = useRef<{
    defaultTimes: Record<
      "agenda" | "tasks" | "project" | "kpis" | "conclusion",
      number
    >;
    spentTimes: Record<
      "agenda" | "tasks" | "project" | "kpis" | "conclusion",
      number
    >;
  }>({
    defaultTimes: {
      agenda: 0,
      tasks: 0,
      project: 0,
      kpis: 0,
      conclusion: 0,
    },
    spentTimes: {
      agenda: 0,
      tasks: 0,
      project: 0,
      kpis: 0,
      conclusion: 0,
    },
  });

  const handleStartMeeting = useCallback(() => {
    if (meetingId) {
      createMeet(meetingId, {
        onSuccess: () => {
          const { defaultTimes } = latestTimesRef.current;

          // Prepare the payload for updateTime
          const payload = {
            meetingId: meetingId,
            agendaTimePlanned: String((defaultTimes.agenda ?? 0) * 60),
            discussionTaskTimePlanned: String((defaultTimes.tasks ?? 0) * 60),
            discussionProjectTimePlanned: String(
              (defaultTimes.project ?? 0) * 60,
            ),
            discussionKPITimePlanned: String((defaultTimes.kpis ?? 0) * 60),
          };

          updateTime(payload, {
            onSuccess: () => {
              updateTime({
                meetingId: meetingId,
                employeeId: userId,
                attendanceMark: true,
              });
              setIsMeetingStart(true);

              // Set default follow to current user
              if (userId) {
                const db = getDatabase();
                const meetRef = ref(db, `meetings/${meetingId}`);
                update(meetRef, { follow: userId });
              }
            },
          });
        },
      });
    }
  }, [createMeet, meetingId, updateTime, userId]);

  const handleUpdatedRefresh = useCallback(async () => {
    const activeTab = meetingResponse?.activeScreen;

    await Promise.all([
      ...(activeTab === "agenda"
        ? [
            queryClient.resetQueries({ queryKey: ["get-meeting-issue"] }),
            queryClient.resetQueries({ queryKey: ["get-meeting-objective"] }),
          ]
        : []),
      ...(activeTab === "tasks"
        ? [queryClient.resetQueries({ queryKey: ["get-meeting-tasks-res"] })]
        : []),
      ...(activeTab === "project"
        ? [queryClient.resetQueries({ queryKey: ["get-meeting-Project-res"] })]
        : []),
      ...(activeTab === "kpis"
        ? [queryClient.resetQueries({ queryKey: ["get-meeting-kpis-res"] })]
        : []),
      queryClient.resetQueries({ queryKey: ["get-meeting-details-timing"] }),
    ]);
  }, [meetingResponse?.activeScreen]);

  useEffect(() => {
    const db = getDatabase();
    const meetingRef = ref(db, `meetings/${meetingId}`);

    onValue(meetingRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setMeetingResponse(data);
        handleUpdatedRefresh();
      } else {
        setMeetingResponse(null);
      }
    });

    return () => {
      off(meetingRef);
    };
  }, [handleUpdatedRefresh, meetingId]);

  useEffect(() => {
    if (meetingResponse) {
      setIsMeetingStart(true);
    } else {
      setIsMeetingStart(false);
    }
  }, [meetingResponse]);

  const handleCloseMeeting = useCallback(() => {
    if (meetingId) {
      endMeet(meetingId, {
        onSuccess: () => {
          setIsMeetingStart(false);
        },
      });
    }
  }, [endMeet, meetingId]);

  const handleTabTimesUpdate = (data: {
    defaultTimes: Record<string, number>;
    spentTimes: Record<string, number>;
  }) => {
    latestTimesRef.current = data;
  };

  // Log only when End Meeting is clicked
  const handleCloseMeetingWithLog = () => {
    handleCloseMeeting();

    const { spentTimes } = latestTimesRef.current;

    // Prepare the payload for updateTime
    const payload = {
      meetingId: meetingData?.data.meetingId || "",
      agendaTimeActual: String(spentTimes.agenda ?? 0),
      discussionTaskTimeActual: String(spentTimes.tasks ?? 0),
      discussionProjectTimeActual: String(spentTimes.project ?? 0),
      discussionKPITimeActual: String(spentTimes.kpis ?? 0),
    };

    updateTime(payload);
  };

  return {
    meetingData,
    handleStartMeeting,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    failureReason: (failureReason as any)?.response?.data ?? failureReason,
    meetingResponse,
    handleCloseMeeting,
    isMeetingStart,
    userId,
    handleTabTimesUpdate,
    handleCloseMeetingWithLog,
    meetingTiming,
  };
}
