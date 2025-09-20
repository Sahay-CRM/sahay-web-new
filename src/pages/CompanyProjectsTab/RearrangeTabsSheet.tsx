import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

interface RearrangeTabsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  tabs: TabItem[];
  activeTab?: TabItem | null;
  onSave: (updatedTabs: TabItem[]) => void;
}

const RearrangeTabsSheet: React.FC<RearrangeTabsSheetProps> = ({
  isOpen,
  onClose,
  tabs,
  onSave,
}) => {
  const [localTabs, setLocalTabs] = useState<TabItem[]>([]);

  useEffect(() => {
    const filtered = tabs.filter((t) => t.id !== "all");
    setLocalTabs(filtered);
  }, [tabs, isOpen]);

  const moveTab = (index: number, direction: "up" | "down") => {
    const newTabs = [...localTabs];
    if (direction === "up" && index > 0) {
      [newTabs[index - 1], newTabs[index]] = [
        newTabs[index],
        newTabs[index - 1],
      ];
    }
    if (direction === "down" && index < newTabs.length - 1) {
      [newTabs[index + 1], newTabs[index]] = [
        newTabs[index],
        newTabs[index + 1],
      ];
    }
    setLocalTabs(newTabs.map((t, i) => ({ ...t, sequence: i + 1 })));
  };

  const handleSave = () => {
    onSave(localTabs);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[420px] flex flex-col h-full">
        {/* Header */}
        <SheetHeader className="pb-2 border-b">
          <SheetTitle className="text-lg font-semibold">
            Rearrange Project Groups
          </SheetTitle>
        </SheetHeader>

        {/* Tabs List */}
        <div className="flex-1 overflow-y-auto px-2  py-1 space-y-1">
          {localTabs.map((tab, index) => (
            <div
              key={tab.id}
              className="flex justify-between items-center border-b border-gray-200 py-1"
            >
              <span
                className="text-md truncate max-w-[320px]"
                title={tab.label}
              >
                {index + 1}. {tab.label}
              </span>

              <div className="flex flex-col ">
                <button
                  className={` rounded ${
                    index === 0
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-100"
                  }`}
                  onClick={() => index !== 0 && moveTab(index, "up")}
                >
                  <ChevronUp className="h-5 w-5" />
                </button>
                <button
                  className={` rounded ${
                    index === localTabs.length - 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-100"
                  }`}
                  onClick={() =>
                    index !== localTabs.length - 1 && moveTab(index, "down")
                  }
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <SheetFooter className="sticky bottom-0 bg-white border-t p-3">
          <div className="flex justify-end gap-3">
            <Button size="sm" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default RearrangeTabsSheet;
