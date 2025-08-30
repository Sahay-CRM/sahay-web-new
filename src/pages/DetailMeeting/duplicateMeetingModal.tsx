import React, { useState, useEffect } from "react";
import ModalData from "@/components/shared/Modal/ModalData";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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

  useEffect(() => {
    setName(meetingName);
    setDateTime(selectDate ? new Date(selectDate) : null);
  }, [meetingName, selectDate]);

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
          btnClick: async () => {
            if (!meetingId) return;
            try {
              setLoading(true);
              await onConfirm(meetingId, name, dateTime?.toISOString() ?? "");
              onClose();
            } finally {
              setLoading(false);
            }
          },
          isLoading: loading,
        },
      ]}
    >
      <div className="space-y-4">
        {/* Meeting Name */}
        <div className="space-y-2">
          <Label htmlFor="meeting-name">Meeting Name</Label>
          <Input
            id="meeting-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter meeting name"
          />
        </div>

        {/* Meeting Date & Time */}
        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
          <Label>Meeting Date & Time</Label>
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
        </div>
      </div>
    </ModalData>
  );
};

export default DuplicateMeetingModal;
