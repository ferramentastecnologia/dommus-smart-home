import React, { useState } from "react";
import { useLeadSources } from "@/hooks/useLeadSources";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronUp, ChevronDown, Pencil, Trash2, Plus } from "lucide-react";
import { supabase } from "@/services/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export function LeadSourcesSettings() {
  const { leadSources, isLoading, error, refetch } = useLeadSources();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<any>(null);
  const [newSource, setNewSource] = useState({
    name: "",
    description: "",
    color: "#22c55e",
  });

  const handleAddSource = async () => {
    try {
      if (!newSource.name.trim()) {
        toast.error("Source name is required");
        return;
      }

      const { data, error } = await supabase
        .from("lead_sources")
        .insert({
          name: newSource.name.trim(),
          description: newSource.description.trim(),
          color: newSource.color,
          order_index: leadSources.length,
          is_active: true,
        })
        .select();

      if (error) throw error;

      toast.success("Source added successfully!");
      setNewSource({ name: "", description: "", color: "#22c55e" });
      setIsAddDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error adding source:", error);
      toast.error("Error adding source");
    }
  };

  const handleEditSource = async () => {
    try {
      if (!selectedSource?.name.trim()) {
        toast.error("Source name is required");
        return;
      }

      const { error } = await supabase
        .from("lead_sources")
        .update({
          name: selectedSource.name.trim(),
          description: selectedSource.description.trim(),
          color: selectedSource.color,
        })
        .eq("id", selectedSource.id);

      if (error) throw error;

      toast.success("Source updated successfully!");
      setIsEditDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error updating source:", error);
      toast.error("Error updating source");
    }
  };

  const handleDeleteSource = async () => {
    try {
      const { data: usedLeads, error: checkError } = await supabase
        .from("leads")
        .select("id")
        .eq("source_id", selectedSource.id)
        .limit(1);

      if (checkError) throw checkError;

      if (usedLeads && usedLeads.length > 0) {
        toast.error("This source is being used by leads and cannot be deleted");
        return;
      }

      const { error } = await supabase
        .from("lead_sources")
        .delete()
        .eq("id", selectedSource.id);

      if (error) throw error;

      toast.success("Source deleted successfully!");
      setIsDeleteDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error deleting source:", error);
      toast.error("Error deleting source");
    }
  };

  const moveSourceUp = async (index: number) => {
    if (index === 0) return;
    
    try {
      const items = Array.from(leadSources);
      const currentItem = items[index];
      const prevItem = items[index - 1];
      
      // Swap order indexes
      const { error: error1 } = await supabase
        .from("lead_sources")
        .update({ order_index: prevItem.orderIndex })
        .eq("id", currentItem.id);
        
      if (error1) throw error1;
      
      const { error: error2 } = await supabase
        .from("lead_sources")
        .update({ order_index: currentItem.orderIndex })
        .eq("id", prevItem.id);
        
      if (error2) throw error2;
      
      refetch();
    } catch (error) {
      console.error("Error reordering sources:", error);
      toast.error("Error reordering sources");
    }
  };
  
  const moveSourceDown = async (index: number) => {
    if (index === leadSources.length - 1) return;
    
    try {
      const items = Array.from(leadSources);
      const currentItem = items[index];
      const nextItem = items[index + 1];
      
      // Swap order indexes
      const { error: error1 } = await supabase
        .from("lead_sources")
        .update({ order_index: nextItem.orderIndex })
        .eq("id", currentItem.id);
        
      if (error1) throw error1;
      
      const { error: error2 } = await supabase
        .from("lead_sources")
        .update({ order_index: currentItem.orderIndex })
        .eq("id", nextItem.id);
        
      if (error2) throw error2;
      
      refetch();
    } catch (error) {
      console.error("Error reordering sources:", error);
      toast.error("Error reordering sources");
    }
  };

  if (isLoading) {
    return <div>Loading lead sources...</div>;
  }

  if (error) {
    return <div>Error loading sources: {error.message}</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Lead Source Management</CardTitle>
          <CardDescription>
            Configure the sources where your leads can come from
          </CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-500 hover:bg-green-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Source
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Source</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newSource.name}
                  onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                  placeholder="Ex: Website"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newSource.description}
                  onChange={(e) => setNewSource({ ...newSource, description: e.target.value })}
                  placeholder="Ex: Leads that came from the company website"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="color"
                    type="color"
                    value={newSource.color}
                    onChange={(e) => setNewSource({ ...newSource, color: e.target.value })}
                    className="w-12 h-8 p-1"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleAddSource}>Add Source</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {leadSources.map((source, index) => (
          <div key={source.id} className="flex items-center justify-between p-6 border rounded-lg bg-background">
            <div className="flex items-center space-x-3">
              <div
                className="w-5 h-5 rounded-full"
                style={{ backgroundColor: source.color }}
              />
              <span className="font-medium">{source.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="h-10 w-10 rounded"
                disabled={index === 0}
                onClick={() => moveSourceUp(index)}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 w-10 rounded"
                disabled={index === leadSources.length - 1}
                onClick={() => moveSourceDown(index)}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                variant="outline" 
                size="sm" 
                className="h-10 w-10 rounded"
                onClick={() => {
                  setSelectedSource(source);
                  setIsEditDialogOpen(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="outline" 
                size="sm" 
                className="h-10 w-10 rounded"
                onClick={() => {
                  setSelectedSource(source);
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Source</DialogTitle>
            </DialogHeader>
            {selectedSource && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={selectedSource.name}
                    onChange={(e) =>
                      setSelectedSource({ ...selectedSource, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Input
                    id="edit-description"
                    value={selectedSource.description}
                    onChange={(e) =>
                      setSelectedSource({
                        ...selectedSource,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-color">Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="edit-color"
                      type="color"
                      value={selectedSource.color}
                      onChange={(e) =>
                        setSelectedSource({
                          ...selectedSource,
                          color: e.target.value,
                        })
                      }
                      className="w-12 h-8 p-1"
                    />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleEditSource}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Source</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>
                Are you sure you want to delete the source "
                <strong>{selectedSource?.name}</strong>"?
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                This action cannot be undone. Sources used by leads cannot be deleted.
              </p>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleDeleteSource} variant="destructive">
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
} 