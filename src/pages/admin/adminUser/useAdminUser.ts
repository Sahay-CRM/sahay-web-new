import { useCallback, useState } from "react";

export default function useAdminUser() {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [modalData, setModalData] = useState<UserData | undefined>();
  const [currentStatus, setCurrentStatus] = useState<number>(1); // Add state for currentStatus
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isImport, setIsImport] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [user, setUser] = useState({
    success: true,
    status: 200,
    message: "ent Users Fetched",
    currentPage: 1,
    totalCount: 3,
    hasMore: false,
    pageSize: 10,
    totalPage: 1,
    sortBy: "userFirstName",
    sortOrder: "asc",
    data: [
      {
        userId: "b457786d-b015-42b6-9372-8b52cc3cf446",
        userPrefixId: "c2c9a95a-3d5d-432e-9946-c200db18183a",
        localityId: "ddadf5bd-fce9-4f3c-9f4c-cfad73a8a862",
        designationId: "e321f96b-bcbb-43fb-ac84-6808cb6b69d2",
        userFirstName: "Admin",
        userLastName: "User",
        userMobileNumber: "7600204057",
        userEmail: "support@userex.in",
        userAddress: "456",
        aboutMe: "asd",
        userRd1: "12345678912",
        userRd2: "12345678912",
        userRd3: "12345678912",
        userRd4: "12345678912",
        emergencyContactName: "jay",
        emergencyContactNumber: "9725163588",
        isSuperAdmin: true,
        status: 1,
        designationName: "BDM New",
        departmentId: "9be2fb3c-b148-4b45-8e52-d8e2b3acbc9a",
        departmentName: "Business Development",
        localityName: "Thaltej New",
        zipcode: "380052",
        cityId: "5d9042b4-d5e4-4d7d-9094-ce6a2285df05",
        cityName: "Ahmedabad",
      },
      {
        userId: "45870d8e-8ad7-44fa-bd5d-40f7d023f7a8",
        userPrefixId: null,
        localityId: "ddadf5bd-fce9-4f3c-9f4c-cfad73a8a862",
        designationId: "4b7db687-33ea-4752-b9c9-17974980857f",
        userFirstName: "Jay",
        userLastName: "Joshi",
        userMobileNumber: "9725163588",
        userEmail: "jay@userex.in",
        userAddress: "gota",
        aboutMe: null,
        userRd1: null,
        userRd2: null,
        userRd3: null,
        userRd4: null,
        emergencyContactName: null,
        emergencyContactNumber: null,
        isSuperAdmin: false,
        status: 1,
        designationName: "CTO",
        departmentId: "9be2fb3c-b148-4b45-8e52-d8e2b3acbc9a",
        departmentName: "Business Development",
        localityName: "Thaltej New",
        zipcode: "380052",
        cityId: "5d9042b4-d5e4-4d7d-9094-ce6a2285df05",
        cityName: "Ahmedabad",
      },
      {
        userId: "5e408512-aead-4738-a659-eeceb5284d0a",
        userPrefixId: null,
        localityId: "ddadf5bd-fce9-4f3c-9f4c-cfad73a8a862",
        designationId: "e321f96b-bcbb-43fb-ac84-6808cb6b69d2",
        userFirstName: "Pritesh",
        userLastName: "Sanghani",
        userMobileNumber: "9510388442",
        userEmail: "support@userex.in",
        userAddress: null,
        aboutMe: null,
        userRd1: null,
        userRd2: null,
        userRd3: null,
        userRd4: null,
        emergencyContactName: null,
        emergencyContactNumber: null,
        isSuperAdmin: false,
        status: 1,
        designationName: "BDM New",
        departmentId: "9be2fb3c-b148-4b45-8e52-d8e2b3acbc9a",
        departmentName: "Business Development",
        localityName: "Thaltej New",
        zipcode: "380052",
        cityId: "5d9042b4-d5e4-4d7d-9094-ce6a2285df05",
        cityName: "Ahmedabad",
      },
    ],
  });

  const [isChildData, setIsChildData] = useState<string | undefined>();

  // Pagination Details and Filter
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 10,
    search: "",
    status: currentStatus, // Use currentStatus state
  });

  //   const { data: user, isLoading } = useGetUser({
  //     filter: paginationFilter,
  //   });isLoading

  const onStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = Number(event.target.value);
    setCurrentStatus(newStatus); // Update currentStatus state

    // Update pagination filter to include the selected status
    setPaginationFilter((prevFilter) => ({
      ...prevFilter,
      status: newStatus,
      currentPage: 1, // Reset to the first page
    }));
  };

  // Ensure currentStatus is passed when updating the pagination filter
  const setPaginationFilterWithStatus = (filter: PaginationFilter) => {
    setPaginationFilter({
      ...filter,
      status: currentStatus, // Always include the currentStatus
    });
  };

  const openModal = useCallback((data: UserData) => {
    setIsUserModalOpen(true);
    setModalData(data); // Set the data for the modal
  }, []);

  const closeDeleteModal = (): void => {
    setModalData(undefined); // Clear modal data
    setIsUserModalOpen(false);
    setIsChildData("");
  };

  const onDelete = useCallback((data: UserData) => {
    setModalData(data);
    setIsUserModalOpen(true);
    setIsChildData("");
  }, []);

  const conformDelete = async () => {};

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
    user,
    closeDeleteModal,
    setPaginationFilter: setPaginationFilterWithStatus, // Use the updated function
    onStatusChange,
    currentStatus, // Return currentStatus state
    openModal,
    onDelete,
    modalData,
    conformDelete,
    // Removed 'control' as it is not declared or initialized
    paginationFilter,
    isUserModalOpen,
    openImportModal,
    openExportModal,
    isImportExportModalOpen,
    isImport,
    setIsImportExportModalOpen,
    isChildData,
  };
}
