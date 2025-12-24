import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormCheckbox from "@/components/shared/Form/FormCheckbox/FormCheckbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";
import { useGetMeetingNotes } from "@/features/api/detailMeeting";
import { formatUTCDateToLocal } from "@/features/utils/app.utils";

interface DownloadNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingName: string;
  meetingDate: string;
  joiners: Joiners[];
  meetingId: string;
  dateFilter?: string;
}

interface SelectedFields {
  createdBy: boolean;
  date: boolean;
  time: boolean;
}

interface SelectedFilters {
  tags: {
    Kpi: boolean;
    Task: boolean;
    Project: boolean;
  };
  types: {
    appreciation: boolean;
    updates: boolean;
  };
}

const FIELD_LABELS: Record<keyof SelectedFields, string> = {
  createdBy: "Created By",
  date: "Date",
  time: "Time",
};

const TAG_LABELS: Record<keyof SelectedFilters["tags"], string> = {
  Kpi: "KPI",
  Task: "Task",
  Project: "Project",
};

const TYPE_LABELS: Record<keyof SelectedFilters["types"], string> = {
  appreciation: "appreciation",
  updates: "updates",
};

const DownloadNotesModal: React.FC<DownloadNotesModalProps> = ({
  isOpen,
  onClose,
  meetingName,
  meetingDate,
  joiners,
  meetingId,
  dateFilter,
}) => {
  const { data: meetingNotes, isLoading } = useGetMeetingNotes({
    filter: {
      meetingId: meetingId,
    },
    enable: isOpen && !!meetingId,
  });

  const [selectedFields, setSelectedFields] = useState<SelectedFields>({
    createdBy: true,
    date: true,
    time: true,
  });

  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    tags: {
      Kpi: false,
      Task: false,
      Project: false,
    },
    types: {
      appreciation: false,
      updates: false,
    },
  });

  const toggleField = (field: keyof SelectedFields) => {
    setSelectedFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const toggleTag = (tag: keyof SelectedFilters["tags"]) => {
    setSelectedFilters((prev) => ({
      ...prev,
      tags: { ...prev.tags, [tag]: !prev.tags[tag] },
    }));
  };

  const toggleType = (type: keyof SelectedFilters["types"]) => {
    setSelectedFilters((prev) => ({
      ...prev,
      types: { ...prev.types, [type]: !prev.types[type] },
    }));
  };

  const filteredNotes = useMemo(() => {
    const notesData = meetingNotes?.data as unknown as
      | MeetingNotesRes[]
      | undefined;
    if (!notesData || !Array.isArray(notesData)) return [];

    const activeTags = Object.entries(selectedFilters.tags)
      .filter(([, val]) => val)
      .map(([key]) => key as keyof SelectedFilters["tags"]);

    const activeTypes = Object.entries(selectedFilters.types)
      .filter(([, val]) => val)
      .map(([key]) => key as keyof SelectedFilters["types"]);

    return notesData.filter((note: MeetingNotesRes) => {
      const noteDate = formatUTCDateToLocal(note.createdAt).split(", ")[0]; // Extract only the date part
      const matchesDate = !dateFilter || noteDate === dateFilter;
      const matchesTag =
        activeTags.length === 0 ||
        (note.noteTag &&
          activeTags.includes(note.noteTag as keyof SelectedFilters["tags"]));
      const matchesType =
        activeTypes.length === 0 ||
        (note.noteType &&
          activeTypes.includes(
            note.noteType as keyof SelectedFilters["types"],
          ));
      return matchesDate && matchesTag && matchesType;
    });
  }, [meetingNotes?.data, selectedFilters, dateFilter]);

  const handleDownload = async () => {
    if (filteredNotes.length === 0) return;

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: meetingName,
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Date: `,
                  bold: true,
                }),
                new TextRun(meetingDate),
              ],
              spacing: { before: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Joiners: `,
                  bold: true,
                }),
                new TextRun(joiners.map((j) => j.employeeName).join(", ")),
              ],
            }),
            new Paragraph({
              text: "",
              spacing: { before: 400 },
            }),
            ...filteredNotes.flatMap((note: MeetingNotesRes) => {
              const metadata: string[] = [];

              if (selectedFields.createdBy) {
                metadata.push(note.employeeName || "Unknown");
              }

              if (note.createdAt) {
                const localDateTime = formatUTCDateToLocal(note.createdAt);
                const [datePart, timePart] = localDateTime.split(", ");
                if (selectedFields.date) metadata.push(datePart);
                if (selectedFields.time) metadata.push(timePart);
              }

              const headerText =
                metadata.length > 0 ? `(${metadata.join(" | ")}) ` : "";

              return [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: headerText,
                      bold: true,
                      size: 20,
                    }),
                    new TextRun({
                      text: note.note,
                    }),
                  ],
                  bullet: {
                    level: 0,
                  },
                  spacing: { before: 100 },
                }),
              ];
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const formattedDate = meetingDate.replace(/[/\\?%*:|"<>]/g, "-");
    a.download = `${meetingName}_${formattedDate}.docx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="px-4 py-2 border-b border-black">
          <DialogTitle className="text-xl font-bold">
            Download Meeting Notes
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] px-4">
          <div className="space-y-2">
            {/* Fields Section */}
            <section>
              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                Fields to Include
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center p-2 rounded-md bg-gray-50 border border-gray-200 opacity-60">
                  <FormCheckbox
                    id="field-note-fixed"
                    checked={true}
                    disabled={true}
                    containerClass="mt-0"
                  />
                  <label
                    htmlFor="field-note-fixed"
                    className="ml-2 text-sm font-medium flex-grow"
                  >
                    Note Content (Fixed)
                  </label>
                </div>
                {(Object.keys(FIELD_LABELS) as Array<keyof SelectedFields>).map(
                  (field) => (
                    <div
                      key={field}
                      className="flex items-center p-2 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all"
                    >
                      <FormCheckbox
                        id={`field-${field}`}
                        checked={selectedFields[field]}
                        onChange={() => toggleField(field)}
                        containerClass="mt-0"
                      />
                      <label
                        htmlFor={`field-${field}`}
                        className="ml-2 text-sm font-medium cursor-pointer flex-grow"
                      >
                        {FIELD_LABELS[field]}
                      </label>
                    </div>
                  ),
                )}
              </div>
            </section>

            {/* Tags Section */}
            <section>
              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider ">
                Filter by Tag
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {(
                  Object.keys(TAG_LABELS) as Array<
                    keyof SelectedFilters["tags"]
                  >
                ).map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center p-2 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all"
                  >
                    <FormCheckbox
                      id={`tag-${tag}`}
                      checked={selectedFilters.tags[tag]}
                      onChange={() => toggleTag(tag)}
                      containerClass="mt-0"
                    />
                    <label
                      htmlFor={`tag-${tag}`}
                      className="ml-2 text-sm font-medium cursor-pointer flex-grow"
                    >
                      {TAG_LABELS[tag]}
                    </label>
                  </div>
                ))}
              </div>
            </section>

            {/* Types Section */}
            <section>
              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                Filter by Type
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {(
                  Object.keys(TYPE_LABELS) as Array<
                    keyof SelectedFilters["types"]
                  >
                ).map((type) => (
                  <div
                    key={type}
                    className="flex items-center p-2 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all"
                  >
                    <FormCheckbox
                      id={`type-${type}`}
                      checked={selectedFilters.types[type]}
                      onChange={() => toggleType(type)}
                      containerClass="mt-0"
                    />
                    <label
                      htmlFor={`type-${type}`}
                      className="ml-2 text-sm font-medium cursor-pointer flex-grow"
                    >
                      {TYPE_LABELS[type]}
                    </label>
                  </div>
                ))}
              </div>
            </section>

            {isLoading ? (
              <p className="text-center text-sm text-gray-400 py-4">
                Loading notes...
              </p>
            ) : (
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                <span className="text-sm font-semibold text-primary">
                  {filteredNotes.length} notes will be included
                </span>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 border-t bg-gray-50/50">
          <div className="flex w-full gap-3 justify-end">
            <Button variant="outline" onClick={onClose} className="px-6">
              Cancel
            </Button>
            <Button
              onClick={handleDownload}
              disabled={isLoading || filteredNotes.length === 0}
              className="bg-primary hover:bg-primary/90 text-white px-8"
            >
              Download
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadNotesModal;
