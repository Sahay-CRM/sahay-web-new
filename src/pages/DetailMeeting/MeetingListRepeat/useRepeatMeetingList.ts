import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { DateRange } from "react-day-picker";

import { useGetAllTaskStatus } from "@/features/api/companyTask";
import { getUserPermission } from "@/features/selectors/auth.selector";
import {
  addUpdateRepeatMeetingMutation,
  deleteRepeatMeetingMutation,
  useGetRepeatMeeting,
} from "@/features/api/RepeatMeetingApi";
import { toLocalISOString } from "@/pages/Meeting/useMeeting";

export default function useRepeatMeetingList() {
  const permission = useSelector(getUserPermission).LIVE_MEETING_TEMPLATES;

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalData, setModalData] = useState<RepeatMeeting>(
    {} as RepeatMeeting,
  );
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isImport, setIsImport] = useState(false);
  const [isChildData, setIsChildData] = useState<string | undefined>();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewModalData, setViewModalData] = useState<RepeatMeeting>(
    {} as RepeatMeeting,
  );

  const today = new Date();
  const before14 = new Date(today);
  before14.setDate(today.getDate() - 14);
  const after14 = new Date(today);
  after14.setDate(today.getDate() + 14);

  const { mutate: updateRepeatMeeting } = addUpdateRepeatMeetingMutation();
  const { mutate: deleteRepeatMeeting } = deleteRepeatMeetingMutation();

  // Pagination Details and Filter
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });
  const [taskDateRange, setTaskDateRange] = useState<{
    taskStartDate: Date | undefined;
    taskDeadline: Date | undefined;
  }>({
    taskStartDate: before14,
    taskDeadline: after14,
  });
  const [appliedDateRange, setAppliedDateRange] = useState<{
    taskStartDate: Date | undefined;
    taskDeadline: Date | undefined;
  }>({
    taskStartDate: before14,
    taskDeadline: after14,
  });

  const { data: repeatMeetingData, isLoading } = useGetRepeatMeeting({
    filter: {
      ...paginationFilter,
      startDate: toLocalISOString(appliedDateRange.taskStartDate),
      endDate: toLocalISOString(appliedDateRange.taskDeadline),
    },
  });

  const { data: taskStatus } = useGetAllTaskStatus({
    filter: {},
  });

  const handleAdd = () => {
    setModalData({
      meetingName: "",
      meetingDescription: "",
      meetingDateTime: "",
      meetingTypeId: "",
      repetitiveMeetingId: "",
    });
    setIsUserModalOpen(true);
  };

  const openModal = useCallback((data: RepeatMeeting) => {
    setModalData(data);
    setIsUserModalOpen(true);
  }, []);

  const closeDeleteModal = (): void => {
    setModalData({
      meetingName: "",
      meetingDescription: "",
      meetingDateTime: "",
      meetingTypeId: "",
      repetitiveMeetingId: "",
    });
    setIsUserModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsChildData("");
  };

  const onDelete = useCallback((data: RepeatMeeting) => {
    setIsDeleteModalOpen(true);
    setModalData(data);
    setIsUserModalOpen(false);
    setIsChildData("");
  }, []);

  const conformDelete = (isGroupDelete: boolean) => {
    if (!modalData?.repetitiveMeetingId) {
      return;
    }
    const payload = {
      repetitiveMeetingId: modalData.repetitiveMeetingId,
      groupDelete: isGroupDelete,
    };

    deleteRepeatMeeting(payload);
    closeDeleteModal();
  };

  const openImportModal = useCallback(() => {
    setIsImportExportModalOpen(true);
    setIsImport(true);
  }, []);
  const openExportModal = useCallback(() => {
    setIsImportExportModalOpen(true);
    setIsImport(false);
  }, []);

  const handleRowsModalOpen = (data: RepeatMeeting) => {
    setViewModalData(data);
    setIsViewModalOpen(true);
  };

  const handleStopRepeat = (data: RepeatMeeting) => {
    const payload = {
      isActive: !data.isActive,
      repetitiveMeetingId: data.repetitiveMeetingId,
    };
    updateRepeatMeeting(payload);
  };

  const handleDateRangeChange: HandleDateRangeChange = (range) => {
    // Update taskDateRange for preview
    if (range?.from && !range?.to) {
      const newTaskDateRange = {
        taskStartDate: range.from,
        taskDeadline: range.from,
      };
      setTaskDateRange(newTaskDateRange);
    } else if (range?.from && range?.to) {
      const newTaskDateRange = {
        taskStartDate: range.from,
        taskDeadline: range.to,
      };
      setTaskDateRange(newTaskDateRange);
    } else {
      const newTaskDateRange = {
        taskStartDate: undefined,
        taskDeadline: undefined,
      };
      setTaskDateRange(newTaskDateRange);
    }
  };

  const handleDateRangeApply = (range: DateRange | undefined) => {
    // This is called when Apply button is clicked
    if (range?.from && !range?.to) {
      const newTaskDateRange = {
        taskStartDate: range.from,
        taskDeadline: range.from,
      };
      setTaskDateRange(newTaskDateRange);
      setAppliedDateRange(newTaskDateRange);
    } else if (range?.from && range?.to) {
      const newTaskDateRange = {
        taskStartDate: range.from,
        taskDeadline: range.to,
      };
      setTaskDateRange(newTaskDateRange);
      setAppliedDateRange(newTaskDateRange);
    } else {
      const newTaskDateRange = {
        taskStartDate: undefined,
        taskDeadline: undefined,
      };
      setTaskDateRange(newTaskDateRange);
      setAppliedDateRange(newTaskDateRange);
    }

    // Reset pagination to first page
    setPaginationFilter((prev) => ({
      ...prev,
      currentPage: 1,
    }));
  };

  return {
    repeatMeetingData,
    closeDeleteModal,
    setPaginationFilter,
    openModal,
    onDelete,
    modalData,
    conformDelete,
    handleAdd,
    paginationFilter,
    isUserModalOpen,
    openImportModal,
    openExportModal,
    isImportExportModalOpen,
    isImport,
    isDeleteModalOpen,
    setIsImportExportModalOpen,
    isChildData,
    permission,
    handleRowsModalOpen,
    isViewModalOpen,
    setIsViewModalOpen,
    viewModalData,
    isLoading,
    taskStatus,
    handleStopRepeat,
    taskDateRange,
    handleDateRangeApply,
    handleDateRangeChange,
  };
}
