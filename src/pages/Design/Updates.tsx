import React from "react";

type Update = {
  id: number;
  title: string;
  description: string;
  image?: string;
  video?: string;
  date: string;
};

const updates: Update[] = [
  {
    id: 1,
    title: "Added Dark Mode 🌙",
    description:
      "We introduced dark mode to improve user experience during nighttime browsing.",
    image: "/images/darkmode-preview.png",
    date: "2025-11-10",
  },
  {
    id: 2,
    title: "New Dashboard Layout 📊",
    description:
      "The dashboard now includes analytics widgets and a cleaner layout.",
    video: "/videos/dashboard-demo.mp4",
    date: "2025-11-05",
  },
  {
    id: 3,
    title: "Performance Optimization 🚀",
    description:
      "Reduced load times by 40% and improved lazy loading for media-heavy pages.",
    date: "2025-10-28",
  },
];

const Updates: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Project Updates</h1>

      <div className="space-y-8">
        {updates.map((update) => (
          <div
            key={update.id}
            className="p-6 border rounded-2xl shadow-md bg-white dark:bg-gray-900"
          >
            <h2 className="text-2xl font-semibold mb-2">{update.title}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {update.description}
            </p>
            {update.image && (
              <img
                src={update.image}
                alt={update.title}
                className="w-full rounded-lg mb-4"
              />
            )}
            {update.video && (
              <video controls className="w-full rounded-lg mb-4">
                <source src={update.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
            <p className="text-sm text-gray-500">Updated on {update.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Updates;
