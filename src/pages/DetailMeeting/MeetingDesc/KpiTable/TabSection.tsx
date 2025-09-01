"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ref, update, onValue, getDatabase } from "firebase/database";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

export default function TabsSection({
  selectedPeriod,
  onSelectPeriod,
  kpiStructure,
}: {
  selectedPeriod: string;
  onSelectPeriod: (selectedPeriod: string) => void;
  kpiStructure?: BaseResponse<FrequencyData> | null;
}) {
  const { id: meetingId } = useParams();
  const db = getDatabase();
  // 🔹 Listen to changes from Firebase in real-time
  useEffect(() => {
    if (!meetingId) return;
    const stateRef = ref(db, `meetings/${meetingId}/state/kpiActiveTab`);
    const unsubscribe = onValue(stateRef, (snapshot) => {
      const tabValue = snapshot.val();
      if (tabValue && tabValue !== selectedPeriod) {
        onSelectPeriod(tabValue); // update UI when Firebase changes
      }
    });

    return () => unsubscribe();
  }, [db, meetingId, onSelectPeriod, selectedPeriod]);

  // 🔹 Update Firebase when user changes tab
  const handleTabChange = (newTab: string) => {
    onSelectPeriod(newTab);

    update(ref(db, `meetings/${meetingId}/state`), {
      kpiActiveTab: newTab,
    });
  };

  return (
    <Tabs
      value={selectedPeriod}
      onValueChange={handleTabChange}
      className="w-full pr-4"
    >
      <TabsList className="bg-transparent h-auto p-0 flex flex-wrap items-start justify-start space-x-2 border-b border-gray-200">
        {kpiStructure?.data?.map((tab) => (
          <TabsTrigger
            key={tab.frequencyType}
            value={tab.frequencyType}
            className="rounded-none bg-white border-b-2 border-transparent text-xs font-medium text-muted-foreground hover:text-primary data-[state=active]:border-b-primary data-[state=active]:text-primary"
          >
            {tab.frequencyType}{" "}
            <span className="ml-0.5 text-xs">({tab?.count})</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
