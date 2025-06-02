import {
  levelAssignMutation,
  useDdAllLevel,
  useGetCompanyLevelAssign,
  useGetCoreParameterDropdown,
} from "@/features/api/Business";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

interface Selection {
  coreParameter: {
    id: string;
    name: string;
  };
  level: {
    id: string;
    name: string;
  };
}

export default function useCompanyLevel() {
  const [selectedCoreParameters, setCoreParameters] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const permission = useSelector(getUserPermission).COMPANY_LEVEL_ASSIGN;
  const navigate = useNavigate();

  // New state to track all selections in the requested format
  const [allSelections, setAllSelections] = useState<Selection[]>([]);

  // Map: levelId -> subParameterId (single select)
  const [subParaAssignments, setSubParaAssignments] = useState<
    Record<string, string[]>
  >({});

  const { data: corePara } = useGetCoreParameterDropdown();
  const { data: companyLevelAssign } = useGetCompanyLevelAssign();
  const { data: allLevel } = useDdAllLevel();
  const { mutate: companyLevelMutation } = levelAssignMutation();

  const coreParaOptions = corePara?.data.map((item) => ({
    label: item.coreParameterName,
    value: item.coreParameterId,
  }));

  const handleCorePara = useCallback(
    (data: string) => {
      setCoreParameters(data);

      // Find matching entry in companyLevelAssign
      const matched = companyLevelAssign?.data?.find(
        (item: CompanyLevelJunction) => item.coreParameterId === data,
      );
      if (matched) {
        setSelectedLevel(matched.currentLevelId);
        // Update allSelections with the matched level
        const coreParamName =
          coreParaOptions?.find((opt) => opt.value === data)?.label || "";
        const levelName =
          allLevel?.data?.find(
            (level) => level.levelId === matched.currentLevelId,
          )?.levelName || "";

        setAllSelections((prev) => {
          const existingIndex = prev.findIndex(
            (item) => item.coreParameter.id === data,
          );
          if (existingIndex >= 0) {
            const newSelections = [...prev];
            newSelections[existingIndex] = {
              coreParameter: {
                id: data,
                name: coreParamName,
              },
              level: {
                id: matched.currentLevelId,
                name: levelName,
              },
            };
            return newSelections;
          }
          return [
            ...prev,
            {
              coreParameter: {
                id: data,
                name: coreParamName,
              },
              level: {
                id: matched.currentLevelId,
                name: levelName,
              },
            },
          ];
        });
      } else {
        setSelectedLevel("");
      }
    },
    [companyLevelAssign, coreParaOptions, allLevel],
  );

  const handleLevelSelect = useCallback(
    (levelId: string) => {
      setSelectedLevel(levelId);

      // Update allSelections with the new level
      const coreParamName =
        coreParaOptions?.find((opt) => opt.value === selectedCoreParameters)
          ?.label || "";
      const levelName =
        allLevel?.data?.find((level) => level.levelId === levelId)?.levelName ||
        "";

      setAllSelections((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.coreParameter.id === selectedCoreParameters,
        );
        if (existingIndex >= 0) {
          const newSelections = [...prev];
          newSelections[existingIndex] = {
            coreParameter: {
              id: selectedCoreParameters,
              name: coreParamName,
            },
            level: {
              id: levelId,
              name: levelName,
            },
          };
          return newSelections;
        }
        return [
          ...prev,
          {
            coreParameter: {
              id: selectedCoreParameters,
              name: coreParamName,
            },
            level: {
              id: levelId,
              name: levelName,
            },
          },
        ];
      });
    },
    [selectedCoreParameters, coreParaOptions, allLevel],
  );

  const handleSubParaCheck = (subParaId: string) => {
    if (!selectedLevel) return;

    setSubParaAssignments((prev) => {
      // Remove this sub-parameter from any other level
      const newAssignments = { ...prev };
      Object.keys(newAssignments).forEach((levelId) => {
        newAssignments[levelId] = newAssignments[levelId].filter(
          (id) => id !== subParaId,
        );
      });

      // Add to selected level if not already present
      if (!newAssignments[selectedLevel]) {
        newAssignments[selectedLevel] = [];
      }

      if (!newAssignments[selectedLevel].includes(subParaId)) {
        newAssignments[selectedLevel] = [
          ...newAssignments[selectedLevel],
          subParaId,
        ];
      }

      return newAssignments;
    });
  };

  const handleSave = () => {
    if (!selectedCoreParameters || !selectedLevel) return;
    setIsSaving(true);

    // Prepare payload for updating company level assignment
    const payload = allSelections.map((selection) => {
      // Find existing junction if it exists
      const existingJunction = companyLevelAssign?.data?.find(
        (item: CompanyLevelJunction) =>
          item.coreParameterId === selection.coreParameter.id,
      );

      return {
        companyLevelJunctionId: existingJunction?.companyLevelJunctionId || "", // Use existing ID or empty string for new entries
        coreParameterId: selection.coreParameter.id,
        currentLevelId: selection.level.id,
      };
    });

    companyLevelMutation(payload, {
      onSuccess: () => {
        setIsSaving(false);
        navigate("/dashboard/business/company-level-assign");
        setCoreParameters("");
        setSelectedLevel("");
      },
      onError: () => {
        setIsSaving(false);
      },
    });
  };

  return {
    selectedCoreParameters,
    selectedLevel,
    coreParaOptions,
    handleCorePara,
    handleLevelSelect,
    allLevel,
    handleSave,
    handleSubParaCheck,
    subParaAssignments,
    setSubParaAssignments,
    isSaving,
    companyLevelAssign,
    allSelections,
    permission,
  };
}
