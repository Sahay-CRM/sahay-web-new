import {
  X,
  Trash2,
  UserSearch,
  Mail,
  Phone,
  Briefcase,
  Building2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

import { ImageBaseURL } from "@/features/utils/urls.utils";

import useGetEmployeeById from "@/features/api/companyEmployee/useEmployeeById";

interface SidebarDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData?: TeamNodeData;
  nodeId: string | null;
  onDelete: (id: string) => void;
}

export default function SidebarDetails({
  isOpen,
  onClose,
  nodeData,
  nodeId,
  onDelete,
}: SidebarDetailsProps) {
  // Fetch full employee details using the API
  const { data: empRes, isLoading: isFetchingDetails } = useGetEmployeeById({
    filter: { employeeId: nodeData?.employeeId || "" },
    enable: !!nodeData?.employeeId && isOpen,
  });

  const employee = empRes?.data;

  if (!isOpen || !nodeData) return null;

  return (
    <div
      className={`fixed top-[65px] right-0 w-[420px] h-[calc(100vh-65px)] bg-white shadow-2xl border-l transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      <div className="flex items-center justify-between p-4 border-b bg-gray-50/50">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <UserSearch className="w-5 h-5 text-primary" /> Member Details
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-8">
        {/* Profile Card */}
        <div className="flex flex-col items-center text-center p-6 border rounded-2xl shadow-sm bg-gradient-to-b from-primary/5 to-transparent relative min-h-[160px] justify-center">
          {isFetchingDetails ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
              <p className="text-xs text-gray-400">Loading details...</p>
            </div>
          ) : (
            <>
              <Avatar className="h-24 w-24 border-4 border-white shadow-md mb-4">
                <AvatarImage
                  src={
                    employee?.photo &&
                    `${ImageBaseURL}/share/profilePics/${employee.photo}`
                  }
                  alt={employee?.employeeName}
                />
                <AvatarFallback className="bg-primary text-white text-3xl font-bold">
                  {employee?.employeeName
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-2xl font-bold text-gray-900">
                {employee?.employeeName}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-primary font-medium">
                <Briefcase className="w-4 h-4" />
                <span>
                  {employee?.designation?.designationName || "No Designation"}
                </span>
              </div>
              {employee?.department?.departmentName && (
                <div className="flex items-center gap-2 mt-1 text-gray-500 text-sm">
                  <Building2 className="w-4 h-4" />
                  <span>{employee?.department?.departmentName}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* <form onSubmit={handleSubmit(handleUpdate)} className="space-y-6"> */}
        <div className="space-y-4">
          {/* <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Reassign Member</Label>
              <Controller
                name="employeeId"
                control={control}
                render={({ field }) => (
                  <SearchDropdown
                    label="Select Employee"
                    options={employeeOptions}
                    selectedValues={field.value ? [field.value] : []}
                    onSelect={(val) => field.onChange(val.value)}
                    placeholder="Search employee..."
                    onSearchChange={setSearchTerm}
                    isLoading={isLoadingEmployees}
                  />
                )}
              />
              <p className="text-[10px] text-gray-400">Change the employee assigned to this organizational position.</p>
            </div> */}

          <div className="grid grid-cols-1 gap-4 pt-4">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                <Mail className="w-3 h-3" /> Email Address
              </div>
              <div className="text-sm font-medium text-gray-700 truncate">
                {isFetchingDetails ? "Loading..." : employee?.employeeEmail}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                <Phone className="w-3 h-3" /> Mobile Number
              </div>
              <div className="text-sm font-medium text-gray-700">
                {isFetchingDetails ? "Loading..." : employee?.employeeMobile}
              </div>
            </div>
          </div>
        </div>

        {/* <Button type="submit" className="w-full h-12 text-md font-semibold shadow-lg shadow-primary/20">
            Apply Reassignment
          </Button> */}
        {/* </form> */}

        <div className="pt-6 border-t border-red-50">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => {
              if (
                // eslint-disable-next-line no-alert
                window.confirm(
                  "Are you sure you want to remove this position from the team?",
                )
              ) {
                if (nodeId) onDelete(nodeId);
              }
            }}
          >
            <Trash2 className="w-4 h-4" /> Remove Position
          </Button>
        </div>
      </div>
    </div>
  );
}
