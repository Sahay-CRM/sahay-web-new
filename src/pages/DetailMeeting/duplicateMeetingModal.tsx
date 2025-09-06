import React, { useState, useEffect } from "react";
import ModalData from "@/components/shared/Modal/ModalData";
import { Button } from "@/components/ui/button";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import { FormLabel } from "@/components/ui/form";

interface DuplicateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (meetingId: string, newName: string, dateTime: string) => void;
  meetingId?: string;
  meetingName?: string;
  selectDate?: string | Date; // optional initial value
}

function formatDateTimeLocal(date: Date | null): string {
  if (!date) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function parseDateTimeLocal(value: string): Date | null {
  return value ? new Date(value) : null;
}

const DuplicateMeetingModal: React.FC<DuplicateMeetingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  meetingId,
  meetingName = "",
  selectDate,
}) => {
  const [name, setName] = useState(meetingName);
  const [dateTime, setDateTime] = useState<Date | null>(
    selectDate ? new Date(selectDate) : null,
  );
  const [loading, setLoading] = useState(false);

  // error states
  const [errors, setErrors] = useState<{ name?: string; dateTime?: string }>(
    {},
  );

  useEffect(() => {
    setName(meetingName);
    setDateTime(selectDate ? new Date(selectDate) : null);
    setErrors({});
  }, [meetingName, selectDate, isOpen]);

  const handleSave = async () => {
    if (!meetingId) return;

    const newErrors: { name?: string; dateTime?: string } = {};
    if (!name.trim()) newErrors.name = "Meeting name is required";
    if (!dateTime) newErrors.dateTime = "Meeting date & time is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      await onConfirm(meetingId, name, dateTime?.toISOString() ?? "");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalData
      isModalOpen={isOpen}
      modalClose={onClose}
      modalTitle="Duplicate Meeting"
      buttons={[
        {
          btnText: "Cancel",
          btnClick: onClose,
          buttonCss: "bg-gray-100 text-black hover:bg-gray-200",
        },
        {
          btnText: "Save & Duplicate",
          btnClick: handleSave,
          isLoading: loading,
        },
      ]}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <FormInputField
            id="meeting-name"
            label="Meeting Name"
            placeholder="Enter meeting name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            isMandatory={true}
            className="mt-0"
            error={errors.name ? { message: errors.name } : undefined}
          />
        </div>

        <div className="space-y-4">
          {/* Meeting Date & Time */}
          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
            <FormLabel>Meeting Date & Time</FormLabel>
            <div
              className="flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-1">
                <input
                  type="datetime-local"
                  className="border rounded-md p-2 w-full"
                  value={formatDateTimeLocal(dateTime)}
                  onChange={(e) => {
                    const newDate = parseDateTimeLocal(e.target.value);
                    setDateTime(newDate);
                  }}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-11"
                onClick={() => {
                  const now = new Date();
                  setDateTime(now);
                }}
              >
                Now
              </Button>
            </div>
            {errors.dateTime && (
              <p className="text-red-600 text-[calc(1em-1px)] tb:text-[calc(1em-2px)] before:content-['*']">
                {errors.dateTime}
              </p>
            )}
          </div>
        </div>
      </div>
    </ModalData>
  );
};

export default DuplicateMeetingModal;
