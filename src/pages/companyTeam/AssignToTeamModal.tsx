import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AssignToTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (teamId: string) => void;
  teams: Team[];
  selectedCount: number;
}

export default function AssignToTeamModal({
  isOpen,
  onClose,
  onSubmit,
  teams,
  selectedCount,
}: AssignToTeamModalProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");

  const handleFormSubmit = () => {
    if (selectedTeamId) {
      onSubmit(selectedTeamId);
      setSelectedTeamId("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">
            Assign to Existing Team
          </DialogTitle>
          <p className="text-sm text-gray-500">
            Select a team to add {selectedCount} employees to.
          </p>
        </DialogHeader>
        <div className="space-y-6 pt-4 w-full">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Select Team</Label>
            <Select onValueChange={setSelectedTeamId} value={selectedTeamId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a team..." />
              </SelectTrigger>
              <SelectContent>
                {teams?.map((team) => (
                  <SelectItem key={team.teamId!} value={team.teamId!}>
                    {team.teamName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} className="px-6">
              Cancel
            </Button>
            <Button
              onClick={handleFormSubmit}
              disabled={!selectedTeamId}
              className="px-6 bg-primary text-white"
            >
              Assign to Team
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
