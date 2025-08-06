import ModalData from "@/components/shared/Modal/ModalData";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CornerDownLeft } from "lucide-react";
import { useState } from "react";

// Define types for the data structures being used
interface DetailMeetingObjectives {
  id: string;
  name: string;
  type: string;
}

interface IssueAgendaAddModalProps {
  isModalOpen: boolean;
  modalClose: () => void;
  onSubmit?: (data: { type: string; value: string }) => void;
  isLoading?: boolean;
  issueInput: string;
  setIssueInput: (value: string) => void;
  setDropdownVisible: (visible: boolean) => void;
  handleAddIssue: () => void;
  dropdownVisible: boolean;
  filteredIssues: DetailMeetingObjectives[];
  searchOptions: DetailMeetingObjectives[];
  handleUpdateSelectedObjective: (item: DetailMeetingObjectives) => void;
}

export default function IssueAgendaAddModal({
  isModalOpen,
  modalClose,
  onSubmit,
  isLoading,
  issueInput,
  setIssueInput,
  setDropdownVisible,
  handleAddIssue,
  dropdownVisible,
  filteredIssues,
  searchOptions,
  handleUpdateSelectedObjective,
}: IssueAgendaAddModalProps) {
  const [selectedType, setSelectedType] = useState("");

  const handleSubmit = () => {
    if (!onSubmit) return; // or throw an error if preferred
    onSubmit({
      type: selectedType,
      value: issueInput,
    });
  };

  return (
    <ModalData
      isModalOpen={isModalOpen}
      modalTitle="Add or Create Issue Objective"
      modalClose={modalClose}
      buttons={[
        {
          btnText: "Submit",
          buttonCss: "py-1.5 px-5",
          btnClick: handleSubmit,
          isLoading: isLoading,
        },
      ]}
    >
      <div className="space-y-4">
        <div className="flex gap-2 relative w-full">
          <Input
            value={issueInput}
            onChange={(e) => {
              setIssueInput(e.target.value);
              setDropdownVisible(true);
            }}
            placeholder="Add or Create Agenda (Issue or Objective)"
            onFocus={() => setDropdownVisible(true)}
            onBlur={() => setTimeout(() => setDropdownVisible(false), 150)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddIssue();
              }
            }}
            className="w-full h-[45px] sm:h-[50px] border-0 border-b-2 border-gray-300 rounded-none pr-10 text-sm sm:text-base focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[0px] "
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <CornerDownLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </span>
          {dropdownVisible && filteredIssues.length > 0 && (
            <ul
              style={{
                position: "absolute",
                top: "110%",
                left: 0,
                right: 0,
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                zIndex: 10,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                maxHeight: 180,
                overflowY: "auto",
                margin: 0,
                padding: 0,
                listStyle: "none",
              }}
            >
              {searchOptions.map((item) => (
                <li
                  key={item.id}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                  onMouseDown={() => {
                    handleUpdateSelectedObjective(item);
                  }}
                >
                  {item.name} ({item.type})
                </li>
              ))}
            </ul>
          )}
        </div>
        <RadioGroup value={selectedType} onValueChange={setSelectedType}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="issue" id="r1" />
            <label htmlFor="r1">Issue</label>
            <RadioGroupItem value="objective" id="r2" className="ml-6" />
            <label htmlFor="r2">Objective</label>
          </div>
        </RadioGroup>
      </div>
    </ModalData>
  );
}
