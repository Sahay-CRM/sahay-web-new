import { useDeleteCompanyMeeting } from "@/features/api/companyMeeting";
import useGetCompanyMeeting from "@/features/api/companyMeeting/useGetCompanyMeeting";
import { useAddUpdateCompanyMeetingStatus } from "@/features/api/companyMeeting/useAddUpdateCompanyMeetingStatus";
import { useDdMeetingStatus } from "@/features/api/meetingStatus";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";

export default function useAdminUser() {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalData, setModalData] = useState<MeetingData>({} as MeetingData);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isImport, setIsImport] = useState(false);
  const [isChildData, setIsChildData] = useState<string | undefined>();

  // Add state for view modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewModalData, setViewModalData] = useState<MeetingData>(
    {} as MeetingData,
  );

  const [filters, setFilters] = useState<{ selected?: string[] }>({});

  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 10,
    search: "",
  });
  const permission = useSelector(getUserPermission).MEETING_LIST;
  const { data: meetingData } = useGetCompanyMeeting({
    filter: { ...paginationFilter, statusArray: filters.selected },
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

  const statusOptions = meetingStatus?.map((item) => ({
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
  const handleStatusChange = (meetingStatusId: string, row: MeetingData) => {
    if (!row?.meetingId) return;
    updateMeetingStatus({
      meetingId: row.meetingId,
      meetingStatusId,
    });
  };

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
    handleStatusChange, // <-- add this to return
  };
}
