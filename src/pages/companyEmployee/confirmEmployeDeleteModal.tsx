import { useState } from "react";
// import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
// import { getUserDetail } from "@/features/selectors/auth.selector";
import ModalData from "@/components/shared/Modal/ModalData";
import { formatEmployeeType } from "@/features/utils/app.utils";

interface DeleteModalProps {
  modalData: EmployeeData;
  title: string;
  isModalOpen: boolean;
  modalClose: () => void;
  onSubmit: (isGroupDelete?: boolean) => void;
  isChildData?: string;
  onForceSubmit?: () => void;
  showDeleteOptions?: boolean;
  isForceDelete?: boolean;
}

const ConfirmationDeleteModal: React.FC<DeleteModalProps> = ({
  title,
  modalData,
  isModalOpen,
  modalClose,
  onSubmit,
  isChildData,
  // onForceSubmit,
  showDeleteOptions = false,
  // isForceDelete = false,
}) => {
  const navigate = useNavigate();
  // const userData = useSelector(getUserDetail);
  const [deleteOption, setDeleteOption] = useState<"single" | "group">(
    "single",
  );

  return (
    <div>
      <ModalData
        isModalOpen={isModalOpen}
        modalTitle={title}
        modalClose={modalClose}
        buttons={
          isChildData
            ? [
                {
                  btnText: "Cancel",
                  buttonCss: "py-1.5 px-5",
                  btnClick: modalClose,
                },
                {
                  btnText: "Handover",
                  buttonCss: "py-1.5 px-5 bg-blue-600 text-white hover:bg-blue-500",
                  btnClick: () => {
                    modalClose();
                    navigate("/dashboard/handover", {
                      state: { oldUserId: modalData.employeeId },
                    });
                  },
                },
              ]
            : [
                {
                  btnText: "Cancel",
                  buttonCss: "py-1.5 px-5",
                  btnClick: modalClose,
                },
                {
                  btnText: "Submit",
                  buttonCss: "py-1.5 px-5",
                  btnClick: () => onSubmit(deleteOption === "group"),
                },
              ]
        }
      >
        <div className="space-y-4 text-sm">
          {/* Main KPI details */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm p-3">
            {modalData?.employeeName && (
              <div>
                <span className="font-medium text-primary">
                  Employee Name :{" "}
                </span>
                {modalData.employeeName}
              </div>
            )}

            {modalData?.employeeEmail && (
              <div>
                <span className="font-medium text-primary">Email : </span>
                {modalData.employeeEmail}
              </div>
            )}

            {modalData?.employeeMobile && (
              <div>
                <span className="font-medium text-primary">Mobile : </span>
                {modalData.employeeMobile}
              </div>
            )}

            {modalData?.departmentName && (
              <div>
                <span className="font-medium text-primary">Department : </span>
                {modalData.departmentName}
              </div>
            )}

            {(modalData?.designationName || modalData?.employeeType) && (
              <div>
                <span className="font-medium text-primary">Designation : </span>
                {modalData.designationName || formatEmployeeType(modalData.employeeType || "")}
              </div>
            )}

            {/* <div>
              <span className="font-medium text-primary">
                Is Super Admin :{" "}
              </span>
              {modalData?.isSuperAdmin ? "Yes" : "No"}
            </div> */}

            <div>
              <span className="font-medium text-primary">Deactivated : </span>
              {modalData?.isDeactivated ? "Yes" : "No"}
            </div>
          </div>

          {/* Child Data Section */}
          {isChildData && (
            <div className="border-t pt-2">
              <span className="font-bold text-black">{isChildData}</span>
            </div>
          )}

          {/* Delete Options */}
          {showDeleteOptions && (
            <div className="mt-4 space-y-2">
              <label className="font-medium text-primary">Delete Options</label>

              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="deleteOption"
                    value="single"
                    checked={deleteOption === "single"}
                    onChange={() => setDeleteOption("single")}
                  />
                  <span>Delete only this task</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="deleteOption"
                    value="group"
                    checked={deleteOption === "group"}
                    onChange={() => setDeleteOption("group")}
                  />
                  <span>Delete the whole group</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </ModalData>
    </div>
  );
};

export default ConfirmationDeleteModal;
