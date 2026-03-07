import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useGetForm, useGetFormResponse } from "@/features/api/Form";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye } from "lucide-react";
import SearchInput from "@/components/shared/SearchInput";
import { Button } from "@/components/ui/button";
import TableData from "@/components/shared/DataTable/DataTable";
import { formatToProjectDateTime } from "@/features/utils/formatting.utils";
import { mapPaginationDetails } from "@/lib/mapPaginationDetails";

export default function FormResponsesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setBreadcrumbs } = useBreadcrumbs();

  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });

  // Get form metadata
  const { data: formData, isLoading: formLoading } = useGetForm(id || "");

  // Get responses listing
  const { data: responsesData, isLoading: responsesLoading } =
    useGetFormResponse(id || "", paginationFilter);

  const form = formData?.data;

  useEffect(() => {
    setBreadcrumbs([
      { label: "Forms", href: "/dashboard/forms" },
      { label: `${form?.name} Form Responses`, href: "" },
    ]);
  }, [setBreadcrumbs, form?.name, id]);

  const visibleColumns = {
    srNo: "No.",
    name: "User Name",
    mobileNumber: "Mobile Number",
    formattedDate: "Submitted At",
    status: "Status",
  };

  if (formLoading || responsesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-[#2f328e]" />
        <span className="ml-2 text-sm text-gray-500">Loading responses...</span>
      </div>
    );
  }

  return (
    <div className="w-full px-2 sm:px-4 py-4">
      <div className="flex items-center gap-3 mb-5">
        {/* <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-gray-500"
          onClick={() => navigate(`/dashboard/form-builder?id=${id}`)}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button> */}
        <div>
          <h1 className="font-semibold text-xl text-black">
            {form?.name || "Form"}
          </h1>
          <p className="text-xs text-gray-500">Submissions Listing</p>
        </div>
      </div>
      <SearchInput
        placeholder="Search responses..."
        searchValue={paginationFilter?.search || ""}
        setPaginationFilter={setPaginationFilter}
        className="w-80 mb-6"
      />
      <div className="bg-white mt-5 overflow-hidden mb-6">
        <TableData
          tableData={responsesData?.data.map((submission, index) => ({
            ...submission,
            srNo:
              (responsesData.currentPage - 1) * responsesData.pageSize +
              index +
              1,
            userMobile: (
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">
                  {submission.name || "Anonymous"}
                </span>
                <span className="text-xs text-gray-500">
                  {submission.mobileNumber}
                </span>
              </div>
            ),
            formattedDate: formatToProjectDateTime(submission.createdAt),
            statusLabel: (
              <Badge
                variant={
                  submission.status === "SUBMITTED" ? "default" : "destructive"
                }
                className="text-[10px] font-normal"
              >
                {submission.status?.replace(/_/g, " ")}
              </Badge>
            ),
          }))}
          columns={visibleColumns}
          primaryKey="id"
          isLoading={responsesLoading}
          moduleKey="FORM_RESPONSE"
          isActionButton={() => false}
          actionColumnWidth="w-[120px]"
          setPaginationFilter={setPaginationFilter}
          paginationDetails={mapPaginationDetails(responsesData)}
          searchValue={paginationFilter.search}
          customActions={(row) => (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-[#2f328e] border-[#2f328e]/20 hover:bg-[#2f328e] hover:text-white transition-all shadow-sm"
                onClick={() =>
                  navigate(`/dashboard/form-submission-detail/${row.id}`)
                }
              >
                <Eye className="w-3.5 h-3.5" />
                Detail
              </Button>
            </div>
          )}
        />
      </div>
    </div>
  );
}
