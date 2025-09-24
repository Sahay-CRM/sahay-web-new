import React, { useState, useEffect } from "react";
import ModalData from "@/components/shared/Modal/ModalData";
import { Button } from "@/components/ui/button";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import { FormLabel } from "@/components/ui/form";
// import { addUpdateDetailMeetingMutation } from "@/features/api/detailMeeting";

interface DuplicateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (meetingId: string, newName: string, dateTime: string) => void;
  meetingId?: string;
  meetingName?: string;
  selectDate?: string | Date;
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

function generateMeetingName(baseName: string, date: Date) {
  const cleanedName = baseName
    .replace(/\s*\(\d{4}-\d{2}-\d{2}\)$/, "")
    .replace(/\s*\(\d{2}\/\d{2}\)$/, "")
    .replace(/\s*\(\d{2} \d{2} \d{4}\)$/, "");

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const datePart = `${day} ${month} ${year}`;
  return `${cleanedName.trim()} (${datePart})`;
}

function parseCustomDate(dateStr: string): Date | null {
  const match = dateStr.match(
    /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}) (AM|PM)$/i,
  );
  if (!match) return null;

  const [, dd, mm, yyyy, hh, min, period] = match;

  let hours = parseInt(hh, 10);
  if (period.toUpperCase() === "PM" && hours !== 12) hours += 12;
  if (period.toUpperCase() === "AM" && hours === 12) hours = 0;

  return new Date(Number(yyyy), Number(mm) - 1, Number(dd), hours, Number(min));
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
  const [dateTime, setDateTime] = useState<Date | null>(null);

  const [loading, setLoading] = useState(false);
  // const { mutate: addDetailMeeting } = addUpdateDetailMeetingMutation();

  // error states
  const [errors, setErrors] = useState<{ name?: string; dateTime?: string }>(
    {},
  );

  useEffect(() => {
    setName(meetingName);

    if (selectDate instanceof Date) {
      setDateTime(selectDate);
    } else if (typeof selectDate === "string") {
      const parsed =
        parseCustomDate(selectDate) ||
        (selectDate ? new Date(selectDate) : null);
      setDateTime(parsed);

      setDateTime(parsed);
    } else {
      setDateTime(null);
    }

    setErrors({});
  }, [meetingName, selectDate, isOpen]);

  const handleSave = async () => {
    if (!meetingId || !dateTime) return;

    const newErrors: { name?: string; dateTime?: string } = {};
    if (!name.trim()) newErrors.name = "Meeting name is required";
    if (!dateTime) newErrors.dateTime = "Meeting date & time is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      let finalName = name;
      if (meetingName && name.trim() === meetingName.trim()) {
        finalName = generateMeetingName(name, dateTime);
      }

      onConfirm(meetingId, finalName, dateTime.toISOString());
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // const handleNow = () => {
  //   if (!meetingId) return;

  //   const now = new Date();
  //   let finalName = name;

  //   if (meetingName && name.trim() === meetingName.trim()) {
  //     finalName = generateMeetingName(name, now);
  //   }

  //   const payload = {
  //     meetingDateTime: now.toISOString(),
  //     meetingId: meetingId,
  //     meetingName: finalName,
  //   };

  //   addDetailMeeting(payload, {
  //     onSuccess: () => {
  //       onClose();
  //     },
  //   });
  // };

  return (
    <ModalData
      isModalOpen={isOpen}
      modalClose={onClose}
      modalTitle="Duplicate Meeting"
      buttons={[
        // {
        //   btnText: "Now",
        //   btnClick: handleNow,
        //   buttonCss: "bg-gray-100 text-black hover:bg-gray-200",
        // },
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
