import React, { useState } from "react";
import { useStatus } from "@/contexts/StatusContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash, ChevronUp, ChevronDown } from "lucide-react";
import { ClientStatusConfig } from "@/types/Client";
import { supabase } from "@/services/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ClientStatusSettings() {
  const { clientStatuses, refreshStatuses } = useStatus();
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<ClientStatusConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Open dialog to add new status
  const openAddStatusDialog = () => {
    setCurrentStatus({
      id: "",
      name: "",
      color: "#0D8A6C",
      description: "",
      order_index: clientStatuses.length + 1,
      is_default: false
    });
    setIsEditing(false);
    setIsStatusDialogOpen(true);
  };

  // Open dialog to edit status
  const openEditStatusDialog = (status: ClientStatusConfig) => {
    setCurrentStatus({ ...status });
    setIsEditing(true);
    setIsStatusDialogOpen(true);
  };

  // Handle status form input change
  const handleStatusChange = (field: string, value: string | boolean) => {
    if (currentStatus) {
      setCurrentStatus({
        ...currentStatus,
        [field]: value
      });
    }
  };

  // Save status (create or update)
  const saveStatus = async () => {
    if (!currentStatus?.name) {
      toast.error("Name is required");
      return;
    }

    try {
      if (isEditing) {
        // Update existing status
        const { error } = await supabase
          .from('client_statuses')
          .update({
            name: currentStatus.name,
            color: currentStatus.color,
            description: currentStatus.description,
            order_index: currentStatus.order_index,
            is_default: currentStatus.is_default,
            updated_at: new Date()
          })
          .eq('id', currentStatus.id);

        if (error) throw error;
      } else {
        // Create new status
        const { error } = await supabase
          .from('client_statuses')
          .insert({
            name: currentStatus.name,
            color: currentStatus.color,
            description: currentStatus.description,
            order_index: currentStatus.order_index,
            is_default: currentStatus.is_default
          });

        if (error) throw error;
      }

      setIsStatusDialogOpen(false);
      refreshStatuses();
      toast.success(`Client status ${isEditing ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error("Error saving client status:", error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} client status`);
    }
  };

  // Open dialog to confirm delete
  const openDeleteStatusDialog = (status: ClientStatusConfig) => {
    setCurrentStatus(status);
    setIsDeleteDialogOpen(true);
  };

  // Delete status
  const deleteStatus = async () => {
    if (!currentStatus) return;

    try {
      // First check if any clients are using this status
      const { data: clientsUsingStatus, error: checkError } = await supabase
        .from('clients')
        .select('id')
        .eq('status_id', currentStatus.id)
        .limit(1);

      if (checkError) throw checkError;

      if (clientsUsingStatus && clientsUsingStatus.length > 0) {
        toast.error("Cannot delete status that is being used by clients");
        setIsDeleteDialogOpen(false);
        return;
      }

      // If no clients are using this status, proceed with deletion
      const { error } = await supabase
        .from('client_statuses')
        .delete()
        .eq('id', currentStatus.id);

      if (error) throw error;

      setIsDeleteDialogOpen(false);
      refreshStatuses();
      toast.success("Client status deleted successfully");
    } catch (error) {
      console.error("Error deleting client status:", error);
      toast.error("Failed to delete client status");
    }
  };

  // Move status up in order
  const moveStatusUp = async (index: number) => {
    if (index === 0) return; // Already at the top

    try {
      const newOrderIndex = clientStatuses[index].order_index - 1;
      const prevStatus = clientStatuses[index - 1];

      // Update current status
      await supabase
        .from('client_statuses')
        .update({ order_index: newOrderIndex })
        .eq('id', clientStatuses[index].id);

      // Update previous status
      await supabase
        .from('client_statuses')
        .update({ order_index: clientStatuses[index].order_index })
        .eq('id', prevStatus.id);

      refreshStatuses();
    } catch (error) {
      console.error("Error reordering statuses:", error);
      toast.error("Failed to reorder statuses");
    }
  };

  // Move status down in order
  const moveStatusDown = async (index: number) => {
    if (index === clientStatuses.length - 1) return; // Already at the bottom

    try {
      const newOrderIndex = clientStatuses[index].order_index + 1;
      const nextStatus = clientStatuses[index + 1];

      // Update current status
      await supabase
        .from('client_statuses')
        .update({ order_index: newOrderIndex })
        .eq('id', clientStatuses[index].id);

      // Update next status
      await supabase
        .from('client_statuses')
        .update({ order_index: clientStatuses[index].order_index })
        .eq('id', nextStatus.id);

      refreshStatuses();
    } catch (error) {
      console.error("Error reordering statuses:", error);
      toast.error("Failed to reorder statuses");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Client Statuses</CardTitle>
          <CardDescription>
            Configure the statuses in your client pipeline
          </CardDescription>
        </div>
        <Button onClick={openAddStatusDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Status
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {clientStatuses.map((status, index) => (
            <div
              key={status.id}
              className="flex items-center justify-between p-4 border rounded-lg bg-background"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: status.color }}
                />
                <span className="font-medium">{status.name}</span>
                {status.is_default && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-1 rounded">
                    Default
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => moveStatusUp(index)}
                  disabled={index === 0}
                >
                  <ChevronUp className="h-4 w-4" />
                  <span className="sr-only">Move up</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => moveStatusDown(index)}
                  disabled={index === clientStatuses.length - 1}
                >
                  <ChevronDown className="h-4 w-4" />
                  <span className="sr-only">Move down</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => openEditStatusDialog(status)}
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => openDeleteStatusDialog(status)}
                >
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Status Edit/Add Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit" : "Add"} Client Status
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the details of this client status."
                : "Add a new status to your client pipeline."}
            </DialogDescription>
          </DialogHeader>
          {currentStatus && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={currentStatus.name}
                  onChange={(e) => handleStatusChange("name", e.target.value)}
                  placeholder="e.g., New, Active, Inactive"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={currentStatus.color}
                    onChange={(e) => handleStatusChange("color", e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <span>{currentStatus.color}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={currentStatus.description || ""}
                  onChange={(e) =>
                    handleStatusChange("description", e.target.value)
                  }
                  placeholder="Describe what this status means"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is-default"
                  checked={currentStatus.is_default}
                  onCheckedChange={(checked) =>
                    handleStatusChange("is_default", checked)
                  }
                />
                <Label htmlFor="is-default">Set as default status</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveStatus}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this status? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteStatus}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
} 