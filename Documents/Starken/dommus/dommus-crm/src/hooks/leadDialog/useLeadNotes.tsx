import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/services/supabase/client";
import { Lead, Note } from "@/types/crm";
import { toast } from "sonner";
import { useUser } from "@/hooks/auth/useUser";

export function useLeadNotes(lead: Lead | null, onLeadUpdate: (lead: Lead) => void) {
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const { user } = useUser();

  // Limpar as notas e recarregar quando o lead mudar
  useEffect(() => {
    // Limpar as notas ao trocar de lead
    setNotes([]);
    
    if (lead) {
      fetchNotes();
    }
  }, [lead?.id]); // Dependência apenas no ID do lead

  const fetchNotes = useCallback(async () => {
    if (!lead) return;
    
    setIsLoadingNotes(true);
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        // Verificar se o erro é porque a tabela não existe
        if (error.code === "PGRST204" || error.message?.includes("not found")) {
          console.error("Table 'notes' doesn't exist:", error);
          return;
        }
        throw error;
      }
      
      // Converter para o formato esperado pela aplicação
      const formattedNotes: Note[] = data.map(note => ({
        id: note.id,
        content: note.content,
        createdBy: note.created_by,
        createdAt: new Date(note.created_at)
      }));
      
      setNotes(formattedNotes || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
      setNotes([]);
    } finally {
      setIsLoadingNotes(false);
    }
  }, [lead]);

  const handleAddNote = async () => {
    if (!lead) return;
    
    const trimmedNote = newNote.trim();
    if (!trimmedNote) {
      toast.error("Note content cannot be empty");
      return;
    }
    
    try {
      // Converter para o formato do Supabase (snake_case)
      const supabaseNote = {
        content: trimmedNote,
        lead_id: lead.id,
        created_by: user?.id || null, // Usar o ID do usuário autenticado ou null se não estiver autenticado
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('notes')
        .insert(supabaseNote)
        .select('*')
        .single();

      if (error) {
        // Verificar se o erro é porque a tabela não existe
        if (error.code === "PGRST204" || error.message?.includes("not found")) {
          toast.error("The 'notes' table doesn't exist. Please run the SQL script to create the table.");
          console.error("Table 'notes' doesn't exist:", error);
          return;
        }
        
        throw error;
      }

      // Update lead's last interaction
      const { error: updateError } = await supabase
        .from('leads')
        .update({ 
          last_interaction: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', lead.id);

      if (updateError) throw updateError;

      // Convert the returned data to our Note format
      const newNoteItem: Note = {
        id: data.id || Date.now().toString(),
        content: data.content,
        createdBy: data.created_by,
        createdAt: new Date(data.created_at) || new Date()
      };
      
      // Immediately update the state to show the new note
      setNotes(prevNotes => [newNoteItem, ...prevNotes]);
      
      const updatedLead = {
        ...lead,
        lastInteraction: new Date(),
        updatedAt: new Date()
      };

      onLeadUpdate(updatedLead);
      toast.success("Note added successfully");
      
      // Clear the input field and close the add note dialog
      setNewNote("");
      setIsAddNoteOpen(false);
    } catch (error) {
      toast.error("Error adding note");
      console.error("Error adding note:", error);
    }
  };

  // Function to remove note
  const handleRemoveNote = async (noteId: string) => {
    if (!lead) return;
    
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);
        
      if (error) {
        // Verificar se o erro é porque a tabela não existe
        if (error.code === "PGRST204" || error.message?.includes("not found")) {
          toast.error("The 'notes' table doesn't exist in the database. Please run the SQL script to create the table.");
          console.error("Table 'notes' doesn't exist:", error);
          return;
        }
        throw error;
      }
      
      // Atualizar o estado local
      const updatedLead = {
        ...lead,
        lastInteraction: new Date(),
        updatedAt: new Date()
      };
      
      onLeadUpdate(updatedLead);
      setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
      toast.success("Note removed successfully");
    } catch (error) {
      toast.error("Error removing note");
      console.error(error);
    }
  };
  
  return {
    isAddNoteOpen,
    setIsAddNoteOpen,
    newNote,
    setNewNote,
    notes,
    isLoadingNotes,
    fetchNotes,
    handleAddNote,
    handleRemoveNote
  };
}
