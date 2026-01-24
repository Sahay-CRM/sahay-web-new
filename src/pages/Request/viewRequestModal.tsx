import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: CreateRequest;
  onEdit: (data: CreateRequest) => void;
}

export default function ViewRequestModal({
  isOpen,
  onClose,
  data,
  onEdit,
}: Props) {
  if (!data) return null;

  const fields = [
    { label: "Request Title", value: data.requestTitle },
    { label: "Request Type", value: data.requestType },
    { label: "Requester Name", value: data.requesterName },
    { label: "Request Notes", value: data.requesterNote },
    { label: "Status", value: data.requestStatus },
    { label: "Reviewer Name", value: data.reviewerName },
    { label: "Reviewer Notes", value: data.reviewerNote },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Request Details</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {fields.map(
            (item) =>
              item.value && (
                <div key={item.label}>
                  <p className="text-muted-foreground">{item.label}</p>
                  <p className="font-medium">{item.value}</p>
                </div>
              ),
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onClose();
              onEdit(data);
            }}
          >
            Edit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
