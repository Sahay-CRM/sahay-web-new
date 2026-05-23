import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, RefreshCw, Copy, Eye, Trash2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useGanttTemplates } from "@/features/api/gantt";
import {
  useDeleteGanttTemplate,
  usePublishGanttTemplate,
  useDuplicateGanttTemplate,
  useCreateGanttTemplate,
} from "@/features/api/gantt";
import { SpinnerIcon } from "@/components/shared/Icons";
import { fmtDate } from "./utils/gantt.utils";
import type { GanttTemplate } from "@/types/gantt";
import { Controller, useForm } from "react-hook-form";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import FormSelect from "@/components/shared/Form/FormSelect/FormSelect";

interface CreateTemplateForm {
  templateName: string;
  templateDescription?: string;
  ownerType: string;
}

export default function GanttTemplatePage() {
  const { setBreadcrumbs } = useBreadcrumbs();
  const navigate = useNavigate();

  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<GanttTemplate | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(
      () => setDebouncedSearch(paginationFilter.search ?? ""),
      400,
    );
    return () => clearTimeout(t);
  }, [paginationFilter.search]);

  useEffect(() => {
    setBreadcrumbs([
      { label: "Gantt", href: "/dashboard/gantt/workspaces" },
      { label: "Templates", href: "" },
    ]);
  }, [setBreadcrumbs]);

  const { data, isLoading, refetch } = useGanttTemplates({
    currentPage: paginationFilter.currentPage ?? 1,
    pageSize: paginationFilter.pageSize ?? 25,
    search: debouncedSearch,
  });

  const deleteMutation = useDeleteGanttTemplate();
  const publishMutation = usePublishGanttTemplate();
  const duplicateMutation = useDuplicateGanttTemplate();
  const createMutation = useCreateGanttTemplate();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTemplateForm>({
    defaultValues: {
      templateName: "",
      templateDescription: "",
      ownerType: "COMPANY",
    },
  });

  const handleCreate = handleSubmit(async (values) => {
    const res = await createMutation.mutateAsync({
      templateName: values.templateName,
      templateDescription: values.templateDescription,
      ownerType: values.ownerType as "COMPANY" | "SYSTEM",
    });
    setCreateOpen(false);
    reset();
    navigate(`/dashboard/gantt/templates/${res.data.ganttTemplateId}`);
  });

  const templates = data?.data ?? [];
  const total = data?.totalCount ?? 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Gantt Templates
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Reusable project plan blueprints
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> New Template
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-72">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={paginationFilter.search ?? ""}
          onChange={(e) =>
            setPaginationFilter((p) => ({
              ...p,
              search: e.target.value,
              currentPage: 1,
            }))
          }
          className="pl-8"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <SpinnerIcon />
        </div>
      ) : templates.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-muted-foreground text-sm">No templates found.</p>
          <Button
            size="sm"
            className="mt-4"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" /> Create First Template
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tpl) => (
            <TemplateCard
              key={tpl.ganttTemplateId}
              template={tpl}
              onDelete={() => setDeleteTarget(tpl)}
              onPublish={() => publishMutation.mutate(tpl.ganttTemplateId)}
              onDuplicate={() => duplicateMutation.mutate(tpl.ganttTemplateId)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > (paginationFilter.pageSize ?? 25) && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={(paginationFilter.currentPage ?? 1) === 1}
            onClick={() =>
              setPaginationFilter((p) => ({
                ...p,
                currentPage: (p.currentPage ?? 1) - 1,
              }))
            }
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {paginationFilter.currentPage} · {total} total
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={
              (paginationFilter.currentPage ?? 1) *
                (paginationFilter.pageSize ?? 25) >=
              total
            }
            onClick={() =>
              setPaginationFilter((p) => ({
                ...p,
                currentPage: (p.currentPage ?? 1) + 1,
              }))
            }
          >
            Next
          </Button>
        </div>
      )}

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Archive &quot;{deleteTarget?.templateName}&quot;? Existing
              workspaces will be unaffected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!deleteTarget) return;
                await deleteMutation.mutateAsync(deleteTarget.ganttTemplateId);
                setDeleteTarget(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Template</DialogTitle>
            <DialogDescription>
              Create a reusable project plan blueprint.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <Controller
              name="templateName"
              control={control}
              rules={{ required: "Template name is required" }}
              render={({ field }) => (
                <FormInputField
                  {...field}
                  label="Template Name"
                  placeholder="e.g. General Consulting Engagement"
                  isMandatory
                  error={errors.templateName}
                />
              )}
            />
            <Controller
              name="templateDescription"
              control={control}
              render={({ field }) => (
                <FormInputField
                  {...field}
                  label="Description"
                  placeholder="Optional description"
                />
              )}
            />
            <Controller
              name="ownerType"
              control={control}
              render={({ field }) => (
                <FormSelect
                  label="Owner Type"
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: "COMPANY", label: "Company (Private)" },
                    { value: "SYSTEM", label: "System (Global)" },
                  ]}
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

// ── Template Card ──────────────────────────────────────────────────────────

interface TemplateCardProps {
  template: GanttTemplate;
  onDelete: () => void;
  onPublish: () => void;
  onDuplicate: () => void;
}

function TemplateCard({
  template,
  onDelete,
  onPublish,
  onDuplicate,
}: TemplateCardProps) {
  return (
    <Card className="p-4 space-y-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">
            {template.templateName}
          </p>
          {template.templateDescription && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {template.templateDescription}
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
              <span className="sr-only">Actions</span>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link
                to={`/dashboard/gantt/templates/${template.ganttTemplateId}`}
              >
                <Eye className="h-3.5 w-3.5 mr-2" />
                View Detail
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onPublish}>
              <Send className="h-3.5 w-3.5 mr-2" />
              {template.isPublished ? "Create New Version" : "Publish"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="h-3.5 w-3.5 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge
          variant="outline"
          className={
            template.isPublished
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-slate-50 text-slate-600 border-slate-200"
          }
        >
          {template.isPublished ? "Published" : "Draft"}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {template.ownerType}
        </Badge>
        <Badge variant="outline" className="text-xs">
          v{template.version}
        </Badge>
        {!template.isActive && (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-600 border-red-200 text-xs"
          >
            Inactive
          </Badge>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        Created {fmtDate(template.createdDatetime)}
      </div>

      <div className="pt-1">
        <Link to={`/dashboard/gantt/templates/${template.ganttTemplateId}`}>
          <Button variant="outline" size="sm" className="w-full h-7 text-xs">
            <Eye className="h-3 w-3 mr-1" /> View
          </Button>
        </Link>
      </div>
    </Card>
  );
}
