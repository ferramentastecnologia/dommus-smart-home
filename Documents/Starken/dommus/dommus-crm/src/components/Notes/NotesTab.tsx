import React, { useEffect } from "react";
import { Note } from "@/types/crm";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";

interface NotesTabProps {
  notes: Note[];
  isLoading: boolean;
  newNote: string;
  setNewNote: (note: string) => void;
  onAddNote: () => void;
  onRemoveNote: (noteId: string) => void;
  leadId: string;
  onNotesUpdate: () => void;
}

export const NotesTab: React.FC<NotesTabProps> = ({
  notes,
  isLoading,
  newNote,
  setNewNote,
  onAddNote,
  onRemoveNote,
  leadId,
  onNotesUpdate
}) => {
  useEffect(() => {
    if (leadId) {
      onNotesUpdate();
    }
  }, [leadId, onNotesUpdate]);

  // Function to format date
  const formatDate = (date: Date) => {
    return format(date, "MMM d, yyyy 'at' h:mm a", { locale: enUS });
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-2">
        <Textarea
          placeholder="Add a note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="flex-1"
        />
        <Button onClick={onAddNote} className="self-end">
          <Plus size={16} className="mr-1" /> Add
        </Button>
      </div>

      <div className="space-y-4 mt-6">
        {isLoading ? (
          <p className="text-muted-foreground">Loading notes...</p>
        ) : notes.length === 0 ? (
          <p className="text-muted-foreground">No notes found for this lead.</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-muted p-4 rounded-md">
              <div className="flex justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {formatDate(note.createdAt)}
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    onRemoveNote(note.id);
                    setTimeout(onNotesUpdate, 500);
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
  );
}; 