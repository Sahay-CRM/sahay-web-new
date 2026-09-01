import React, { useState, useMemo } from "react";
import ModalData from "@/components/shared/Modal/ModalData";
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
    MeetingNotes: boolean;
    Kpi: boolean;
    Task: boolean;
    Project: boolean;
    Reminder: boolean;
  };
  types: {
    appreciation: boolean;
    updates: boolean;
  };
}

type NoteCategory = keyof SelectedFilters["tags"] | keyof SelectedFilters["types"];

const FIELD_LABELS: Record<keyof SelectedFields, string> = {
  createdBy: "Created By",
  date: "Date",
  time: "Time",
};

const TAG_LABELS: Record<keyof SelectedFilters["tags"], string> = {
  MeetingNotes: "Meeting Notes",
  Kpi: "KPI",
  Task: "Task",
  Project: "Project",
  Reminder: "Reminder",
};

const TYPE_LABELS: Record<keyof SelectedFilters["types"], string> = {
  appreciation: "Appreciation",
  updates: "Updates",
};

const getNoteCategory = (
  note: MeetingNotesRes,
): NoteCategory => {
  const noteTagLower = note.noteTag?.toLowerCase().trim() || "";
  const noteTypeLower = note.noteType?.toLowerCase().trim() || "";

  if (noteTagLower.includes("task") || noteTypeLower.includes("task")) {
    return "Task";
  }
  if (noteTagLower.includes("project") || noteTypeLower.includes("project")) {
    return "Project";
  }
  if (noteTagLower.includes("kpi") || noteTypeLower.includes("kpi")) {
    return "Kpi";
  }
  if (noteTagLower.includes("reminder")) {
    return "Reminder";
  }
  if (noteTypeLower === "appreciation") {
    return "appreciation";
  }
  if (noteTypeLower === "updates") {
    return "updates";
  }
  return "MeetingNotes";
};

const CATEGORY_ORDER: Array<NoteCategory> = [
  "MeetingNotes",
  "appreciation",
  "updates",
  "Kpi",
  "Task",
  "Project",
  "Reminder",
];

