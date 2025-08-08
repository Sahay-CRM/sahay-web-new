import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { DateRange } from "react-day-picker";

import { useDeleteCompanyMeeting } from "@/features/api/companyMeeting";
import useGetCompanyMeeting from "@/features/api/companyMeeting/useGetCompanyMeeting";
import { useAddUpdateCompanyMeetingStatus } from "@/features/api/companyMeeting/useAddUpdateCompanyMeetingStatus";
import { useDdMeetingStatus } from "@/features/api/meetingStatus";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { AxiosError } from "axios";
import { toast } from "sonner";

const toLocalISOString = (date: Date | undefined) => {
  if (!date) return undefined;

  // Use local date methods to avoid timezone conversion
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function useAdminUser() {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalData, setModalData] = useState<MeetingData>({} as MeetingData);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isImport, setIsImport] = useState(false);
  const [isChildData, setIsChildData] = useState<string | undefined>();
  const [showOverdue, setShowOverdue] = useState(false);

  // const [showDetail, setShowDetail] = useState(true);

  // Calculate default 30-day range: 15 days before and after today
  const today = new Date();
  const before14 = new Date(today);
  before14.setDate(today.getDate() - 14);
  const after14 = new Date(today);
  after14.setDate(today.getDate() + 14);

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

  // Add state for view modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewModalData, setViewModalData] = useState<MeetingData>(
    {} as MeetingData,
  );

  const [filters, setFilters] = useState<{ selected?: string[] }>({});

  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });
  const permission = useSelector(getUserPermission).MEETING_LIST;
  const { data: meetingData } = useGetCompanyMeeting({
    filter: {
      ...paginationFilter,
      statusArray: filters.selected,
      ...(showOverdue
        ? {}
        : {
            startDate: toLocalISOString(appliedDateRange.taskStartDate),
            endDate: toLocalISOString(appliedDateRange.taskDeadline),
          }),
      overDue: showOverdue,
      parentType: "Show All Other",
    },
  });

  const { data: meetingStatus, isLoading } = useDdMeetingStatus();
  const { mutate: deleteMeetingById } = useDeleteCompanyMeeting();
  const { mutate: updateMeetingStatus } = useAddUpdateCompanyMeetingStatus();

  const handleAdd = () => {
    setModalData({
      meetingName: "",
      meetingDescription: "",
      meetingDateTime: "",
      joiners: [],
      meetingId: "",
      meetingStatusId: "",
      meetingTypeId: "",
    });
    setIsUserModalOpen(true);
  };

  const openModal = useCallback((data: MeetingData) => {
    setModalData(data); // Set the data for the modal
    setIsUserModalOpen(true);
  }, []);

  const closeDeleteModal = (): void => {
    setModalData({
      meetingName: "",
      meetingDescription: "",
      meetingDateTime: "",
      joiners: [],
      meetingId: "",
      meetingStatusId: "",
      meetingTypeId: "",
    }); // Clear modal data
    setIsUserModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsChildData("");
  };

  const onDelete = useCallback((data: MeetingData) => {
    setIsDeleteModalOpen(true);
    setModalData(data);
    setIsUserModalOpen(false);
    setIsChildData("");
  }, []);

  const conformDelete = async () => {
    if (modalData && modalData.meetingId) {
      deleteMeetingById(modalData.meetingId, {
        onSuccess: () => {
          closeDeleteModal();
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
    }
  };

  const openImportModal = useCallback(() => {
    setIsImportExportModalOpen(true);
    setIsImport(true);
  }, []);
  const openExportModal = useCallback(() => {
    setIsImportExportModalOpen(true);
    setIsImport(false);
  }, []);

  // Filter status options based on showOverdue and winLostMeeting
  const statusOptions = (meetingStatus ?? [])
    .filter((item) => {
      if (showOverdue) {
        // Exclude items where winLostMeeting is "0" or "1" (string or number)
        return item.winLostMeeting !== 0 && item.winLostMeeting !== 1;
      }
      return true;
    })
    .map((item) => ({
      label: item.meetingStatus,
      value: item.meetingStatusId,
      color: item.color || "#2e3195",
    }));

  const handleFilterChange = (selected: string[]) => {
    setFilters({
      selected,
    });
  };

  const handleRowsModalOpen = (data: MeetingData) => {
    setViewModalData(data);
    setIsViewModalOpen(true);
  };

  // Add handleStatusChange for dropdown
  const handleStatusChange = (data: string, row: string) => {
    if (!row) return;
    updateMeetingStatus({
      meetingId: row,
      meetingStatusId: data,
    });
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

  const handleOverdueToggle = () => {
    const newOverdueState = !showOverdue;
    if (newOverdueState) {
      setTaskDateRange({
        taskStartDate: before14,
        taskDeadline: after14,
      });
      setAppliedDateRange({
        taskStartDate: before14,
        taskDeadline: after14,
      });
    }

    setShowOverdue(newOverdueState);
  };

  // const handleDetailToggle = () => {
  //   setShowDetail((prev) => {
  //     const newValue = !prev;
  //     return newValue;
  //   });
  // };

  return {
    isLoading,
    meetingData,
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
    statusOptions,
    filters,
    handleFilterChange,
    handleRowsModalOpen,
    isViewModalOpen,
    setIsViewModalOpen,
    viewModalData,
    handleStatusChange,
    taskDateRange,
    setTaskDateRange,
    handleDateRangeChange,
    handleDateRangeApply,
    showOverdue,
    handleOverdueToggle,
    // handleDetailToggle,
    // showDetail,
  };
}
