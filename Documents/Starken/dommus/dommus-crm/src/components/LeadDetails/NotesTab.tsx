import React, { useEffect } from "react";
import { Lead, Note } from "@/types/crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";

interface NotesTabProps {
  lead: Lead;
  newNote: string;
  setNewNote: (note: string) => void;
  handleAddNote: () => void;
  handleRemoveNote: (noteId: string) => void;
  notes?: Note[];
  isLoadingNotes?: boolean;
  fetchNotes?: () => Promise<void>;
}

export function NotesTab({ 
  lead, 
  newNote, 
  setNewNote, 
  handleAddNote, 
  handleRemoveNote, 
  notes = [], 
  isLoadingNotes = false,
  fetchNotes = async () => {}
}: NotesTabProps) {
  // Buscar notas quando o componente montar
  useEffect(() => {
    console.log("NotesTab mounted/updated, lead.id:", lead.id);
    if (fetchNotes) {
      console.log("Calling fetchNotes in NotesTab");
      fetchNotes().then(() => {
        console.log("fetchNotes completed in NotesTab");
      });
    }
  }, [lead.id, fetchNotes]);

  console.log("NotesTab render - notes:", notes, "isLoadingNotes:", isLoadingNotes);

  // Function to format date
  const formatDate = (date: Date) => {
    return format(date, "MMM d, yyyy", { locale: enUS });
  };
  
  return (
    <Card className="border-green-100">
      <CardHeader className="pb-2 border-b border-green-100">
        <CardTitle className="text-xl flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-600">
            <path d="M14 4h6m-6 0v6m0-6L9.5 9.5"/>
            <path d="M4 20h6m0 0v-6m0 6L5.5 15.5"/>
          </svg>
          Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-6">
          <div className="flex space-x-2">
            <Textarea 
              placeholder="Add a new note..." 
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="flex-1 border-green-200 focus:border-green-400 focus:ring-green-400"
            />
            <Button 
              onClick={() => {
                handleAddNote();
                // Recarregar notas após adicionar uma nova
                if (fetchNotes) {
                  setTimeout(() => fetchNotes(), 500);
                }
              }} 
              className="self-end bg-green-600 hover:bg-green-700"
            >
              <Plus size={16} className="mr-1" /> Add
            </Button>
          </div>
          
          <div className="space-y-4 mt-6">
            {isLoadingNotes ? (
              <p className="text-muted-foreground">Loading notes...</p>
            ) : notes.length === 0 ? (
              <p className="text-muted-foreground">No notes found.</p>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="bg-green-50 p-4 rounded-md border border-green-100">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-green-700">
                      {formatDate(note.createdAt)}
                    </p>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => {
                        handleRemoveNote(note.id);
                        // Recarregar notas após remover
                        if (fetchNotes) {
                          setTimeout(() => fetchNotes(), 500);
                        }
                      }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  <p className="mt-2">{note.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
