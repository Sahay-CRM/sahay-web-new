import { FormProvider, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import ScoreDataTable from "@/components/shared/DataTable/HealthScore/ScoreDataTable";
import FormSelect from "@/components/shared/Form/FormSelect";
import useHealthWeightage from "./useHealthWeightage";
import useUpdateHealthWeightage from "@/features/api/Business/useUpdateHealthWeightage";
import { useNavigate } from "react-router-dom";

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
  } = useHealthWeightage();

  const updateHealthWeightage = useUpdateHealthWeightage();
  const navigate = useNavigate();

  const { control } = formMethods;

  const isCoreSelected = !!coreParameterId;

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
      };

      updateHealthWeightage.mutate(dataToSend, {
        onSuccess: () => {
          navigate("/dashboard/business/health-weightage");
        },
      });
    } else {
      onEdit();
    }
  };

  return (
    <FormProvider {...formMethods}>
      <div className="w-full px-2 overflow-x-auto sm:px-4 py-4">
        <div className="flex mb-5 justify-between items-center">
          <h1 className="font-semibold capitalize text-xl text-black">
            Health Weightage
          </h1>
          <div className="flex items-center space-x-5 tb:space-x-7">
            {(permission.Add || permission.Edit) && (
              <Button className="py-2 w-fit" onClick={handleEditToggleWithLog}>
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
          {/* Core Parameter Select */}
          <div className="max-w-xs mb-4">
            <Controller
              control={control}
              name="coreParameterId"
              render={({ field }) => (
                <FormSelect
                  {...field}
                  label="Core Parameter"
                  options={
                    coreParams?.data.map((param) => ({
                      label: param.coreParameterName,
                      value: param.coreParameterId,
                    })) ?? []
                  }
                  placeholder="Select Core Parameter"
                />
              )}
            />
          </div>

          {isCoreSelected && (
            <div className="max-w-xs mb-4">
              <Controller
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
              />
            </div>
          )}
        </div>

        {/* Score Table or No Data */}
        {isCoreSelected && level ? (
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
            />
          )
        ) : (
          <div className="text-center text-muted-foreground mt-8">
            Please select a core parameter to view scores
          </div>
        )}
      </div>
    </FormProvider>
  );
}
