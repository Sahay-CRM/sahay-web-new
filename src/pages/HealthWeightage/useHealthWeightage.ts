import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useForm, useWatch } from "react-hook-form";

import { getUserPermission } from "@/features/selectors/auth.selector";
import {
  useGetCompanyLevel,
  useGetCoreParameterDropdown,
  useGetSubParaByLevel,
  // useGetHealthScoreByCore,
} from "@/features/api/Business";

interface Score {
  subParameterId: string;
  name: string;
  score: number;
  isDisabled?: boolean;
}
export default function useHealthWeightage() {
  const [isCoreParaSearch, setIsCoreParaSearch] = useState("");
  const [isCompanyLevelSearch, setIsCompanyLevelSearch] = useState("");

  const formMethods = useForm();
  const { control } = formMethods;
  const coreParameterId = useWatch({ control, name: "coreParameterId" });
  const level = useWatch({ control, name: "level" });

  const { data: companyLevel } = useGetCompanyLevel({
    filter: {
      search:
        isCompanyLevelSearch.length >= 3 ? isCompanyLevelSearch : undefined,
      coreParameterId: coreParameterId,
    },
    enable: isCompanyLevelSearch.length >= 3 && !!coreParameterId,
  });

  const [isEditable, setIsEditable] = useState(false);
  const { data: coreParams } = useGetCoreParameterDropdown({
    filter: {
      search: isCoreParaSearch.length >= 3 ? isCoreParaSearch : undefined,
    },
    enable: isCoreParaSearch.length >= 3,
  });
  const { data: healthScoreList } = useGetSubParaByLevel({
    filter: {
      coreParameterId: coreParameterId,
      levelId: level,
    },
    enable: !!coreParameterId && !!level,
  });

  // const { data: healthScoreList } = useGetHealthScoreByCore(coreParameterId);
  const permission = useSelector(getUserPermission).HEALTH_WEIGHTAGE;

  const [scores, setScores] = useState<Score[]>([]);

  // Add this handler to update isDisabled in scores
  const handleSwitchChange = (switchStates: Record<string, boolean>) => {
    setScores((prevScores) =>
      prevScores.map((item) => ({
        ...item,
        isDisabled: !!switchStates[item.subParameterId],
      })),
    );
  };

  useEffect(() => {
    if (healthScoreList) {
      setScores(
        healthScoreList.map((item) => ({
          subParameterId: item.subParameterId,
          name: item.subParameterName,
          score: item.companyHealthWeightage,
          isDisabled: item.isDisabled,
        })),
      );
    } else {
      setScores([]);
    }
  }, [healthScoreList]);

  const onEdit = () => setIsEditable((prev) => !prev);

  const handleCancel = () => {
    setIsEditable(false);
    if (healthScoreList) {
      setScores(
        healthScoreList.map((item) => ({
          subParameterId: item.subParameterId,
          name: item.subParameterName,
          score: item.companyHealthWeightage,
          isDisabled: item.isDisabled,
        })),
      );
    } else {
      setScores([]);
    }
  };

  return {
    formMethods,
    isEditable,
    onEdit,
    handleCancel,
    scores,
    setScores,
    coreParams,
    coreParameterId,
    healthScoreList,
    permission,
    companyLevel,
    level,
    handleSwitchChange,
    setIsCoreParaSearch,
    setIsCompanyLevelSearch,
  };
}
