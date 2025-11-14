import { FormProvider, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import ScoreDataTable from "@/components/shared/DataTable/HealthScore/ScoreDataTable";
import useHealthWeightage from "./useHealthWeightage";
import useUpdateHealthWeightage from "@/features/api/Business/useUpdateHealthWeightage";
import { useBreadcrumbs } from "@/features/context/BreadcrumbContext";
import { useEffect } from "react";
import PageNotAccess from "../PageNoAccess";
import SearchDropdown from "@/components/shared/Form/SearchDropdown";

export default function HealthWeightage() {
  const {
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
  } = useHealthWeightage();

  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "Health Weightage", href: "" }]);
  }, [setBreadcrumbs]);

  const { mutate: updateHealthWeightage } = useUpdateHealthWeightage();

  const { control, reset, setValue } = formMethods;

  const isCoreSelected = !!coreParameterId;
  const islevelSelected = !!level;

  const handleEditToggleWithLog = () => {
    if (isEditable) {
      // Build subParameterIds for all scores
      const subParameterIds = scores.map((item) => ({
        subParameterId: item.subParameterId,
        companyHealthScore: item.score,
      }));

      // removedSubParameterIds: all subParameterIds where isDisabled is true
      const removedIds = scores
        .filter((item) => item.isDisabled === true)
        .map((item) => item.subParameterId);

      const dataToSend = {
        coreParameterId,
        subParameterIds,
        removedSubParameterIds:
          removedIds.length === 0 ? "" : removedIds.join(","),
        levelId: level,
      };

      updateHealthWeightage(dataToSend, {
        onSuccess: () => {
          reset();
          onEdit();
          reset({
            coreParameterId: "",
            level: "",
          });
        },
      });
    } else {
      onEdit();
    }
  };
  if (!permission || permission.View === false) {
    return <PageNotAccess />;
  }

  return (
    <FormProvider {...formMethods}>
      <div className="w-full px-2 overflow-x-auto sm:px-4 py-6">
        <div className="flex mb-5 justify-between items-center">
          <h1 className="font-semibold capitalize text-xl text-black">
            Health Weightage
          </h1>
          <div className="flex items-center space-x-5 tb:space-x-7">
            {(permission.Add || permission.Edit) &&
              isCoreSelected &&
              islevelSelected && (
                <Button
                  className="py-2 w-fit"
                  onClick={handleEditToggleWithLog}
                >
                  {isEditable ? "Submit" : "Edit"}
                </Button>
              )}

            {isEditable && (
              <Button
                variant="outline"
                className="py-2 w-fit"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-10">
          <div className="mb-4 w-[19%]">
            {/* <Controller
              control={control}
              name="coreParameterId"
              render={({ field }) => (
                <FormSelect
                  {...field}
                  label="Business Function"
                  options={
                    coreParams?.data.map((param) => ({
                      label: param.coreParameterName,
                      value: param.coreParameterId,
                    })) ?? []
                  }
                  placeholder="Select Business Function"
                />
              )}
            /> */}
            <Controller
              name="coreParameterId"
              control={control}
              rules={{ required: "Business Function is required" }}
              render={({ field, fieldState }) => (
                <SearchDropdown
                  {...field}
                  label="Business Function"
                  options={
                    coreParams?.data.map((param) => ({
                      label: param.coreParameterName,
                      value: param.coreParameterId,
                    })) ?? []
                  }
                  error={fieldState.error}
                  isMandatory
                  placeholder="Select Business Function..."
                  selectedValues={field.value ? [field.value] : []} // Ensure it's an array
                  onSelect={(value) => {
                    field.onChange(value.value);
                    setValue("coreParameterId", value.value);
                  }}
                  onSearchChange={setIsCoreParaSearch}
                />
              )}
            />
          </div>

          {isCoreSelected && (
            <div className="w-[10%] mb-4">
              {/* <Controller
                control={control}
                name="level"
                render={({ field }) => (
                  <FormSelect
                    {...field}
                    label="Level"
                    options={
                      companyLevel?.data?.map((level: CompanyLevelRes) => ({
                        label: level.levelName,
                        value: level.levelId,
                      })) ?? []
                    }
                    placeholder="Select Level"
                  />
                )}
              /> */}
              <Controller
                name="level"
                control={control}
                rules={{ required: "Level is required" }}
                render={({ field, fieldState }) => (
                  <SearchDropdown
                    {...field}
                    label="Level"
                    options={
                      companyLevel?.data?.map((level: CompanyLevelRes) => ({
                        label: level.levelName,
                        value: level.levelId,
                      })) ?? []
                    }
                    error={fieldState.error}
                    isMandatory
                    placeholder="Select Level..."
                    selectedValues={field.value ? [field.value] : []} // Ensure it's an array
                    onSelect={(value) => {
                      field.onChange(value.value);
                      setValue("level", value.value);
                    }}
                    onSearchChange={setIsCompanyLevelSearch}
                  />
                )}
              />
            </div>
          )}
        </div>

        {/* Score Table or No Data */}
        {isCoreSelected && level && healthScoreList ? (
          healthScoreList?.length == 0 ? (
            <div className="text-center text-muted-foreground mt-8">
              No data found
            </div>
          ) : (
            <ScoreDataTable
              data={scores}
              onChange={setScores}
              disabled={!isEditable}
              mode="number"
              rowIsDisabled={(row) => !!row.isDisabled}
              onSwitchChange={handleSwitchChange} // <-- pass handler
            />
          )
        ) : (
          <div className="text-center text-muted-foreground mt-8">
            Please select a Business Function to view scores
          </div>
        )}
      </div>
    </FormProvider>
  );
}
