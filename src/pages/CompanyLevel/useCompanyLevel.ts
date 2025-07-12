import {
  levelAssignMutation,
  useDdAllLevel,
  useGetCompanyLevelAssign,
  useGetCoreParameterDropdown,
} from "@/features/api/Business";
import { getUserPermission } from "@/features/selectors/auth.selector";
import { useCallback, useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Selection {
  coreParameter: {
    id: string;
    name: string;
  };
  level: {
    id: string;
    name: string;
  };
  isChanged: boolean;
}

export default function useCompanyLevel() {
  const [selectedCoreParameters, setCoreParameters] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const permission = useSelector(getUserPermission).COMPANY_LEVEL_ASSIGN;
  const navigate = useNavigate();
  const isInitialized = useRef(false);
  const initialSelectionsRef = useRef<Selection[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Enhanced state to track all selections with change status
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

  // Initialize selections from companyLevelAssign when data is loaded
  useEffect(() => {
    if (
      !isInitialized.current &&
      companyLevelAssign?.data &&
      coreParaOptions &&
      allLevel?.data
    ) {
      const initialSelections = companyLevelAssign.data.map(
        (item: CompanyLevelJunction) => {
          const coreParamName =
            coreParaOptions.find((opt) => opt.value === item.coreParameterId)
              ?.label || "";
          const levelName =
            allLevel.data.find((level) => level.levelId === item.currentLevelId)
              ?.levelName || "";

          return {
            coreParameter: {
              id: item.coreParameterId,
              name: coreParamName,
            },
            level: {
              id: item.currentLevelId,
              name: levelName,
            },
            isChanged: false,
          };
        },
      );
      setAllSelections(initialSelections);
      initialSelectionsRef.current = initialSelections;
      isInitialized.current = true;
    }
  }, [companyLevelAssign?.data, coreParaOptions, allLevel?.data]);

  const handleCorePara = useCallback(
    (data: string) => {
      setCoreParameters(data);

      // Find the selection for the newly chosen Business Function in allSelections
      const currentCoreParameterSelection = allSelections.find(
        (selection) => selection.coreParameter.id === data,
      );

      if (currentCoreParameterSelection) {
        // If there's an existing selection (either changed or original), set selectedLevel to that
        setSelectedLevel(currentCoreParameterSelection.level.id);
      } else {
        // If it's a new Business Function not yet in allSelections, fetch from companyLevelAssign
        // This case should ideally not be hit if initialSelectionsRef correctly populates allSelections initially.
        const matched = companyLevelAssign?.data?.find(
          (item: CompanyLevelJunction) => item.coreParameterId === data,
        );
        if (matched) {
          setSelectedLevel(matched.currentLevelId);
          // Add to allSelections with isChanged: false. This should generally only happen if a Business Function
          // was not present in the initial companyLevelAssign data but is now being interacted with.
          setAllSelections((prev) => {
            const updatedMap = new Map(
              prev.map((item) => [item.coreParameter.id, item]),
            );
            updatedMap.set(data, {
              coreParameter: {
                id: data,
                name:
                  coreParaOptions?.find((opt) => opt.value === data)?.label ||
                  "",
              },
              level: {
                id: matched.currentLevelId,
                name:
                  allLevel?.data?.find(
                    (level) => level.levelId === matched.currentLevelId,
                  )?.levelName || "",
              },
              isChanged: false,
            });
            return Array.from(updatedMap.values());
          });
        } else {
          setSelectedLevel("");
        }
      }
    },
    [companyLevelAssign?.data, coreParaOptions, allLevel?.data, allSelections],
  );

  const handleLevelSelect = useCallback(
    (levelId: string) => {
      setSelectedLevel(levelId);

      setAllSelections((prev) => {
        // Create a new Map from previous selections for easy updates
        const updatedMap = new Map(
          prev.map((item) => [item.coreParameter.id, item]),
        );

        // Find the current Business Function's original level from DB data
        const originalLevel = companyLevelAssign?.data?.find(
          (item: CompanyLevelJunction) =>
            item.coreParameterId === selectedCoreParameters,
        )?.currentLevelId;

        // Create the updated selection object
        const updatedSelection: Selection = {
          coreParameter: {
            id: selectedCoreParameters,
            name:
              coreParaOptions?.find(
                (opt) => opt.value === selectedCoreParameters,
              )?.label || "",
          },
          level: {
            id: levelId,
            name:
              allLevel?.data?.find((level) => level.levelId === levelId)
                ?.levelName || "",
          },
          isChanged: originalLevel !== levelId, // Correctly set isChanged
        };

        // Update the map with the new/updated selection
        updatedMap.set(selectedCoreParameters, updatedSelection);

        // Convert the map back to an array for the state
        const newAllSelections = Array.from(updatedMap.values());

        // Set hasUnsavedChanges if any selection is changed
        setHasUnsavedChanges(
          newAllSelections.some((selection) => selection.isChanged),
        );

        return newAllSelections;
      });
    },
    [
      selectedCoreParameters,
      coreParaOptions,
      allLevel?.data,
      companyLevelAssign?.data,
      setHasUnsavedChanges,
    ],
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
    setIsSaving(true);

    // Filter for only changed selections
    const changedSelections = allSelections.filter(
      (selection) => selection.isChanged,
    );
    // Ensure unique coreParameterId entries in the final payload, keeping the latest level
    const uniquePayloadMap = new Map<string, CompanyLevelJunction>();
    changedSelections.forEach((selection) => {
      const existingJunction = companyLevelAssign?.data?.find(
        (item: CompanyLevelJunction) =>
          item.coreParameterId === selection.coreParameter.id,
      );
      uniquePayloadMap.set(selection.coreParameter.id, {
        companyLevelJunctionId: existingJunction?.companyLevelJunctionId || "",
        coreParameterId: selection.coreParameter.id,
        currentLevelId: selection.level.id,
      });
    });
    const payload = Array.from(uniquePayloadMap.values());

    if (payload.length === 0) {
      toast.info("No changes to save.");
      setIsSaving(false);
      return; // Exit if no changes
    }

    companyLevelMutation(payload, {
      onSuccess: () => {
        setIsSaving(false);
        navigate("/dashboard/business/company-level-assign");
        setCoreParameters("");
        setSelectedLevel("");
        isInitialized.current = false;
        setAllSelections([]);
        setHasUnsavedChanges(false); // Reset on successful save
      },
      onError: () => {
        setIsSaving(false);
      },
    });
  };

  const handleCancel = useCallback(() => {
    setAllSelections(initialSelectionsRef.current);
    setCoreParameters("");
    setSelectedLevel("");
    setHasUnsavedChanges(false); // Reset on cancel
  }, []);

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
    handleCancel,
    hasUnsavedChanges,
  };
}
