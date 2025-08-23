import { useCallback, useEffect, useState } from "react";
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
} from "@/features/api/companyProject";

import { queryClient } from "@/queryClient";
import ProjectDrawer from "./projectDrawer";
import { Button } from "@/components/ui/button";

import { getDatabase, off, onValue, ref } from "firebase/database";
import {
  addMeetingProjectDataMutation,
  deleteMeetingProjectMutation,
  useGetMeetingProject,
} from "@/features/api/detailMeeting";
import { useParams } from "react-router-dom";

interface ProjectProps {
  projectsFireBase: () => void;
  meetingAgendaIssueId: string | undefined;
  ioType?: string;
}

export default function Projects({
  projectsFireBase,
  meetingAgendaIssueId,
  ioType,
}: ProjectProps) {
  const { id: meetingId } = useParams();
  const { mutate: addMeetingProject } = addMeetingProjectDataMutation();
  const { mutate: deleteProjectById } = deleteMeetingProjectMutation();

  const { data: selectedProjects } = useGetMeetingProject({
    filter: {
      meetingId: meetingId,
      issueObjectiveId: meetingAgendaIssueId,
      ioType: ioType,
    },
    enable: !!meetingId && !!meetingAgendaIssueId && !!ioType,
  });

  const { mutate: addProject } = useAddUpdateCompanyProject();

  const { data: projectStatusList } = useGetAllProjectStatus();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<CompanyProjectDataProps | null>(
    null,
  );

  const handleAdd = (data: IProjectFormData) => {
    if (meetingAgendaIssueId && meetingId) {
      const payload = {
        meetingId: meetingId,
        issueObjectiveId: meetingAgendaIssueId,
        projectId: data.projectId,
        ioType: ioType,
      };
      addMeetingProject(payload, {
        onSuccess: () => {
          projectsFireBase();
          queryClient.resetQueries({
            queryKey: ["get-detailMeetingAgendaIssue"],
          });
        },
      });
    }
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
    addProject(payload, {
      onSuccess: () => {
        projectsFireBase();
      },
    });
  };

  const conformDelete = useCallback(
    async (data: IProjectFormData) => {
      if (data && data.detailMeetingProjectId && data.projectId && meetingId) {
        const payload = {
          projectId: data.projectId,
          meetingId: meetingId,
          detailMeetingProjectId: data.detailMeetingProjectId ?? "",
        };
        deleteProjectById(payload, {
          onSuccess: () => {
            projectsFireBase();
            queryClient.resetQueries({
              queryKey: ["get-detailMeetingAgendaIssue"],
            });
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
    [deleteProjectById, meetingId, projectsFireBase],
  );

  useEffect(() => {
    const db = getDatabase();
    const meetingRef = ref(
      db,
      `meetings/${meetingId}/timers/objectives/${meetingAgendaIssueId}/projects`,
    );

    onValue(meetingRef, (snapshot) => {
      if (snapshot.exists()) {
        queryClient.resetQueries({ queryKey: ["get-meeting-Project-res"] });
        // queryClient.resetQueries({
        //   queryKey: ["get-detail-meeting-agenda-issue-obj"],
        // });
      }
    });

    return () => {
      off(meetingRef);
    };
  }, [meetingAgendaIssueId, meetingId]);

  const handleAddProject = () => {
    setDrawerOpen(true);
    setSelected(null);
  };

  return (
    <div>
      <div className="flex gap-5 justify-between mb-5">
        <div className="flex gap-5 items-center">
          <ProjectSearchDropdown
            onAdd={handleAdd}
            minSearchLength={3}
            filterProps={{ pageSize: 25 }}
          />
          <Button className="py-2 w-fit" onClick={handleAddProject}>
            Add Company Project
          </Button>
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
          selectedProjects?.map((item) => ({
            ...item,
            projectDeadline: item.projectDeadline
              ? new Date(item.projectDeadline).toISOString().split("T")[0]
              : "",
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
        onRowClick={(row) => {
          if (row) {
            setSelected(row);
            setDrawerOpen(true);
          }
        }}
        // actionColumnWidth="w-24"
        showActionsColumn={false}
        // viewButton={true}
        permissionKey="users"
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

      {drawerOpen && (
        <ProjectDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          projectData={selected}
          detailMeetingAgendaIssueId={meetingAgendaIssueId}
          projectsFireBase={projectsFireBase}
        />
      )}
    </div>
  );
}
