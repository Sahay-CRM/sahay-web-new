import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useGetForm, useGetFormResponse } from "@/features/api/Form";
import { useSelector } from "react-redux";
import { getUserPermission } from "@/features/selectors/auth.selector";
import PageNotAccess from "../../PageNoAccess";
import {
  Submission,
  FormResponseItem,
} from "@/features/api/Form/useGetFormResponse";
import { Loader2, Eye, Download } from "lucide-react";
import SearchInput from "@/components/shared/SearchInput";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import TableData from "@/components/shared/DataTable/DataTable";
import { formatToProjectDateTime } from "@/features/utils/formatting.utils";
import { mapPaginationDetails } from "@/lib/mapPaginationDetails";
import FormSelect from "@/components/shared/Form/FormSelect/FormSelect";
import Api from "@/features/utils/api.utils";
import Urls from "@/features/utils/urls.utils";
import { toast } from "sonner";

export default function FormResponsesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setBreadcrumbs } = useBreadcrumbs();

  const [paginationFilter, setPaginationFilter] = useState<PaginationFilter>({
    currentPage: 1,
    pageSize: 25,
    search: "",
  });
  const [submissionStatus, setSubmissionStatus] = useState<string>("SUBMITTED");
  const [isExporting, setIsExporting] = useState(false);

  const statusOptions = [
    { label: "Submitted", value: "SUBMITTED" },
    { label: "Submitted With Error", value: "SUBMITTED_WITH_ERROR" },
  ];

  // Get form metadata
  const { data: formData, isLoading: formLoading } = useGetForm(id || "");

  // Get responses listing
  const { data: responsesData, isLoading: responsesLoading } =
    useGetFormResponse({
      filter: {
        ...paginationFilter,
        submissionStatus: submissionStatus,
        id: id,
      },
      enable: !!id,
    });

  const form = formData?.data;

  useEffect(() => {
    setBreadcrumbs([
      { label: "Forms", href: "/dashboard/forms" },
      { label: `${form?.name} Form Responses`, href: "" },
    ]);
  }, [setBreadcrumbs, form?.name, id]);

  const permission = useSelector(getUserPermission).FORM;

  if (!permission || permission.View === false) {
    return <PageNotAccess />;
  }

  const visibleColumns = {
    srNo: "No.",
    name: "User Name",
    mobileNumber: "Mobile Number",
    formattedDate: "Submitted At",
    score: "score",
    status: "Status",
  };

  const handleDownloadExcel = async () => {
    if (!form || !id) return;
    setIsExporting(true);

    try {
      const { data: res } = await Api.post<{
        success: boolean;
        data: Submission[];
      }>({
        url: Urls.getAllFormSubmissions(),
        data: { formId: id },
      });

      if (!res.success || !res.data) {
        toast.error("Failed to fetch submissions for export.");
        return;
      }

      const allSubmissions = (res.data || []).filter(
        (s) => s.status !== "NOT_SUBMITTED",
      );
      const questionFields = (form.fields || []).filter(
        (f) => f.fieldType !== "FILE",
      );

      const dataToExport = allSubmissions.map(
        (submission: Submission, index: number) => {
          const rowData: Record<string, string | number> = {
            "Sr. No.": index + 1,
            "User Name": submission.name || "Anonymous",
            "Mobile Number": submission.mobileNumber || "",
            Submitted: formatToProjectDateTime(submission.createdAt),
            Status: submission.status?.replace(/_/g, " "),
            "Correct Fields":
              submission.correctFields ?? submission.score?.correctFields ?? "",
            "Total Mcq Fields":
              submission.totalMcqFields ??
              submission.score?.totalMcqFields ??
              "",
            Score: submission.scoreString ?? "",
          };

          // Map each question response
          questionFields.forEach((field) => {
            const response = submission.formResponses?.find(
              (r: FormResponseItem) =>
                r.formFieldId === field.id || r.field?.id === field.id,
            );
            if (response) {
              rowData[field.label] = response.value;
            } else {
              rowData[field.label] = "";
            }
          });

          return rowData;
        },
      );

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Responses");

      const fileName = `${form.name.replace(/\s+/g, "_")}_Responses_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch {
      toast.error("An error occurred while exporting data.");
    } finally {
      setIsExporting(false);
    }
  };

  if (formLoading && responsesLoading) {
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
        <div>
          <h1 className="font-semibold text-xl text-black">
            {form?.name || "Form"}
          </h1>
          <p className="text-xs text-gray-500">Submissions Listing</p>
        </div>
      </div>
      <div className="flex justify-between gap-4 mb-6">
        <SearchInput
          placeholder="Search responses..."
          searchValue={paginationFilter?.search || ""}
          setPaginationFilter={setPaginationFilter}
          className="w-80"
        />

        <div className="flex items-center gap-4">
          <FormSelect
            placeholder="Select Status"
            options={statusOptions}
            value={submissionStatus}
            onChange={(val) => setSubmissionStatus(val as string)}
            className="w-[220px]"
            triggerClassName="h-10 py-0 border-gray-200 focus:ring-[#2f328e]/20"
          />

          <Button
            onClick={handleDownloadExcel}
            variant="outline"
            className="h-10 border-[#2f328e] text-[#2f328e] hover:bg-[#2f328e] hover:text-white"
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isExporting ? "Exporting..." : "Export to Excel"}
          </Button>
        </div>
      </div>
      <div className="bg-white mt-5 overflow-hidden mb-6">
        <TableData
          tableData={responsesData?.data.map(
            (submission: Submission, index: number) => ({
              ...submission,
              srNo:
                (responsesData.currentPage - 1) * responsesData.pageSize +
                index +
                1,
              score: submission?.score?.scoreString,
              formattedDate: formatToProjectDateTime(submission.createdAt),
            }),
          )}
          columns={visibleColumns}
          primaryKey="id"
          isLoading={responsesLoading}
          moduleKey="FORM"
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
