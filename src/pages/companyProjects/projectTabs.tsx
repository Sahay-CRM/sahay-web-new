import React, { useState, useRef } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus } from "lucide-react";

interface TabItem {
  id: string;
  label: string;
}

export default function ProjectTabs() {
  const [tabs, setTabs] = useState<TabItem[]>([
    { id: "1", label: "Tab 1" },
    { id: "2", label: "Tab 2" },
  ]);
  const [activeTab, setActiveTab] = useState("1");
  const [longPressTab, setLongPressTab] = useState<TabItem | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const addTab = () => {
    const newId = Date.now().toString();
    setTabs([...tabs, { id: newId, label: `Tab ${tabs.length + 1}` }]);
    setActiveTab(newId);
  };

  const deleteTab = (id: string) => {
    const newTabs = tabs.filter((tab) => tab.id !== id);
    setTabs(newTabs);
    if (activeTab === id && newTabs.length > 0) {
      setActiveTab(newTabs[0].id);
    }
  };

  const startPress = (tab: TabItem) => {
    timerRef.current = setTimeout(() => setLongPressTab(tab), 2000); // 2s long press
  };

  const cancelPress = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="flex w-full gap-2">
        {tabs.map((tab) => (
          <DropdownMenu
            key={tab.id}
            open={longPressTab?.id === tab.id}
            onOpenChange={() => setLongPressTab(null)}
          >
            <DropdownMenuTrigger asChild>
              <TabsTrigger
                value={tab.id}
                onMouseDown={() => startPress(tab)}
                onMouseUp={cancelPress}
                onMouseLeave={cancelPress}
                className="relative"
              >
                {tab.label}
              </TabsTrigger>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => alert(`Edit ${tab.label}`)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => deleteTab(tab.id)}>
                Delete
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => alert("Add Project")}>
                Add Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => alert("Remove Project")}>
                Remove Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ))}

        {/* + Add Tab */}
        <button
          onClick={addTab}
          className="ml-auto flex items-center justify-center rounded-2xl border p-2 hover:bg-accent"
        >
          <Plus className="h-4 w-4" />
        </button>
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="p-4">
          Content for {tab.label}
        </TabsContent>
      ))}
    </Tabs>
  );
}
