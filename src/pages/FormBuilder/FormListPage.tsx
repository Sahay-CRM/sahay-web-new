import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import TableData from "@/components/shared/DataTable/DataTable";
import SearchInput from "@/components/shared/SearchInput";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useGetForms } from "@/features/api/Form";
import useDeleteForm from "@/features/api/Form/useDeleteForm";
import {
  Plus,
  Pencil,
  Trash2,
  Settings,
  BarChart2,
  Link,
  Copy,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ShareModal } from "./builder/components/ShareModal";
import FormAddEditModal from "./builder/components/FormAddEditModal";
import { mapPaginationDetails } from "@/lib/mapPaginationDetails";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DropdownSearchMenu from "@/components/shared/DropdownSearchMenu/DropdownSearchMenu";
import useDuplicateForm from "@/features/api/Form/useDuplicateForm";
import { formatToProjectDateTime } from "@/features/utils/formatting.utils";
// Status filter tabs
type StatusFilter = "ALL" | "PUBLISHED" | "DRAFT";

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Draft", value: "DRAFT" },
];

export default function FormListPage() {
  const navigate = useNavigate();
  const { setBreadcrumbs } = useBreadcrumbs();
  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });
  const { data: formsData, isLoading } = useGetForms({
    filter: { ...paginationFilter },
  });
  const { mutate: deleteForm } = useDeleteForm();
  const { mutate: duplicateForm } = useDuplicateForm();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  // Modals state
  const [shareForm, setShareForm] = useState<FormDetails | null>(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<FormDetails | null>(null);

  useEffect(() => {
    setBreadcrumbs([{ label: "Forms", href: "" }]);
  }, [setBreadcrumbs]);

  const [columnToggleOptions, setColumnToggleOptions] = useState([
    { key: "srNo", label: "Sr No", visible: true },
    { key: "name", label: "Form Name", visible: true },
    { key: "visibility", label: "Visibility", visible: true },
    { key: "statusLabel", label: "Status", visible: true },
    { key: "notificationEmail", label: "Notification Email", visible: true },
    { key: "formattedDate", label: "Created At", visible: true },
  ]);

  // Filter visible columns
  const visibleColumns = columnToggleOptions.reduce(
    (acc, col) => {
      if (col.visible) acc[col.key] = col.label;
      return acc;
    },
    {} as Record<string, string>,
  );
  const canToggleColumns = columnToggleOptions.length > 3;
  // Toggle column visibility
  const onToggleColumn = (key: string) => {
    setColumnToggleOptions((prev) =>
      prev.map((col) =>
        col.key === key ? { ...col, visible: !col.visible } : col,
      ),
    );
  };
  const handleCreateNew = () => {
    setSelectedForm(null);
    setIsAddEditModalOpen(true);
  };
  const handleEditBasicInfo = (form: FormDetails) => {
    setSelectedForm(form);
    setIsAddEditModalOpen(true);
  };
  const handleOpenBuilder = (id: string) =>
    navigate(`/dashboard/form-builder?id=${id}`);
  const handleSettings = (id: string) =>
    navigate(`/dashboard/forms/${id}/settings`);
  const handleResponses = (id: string) =>
    navigate(`/dashboard/forms/${id}/responses`);
  const handleDelete = (id: string) => deleteForm(id);
  const handleDuplicate = (id: string) => duplicateForm(id);

  // Filter logic
  const allForms = useMemo(() => formsData?.data || [], [formsData?.data]);
  const currentPage = formsData?.currentPage ?? 1;
  const pageSize = formsData?.pageSize ?? 25;
  // ✅ Combined Filter (Status + Search)
  const filteredForms = useMemo(() => {
    return allForms
      .filter((form) => {
        if (statusFilter === "ALL") return true;
        if (statusFilter === "PUBLISHED") return form.isActive;
        if (statusFilter === "DRAFT") return !form.isActive;
        return true;
      })
      .filter((form) =>
        form.name
          ?.toLowerCase()
          .includes(paginationFilter?.search?.toLowerCase() || ""),
      );
  }, [allForms, statusFilter, paginationFilter]);

  return (
    <div className="w-full px-2 overflow-x-auto sm:px-4 py-4">
      {/* Form Add/Edit Modal (Name/Description only) */}
      {isAddEditModalOpen && (
        <FormAddEditModal
          isModalOpen={isAddEditModalOpen}
          modalClose={() => setIsAddEditModalOpen(false)}
          modalData={selectedForm}
          // onSuccess={(id) => handleOpenBuilder(id)}
        />
      )}

      {/* Share Modal */}
      {shareForm && (
        <ShareModal
          isOpen={!!shareForm}
          onClose={() => setShareForm(null)}
          form={shareForm}
          onUpdateVisibility={(visibility) =>
            setShareForm((prev) => (prev ? { ...prev, visibility } : prev))
          }
          onUpdateMobileNumbers={(mobileNumbers) =>
            setShareForm((prev) => (prev ? { ...prev, mobileNumbers } : prev))
          }
        />
      )}

      <div className="flex mb-5 justify-between items-center">
        <h1 className="font-semibold capitalize text-xl text-black">
          Forms List
        </h1>
        <Button
          className="py-2 w-fit bg-[#2f328e] hover:bg-[#1e205e]"
          onClick={handleCreateNew}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Form
        </Button>
      </div>

      {/* Search + Status Filter */}
      <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <SearchInput
            placeholder="Search Form..."
            searchValue={paginationFilter?.search || ""}
            setPaginationFilter={setPaginationFilter}
            className="w-80"
          />
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
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {STATUS_TABS.map((tab) => {
            const safeForms = allForms || [];

            const count =
              tab.value === "ALL"
                ? safeForms.length
                : tab.value === "PUBLISHED"
                  ? safeForms.filter((f) => f.isActive).length
                  : safeForms.filter((f) => !f.isActive).length;

            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  statusFilter === tab.value
                    ? "bg-white text-[#2f328e] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                <span
                  className={`ml-1.5 text-[10px] px-1 rounded-full ${
                    statusFilter === tab.value
                      ? "bg-[#2f328e]/10 text-[#2f328e]"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 bg-white py-2 tb:py-4 tb:mt-6">
        <TableData
          tableData={filteredForms.map((item, index) => ({
            ...item,
            srNo: (currentPage - 1) * pageSize + index + 1,

            statusLabel: item.isActive ? "Published" : "Draft",

            formattedDate: formatToProjectDateTime(item.createdDatetime),
            notificationEmail: item.notificationEmail || "-",
          }))}
          columns={visibleColumns}
          primaryKey="id"
          isLoading={isLoading}
          moduleKey="TASK"
          isActionButton={() => false}
          actionColumnWidth="w-[280px] overflow-hidden "
          setPaginationFilter={setPaginationFilter}
          paginationDetails={mapPaginationDetails(formsData)}
          searchValue={paginationFilter?.search}
          onRowClick={(row) => handleOpenBuilder(row.id as string)}
          customActions={(row: FormDetails) => (
            <div className="flex gap-1 justify-end">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 text-indigo-600 border-indigo-100 hover:bg-indigo-50"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenBuilder(row.id);
                }}
                title="View/Edit Fields"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 text-blue-600 border-blue-100 hover:bg-blue-50"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditBasicInfo(row);
                }}
                title="Edit Basic Info"
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 text-[#2f328e] border-[#2f328e]/20 hover:bg-[#2f328e]/5"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSettings(row.id);
                }}
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 text-green-600 border-green-100 hover:bg-green-50"
                onClick={(e) => {
                  e.stopPropagation();
                  handleResponses(row.id);
                }}
                title="Responses"
              >
                <BarChart2 className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 border-blue-100",
                  !row.isActive
                    ? "text-gray-300 border-gray-100 cursor-not-allowed"
                    : "text-blue-600 hover:bg-blue-50",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  if (row.isActive) setShareForm(row);
                }}
                disabled={!row.isActive}
                title={!row.isActive ? "Publish form to share" : "Share Link"}
              >
                <Link className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 text-blue-600 border-red-100 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDuplicate(row.id);
                }}
                title="Duplicate Form"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 text-red-600 border-red-100 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(row.id);
                }}
                title="Delete Form"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        />
      </div>
    </div>
  );
}
