import React from "react";
import { Lead } from "@/types/crm";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DialogHeader, DialogTabsContainer } from "@/components/LeadDetails";
import { useLeadDialog } from "@/hooks/useLeadDialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useLeadStatuses } from "@/hooks/useLeadStatuses";
import { useLeadSources } from "@/hooks/useLeadSources";

interface LeadDetailsDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadUpdate?: (updatedLead: Lead) => void;
}

export function LeadDetailsDialog({ 
  lead, 
  open, 
  onOpenChange, 
  onLeadUpdate 
}: LeadDetailsDialogProps) {
  // Use our custom hook to manage the dialog state and actions
  const {
    isEditing,
    setIsEditing,
    editedLead,
    setEditedLead,
    newNote,
    setNewNote,
    notes,
    isLoadingNotes,
    fetchNotes,
    newTask,
    setNewTask,
    agents,
    handleSaveEdit,
    handleAddNote,
    handleRemoveNote,
    handleAddTask,
    isLoading
  } = useLeadDialog(lead, onLeadUpdate);
  
  const { getStatusColor, getStatusBackgroundColor } = useLeadStatuses();
  const { leadSources } = useLeadSources();
  
  if (!lead) return null;
  
  // Adaptadores para corrigir incompatibilidade de tipos
  const formattedNewTask = {
    description: newTask.description || "",
    agentId: newTask.assignedTo || "",
    dueDate: newTask.dueDate ? newTask.dueDate.toISOString().split('T')[0] : ""
  };
  
  const handleSetNewTask = (task: { description: string; agentId: string; dueDate: string }) => {
    setNewTask({
      ...newTask,
      description: task.description,
      assignedTo: task.agentId,
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined
    });
  };
  
  // Get the background color for the dialog based on lead status
  const getBgStyle = () => {
    if (!lead || !lead.status) return {};
    
    const statusColor = getStatusColor(lead.status);
    const bgColor = getStatusBackgroundColor(lead.status);
    
    return {
      background: `linear-gradient(to bottom right, ${bgColor}80, rgba(255, 255, 255, 0.95))`,
      borderLeft: `5px solid ${statusColor}`,
      boxShadow: `0 4px 20px rgba(0, 0, 0, 0.1)`,
      borderRadius: '8px'
    };
  };
  
  // Make sure editedLead has the sourceId property
  React.useEffect(() => {
    if (isEditing && lead.sourceId && !editedLead.sourceId) {
      setEditedLead(prev => ({
        ...prev,
        sourceId: lead.sourceId
      }));
    }
  }, [isEditing, lead.sourceId, editedLead.sourceId]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto" 
        style={getBgStyle()}
        aria-describedby="lead-dialog-description"
      >
        {/* Adicionando os elementos necessários para acessibilidade */}
        <VisuallyHidden>
          <DialogTitle>Lead Details: {lead.name}</DialogTitle>
          <DialogDescription id="lead-dialog-description">
            View and edit details for {lead.name} from {lead.company}
          </DialogDescription>
        </VisuallyHidden>
        
        <DialogHeader 
          lead={lead}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          handleSaveEdit={handleSaveEdit}
          onOpenChange={onOpenChange}
          isLoading={isLoading}
        />
        
        <DialogTabsContainer
          lead={lead}
          isEditing={isEditing}
          editedLead={editedLead}
          setEditedLead={setEditedLead}
          newNote={newNote}
          setNewNote={setNewNote}
          notes={notes}
          isLoadingNotes={isLoadingNotes}
          fetchNotes={fetchNotes}
          newTask={formattedNewTask}
          setNewTask={handleSetNewTask}
          agents={agents}
          handleAddNote={handleAddNote}
          handleRemoveNote={handleRemoveNote}
          handleAddTask={handleAddTask}
        />
      </DialogContent>
    </Dialog>
  );
} 