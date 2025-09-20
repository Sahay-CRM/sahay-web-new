import ModalData from "@/components/shared/Modal/ModalData";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CornerDownLeft } from "lucide-react";
import { useEffect, useState } from "react";

// Define types for the data structures being used
interface DetailMeetingObjectives {
  id: string;
  name: string;
  ioType: string;
}

interface IssueAgendaAddModalProps {
  isModalOpen: boolean;
  modalClose: () => void;
  onSubmit?: (data: { type: string; value: string }) => void;
  isLoading?: boolean;
  issueInput: string;
  setIssueInput: (value: string) => void;
  setSelectedIoType: (value: string) => void;
  setDropdownVisible: (visible: boolean) => void;
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
  dropdownVisible,
  filteredIssues,
  searchOptions,
  handleUpdateSelectedObjective,
  setSelectedIoType,
}: IssueAgendaAddModalProps) {
  // Set default value to "issue"
  const [selectedType, setSelectedType] = useState("ISSUE");

  const handleSubmit = () => {
    if (!onSubmit) return;
    if (issueInput.trim() !== "") {
      onSubmit({
        type: selectedType,
        value: issueInput,
      });
    }
  };

  useEffect(() => {
    if (!isModalOpen) {
      setIssueInput("");
      setDropdownVisible(false);
      setSelectedType("ISSUE");
    }
  }, [isModalOpen, setIssueInput, setDropdownVisible]);

  const handleListItemSelect = (item: DetailMeetingObjectives) => {
    handleUpdateSelectedObjective(item);
    setDropdownVisible(false);
  };

  const handleClose = () => {
    modalClose();
    setIssueInput("");
  };

  return (
    <ModalData
      isModalOpen={isModalOpen}
      modalTitle="Add or Create Issue Objective"
      modalClose={handleClose}
      containerClass="h-[350px]"
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
        {/* Radio Group moved to top */}
        <RadioGroup
          value={selectedType}
          onValueChange={(e) => {
            setSelectedType(e);
            setSelectedIoType(e);
          }}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="ISSUE"
              id="r1"
              className="border-black w-5 h-5"
            />
            <label htmlFor="r1">Issue</label>
            <RadioGroupItem
              value="OBJECTIVE"
              id="r2"
              className="ml-6 border-black w-5 h-5"
            />
            <label htmlFor="r2">Objective</label>
          </div>
        </RadioGroup>

        {/* Input field */}
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
                    transition: "background-color 0.2s",
                  }}
                  onMouseDown={() => handleListItemSelect(item)}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = "#f3f4f6";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = "white";
                  }}
                >
                  {item.name} ({item.ioType})
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </ModalData>
  );
}
