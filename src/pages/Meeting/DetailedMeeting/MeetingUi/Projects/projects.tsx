import { useCallback, useState } from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";

import TableData from "@/components/shared/DataTable/DataTable";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ProjectSearchDropdown from "./ProjectSearchDropdown";
import {
  useAddUpdateCompanyProject,
  useGetAllProjectStatus,
  useGetCompanyProject,
} from "@/features/api/companyProject";
import {
  addMeetingProjectDataMutation,
  deleteMeetingProjectMutation,
  useGetMeetingProject,
} from "@/features/api/companyMeeting";
import { mapPaginationDetails } from "@/lib/mapPaginationDetails";
import { queryClient } from "@/queryClient";

interface ProjectProps {
  meetingId: string;
  projectFireBase: () => void;
}

export default function Projects({ meetingId, projectFireBase }: ProjectProps) {
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });

  const { mutate: addMeetingProject } = addMeetingProjectDataMutation();
  const { mutate: deleteProjectById } = deleteMeetingProjectMutation();

  const { data: meetProject } = useGetMeetingProject({
    filter: {
      meetingId: meetingId,
    },
  });

  const { mutate: addProject } = useAddUpdateCompanyProject();

  const stopApi = meetProject?.map((item) => item.projectId) ?? [];

  const { data: selectedProjects } = useGetCompanyProject({
    filter: {
      ...paginationFilter,
      projectIds: stopApi,
    },
    enable: Array.isArray(stopApi) && stopApi.length > 0,
  });

  const { data: projectStatusList } = useGetAllProjectStatus();

  const handleAdd = (data: IProjectFormData[]) => {
    const payload = {
      meetingId: meetingId,
      projectIds: data
        .map((item) => item.projectId)
        .filter((id): id is string => typeof id === "string"),
    };
    addMeetingProject(payload, {
      onSuccess: () => {
        queryClient.resetQueries({ queryKey: ["get-meeting-Project-res"] });
        projectFireBase();
      },
    });
  };

  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "projectName", label: "Project Name", visible: true },
    {
      key: "projectDeadline",
      label: "Project Deadline",
      visible: true,
    },
    { key: "projectDescription", label: "Project Description", visible: true },
    { key: "projectStatus", label: "Status", visible: true },
  ]);

  const visibleColumns = columnToggleOptions.reduce(
    (acc, col) => {
      if (col.visible) acc[col.key] = col.label;
      return acc;
    },
    {} as Record<string, string>,
  );

  const canToggleColumns = columnToggleOptions.length > 3;

  const onToggleColumn = (key: string) => {
    setColumnToggleOptions((prev) =>
      prev.map((col) =>
        col.key === key ? { ...col, visible: !col.visible } : col,
      ),
    );
  };

  const handleStatusChange = (data: string, row: CompanyProjectDataProps) => {
    const payload = {
      projectStatusId: data,
      projectId: row?.projectId,
    };
    addProject(payload);
  };

  const conformDelete = useCallback(
    async (data: IProjectFormData) => {
      if (data && data.projectId) {
        const payload = {
          projectId: data.projectId,
          meetingId: meetingId,
        };
        deleteProjectById(payload, {
          onSuccess: () => {
            projectFireBase();
            queryClient.resetQueries({ queryKey: ["get-meeting-Project-res"] });
          },
          onError: (error: Error) => {
            const axiosError = error as AxiosError<{
              message?: string;
              status: number;
            }>;

            toast.error(
              `Error: ${axiosError.response?.data?.message || "An error occurred"}`,
            );
          },
        });
      }
    },
    [deleteProjectById, meetingId, projectFireBase],
  );

  return (
    <div>
      <div className="flex gap-5 justify-between mb-5">
        <div>
          <ProjectSearchDropdown
            onAdd={handleAdd}
            minSearchLength={3}
            filterProps={{ pageSize: 25 }}
          />
        </div>
        <div>
          {canToggleColumns && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <DropdownSearchMenu
                      columns={columnToggleOptions}
                      onToggleColumn={onToggleColumn}
                      columnIcon={true}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs text-white">Toggle Visible Columns</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      <TableData
        tableData={
          selectedProjects?.data?.map((item) => ({
            ...item,
            status: item.projectStatusId,
          })) ?? []
        }
        columns={visibleColumns}
        primaryKey="projectId"
        // onEdit={navigate(`/dashboard/tasks/edit/${row.taskId}`)}
        // onViewButton={(row) => {
        //   navigate(`/dashboard/tasks/view/${row.taskId}`);
        // }}
        showIndexColumn={false}
        isActionButton={() => true}
        onDelete={(row) => {
          conformDelete(row as unknown as IProjectFormData);
        }}
        // viewButton={true}
        permissionKey="users"
        paginationDetails={mapPaginationDetails(selectedProjects)}
        setPaginationFilter={setPaginationFilter}
        dropdownColumns={{
          projectStatus: {
            options: (projectStatusList?.data ?? []).map((opt) => ({
              label: opt.projectStatus,
              value: opt.projectStatusId,
              color: opt.color || "#2e3195",
            })),
            onChange: (row, value) => handleStatusChange(value, row),
          },
        }}
        // onRowClick={(row) => {
        //   handleRowsModalOpen(row);
        // }}
        sortableColumns={["projectName", "projectDeadline"]}
      />
    </div>
  );
}
