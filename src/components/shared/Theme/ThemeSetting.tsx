import { useSidebarTheme } from "@/features/auth/useSidebarTheme";

const colors = [
  "#ffffff",
  "#f3f4f6",
  "#e0f2fe",
  "#d1fae5",
  "#fef9c3",
  "#fee2e2",
  "#ede9fe",
  "#fce7f3",
  "#e5e7eb",
  "#fafaf9",
  "#f5f5f4",
  "#fef2f2",
  "#e0e7ff",
  "#f0fdf4",
  "#fefce8",
  "#fdf2f8",
  "#cffafe",
  "#dcfce7",
  "#fcd34d",
  "#f87171",
  "#fb923c",
  "#facc15",
  "#4ade80",
  "#34d399",
  "#60a5fa",
  "#a78bfa",
  "#f472b6",
  "#fb7185",
  "#e0f7fa",
  "#b2ebf2",
  "#b2dfdb",
  "#c8e6c9",
  "#dcedc8",
  "#f0f4c3",
  "#fff9c4",
  "#ffecb3",
  "#ffe0b2",
  "#ffccbc",
  "#d1c4e9",
  "#c5cae9",
  "#b3e5fc",
  "#b39ddb",
  "#80cbc4",
  "#a5d6a7",
  "#81c784",
  "#aed581",
  "#ffb74d",
  "#ff8a65",
  "#ba68c8",
  "#9575cd",
  "#7986cb",
  "#4fc3f7",
  "#4db6ac",
  "#81d4fa",
  "#90caf9",
  "#64b5f6",
  "#2196f3",
  "#1e88e5",
  "#1976d2",
  "#1565c0",
  "#0d47a1",
  "#01579b",
  "#006064",
  "#004d40",
  "#1b5e20",
  "#33691e",
  "#827717",
  "#f57f17",
];

export default function ThemeSettingsPage() {
  const { bgColor, setBgColor } = useSidebarTheme();

  return (
    <div className="w-3/4 h-full p-6 bg-white overflow-auto">
      <h1 className="text-2xl font-semibold mb-6">Manage Your App</h1>
      <div className="flex flex-wrap gap-4">
        {colors.map((color) => (
          <div
            key={color}
            className={`w-16 h-16 rounded-lg cursor-pointer border-2 flex items-center justify-center ${
              bgColor === color ? "border-black" : "border-transparent"
            }`}
            style={{ backgroundColor: color }}
            onClick={() => setBgColor(color)}
          >
            {bgColor === color && (
              <span className="text-black font-bold text-xl">✓</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
