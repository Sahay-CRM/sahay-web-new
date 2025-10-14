import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import ModalData from "@/components/shared/Modal/ModalData";
import { Input } from "@/components/ui/input";
import { groupMutation, useGetAllGroup } from "@/features/api/companyProject";
import { noteGroupMutation } from "@/features/api/detailMeeting/NoteGroup";
import useDeleteGroup from "@/features/api/companyProject/useDeleteGroup";
import { toast } from "sonner";
import { AxiosError } from "axios";

interface IssueAgendaAddModalProps {
  isModalOpen: boolean;
  modalClose: () => void;
  meetingNoteData: MeetingNotesRes;
  defaultGroup?: GroupData;
  isUpdateName?: boolean;
}

export default function NotesGroupModal({
  isModalOpen,
  modalClose,
  meetingNoteData,
  defaultGroup,
  isUpdateName,
}: IssueAgendaAddModalProps) {
  const { id: meetingId } = useParams();

  const [groupInput, setGroupInput] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isGroupSearch, setIsGroupSearch] = useState(meetingNoteData.groupName);
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(
    defaultGroup || null,
  );
  const [creationMessage, setCreationMessage] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [isCheckingDelete, setIsCheckingDelete] = useState(false);
  const deleteGroupMutation = useDeleteGroup();

  const { mutate: addUpdateGroup } = noteGroupMutation();
  const { mutateAsync: updateGroupName } = groupMutation();
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
      const defaultGroupFromData: GroupData = {
        groupId: meetingNoteData.groupId,
        groupName: meetingNoteData.groupName,
        groupType: "MEETING_NOTE",
      };

      setSelectedGroup(defaultGroupFromData);
      setGroupInput(meetingNoteData.groupName);
    } else {
      setSelectedGroup(null);
      setGroupInput("");
    }
  }, [meetingNoteData, isModalOpen]);

  const handleSubmit = () => {
    if (isUpdateName) {
      handleRenameGroup();
    } else {
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
          setTimeout(() => modalClose(), 1000);
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
          setTimeout(() => modalClose(), 1000);
        },
        onError: () => {
          setCreationMessage(`Group "${groupInput}" could not be created`);
        },
      });
    }
  };

  const handleRenameGroup = () => {
    if (!selectedGroup || !groupInput.trim()) return;

    // Don't proceed if the name hasn't changed
    if (groupInput.trim() === selectedGroup.groupName) {
      setCreationMessage("Group name is the same");
      return;
    }

    const payload = {
      groupId: selectedGroup.groupId,
      groupName: groupInput.trim(),
      groupType: "MEETING_NOTE",
      meetingId: meetingId!,
    };

    updateGroupName(payload, {
      onSuccess: () => {
        setCreationMessage(
          `Group renamed to "${groupInput.trim()}" successfully`,
        );
        setTimeout(() => modalClose(), 1000);
      },
      onError: () => {
        setCreationMessage("Failed to rename group. Please try again.");
      },
    });
  };

  const handleSelectGroup = (data: GroupData) => {
    setSelectedGroup(data);
    setGroupInput(data.groupName);
    setDropdownVisible(false);
    setCreationMessage("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setGroupInput(newValue);
    setIsGroupSearch(newValue);
    setCreationMessage("");

    // Clear selected group if user manually types something different
    if (selectedGroup && newValue !== selectedGroup.groupName) {
      setSelectedGroup(null);
    }
  };

  const handleInputClick = () => setDropdownVisible(true);
  const handleInputFocus = () => setDropdownVisible(true);
  const handleInputBlur = () => {
    setTimeout(() => setDropdownVisible(false), 200);
  };

  const [isForceDelete, setIsForceDelete] = useState(false);

  const handleDelete = (isForce?: boolean) => {
    if (!selectedGroup) return;

    setIsCheckingDelete(true);
    setDeleteError(null);

    // Build payload like your issue example
    const payload = {
      groupId: selectedGroup.groupId,
      isForce: isForce ? true : false,
    };

    deleteGroupMutation.mutate(payload, {
      onSuccess: (response) => {
        if (!response.success) {
          setDeleteError(response.message || "Unable to delete group");
        } else {
          toast.success(response.message || "Group deleted successfully");
          setSelectedGroup(null);
          setIsForceDelete(false);
        }

        setIsCheckingDelete(false);
        modalClose();
      },
      onError: (error: Error) => {
        const axiosError = error as AxiosError<{
          message?: string;
          status: number;
        }>;

        if (axiosError?.response?.data?.status === 417) {
          // Show message and enable force delete mode
          setDeleteError(
            axiosError.response?.data?.message ?? "Unable to delete group",
          );
          setIsForceDelete(true);
        } else {
          toast.error(
            `Error: ${axiosError.response?.data?.message || "An error occurred"}`,
          );
        }
        setIsCheckingDelete(false);
      },
    });
  };

  return (
    <ModalData
      isModalOpen={isModalOpen}
      modalTitle="Meeting Note Group"
      modalClose={modalClose}
      containerClass="!w-[450px] !min-w-0 !max-w-[450px] h-[300px]"
      buttons={
        isUpdateName
          ? [
              {
                btnText: "Update Name",
                buttonCss: "py-1.5 px-5",
                btnClick: handleSubmit,
              },
              {
                btnText: isForceDelete ? "Force Delete" : "Delete Group",
                buttonCss: "py-1.5 bg-red-700 hover:bg-red-700 text-white px-5",
                btnClick: () => handleDelete(isForceDelete),
              },
            ]
          : [
              {
                btnText: "Submit",
                buttonCss: "py-1.5 px-5",
                btnClick: handleSubmit,
              },
            ]
      }
      childclass="py-0"
    >
      <div className="space-y-4 relative">
        <div className="flex gap-2 w-full ">
          <div className="w-full relative">
            <Input
              value={groupInput}
              onChange={handleInputChange}
              onClick={handleInputClick}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              disabled={isCheckingDelete}
              placeholder="Add / Create / Rename Notes Group"
              className="w-full h-[45px] sm:h-[40px] border-0 border-b-2 p-0 border-gray-300 rounded-none text-sm sm:text-base focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[0px]"
              maxLength={10}
            />

            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
              {groupInput.length}/10
            </div>

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
                maxHeight: 85,
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
                    padding: "1px 12px",
                    cursor: isUpdateName ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    opacity: isUpdateName ? 0.6 : 1,
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (!isUpdateName) handleSelectGroup(item);
                  }}
                >
                  {item.groupName}
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedGroup && (
          <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
            {isUpdateName ? (
              <span>
                Renaming <strong>"{selectedGroup.groupName}"</strong>
                {groupInput.trim() &&
                  groupInput.trim() !== selectedGroup.groupName && (
                    <>
                      {" "}
                      to <strong>"{groupInput.trim()}"</strong>
                    </>
                  )}
              </span>
            ) : (
              <>
                Selected group: <strong>{selectedGroup.groupName}</strong>
              </>
            )}
          </div>
        )}
        {deleteError && (
          <div className=" text-red-500 text-sm">{deleteError}</div>
        )}
      </div>
    </ModalData>
  );
}
