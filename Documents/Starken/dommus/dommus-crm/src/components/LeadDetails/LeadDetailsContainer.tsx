import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  InfoTab, 
  NotesTab, 
  TimelineTab,
  ProfileCard
} from "@/components/LeadDetails";
import { Lead } from "@/types/crm";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface LeadDetailsContainerProps {
  lead: Lead;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  editedLead: Partial<Lead>;
  setEditedLead: (lead: Partial<Lead>) => void;
  newNote: string;
  setNewNote: (note: string) => void;
  newTask: { description: string; agentId: string; dueDate: string };
  setNewTask: (task: { description: string; agentId: string; dueDate: string }) => void;
  agents: { id: string; name: string }[];
  handleSaveEdit: () => void;
  handleAddNote: () => void;
  handleRemoveNote: (noteId: string) => void;
  handleAddTask: () => void;
}

export function LeadDetailsContainer({
  lead,
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
  handleRemoveNote,
  handleAddTask
}: LeadDetailsContainerProps) {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          className="rounded-full" 
          onClick={() => navigate("/leads")}
        >
          <ChevronLeft size={20} />
        </Button>
        <h1 className="text-xl font-medium ml-2">Detalhes do Lead</h1>
      </div>
      
      {/* Central profile card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-3">
          <ProfileCard 
            lead={lead}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            handleSaveEdit={handleSaveEdit}
            agents={agents}
          />
        </div>
      </div>
      
      {/* Information tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <NotesTab 
            lead={lead}
            newNote={newNote}
            setNewNote={setNewNote}
            handleAddNote={handleAddNote}
            handleRemoveNote={handleRemoveNote}
          />
        </div>
        
        <div className="md:col-span-2">
          <TimelineTab lead={lead} />
        </div>
        
        {isEditing && (
          <div className="md:col-span-2">
            <InfoTab 
              lead={lead}
              isEditing={isEditing}
              editedLead={editedLead}
              setEditedLead={setEditedLead}
              agents={agents}
            />
          </div>
        )}
      </div>
    </div>
  );
}