const SECTION_HEADERS: Record<NoteCategory, string> = {
  MeetingNotes: "Meeting Notes",
  appreciation: "Appreciation",
  updates: "Updates",
  Kpi: "KPIs",
  Task: "Tasks",
  Project: "Projects",
  Reminder: "Reminders",
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
      MeetingNotes: false,
      Kpi: false,
      Task: false,
      Project: false,
      Reminder: false,
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

  const isAllFiltersSelected = useMemo(() => {
    const allTags = Object.values(selectedFilters.tags).every(Boolean);
    const allTypes = Object.values(selectedFilters.types).every(Boolean);
    return allTags && allTypes;
  }, [selectedFilters]);

  const toggleSelectAllFilters = () => {
    const nextValue = !isAllFiltersSelected;
    setSelectedFilters({
      tags: {
        MeetingNotes: nextValue,
        Kpi: nextValue,
        Task: nextValue,
        Project: nextValue,
        Reminder: nextValue,
      },
      types: {
        appreciation: nextValue,
        updates: nextValue,
      },
    });
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

    const activeCategories = [...activeTags, ...activeTypes];

    return notesData
      .filter((note: MeetingNotesRes) => {
        const noteDate = formatUTCDateToLocal(note.createdAt).split(", ")[0]; // Extract only the date part
        const matchesDate = !dateFilter || noteDate === dateFilter;

        const noteCategory = getNoteCategory(note);
        const matchesCategory =
          activeCategories.length === 0 || activeCategories.includes(noteCategory);

        return matchesDate && matchesCategory;
      })
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
  }, [meetingNotes?.data, selectedFilters, dateFilter]);

  const handleDownload = async () => {
    if (filteredNotes.length === 0) return;

    const docSections = CATEGORY_ORDER.flatMap((cat) => {
      const notesInCat = filteredNotes.filter(
        (note) => getNoteCategory(note) === cat
      );
      if (notesInCat.length === 0) return [];

      return [
        new Paragraph({
          children: [
            new TextRun({
              text: SECTION_HEADERS[cat],
              bold: true,
              size: 24, // 12pt
            }),
          ],
          spacing: { before: 300, after: 100 },
        }),
        ...notesInCat.map((note) => {
          const metadata: string[] = [];

          if (selectedFields.createdBy) {
            metadata.push(note.employeeName || "Unknown");
          }

          if (note.createdAt) {
            const date = new Date(note.createdAt);
            const datePart = date.toLocaleDateString("en-GB");
            const timePart = date.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            });
            if (selectedFields.date) metadata.push(datePart);
            if (selectedFields.time) metadata.push(timePart);
          }

          const headerText =
            metadata.length > 0 ? `(${metadata.join(" | ")}) ` : "";

          return new Paragraph({
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
          });
        }),
      ];
    });

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
            ...docSections,
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
    <ModalData
      isModalOpen={isOpen}
      modalTitle="Download Meeting Notes"
      modalClose={onClose}
      containerClass="max-w-[600px] max-h-[80vh] min-h-[300px]"
      buttons={[
        {
          btnText: "Cancel",
          btnClick: onClose,
        },
        {
          btnText: "Download",
          btnClick: () => {
            if (!isLoading && filteredNotes.length > 0) {
              handleDownload();
            }
          },
          isLoading: isLoading,
        },
      ]}
    >
      <ScrollArea className="max-h-[70vh] px-1">
          <div className="space-y-2">
            {/* Fields Section */}
            <section>
              <h4 className="text-base font-bold text-primary tracking-wide mb-3">
                Fields to Include
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center p-2.5 rounded-md bg-gray-50 border border-gray-200 opacity-60">
                  <FormCheckbox
                    id="field-note-fixed"
                    checked={true}
                    disabled={true}
                    containerClass="mt-0"
                  />
                  <label
                    htmlFor="field-note-fixed"
                    className="ml-2 text-sm font-medium flex-grow cursor-not-allowed select-none"
                  >
                    Note Content (Fixed)
                  </label>
                </div>
                {(Object.keys(FIELD_LABELS) as Array<keyof SelectedFields>).map(
                  (field) => {
                    const isChecked = selectedFields[field];
                    return (
                      <div
                        key={field}
                        className="flex items-center p-2.5 rounded-md border border-gray-200/80 bg-gray-50/60 hover:bg-gray-100/70 transition-all cursor-pointer select-none"
                        onClick={() => toggleField(field)}
                      >
                        <FormCheckbox
                          id={`field-${field}`}
                          checked={isChecked}
                          onChange={() => {}}
                          containerClass="mt-0"
                        />
                        <label
                          htmlFor={`field-${field}`}
                          className="ml-2 text-sm font-medium cursor-pointer flex-grow select-none"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {FIELD_LABELS[field]}
                        </label>
                      </div>
                    );
                  },
                )}
              </div>
            </section>

            {/* Tags and Types Filter Section */}
            <section>
              <div className="flex items-center mt-4 justify-between mb-2">
                <h4 className="text-base font-bold text-primary  tracking-wide">
                  Filter
                </h4>
                <div
                  className="flex items-center cursor-pointer select-none px-2 py-0.5 rounded hover:bg-gray-100 transition-all"
                  onClick={toggleSelectAllFilters}
                >
                  <FormCheckbox
                    id="select-all-filters"
                    checked={isAllFiltersSelected}
                    onChange={() => {}}
                    containerClass="mt-0"
                  />
                  <label
                    htmlFor="select-all-filters"
                    className="ml-2 text-sm font-semibold text-gray-600 cursor-pointer select-none"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Select All
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {(
                  Object.keys(TAG_LABELS) as Array<
                    keyof SelectedFilters["tags"]
                  >
                ).map((tag) => {
                  const isChecked = selectedFilters.tags[tag];
                  return (
                    <div
                      key={tag}
                      className="flex items-center p-2.5 rounded-md border border-gray-200/80 bg-gray-50/60 hover:bg-gray-100/70 transition-all cursor-pointer select-none"
                      onClick={() => toggleTag(tag)}
                    >
                      <FormCheckbox
                        id={`tag-${tag}`}
                        checked={isChecked}
                        onChange={() => {}}
                        containerClass="mt-0"
                      />
                      <label
                        htmlFor={`tag-${tag}`}
                        className="ml-2 text-sm font-medium cursor-pointer flex-grow select-none"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {TAG_LABELS[tag]}
                      </label>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(
                  Object.keys(TYPE_LABELS) as Array<
                    keyof SelectedFilters["types"]
                  >
                ).map((type) => {
                  const isChecked = selectedFilters.types[type];
                  return (
                    <div
                      key={type}
                      className="flex items-center p-2.5 rounded-md border border-gray-200/80 bg-gray-50/60 hover:bg-gray-100/70 transition-all cursor-pointer select-none"
                      onClick={() => toggleType(type)}
                    >
                      <FormCheckbox
                        id={`type-${type}`}
                        checked={isChecked}
                        onChange={() => {}}
                        containerClass="mt-0"
                      />
                      <label
                        htmlFor={`type-${type}`}
                        className="ml-2 text-sm font-medium cursor-pointer flex-grow select-none"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {TYPE_LABELS[type]}
                      </label>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Types Section */}
            {/* <section>
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
            </section> */}

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
    </ModalData>
  );
};

export default DownloadNotesModal;
