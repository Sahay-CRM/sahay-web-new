import useGetUpdates from "@/features/api/Updates/useGetUpdates";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import React, { useEffect, useMemo, useState } from "react";

const SingleUpdate: React.FC = () => {
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "Project Updates", href: "" }]);
  }, [setBreadcrumbs]);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Fetch updates
  const { data: UpdateList } = useGetUpdates();

  // Group updates by date
  const groupedUpdates = useMemo(() => {
    const rawUpdates = UpdateList?.data ?? [];
    const groups: { date: string; items: UpdateItem[] }[] = [];

    rawUpdates.forEach((item) => {
      const dateKey = item.date.split("T")[0]; // group by date only

      let group = groups.find((g) => g.date === dateKey);
      if (!group) {
        group = { date: dateKey, items: [] };
        groups.push(group);
      }
      group.items.push(item);
    });

    return groups;
  }, [UpdateList?.data]);

  // If a date is selected, filter the section
  const activeSection = selectedDate
    ? groupedUpdates.find((u) => u.date === selectedDate)
    : null;

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-950 py-10 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Back Button */}
        {selectedDate && (
          <button
            onClick={() => setSelectedDate(null)}
            className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1"
          >
            ← Back to all updates
          </button>
        )}

        {/* Updates list */}
        {(selectedDate ? [activeSection] : groupedUpdates).map(
          (section) =>
            section && (
              <div key={section.date} className="space-y-6 border-b pb-8">
                {/* 🗓️ Date Header */}
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
                      key={update.updateId}
                      className="border-l border-gray-200 dark:border-gray-800 pl-4"
                    >
                      {/* Title */}
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {update.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4 whitespace-pre-line ">
                        {update.description}
                      </p>

                      {/* Images */}
                      {update.image && Array.isArray(update.image) && (
                        <div className="flex flex-wrap gap-3">
                          {update.image.map((img: string, idx: number) => (
                            <img
                              key={idx}
                              src={img}
                              alt="update"
                              className="w-[240px] rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm cursor-pointer hover:scale-[1.02] transition"
                              onClick={() => setSelectedImage(img)}
                            />
                          ))}
                        </div>
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
