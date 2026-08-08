/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { 
  DragEndEvent, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { getUserDetail, getUserPermission } from "@/features/selectors/auth.selector";
import { 
  useGetBlueprint, 
  useGetBlueprintCoreValues, 
  useSaveBlueprint,
  useDeleteBlueprintGoal,
  useDeleteGoalValue,
  useDeleteCoreValue,
  CoreValueMasterItem
} from "@/features/api/Blueprint";

export interface UISelectedCoreValue {
  CodeValueId: string;
  companyCoreValueId?: string;
  coreValue: string;
  actionStatement: string;
}

export interface UISubjectiveRow {
  id: string; // "temp-*" for unsaved, "real-uuid" for saved
  key: string;
  unit?: string;
  values: Record<string, string>; // year -> value
}

export default function useBlueprint() {
  const { setBreadcrumbs } = useBreadcrumbs();
  const user = useSelector(getUserDetail);
  const companyId = user?.companyId || "";

  const isInitializedRef = useRef(false);

  // Dynamic Year Columns ("1", "2", "3"...)
  const [objectiveYears, setObjectiveYears] = useState<string[]>([]);
  const [subjectiveYears, setSubjectiveYears] = useState<string[]>([]);

  // Mission State
  const [whyChooseUs, setWhyChooseUs] = useState("");
  const [whyConvenient, setWhyConvenient] = useState("");

  // Core Values Popover & State
  const [selectedCoreValues, setSelectedCoreValues] = useState<UISelectedCoreValue[]>([]);
  const [showCoreValuesSelect, setShowCoreValuesSelect] = useState(false);
  const [coreValueSearchTerm, setCoreValueSearchTerm] = useState("");
  const coreValuePopoverRef = useRef<HTMLDivElement>(null);

  // Objectives State: GoalId -> { year -> value } and GoalId -> unit
  const [objectiveValues, setObjectiveValues] = useState<Record<string, Record<string, string>>>({});
  const [objectiveUnits, setObjectiveUnits] = useState<Record<string, string>>({});

  // Subjectives Rows State
  const [subjectives, setSubjectives] = useState<UISubjectiveRow[]>([]);

  // Delete Confirmation Modal State
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {}
  });

  const closeDeleteConfirmModal = () => {
    setDeleteConfirmState(prev => ({ ...prev, isOpen: false }));
  };

  // API Queries & Mutations
  const { data: coreValuesRes, isLoading: isCoreValuesLoading } = useGetBlueprintCoreValues(companyId);
  const { data: blueprintRes, isLoading: isBlueprintLoading } = useGetBlueprint(companyId);

  const saveBlueprintMutation = useSaveBlueprint();
  const deleteGoalMutation = useDeleteBlueprintGoal();
  const deleteGoalValueMutation = useDeleteGoalValue();
  const deleteCoreValueMutation = useDeleteCoreValue();

  const coreValuesMasterList: CoreValueMasterItem[] = coreValuesRes?.data && Array.isArray(coreValuesRes.data) 
    ? coreValuesRes.data 
    : [];

  // DnD Kit Sensors & DragEnd Handler for Core Values Reordering
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEndCoreValues = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSelectedCoreValues(prev => {
        const oldIndex = prev.findIndex(item => item.CodeValueId === active.id);
        const newIndex = prev.findIndex(item => item.CodeValueId === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(prev, oldIndex, newIndex);
        }
        return prev;
      });
    }
  };

  // Reset initialization flag when companyId changes
  useEffect(() => {
    isInitializedRef.current = false;
  }, [companyId]);

  // Breadcrumbs & Popover click outside
  useEffect(() => {
    setBreadcrumbs([{ label: "Blueprint", href: "" }]);
  }, [setBreadcrumbs]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (coreValuePopoverRef.current && !coreValuePopoverRef.current.contains(event.target as Node)) {
        setShowCoreValuesSelect(false);
      }
    };
    if (showCoreValuesSelect) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCoreValuesSelect]);

  // Sync Initial Blueprint Data from API once on initial load / company change
  useEffect(() => {
    if (blueprintRes && !isInitializedRef.current) {
      isInitializedRef.current = true;

      // 1. Mission
      setWhyChooseUs(blueprintRes.mission?.whyWeExist || "");
      setWhyConvenient(blueprintRes.mission?.differentiation || "");
      
      // 2. Core Values
      setSelectedCoreValues(
        (blueprintRes.coreValues || []).map((cv) => ({
          CodeValueId: cv.CodeValueId || cv.companyCoreValueId || "",
          companyCoreValueId: cv.companyCoreValueId,
          coreValue: cv.coreValue || "",
          actionStatement: cv.actionStatement || ""
        }))
      );

      // 3. Determine Initial Year Columns Range
      const defaultYearsCount = Number(import.meta.env.VITE_BLUEPRINT_YEARS_COUNT) || 5;
      let maxObjYear = defaultYearsCount;
      if (blueprintRes.objectives) {
        blueprintRes.objectives.forEach(obj => {
          obj.goalValues?.forEach(val => {
            const valYr = Number(val.year);
            if (!isNaN(valYr) && valYr > maxObjYear && valYr < 100) maxObjYear = valYr;
          });
        });
      }

      let maxSubYear = 0;
      let minSubYear = 1;
      if (blueprintRes.subjectives) {
        blueprintRes.subjectives.forEach(sub => {
          sub.goalValues?.forEach(val => {
            const valYr = Number(val.year);
            if (!isNaN(valYr) && valYr < 100) {
              if (valYr > maxSubYear) maxSubYear = valYr;
              if (valYr < minSubYear) minSubYear = valYr;
            }
          });
        });
      }

      const objYears: string[] = [];
      for (let y = 1; y <= maxObjYear; y++) objYears.push(String(y));
      setObjectiveYears(objYears);

      const subYears: string[] = [];
      if (maxSubYear > 0) {
        for (let y = minSubYear; y <= maxSubYear; y++) subYears.push(String(y));
      }
      setSubjectiveYears(subYears);

      // 4. Objectives Values & Units
      const objVals: Record<string, Record<string, string>> = {};
      const objUnitsMap: Record<string, string> = {};
      if (blueprintRes.objectives) {
        blueprintRes.objectives.forEach(obj => {
          const yrMap: Record<string, string> = {};
          obj.goalValues?.forEach(val => {
            yrMap[String(val.year)] = (val.value === null || val.value === undefined || String(val.value) === "null") ? "" : String(val.value);
          });
          objVals[obj.companyBlueprintGoalId] = yrMap;
          objUnitsMap[obj.companyBlueprintGoalId] = obj.description || (obj as any).unit || "";
        });
      }
      setObjectiveValues(objVals);
      setObjectiveUnits(objUnitsMap);

      // 5. Subjectives Rows
      const subRows: UISubjectiveRow[] = [];
      if (blueprintRes.subjectives) {
        blueprintRes.subjectives.forEach(sub => {
          const yrMap: Record<string, string> = {};
          sub.goalValues?.forEach(val => {
            yrMap[String(val.year)] = (val.value === null || val.value === undefined || String(val.value) === "null") ? "" : String(val.value);
          });
          subRows.push({
            id: sub.companyBlueprintGoalId,
            key: sub.title || "",
            unit: sub.description || (sub as any).unit || "",
            values: yrMap
          });
        });
      }
      setSubjectives(subRows);
    }
  }, [blueprintRes]);

  // Year Labels
  const getObjectiveYearLabel = (yr: string) => {
    const num = Number(yr);
    if (!isNaN(num) && num > 0) {
      if (num === 1) return "1st Year";
      if (num === 2) return "2nd Year";
      if (num === 3) return "3rd Year";
      return `${num}th Year`;
    }
    return yr;
  };

  const getSubjectiveYearLabel = (yr: string) => {
    const num = Number(yr);
    if (!isNaN(num) && num > 0) {
      if (num === 1) return "1st Year";
      if (num === 2) return "2nd Year";
      if (num === 3) return "3rd Year";
      return `${num}th Year`;
    }
    return yr;
  };

  // Add / Remove Year Columns
  const handleAddObjectiveYear = () => {
    setObjectiveYears(prev => {
      const lastYear = prev.length > 0 ? Number(prev[prev.length - 1]) : 0;
      return [...prev, String(lastYear + 1)];
    });
  };

  const handleAddSubjectiveYear = () => {
    setSubjectiveYears(prev => {
      const lastYear = prev.length > 0 ? Number(prev[prev.length - 1]) : 0;
      return [...prev, String(lastYear + 1)];
    });
  };

  const executeRemoveObjectiveYear = (yr: string) => {
    const deletedYearNum = Number(yr);

    // 1. Immediate delete API call for ALL saved goal values in year >= deletedYearNum
    const toDeleteIds: string[] = [];
    blueprintRes?.objectives?.forEach(obj => {
      obj.goalValues?.forEach(val => {
        if (Number(val.year) >= deletedYearNum && val.companyBlueprintGoalValueId) {
          toDeleteIds.push(val.companyBlueprintGoalValueId);
        }
      });
    });
    if (toDeleteIds.length > 0 && companyId) {
      deleteGoalValueMutation.mutate({ ids: toDeleteIds, companyId });
    }

    // 2. Renumber objectiveYears sequentially (length decreases by 1)
    setObjectiveYears(prev => {
      if (prev.length <= 1) return prev;
      return Array.from({ length: prev.length - 1 }, (_, i) => String(i + 1));
    });

    // 3. Shift objective values sequentially (e.g. old year 5 value becomes new year 4 value)
    setObjectiveValues(prev => {
      const updated: Record<string, Record<string, string>> = {};
      Object.keys(prev).forEach(goalId => {
        const oldMap = prev[goalId] || {};
        const newMap: Record<string, string> = {};

        Object.keys(oldMap).forEach(yStr => {
          const yNum = Number(yStr);
          if (yNum < deletedYearNum) {
            newMap[String(yNum)] = oldMap[yStr];
          } else if (yNum > deletedYearNum) {
            newMap[String(yNum - 1)] = oldMap[yStr];
          }
          // yNum === deletedYearNum is omitted
        });

        updated[goalId] = newMap;
      });
      return updated;
    });
  };

  const handleRemoveObjectiveYear = (yr: string) => {
    const label = getObjectiveYearLabel(yr);
    setDeleteConfirmState({
      isOpen: true,
      title: `Delete ${label} Column`,
      description: `Are you sure you want to delete ${label}? All values in this column will be permanently removed and remaining years will be renumbered. This action cannot be undone.`,
      onConfirm: () => executeRemoveObjectiveYear(yr)
    });
  };

  const executeRemoveSubjectiveYear = (yr: string) => {
    const deletedYearNum = Number(yr);

    // 1. Immediate delete API call for ALL saved goal values in year >= deletedYearNum
    const toDeleteIds: string[] = [];
    blueprintRes?.subjectives?.forEach(sub => {
      sub.goalValues?.forEach(val => {
        if (Number(val.year) >= deletedYearNum && val.companyBlueprintGoalValueId) {
          toDeleteIds.push(val.companyBlueprintGoalValueId);
        }
      });
    });
    if (toDeleteIds.length > 0 && companyId) {
      deleteGoalValueMutation.mutate({ ids: toDeleteIds, companyId });
    }

    // 2. Renumber subjectiveYears sequentially (length decreases by 1)
    setSubjectiveYears(prev => {
      if (prev.length <= 1) return prev;
      return Array.from({ length: prev.length - 1 }, (_, i) => String(i + 1));
    });

    // 3. Shift subjective row values sequentially (e.g. old year 5 value becomes new year 4 value)
    setSubjectives(prev =>
      prev.map(row => {
        const oldMap = row.values || {};
        const newMap: Record<string, string> = {};

        Object.keys(oldMap).forEach(yStr => {
          const yNum = Number(yStr);
          if (yNum < deletedYearNum) {
            newMap[String(yNum)] = oldMap[yStr];
          } else if (yNum > deletedYearNum) {
            newMap[String(yNum - 1)] = oldMap[yStr];
          }
          // yNum === deletedYearNum is omitted
        });

        return { ...row, values: newMap };
      })
    );
  };

  const handleRemoveSubjectiveYear = (yr: string) => {
    const label = getSubjectiveYearLabel(yr);
    setDeleteConfirmState({
      isOpen: true,
      title: `Delete ${label} Column`,
      description: `Are you sure you want to delete ${label}? All values in this column will be permanently removed and remaining years will be renumbered. This action cannot be undone.`,
      onConfirm: () => executeRemoveSubjectiveYear(yr)
    });
  };

  // Core Value Handlers with Immediate Delete API call
  const executeRemoveCoreValue = (idToRemove: string) => {
    const target = selectedCoreValues.find(
      item => item.CodeValueId === idToRemove || item.companyCoreValueId === idToRemove
    );

    const deleteId = target?.companyCoreValueId || target?.CodeValueId || idToRemove;

    if (deleteId && companyId) {
      deleteCoreValueMutation.mutate({ id: deleteId, companyId });
    }

    setSelectedCoreValues(prev =>
      prev.filter(item => item.CodeValueId !== idToRemove && item.companyCoreValueId !== idToRemove)
    );
  };

  const handleRemoveCoreValue = (idToRemove: string) => {
    const target = selectedCoreValues.find(
      item => item.CodeValueId === idToRemove || item.companyCoreValueId === idToRemove
    );
    const name = target?.coreValue ? `"${target.coreValue}"` : "this core value";
    setDeleteConfirmState({
      isOpen: true,
      title: "Remove Core Value",
      description: `Are you sure you want to remove ${name} from Core Values? This action cannot be undone.`,
      onConfirm: () => executeRemoveCoreValue(idToRemove)
    });
  };

  const handleToggleCoreValue = (id: string) => {
    const exists = selectedCoreValues.some(cv => cv.CodeValueId === id || cv.companyCoreValueId === id);
    if (exists) {
      handleRemoveCoreValue(id);
    } else {
      const item = coreValuesMasterList.find(cv => cv.CodeValueId === id);
      if (item) {
        setSelectedCoreValues(prev => [
          ...prev,
          {
            CodeValueId: item.CodeValueId,
            coreValue: item.coreValue,
            actionStatement: item.actionStatement || ""
          }
        ]);
      }
    }
  };

  // Objectives Handlers
  const handleObjectiveValueChange = (goalId: string, year: string, val: string) => {
    setObjectiveValues(prev => ({
      ...prev,
      [goalId]: { ...(prev[goalId] || {}), [year]: val }
    }));
  };

  const handleObjectiveUnitChange = (goalId: string, unitVal: string) => {
    setObjectiveUnits(prev => ({ ...prev, [goalId]: unitVal }));
  };

  // Subjectives Handlers
  const handleAddSubjective = () => {
    const newRow: UISubjectiveRow = {
      id: `temp-${Math.random().toString(36).substr(2, 9)}`,
      key: "",
      unit: "",
      values: {}
    };
    setSubjectives(prev => [...prev, newRow]);
    if (subjectiveYears.length === 0) setSubjectiveYears(["1"]);
  };

  const handleUpdateSubjectiveKey = (id: string, keyVal: string) => {
    setSubjectives(subjectives.map(row => row.id === id ? { ...row, key: keyVal } : row));
    if (keyVal.trim() !== "" && subjectiveYears.length === 0) setSubjectiveYears(["1"]);
  };

  const handleUpdateSubjectiveUnit = (id: string, unitVal: string) => {
    setSubjectives(subjectives.map(row => row.id === id ? { ...row, unit: unitVal } : row));
  };

  const handleSubjectiveValueChange = (id: string, year: string, val: string) => {
    setSubjectives(subjectives.map(row => row.id === id ? { ...row, values: { ...(row.values || {}), [year]: val } } : row));
  };

  // Immediate delete for Subjective row with modal
  const executeRemoveSubjective = (id: string) => {
    if (!id.startsWith("temp-") && companyId) {
      deleteGoalMutation.mutate({ id, companyId });
    }
    setSubjectives(prev => prev.filter(row => row.id !== id));
  };

  const handleRemoveSubjective = (id: string) => {
    const target = subjectives.find(s => s.id === id);
    const rowName = target?.key ? `"${target.key}"` : "this subjective goal";
    setDeleteConfirmState({
      isOpen: true,
      title: "Delete Subjective Goal",
      description: `Are you sure you want to delete ${rowName}? This action cannot be undone.`,
      onConfirm: () => executeRemoveSubjective(id)
    });
  };

  // Bulk Save Blueprint Handler (POST /company/blueprint-goal/save-all)
  const handleSave = () => {
    if (!companyId) {
      toast.error("Invalid Company profile. Please log in again.");
      return;
    }

    if (subjectives.some(s => !s.key.trim())) {
      toast.error("Please enter a Key name for all Subjective rows.");
      return;
    }

    const mission = { whyWeExist: whyChooseUs, differentiation: whyConvenient };

    // Format coreValues array with coreValueId and sortOrder (1, 2, 3...)
    const coreValues = selectedCoreValues.map((cv, index) => ({
      coreValueId: cv.CodeValueId,
      sortOrder: index + 1
    }));

    const goals: any[] = [];
    const goalValues: any[] = [];

    // Process Objectives (ONLY iterate over active objectiveYears!)
    blueprintRes?.objectives?.forEach(obj => {
      const goalId = obj.companyBlueprintGoalId;
      const unitVal = objectiveUnits[goalId] || "";
      const valsMap = objectiveValues[goalId] || {};
      const objGoalValues: any[] = [];

      objectiveYears.forEach(yr => {
        const rawVal = valsMap[yr];
        const numericVal = (rawVal === "" || rawVal === null || rawVal === undefined || isNaN(Number(rawVal))) ? null : Number(rawVal);
        const gVal = { year: Number(yr), value: numericVal, remarks: "" };
        objGoalValues.push(gVal);
        goalValues.push({ companyBlueprintGoalId: goalId, year: Number(yr), value: numericVal, remarks: "" });
      });

      goals.push({ companyBlueprintGoalId: goalId, unit: unitVal, description: unitVal, goalValues: objGoalValues });
    });

    // Process Saved Subjectives (ONLY iterate over active subjectiveYears!)
    subjectives.filter(s => !s.id.startsWith("temp-")).forEach(sub => {
      const goalId = sub.id;
      const unitVal = sub.unit || "";
      const titleVal = sub.key || "";
      const valsMap = sub.values || {};
      const subGoalValues: any[] = [];

      subjectiveYears.forEach(yr => {
        const rawVal = valsMap[yr];
        const numericVal = (rawVal === "" || rawVal === null || rawVal === undefined || isNaN(Number(rawVal))) ? null : Number(rawVal);
        const gVal = { year: Number(yr), value: numericVal, remarks: "" };
        subGoalValues.push(gVal);
        goalValues.push({ companyBlueprintGoalId: goalId, year: Number(yr), value: numericVal, remarks: "" });
      });

      goals.push({ companyBlueprintGoalId: goalId, title: titleVal, unit: unitVal, description: unitVal, goalValues: subGoalValues });
    });

    // Process Unsaved Temp Subjectives (ONLY iterate over active subjectiveYears!)
    subjectives.filter(s => s.id.startsWith("temp-")).forEach(sub => {
      const unitVal = sub.unit || "";
      const titleVal = sub.key || "";
      const valsMap = sub.values || {};

      const newSubGoalValues = subjectiveYears
        .filter(yr => valsMap[yr] !== "" && valsMap[yr] !== null && valsMap[yr] !== undefined)
        .map(yr => ({ year: Number(yr), value: Number(valsMap[yr]) || 0, remarks: "" }));

      goals.push({ type: "SUBJECTIVE", title: titleVal, unit: unitVal, description: unitVal, goalValues: newSubGoalValues });
    });

    saveBlueprintMutation.mutate(
      { companyId, mission, coreValues, goals, goalValues },
      {
        onSuccess: () => {
          isInitializedRef.current = false;
        }
      }
    );
  };

  // User Permissions
  const permission = useSelector(getUserPermission)?.BLUEPRINT || {};
  const hasBlueprintPermission = (() => {
    if (typeof permission === "boolean") return permission;
    if (typeof permission === "object") return Boolean(permission?.View ?? permission?.view ?? true);
    return true;
  })();

  const isLoading = isBlueprintLoading || isCoreValuesLoading;

  return {
    hasBlueprintPermission,
    permission,
    isLoading,
    saveBlueprintMutation,
    handleSave,
    coreValuesMasterList,
    selectedCoreValues,
    showCoreValuesSelect,
    setShowCoreValuesSelect,
    coreValueSearchTerm,
    setCoreValueSearchTerm,
    coreValuePopoverRef,
    handleRemoveCoreValue,
    handleToggleCoreValue,
    sensors,
    handleDragEndCoreValues,
    whyChooseUs,
    setWhyChooseUs,
    whyConvenient,
    setWhyConvenient,
    blueprintRes,
    objectiveYears,
    getObjectiveYearLabel,
    handleAddObjectiveYear,
    handleRemoveObjectiveYear,
    objectiveUnits,
    handleObjectiveUnitChange,
    objectiveValues,
    handleObjectiveValueChange,
    subjectiveYears,
    getSubjectiveYearLabel,
    handleAddSubjectiveYear,
    handleRemoveSubjectiveYear,
    subjectives,
    handleAddSubjective,
    handleUpdateSubjectiveKey,
    handleUpdateSubjectiveUnit,
    handleSubjectiveValueChange,
    handleRemoveSubjective,
    deleteConfirmState,
    closeDeleteConfirmModal,
  };
}

export { useBlueprint };
