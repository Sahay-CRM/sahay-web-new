import { useCallback, useState } from "react";

export default function useAdminUser() {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalData, setModalData] = useState<CompanyTaskData>(
    {} as CompanyTaskData,
  );
  const [currentStatus, setCurrentStatus] = useState<number>(1); // Add state for currentStatus
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isImport, setIsImport] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [companyTaskData, setUser] = useState({
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
        taskId: "86242588-1b67-44d3-9d82-487dfc2d81f4",
        taskName: "v",
        taskDescription: "fb",
        taskDeadline: "2025-05-20T07:36:00.000Z",
        taskActualEndDate: "2025-05-21T10:19:45.739Z",
        taskStatusId: "183d40e6-9a43-4a36-857e-98ee9a6886a6",
        taskStatusName: "In Progress",
        taskTypeId: "3a84e838-7950-4203-a1d3-e118f5b8e290",
        taskTypeName: "Owner Task",
        createdByEmployee: {
          employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
          employeeName: "Unknown",
        },
        assignees: [
          {
            employeeId: "1330babc-5dfa-46e3-b66b-62c9c7f0a9ef",
            employeeName: "testemp",
          },
        ],
      },
      {
        taskId: "eb97d5e2-8ec1-4ded-b6d8-4a4702c96389",
        taskName: "data1",
        taskDescription: "data",
        taskDeadline: "2025-05-19T21:01:00.000Z",
        taskActualEndDate: null,
        taskStatusId: "183d40e6-9a43-4a36-857e-98ee9a6886a6",
        taskStatusName: "In Progress",
        taskTypeId: "a26ea178-6fcc-4b9b-a34b-ceea4bc35d1e",
        taskTypeName: "Rushiraj Task",
        createdByEmployee: {
          employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
          employeeName: "Unknown",
        },
        assignees: [
          {
            employeeId: "564d96db-8ccb-471c-9626-3880a168abc6",
            employeeName: "Jay Joshi",
          },
        ],
      },
      {
        taskId: "b513908d-4eac-48a5-9355-08900b358722",
        taskName: "hggj",
        taskDescription: "hgjhgj",
        taskDeadline: "2025-05-21T11:28:00.000Z",
        taskActualEndDate: null,
        taskStatusId: "07621d5c-a88d-4061-835d-2c1f40aaf4ed",
        taskStatusName: "Delayed",
        taskTypeId: "ea59cfc1-06c9-4e9e-a0cb-9339dbbf604a",
        taskTypeName: "Client Staff Task",
        createdByEmployee: {
          employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
          employeeName: "Pritesh",
        },
        assignees: [
          {
            employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
            employeeName: "Pritesh",
          },
        ],
      },
      {
        taskId: "a87c28b3-e3d5-4f3c-b87e-6163b68bb2ed",
        taskName: "hnfjhgj",
        taskDescription: "hjhgj",
        taskDeadline: "2025-05-20T11:27:00.000Z",
        taskActualEndDate: null,
        taskStatusId: "183d40e6-9a43-4a36-857e-98ee9a6886a6",
        taskStatusName: "In Progress",
        taskTypeId: "a26ea178-6fcc-4b9b-a34b-ceea4bc35d1e",
        taskTypeName: "Rushiraj Task",
        createdByEmployee: {
          employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
          employeeName: "Pritesh",
        },
        assignees: [
          {
            employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
            employeeName: "Pritesh",
          },
        ],
      },
      {
        taskId: "c584085a-63d0-4b50-8f4e-e609c8ca30c4",
        taskName: "jhgjgj",
        taskDescription: "ghjghgh",
        taskDeadline: "2025-05-21T11:16:00.000Z",
        taskActualEndDate: null,
        taskStatusId: "33d54386-54c0-4097-8e97-c07e2a40aeef",
        taskStatusName: "Yet to start",
        taskTypeId: "a26ea178-6fcc-4b9b-a34b-ceea4bc35d1e",
        taskTypeName: "Rushiraj Task",
        createdByEmployee: {
          employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
          employeeName: "Pritesh",
        },
        assignees: [
          {
            employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
            employeeName: "Pritesh",
          },
        ],
      },
      {
        taskId: "fd493f7c-cb24-4d70-9985-945d03d40808",
        taskName: "web 1",
        taskDescription: "jhj",
        taskDeadline: "2025-05-20T11:14:00.000Z",
        taskActualEndDate: null,
        taskStatusId: "07621d5c-a88d-4061-835d-2c1f40aaf4ed",
        taskStatusName: "Delayed",
        taskTypeId: "3a84e838-7950-4203-a1d3-e118f5b8e290",
        taskTypeName: "Owner Task",
        createdByEmployee: {
          employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
          employeeName: "Unknown",
        },
        assignees: [
          {
            employeeId: "02d5cbb0-4ab9-452d-aec2-f886b3fbe608",
            employeeName: "Parth Gadhiya",
          },
        ],
      },
      {
        taskId: "098e5e3d-b272-4637-8a33-edffc58423a2",
        taskName: "vnfdgvd",
        taskDescription: "fdgdg",
        taskDeadline: "2025-05-02T11:00:00.000Z",
        taskActualEndDate: null,
        taskStatusId: "07621d5c-a88d-4061-835d-2c1f40aaf4ed",
        taskStatusName: "Delayed",
        taskTypeId: "f5beb1ff-ef2a-4f55-b2ab-98a955d6e335",
        taskTypeName: "Client + Consultant Joint Task",
        createdByEmployee: {
          employeeId: "564d96db-8ccb-471c-9626-3880a168abc6",
          employeeName: "Unknown",
        },
        assignees: [
          {
            employeeId: "02d5cbb0-4ab9-452d-aec2-f886b3fbe608",
            employeeName: "Parth Gadhiya",
          },
        ],
      },
      {
        taskId: "c969d1ef-54c8-4cf3-af36-40c22a0aa9c1",
        taskName: "hgj",
        taskDescription: "ghfgh",
        taskDeadline: "2025-05-01T10:56:00.000Z",
        taskActualEndDate: null,
        taskStatusId: "183d40e6-9a43-4a36-857e-98ee9a6886a6",
        taskStatusName: "In Progress",
        taskTypeId: "f5beb1ff-ef2a-4f55-b2ab-98a955d6e335",
        taskTypeName: "Client + Consultant Joint Task",
        createdByEmployee: {
          employeeId: "564d96db-8ccb-471c-9626-3880a168abc6",
          employeeName: "Unknown",
        },
        assignees: [
          {
            employeeId: "1330babc-5dfa-46e3-b66b-62c9c7f0a9ef",
            employeeName: "testemp",
          },
        ],
      },
      {
        taskId: "48725be7-ad32-4ff2-aab8-59a2057edc05",
        taskName: "ngdfmgfd",
        taskDescription: "dgfdhfd",
        taskDeadline: "2025-05-21T10:54:00.000Z",
        taskActualEndDate: null,
        taskStatusId: "183d40e6-9a43-4a36-857e-98ee9a6886a6",
        taskStatusName: "In Progress",
        taskTypeId: "ea59cfc1-06c9-4e9e-a0cb-9339dbbf604a",
        taskTypeName: "Client Staff Task",
        createdByEmployee: {
          employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
          employeeName: "Unknown",
        },
        assignees: [
          {
            employeeId: "d2a87068-abb7-45b3-bf69-d6fc426cc827",
            employeeName: "Rushiraj Patel",
          },
        ],
      },
      {
        taskId: "504510d1-f65a-456a-8150-3807eea1a245",
        taskName: "gfdgdg",
        taskDescription: "fgdgdfgd",
        taskDeadline: "2025-05-21T10:50:00.000Z",
        taskActualEndDate: null,
        taskStatusId: "183d40e6-9a43-4a36-857e-98ee9a6886a6",
        taskStatusName: "In Progress",
        taskTypeId: "a26ea178-6fcc-4b9b-a34b-ceea4bc35d1e",
        taskTypeName: "Rushiraj Task",
        createdByEmployee: {
          employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
          employeeName: "Unknown",
        },
        assignees: [
          {
            employeeId: "d2a87068-abb7-45b3-bf69-d6fc426cc827",
            employeeName: "Rushiraj Patel",
          },
        ],
      },
      {
        taskId: "c47abee4-c69e-4517-9d05-be6b497f320d",
        taskName: "dsaasd",
        taskDescription: "sadad",
        taskDeadline: "2025-05-21T10:46:00.000Z",
        taskActualEndDate: null,
        taskStatusId: "183d40e6-9a43-4a36-857e-98ee9a6886a6",
        taskStatusName: "In Progress",
        taskTypeId: "a26ea178-6fcc-4b9b-a34b-ceea4bc35d1e",
        taskTypeName: "Rushiraj Task",
        createdByEmployee: {
          employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
          employeeName: "Unknown",
        },
        assignees: [
          {
            employeeId: "d2a87068-abb7-45b3-bf69-d6fc426cc827",
            employeeName: "Rushiraj Patel",
          },
        ],
      },
      {
        taskId: "9e18e2c0-a39b-446e-b0c1-58ff26ea2cdb",
        taskName: "agsdash",
        taskDescription: "sdasdas",
        taskDeadline: "2025-05-21T10:38:00.000Z",
        taskActualEndDate: null,
        taskStatusId: "183d40e6-9a43-4a36-857e-98ee9a6886a6",
        taskStatusName: "In Progress",
        taskTypeId: "ea59cfc1-06c9-4e9e-a0cb-9339dbbf604a",
        taskTypeName: "Client Staff Task",
        createdByEmployee: {
          employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
          employeeName: "Pritesh",
        },
        assignees: [
          {
            employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
            employeeName: "Pritesh",
          },
          {
            employeeId: "d2a87068-abb7-45b3-bf69-d6fc426cc827",
            employeeName: "Rushiraj Patel",
          },
        ],
      },
      {
        taskId: "8729ebbe-3969-4515-8289-f50c91868c4b",
        taskName: "Pritesh Task 1",
        taskDescription: "ssd gfgfgfgfgfgfgfgfgfgfgfgfgfgfgfgfgfgfgf",
        taskDeadline: "2025-05-09T17:04:00.000Z",
        taskActualEndDate: "2025-05-20T08:46:26.746Z",
        taskStatusId: "07621d5c-a88d-4061-835d-2c1f40aaf4ed",
        taskStatusName: "Delayed",
        taskTypeId: "f5beb1ff-ef2a-4f55-b2ab-98a955d6e335",
        taskTypeName: "Client + Consultant Joint Task",
        createdByEmployee: {
          employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
          employeeName: "Unknown",
        },
        assignees: [
          {
            employeeId: "1330babc-5dfa-46e3-b66b-62c9c7f0a9ef",
            employeeName: "testemp",
          },
        ],
      },
      {
        taskId: "b3b02311-5b02-4f64-befc-ebe1c193c3d5",
        taskName: "New Task",
        taskDescription: "dsvcsd",
        taskDeadline: "2025-05-15T08:22:00.000Z",
        taskActualEndDate: null,
        taskStatusId: "07621d5c-a88d-4061-835d-2c1f40aaf4ed",
        taskStatusName: "Delayed",
        taskTypeId: "3a84e838-7950-4203-a1d3-e118f5b8e290",
        taskTypeName: "Owner Task",
        createdByEmployee: {
          employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
          employeeName: "Pritesh",
        },
        assignees: [
          {
            employeeId: "bc1b2738-3319-4ac4-aaad-72ddca128cb1",
            employeeName: "Rahul",
          },
          {
            employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
            employeeName: "Pritesh",
          },
        ],
      },
      {
        taskId: "dc5eae00-81fc-42b1-a735-19ac9acbdb07",
        taskName: "Pritesh Task",
        taskDescription: "Pritesh Task Desctiption 1",
        taskDeadline: "2025-05-06T12:30:00.000Z",
        taskActualEndDate: "2025-05-15T12:57:47.854Z",
        taskStatusId: "1007687e-3b29-4b2d-b653-a018355aa316",
        taskStatusName: "Completed",
        taskTypeId: "3a84e838-7950-4203-a1d3-e118f5b8e290",
        taskTypeName: "Owner Task",
        createdByEmployee: {
          employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
          employeeName: "Pritesh",
        },
        assignees: [
          {
            employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
            employeeName: "Pritesh",
          },
          {
            employeeId: "02d5cbb0-4ab9-452d-aec2-f886b3fbe608",
            employeeName: "Parth Gadhiya",
          },
        ],
      },
      {
        taskId: "ec0cf952-f1c9-4ca2-9a9f-31dd61f4e391",
        taskName: "Rushi Task",
        taskDescription: "Rushi Task",
        taskDeadline: "2025-05-15T19:03:00.000Z",
        taskActualEndDate: null,
        taskStatusId: "07621d5c-a88d-4061-835d-2c1f40aaf4ed",
        taskStatusName: "Delayed",
        taskTypeId: "3a84e838-7950-4203-a1d3-e118f5b8e290",
        taskTypeName: "Owner Task",
        createdByEmployee: {
          employeeId: "d2a87068-abb7-45b3-bf69-d6fc426cc827",
          employeeName: "Unknown",
        },
        assignees: [
          {
            employeeId: "02d5cbb0-4ab9-452d-aec2-f886b3fbe608",
            employeeName: "Parth Gadhiya",
          },
          {
            employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
            employeeName: "Pritesh",
          },
          {
            employeeId: "564d96db-8ccb-471c-9626-3880a168abc6",
            employeeName: "Jay Joshi",
          },
          {
            employeeId: "bc1b2738-3319-4ac4-aaad-72ddca128cb1",
            employeeName: "Rahul",
          },
          {
            employeeId: "bf8d3f0e-5c3e-414d-b834-6df3c6044a76",
            employeeName: "Vipul Rajgor",
          },
        ],
      },
      {
        taskId: "d464c431-5f10-4134-9c00-61f0214a898d",
        taskName: "web",
        taskDescription: "webbs",
        taskDeadline: "2025-05-05T09:07:00.000Z",
        taskActualEndDate: null,
        taskStatusId: "07621d5c-a88d-4061-835d-2c1f40aaf4ed",
        taskStatusName: "Delayed",
        taskTypeId: "f5beb1ff-ef2a-4f55-b2ab-98a955d6e335",
        taskTypeName: "Client + Consultant Joint Task",
        createdByEmployee: {
          employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
          employeeName: "Unknown",
        },
        assignees: [
          {
            employeeId: "02d5cbb0-4ab9-452d-aec2-f886b3fbe608",
            employeeName: "Parth Gadhiya",
          },
        ],
      },
      {
        taskId: "50fb2149-7d55-4926-b725-6ef654b871bf",
        taskName: "new task",
        taskDescription: "this is new task details",
        taskDeadline: "2025-04-24T10:02:00.000Z",
        taskActualEndDate: null,
        taskStatusId: "183d40e6-9a43-4a36-857e-98ee9a6886a6",
        taskStatusName: "In Progress",
        taskTypeId: "3a84e838-7950-4203-a1d3-e118f5b8e290",
        taskTypeName: "Owner Task",
        createdByEmployee: {
          employeeId: "068eeab4-ed89-47f9-bd9d-1e1344bbcd6d",
          employeeName: "Unknown",
        },
        assignees: [
          {
            employeeId: "bc1b2738-3319-4ac4-aaad-72ddca128cb1",
            employeeName: "Rahul",
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
      taskId: "", // empty or generate UUID if needed
      taskName: "",
      taskDescription: "",
      taskDeadline: new Date().toISOString(),
      taskActualEndDate: null,
      taskStatusId: "", // or default status id
      taskStatusName: "", // optional default
      taskTypeId: "", // or default type id
      taskTypeName: "", // optional default
      createdByEmployee: {
        employeeId: "", // can be current user id if needed
        employeeName: "", // or current user name
      },
      assignees: [],
    });
    setIsUserModalOpen(true);
  };

  const openModal = useCallback((data: CompanyTaskData) => {
    setModalData(data); // Set the data for the modal
    setIsUserModalOpen(true);
  }, []);

  const closeDeleteModal = (): void => {
    setModalData({
      taskId: "", // empty or generate UUID if needed
      taskName: "",
      taskDescription: "",
      taskDeadline: new Date().toISOString(),
      taskActualEndDate: null,
      taskStatusId: "", // or default status id
      taskStatusName: "", // optional default
      taskTypeId: "", // or default type id
      taskTypeName: "", // optional default
      createdByEmployee: {
        employeeId: "", // can be current user id if needed
        employeeName: "", // or current user name
      },
      assignees: [],
    }); // Clear modal data
    setIsUserModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsChildData("");
  };

  const onDelete = useCallback((data: CompanyTaskData) => {
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
    companyTaskData,
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
