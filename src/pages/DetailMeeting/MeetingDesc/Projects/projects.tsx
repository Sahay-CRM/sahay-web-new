import { useCallback, useEffect, useState } from "react";
import { AxiosError } from "axios";
import { useParams } from "react-router-dom";
import { getDatabase, off, onValue, ref } from "firebase/database";
import { toast } from "sonner";
import { queryClient } from "@/queryClient";

import TableData from "@/components/shared/DataTable/DataTable";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

import ProjectSearchDropdown from "./ProjectSearchDropdown";
import ProjectDrawer from "./projectDrawer";

import {
  useAddUpdateCompanyProject,
  useGetAllProjectStatus,
} from "@/features/api/companyProject";
import {
  addMeetingProjectDataMutation,
  deleteMeetingProjectMutation,
  useGetMeetingProject,
} from "@/features/api/detailMeeting";
import { Unlink } from "lucide-react";

interface ProjectProps {
  projectsFireBase: () => void;
  issueId: string | undefined;
  ioType?: string;
  selectedIssueId?: string;
}

export default function Projects({
  projectsFireBase,
  issueId,
  ioType,
  selectedIssueId,
}: ProjectProps) {
  const { id: meetingId } = useParams();
  const { mutate: addMeetingProject } = addMeetingProjectDataMutation();
  const { mutate: deleteProjectById } = deleteMeetingProjectMutation();

  const { data: selectedProjects } = useGetMeetingProject({
    filter: {
      meetingId: meetingId,
      ...(ioType === "ISSUE" ? { issueId: issueId } : { objectiveId: issueId }),
      ioType: ioType,
    },
    enable: !!meetingId && !!issueId && !!ioType,
  });

  const { mutate: addProject } = useAddUpdateCompanyProject();

  const { data: projectStatusList } = useGetAllProjectStatus();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<CompanyProjectDataProps | null>(
    null,
  );

  const handleAdd = (data: IProjectFormData) => {
    if (issueId && meetingId) {
      const payload = {
        meetingId: meetingId,
        projectId: data.projectId,
        ...(ioType === "ISSUE"
          ? { issueId: issueId }
          : { objectiveId: issueId }),
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
      if (data && data.projectId && meetingId) {
        const payload = {
          projectId: data.projectId,
          meetingId: meetingId,
          ioType: ioType,
          ...(ioType === "ISSUE"
            ? {
                issueProjectId: data.issueProjectId,
              }
            : {
                objectiveProjectId: data.objectiveProjectId,
              }),
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
    [deleteProjectById, ioType, meetingId, projectsFireBase],
  );

  useEffect(() => {
    const db = getDatabase();
    const meetingRef = ref(
      db,
      `meetings/${meetingId}/timers/objectives/${selectedIssueId}/projects`,
    );

    onValue(meetingRef, (snapshot) => {
      if (snapshot.exists()) {
        queryClient.resetQueries({ queryKey: ["get-meeting-Project-res"] });
      }
    });

    return () => {
      off(meetingRef);
    };
  }, [selectedIssueId, meetingId]);

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
        showIndexColumn={false}
        isActionButton={() => true}
        isEditDelete={() => false}
        isEditDeleteShow={false}
        onRowClick={(row) => {
          if (row) {
            setSelected(row);
            setDrawerOpen(true);
          }
        }}
        permissionKey="users"
        actionColumnWidth="w-22"
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
        customActions={(row) => {
          return (
            <>
              <Button
                className="py-1 px-3 bg-transparent cursor-pointer hover:bg-transparent"
                onClick={() => {
                  conformDelete(row as unknown as IProjectFormData);
                }}
              >
                <Unlink className="w-4 h-4 text-red-700" />
              </Button>
            </>
          );
        }}
        sortableColumns={["projectName", "projectDeadline"]}
      />

      {drawerOpen && (
        <ProjectDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          projectData={selected}
          issueId={issueId}
          projectsFireBase={projectsFireBase}
          ioType={ioType}
        />
      )}
    </div>
  );
}
