import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import ModalData from "@/components/shared/Modal/ModalData";
import { Input } from "@/components/ui/input";
import { useGetAllGroup } from "@/features/api/companyProject";
import { noteGroupMutation } from "@/features/api/detailMeeting/NoteGroup";

interface IssueAgendaAddModalProps {
  isModalOpen: boolean;
  modalClose: () => void;
  meetingNoteData: MeetingNotesRes;
  defaultGroup?: GroupData; // Pass the default group if needed
}

export default function NotesGroupModal({
  isModalOpen,
  modalClose,
  meetingNoteData,
  defaultGroup,
}: IssueAgendaAddModalProps) {
  const { id: meetingId } = useParams();

  const [groupInput, setGroupInput] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isGroupSearch, setIsGroupSearch] = useState(meetingNoteData.groupName);
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(
    defaultGroup || null,
  );
  const [creationMessage, setCreationMessage] = useState("");

  const { mutate: addUpdateGroup } = noteGroupMutation();
  const { data: notesData } = useGetAllGroup({
    filter: {
      search: isGroupSearch,
      meetingId: meetingId,
      groupType: "MEETING_NOTE",
    },
    enable: !!isGroupSearch,
  });

  // Set default selected group when modal opens or meetingNoteData changes
  useEffect(() => {
    if (meetingNoteData?.groupId && meetingNoteData?.groupName) {
      // Create a group object from the meetingNoteData
      const defaultGroupFromData: GroupData = {
        groupId: meetingNoteData.groupId,
        groupName: meetingNoteData.groupName,
        groupType: "MEETING_NOTE",
        // Add any other required properties for GroupData interface
      };

      setSelectedGroup(defaultGroupFromData);
      setGroupInput(meetingNoteData.groupName);
    } else {
      // Reset if no group data
      setSelectedGroup(null);
      setGroupInput("");
    }
  }, [meetingNoteData, isModalOpen]); // Run when modal opens or meetingNoteData changes

  const handleSubmit = () => {
    if (selectedGroup) {
      handleAddToExistingGroup(selectedGroup);
    } else if (groupInput.trim()) {
      const matchingGroup = notesData?.data?.find(
        (group) =>
          group.groupName.toLowerCase() === groupInput.trim().toLowerCase(),
      );

      if (matchingGroup) {
        handleAddToExistingGroup(matchingGroup);
      } else {
        handleAddGroup();
      }
    }

    setGroupInput("");
    setIsGroupSearch("");
    setSelectedGroup(null);
    setDropdownVisible(false);
  };

  const handleAddToExistingGroup = (group: GroupData) => {
    if (meetingNoteData?.meetingNoteId) {
      const payload = {
        groupId: group.groupId,
        groupName: group.groupName,
        groupType: "MEETING_NOTE",
        meetingId: meetingId!,
        meetingNoteId: meetingNoteData?.meetingNoteId,
      };

      addUpdateGroup(payload, {
        onSuccess: () => {
          setCreationMessage(
            `Note added to group "${group.groupName}" successfully`,
          );
          setTimeout(() => {
            modalClose(); // Close modal after success
          }, 1000);
        },
        onError: () => {
          setCreationMessage(
            `Failed to add note to group "${group.groupName}"`,
          );
        },
      });
    }
  };

  const handleAddGroup = () => {
    if (meetingNoteData?.meetingNoteId && groupInput.trim()) {
      const payload = {
        groupName: groupInput,
        groupType: "MEETING_NOTE",
        meetingId: meetingId!,
        meetingNoteId: meetingNoteData?.meetingNoteId,
      };

      addUpdateGroup(payload, {
        onSuccess: () => {
          setCreationMessage(`Group "${groupInput}" created successfully`);
          setTimeout(() => {
            modalClose(); // Close modal after success
          }, 1000);
        },
        onError: () => {
          setCreationMessage(`Group "${groupInput}" could not be created`);
        },
      });
    }
  };

  const handleSelectGroup = (data: GroupData) => {
    setSelectedGroup(data);
    setGroupInput(data.groupName); // Set input to selected group name
    setDropdownVisible(false);
    setCreationMessage("");
  };

  // Clear input when user starts typing (only if no group is selected)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGroupInput(e.target.value);
    setIsGroupSearch(e.target.value);
    setCreationMessage("");
  };

  // Handle input click to show dropdown
  const handleInputClick = () => {
    setDropdownVisible(true);
  };

  // Handle input focus
  const handleInputFocus = () => {
    setDropdownVisible(true);
  };

  // Handle input blur with delay to allow clicking on dropdown items
  const handleInputBlur = () => {
    setTimeout(() => {
      setDropdownVisible(false);
    }, 200);
  };

  return (
    <ModalData
      isModalOpen={isModalOpen}
      modalTitle="Meeting Note Group Modal"
      modalClose={modalClose}
      containerClass="h-[400px]"
      buttons={[
        {
          btnText: "Submit",
          buttonCss: "py-1.5 px-5",
          btnClick: handleSubmit,
        },
      ]}
      childclass="py-0"
    >
      <div className="space-y-4 relative">
        <div className="flex gap-2 w-full mt-4">
          <div className="w-full relative">
            <Input
              value={groupInput}
              onChange={handleInputChange}
              onClick={handleInputClick}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="Add or Create Notes Group"
              className="w-full h-[45px] sm:h-[40px] border-0 border-b-2 p-0 border-gray-300 rounded-none text-sm sm:text-base focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[0px]"
            />

            {creationMessage && (
              <p className="text-sm text-gray-500 mt-1">{creationMessage}</p>
            )}
          </div>

          {dropdownVisible && (notesData?.data?.length ?? 0) > 0 && (
            <ul
              style={{
                position: "absolute",
                top: "50px",
                left: "0px",
                right: "0px",
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                zIndex: 20,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                maxHeight: 180,
                overflowY: "auto",
                margin: 0,
                padding: 0,
                listStyle: "none",
              }}
            >
              {notesData?.data?.map((item) => (
                <li
                  key={item.groupId}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevent input blur
                    handleSelectGroup(item);
                  }}
                >
                  {item.groupName}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Show selected group info */}
        {selectedGroup && (
          <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
            Selected group: <strong>{selectedGroup.groupName}</strong>
          </div>
        )}
      </div>
    </ModalData>
  );
}
