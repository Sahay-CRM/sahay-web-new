/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import useGetCompanyReports from "@/features/api/Reports/useGetCompanyReports";
import useGetCompanyReportTemplates from "@/features/api/Reports/useGetCompanyReportTemplates";
import useCreateCompanyReport from "@/features/api/Reports/useCreateCompanyReport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  FileBarChart, 
  Plus, 
  Search, 
  Play, 
  Info,
  Calendar,
  AlertCircle,
  Trash2
} from "lucide-react";
import useDeleteCompanyReport from "@/features/api/Reports/useDeleteCompanyReport";

const getSortDetails = (sort: unknown) => {
  if (!sort) return { field: "", order: "asc" };
  if (Array.isArray(sort)) {
    if (sort.length > 0) {
      const first = sort[0] as Record<string, unknown>;
      return {
        field: String(first?.field || ""),
        order: String(first?.order || "asc")
      };
    }
    return { field: "", order: "asc" };
  }
  const obj = sort as Record<string, unknown>;
  return {
    field: String(obj.field || ""),
    order: String(obj.order || "asc")
  };
};

export default function CompanyReportsList() {
  const { setBreadcrumbs } = useBreadcrumbs();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("my-reports");

  const { data: libraryReports, isLoading: loadingLibrary } = useGetCompanyReports();
  const { data: templates, isLoading: loadingTemplates } = useGetCompanyReportTemplates();
  const { mutate: createReport, isPending: creatingReport } = useCreateCompanyReport();
  const { mutate: deleteReport } = useDeleteCompanyReport();

  const handleDeleteReport = (reportId: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the report "${name}"?`)) {
      deleteReport(reportId, {
        onSuccess: () => {
          toast.success(`"${name}" deleted successfully!`);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Failed to delete report.");
        }
      });
    }
  };

  useEffect(() => {
    setBreadcrumbs([
      { label: "Tasks", href: "/dashboard/tasks" },
      { label: "Reports Library", href: "" }
    ]);
  }, [setBreadcrumbs]);

  const handleAddTemplate = (templateId: string, name: string, description?: string) => {
    createReport({
      reportTemplateId: templateId,
      reportName: name,
      reportDescription: description || "Customized company report"
    }, {
      onSuccess: () => {
        toast.success(`"${name}" added to your Reports Library successfully!`);
        setActiveTab("my-reports");
      },
      onError: (err: unknown) => {
        const errorObj = err as { response?: { data?: { message?: string } } };
        toast.error(errorObj?.response?.data?.message || "Failed to add report template.");
      }
    });
  };

  const filteredLibrary = (libraryReports || []).filter(rep => 
    rep.reportName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (rep.reportDescription || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTemplates = (templates || []).filter(temp => 
    temp.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (temp.templateDescription || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLoading = loadingLibrary || loadingTemplates;

  return (
    <div className="p-6 bg-[#F8FAFC] min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileBarChart className="w-7 h-7 text-indigo-600" />
            Company Reports Library
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Access pre-configured reports or generate custom datasets for performance analysis.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-indigo-50 rounded-full" />
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute inset-0" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Loading reports and templates...</p>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-100/80 p-1 rounded-xl w-fit border border-gray-200/50">
            <TabsTrigger 
              value="my-reports" 
              className="px-5 py-2 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-xs"
            >
              My Reports ({filteredLibrary.length})
            </TabsTrigger>
            <TabsTrigger 
              value="templates"
              className="px-5 py-2 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-xs"
            >
              Templates Directory ({filteredTemplates.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Library Reports */}
          <TabsContent value="my-reports" className="outline-none">
            {filteredLibrary.length === 0 ? (
              <div className="bg-white border border-gray-200/60 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-2xs">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-800">No reports in your library</h3>
                <p className="text-gray-500 text-sm mt-2">
                  Browse and add report templates from the Directory tab to get started.
                </p>
                <button
                  onClick={() => setActiveTab("templates")}
                  className="mt-5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold inline-flex items-center gap-1.5 shadow-sm transition-all"
                >
                  Go to Templates Directory
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredLibrary.map((report) => (
                  <div 
                    key={report.reportId} 
                    className="bg-white rounded-2xl border border-gray-150/80 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between overflow-hidden"
                  >
                    <div className="p-5 space-y-4">
                      {/* Badge */}
                      <div className="flex justify-between items-start gap-2">
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                          {(report.reportConfig?.module || "TASK")} Report
                        </span>
                        <div className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(report.createdDatetime).toLocaleDateString()}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-gray-900 line-clamp-1">{report.reportName}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1 min-h-[2rem]">
                          {report.reportDescription || "No description provided."}
                        </p>
                      </div>

                      {/* Config summary details */}
                      <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100 text-xs space-y-2 text-gray-600">
                        <div className="flex justify-between">
                          <span className="font-medium">Columns:</span>
                          <span className="text-gray-500">{(report.reportConfig?.columns || []).length} columns</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Sorting:</span>
                          <span className="text-gray-500">
                            {(() => {
                              const s = getSortDetails(report.reportConfig?.sort);
                              return `${s.field || "Default"} (${s.order.toUpperCase()})`;
                            })()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Rules:</span>
                          <span className="text-gray-500">{(report.reportConfig?.filters || []).length} filter rules</span>
                        </div>
                      </div>
                    </div>

                    {/* Run Action */}
                    <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex gap-2 items-center">
                      <button
                        onClick={() => navigate(`/dashboard/company-reports/run/${report.reportId}`)}
                        className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-sm transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" /> Run Report
                      </button>
                      <button
                        onClick={() => handleDeleteReport(report.reportId, report.reportName)}
                        className="p-2 border border-red-200 hover:border-red-500 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Report"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 2: Templates Directory */}
          <TabsContent value="templates" className="outline-none">
            {filteredTemplates.length === 0 ? (
              <div className="bg-white border border-gray-200/60 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-2xs">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-800">No templates found</h3>
                <p className="text-gray-500 text-sm mt-2">
                  There are no report templates configured for your industry.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <div 
                    key={template.reportTemplateId} 
                    className="bg-white rounded-2xl border border-gray-150/80 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between overflow-hidden"
                  >
                    <div className="p-5 space-y-4">
                      {/* Badge */}
                      <div className="flex justify-between items-center">
                        <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                          {(template.reportConfig?.module || "TASK")} Template
                        </span>
                        {template.isDefault && (
                          <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md text-[10px] font-bold">
                            Default
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-gray-900 line-clamp-1">{template.templateName}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1 min-h-[2rem]">
                          {template.templateDescription || "Ready-to-use template for query execution."}
                        </p>
                      </div>

                      {/* Info alert block */}
                      <div className="flex gap-2 p-3 bg-indigo-50/50 rounded-xl text-xs text-indigo-700 border border-indigo-100/50">
                        <Info className="w-4 h-4 shrink-0 text-indigo-600" />
                        <span>Includes standard columns, default filters, and predefined sort orders.</span>
                      </div>
                    </div>

                    {/* Create Action */}
                    <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center">
                      <button
                        onClick={() => handleAddTemplate(template.reportTemplateId, template.templateName, template.templateDescription)}
                        disabled={creatingReport}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-sm transition-all"
                      >
                        <Plus className="w-4 h-4" /> Add to Library
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
