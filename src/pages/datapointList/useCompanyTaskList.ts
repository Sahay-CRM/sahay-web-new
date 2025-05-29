import { useCallback, useState } from "react";

export default function useAdminUser() {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalData, setModalData] = useState<TaskListData>({} as TaskListData);
  const [currentStatus, setCurrentStatus] = useState<number>(1); // Add state for currentStatus
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isImport, setIsImport] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [designationData, setUser] = useState({
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
        isSuperAdmin: false,
        dataPointId: "3e5b9ec5-31a5-4350-9e06-62999ea345e0",
        dataPointName: "Test",
        dataPointLabel: "test",
        KPIMasterId: "a95412a8-74ec-4061-883d-c7a4c9535bcd",
        KPIMaster: {
          KPIName: "Test",
          KPILabel: "test",
        },
        validationType: "EQUAL_TO",
        frequencyType: "WEEKLY",
        selectedType: "COMPANY",
        dataPointEmployeeJunction: [
          {
            dataPointEmpId: "e81a1612-fefb-44d5-bf48-339e2ad45188",
            employeeId: "02d5cbb0-4ab9-452d-aec2-f886b3fbe608",
            value1: 5,
            value2: 0,
            employeeName: "Parth Gadhiya",
          },
        ],
      },
      {
        dataPointId: "bee1d7ee-799d-4546-ba58-d7e29599131e",
        dataPointName: "Sales",
        dataPointLabel: "Sales (In Lakhs)",
        KPIMasterId: "d3a4fd07-32e7-468c-8993-43d2aaa57f1d",
        KPIMaster: {
          KPIName: "Sales",
          KPILabel: "Sales (In Lakhs)",
        },
        validationType: "EQUAL_TO",
        frequencyType: "DAILY",
        selectedType: "COMPANY",
        dataPointEmployeeJunction: [
          {
            dataPointEmpId: "2856cdb0-13ad-4e72-92cd-08aa1ac25482",
            employeeId: "564d96db-8ccb-471c-9626-3880a168abc6",
            value1: 10,
            value2: 0,
            employeeName: "Jay Joshi",
          },
        ],
      },
      {
        dataPointId: "2203961f-b2c5-43d7-aefa-1056cee82187",
        dataPointName: "Net Profit",
        dataPointLabel: "Net Profit (in Lakhs)",
        KPIMasterId: "0f86d60c-e202-4b29-9c35-71c71b446a68",
        KPIMaster: {
          KPIName: "Net Profit",
          KPILabel: "Net Profit (in Lakhs)",
        },
        validationType: "YES_NO",
        frequencyType: "DAILY",
        selectedType: "COMPANY",
        dataPointEmployeeJunction: [
          {
            dataPointEmpId: "bc27b6a7-0e19-40db-a790-7324c2620f2f",
            employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
            value1: 1,
            value2: null,
            employeeName: "Pritesh",
          },
        ],
      },
      {
        dataPointId: "a51236b6-d91d-4eea-a451-7b53622f0cff",
        dataPointName: "KPI for IT",
        dataPointLabel: "KPI for IT",
        KPIMasterId: "2a537333-38fb-4298-87dd-5e4e45e9c0bb",
        KPIMaster: {
          KPIName: "KPI for IT",
          KPILabel: "KPI for IT",
        },
        validationType: "EQUAL_TO",
        frequencyType: "YEARLY",
        selectedType: "INDIVIDUAL",
        dataPointEmployeeJunction: [
          {
            dataPointEmpId: "ab851758-b247-45d6-865b-3083afe2fa27",
            employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
            value1: 2,
            value2: 0,
            employeeName: "Pritesh",
          },
          {
            dataPointEmpId: "73ffadc7-c87e-4de3-a67d-53cdcc0c5d24",
            employeeId: "02d5cbb0-4ab9-452d-aec2-f886b3fbe608",
            value1: 6,
            value2: 0,
            employeeName: "Parth Gadhiya",
          },
          {
            dataPointEmpId: "bca1cba3-442e-45c5-8141-de8e05c80499",
            employeeId: "bc1b2738-3319-4ac4-aaad-72ddca128cb1",
            value1: 50,
            value2: 0,
            employeeName: "Rahul",
          },
          {
            dataPointEmpId: "097814c0-9b1a-4670-a7cc-21ba9f415a39",
            employeeId: "1330babc-5dfa-46e3-b66b-62c9c7f0a9ef",
            value1: 11,
            value2: 0,
            employeeName: "testemp",
          },
        ],
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
  const handleAdd = () => {
    setModalData(null); // or undefined
    setIsUserModalOpen(true);
  };

  const openModal = useCallback((data: UserData) => {
    setModalData(data); // Set the data for the modal
    setIsUserModalOpen(true);
  }, []);

  const closeDeleteModal = (): void => {
    setModalData(undefined); // Clear modal data
    setIsUserModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsChildData("");
  };

  const onDelete = useCallback((data: UserData) => {
    setIsDeleteModalOpen(true);
    setModalData(data);
    setIsUserModalOpen(false);
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
    designationData,
    closeDeleteModal,
    setPaginationFilter: setPaginationFilterWithStatus, // Use the updated function
    onStatusChange,
    currentStatus, // Return currentStatus state
    openModal,
    onDelete,
    modalData,
    conformDelete,
    handleAdd,
    // Removed 'control' as it is not declared or initialized
    paginationFilter,
    isUserModalOpen,
    openImportModal,
    openExportModal,
    isImportExportModalOpen,
    isImport,
    isDeleteModalOpen,
    setIsImportExportModalOpen,
    isChildData,
  };
}
