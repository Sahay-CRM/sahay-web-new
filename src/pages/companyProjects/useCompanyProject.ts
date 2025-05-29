import { useCallback, useState } from "react";

export default function useAdminUser() {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalData, setModalData] = useState<IProjectFormData>(
    {} as IProjectFormData,
  );
  const [currentStatus, setCurrentStatus] = useState<number>(1); // Add state for currentStatus
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isImport, setIsImport] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [projectlistdata, setUser] = useState({
    success: true,
    status: 200,
    message: "ent Users Fetched",
    currentPage: 1,
    totalCount: 3,
    hasMore: false,
    pageSize: 10,
    totalPage: 1,
    sortBy: "projectName",
    sortOrder: "asc",
    data: [
      {
        isSuperAdmin: false,
        projectId: "a24a35b5-01fd-40df-a333-1754154cc823",
        projectName: "web1",
        projectDescription: "web2",
        projectActualEndDate: null,
        projectDeadline: "2025-05-03T06:33:00.000Z",
        employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
        ProjectSubParameterJunction: [
          {
            projectSubParameterId: "7e97f2d0-6d09-4cbb-a63d-23ad73336441",
            subPara: {
              subParameterId: "4bbd1803-c597-4aec-bb42-3128b920dd4b",
              subParameterName: "Net Cash Flow Positive",
              coreParameterId: "c2aa18ed-605e-415e-b8c0-c9091347a514",
              coreParameter: {
                coreParameterId: "c2aa18ed-605e-415e-b8c0-c9091347a514",
                departmentId: "4f90a02c-e13b-40c2-b107-eae066042f96",
                coreParameterName: "Finance & Account",
                createdBy: "18051617-9f88-4ac2-9841-ab8cf82fa643",
                updatedBy: "18051617-9f88-4ac2-9841-ab8cf82fa643",
                isDelete: false,
                createdDatetime: "2025-02-01T12:15:06.848Z",
                updatedDatetime: "2025-02-01T12:15:06.848Z",
              },
            },
          },
          {
            projectSubParameterId: "b1e72fec-44d0-455f-8d8b-8eb02a917032",
            subPara: {
              subParameterId: "fc820923-db31-4515-8c71-bf797f319a91",
              subParameterName: "Unknown",
              coreParameterId: "5b0368d6-0a10-4c55-9d7a-4be9a5585c82",
              coreParameter: {
                coreParameterId: "5b0368d6-0a10-4c55-9d7a-4be9a5585c82",
                departmentId: "d8236e26-7685-4b2c-b3a3-d8e39e3dbabd",
                coreParameterName: "Unknown",
                createdBy: "01b22baa-52f1-466e-a3f5-316417b3e80e",
                updatedBy: "01b22baa-52f1-466e-a3f5-316417b3e80e",
                isDelete: false,
                createdDatetime: "2025-02-18T11:24:05.224Z",
                updatedDatetime: "2025-02-18T11:24:05.224Z",
              },
            },
          },
        ],
        createdBy: {
          employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
          employeeName: "Pritesh",
          employeeEmail: "support@userex.in",
          employeeMobile: "+917600204057",
          companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
          employeeType: "CONSULTANT",
          departmentId: null,
          department: null,
          designationId: null,
          designation: null,
          reportingManagerId: null,
          company: {
            companyAdminName: "Rahul",
            companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
          },
          reportingManager: null,
        },
        projectStatusId: "a49d58f1-32d5-4d63-a324-1895403d72fb",
        projectStatus: {
          projectStatusId: "a49d58f1-32d5-4d63-a324-1895403d72fb",
          projectStatus: "Delayed",
          projectStatusOrder: 3,
          winLostProject: null,
        },
        ProjectEmployees: [
          {
            employeeId: "1330babc-5dfa-46e3-b66b-62c9c7f0a9ef",
            companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
            sahayEmId: null,
            departmentId: "85afb5dd-6d19-4d96-990e-711a7bccfda8",
            designationId: "443398d5-80ea-4676-8e86-7275acb79c10",
            reportingManagerId: "02afc708-d586-4584-b729-aa320adb78d5",
            employeeName: "testemp",
            employeeMobile: "+919725163577",
            employeeEmail: "test@test.com",
            employeeType: "EMPLOYEE",
            isSahayEmployee: false,
            createdBy: "564d96db-8ccb-471c-9626-3880a168abc6",
            updatedBy: null,
            isDelete: false,
            createdDatetime: "2025-05-19T14:11:36.706Z",
            updatedDatetime: "2025-05-20T05:43:08.872Z",
            isSuperAdmin: false,
          },
          {
            employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
            companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
            sahayEmId: "d75087b1-185e-48ae-9890-a471d8ec30be",
            departmentId: null,
            designationId: null,
            reportingManagerId: null,
            employeeName: "Pritesh",
            employeeMobile: "+917600204057",
            employeeEmail: "support@userex.in",
            employeeType: "CONSULTANT",
            isSahayEmployee: false,
            createdBy: "00d01c44-9c00-4000-8b87-c537eaf8ca0f",
            updatedBy: null,
            isDelete: false,
            createdDatetime: "2025-04-14T09:50:36.939Z",
            updatedDatetime: "2025-05-20T05:43:09.047Z",
            isSuperAdmin: true,
          },
        ],
        ProjectTasks: [],
      },
      {
        projectId: "40f75991-950c-41af-a5f6-29dcc4b3571a",
        projectName: "web",
        projectDescription: "web",
        projectActualEndDate: null,
        projectDeadline: "2025-05-03T06:10:00.000Z",
        employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
        ProjectSubParameterJunction: [
          {
            projectSubParameterId: "f380d210-b374-498f-9cd9-209b7d1c77e2",
            subPara: {
              subParameterId: "214ed030-eda5-4815-9cef-b0e1ccc70878",
              subParameterName: "Job Description (JD)",
              coreParameterId: "d4beea37-0be2-4f3a-b2da-227b24eceee3",
              coreParameter: {
                coreParameterId: "d4beea37-0be2-4f3a-b2da-227b24eceee3",
                departmentId: "d8236e26-7685-4b2c-b3a3-d8e39e3dbabd",
                coreParameterName: "Human Resource",
                createdBy: "18051617-9f88-4ac2-9841-ab8cf82fa643",
                updatedBy: "18051617-9f88-4ac2-9841-ab8cf82fa643",
                isDelete: false,
                createdDatetime: "2025-02-01T12:14:55.243Z",
                updatedDatetime: "2025-02-01T12:14:55.243Z",
              },
            },
          },
          {
            projectSubParameterId: "8eb85166-75b6-4c85-99b1-a8225bedd668",
            subPara: {
              subParameterId: "3b4b5e48-f092-4e15-81a1-abdc89e34512",
              subParameterName: "Recruitment",
              coreParameterId: "d4beea37-0be2-4f3a-b2da-227b24eceee3",
              coreParameter: {
                coreParameterId: "d4beea37-0be2-4f3a-b2da-227b24eceee3",
                departmentId: "d8236e26-7685-4b2c-b3a3-d8e39e3dbabd",
                coreParameterName: "Human Resource",
                createdBy: "18051617-9f88-4ac2-9841-ab8cf82fa643",
                updatedBy: "18051617-9f88-4ac2-9841-ab8cf82fa643",
                isDelete: false,
                createdDatetime: "2025-02-01T12:14:55.243Z",
                updatedDatetime: "2025-02-01T12:14:55.243Z",
              },
            },
          },
        ],
        createdBy: {
          employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
          employeeName: "Pritesh",
          employeeEmail: "support@userex.in",
          employeeMobile: "+917600204057",
          companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
          employeeType: "CONSULTANT",
          departmentId: null,
          department: null,
          designationId: null,
          designation: null,
          reportingManagerId: null,
          company: {
            companyAdminName: "Rahul",
            companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
          },
          reportingManager: null,
        },
        projectStatusId: "a49d58f1-32d5-4d63-a324-1895403d72fb",
        projectStatus: {
          projectStatusId: "a49d58f1-32d5-4d63-a324-1895403d72fb",
          projectStatus: "Delayed",
          projectStatusOrder: 3,
          winLostProject: null,
        },
        ProjectEmployees: [
          {
            employeeId: "02d5cbb0-4ab9-452d-aec2-f886b3fbe608",
            companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
            sahayEmId: null,
            departmentId: "d8236e26-7685-4b2c-b3a3-d8e39e3dbabd",
            designationId: "443398d5-80ea-4676-8e86-7275acb79c10",
            reportingManagerId: "02afc708-d586-4584-b729-aa320adb78d5",
            employeeName: "Parth Gadhiya",
            employeeMobile: "+919601017974",
            employeeEmail: "parth@sahay.group",
            employeeType: "EMPLOYEE",
            isSahayEmployee: false,
            createdBy: "3059599a-f634-4c3d-9873-faca7fe16e64",
            updatedBy: "cb73e61c-e6ec-4103-afa4-2c53923ed174",
            isDelete: false,
            createdDatetime: "2025-02-23T12:51:17.881Z",
            updatedDatetime: "2025-05-20T05:43:08.872Z",
            isSuperAdmin: false,
          },
          {
            employeeId: "d2a87068-abb7-45b3-bf69-d6fc426cc827",
            companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
            sahayEmId: "464ef41f-3044-4e97-a637-7b3531bb525a",
            departmentId: null,
            designationId: null,
            reportingManagerId: null,
            employeeName: "Rushiraj Patel",
            employeeMobile: "+919687655143",
            employeeEmail: "rushiraj@sahay.group",
            employeeType: "CONSULTANT",
            isSahayEmployee: false,
            createdBy: "00d01c44-9c00-4000-8b87-c537eaf8ca0f",
            updatedBy: null,
            isDelete: false,
            createdDatetime: "2025-04-14T09:50:36.939Z",
            updatedDatetime: "2025-05-20T05:43:08.872Z",
            isSuperAdmin: false,
          },
        ],
        ProjectTasks: [
          {
            taskId: "098e5e3d-b272-4637-8a33-edffc58423a2",
            taskActualEndDate: null,
            taskDeadline: "2025-05-02T11:00:00.000Z",
            taskTypeId: "f5beb1ff-ef2a-4f55-b2ab-98a955d6e335",
            assignees: [
              {
                employeeId: "02d5cbb0-4ab9-452d-aec2-f886b3fbe608",
                employeeName: "Parth Gadhiya",
              },
            ],
          },
          {
            taskId: "a87c28b3-e3d5-4f3c-b87e-6163b68bb2ed",
            taskActualEndDate: null,
            taskDeadline: "2025-05-20T11:27:00.000Z",
            taskTypeId: "a26ea178-6fcc-4b9b-a34b-ceea4bc35d1e",
            assignees: [
              {
                employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
                employeeName: "Pritesh",
              },
            ],
          },
          {
            taskId: "b513908d-4eac-48a5-9355-08900b358722",
            taskActualEndDate: null,
            taskDeadline: "2025-05-21T11:28:00.000Z",
            taskTypeId: "ea59cfc1-06c9-4e9e-a0cb-9339dbbf604a",
            assignees: [
              {
                employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
                employeeName: "Pritesh",
              },
            ],
          },
        ],
      },
      {
        projectId: "84469bae-8572-4f69-a8c8-297894b08ec8",
        projectName: "Rushi",
        projectDescription: "Rushi",
        projectActualEndDate: null,
        projectDeadline: "2025-05-16T11:32:00.000Z",
        employeeId: "d2a87068-abb7-45b3-bf69-d6fc426cc827",
        ProjectSubParameterJunction: [
          {
            projectSubParameterId: "07e80016-15e6-43c4-8540-3d5fe6c3ffe9",
            subPara: {
              subParameterId: "dd08266b-301f-4e66-bb48-649c2989464c",
              subParameterName: "Pricing",
              coreParameterId: "8f87f18c-2928-44de-801a-b6404130d53f",
              coreParameter: {
                coreParameterId: "8f87f18c-2928-44de-801a-b6404130d53f",
                departmentId: "85afb5dd-6d19-4d96-990e-711a7bccfda8",
                coreParameterName: "Marketing",
                createdBy: "18051617-9f88-4ac2-9841-ab8cf82fa643",
                updatedBy: "18051617-9f88-4ac2-9841-ab8cf82fa643",
                isDelete: false,
                createdDatetime: "2025-02-01T12:14:43.781Z",
                updatedDatetime: "2025-02-01T12:14:43.781Z",
              },
            },
          },
        ],
        createdBy: {
          employeeId: "d2a87068-abb7-45b3-bf69-d6fc426cc827",
          employeeName: "Rushiraj Patel",
          employeeEmail: "rushiraj@sahay.group",
          employeeMobile: "+919687655143",
          companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
          employeeType: "CONSULTANT",
          departmentId: null,
          department: null,
          designationId: null,
          designation: null,
          reportingManagerId: null,
          company: {
            companyAdminName: "Rahul",
            companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
          },
          reportingManager: null,
        },
        projectStatusId: "58b867a1-0826-4fb7-82cf-b67d97e7544a",
        projectStatus: {
          projectStatusId: "58b867a1-0826-4fb7-82cf-b67d97e7544a",
          projectStatus: "Planned & Assigned",
          projectStatusOrder: 1,
          winLostProject: null,
        },
        ProjectEmployees: [
          {
            employeeId: "02d5cbb0-4ab9-452d-aec2-f886b3fbe608",
            companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
            sahayEmId: null,
            departmentId: "d8236e26-7685-4b2c-b3a3-d8e39e3dbabd",
            designationId: "443398d5-80ea-4676-8e86-7275acb79c10",
            reportingManagerId: "02afc708-d586-4584-b729-aa320adb78d5",
            employeeName: "Parth Gadhiya",
            employeeMobile: "+919601017974",
            employeeEmail: "parth@sahay.group",
            employeeType: "EMPLOYEE",
            isSahayEmployee: false,
            createdBy: "3059599a-f634-4c3d-9873-faca7fe16e64",
            updatedBy: "cb73e61c-e6ec-4103-afa4-2c53923ed174",
            isDelete: false,
            createdDatetime: "2025-02-23T12:51:17.881Z",
            updatedDatetime: "2025-05-20T05:43:08.872Z",
            isSuperAdmin: false,
          },
        ],
        ProjectTasks: [
          {
            taskId: "ec0cf952-f1c9-4ca2-9a9f-31dd61f4e391",
            taskActualEndDate: null,
            taskDeadline: "2025-05-15T19:03:00.000Z",
            taskTypeId: "3a84e838-7950-4203-a1d3-e118f5b8e290",
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
            taskId: "8729ebbe-3969-4515-8289-f50c91868c4b",
            taskActualEndDate: "2025-05-20T08:46:26.746Z",
            taskDeadline: "2025-05-09T17:04:00.000Z",
            taskTypeId: "f5beb1ff-ef2a-4f55-b2ab-98a955d6e335",
            assignees: [
              {
                employeeId: "1330babc-5dfa-46e3-b66b-62c9c7f0a9ef",
                employeeName: "testemp",
              },
            ],
          },
        ],
      },
      {
        projectId: "21ac8c60-f7b1-482d-928a-d24ebefd0f5f",
        projectName: "web3",
        projectDescription: "webbs",
        projectActualEndDate: null,
        projectDeadline: "2025-05-13T14:04:00.000Z",
        employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
        ProjectSubParameterJunction: [
          {
            projectSubParameterId: "8b0d6cd6-8f82-41de-bab0-d826feb9417f",
            subPara: {
              subParameterId: "4bbd1803-c597-4aec-bb42-3128b920dd4b",
              subParameterName: "Net Cash Flow Positive",
              coreParameterId: "c2aa18ed-605e-415e-b8c0-c9091347a514",
              coreParameter: {
                coreParameterId: "c2aa18ed-605e-415e-b8c0-c9091347a514",
                departmentId: "4f90a02c-e13b-40c2-b107-eae066042f96",
                coreParameterName: "Finance & Account",
                createdBy: "18051617-9f88-4ac2-9841-ab8cf82fa643",
                updatedBy: "18051617-9f88-4ac2-9841-ab8cf82fa643",
                isDelete: false,
                createdDatetime: "2025-02-01T12:15:06.848Z",
                updatedDatetime: "2025-02-01T12:15:06.848Z",
              },
            },
          },
        ],
        createdBy: {
          employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
          employeeName: "Pritesh",
          employeeEmail: "support@userex.in",
          employeeMobile: "+917600204057",
          companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
          employeeType: "CONSULTANT",
          departmentId: null,
          department: null,
          designationId: null,
          designation: null,
          reportingManagerId: null,
          company: {
            companyAdminName: "Rahul",
            companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
          },
          reportingManager: null,
        },
        projectStatusId: "58b867a1-0826-4fb7-82cf-b67d97e7544a",
        projectStatus: {
          projectStatusId: "58b867a1-0826-4fb7-82cf-b67d97e7544a",
          projectStatus: "Planned & Assigned",
          projectStatusOrder: 1,
          winLostProject: null,
        },
        ProjectEmployees: [
          {
            employeeId: "564d96db-8ccb-471c-9626-3880a168abc6",
            companyId: "90f1e0ad-2e58-44a0-a8fb-2e2f2b9b84da",
            sahayEmId: null,
            departmentId: null,
            designationId: null,
            reportingManagerId: null,
            employeeName: "Jay Joshi",
            employeeMobile: "+919725163588",
            employeeEmail: "jay@userex.in",
            employeeType: "EMPLOYEE",
            isSahayEmployee: true,
            createdBy: "00d01c44-9c00-4000-8b87-c537eaf8ca0f",
            updatedBy: "00d01c44-9c00-4000-8b87-c537eaf8ca0f",
            isDelete: false,
            createdDatetime: "2025-04-29T08:45:33.243Z",
            updatedDatetime: "2025-05-20T05:43:08.872Z",
            isSuperAdmin: false,
          },
        ],
        ProjectTasks: [
          {
            taskId: "d464c431-5f10-4134-9c00-61f0214a898d",
            taskActualEndDate: null,
            taskDeadline: "2025-05-05T09:07:00.000Z",
            taskTypeId: "f5beb1ff-ef2a-4f55-b2ab-98a955d6e335",
            assignees: [
              {
                employeeId: "02d5cbb0-4ab9-452d-aec2-f886b3fbe608",
                employeeName: "Parth Gadhiya",
              },
            ],
          },
          {
            taskId: "4685f7c0-0fc8-4c7a-80a5-f0dc1959dae8",
            taskActualEndDate: null,
            taskDeadline: "2025-05-01T05:06:00.000Z",
            taskTypeId: "3a84e838-7950-4203-a1d3-e118f5b8e290",
            assignees: [
              {
                employeeId: "02d5cbb0-4ab9-452d-aec2-f886b3fbe608",
                employeeName: "Parth Gadhiya",
              },
            ],
          },
          {
            taskId: "408a1116-f592-4edf-a8d1-1cfbd38f9d8d",
            taskActualEndDate: null,
            taskDeadline: "2025-05-22T08:49:00.000Z",
            taskTypeId: "ea59cfc1-06c9-4e9e-a0cb-9339dbbf604a",
            assignees: [
              {
                employeeId: "02afc708-d586-4584-b729-aa320adb78d5",
                employeeName: "Pritesh",
              },
            ],
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
    setModalData(modalData); // or undefined
    setIsUserModalOpen(true);
  };

  const openModal = useCallback((data: IProjectFormData) => {
    setModalData(data); // Set the data for the modal
    setIsUserModalOpen(true);
  }, []);

  const closeDeleteModal = (): void => {
    setModalData(modalData); // Clear modal data
    setIsUserModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsChildData("");
  };

  const onDelete = useCallback((data: IProjectFormData) => {
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
    projectlistdata,
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
