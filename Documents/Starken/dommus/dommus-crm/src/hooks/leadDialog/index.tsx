import { useState, useEffect, useMemo } from "react";
import { Lead } from "@/types/crm";
import { supabase } from "@/services/supabase/client";
import { useLeadForm } from "./useLeadForm";
import { useLeadNotes } from "./useLeadNotes";
import { useLeadTasks } from "./useLeadTasks";

export function useLeadDialog(lead: Lead | null, onLeadUpdate?: (updatedLead: Lead) => void) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(lead);
  const [agents, setAgents] = useState<{ id: string; name: string }[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Atualiza o lead selecionado quando o lead prop mudar
  useEffect(() => {
    setSelectedLead(lead);
  }, [lead]);

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('id, name');

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  // Buscar agentes quando o componente montar
  useEffect(() => {
    fetchAgents();
  }, []);

  const handleOpen = (leadData: Lead) => {
    setSelectedLead(leadData);
    setIsOpen(true);
  };

  const handleClose = () => {
    setSelectedLead(null);
    setIsOpen(false);
    setIsEditing(false);
  };

  const updateLeadCallback = (updatedLead: Lead) => {
    setSelectedLead(updatedLead);
    setIsEditing(false);
    
    if (onLeadUpdate) {
      onLeadUpdate(updatedLead);
    }
  };

  // Use hooks com tratamento seguro para lead null
  const { editedLead, setEditedLead, handleSaveEdit, isLoading } = useLeadForm(
    selectedLead, 
    updateLeadCallback
  );
  
  const { 
    newNote, 
    setNewNote, 
    notes,
    isLoadingNotes,
    fetchNotes,
    handleAddNote, 
    handleRemoveNote 
  } = useLeadNotes(
    selectedLead, 
    updateLeadCallback
  );
  
  const { newTask, setNewTask, handleAddTask } = useLeadTasks(
    selectedLead, 
    updateLeadCallback
  );

  return {
    isOpen,
    selectedLead,
    agents,
    isEditing,
    setIsEditing,
    handleOpen,
    handleClose,
    editedLead,
    setEditedLead,
    newNote,
    setNewNote,
    notes,
    isLoadingNotes,
    fetchNotes,
    newTask,
    setNewTask,
    handleSaveEdit,
    handleAddNote,
    handleRemoveNote,
    handleAddTask,
    isLoading
  };
}
