import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { LeadForm } from "./LeadForm";
import { Lead } from "@/types/crm";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CalendarClock, Mail, Phone, User, Globe, MapPin, BookOpen, Briefcase, Building, AtSign, UserCheck, Edit } from "lucide-react";
import { NotesTab } from "../Notes/NotesTab";
import { LeadTimeline } from "./LeadTimeline";
import { useLeadDialog } from "@/hooks/useLeadDialog";
import { useLeadStatuses } from "@/hooks/useLeadStatuses";
import { useLeadSources } from "@/hooks/useLeadSources";
import { cn } from "@/lib/utils";
import { supabase } from "@/services/supabase/client";

// Extended Lead type to handle additional properties that are not in the type definition
interface LeadExtended extends Lead {
  value?: number;
  description?: string;
  status_name?: string;
  status_color?: string;
  source_name?: string;
  source_id?: string;
  agent_name?: string;
  created_at?: string | Date;
}

interface LeadDetailsDialogProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedLead: Lead) => void;
}

export function LeadDetailsDialog({
  lead,
  isOpen,
  onClose,
  onUpdate,
}: LeadDetailsDialogProps) {
  const { getStatusColor, getStatusBackgroundColor } = useLeadStatuses();
  const { leadSources, getSourceById, getSourceColor } = useLeadSources();
  const [isConverting, setIsConverting] = useState(false);

  const {
    selectedLead,
    isEditing,
    setIsEditing,
    editedLead,
    setEditedLead,
    newNote,
    setNewNote,
    notes,
    isLoadingNotes,
    fetchNotes,
    handleSaveEdit,
    handleAddNote,
    handleRemoveNote,
    isLoading
  } = useLeadDialog(lead, onUpdate);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (!selectedLead) return null;
  
  // Cast to extended lead type
  const extendedLead = selectedLead as LeadExtended;
  
  // Get the status color for styling - safely using only defined properties
  const status = extendedLead.status || extendedLead.status_name || "";
  const statusColor = getStatusColor(status);
  
  // Get source information - safely using only defined properties
  const sourceId = extendedLead.sourceId || extendedLead.source_id;
  const source = getSourceById(sourceId);
  const sourceName = extendedLead.source || 
                    extendedLead.source_name || 
                    "Not provided";
  const sourceColor = getSourceColor(sourceName);

  // Create a softer color for background based on status color
  const softStatusBg = `${statusColor}10`;

  // Add convertToClient function
  const convertToClient = async () => {
    if (!lead) return;
    
    try {
      setIsConverting(true);
      
      // Create a new client from the lead data
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .insert({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          position: lead.position,
          website: lead.website,
          address: lead.address,
          agent_id: lead.agentId,
          source_id: lead.sourceId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (clientError) throw clientError;
      
      // Get the first default client status
      const { data: statusData, error: statusError } = await supabase
        .from("client_statuses")
        .select("id")
        .eq("is_default", true)
        .limit(1);
      
      if (statusError) throw statusError;
      
      // Update the client with the default status
      if (statusData && statusData.length > 0 && clientData && clientData.length > 0) {
        const { error: updateError } = await supabase
          .from("clients")
          .update({ status_id: statusData[0].id })
          .eq("id", clientData[0].id);
        
        if (updateError) throw updateError;
      }
      
      // Update the lead status to converted if successful
      const { data: leadStatusData, error: leadStatusError } = await supabase
        .from("lead_statuses")
        .select("id")
        .eq("is_converted", true)
        .limit(1);
      
      if (leadStatusError) throw leadStatusError;
      
      if (leadStatusData && leadStatusData.length > 0) {
        const { data: updateData, error: updateError } = await supabase
          .from("leads")
          .update({ status_id: leadStatusData[0].id })
          .eq("id", lead.id)
          .select("*, agent:agents(id, name)");
        
        if (updateError) throw updateError;
        
        if (updateData && updateData[0]) {
          const updatedLead = {
            ...updateData[0],
            createdAt: new Date(updateData[0].created_at),
            updatedAt: new Date(updateData[0].updated_at),
            lastInteraction: updateData[0].last_interaction ? new Date(updateData[0].last_interaction) : undefined,
            statusId: updateData[0].status_id,
            sourceId: updateData[0].source_id,
            agentId: updateData[0].agent_id
          } as Lead;
          
          onUpdate(updatedLead);
          toast.success("Lead converted to client successfully");
        }
      }
      
      // Navigate to the client page
      window.location.href = "/clients";
    } catch (error) {
      console.error("Error converting lead to client:", error);
      toast.error("Failed to convert lead to client");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 dark:border-gray-800"
        style={{
          borderLeft: `5px solid ${statusColor}`,
        }}
      >
        <DialogHeader className="pr-14 pt-8">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-bold flex items-center text-gray-900 dark:text-gray-100">
              <span>Lead Details</span>
              <Badge
                className="ml-3 text-xs py-1 px-3 shadow-sm"
                style={{
                  backgroundColor: statusColor,
                  color: "#fff",
                }}
              >
                {status || "No status"}
              </Badge>
            </DialogTitle>
            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={convertToClient}
                    className="gap-2"
                    disabled={isConverting}
                  >
                    <UserCheck className="h-4 w-4" />
                    Convert to Client
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
          <DialogDescription>
            View and manage lead information
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {isEditing ? (
            <div className="bg-white dark:bg-gray-900">
              <LeadForm
                lead={selectedLead}
                editedLead={editedLead}
                setEditedLead={setEditedLead}
                onSave={handleSaveEdit}
                onCancel={() => setIsEditing(false)}
                isLoading={isLoading}
              />
            </div>
          ) : (
            <>
              <div className="flex items-start gap-4 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm dark:shadow-gray-950/50">
                <Avatar className="h-16 w-16 border-2 shadow-md" style={{ borderColor: statusColor }}>
                  <AvatarFallback className="text-lg" style={{ backgroundColor: `${statusColor}30`, color: statusColor }}>
                    {getInitials(extendedLead.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{extendedLead.name}</h2>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {extendedLead.company || "Company not provided"}
                  </p>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
                      <div className="flex items-center justify-center h-7 w-7 rounded-full" 
                        style={{ backgroundColor: `${statusColor}15` }}>
                        <Mail className="h-4 w-4" style={{ color: statusColor }} />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Email</div>
                        <div className="font-medium">{extendedLead.email || "Not provided"}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
                      <div className="flex items-center justify-center h-7 w-7 rounded-full" 
                        style={{ backgroundColor: `${statusColor}15` }}>
                        <Phone className="h-4 w-4" style={{ color: statusColor }} />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Phone</div>
                        <div className="font-medium">{extendedLead.phone || "Not provided"}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
                      <div className="flex items-center justify-center h-7 w-7 rounded-full" 
                        style={{ backgroundColor: `${statusColor}15` }}>
                        <User className="h-4 w-4" style={{ color: statusColor }} />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Assigned to</div>
                        <div className="font-medium">{extendedLead.agent?.name || extendedLead.agent_name || "Not assigned"}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
                      <div className="flex items-center justify-center h-7 w-7 rounded-full" 
                        style={{ backgroundColor: `${sourceColor}15` }}>
                        <BookOpen className="h-4 w-4" style={{ color: sourceColor }} />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Source</div>
                        <div className="font-medium" style={{ color: sourceColor }}>
                          {sourceName}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
                      <div className="flex items-center justify-center h-7 w-7 rounded-full" 
                        style={{ backgroundColor: `${statusColor}15` }}>
                        <CalendarClock className="h-4 w-4" style={{ color: statusColor }} />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Created</div>
                        <div className="font-medium">
                          {(extendedLead.createdAt || extendedLead.created_at)
                            ? format(
                                new Date(extendedLead.createdAt || extendedLead.created_at as Date),
                                "dd/MM/yyyy"
                              )
                            : "Unknown date"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="details" className="mt-2">
                <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                  <TabsTrigger value="details" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm">Details</TabsTrigger>
                  <TabsTrigger value="notes" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm">Notes</TabsTrigger>
                  <TabsTrigger value="timeline" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm">Timeline</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 py-3 mt-2 bg-white dark:bg-gray-900 rounded-md p-4 shadow-sm dark:shadow-gray-950/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Source
                      </h3>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: sourceColor }} />
                        <p className="font-medium text-gray-900 dark:text-gray-100">{sourceName}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Company
                      </h3>
                      <div className="flex items-center gap-2">
                        {extendedLead.company ? (
                          <>
                            <div className="flex items-center justify-center h-6 w-6 rounded-full" 
                              style={{ backgroundColor: `${statusColor}15` }}>
                              <Building className="h-3.5 w-3.5" style={{ color: statusColor }} />
                            </div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{extendedLead.company}</p>
                          </>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">Not provided</span>
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Website
                      </h3>
                      <div className="flex items-center gap-2">
                        {extendedLead.website ? (
                          <>
                            <div className="flex items-center justify-center h-6 w-6 rounded-full" 
                              style={{ backgroundColor: `${statusColor}15` }}>
                              <Globe className="h-3.5 w-3.5" style={{ color: statusColor }} />
                            </div>
                            <a 
                              href={extendedLead.website.startsWith('http') ? extendedLead.website : `https://${extendedLead.website}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                            >
                              {extendedLead.website}
                            </a>
                          </>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">Not provided</span>
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Position
                      </h3>
                      <div className="flex items-center gap-2">
                        {extendedLead.position ? (
                          <>
                            <div className="flex items-center justify-center h-6 w-6 rounded-full" 
                              style={{ backgroundColor: `${statusColor}15` }}>
                              <Briefcase className="h-3.5 w-3.5" style={{ color: statusColor }} />
                            </div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{extendedLead.position}</p>
                          </>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">Not provided</span>
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Address
                      </h3>
                      <div className="flex items-center gap-2">
                        {extendedLead.address ? (
                          <>
                            <div className="flex items-center justify-center h-6 w-6 rounded-full" 
                              style={{ backgroundColor: `${statusColor}15` }}>
                              <MapPin className="h-3.5 w-3.5" style={{ color: statusColor }} />
                            </div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{extendedLead.address}</p>
                          </>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">Not provided</span>
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Agent
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center h-6 w-6 rounded-full" 
                          style={{ backgroundColor: `${statusColor}15` }}>
                          <User className="h-3.5 w-3.5" style={{ color: statusColor }} />
                        </div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {extendedLead.agent?.name || extendedLead.agent_name || "Not assigned"}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="bg-white dark:bg-gray-900 mt-2 rounded-md p-4 shadow-sm dark:shadow-gray-950/50">
                  <NotesTab
                    notes={notes}
                    isLoading={isLoadingNotes}
                    newNote={newNote}
                    setNewNote={setNewNote}
                    onAddNote={handleAddNote}
                    onRemoveNote={handleRemoveNote}
                    leadId={extendedLead.id}
                    onNotesUpdate={fetchNotes}
                  />
                </TabsContent>
                
                <TabsContent value="timeline" className="bg-white dark:bg-gray-900 mt-2 rounded-md p-4 shadow-sm dark:shadow-gray-950/50">
                  <LeadTimeline leadId={extendedLead.id} />
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
