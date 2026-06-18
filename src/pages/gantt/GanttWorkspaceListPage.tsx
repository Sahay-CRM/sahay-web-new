import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ChevronDown, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { exportGanttTemplate } from "./utils/ganttExcel";
import GanttImportModal from "./components/GanttImportModal";
import { useGetEmployeeDd } from "@/features/api/companyEmployee";
// import Api from "@/features/utils/api.utils";
// import Urls from "@/features/utils/urls.utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import {
  useGanttWorkspaces,
  useDeleteGanttWorkspace,
  useCreateGanttWorkspace,
  useCreateWorkspaceFromTemplate,
  useGanttTemplatesGetAll,
  useUpdateGanttWorkspace,
} from "@/features/api/gantt";
import { fmtDate, WORKSPACE_STATUS_OPTIONS } from "./utils/gantt.utils";
import type {
  CompanyGanttWorkspace,
  // CompanyGanttPhase,
  GanttWorkspaceStatus,
} from "@/types/gantt";
import { Controller, useForm } from "react-hook-form";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import FormSelect from "@/components/shared/Form/FormSelect/FormSelect";
import { format } from "date-fns";
import TableData from "@/components/shared/DataTable/DataTable";
import { mapPaginationDetails } from "@/lib/mapPaginationDetails";
import SearchInput from "@/components/shared/SearchInput";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

// Status badge color map
const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  ACTIVE: "bg-green-100 text-green-700",
  ON_HOLD: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-600",
};

