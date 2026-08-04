import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import ModalData from "@/components/shared/Modal/ModalData/ModalData";
import FormInputField from "@/components/shared/Form/FormInput/FormInputField";
import {
  useCreateGanttPhase,
  useUpdateGanttPhase,
  useDeleteGanttPhase,
} from "@/features/api/gantt";
import type { CompanyGanttPhase } from "@/types/gantt";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  workspaceId: string;
  phases: CompanyGanttPhase[];
  editPhase?: CompanyGanttPhase | null;
}

interface PhaseFormValues {
  phaseName: string;
  phaseDescription?: string;
  color: string;
}

export default function GanttPhaseManageModal({
  open,
  onOpenChange,
  workspaceId,
  phases,
  editPhase,
}: Props) {
  const isEdit = !!editPhase;

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isBothDelete, setIsBothDelete] = useState(false);

  const createMutation = useCreateGanttPhase(workspaceId);
  const updateMutation = useUpdateGanttPhase(workspaceId);
  const deleteMutation = useDeleteGanttPhase(workspaceId);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<PhaseFormValues>({
    defaultValues: {
      phaseName: "",
      phaseDescription: "",
      color: "#3b82f6",
    },
  });

  // Sync state when open or editPhase changes
  useEffect(() => {
    if (editPhase) {
      reset({
        phaseName: editPhase.phaseName,
        phaseDescription: editPhase.phaseDescription ?? "",
        color: editPhase.color ?? "#3b82f6",
      });
    } else {
      reset({
        phaseName: "",
        phaseDescription: "",
        color: "#3b82f6",
      });
    }
  }, [editPhase, open, reset]);

  const handleSave = async (values: PhaseFormValues) => {
    try {
      if (!isEdit) {
        const nextOrder = phases.length > 0 ? Math.max(...phases.map((p) => p.phaseOrder)) + 1 : 0;
        await createMutation.mutateAsync({
          ganttWorkspaceId: workspaceId,
          phaseName: values.phaseName,
          phaseDescription: values.phaseDescription || undefined,
          phaseOrder: nextOrder,
          color: values.color,
        });
      } else if (isEdit && editPhase) {
        await updateMutation.mutateAsync({
          phaseId: editPhase.ganttPhaseId,
          payload: {
            phaseName: values.phaseName,
            phaseDescription: values.phaseDescription || undefined,
            color: values.color,
          },
        });
      }
      onOpenChange(false);
    } catch {
      // handled by mutation
    }
  };

  const handleDelete = () => {
    setIsBothDelete(false);
    setConfirmDeleteOpen(true);
  };

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  // Construct footer buttons
  const modalButtons = [
    { 
      btnText: "Cancel",
      buttonCss: `py-1.5 px-5 bg-white border border-slate-200 text-black font-semibold hover:bg-slate-50 rounded-lg transition-colors${
        isPending ? " opacity-50 cursor-not-allowed" : ""
      }`,
      btnClick: () => {
        if (!isPending) onOpenChange(false);
      },
    },
  ];

  // If editing, add a Delete button in the footer/buttons array
  if (isEdit) {
    modalButtons.push({
      btnText: deleteMutation.isPending ? "Deleting..." : "Delete",
      buttonCss: `py-1.5 px-5 bg-red-600 border border-red-600 text-white font-semibold hover:bg-red-700 rounded-lg transition-colors mr-auto${
        isPending ? " opacity-50 cursor-not-allowed" : ""
      }`,
      btnClick: () => {
        if (!isPending) handleDelete();
      },
    });
  }

  modalButtons.push({
    btnText: isPending ? "Saving..." : isEdit ? "Update" : "Save",
    buttonCss: isPending ? "opacity-50 cursor-not-allowed" : "",
    btnClick: () => {
      if (!isPending) {
        handleSubmit(handleSave)();
      }
    },
  });

  return (
    <>
      <ModalData
      isModalOpen={open}
      modalTitle={isEdit ? "Edit Phase" : "Add Phase"}
      modalClose={() => onOpenChange(false)}
      containerClass="max-w-md"
      buttons={modalButtons}
    >
      <form onSubmit={handleSubmit(handleSave)} className="space-y-4 pt-2">
        <FormInputField
          label="Phase Name"
          placeholder="e.g. Planning & Design"
          isMandatory
          {...register("phaseName", { required: "Phase Name is required" })}
          error={errors.phaseName}
        />

        <FormInputField
          label="Description"
          placeholder="Optional description"
          {...register("phaseDescription")}
          error={errors.phaseDescription}
        />

        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <label className="text-[14px] font-semibold text-slate-700 uppercase tracking-wider block">
                Phase Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="w-10 h-10 p-0 border border-slate-300 rounded-lg cursor-pointer overflow-hidden [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none"
                />
                <span className="text-sm font-mono uppercase text-slate-600">
                  {field.value}
                </span>
              </div>
            </div>
          )}
        />
      </form>
    </ModalData>

      {/* Delete confirm modal */}
      {confirmDeleteOpen && editPhase && (
        <ModalData
          isModalOpen={confirmDeleteOpen}
          modalTitle="Delete Phase"
          modalClose={() => setConfirmDeleteOpen(false)}
          buttons={[
            {
              btnText: "Cancel",
              buttonCss: "py-2 px-6 bg-white border border-slate-200 text-slate-800 font-bold hover:bg-slate-50 rounded-xl transition-all text-sm shadow-sm",
              btnClick: () => setConfirmDeleteOpen(false),
            },
            {
              btnText: deleteMutation.isPending ? "Deleting..." : "Delete Phase",
              buttonCss: "py-2 px-6 bg-red-600 text-white hover:bg-red-700 border border-red-600 font-bold rounded-xl transition-all text-sm shadow-sm",
              btnClick: async () => {
                try {
                  await deleteMutation.mutateAsync({
                    phaseId: editPhase.ganttPhaseId,
                    isBothDelete,
                  });
                  setConfirmDeleteOpen(false);
                  onOpenChange(false);
                } catch {
                  // handled
                }
              },
            },
          ]}
        >
          <div className="space-y-5 pt-2">
            <p className="text-base text-slate-700 leading-relaxed">
              Are you sure you want to delete the phase <strong className="text-slate-900 font-bold">&quot;{editPhase.phaseName}&quot;</strong>? This action is permanent and cannot be undone.
            </p>

            <div className="flex items-start gap-3 p-4 bg-red-50/20 border border-red-100/60 rounded-xl transition-all hover:bg-red-50/40">
              <input
                type="checkbox"
                id="isBothDelete"
                checked={isBothDelete}
                onChange={(e) => setIsBothDelete(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-red-300 text-red-600 focus:ring-red-500 cursor-pointer accent-red-600 shrink-0"
              />
              <div className="grid gap-1.5 leading-tight">
                <label
                  htmlFor="isBothDelete"
                  className="text-sm font-bold text-red-950 cursor-pointer select-none"
                >
                  Delete all tasks associated with this phase
                </label>
                <p className="text-xs text-red-700/80">
                  Checking this will also permanently delete all tasks mapped to this phase. If unchecked, the tasks will remain in the workspace as unassigned items.
                </p>
              </div>
            </div>
          </div>
        </ModalData>
      )}
    </>
  );
}
