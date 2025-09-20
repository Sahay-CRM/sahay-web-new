import ModalData from "@/components/shared/Modal/ModalData";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useAddUpdateCompanyProject,
  useGetAllProjectStatus,
} from "@/features/api/companyProject";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { isColorDark } from "@/features/utils/color.utils";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

interface ViewMeetingModalProps {
  modalData: IProjectFormData;
  isModalOpen: boolean;
  modalClose: () => void;
}

const ViewMeetingModal: React.FC<ViewMeetingModalProps> = ({
  modalData,
  isModalOpen,
  modalClose,
}) => {
  const navigate = useNavigate();
  const permission = useSelector(getUserPermission).PROJECT_LIST;

  const handleEdit = () => {
    if (modalData?.projectId) {
      navigate(`/dashboard/projects/edit/${modalData.projectId}`);
    }
  };
  const handleView = () => {
    if (modalData?.projectId) {
      navigate(`/dashboard/projects/view/${modalData.projectId}`);
    }
  };
  const { mutate: addProject } = useAddUpdateCompanyProject();

  const projectParameters = modalData?.ProjectSubParameterJunction?.map(
    (item) =>
      `${item.subPara?.coreParameter?.coreParameterName} | ${item.subPara?.subParameterName}`,
  ).join(", ");

  // Prepare comma-separated employees
  const projectEmployees = modalData?.ProjectEmployees
    ? modalData.ProjectEmployees.map((emp) => emp.employeeName).join(", ")
    : modalData?.employeeIds?.join(", ");
  const { data: projectStatusList } = useGetAllProjectStatus({
    filter: {},
  });
  const statusOptions = (projectStatusList?.data ?? []).map((item) => ({
    label: item.projectStatus,
    value: item.projectStatusId,
    color: item.color || "#2e3195",
  }));
  const [open, setOpen] = useState(false);

  const handleStatusChange = (ele: string) => {
    const payload = {
      projectStatusId: ele,
      projectId: modalData.projectId,
    };
    // Close the dropdown menu first
    setOpen(false);
    setTimeout(() => {
      addProject(payload);
      modalClose();
    }, 100);
  };
  const MAX_DESC_LENGTH = 105;

  const [showFullDesc, setShowFullDesc] = useState(false);

  const isLongDesc =
    modalData?.projectDescription &&
    modalData.projectDescription.length > MAX_DESC_LENGTH;

  const displayedDesc =
    !isLongDesc || showFullDesc
      ? modalData?.projectDescription
      : modalData?.projectDescription.substring(0, MAX_DESC_LENGTH) + "...";

  return (
    <ModalData
      isModalOpen={isModalOpen}
      modalTitle="Project Details"
      modalClose={modalClose}
      buttons={[
        {
          btnText: "Close",
          buttonCss: "py-1.5 px-5",
          btnClick: modalClose,
        },
        ...(permission.Edit
          ? [
              {
                btnText: "Edit",
                buttonCss: "py-1.5 px-5",
                btnClick: handleEdit,
              },
            ]
          : []),
        {
          btnText: "View",
          buttonCss: "py-1.5 px-5",
          btnClick: handleView,
        },
      ]}
    >
      <div className="space-y-4 text-sm text-gray-700">
        {/* Project Name */}
        {modalData?.projectName && (
          <div>
            <span className="font-medium text-primary">Project Name : </span>
            {modalData.projectName}
          </div>
        )}

        {/* Project Description */}
        {modalData?.projectDescription && (
          <div>
            <span className="font-medium text-primary">
              Project Description:{" "}
            </span>
            <span className="text-gray-700">
              {displayedDesc}{" "}
              {isLongDesc && (
                <button
                  onClick={() => setShowFullDesc(!showFullDesc)}
                  className="text-sm text-primary font-medium hover:underline ml-1"
                >
                  {showFullDesc ? "See Less" : "See More"}
                </button>
              )}
            </span>
          </div>
        )}

        {/* Project Description */}
        {modalData?.projectDeadline && (
          <div>
            <span className="font-medium text-primary">
              Project Deadline :{" "}
            </span>
            {modalData.projectDeadline}
          </div>
        )}
        {/* Project Employees */}
        {projectEmployees && (
          <div>
            <span className="font-medium text-primary">
              Project Employees :{" "}
            </span>
            {projectEmployees}
          </div>
        )}

        {/* Project Parameters */}
        {projectParameters && (
          <div>
            <span className="font-medium text-primary">
              Project Parameters:{" "}
            </span>
            {projectParameters}
          </div>
        )}
        {/* Project Status */}
        {statusOptions.length > 0 && (
          <div className="flex items-center">
            <span className="font-medium text-primary mr-2">
              Project Status :
            </span>
            <DropdownMenu open={open} onOpenChange={setOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className=" focus-visible:border-none h-8 min-w-[140px] justify-between"
                  style={{
                    backgroundColor:
                      statusOptions.find(
                        (option) => option.value === modalData?.projectStatusId,
                      )?.color || undefined,
                    color: (() => {
                      const bg = statusOptions.find(
                        (option) => option.value === modalData?.projectStatusId,
                      )?.color;
                      return bg
                        ? isColorDark(bg)
                          ? "#fff"
                          : "#000"
                        : undefined;
                    })(),
                  }}
                >
                  {statusOptions.find(
                    (option) => option.value === modalData?.projectStatusId,
                  )?.label || "Select"}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {statusOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </ModalData>
  );
};

export default ViewMeetingModal;
