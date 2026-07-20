/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { Button } from "@/components/ui/button";
import { 
  LayoutTemplate, 
  Plus, 
  Trash2, 
  Save, 
  Loader2,
  ShieldAlert,
  Search,
  Check,
  X
} from "lucide-react";
import { toast } from "sonner";

// Pre-existing project components
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

// Auth selector
import { getUserDetail, getUserPermission } from "@/features/selectors/auth.selector";

// API hooks
import { 
  useGetBlueprint, 
  useGetBlueprintCoreValues, 
  useSaveBlueprint 
} from "@/features/api/Blueprint";
import { CompanyCoreValueItem } from "@/features/api/Blueprint/useGetBlueprint";

// Local interfaces for strict type safety
interface UISelectedCoreValue {
  CodeValueId: string;
  coreValue: string;
  actionStatement: string;
}

interface UISubjectiveRow {
  id: string; // "temp-*" for unsaved, "real-uuid" for saved
  key: string;
  unit?: string;
  values: Record<string, string>; // year -> value
}



export default function MenuBlueprint() {
  const { setBreadcrumbs } = useBreadcrumbs();

  // Get current logged-in user detail to obtain companyId
  const user = useSelector(getUserDetail);
  const companyId = user?.companyId || "";

  // Dynamic years states
  const [objectiveYears, setObjectiveYears] = useState<string[]>([]);
  const [subjectiveYears, setSubjectiveYears] = useState<string[]>([]);

  // Track deleted goal values (from deleted columns)
  const [deletedGoalValueIds, setDeletedGoalValueIds] = useState<string[]>([]);

  // Helper to format calendar year to ordinal label based on its index
  const getObjectiveYearLabel = (yr: string) => {
    const index = objectiveYears.indexOf(yr);
    if (index === -1) return yr;
    const num = index + 1;
    if (num === 1) return "1st Year";
    if (num === 2) return "2nd Year";
    if (num === 3) return "3rd Year";
    return `${num}th Year`;
  };

  const getSubjectiveYearLabel = (yr: string) => {
    const index = subjectiveYears.indexOf(yr);
    if (index === -1) return yr;
    const num = index + 1;
    if (num === 1) return "1st Year";
    if (num === 2) return "2nd Year";
    if (num === 3) return "3rd Year";
    return `${num}th Year`;
  };

  const handleAddObjectiveYear = () => {
    setObjectiveYears(prev => {
      const lastYear = prev.length > 0 ? Number(prev[prev.length - 1]) : new Date().getFullYear() - 1;
      return [...prev, String(lastYear + 1)];
    });
  };

  const handleAddSubjectiveYear = () => {
    setSubjectiveYears(prev => {
      const lastYear = prev.length > 0 ? Number(prev[prev.length - 1]) : new Date().getFullYear() - 1;
      return [...prev, String(lastYear + 1)];
    });
  };

  const handleRemoveObjectiveYear = (yr: string) => {
    // 1. Gather goal value IDs for this year to delete
    const toDelete: string[] = [];
    if (blueprintRes?.objectives) {
      blueprintRes.objectives.forEach(obj => {
        if (obj.goalValues) {
          obj.goalValues.forEach(val => {
            if (String(val.year) === yr && val.companyBlueprintGoalValueId) {
              toDelete.push(val.companyBlueprintGoalValueId);
            }
          });
        }
      });
    }
    setDeletedGoalValueIds(prev => [...prev, ...toDelete]);

    // 2. Remove year column from UI
    setObjectiveYears(prev => prev.filter(y => y !== yr));
  };

  const handleRemoveSubjectiveYear = (yr: string) => {
    // 1. Gather goal value IDs for this year to delete
    const toDelete: string[] = [];
    if (blueprintRes?.subjectives) {
      blueprintRes.subjectives.forEach(sub => {
        if (sub.goalValues) {
          sub.goalValues.forEach(val => {
            if (String(val.year) === yr && val.companyBlueprintGoalValueId) {
              toDelete.push(val.companyBlueprintGoalValueId);
            }
          });
        }
      });
    }
    setDeletedGoalValueIds(prev => [...prev, ...toDelete]);

    // 2. Remove year column from UI
    setSubjectiveYears(prev => prev.filter(y => y !== yr));
  };

  // Component Form State
  const [whyChooseUs, setWhyChooseUs] = useState("");
  const [whyConvenient, setWhyConvenient] = useState("");
  
  // Core Values state tracking
  const [initialCoreValues, setInitialCoreValues] = useState<CompanyCoreValueItem[]>([]);
  const [selectedCoreValues, setSelectedCoreValues] = useState<UISelectedCoreValue[]>([]);
  const [showCoreValuesSelect, setShowCoreValuesSelect] = useState(false);
  const [coreValueSearchTerm, setCoreValueSearchTerm] = useState("");
  const coreValuePopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        coreValuePopoverRef.current && 
        !coreValuePopoverRef.current.contains(event.target as Node)
      ) {
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
  
  // Year mapped inputs for objectives: companyBlueprintGoalId -> { year -> value }
  const [objectiveValues, setObjectiveValues] = useState<Record<string, Record<string, string>>>({});
  const [objectiveUnits, setObjectiveUnits] = useState<Record<string, string>>({});
  
  // Subjective items: { id, key, unit, values: { year -> value } }
  const [subjectives, setSubjectives] = useState<UISubjectiveRow[]>([]);
  
  // Track subjective row IDs that have been deleted in this session
  const [deletedSubjectiveIds, setDeletedSubjectiveIds] = useState<string[]>([]);

  // API - Get all Core Value Master options
  const { data: coreValuesRes, isLoading: isCoreValuesLoading } = useGetBlueprintCoreValues(companyId);
  const coreValuesMasterList = coreValuesRes?.data && Array.isArray(coreValuesRes.data) 
    ? coreValuesRes.data 
    : [];

  // API - Get Blueprint consolidated data (including objectives and subjectives)
  const { data: blueprintRes, isLoading: isBlueprintLoading } = useGetBlueprint(companyId);
  
  // API - Save Blueprint Mutation
  const saveBlueprintMutation = useSaveBlueprint();

  // Breadcrumbs initialization
  useEffect(() => {
    setBreadcrumbs([{ label: "Blueprint", href: "" }]);
  }, [setBreadcrumbs]);

  // Load blueprint initial state from API when query returns
  useEffect(() => {
    if (blueprintRes) {
      // 1. Mission / Differentiators
      setWhyChooseUs(blueprintRes.mission?.whyWeExist || "");
      setWhyConvenient(blueprintRes.mission?.differentiation || "");
      
      // 2. Core Values
      setInitialCoreValues(blueprintRes.coreValues || []);
      setSelectedCoreValues(
        blueprintRes.coreValues.map(cv => {
          const cvKeys = Object.keys(cv);
          const codeValueIdKey = cvKeys.find(k => k.toLowerCase() === "codevalueid") 
                              || cvKeys.find(k => k.toLowerCase() === "blueprintcorevalueid") 
                              || cvKeys.find(k => k.toLowerCase() === "id");
          const codeValueKey = cvKeys.find(k => k.toLowerCase() === "corevalue") 
                            || cvKeys.find(k => k.toLowerCase() === "codevalue");
          
          return {
            CodeValueId: codeValueIdKey ? String((cv as any)[codeValueIdKey]) : "",
            coreValue: codeValueKey ? String((cv as any)[codeValueKey]) : "",
            actionStatement: cv.actionStatement || ""
          };
        })
      );

      // Determine initial years count based on existing saved values, with fallback minimum to 5
      const defaultYearsCount = Number(import.meta.env.VITE_BLUEPRINT_YEARS_COUNT) || 5;
      const currentYear = new Date().getFullYear();
      
      let maxObjYear = currentYear + defaultYearsCount - 1;
      if (blueprintRes.objectives) {
        blueprintRes.objectives.forEach(obj => {
          if (obj.goalValues) {
            obj.goalValues.forEach(val => {
              if (val.year > maxObjYear) maxObjYear = val.year;
            });
          }
        });
      }

      let maxSubYear = 0;
      let minSubYear = currentYear;
      if (blueprintRes.subjectives) {
        blueprintRes.subjectives.forEach(sub => {
          if (sub.goalValues && sub.goalValues.length > 0) {
            sub.goalValues.forEach(val => {
              if (val.year > maxSubYear) maxSubYear = val.year;
              if (val.year < minSubYear) minSubYear = val.year;
            });
          }
        });
      }

      // Initialize objectiveYears and subjectiveYears independently
      const objYears: string[] = [];
      for (let y = currentYear; y <= maxObjYear; y++) {
        objYears.push(String(y));
      }
      setObjectiveYears(objYears);

      const subYears: string[] = [];
      if (maxSubYear > 0) {
        for (let y = minSubYear; y <= maxSubYear; y++) {
          subYears.push(String(y));
        }
      }
      setSubjectiveYears(subYears);
      
      // 3. Objectives Value Mappings & Units
      const objVals: Record<string, Record<string, string>> = {};
      const objUnitsMap: Record<string, string> = {};
      if (blueprintRes.objectives) {
        blueprintRes.objectives.forEach(obj => {
          const yrMap: Record<string, string> = {};
          if (obj.goalValues) {
            obj.goalValues.forEach(val => {
              yrMap[String(val.year)] = (val.value === null || val.value === undefined || String(val.value) === "null") ? "" : String(val.value);
            });
          }
          objVals[obj.companyBlueprintGoalId] = yrMap;
          objUnitsMap[obj.companyBlueprintGoalId] = obj.description || (obj as any).unit || "";
        });
      }
      setObjectiveValues(objVals);
      setObjectiveUnits(objUnitsMap);

      // 4. Subjectives
      const subRows: UISubjectiveRow[] = [];
      if (blueprintRes.subjectives) {
        blueprintRes.subjectives.forEach(sub => {
          const yrMap: Record<string, string> = {};
          if (sub.goalValues) {
            sub.goalValues.forEach(val => {
              yrMap[String(val.year)] = (val.value === null || val.value === undefined || String(val.value) === "null") ? "" : String(val.value);
            });
          }
          subRows.push({
            id: sub.companyBlueprintGoalId,
            key: sub.title || "",
            unit: sub.description || (sub as any).unit || "",
            values: yrMap
          });
        });
      }
      setSubjectives(subRows);
      
      // Reset deletion tracking on load
      setDeletedSubjectiveIds([]);
    }
  }, [blueprintRes]);

  const handleRemoveCoreValue = (codeValueId: string) => {
    setSelectedCoreValues(prev => prev.filter(item => item.CodeValueId !== codeValueId));
  };

  const handleToggleCoreValue = (id: string) => {
    setSelectedCoreValues(prev => {
      const exists = prev.some(cv => cv.CodeValueId === id);
      if (exists) {
        return prev.filter(cv => cv.CodeValueId !== id);
      } else {
        const item = coreValuesMasterList.find((cv: any) => {
          const cvId = cv.CodeValueId || cv.blueprintCoreValueId || "";
          return cvId === id;
        });
        if (!item) return prev;
        return [
          ...prev,
          {
            CodeValueId: item.CodeValueId || (item as any).blueprintCoreValueId || "",
            coreValue: item.coreValue || (item as any).codeValue || "",
            actionStatement: item.actionStatement || ""
          }
        ];
      }
    });
  };

  // Objectives Value & Unit Handlers
  const handleObjectiveValueChange = (goalId: string, year: string, val: string) => {
    setObjectiveValues(prev => ({
      ...prev,
      [goalId]: {
        ...(prev[goalId] || {}),
        [year]: val
      }
    }));
  };

  const handleObjectiveUnitChange = (goalId: string, unitVal: string) => {
    setObjectiveUnits(prev => ({
      ...prev,
      [goalId]: unitVal
    }));
  };

  // Subjectives Actions
  const handleAddSubjective = () => {
    const newRow: UISubjectiveRow = {
      id: `temp-${Math.random().toString(36).substr(2, 9)}`,
      key: "",
      unit: "",
      values: {}
    };
    setSubjectives(prev => [...prev, newRow]);

    // Auto-add 1st year column when adding initial row if no year columns exist yet
    if (subjectiveYears.length === 0) {
      const currentYear = new Date().getFullYear();
      setSubjectiveYears([String(currentYear)]);
    }
  };

  const handleUpdateSubjectiveKey = (id: string, keyVal: string) => {
    setSubjectives(
      subjectives.map((row) => (row.id === id ? { ...row, key: keyVal } : row))
    );

    // Auto-add 1st year column when entering key name if no year columns exist yet
    if (keyVal.trim() !== "" && subjectiveYears.length === 0) {
      const currentYear = new Date().getFullYear();
      setSubjectiveYears([String(currentYear)]);
    }
  };

  const handleUpdateSubjectiveUnit = (id: string, unitVal: string) => {
    setSubjectives(
      subjectives.map((row) => (row.id === id ? { ...row, unit: unitVal } : row))
    );
  };

  const handleSubjectiveValueChange = (id: string, year: string, val: string) => {
    setSubjectives(
      subjectives.map((row) => {
        if (row.id === id) {
          return {
            ...row,
            values: {
              ...(row.values || {}),
              [year]: val
            }
          };
        }
        return row;
      })
    );
  };

  const handleRemoveSubjective = (id: string) => {
    if (!id.startsWith("temp-")) {
      setDeletedSubjectiveIds(prev => [...prev, id]);
    }
    setSubjectives(subjectives.filter((row) => row.id !== id));
  };

  // Submit Handler
  const handleSave = () => {
    if (!companyId) {
      toast.error("Invalid Company profile. Please log in again.");
      return;
    }

    // Subjective validation
    if (subjectives.some(s => !s.key.trim())) {
      toast.error("Please enter a Key name for all Subjective rows.");
      return;
    }

    // Find deleted companyCoreValueIds safely checking case-insensitive keys
    const coreValueIdsToDelete = initialCoreValues
      .filter(initCv => {
        const initKeys = Object.keys(initCv);
        const initIdKey = initKeys.find(k => k.toLowerCase() === "codevalueid")
                       || initKeys.find(k => k.toLowerCase() === "blueprintcorevalueid")
                       || initKeys.find(k => k.toLowerCase() === "id");
        const initId = initIdKey ? String((initCv as any)[initIdKey]) : "";

        if (!initId) return false;

        return !selectedCoreValues.some(selCv => String(selCv.CodeValueId) === initId);
      })
      .map(initCv => {
        const keys = Object.keys(initCv);
        const idKey = keys.find(k => k.toLowerCase() === "companycorevalueid") 
                   || keys.find(k => k.toLowerCase().endsWith("corevalueid")) 
                   || keys.find(k => k.toLowerCase() === "id");
        return idKey ? String((initCv as any)[idKey]) : "";
      })
      .filter(id => id && id !== "undefined" && String(id).trim() !== "");

    // Find new CodeValueIds to assign
    const coreValueIdsToCreate = selectedCoreValues
      .filter(selCv => {
        return !initialCoreValues.some(initCv => {
          const initKeys = Object.keys(initCv);
          const initIdKey = initKeys.find(k => k.toLowerCase() === "codevalueid")
                         || initKeys.find(k => k.toLowerCase() === "blueprintcorevalueid")
                         || initKeys.find(k => k.toLowerCase() === "id");
          const initId = initIdKey ? String((initCv as any)[initIdKey]) : "";
          return initId === String(selCv.CodeValueId);
        });
      })
      .map(selCv => selCv.CodeValueId);

    const goalUpdatesToSave: Array<{ companyBlueprintGoalId: string; unit: string; description: string; title?: string }> = [];

    // Compile Objectives units to update via company/blueprint-goal/update/:id
    if (blueprintRes?.objectives) {
      blueprintRes.objectives.forEach(obj => {
        const goalId = obj.companyBlueprintGoalId;
        const unitVal = objectiveUnits[goalId] || "";
        goalUpdatesToSave.push({
          companyBlueprintGoalId: goalId,
          unit: unitVal,
          description: unitVal
        });
      });
    }

    // Compile existing Subjectives units and title to update via company/blueprint-goal/update/:id
    const existingSubjectives = subjectives.filter(s => !s.id.startsWith("temp-"));
    existingSubjectives.forEach(sub => {
      const unitVal = sub.unit || "";
      const titleVal = sub.key || "";
      goalUpdatesToSave.push({
        companyBlueprintGoalId: sub.id,
        unit: unitVal,
        description: unitVal,
        title: titleVal
      });
    });

    const goalValuesToSave: Array<{ companyBlueprintGoalId: string; year: number; value: number | null }> = [];

    // Compile Objectives values to save
    if (blueprintRes?.objectives) {
      blueprintRes.objectives.forEach(obj => {
        const vals = objectiveValues[obj.companyBlueprintGoalId] || {};
        Object.keys(vals).forEach(yr => {
          const rawVal = vals[yr];
          goalValuesToSave.push({
            companyBlueprintGoalId: obj.companyBlueprintGoalId,
            year: Number(yr),
            value: rawVal === "" || rawVal === null || rawVal === undefined ? null : (isNaN(Number(rawVal)) ? null : Number(rawVal))
          });
        });
      });
    }

    // Compile existing Subjectives values to save
    existingSubjectives.forEach(sub => {
      const vals = sub.values || {};
      Object.keys(vals).forEach(yr => {
        const rawVal = vals[yr];
        goalValuesToSave.push({
          companyBlueprintGoalId: sub.id,
          year: Number(yr),
          value: rawVal === "" || rawVal === null || rawVal === undefined ? null : (isNaN(Number(rawVal)) ? null : Number(rawVal))
        });
      });
    });

    // Compile new Subjectives to create
    const newSubjectives = subjectives
      .filter(s => s.id.startsWith("temp-"))
      .map(sub => {
        const vals = sub.values || {};
        const goalValues = Object.keys(vals)
          .filter(yr => vals[yr] !== "")
          .map(yr => ({
            year: Number(yr),
            value: Number(vals[yr]) || 0
          }));
        return {
          title: sub.key,
          unit: sub.unit || "",
          description: sub.unit || "",
          goalValues
        };
      });

    const payload = {
      companyId,
      coreValueIdsToCreate,
      coreValueIdsToDelete,
      whyWeExist: whyChooseUs,
      differentiation: whyConvenient,
      goalUpdatesToSave,
      goalValuesToSave,
      newSubjectives,
      deletedSubjectiveIds,
      deletedGoalValueIds
    };

    saveBlueprintMutation.mutate(payload);
  };

  // User permissions evaluation for BLUEPRINT key
  const userPermissions = useSelector(getUserPermission);
  const blueprintPerm = (userPermissions as any)?.BLUEPRINT;

  const hasBlueprintPermission = (() => {
    if (!userPermissions) return true;
    if ((userPermissions as any)?.BLUEPRINT === undefined) return true;
    if (typeof blueprintPerm === "boolean") return blueprintPerm;
    if (typeof blueprintPerm === "object") {
      return Boolean(blueprintPerm?.View ?? blueprintPerm?.view ?? true);
    }
    return true;
  })();

  const isLoading = isBlueprintLoading || isCoreValuesLoading;

  if (!hasBlueprintPermission) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-3">
        <ShieldAlert className="h-12 w-12 text-red-500" />
        <h3 className="text-lg font-bold text-gray-800">Access Denied</h3>
        <p className="text-sm text-gray-500">You do not have permission to access the Blueprint page.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-gray-500">Loading Blueprint Settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full px-4 sm:px-6 py-6 space-y-6 pb-20 select-none">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-primary rounded-xl">
            <LayoutTemplate className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Blueprint</h1>
          </div>
        </div>
        <Button 
          className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 flex items-center gap-2 rounded-xl h-10 shrink-0 font-medium transition-all shadow hover:shadow-md duration-300"
          onClick={handleSave}
          disabled={saveBlueprintMutation.isPending}
        >
          {saveBlueprintMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Blueprint
        </Button>
      </div>

      {/* SECTION 1: Core Values */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Core Values</h2>
          
          {/* Floating Popover attached directly to + Add Core Value Button */}
          <div ref={coreValuePopoverRef} className="relative inline-block">
            <Button 
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCoreValuesSelect(prev => !prev)}
              className="flex items-center gap-1.5 text-xs text-primary border-primary/20 hover:bg-indigo-50/50 rounded-xl"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Core Value
            </Button>

            {showCoreValuesSelect && (
              <div className="absolute right-0 top-full mt-2 w-[320px] z-50 bg-white p-3 rounded-2xl border border-gray-200 shadow-xl animate-in fade-in zoom-in-95 duration-150 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-xs font-semibold text-slate-800">Select Core Values</span>
                  <button 
                    type="button"
                    onClick={() => setShowCoreValuesSelect(false)}
                    className="text-gray-400 hover:text-gray-600 text-xs font-medium p-1 rounded-full hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Direct Search Input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Search..."
                    value={coreValueSearchTerm}
                    onChange={(e) => setCoreValueSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-slate-50/50 focus:bg-white text-slate-800 font-medium"
                    autoFocus
                  />
                </div>

                {/* Direct Checkbox Options List */}
                <div className="max-h-[220px] overflow-y-auto space-y-1 pt-1 pr-1 custom-scrollbar">
                  {coreValuesMasterList.filter((cv: any) => {
                    const label = cv.coreValue || cv.codeValue || "";
                    return label.toLowerCase().includes(coreValueSearchTerm.toLowerCase());
                  }).length === 0 ? (
                    <p className="text-xs text-gray-400 italic text-center py-4">No core values found.</p>
                  ) : (
                    coreValuesMasterList
                      .filter((cv: any) => {
                        const label = cv.coreValue || cv.codeValue || "";
                        return label.toLowerCase().includes(coreValueSearchTerm.toLowerCase());
                      })
                      .map((cv: any) => {
                        const id = cv.CodeValueId || cv.blueprintCoreValueId || "";
                        const label = cv.coreValue || cv.codeValue || "";
                        const isSelected = selectedCoreValues.some(item => item.CodeValueId === id);

                        return (
                          <div 
                            key={id}
                            onClick={() => handleToggleCoreValue(id)}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-indigo-50/50 cursor-pointer text-xs transition-colors group select-none"
                          >
                            <div className="flex items-center gap-2.5">
                              <input 
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}} // handled by parent div onClick
                                className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300 pointer-events-none"
                              />
                              <span className="text-sm text-slate-700 group-hover:text-primary transition-colors">{label}</span>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table Format Display List */}
        <div className="space-y-2 pt-1">
          {selectedCoreValues.length === 0 ? (
            <div className="border border-dashed border-gray-200 rounded-xl py-6 px-4 text-center">
              <p className="text-sm text-gray-400 italic">No core values selected. Click "+ Add Core Value" button above to select values.</p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl overflow-hidden w-full shadow-xs">
              <table className="w-full border-collapse text-sm bg-white table-fixed">
                <thead className="bg-slate-100 border-b border-gray-200">
                  <tr>
                    <th className="p-3 text-left font-semibold text-gray-700 h-[40px] w-[200px]">Core Value</th>
                    <th className="p-3 text-left font-semibold text-gray-700 h-[40px]">Action Statement / Definition</th>
                    <th className="p-3 text-center font-semibold text-gray-700 h-[40px] w-[60px]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCoreValues.map((cv) => (
                    <tr 
                      key={cv.CodeValueId}
                      className="border-b border-gray-200 hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="p-3 text-left font-semibold text-slate-800 align-top">
                        {cv.coreValue}
                      </td>
                      <td className="p-3 text-left text-gray-700 leading-relaxed font-normal align-top">
                        {cv.actionStatement || "-"}
                      </td>
                      <td className="p-3 text-center align-top w-[60px]">
                        <button
                          type="button"
                          onClick={() => handleRemoveCoreValue(cv.CodeValueId)}
                          className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors"
                          title="Remove core value"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: Mission */}
      <div className="space-y-4 pt-6 border-t border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Mission</h2>
        
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1 */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 block">Why Choose Us?</label>
              <textarea 
                rows={4}
                className="w-full border border-gray-200 rounded-xl p-3 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none resize-none text-sm text-gray-800 placeholder:text-gray-400 shadow-sm bg-white min-h-[120px]" 
                placeholder="Explain why customers choose your products or services..." 
                value={whyChooseUs} 
                onChange={(e) => setWhyChooseUs(e.target.value)}
              />
            </div>

            {/* Column 2 */}
            <div className="space-y-1.5 flex flex-col">
              <label className="text-sm font-semibold text-gray-700 block">Our Differentiators</label>
              <textarea 
                rows={4}
                className="w-full flex-1 border border-gray-200 rounded-xl p-3 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none resize-none text-sm text-gray-800 placeholder:text-gray-400 shadow-sm bg-white min-h-[120px]" 
                placeholder="Explain what differentiates you in the market..." 
                value={whyConvenient} 
                onChange={(e) => setWhyConvenient(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Goal Values */}
      <div className="space-y-6 pt-6 border-t border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Goal Values</h2>

        {/* Objectives */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-800">Objectives</h3>
            <Button 
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddObjectiveYear}
              className="flex items-center gap-1.5 text-xs text-primary border-primary/20 hover:bg-indigo-50/50 rounded-xl"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Year Column
            </Button>
          </div>
          {!blueprintRes?.objectives || blueprintRes.objectives.length === 0 ? (
            <div className="border border-dashed border-gray-200 rounded-2xl py-8 px-4 text-center">
              <ShieldAlert className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No objectives loaded for this company.</p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm flex w-full bg-white">
              {/* Left Fixed Panel: Key & Unit */}
              <div className="w-[400px] shrink-0 min-w-[400px] border-r border-gray-200 bg-white">
                <table className="w-full border-collapse text-sm bg-white table-fixed">
                  <thead className="bg-primary">
                    <tr className="h-[45px]">
                      <th className="p-3 text-left font-semibold text-white w-[300px]">Key</th>
                      <th className="p-3 text-center font-semibold text-white w-[100px] border-l border-white/20">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blueprintRes.objectives.map((obj) => {
                      const title = obj.BlueprintGoalObjective?.title || obj.objectiveTitle || obj.title || "";
                      return (
                        <tr 
                          key={obj.companyBlueprintGoalId}
                          className="border-b border-gray-200 hover:bg-slate-50/80 transition-colors h-[58px]"
                        >
                          <td className="p-3 text-left font-semibold text-slate-800 truncate w-[300px]">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="truncate block cursor-default">{title}</span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs bg-slate-900 text-white text-xs px-3 py-1.5 rounded-md shadow-md z-50">
                                  {title}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </td>
                          <td className="p-2 text-center w-[100px] border-l border-gray-100">
                            <input 
                              type="text" 
                              className="w-full h-[36px] text-center border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none rounded-md text-xs font-semibold text-gray-700 bg-slate-50/50 focus:bg-white transition-all shadow-sm mx-auto block" 
                              placeholder="$ / %" 
                              value={objectiveUnits[obj.companyBlueprintGoalId] || ""} 
                              onChange={(e) => handleObjectiveUnitChange(obj.companyBlueprintGoalId, e.target.value)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Right Scrollable Panel: Year Columns */}
              <div className="flex-1 min-w-0 overflow-x-auto bg-white pb-1">
                <table className="border-collapse text-sm bg-white table-fixed w-full min-w-max">
                  <thead className="bg-primary">
                    <tr className="h-[45px]">
                      {objectiveYears.map(yr => (
                        <th key={yr} className="p-3 text-center font-semibold text-white h-[45px] relative group w-[110px] min-w-[110px] max-w-[110px]">
                          <div className="flex items-center justify-center gap-1.5">
                            <span>{getObjectiveYearLabel(yr)}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveObjectiveYear(yr)}
                              className="text-white/60 hover:text-white rounded-full p-0.5 hover:bg-white/10 transition-colors"
                              title="Delete year column"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </th>
                      ))}
                      <th className="p-0 bg-primary h-[45px] w-auto"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {blueprintRes.objectives.map((obj) => (
                      <tr 
                        key={obj.companyBlueprintGoalId}
                        className="border-b border-gray-200 hover:bg-slate-50/80 transition-colors h-[58px] bg-white"
                      >
                        {objectiveYears.map(yr => {
                          const rawObjVal = objectiveValues[obj.companyBlueprintGoalId]?.[yr];
                          const displayObjVal = rawObjVal === "null" || rawObjVal === null || rawObjVal === undefined ? "" : rawObjVal;
                          return (
                            <td key={yr} className="p-2 text-center w-[110px] min-w-[110px] max-w-[110px]">
                              <input 
                                type="text"
                                className="w-[80px] h-[40px] text-center border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none rounded-md text-sm font-semibold text-gray-800 bg-white transition-all shadow-sm mx-auto block"
                                placeholder="-"
                                value={displayObjVal}
                                onChange={(e) => handleObjectiveValueChange(obj.companyBlueprintGoalId, yr, e.target.value)}
                              />
                            </td>
                          );
                        })}
                        <td className="p-0 border-b border-gray-200 bg-white w-auto"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Subjectives */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h3 className="text-base font-semibold text-gray-800">Subjectives</h3>
              <Button 
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSubjective}
                className="flex items-center gap-1.5 text-xs text-primary border-primary/20 hover:bg-indigo-50/50 rounded-xl"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Row
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
             
              <Button 
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSubjectiveYear}
                className="flex items-center gap-1.5 text-xs text-primary border-primary/20 hover:bg-indigo-50/50 rounded-xl"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Year Column
              </Button>
            </div>
          </div>
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm flex w-full bg-white">
            {/* Left Fixed Panel: Key & Unit */}
            <div className="w-[400px] shrink-0 min-w-[400px] border-r border-gray-200 bg-white">
              <table className="w-full border-collapse text-sm bg-white table-fixed">
                <thead className="bg-primary">
                  <tr className="h-[45px]">
                    <th className="p-3 text-left font-semibold text-white w-[300px]">Key</th>
                    <th className="p-3 text-center font-semibold text-white w-[100px] border-l border-white/20">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectives.length === 0 ? (
                    <tr className="h-[58px]">
                      <td colSpan={2} className="p-3 text-center text-gray-400 italic text-xs">
                        No subjectives
                      </td>
                    </tr>
                  ) : (
                    subjectives.map((row) => (
                      <tr 
                        key={row.id}
                        className="border-b border-gray-200 hover:bg-slate-50/80 transition-colors h-[58px]"
                      >
                        <td className="p-2 text-left w-[300px]">
                          <input 
                            type="text"
                            className="w-full h-[36px] px-2.5 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none rounded-md text-xs font-semibold text-gray-800 bg-white transition-all shadow-sm block"
                            placeholder="Enter Key..."
                            value={row.key}
                            onChange={(e) => handleUpdateSubjectiveKey(row.id!, e.target.value)}
                          />
                        </td>
                        <td className="p-2 text-center w-[100px] border-l border-gray-100">
                          <input 
                            type="text" 
                            className="w-full h-[36px] text-center border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none rounded-md text-xs font-semibold text-gray-700 bg-slate-50/50 focus:bg-white transition-all shadow-sm mx-auto block" 
                            placeholder="$ / %" 
                            value={row.unit || ""} 
                            onChange={(e) => handleUpdateSubjectiveUnit(row.id!, e.target.value)}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Right Scrollable Panel: Year Columns & Action */}
            <div className="flex-1 min-w-0 overflow-x-auto bg-white pb-1">
              <table className="border-collapse text-sm bg-white table-fixed w-full min-w-max">
                <thead className="bg-primary">
                  <tr className="h-[45px]">
                    {subjectiveYears.map(yr => (
                      <th key={yr} className="p-3 text-center font-semibold text-white h-[45px] relative group w-[110px] min-w-[110px] max-w-[110px]">
                        <div className="flex items-center justify-center gap-1.5">
                          <span>{getSubjectiveYearLabel(yr)}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubjectiveYear(yr)}
                            className="text-white/60 hover:text-white rounded-full p-0.5 hover:bg-white/10 transition-colors"
                            title="Delete year column"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </th>
                    ))}
                    <th className="p-3 text-center font-semibold text-white w-[70px] min-w-[70px] max-w-[70px] h-[45px]">Action</th>
                    <th className="p-0 bg-primary h-[45px] w-auto"></th>
                  </tr>
                </thead>
                <tbody>
                  {subjectives.length === 0 ? (
                    <tr className="h-[58px]">
                      <td colSpan={subjectiveYears.length + 2} className="p-6 text-center text-gray-400 italic text-xs">
                        Click "+ Add Row" above to define subjectives.
                      </td>
                    </tr>
                  ) : (
                    subjectives.map((row) => (
                      <tr 
                        key={row.id}
                        className="border-b border-gray-200 hover:bg-slate-50/50 transition-colors h-[58px]"
                      >
                        {subjectiveYears.map(yr => {
                          const rawSubVal = row.values?.[yr];
                          const displaySubVal = rawSubVal === "null" || rawSubVal === null || rawSubVal === undefined ? "" : rawSubVal;
                          return (
                            <td key={yr} className="p-2 text-center w-[110px] min-w-[110px] max-w-[110px]">
                              <input 
                                type="text" 
                                className="w-[80px] h-[40px] text-center border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none rounded-md text-sm font-semibold text-gray-800 bg-white transition-all shadow-sm mx-auto block"
                                placeholder="-"
                                value={displaySubVal}
                                onChange={(e) => handleSubjectiveValueChange(row.id!, yr, e.target.value)}
                              />
                            </td>
                          );
                        })}
                        <td className="p-2 text-center w-[70px] min-w-[70px] max-w-[70px]">
                          <button 
                            onClick={() => handleRemoveSubjective(row.id!)}
                            className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </td>
                        <td className="p-0 border-b border-gray-200 bg-white w-auto"></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
