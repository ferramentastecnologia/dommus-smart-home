import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLeadDetails } from "@/hooks/useLeadDetails";
import { LoadingState } from "@/components/LeadDetails/LoadingState";
import { ErrorState } from "@/components/LeadDetails/ErrorState";
import { LeadDetailsContainer } from "@/components/LeadDetails/LeadDetailsContainer";
import { toast } from "sonner";

export default function LeadDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  console.log("LeadDetails page - Fetching lead ID:", id);
  
  const { 
    lead,
    isLoading,
    error,
    isEditing,
    setIsEditing,
    editedLead,
    setEditedLead,
    newNote,
    setNewNote,
    newTask,
    setNewTask,
    agents,
    handleSaveEdit,
    handleAddNote,
    handleAddTask,
    handleRemoveNote
  } = useLeadDetails(id);
  
  useEffect(() => {
    // Display error toast if there's an error
    if (error) {
      toast.error("Error loading lead: " + error);
    }
  }, [error]);
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (error || !lead) {
    return <ErrorState error={error} />;
  }
  
  console.log("Lead details loaded successfully:", lead);
  
  // Adaptador para corrigir incompatibilidade de tipos
  const formattedNewTask = {
    description: newTask?.description || "",
    agentId: newTask?.assignedTo || "",
    dueDate: newTask?.dueDate ? newTask.dueDate.toISOString().split('T')[0] : ""
  };
  
  const handleSetNewTask = (task: { description: string; agentId: string; dueDate: string }) => {
    setNewTask({
      ...newTask,
      description: task.description,
      assignedTo: task.agentId,
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined
    });
  };
  
  return (
    <LeadDetailsContainer
      lead={lead}
      isEditing={isEditing}
      setIsEditing={setIsEditing}
      editedLead={editedLead}
      setEditedLead={setEditedLead}
      newNote={newNote}
      setNewNote={setNewNote}
      newTask={formattedNewTask}
      setNewTask={handleSetNewTask}
      agents={agents}
      handleSaveEdit={handleSaveEdit}
      handleAddNote={handleAddNote}
      handleRemoveNote={handleRemoveNote}
      handleAddTask={handleAddTask}
    />
  );
}
