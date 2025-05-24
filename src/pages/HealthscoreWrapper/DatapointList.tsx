import React, { useState } from "react";
import ScoreDataTable, { SubParameterScore } from "./ScoreDataTable";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialDataSets: Record<string, SubParameterScore[]> = {
  communication: [
    { subParameterId: "1", name: "Clarity", score: 6 },
    { subParameterId: "2", name: "Tone", score: 8 },
    { subParameterId: "3", name: "Responsiveness", score: 7 },
  ],
  performance: [
    { subParameterId: "4", name: "Accuracy", score: 9 },
    { subParameterId: "5", name: "Speed", score: 5 },
    { subParameterId: "6", name: "Problem Solving", score: 8 },
  ],
  creativity: [
    { subParameterId: "7", name: "Innovation", score: 7 },
    { subParameterId: "8", name: "Originality", score: 6 },
    { subParameterId: "9", name: "Design Thinking", score: 8 },
  ],
};

const DummyScorePage = () => {
  const [selectedCategory, setSelectedCategory] = useState("performance");

  const [categoryScores, setCategoryScores] =
    useState<Record<string, SubParameterScore[]>>(initialDataSets);

  const handleScoreChange = (updatedScores: SubParameterScore[]) => {
    setCategoryScores((prevScores) => ({
      ...prevScores,
      [selectedCategory]: updatedScores,
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <Label>Select Category</Label>
        <Select
          value={selectedCategory}
          onValueChange={(val) => {
            console.log("Category changed to:", val);
            setSelectedCategory(val);
          }}
        >
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="communication">Communication</SelectItem>
            <SelectItem value="performance">Performance</SelectItem>
            <SelectItem value="creativity">Creativity</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 capitalize">
          {selectedCategory} Scoring
        </h2>
        <ScoreDataTable
          data={categoryScores[selectedCategory] || []}
          onChange={handleScoreChange}
        />
      </div>
    </div>
  );
};

export default DummyScorePage;
