import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { addUpdateIssues } from "@/features/api/Issues";
import { addUpdateObjective } from "@/features/api/Objective";
import { queryClient } from "@/queryClient";
import useGetMeetingConclusion from "@/features/api/detailMeeting/useGetMeetingConclusion";
import {
  addUpdateRepeatMeetingMutation,
  createIoRepeatMeetingMutation,
  createRepeatIoMutation,
  deleteRepeatMeetingIOMutation,
  useDdRepeatMeetingIo,
  useGetRepeatMeetingIo,
} from "@/features/api/RepeatMeetingApi";

interface UseAgendaProps {
  meetingStatus?: string;
  meetingResponse?: MeetingResFire | null;
  canEdit: boolean;
}

export const useDetailRepeatMeeting = ({
  meetingStatus,
  meetingResponse,
  canEdit,
}: UseAgendaProps) => {
  const { id: repetitiveMeetingId } = useParams();

  const [issueInput, setIssueInput] = useState("");
  const [editing, setEditing] = useState<{
    type: "ISSUE" | "OBJECTIVE" | null;
    issueId: string | null;
    objectiveId: string | null;
    value: string;
    plannedMinutes: string;
    plannedSeconds: string;
    issueObjectiveId: string;
  }>({
    type: null,
    issueId: null,
    objectiveId: null,
    value: "",
    plannedMinutes: "",
    plannedSeconds: "",
    issueObjectiveId: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIssue, setModalIssue] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  // const [agendaList, setAgendaList] = useState<MeetingAgenda[]>([]);
  // const [isSelectedAgenda, setIsSelectedAgenda] = useState<string>();
  const [isSideBar, setIsSideBar] = useState(false);

  const [debouncedInput, setDebouncedInput] = useState(issueInput);
  const [resolutionFilter, setResolutionFilter] = useState<
    "unsolved" | "solved"
  >("unsolved");

  // useEffect(() => {
  //   if (meetingResponse) {
  //     setIsSelectedAgenda(meetingResponse.state.currentAgendaItemId);
  //   }
  // }, [meetingResponse]);

  // API hooks
  const { data: agendaList } = useGetRepeatMeetingIo({
    filter: {
      repetitiveMeetingId: repetitiveMeetingId,
      isResolved: resolutionFilter === "solved" ? true : false,
    },
    enable: !!repetitiveMeetingId,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedInput(issueInput);
    }, 500); // 500ms delay after typing stops

    return () => {
      clearTimeout(handler);
    };
  }, [issueInput]);

  const shouldFetch = debouncedInput.length >= 3;

  const { data: issueData } = useDdRepeatMeetingIo({
    filter: {
      search: issueInput,
      repetitiveMeetingId: repetitiveMeetingId,
    },
    enable: !!shouldFetch && !!repetitiveMeetingId,
  });

  const isConclusion =
    meetingResponse?.state.activeTab === "CONCLUSION" ||
    meetingStatus === "ENDED";

  const { data: conclusionData } = useGetMeetingConclusion({
    filter: {
      meetingId: repetitiveMeetingId,
    },
    enable: !!repetitiveMeetingId && !!isConclusion,
  });

  // Mutations
  const { mutate: deleteObjective } = deleteRepeatMeetingIOMutation();
  const { mutate: addIssue } = addUpdateIssues();
  const { mutate: addObjective } = addUpdateObjective();
  const { mutate: ioCreate } = createRepeatIoMutation();
  const { mutate: newIoCreate } = createIoRepeatMeetingMutation();
  const { mutate: updateRepeatMeeting } = addUpdateRepeatMeetingMutation();

  // useEffect(() => {
  //   setAgendaList(selectedAgenda || []);
  // }, [dispatch, selectedAgenda]);

  useEffect(() => {
    if (meetingStatus === "STARTED" || meetingStatus === "NOT_STARTED") {
      setIsSideBar(false);
    } else {
      setIsSideBar(true);
    }
  }, [meetingStatus]);

  useEffect(() => {
    if (meetingResponse?.state.lastSwitchTimestamp) {
      const interval = setInterval(() => {
        // const now = Date.now();
        // setElapsed(now - Number(meetingResponse.state.lastSwitchTimestamp));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [meetingResponse?.state.lastSwitchTimestamp]);

  const startEdit = (
    type: "ISSUE" | "OBJECTIVE",
    issueId: string | null,
    objectiveId: string | null,
    value: string,
    plannedTime: string | number | null | undefined,
    issueObjectiveId: string,
  ) => {
    if (!canEdit) return;
    const totalSeconds = plannedTime
      ? parseInt(String(plannedTime), 10) || 0
      : 0;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    setEditing({
      type,
      issueId,
      objectiveId,
      value,
      plannedMinutes: String(minutes),
      plannedSeconds: String(seconds),
      issueObjectiveId,
    });
  };

  const setEditingValue = (value: string) => {
    setEditing((prev) => ({ ...prev, value }));
  };

  const cancelEdit = () => {
    setEditing({
      type: null,
      objectiveId: null,
      issueId: null,
      value: "",
      plannedMinutes: "",
      plannedSeconds: "",
      issueObjectiveId: "",
    });
  };

  const handleAddIssue = () => {
    setModalIssue(issueInput);
    setModalOpen(true);
    setDropdownVisible(false);
  };

  const updateEdit = () => {
    if (!canEdit) return;
    if (!editing.type || !repetitiveMeetingId) return;

    if (editing.type === "ISSUE" && editing.issueId) {
      addIssue(
        {
          issueId: editing.issueId,
          issueName: editing.value,
        },
        {
          onSuccess: () => {
            queryClient.resetQueries({
              queryKey: ["get-detail-meeting-agenda-issue-obj"],
            });
            cancelEdit();
          },
        },
      );
    } else if (editing.type === "OBJECTIVE" && editing.objectiveId) {
      addObjective(
        {
          objectiveId: editing.objectiveId,
          objectiveName: editing.value,
        },
        {
          onSuccess: () => {
            queryClient.resetQueries({
              queryKey: ["get-detail-meeting-agenda-issue-obj"],
            });
            cancelEdit();
          },
        },
      );
    }
  };

  const handleDelete = (item: MeetingAgenda) => {
    if (item && item.issueObjectiveId) {
      const payload = {
        ioType: item.ioType,
        issueObjectiveId: item.issueObjectiveId,
        repetitiveMeetingId: repetitiveMeetingId,
      };

      deleteObjective(payload);
    }
  };

  const filteredIssues = (issueData?.data ?? []).filter(
    (item) =>
      item.name.toLowerCase().includes(issueInput.toLowerCase()) &&
      issueInput.trim() !== "",
  );

  const searchOptions = (issueData?.data ?? []).map((item) => ({
    name: item.name,
    id: item.id,
    ioType: item.ioType,
  }));

  const handleUpdateSelectedObjective = async (
    data: DetailMeetingObjectives,
  ) => {
    if (repetitiveMeetingId) {
      const payload = {
        repetitiveMeetingId: repetitiveMeetingId,
        id: data.id,
        ioType: data.ioType,
      };
      ioCreate(payload);
    }
  };

  const handleModalSubmit = (data: { type: string; value: string }) => {
    if (repetitiveMeetingId) {
      const payload = {
        repetitiveMeetingId: repetitiveMeetingId,
        name: data.value,
        ioType: data.type,
      };
      newIoCreate(payload, {
        onSuccess: () => {
          queryClient.resetQueries({
            queryKey: ["get-detail-meeting-agenda-issue-obj"],
          });
          setModalOpen(false);
        },
      });
    }
  };
  const [isUpdatingTime, setIsUpdatingTime] = useState(false);

  const handleTimeUpdate = async (newTime: number) => {
    if (!repetitiveMeetingId) return;

    setIsUpdatingTime(true);

    try {
      await new Promise((resolve, reject) => {
        updateRepeatMeeting(
          {
            repetitiveMeetingId: repetitiveMeetingId,
            meetingTimePlanned: String(newTime),
          },
          {
            onSuccess: () => {
              // Invalidate and refetch queries
              queryClient.invalidateQueries({
                queryKey: ["get-meeting-details-timing"],
              });
              resolve(undefined);
            },
            onError: reject,
          },
        );
      });
      // eslint-disable-next-line no-useless-catch
    } catch (error) {
      throw error; // Re-throw to let the component handle it
    } finally {
      setIsUpdatingTime(false);
    }
  };

  return {
    issueInput,
    editing,
    modalOpen,
    modalIssue,
    dropdownVisible,
    agendaList,
    isSideBar,
    filteredIssues,
    searchOptions,
    setIssueInput,
    setEditingValue,
    setModalOpen,
    setModalIssue,
    setDropdownVisible,
    handleAddIssue,
    startEdit,
    cancelEdit,
    updateEdit,
    handleDelete,
    handleUpdateSelectedObjective,
    handleModalSubmit,
    handleTimeUpdate,
    conclusionData,
    // handleAddAgendaModal,
    isUpdatingTime,
    setResolutionFilter,
  };
};
