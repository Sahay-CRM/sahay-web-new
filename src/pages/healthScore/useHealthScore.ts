import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useForm, useWatch } from "react-hook-form";

import { getUserPermission } from "@/features/selectors/auth.selector";
import {
  updateHealthScoreMutation,
  useGetCompanyLevel,
  useGetCoreParameterDropdown,
  useGetHealthScoreByCore,
  // useGetHealthScoreByCore,
} from "@/features/api/Business";
import { useNavigate } from "react-router-dom";

interface Score {
  subParameterId: string;
  name: string;
  score: number;
}
export default function useHealthScore() {
  const [isCoreParaSearch, setIsCoreParaSearch] = useState("");
  const [isCompanyLevelSearch, setIsCompanyLevelSearch] = useState("");

  const formMethods = useForm();
  const { control } = formMethods;
  const coreParameterId = useWatch({ control, name: "coreParameterId" });
  const levelId = useWatch({ control, name: "levelId" });

  const [isEditing, setIsEditing] = useState(false);
  const { mutate: updateHealthScore } = updateHealthScoreMutation();

  const { data: coreParams } = useGetCoreParameterDropdown({
    filter: {
      search: isCoreParaSearch.length >= 3 ? isCoreParaSearch : undefined,
    },
    enable: isCoreParaSearch.length >= 3,
  });

  const { data: companyLevel } = useGetCompanyLevel({
    filter: {
      search:
        isCompanyLevelSearch.length >= 3 ? isCompanyLevelSearch : undefined,
      coreParameterId: coreParameterId,
    },
    enable: isCompanyLevelSearch.length >= 3 && !!coreParameterId,
  });

  const permission = useSelector(getUserPermission).HEALTH_SCORE;
  const navigate = useNavigate();

  const [scores, setScores] = useState<Score[]>([]);
  const { reset } = formMethods;

  const { data: healthScoreList } = useGetHealthScoreByCore({
    filter: {
      coreParameterId: coreParameterId,
      levelId: levelId,
    },
  });

  useEffect(() => {
    if (healthScoreList) {
      setScores(
        healthScoreList.map((item) => ({
          subParameterId: item.subParameterId,
          name: item.subParameterName,
          score: item.score * 10,
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
        score: item.score / 10,
      }));

      updateHealthScore(scoreArray, {
        onSuccess: () => {
          reset();
          reset({
            coreParameterId: "",
            levelId: "",
          });
          navigate("/dashboard/business/healthscore-achieve");
          setIsEditing(false);
        },
      });
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
          score: item.score,
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
    companyLevel,
    levelId,
    setIsCoreParaSearch,
    setIsCompanyLevelSearch,
  };
}
