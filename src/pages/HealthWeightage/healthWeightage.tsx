import { FormProvider, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import ScoreDataTable from "@/components/shared/DataTable/HealthScore/ScoreDataTable";
import FormSelect from "@/components/shared/Form/FormSelect";
import useHealthWeightage from "./useHealthWeightage";

export default function HealthWeightage() {
  const {
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
  } = useHealthWeightage();

  const { control } = formMethods;

  const isCoreSelected = !!coreParameterId;

  return (
    <FormProvider {...formMethods}>
      <div className="w-full px-2 overflow-x-auto sm:px-4 py-4">
        <div className="flex mb-5 justify-between items-center">
          <h1 className="font-semibold capitalize text-xl text-black">
            Health Weightage
          </h1>
          <div className="flex items-center space-x-5 tb:space-x-7">
            {(permission.Add || permission.Edit) && (
              <Button className="py-2 w-fit" onClick={handleEditToggle}>
                {isEditing ? "Submit" : "Edit"}
              </Button>
            )}

            {isEditing && (
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
                    value: param.coreParameterId, // 👈 corrected value for fetch
                  })) ?? []
                }
                placeholder="Select Core Parameter"
              />
            )}
          />
        </div>

        {/* Score Table or No Data */}
        {isCoreSelected ? (
          healthScoreList?.length == 0 ? (
            <div className="text-center text-muted-foreground mt-8">
              No data found
            </div>
          ) : (
            <ScoreDataTable
              data={scores}
              onChange={setScores}
              disabled={!isEditing}
              mode="number"
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
