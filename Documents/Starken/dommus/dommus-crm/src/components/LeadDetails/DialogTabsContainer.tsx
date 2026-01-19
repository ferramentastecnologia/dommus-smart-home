import React from "react";
import { Lead, Note } from "@/types/crm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DialogInfoTab, 
  DialogNotesTab, 
  DialogTimelineTab 
} from "@/components/LeadDetails";

interface DialogTabsContainerProps {
  lead: Lead;
  isEditing: boolean;
  editedLead: Partial<Lead>;
  setEditedLead: (lead: Partial<Lead>) => void;
  newNote: string;
  setNewNote: (note: string) => void;
  newTask: { description: string; agentId: string; dueDate: string };
  setNewTask: (task: { description: string; agentId: string; dueDate: string }) => void;
  agents: { id: string; name: string }[];
  handleAddNote: () => void;
  handleRemoveNote: (noteId: string) => void;
  handleAddTask: () => void;
  notes: Note[];
  isLoadingNotes: boolean;
  fetchNotes: () => Promise<void>;
}

export function DialogTabsContainer({
  lead,
  isEditing,
  editedLead,
  setEditedLead,
  newNote,
  setNewNote,
  newTask,
  setNewTask,
  agents,
  handleAddNote,
  handleRemoveNote,
  handleAddTask,
  notes,
  isLoadingNotes,
  fetchNotes
}: DialogTabsContainerProps) {
  return (
    <Tabs defaultValue="info">
      <TabsList className="bg-background border border-border">
        <TabsTrigger value="info" className="data-[state=active]:bg-card data-[state=active]:text-primary">
          Information
        </TabsTrigger>
        <TabsTrigger value="notes" className="data-[state=active]:bg-card data-[state=active]:text-primary">
          Notes
        </TabsTrigger>
        <TabsTrigger value="timeline" className="data-[state=active]:bg-card data-[state=active]:text-primary">
          Timeline
        </TabsTrigger>
      </TabsList>
      
      {/* Informations Tab */}
      <TabsContent value="info" className="mt-4">
        <DialogInfoTab 
          lead={lead}
          isEditing={isEditing}
          editedLead={editedLead}
          setEditedLead={setEditedLead}
          agents={agents}
        />
      </TabsContent>
      
      {/* Notes Tab */}
      <TabsContent value="notes" className="mt-4">
        <DialogNotesTab 
          lead={lead}
          newNote={newNote}
          setNewNote={setNewNote}
          handleAddNote={handleAddNote}
          handleRemoveNote={handleRemoveNote}
          notes={notes}
          isLoadingNotes={isLoadingNotes}
          fetchNotes={fetchNotes}
        />
      </TabsContent>
      
      {/* Timeline Tab */}
      <TabsContent value="timeline" className="mt-4">
        <DialogTimelineTab lead={lead} />
      </TabsContent>
    </Tabs>
  );
}
