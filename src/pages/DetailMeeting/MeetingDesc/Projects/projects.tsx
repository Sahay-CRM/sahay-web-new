import { useCallback, useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { formatToLocalDateTime } from "@/features/utils/app.utils";
import { useParams } from "react-router-dom";
import { off, onValue, ref } from "firebase/database";
import { toast } from "sonner";
import { queryClient } from "@/queryClient";
import { database } from "@/firebaseConfig";

import TableData, {
  ColumnConfig,
} from "@/components/shared/DataTable/DataTable";
import AssigneeAvatars from "@/components/shared/AssigneeAvatars/AssigneeAvatars";
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
import Loader from "@/components/shared/Loader/Loader";

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
  isTeamLeader?: boolean | undefined;
  headerLeft?: React.ReactNode;
  isExtra?: boolean;
  joiners?: Joiners[];
}

export default function Projects({
  projectsFireBase,
  issueId,
  ioType,
  selectedIssueId,
  isTeamLeader,
  headerLeft,
  isExtra,
  joiners,
}: ProjectProps) {
  const { id: meetingId } = useParams();
  const { mutate: addMeetingProject } = addMeetingProjectDataMutation();
  const { mutate: deleteProjectById } = deleteMeetingProjectMutation();

  const { data: selectedProjects, isLoading: isProjectLoading } =
    useGetMeetingProject({
      filter: {
        meetingId: meetingId,
        ...(ioType === "ISSUE"
          ? { issueId: issueId }
          : { objectiveId: issueId }),
        ioType: ioType,
      },
      enable: !!meetingId && !!issueId && !!ioType,
    });

  const { mutate: addProject } = useAddUpdateCompanyProject();

  const { data: projectStatusList } = useGetAllProjectStatus({
    filter: {},
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<CompanyProjectDataProps | null>(
    null,
  );
  const [defaultProjectName, setDefaultProjectName] = useState("");

  const handleAdd = (data: IProjectFormData) => {
    if (issueId && meetingId) {
      const payload = {
        meetingId: meetingId,
        projectId: data.projectId,
        ...(ioType === "ISSUE"
          ? { issueId: issueId }
          : { objectiveId: issueId }),
        ioType: ioType,
        ...(isExtra ? { isExtra: true } : {}),
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
    { key: "srNo", label: "#", visible: true },
    { key: "projectName", label: "Project Name", visible: true },
    {
      key: "projectDeadline",
      label: "Project Deadline",
      visible: true,
    },
    { key: "assigneeNames", label: "Assignees", visible: true },
    { key: "projectDescription", label: "Project Description", visible: true },
    { key: "projectStatus", label: "Status", visible: true },
  ]);

  const tableColumns = useMemo(() => {
    const cols: Record<string, string | ColumnConfig> = {};
    columnToggleOptions.forEach((col) => {
      if (col.visible) {
        if (col.key === "assigneeNames") {
          cols[col.key] = {
            label: col.label,
            render: (_val: unknown, item: unknown) => {
              const project = item as CompanyProjectDataProps & {
                ProjectEmployees?: {
                  employeeId?: string;
                  employeeName?: string;
                  employeeImage?: string;
                }[];
                assignUsers?: {
                  employeeId?: string;
                  employeeName?: string;
                  employeeImage?: string;
                }[];
                employeeNames?: string[];
              };
              const assignees =
                project?.ProjectEmployees ||
                project?.assignUsers ||
                project?.employeeNames ||
                [];
              return <AssigneeAvatars users={assignees} />;
            },
          };
        } else {
          cols[col.key] = col.label;
        }
      }
    });
    return cols;
  }, [columnToggleOptions]);

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
    const db = database;
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
    setDefaultProjectName("");
    setDrawerOpen(true);
    setSelected(null);
  };

  if (isProjectLoading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col">
      <div className="flex gap-5 justify-between mb-5 shrink-0 items-center">
        <div className="flex items-center">{headerLeft}</div>
        <div className="flex gap-5 items-center ml-auto">
          {isTeamLeader && (
            <>
              <ProjectSearchDropdown
                onAdd={handleAdd}
                minSearchLength={3}
                filterProps={{ pageSize: 25 }}
                onEnterPress={(value) => {
                  setDefaultProjectName(value);
                  setSelected(null);
                  setDrawerOpen(true);
                }}
              />
              <Button className="py-2 w-fit" onClick={handleAddProject}>
                Add Company Project
              </Button>
            </>
          )}
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
              ? formatToLocalDateTime(item.projectDeadline)
              : "",
            rawProjectDeadline: item.projectDeadline,
            status: item.projectStatusId,
            showDoth: item.deadlineRequest === "PENDING",
          })) ?? []
        }
        dotsKey="showDoth"
        dotsAnchorKey="projectName"
        columns={tableColumns}
        primaryKey="projectId"
        rowClassName={(item) => {
          const project = item as CompanyProjectDataProps;
          return project.isExtra ? "bg-amber-50 hover:bg-amber-100/80 font-medium" : "";
        }}
        showIndexColumn={false}
        isActionButton={() => true}
        isEditDelete={() => false}
        isEditDeleteShow={false}
        onRowClick={(row) => {
          if (row) {
            setDefaultProjectName("");
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
              {isTeamLeader && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="py-1 px-3 bg-transparent cursor-pointer hover:bg-transparent"
                        onClick={() => {
                          conformDelete(row as unknown as IProjectFormData);
                        }}
                      >
                        <Unlink className="w-4 h-4 text-red-700" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Unlink from this Meeting</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </>
          );
        }}
        sortableColumns={["projectName", "projectDeadline"]}
        tableHeightClass="flex-1"
      />

      {drawerOpen && (
        <ProjectDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          projectData={selected}
          issueId={issueId}
          projectsFireBase={projectsFireBase}
          ioType={ioType}
          isExtra={isExtra}
          defaultProjectName={defaultProjectName}
          joiners={joiners}
        />
      )}
    </div>
  );
}
