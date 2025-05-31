import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useForm, useWatch } from "react-hook-form";

import { getUserPermission } from "@/features/selectors/auth.selector";
import {
  updateHealthScoreMutation,
  useGetCoreParameterDropdown,
  // useGetHealthScoreByCore,
} from "@/features/api/Business";

interface Score {
  subParameterId: string;
  name: string;
  score: number;
}
export default function useHealthScore() {
  const formMethods = useForm();
  const { control } = formMethods;
  const coreParameterId = useWatch({ control, name: "coreParameterId" });

  const [isEditing, setIsEditing] = useState(false);
  const { mutate: updateHealthScore } = updateHealthScoreMutation();
  const { data: coreParams } = useGetCoreParameterDropdown();
  // const { data: healthScoreList } = useGetHealthScoreByCore(coreParameterId);
  const permission = useSelector(getUserPermission).HEALTH_SCORE;

  const [scores, setScores] = useState<Score[]>([]);

  const healthScoreList = useMemo(
    () => [
      {
        subParameterId: "dd08266b-301f-4e66-bb48-649c2989464c",
        scoreAchive: 50,
        companyHealthScore: 3,
        subParameterName: "Pricing",
      },
      {
        subParameterId: "dfe9dbca-54c3-4b14-a4ef-a2ac1596b73c",
        scoreAchive: 0,
        companyHealthScore: 9,
        subParameterName: "Market Research",
      },
      {
        subParameterId: "6ad8a22e-6b92-42ee-9bea-f8849e7a3c4b",
        scoreAchive: 5,
        companyHealthScore: 0,
        subParameterName: "IG Campaign1",
      },
      {
        subParameterId: "c1220520-98cd-4d1d-8864-64178ce47f2c",
        scoreAchive: 0,
        companyHealthScore: 0,
        subParameterName: "Whatsapp Marketing Campaign",
      },
    ],
    [],
  );

  useEffect(() => {
    if (healthScoreList) {
      setScores(
        healthScoreList.map((item) => ({
          subParameterId: item.subParameterId,
          name: item.subParameterName,
          score: item.scoreAchive,
        })),
      );
    } else {
      setScores([]);
    }
  }, [healthScoreList]);

  const handleEditToggle = () => {
    if (isEditing) {
      if (!coreParameterId) return;

      const scoreArray = scores.map((item) => ({
        subParameterId: item.subParameterId,
        score: String(item.score),
      }));

      updateHealthScore({ scoreArray });
    }

    setIsEditing((prev) => !prev);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (healthScoreList) {
      setScores(
        healthScoreList.map((item) => ({
          subParameterId: item.subParameterId,
          name: item.subParameterName,
          score: item.scoreAchive,
        })),
      );
    } else {
      setScores([]);
    }
  };

  return {
    formMethods,
    isEditing,
    handleEditToggle,
    handleCancel,
    scores,
    setScores,
    coreParams,
    coreParameterId,
    healthScoreList,
    permission,
  };
}