function WorkspaceStatusDropdown({ row }: { row: CompanyGanttWorkspace }) {
  const updateMutation = useUpdateGanttWorkspace(row.ganttWorkspaceId);

  const handleStatusChange = async (status: string) => {
    await updateMutation.mutateAsync({
      workspaceStatus: status as GanttWorkspaceStatus,
    });
  };

  const currentStatus = WORKSPACE_STATUS_OPTIONS.find(
    (opt) => opt.value === row.workspaceStatus,
  );
  const statusClass =
    STATUS_COLORS[row.workspaceStatus] ?? "bg-slate-100 text-slate-600";

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={updateMutation.isPending}
            className={`h-8 min-w-[110px] justify-between text-[11px] font-semibold px-3 py-1 rounded-full ${statusClass} border border-transparent hover:border-slate-200 transition-all cursor-pointer`}
          >
            {currentStatus?.label || row.workspaceStatus}
            <ChevronDown className="w-3.5 h-3.5 ml-1.5 shrink-0 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="bg-white border rounded-md shadow-md p-1 min-w-[120px]"
        >
          {WORKSPACE_STATUS_OPTIONS.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => handleStatusChange(opt.value)}
              className="text-xs px-2.5 py-1.5 rounded cursor-pointer hover:bg-slate-50 transition-colors focus:bg-slate-50 focus:outline-none"
            >
              {opt.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function RowTemplateActions({
  // row,
  // employees,
  onImportClick,
}: {
  row: CompanyGanttWorkspace;
  employees: EmployeeDetails[];
  onImportClick: () => void;
}) {
  // const [isExporting, setIsExporting] = useState(false);

  // const handleExport = async (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   setIsExporting(true);
  //   try {
  //     const { data } = await Api.post<{
  //       data: { phases: CompanyGanttPhase[] };
  //     }>({
  //       url: Urls.ganttWorkspaceDetail(row.ganttWorkspaceId),
  //       data: {},
  //     });
  //     const phases = data.data?.phases || [];
  //     await exportGanttTemplate(row.workspaceName, phases, employees);
  //     toast.success("Excel template downloaded successfully.");
  //   } catch (err) {
  //     // eslint-disable-next-line no-console
  //     console.error("Export template error: ", err);
  //     toast.error("Failed to export template.");
  //   } finally {
  //     setIsExporting(false);
  //   }
  // };

  return (
    <div
      className="flex items-center gap-1.5"
      onClick={(e) => e.stopPropagation()}
    >
      {/* <Button
        variant="ghost"
        size="icon"
        disabled={isExporting}
        onClick={handleExport}
        className="h-8 w-8 text-slate-500 hover:text-slate-800"
        title="Download Excel Template"
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
        ) : (
          <Download className="h-4 w-4" />
        )}
      </Button> */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onImportClick}
        className="h-8 w-8 text-slate-500 hover:text-slate-800"
        title="Import Excel Template"
      >
        <Upload className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function GanttWorkspaceListPage() {
  const { setBreadcrumbs } = useBreadcrumbs();
  const navigate = useNavigate();

  // const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });
  const [deleteTarget, setDeleteTarget] =
    useState<CompanyGanttWorkspace | null>(null);
  const [editTarget, setEditTarget] = useState<CompanyGanttWorkspace | null>(
    null,
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [importTarget, setImportTarget] =
    useState<CompanyGanttWorkspace | null>(null);

  const { data: employeeData } = useGetEmployeeDd({
    filter: { isDeactivated: false, pageSize: 1000 },
  });
  const employees = employeeData?.data || [];

  useEffect(() => {
    setBreadcrumbs([
      { label: "Gantt", href: "" },
      { label: "Workspaces", href: "" },
    ]);
  }, [setBreadcrumbs]);

  const { data, isLoading } = useGanttWorkspaces({
    currentPage: paginationFilter.currentPage ?? 1,
    pageSize: paginationFilter.pageSize ?? 25,
    // workspaceStatus:
    //   statusFilter === "all"
    //     ? undefined
    //     : (statusFilter as GanttWorkspaceStatus),
    search: paginationFilter.search || undefined,
  });

  const deleteMutation = useDeleteGanttWorkspace();
  const createMutation = useCreateGanttWorkspace();
  const createFromTemplateMutation = useCreateWorkspaceFromTemplate();
  const updateWorkspaceMutation = useUpdateGanttWorkspace(
    editTarget?.ganttWorkspaceId ?? "",
  );

  const { data: templatesData } = useGanttTemplatesGetAll();
  const templates = templatesData?.data ?? [];

  const workspaces = data?.data ?? [];

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      workspaceName: "",
      workspaceDescription: "",
      startDate: format(new Date(), "yyyy-MM-dd"),
      targetEndDate: "",
      templateId: "",
    },
  });

  useEffect(() => {
    if (createOpen) {
      if (editTarget) {
        reset({
          workspaceName: editTarget.workspaceName,
          workspaceDescription: editTarget.workspaceDescription || "",
          startDate: editTarget.startDate
            ? format(new Date(editTarget.startDate), "yyyy-MM-dd")
            : "",
          targetEndDate: editTarget.targetEndDate
            ? format(new Date(editTarget.targetEndDate), "yyyy-MM-dd")
            : "",
          templateId: "",
        });
      } else {
        reset({
          workspaceName: "",
          workspaceDescription: "",
          startDate: format(new Date(), "yyyy-MM-dd"),
          targetEndDate: "",
          templateId: "",
        });
      }
    }
  }, [createOpen, editTarget, reset]);

  const handleSave = handleSubmit(async (values) => {
    if (editTarget) {
      await updateWorkspaceMutation.mutateAsync({
        workspaceName: values.workspaceName,
        workspaceDescription: values.workspaceDescription,
        targetEndDate: values.targetEndDate
          ? new Date(values.targetEndDate).toISOString()
          : undefined,
      });
      setCreateOpen(false);
      setEditTarget(null);
      reset();
    } else {
      if (values.templateId) {
        await createFromTemplateMutation.mutateAsync({
          templateId: values.templateId,
          workspaceName: values.workspaceName,
          workspaceDescription: values.workspaceDescription,
          startDate: new Date(values.startDate).toISOString(),
          targetEndDate: values.targetEndDate
            ? new Date(values.targetEndDate).toISOString()
            : undefined,
        });
        reset();
        setCreateOpen(false);
      } else {
        await createMutation.mutateAsync({
          workspaceName: values.workspaceName,
          workspaceDescription: values.workspaceDescription,
          startDate: new Date(values.startDate).toISOString(),
          targetEndDate: values.targetEndDate
            ? new Date(values.targetEndDate).toISOString()
            : undefined,
        });
        reset();
        setCreateOpen(false);
      }
    }
  });

  // Table columns
  const columns: Record<string, string> = {
    srNo: "Sr No",
    workspaceName: "Workspace Name",
    workspaceDescription: "Description",
    startDate: "Start Date",
    targetEndDate: "Target End Date",
  };

  const tableData = workspaces.map((ws, index) => ({
    ...ws,
    srNo:
      ((paginationFilter.currentPage ?? 1) - 1) *
        (paginationFilter.pageSize ?? 25) +
      index +
      1,
    startDate: fmtDate(ws.startDate),
    targetEndDate: ws.targetEndDate ? fmtDate(ws.targetEndDate) : "-",
  }));

  return (
    <div className="w-full h-full flex flex-col px-2 sm:px-4 py-6 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 shrink-0 gap-4">
        <div className="flex items-center gap-3">
          <SearchInput
            placeholder="Search..."
            searchValue={paginationFilter?.search || ""}
            setPaginationFilter={setPaginationFilter}
            className="w-72"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await exportGanttTemplate("Gantt", [], employees);
              toast.success("Blank template downloaded.");
            }}
          >
            <Download className="h-4 w-4 mr-1.5" /> Template
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> New Workspace
          </Button>
        </div>
      </div>

      {/* DataTable */}
      <div className="flex-1 bg-white overflow-hidden flex flex-col tb:pt-4">
        <TableData
          tableHeightClass="flex-1"
          tableData={tableData}
          columns={columns}
          primaryKey="ganttWorkspaceId"
          isLoading={isLoading}
          onEdit={(row) => {
            setEditTarget(row as unknown as CompanyGanttWorkspace);
            setCreateOpen(true);
          }}
          onDelete={(row) =>
            setDeleteTarget(row as unknown as CompanyGanttWorkspace)
          }
          onViewButton={(row) =>
            navigate(
              `/dashboard/gantt/workspaces/${String(row.ganttWorkspaceId)}`,
            )
          }
          viewButton={true}
          isActionButton={() => true}
          permissionKey="ganttWorkspaceId"
          moduleKey="GANTT_CHART"
          actionColumnWidth="w-[120px]"
          paginationDetails={
            data
              ? mapPaginationDetails({
                  currentPage: data.currentPage,
                  pageSize: data.pageSize,
                  totalCount: data.totalCount,
                  totalPage: Math.ceil(
                    (data.totalCount || 0) / (data.pageSize || 25),
                  ),
                  hasMore:
                    data.currentPage <
                    Math.ceil((data.totalCount || 0) / (data.pageSize || 25)),
                  status: data.status,
                  message: data.message,
                })
              : undefined
          }
          setPaginationFilter={setPaginationFilter}
          searchValue={paginationFilter?.search}
          extraColumns={[
            {
              label: "Status",
              width: "w-[120px]",
              render: (row) => (
                <WorkspaceStatusDropdown row={row as CompanyGanttWorkspace} />
              ),
            },
            {
              label: "Templates",
              width: "w-[120px]",
              render: (row) => (
                <RowTemplateActions
                  row={row as CompanyGanttWorkspace}
                  employees={employees}
                  onImportClick={() =>
                    setImportTarget(row as CompanyGanttWorkspace)
                  }
                />
              ),
            },
          ]}
        />
      </div>

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workspace</DialogTitle>
            <DialogDescription>
              Delete &quot;{deleteTarget?.workspaceName}&quot;? All phases,
              items, and dependencies will be removed. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={async () => {
                if (!deleteTarget) return;
                await deleteMutation.mutateAsync(deleteTarget.ganttWorkspaceId);
                setDeleteTarget(null);
              }}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create / Edit workspace modal */}
      <Dialog
        open={createOpen}
        onOpenChange={(val) => {
          setCreateOpen(val);
          if (!val) {
            setEditTarget(null);
            reset();
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Edit Workspace" : "New Workspace"}
            </DialogTitle>
            <DialogDescription>
              {editTarget
                ? "Update workspace details."
                : "Create an empty workspace. Add phases and items manually, or use a template."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <Controller
              name="workspaceName"
              control={control}
              rules={{ required: "Name is required" }}
              render={({ field }) => (
                <FormInputField
                  {...field}
                  label="Workspace Name"
                  placeholder="e.g. Q4 Implementation"
                  isMandatory
                  error={errors.workspaceName}
                />
              )}
            />
            <Controller
              name="workspaceDescription"
              control={control}
              render={({ field }) => (
                <FormInputField
                  {...field}
                  label="Description"
                  placeholder="Optional"
                />
              )}
            />
            {!editTarget && (
              <Controller
                name="templateId"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    label="Initialize from Template"
                    value={field.value}
                    onChange={(val) =>
                      field.onChange(Array.isArray(val) ? val[0] : val)
                    }
                    options={templates.map((t) => ({
                      value: t.ganttTemplateId,
                      label: t.templateName,
                    }))}
                    isClear={true}
                    placeholder="Select a template (optional)"
                  />
                )}
              />
            )}
            <Controller
              name="startDate"
              control={control}
              rules={{ required: "Start date is required" }}
              render={({ field }) => (
                <FormInputField
                  {...field}
                  type="date"
                  label="Start Date"
                  isMandatory
                  disabled={!!editTarget}
                  error={errors.startDate}
                />
              )}
            />
            <Controller
              name="targetEndDate"
              control={control}
              render={({ field }) => (
                <FormInputField
                  {...field}
                  type="date"
                  label="Target End Date"
                  placeholder="Optional"
                />
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCreateOpen(false);
                  setEditTarget(null);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createMutation.isPending ||
                  createFromTemplateMutation.isPending ||
                  updateWorkspaceMutation.isPending
                }
              >
                {createMutation.isPending ||
                createFromTemplateMutation.isPending ||
                updateWorkspaceMutation.isPending
                  ? editTarget
                    ? "Saving..."
                    : "Creating..."
                  : editTarget
                    ? "Save Changes"
                    : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {importTarget && (
        <GanttImportModal
          open={!!importTarget}
          onOpenChange={(open) => {
            if (!open) setImportTarget(null);
          }}
          workspaceId={importTarget.ganttWorkspaceId}
          workspaceName={importTarget.workspaceName}
        />
      )}
    </div>
  );
}
