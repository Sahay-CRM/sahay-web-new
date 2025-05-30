import { useCallback, useState } from "react";
import { createSearchParams, useNavigate } from "react-router-dom";

export default function useAdminUser() {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalData, setModalData] = useState<RolePermission>(
    {} as RolePermission,
  );
  const [currentStatus, setCurrentStatus] = useState<number>(1); // Add state for currentStatus
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isImport, setIsImport] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [meetingData, setUser] = useState({
    success: true,
    status: 200,
    message: "Important dates fetched successfully.",
    currentPage: 1,
    totalCount: 3,
    hasMore: false,
    pageSize: 10,
    totalPage: 1,
    sortBy: "importantDateName",
    sortOrder: "asc",
    data: [
      {
        employeeId: "02d5cbb0-4ab9-452d-aec2-f886b3fbe608",
        employeeName: "Parth Gadhiya",
        employeeEmail: "parth@sahay.group",
        employeeMobile: "+919601017974",
        companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
        employeeType: "EMPLOYEE",
        departmentId: "d8236e26-7685-4b2c-b3a3-d8e39e3dbabd",
        designationId: "443398d5-80ea-4676-8e86-7275acb79c10",
        isSuperAdmin: false,
        sahayEmId: null,
        reportingManagerId: "02afc708-d586-4584-b729-aa320adb78d5",
        company: {
          companyAdminName: "Rahul",
          companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
        },
        reportingManager: {
          employeeEmail: "support@userex.in",
          employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
          employeeName: "Pritesh",
        },
        departmentName: "Human Resource",
        designationName: "Des",
      },
      {
        employeeId: "1330babc-5dfa-46e3-b66b-62c9c7f0a9ef",
        employeeName: "testemp",
        employeeEmail: "test@test.com",
        employeeMobile: "+919725163577",
        companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
        employeeType: "EMPLOYEE",
        departmentId: "85afb5dd-6d19-4d96-990e-711a7bccfda8",
        designationId: "443398d5-80ea-4676-8e86-7275acb79c10",
        isSuperAdmin: false,
        sahayEmId: null,
        reportingManagerId: "02afc708-d586-4584-b729-aa320adb78d5",
        company: {
          companyAdminName: "Rahul",
          companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
        },
        reportingManager: {
          employeeEmail: "support@userex.in",
          employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
          employeeName: "Pritesh",
        },
        departmentName: "Marketing",
        designationName: "Des",
      },
      {
        employeeId: "d2a87068-abb7-45b3-bf69-d6fc426cc827",
        employeeName: "Rushiraj Patel",
        employeeEmail: "rushiraj@sahay.group",
        employeeMobile: "+919687655143",
        companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
        employeeType: "CONSULTANT",
        departmentId: null,
        designationId: null,
        isSuperAdmin: false,
        sahayEmId: "464ef41f-3044-4e97-a637-7b3531bb525a",
        reportingManagerId: null,
        company: {
          companyAdminName: "Rahul",
          companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
        },
        reportingManager: null,
        departmentName: null,
        designationName: null,
      },
      {
        employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
        employeeName: "Pritesh",
        employeeEmail: "support@userex.in",
        employeeMobile: "+917600204057",
        companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
        employeeType: "CONSULTANT",
        departmentId: null,
        designationId: null,
        isSuperAdmin: true,
        sahayEmId: "d75087b1-185e-48ae-9890-a471d8ec30be",
        reportingManagerId: null,
        company: {
          companyAdminName: "Rahul",
          companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
        },
        reportingManager: null,
        departmentName: null,
        designationName: null,
      },
      {
        employeeId: "564d96db-8ccb-471c-9626-3880a168abc6",
        employeeName: "Jay Joshi",
        employeeEmail: "jay@userex.in",
        employeeMobile: "+919725163588",
        companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
        employeeType: "EMPLOYEE",
        departmentId: null,
        designationId: null,
        isSuperAdmin: false,
        sahayEmId: null,
        reportingManagerId: null,
        company: {
          companyAdminName: "Rahul",
          companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
        },
        reportingManager: null,
        departmentName: null,
        designationName: null,
      },
      {
        employeeId: "b905d20e-587d-4917-81ed-bd59f208d8cd",
        employeeName: "Chaitanya Joshi",
        employeeEmail: "chaitanya@sahay.group",
        employeeMobile: "+919727125857",
        companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
        employeeType: "EMPLOYEE",
        departmentId: null,
        designationId: null,
        isSuperAdmin: false,
        sahayEmId: null,
        reportingManagerId: null,
        company: {
          companyAdminName: "Rahul",
          companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
        },
        reportingManager: null,
        departmentName: null,
        designationName: null,
      },
      {
        employeeId: "bf8d3f0e-5c3e-414d-b834-6df3c6044a76",
        employeeName: "Vipul Rajgor",
        employeeEmail: "vipul@sahay.group",
        employeeMobile: "+917202863098",
        companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
        employeeType: "EMPLOYEE",
        departmentId: null,
        designationId: null,
        isSuperAdmin: false,
        sahayEmId: null,
        reportingManagerId: null,
        company: {
          companyAdminName: "Rahul",
          companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
        },
        reportingManager: null,
        departmentName: null,
        designationName: null,
      },
      {
        employeeId: "4b096369-dedc-4616-a3aa-51cb398f566a",
        employeeName: "pr",
        employeeEmail: "pr@admin.com",
        employeeMobile: "+919510388442",
        companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
        employeeType: "EMPLOYEE",
        departmentId: "85afb5dd-6d19-4d96-990e-711a7bccfda8",
        designationId: "443398d5-80ea-4676-8e86-7275acb79c10",
        isSuperAdmin: false,
        sahayEmId: null,
        reportingManagerId: "02afc708-d586-4584-b729-aa320adb78d5",
        company: {
          companyAdminName: "Rahul",
          companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
        },
        reportingManager: {
          employeeEmail: "support@userex.in",
          employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
          employeeName: "Pritesh",
        },
        departmentName: "Marketing",
        designationName: "Des",
      },
      {
        employeeId: "bc1b2738-3319-4ac4-aaad-72ddca128cb1",
        employeeName: "Rahul",
        employeeEmail: "rahul@userex.in",
        employeeMobile: "+918866826313",
        companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
        employeeType: "COMPANYADMIN",
        departmentId: null,
        designationId: null,
        isSuperAdmin: false,
        sahayEmId: null,
        reportingManagerId: null,
        company: {
          companyAdminName: "Rahul",
          companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
        },
        reportingManager: null,
        departmentName: null,
        designationName: null,
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
    setModalData(modalData); // or undefined
    setIsUserModalOpen(true);
  };

  const openModal = useCallback((data: RolePermission) => {
    setModalData(data); // Set the data for the modal
    setIsUserModalOpen(true);
  }, []);

  const closeDeleteModal = (): void => {
    setModalData(modalData); // Clear modal data
    setIsUserModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsChildData("");
  };

  const onDelete = useCallback((data: RolePermission) => {
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
  const navigate = useNavigate();

  interface EmployeeItem {
    employeeId: string;
    employeeName: string;
    employeeEmail: string;
    employeeMobile: string;
    companyId: string;
    employeeType: string;
    departmentId: string | null;
    designationId: string | null;
    isSuperAdmin: boolean;
    departmentName?: string | null;
    designationName?: string | null;
  }

  const onPermissionButton = (item: EmployeeItem) => {
    // Prepare static data or use item as needed
    const searchParams: Record<string, string> = {
      employeeId: item.employeeId,
      employeeName: item.employeeName,
      departmentName: item.departmentName || "",
      designationName: item.designationName || "",
      // add more fields as needed
    };

    navigate({
      pathname: "/dashboard/roles/userpermissionlist/edit",
      search: createSearchParams(searchParams).toString(),
    });
  };

  return {
    // isLoading,
    meetingData,
    closeDeleteModal,
    onPermissionButton,
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
