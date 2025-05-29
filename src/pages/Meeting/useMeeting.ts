import { useCallback, useState } from "react";

export default function useAdminUser() {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalData, setModalData] = useState<MeetingData>({} as MeetingData);
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
        meetingId: "00095009-6ed1-4688-830e-98da8bc2c761",
        isSuperAdmin: false,
        meetingName: "Just added",
        meetingDescription: "Just added meeting",
        meetingDateTime: "2025-04-27T17:40:00.000Z",
        companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
        createdBy: "068eeab4-ed89-47f9-bd9d-1e1344bbcd6d",
        meetingTypeId: "a2c3f895-94fd-4eb0-b023-8e78bc2774cb",
        meetingStatusId: "c1c98df6-480b-4dec-8ba6-8f718e96395d",
        meetingType: {
          meetingTypeId: "a2c3f895-94fd-4eb0-b023-8e78bc2774cb",
          meetingTypeName: "Chat",
        },
        companyEmployee: {
          employeeId: "068eeab4-ed89-47f9-bd9d-1e1344bbcd6d",
          employeeName: "Jay Joshi",
          employeeMobile: "+919725163588",
        },
        company: {
          companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
          companyAdminEmail: "rahul@userex.in",
          companyAdminMobile: "+918866826313",
        },
        meetingStatus: {
          meetingStatusId: "c1c98df6-480b-4dec-8ba6-8f718e96395d",
          meetingStatus: "Planned",
        },
        joiners: [
          {
            companyEmployee: {
              employeeName: "Pritesh",
              employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
              employeeMobile: "+917600204057",
            },
          },
        ],
      },
      {
        meetingId: "1158d877-9a2c-4280-881f-eded62d37308",
        meetingName: "Pritesh Meeting",
        meetingDescription: "Pritesh Meeting",
        meetingDateTime: "2025-05-15T00:10:00.000Z",
        companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
        createdBy: "02afc708-d586-4584-b729-aa320adb78d5",
        meetingTypeId: "87627210-9fe7-42b1-ab17-29e2aba9d4cb",
        meetingStatusId: "c1c98df6-480b-4dec-8ba6-8f718e96395d",
        meetingType: {
          meetingTypeId: "87627210-9fe7-42b1-ab17-29e2aba9d4cb",
          meetingTypeName: "Voice Call",
        },
        companyEmployee: {
          employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
          employeeName: "Pritesh",
          employeeMobile: "+917600204057",
        },
        company: {
          companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
          companyAdminEmail: "rahul@userex.in",
          companyAdminMobile: "+918866826313",
        },
        meetingStatus: {
          meetingStatusId: "c1c98df6-480b-4dec-8ba6-8f718e96395d",
          meetingStatus: "Planned",
        },
        joiners: [
          {
            companyEmployee: {
              employeeName: "Pritesh",
              employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
              employeeMobile: "+917600204057",
            },
          },
        ],
      },
      {
        meetingId: "a08ef151-1c0e-47ce-91dd-4a113b3b0144",
        meetingName: "Rushi",
        meetingDescription: "Rushi",
        meetingDateTime: "2025-05-16T00:32:00.000Z",
        companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
        createdBy: "d2a87068-abb7-45b3-bf69-d6fc426cc827",
        meetingTypeId: "a2c3f895-94fd-4eb0-b023-8e78bc2774cb",
        meetingStatusId: "c1c98df6-480b-4dec-8ba6-8f718e96395d",
        meetingType: {
          meetingTypeId: "a2c3f895-94fd-4eb0-b023-8e78bc2774cb",
          meetingTypeName: "Chat",
        },
        companyEmployee: {
          employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
          employeeName: "Pritesh",
          employeeMobile: "+917600204057",
        },
        company: {
          companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
          companyAdminEmail: "rahul@userex.in",
          companyAdminMobile: "+918866826313",
        },
        meetingStatus: {
          meetingStatusId: "c1c98df6-480b-4dec-8ba6-8f718e96395d",
          meetingStatus: "Planned",
        },
        joiners: [
          {
            companyEmployee: {
              employeeName: "Rahul",
              employeeId: "bc1b2738-3319-4ac4-aaad-72ddca128cb1",
              employeeMobile: "+918866826313",
            },
          },
        ],
      },
      {
        meetingId: "6c8352c9-a60f-4929-9f65-d30f28eb5fd4",
        meetingName: "new meeting",
        meetingDescription: "this is test meeting",
        meetingDateTime: "2025-04-25T05:50:00.000Z",
        companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
        createdBy: "068eeab4-ed89-47f9-bd9d-1e1344bbcd6d",
        meetingTypeId: "4be391fb-b214-427d-b6fc-b9f94238f1f5",
        meetingStatusId: "c1c98df6-480b-4dec-8ba6-8f718e96395d",
        meetingType: {
          meetingTypeId: "4be391fb-b214-427d-b6fc-b9f94238f1f5",
          meetingTypeName: "Online",
        },
        companyEmployee: {
          employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
          employeeName: "Pritesh",
          employeeMobile: "+917600204057",
        },
        company: {
          companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
          companyAdminEmail: "rahul@userex.in",
          companyAdminMobile: "+918866826313",
        },
        meetingStatus: {
          meetingStatusId: "c1c98df6-480b-4dec-8ba6-8f718e96395d",
          meetingStatus: "Planned",
        },
        joiners: [
          {
            companyEmployee: {
              employeeName: "Jay Joshi",
              employeeId: "564d96db-8ccb-471c-9626-3880a168abc6",
              employeeMobile: "+919725163588",
            },
          },
        ],
      },
      {
        meetingId: "361e9e75-8d7e-4219-9193-bf41c49ffe85",
        meetingName: "Rushi Meeting",
        meetingDescription: "Rushi Meeting",
        meetingDateTime: "2025-05-15T08:40:00.000Z",
        companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
        createdBy: "02afc708-d586-4584-b729-aa320adb78d5",
        meetingTypeId: "87627210-9fe7-42b1-ab17-29e2aba9d4cb",
        meetingStatusId: "c1c98df6-480b-4dec-8ba6-8f718e96395d",
        meetingType: {
          meetingTypeId: "87627210-9fe7-42b1-ab17-29e2aba9d4cb",
          meetingTypeName: "Voice Call",
        },
        companyEmployee: {
          employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
          employeeName: "Pritesh",
          employeeMobile: "+917600204057",
        },
        company: {
          companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
          companyAdminEmail: "rahul@userex.in",
          companyAdminMobile: "+918866826313",
        },
        meetingStatus: {
          meetingStatusId: "c1c98df6-480b-4dec-8ba6-8f718e96395d",
          meetingStatus: "Planned",
        },
        joiners: [
          {
            companyEmployee: {
              employeeName: "Vipul Rajgor",
              employeeId: "bf8d3f0e-5c3e-414d-b834-6df3c6044a76",
              employeeMobile: "+917202863098",
            },
          },
        ],
      },
      {
        meetingId: "151d6a24-a68b-4e17-966e-566a7fc92f96",
        meetingName: "xyzz",
        meetingDescription: "xyzz",
        meetingDateTime: "2025-05-22T07:37:00.000Z",
        companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
        createdBy: "02afc708-d586-4584-b729-aa320adb78d5",
        meetingTypeId: "87627210-9fe7-42b1-ab17-29e2aba9d4cb",
        meetingStatusId: "c1c98df6-480b-4dec-8ba6-8f718e96395d",
        meetingType: {
          meetingTypeId: "87627210-9fe7-42b1-ab17-29e2aba9d4cb",
          meetingTypeName: "Voice Call",
        },
        companyEmployee: {
          employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
          employeeName: "Pritesh",
          employeeMobile: "+917600204057",
        },
        company: {
          companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
          companyAdminEmail: "rahul@userex.in",
          companyAdminMobile: "+918866826313",
        },
        meetingStatus: {
          meetingStatusId: "c1c98df6-480b-4dec-8ba6-8f718e96395d",
          meetingStatus: "Planned",
        },
        joiners: [
          {
            companyEmployee: {
              employeeName: "Rushiraj Patel",
              employeeId: "d2a87068-abb7-45b3-bf69-d6fc426cc827",
              employeeMobile: "+919687655143",
            },
          },
          {
            companyEmployee: {
              employeeName: "Jay Joshi",
              employeeId: "564d96db-8ccb-471c-9626-3880a168abc6",
              employeeMobile: "+919725163588",
            },
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
    setModalData({
      meetingId: "",
      meetingName: "",
      meetingDescription: "",
      meetingDateTime: "",
      companyId: "",
      createdBy: "",
      meetingTypeId: "",
      meetingStatusId: "",
      meetingType: {
        meetingTypeId: "",
        meetingTypeName: "",
      },
      companyEmployee: {
        employeeId: "",
        employeeName: "",
        employeeMobile: "",
      },
      company: {
        companyId: "",
        companyAdminEmail: "",
        companyAdminMobile: "",
      },
      meetingStatus: {
        meetingStatusId: "",
        meetingStatus: "",
      },
      joiners: [
        {
          companyEmployee: {
            employeeName: "",
            employeeId: "",
            employeeMobile: "",
          },
        },
        {
          companyEmployee: {
            employeeName: " ",
            employeeId: "",
            employeeMobile: "",
          },
        },
      ],
    }); // or undefined
    setIsUserModalOpen(true);
  };

  const openModal = useCallback((data: MeetingData) => {
    setModalData(data); // Set the data for the modal
    setIsUserModalOpen(true);
  }, []);

  const closeDeleteModal = (): void => {
    setModalData({
      meetingId: "",
      meetingName: "",
      meetingDescription: "",
      meetingDateTime: "",
      companyId: "",
      createdBy: "",
      meetingTypeId: "",
      meetingStatusId: "",
      meetingType: {
        meetingTypeId: "",
        meetingTypeName: "",
      },
      companyEmployee: {
        employeeId: "",
        employeeName: "",
        employeeMobile: "",
      },
      company: {
        companyId: "",
        companyAdminEmail: "",
        companyAdminMobile: "",
      },
      meetingStatus: {
        meetingStatusId: "",
        meetingStatus: "",
      },
      joiners: [
        {
          companyEmployee: {
            employeeName: "",
            employeeId: "",
            employeeMobile: "",
          },
        },
        {
          companyEmployee: {
            employeeName: " ",
            employeeId: "",
            employeeMobile: "",
          },
        },
      ],
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
  };
}
