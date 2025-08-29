import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Service, waitlistService } from "@/services/waitlist.service";

interface DeleteServiceDialogProps {
  service: Service;
  onDeleted: () => void;
  trigger?: React.ReactNode;
}

export function DeleteServiceDialog({ service, onDeleted, trigger }: DeleteServiceDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (confirmText !== service.name) {
      toast({
        title: "Confirmation required",
        description: `Please type "${service.name}" exactly to confirm service deletion.`,
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    
    try {
      await waitlistService.deleteService(service.id);
      toast({
        title: "Service deleted",
        description: `${service.name} has been permanently deleted.`,
      });
      setIsOpen(false);
      setConfirmText("");
      onDeleted();
    } catch (error) {
      toast({
        title: "Deletion failed",
        description: error instanceof Error ? error.message : "Failed to delete service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const defaultTrigger = (
    <Button variant="destructive" size="sm">
      <Trash2 className="h-4 w-4 mr-2" />
      Delete
    </Button>
  );

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {trigger || defaultTrigger}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">
            Delete Service
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete "{service.name}" 
            and remove all associated data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="confirm-delete" className="text-sm font-medium">
              Type <strong>{service.name}</strong> to confirm:
            </Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={service.name}
              className="font-mono"
            />
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">This will delete:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>All {service.participantCount} participant emails</li>
              <li>Service configuration and settings</li>
              <li>Waitlist URL and public page</li>
              <li>All associated analytics data</li>
            </ul>
            <p className="mt-3 text-xs">
              <strong>Created:</strong> {new Date(service.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={() => {
              setConfirmText("");
              setIsOpen(false);
            }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={confirmText !== service.name || isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete Service"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}