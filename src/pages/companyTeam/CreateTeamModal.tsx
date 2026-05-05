import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { teamName: string }) => void;
  selectedCount: number;
}

export default function CreateTeamModal({
  isOpen,
  onClose,
  onSubmit,
  selectedCount,
}: CreateTeamModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      teamName: "",
    },
  });

  const onFormSubmit = (data: { teamName: string }) => {
    onSubmit(data);
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">
            Create New Team
          </DialogTitle>
          <p className="text-sm text-gray-500">
            You are creating a team with {selectedCount} selected employees.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="teamName" className="text-sm font-medium">
              Team Name
            </Label>
            <Input
              id="teamName"
              placeholder="e.g. Sales Alpha Team"
              {...register("teamName", { required: "Team name is required" })}
              className={errors.teamName ? "border-red-500" : ""}
            />
            {errors.teamName && (
              <p className="text-xs text-red-500 font-medium">
                {errors.teamName.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6"
            >
              Cancel
            </Button>
            <Button type="submit" className="px-6 bg-primary text-white">
              Create Team
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
