import React, { useEffect, useCallback } from "react";
import { Lead, Note } from "@/types/crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";

interface DialogNotesTabProps {
  lead: Lead;
  newNote: string;
  setNewNote: (note: string) => void;
  handleAddNote: () => void;
  handleRemoveNote: (noteId: string) => void;
  notes?: Note[];
  isLoadingNotes?: boolean;
  fetchNotes?: () => Promise<void>;
}

export function DialogNotesTab({ 
  lead, 
  newNote, 
  setNewNote, 
  handleAddNote, 
  handleRemoveNote,
  notes = [],
  isLoadingNotes = false,
  fetchNotes
}: DialogNotesTabProps) {
  // Usar um ID estável para o lead para evitar renderizações desnecessárias
  const leadId = lead?.id;
  
  // Buscar notas apenas uma vez quando o componente montar ou quando o lead mudar
  useEffect(() => {
    if (!leadId) return;
    
    console.log("DialogNotesTab mounted with lead:", leadId);
    
    // Fetch notes when component mounts, but only if fetchNotes is a function
    if (typeof fetchNotes === 'function') {
      try {
        fetchNotes();
      } catch (error) {
        console.error("Error fetching notes in DialogNotesTab:", error);
      }
    }
    // Apenas dependemos do leadId, não da referência de fetchNotes
  }, [leadId]);

  // Function to format date
  const formatDate = (date: Date) => {
    return format(date, "MMM d, yyyy 'at' h:mm a", { locale: enUS });
  };

  const handleAddWithRefresh = () => {
    console.log("Add Note button clicked");
    handleAddNote();
    
    // Recarregar notas após adicionar uma nova, mas apenas se fetchNotes for uma função
    if (typeof fetchNotes === 'function') {
      setTimeout(() => {
        try {
          fetchNotes();
        } catch (error) {
          console.error("Error fetching notes after adding:", error);
        }
      }, 300);
    }
  };

  const handleRemoveWithRefresh = (noteId: string) => {
    handleRemoveNote(noteId);
    
    // Recarregar notas após remover, mas apenas se fetchNotes for uma função
    if (typeof fetchNotes === 'function') {
      setTimeout(() => {
        try {
          fetchNotes();
        } catch (error) {
          console.error("Error fetching notes after removing:", error);
        }
      }, 300);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Textarea 
              placeholder="Add a new note..." 
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleAddWithRefresh}
              className="self-end"
            >
              <Plus size={16} className="mr-1" /> Add
            </Button>
          </div>
          
          <div className="space-y-3 mt-4">
            {isLoadingNotes ? (
              <p className="text-muted-foreground text-sm">Loading notes...</p>
            ) : notes.length === 0 ? (
              <p className="text-muted-foreground text-sm">No notes found.</p>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note.id} className="bg-slate-50 p-3 rounded-md">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">
                        {formatDate(note.createdAt)}
                      </p>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleRemoveWithRefresh(note.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                    <p className="mt-1 text-sm">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
