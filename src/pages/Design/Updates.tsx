import React, { useState } from "react";

const updates = [
  {
    date: "November 11, 2025",
    items: [
      {
        id: 1,
        title: "Fixed Auto Preset Issue When Adding New Company",
        tag: "Fixed Issue",
        description:
          "When adding a new company, the auto preset for roles and permissions was not being applied correctly. The system required a manual update from the preset configuration. After updating all presets, the issue was resolved and the automatic role and permission assignment now works as expected.",
      },
      {
        id: 4,
        title: "Moved Holiday Section to Company Profile",
        description:
          "The Holiday module has been removed from the main list view and is now added as a dedicated section within the Company Profile page, positioned after the Legal section for better organization.",
        image:
          "https://www.trackbizhealth.com/share/changeLogs/1762946030739-45002.webp",
      },
    ],
  },
  {
    date: "November 12, 2025",
    items: [
      {
        id: 6,
        title: "Added Tooltip in KPI Dashboard for Weekly Auto Edit",
        description:
          "Added a tooltip in the KPI Dashboard showing detailed breakdowns like 'Weekly auto edit (10/12)' where 10 represents manual edits and 12 represents automatic ones. For daily view, only a single number is displayed for clarity.",
        image:
          "https://www.trackbizhealth.com/share/changeLogs/1762946091692-84075.webp",
      },
      {
        id: 7,
        title: "Enhanced Search to Include All Columns",
        description:
          "Updated the list view search functionality to include all columns. Now, any value across all columns can be searched, making it easier to find specific records quickly.",
      },
      {
        id: 8,
        title: "Renamed 'Past Meeting' to 'Missed Meeting'",
        description:
          "Updated the meeting status label from 'Past Meeting' to 'Missed Meeting' for clearer communication and consistency across the meeting dashboard.",
      },
      {
        id: 9,
        title: "Added Option to Remove Tag in Meeting Notes",
        description:
          "Introduced a new option in Meeting Notes that allows users to remove assigned tags from notes, giving more flexibility in note organization and management.",
        image: [
          "https://www.trackbizhealth.com/share/changeLogs/1762945926377-66816.webp",
          "https://trackbizhealth.com/share/changeLogs/1762945445735-98243.webp",
        ],
      },
      {
        id: 10,
        title: "Added Skip Days Section",
        description:
          "Introduced a new 'Skip Days' section that allows users to define and manage days to be skipped in specific workflows. This provides better control and flexibility in scheduling and automation processes.",
        image:
          "https://www.trackbizhealth.com/share/changeLogs/1762946030739-45002.webp",
      },
      // {
      //   id: 11,
      //   title: "Added Meeting Note Tag Section",
      //   description:
      //     "Introduced a new side section named 'Tagged' where all tags from Tasks, Meetings, KPIs, and Notes are displayed together in one place for quick reference and easy navigation.",
      //   image:
      //     "https://www.trackbizhealth.com/share/changeLogs/1762946258273-37542.webp",
      // },
      {
        id: 13,
        title:
          "Create Task, Project, and KPI from Notes After Meeting Ended (Connected with Agenda)",
        description:
          "Enabled the ability to create Tasks, Projects, and KPIs directly from meeting notes even after the meeting has ended. ",
        image:
          "https://www.trackbizhealth.com/share/changeLogs/1762945926377-66816.webp",
      },
      {
        id: 14,
        title: "Removed Date Filter from Live Meeting Template",
        description:
          "Removed the date filter option from the Live Meeting Template view to simplify the interface and ensure all templates remain easily accessible regardless of date selection.",
      },
      {
        id: 15,
        title: "Implemented Health Score Calculation (Bug Fix)",
        description: " Health score calculation Done.",
      },
      {
        id: 16,
        title: "Fixed Pagination Issue in Live Meeting (Bug Fix)",
        description:
          "Resolved an issue where pagination in the Live Meeting list was not working correctly. ",
      },
      {
        id: 18,
        title: "Custom Repetition in Meeting or Repeat Task",
        description:
          "Introduced the ability to set custom repetition schedules for meetings and repeat tasks. Users can now define personalized recurrence patterns beyond standard daily, weekly, or monthly options.",
        image: [
          "https://www.trackbizhealth.com/share/changeLogs/1762947352825-94283.webp",
          // "https://www.trackbizhealth.com/share/changeLogs/1762947401561-2487.webp",
        ],
      },
      {
        id: 19,
        title: "Custom KPI Dashboard Search",
        description:
          "Implemented search functionality in the KPI dashboard. Users can now search KPIs by name, business function, or tags, making it easier to find relevant KPIs quickly.",
        image: [
          "https://www.trackbizhealth.com/share/changeLogs/1762947835428-61450.webp",
          "https://www.trackbizhealth.com/share/changeLogs/1762947813255-11240.webp",
        ],
      },
    ],
  },
];
const SingleUpdate: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const activeSection = updates.find((u) => u.date === selectedDate);

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-950 py-10 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Back Button if filtered */}
        {selectedDate && (
          <button
            onClick={() => setSelectedDate(null)}
            className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1"
          >
            ← Back to all updates
          </button>
        )}

        {/* Updates list */}
        {(selectedDate ? [activeSection] : updates).map(
          (section) =>
            section && (
              <div key={section.date} className="space-y-6 border-b pb-8">
                {/* 🗓️ Date + Heading layout */}
                <div className="flex gap-6 items-start">
                  <button
                    onClick={() =>
                      selectedDate ? null : setSelectedDate(section.date)
                    }
                    className="w-32 text-sm text-gray-400 dark:text-gray-500 text-left hover:text-gray-600"
                  >
                    {new Date(section.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                    })}
                  </button>

                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {section.date} updates
                  </h2>
                </div>

                {/* Update items */}
                <div className="pl-[8.5rem] space-y-5">
                  {section.items.map((update) => (
                    <div
                      key={update.id}
                      className="border-l border-gray-200 dark:border-gray-800 pl-4"
                    >
                      {/* {update.tag && (
                        <span className="inline-block text-xs font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full mb-2">
                          {update.tag}
                        </span>
                      )} */}

                      {/* Title */}
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
                        {/* {update.icon && <span>{update.icon}</span>} */}
                        {update.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        {update.description}
                      </p>

                      {/* Images */}
                      {update.image && Array.isArray(update.image) ? (
                        <div className="flex flex-wrap gap-3">
                          {update.image.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`${update.title} ${idx + 1}`}
                              className="w-[240px] rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm cursor-pointer hover:scale-[1.02] transition"
                              onClick={() => setSelectedImage(img)}
                            />
                          ))}
                        </div>
                      ) : (
                        update.image && (
                          <img
                            src={update.image}
                            alt={update.title}
                            className="w-[240px] rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm cursor-pointer hover:scale-[1.02] transition"
                            onClick={() =>
                              setSelectedImage(update.image as string)
                            }
                          />
                        )
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ),
        )}

        {/* Image Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative">
              <img
                src={selectedImage}
                alt="Preview"
                className="max-w-[90vw] max-h-[85vh] rounded-lg shadow-2xl"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-3 -right-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full p-1.5 shadow-md"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleUpdate;
