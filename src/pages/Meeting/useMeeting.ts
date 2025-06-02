import { useDeleteCompanyMeeting } from "@/features/api/companyMeeting";
import useGetCompanyMeeting from "@/features/api/companyMeeting/useGetCompanyMeeting";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";

export default function useAdminUser() {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalData, setModalData] = useState<MeetingData>({} as MeetingData);
  const [currentStatus, setCurrentStatus] = useState<number>(1); // Add state for currentStatus
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isImport, setIsImport] = useState(false);
  const [isChildData, setIsChildData] = useState<string | undefined>();
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 10,
    search: "",
    status: currentStatus, // Use currentStatus state
  });
  const permission = useSelector(getUserPermission).MEETING_LIST;
  const { data: meetingData } = useGetCompanyMeeting({
    filter: paginationFilter,
  });

  const onStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = Number(event.target.value);
    setCurrentStatus(newStatus); // Update currentStatus state

    // Update pagination filter to include the selected status
    setPaginationFilter((prevFilter) => ({
      ...prevFilter,
      status: newStatus,
      currentPage: 1,
    }));
  };
  const { mutate: deleteMeetingById } = useDeleteCompanyMeeting();

  // Ensure currentStatus is passed when updating the pagination filter
  const setPaginationFilterWithStatus = (filter: PaginationFilter) => {
    setPaginationFilter({
      ...filter,
      status: currentStatus, // Always include the currentStatus
    });
  };
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

  return {
    // isLoading,
    meetingData,
    closeDeleteModal,
    setPaginationFilter: setPaginationFilterWithStatus,
    onStatusChange,
    currentStatus,
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
  };
}
