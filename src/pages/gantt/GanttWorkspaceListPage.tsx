import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, RefreshCw, Eye, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
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
} from "@/features/api/gantt";
import { fmtDate, WORKSPACE_STATUS_OPTIONS } from "./utils/gantt.utils";
import type {
  CompanyGanttWorkspace,
  GanttWorkspaceStatus,
} from "@/types/gantt";
import { Controller, useForm } from "react-hook-form";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import FormSelect from "@/components/shared/Form/FormSelect/FormSelect";
import { format } from "date-fns";
import TableData from "@/components/shared/DataTable/DataTable";
import { mapPaginationDetails } from "@/lib/mapPaginationDetails";
import SearchInput from "@/components/shared/SearchInput";

// Status badge color map
const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  ACTIVE: "bg-green-100 text-green-700",
  ON_HOLD: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-600",
};

export default function GanttWorkspaceListPage() {
  const { setBreadcrumbs } = useBreadcrumbs();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });
  const [deleteTarget, setDeleteTarget] =
    useState<CompanyGanttWorkspace | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    setBreadcrumbs([
      { label: "Gantt", href: "" },
      { label: "Workspaces", href: "" },
    ]);
  }, [setBreadcrumbs]);

  const { data, isLoading, refetch } = useGanttWorkspaces({
    currentPage: paginationFilter.currentPage ?? 1,
    pageSize: paginationFilter.pageSize ?? 25,
    workspaceStatus:
      statusFilter === "all"
        ? undefined
        : (statusFilter as GanttWorkspaceStatus),
    search: paginationFilter.search || undefined,
  });

  const deleteMutation = useDeleteGanttWorkspace();
  const createMutation = useCreateGanttWorkspace();

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
    },
  });

  const handleCreate = handleSubmit(async (values) => {
    const res = await createMutation.mutateAsync({
      workspaceName: values.workspaceName,
      workspaceDescription: values.workspaceDescription,
      startDate: new Date(values.startDate).toISOString(),
      targetEndDate: values.targetEndDate
        ? new Date(values.targetEndDate).toISOString()
        : undefined,
    });
    reset();
    setCreateOpen(false);
    navigate(`/dashboard/gantt/workspaces/${res.data.ganttWorkspaceId}`);
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
          {/* Status filter */}
          <div className="w-44">
            <FormSelect
              value={statusFilter}
              onChange={(val) =>
                setStatusFilter(Array.isArray(val) ? val[0] : val)
              }
              options={[
                { value: "all", label: "All Statuses" },
                ...WORKSPACE_STATUS_OPTIONS,
              ]}
              triggerClassName="h-9 rounded-lg border-slate-200 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
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
          actionColumnWidth="w-[120px]"
          customActions={(row) => (
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                title="Open Gantt"
                onClick={() =>
                  navigate(
                    `/dashboard/gantt/workspaces/${String(row.ganttWorkspaceId)}`,
                  )
                }
                className="inline-flex items-center justify-center h-8 w-8 rounded border border-slate-200 bg-white text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                type="button"
                title="Delete"
                onClick={() =>
                  setDeleteTarget(row as unknown as CompanyGanttWorkspace)
                }
                className="inline-flex items-center justify-center h-8 w-8 rounded border border-slate-200 bg-white text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
              >
                <Trash className="h-4 w-4" />
              </button>
            </div>
          )}
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
              width: "w-[130px]",
              render: (row) => {
                const status = (row as CompanyGanttWorkspace).workspaceStatus;
                return (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_COLORS[status] ?? "bg-slate-100 text-slate-600"}`}
                  >
                    {status.replace("_", " ")}
                  </span>
                );
              },
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

      {/* Create workspace modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Workspace</DialogTitle>
            <DialogDescription>
              Create an empty workspace. Add phases and items manually, or use a
              template.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
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
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
