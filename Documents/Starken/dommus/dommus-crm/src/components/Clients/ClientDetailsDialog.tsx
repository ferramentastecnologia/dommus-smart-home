import React, { useState, useEffect } from "react";
import { Client, ClientNote } from "@/types/Client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { useStatus } from "@/contexts/StatusContext";
import { useUser } from "@/hooks/auth/useUser";
import { supabase } from "@/services/supabase/client";
import { toast } from "sonner";
import { Edit, Save, Globe, Building, Phone, Mail, MapPin, User, Calendar, AtSign } from "lucide-react";

interface ClientDetailsDialogProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedClient: Client) => void;
}

export function ClientDetailsDialog({
  client,
  isOpen,
  onClose,
  onUpdate,
}: ClientDetailsDialogProps) {
  const { clientStatuses } = useStatus();
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState<Partial<Client>>({});
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [leadSources, setLeadSources] = useState<Array<{ id: string; name: string }>>([]);
  const [agents, setAgents] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  
  // Reset state when client changes
  useEffect(() => {
    if (client) {
      setCurrentClient(client);
      setEditedClient({ ...client });
      fetchNotes(client.id);
      fetchLeadSources();
      fetchAgents();
    }
  }, [client]);

  // Fetch client data
  const fetchClientData = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*, agent:agents(id, name)")
        .eq("id", clientId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        const fetchedClient = {
          ...data,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
          statusId: data.status_id,
          sourceId: data.source_id,
          agentId: data.agent_id
        } as Client;
        
        setCurrentClient(fetchedClient);
        setEditedClient(fetchedClient);
      }
    } catch (error) {
      console.error("Error fetching client data:", error);
      toast.error("Failed to load client data");
    }
  };
  
  // Fetch client notes
  const fetchNotes = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from("client_notes")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error("Error fetching client notes:", error);
      toast.error("Failed to load notes");
    }
  };
  
  // Fetch lead sources
  const fetchLeadSources = async () => {
    try {
      const { data, error } = await supabase
        .from("lead_sources")
        .select("id, name")
        .order("name");
      
      if (error) throw error;
      setLeadSources(data || []);
    } catch (error) {
      console.error("Error fetching lead sources:", error);
    }
  };
  
  // Fetch agents
  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from("agents")
        .select("id, name")
        .order("name");
      
      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };
  
  // Handle input changes for client editing
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedClient((prev) => ({ ...prev, [name]: value }));
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    // Handle special values for sourceId and agentId
    if (name === "sourceId" && value === "none") {
      setEditedClient((prev) => ({ ...prev, [name]: null }));
    } else if (name === "agentId" && value === "unassigned") {
      setEditedClient((prev) => ({ ...prev, [name]: null }));
    } else {
      setEditedClient((prev) => ({ ...prev, [name]: value }));
    }
  };
  
  // Save client changes
  const saveChanges = async () => {
    if (!client || !editedClient) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("clients")
        .update({
          name: editedClient.name,
          email: editedClient.email,
          phone: editedClient.phone,
          company: editedClient.company,
          position: editedClient.position,
          website: editedClient.website,
          address: editedClient.address,
          status_id: editedClient.statusId,
          source_id: editedClient.sourceId,
          agent_id: editedClient.agentId,
          updated_at: new Date().toISOString()
        })
        .eq("id", client.id)
        .select("*, agent:agents(id, name)");
      
      if (error) throw error;
      
      if (data && data[0]) {
        toast.success("Client updated successfully");
        
        // Transform the data to match our Client type
        const updatedClient = {
          ...data[0],
          createdAt: new Date(data[0].created_at),
          updatedAt: new Date(data[0].updated_at),
          statusId: data[0].status_id,
          sourceId: data[0].source_id,
          agentId: data[0].agent_id
        } as Client;
        
        // Update both the local state and parent component
        setCurrentClient(updatedClient);
        onUpdate(updatedClient);
        setIsEditing(false);
        
        // Refetch all data to ensure everything is up-to-date
        fetchClientData(client.id);
        fetchNotes(client.id);
      }
    } catch (error) {
      console.error("Error updating client:", error);
      toast.error("Failed to update client");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add a new note
  const addNote = async () => {
    if (!client || !newNote.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from("client_notes")
        .insert({
          content: newNote.trim(),
          client_id: client.id,
          created_by: user?.id
        })
        .select();
      
      if (error) throw error;
      
      if (data) {
        setNewNote("");
        fetchNotes(client.id);
        toast.success("Note added successfully");
      }
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Failed to add note");
    }
  };
  
  // Get status name and color by ID
  const getStatus = (statusId: string | undefined) => {
    if (!statusId) return { name: "No Status", color: "#888888" };
    const status = clientStatuses.find(s => s.id === statusId);
    return { 
      name: status ? status.name : "Unknown Status", 
      color: status ? status.color : "#888888" 
    };
  };
  
  // Get source name by ID
  const getSourceName = (sourceId: string | undefined) => {
    if (!sourceId) return "Unknown";
    const source = leadSources.find(s => s.id === sourceId);
    return source ? source.name : "Unknown Source";
  };
  
  // Get agent name by ID
  const getAgentName = (agentId: string | undefined) => {
    if (!agentId) return "Unassigned";
    const agent = agents.find(a => a.id === agentId);
    return agent ? agent.name : "Unknown Agent";
  };

  // Get initials from client name
  const getInitials = (name: string = '') => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  if (!currentClient) return null;
  
  // Get the status info
  const statusInfo = getStatus(currentClient.statusId);
  const softStatusBg = `${statusInfo.color}15`;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[900px] max-h-[90vh] overflow-y-auto p-0">
        <div 
          className="p-6 flex justify-between items-start pt-12"
          style={{ 
            borderLeft: `5px solid ${statusInfo.color}`,
            background: softStatusBg
          }}
        >
          <div>
            <DialogTitle className="text-2xl font-bold flex items-center text-gray-900 dark:text-gray-100">
              Client Details
              <Badge
                className="ml-3 text-xs py-1 px-3 shadow-sm"
                style={{ backgroundColor: statusInfo.color, color: "#fff" }}
              >
                {statusInfo.name}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              View and manage client information
            </DialogDescription>
          </div>
          <div>
            {!isEditing ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
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
        
        <div className="p-6">
          <Tabs defaultValue="details">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Edit Client Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={editedClient.name || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={editedClient.email || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={editedClient.phone || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        name="company"
                        value={editedClient.company || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        name="position"
                        value={editedClient.position || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        name="website"
                        value={editedClient.website || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={editedClient.address || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="statusId">Status</Label>
                      <Select
                        value={editedClient.statusId}
                        onValueChange={(value) => handleSelectChange("statusId", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {clientStatuses.map((status) => (
                            <SelectItem key={status.id} value={status.id}>
                              {status.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="sourceId">Source</Label>
                      <Select
                        value={editedClient.sourceId || "none"}
                        onValueChange={(value) => handleSelectChange("sourceId", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {leadSources.map((source) => (
                            <SelectItem key={source.id} value={source.id}>
                              {source.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="agentId">Assigned Agent</Label>
                      <Select
                        value={editedClient.agentId || "unassigned"}
                        onValueChange={(value) => handleSelectChange("agentId", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select agent" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {agents.map((agent) => (
                            <SelectItem key={agent.id} value={agent.id}>
                              {agent.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    onClick={saveChanges}
                    disabled={isLoading}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-start space-x-6">
                    <Avatar className="h-20 w-20 border-2" style={{ borderColor: statusInfo.color }}>
                      <AvatarFallback style={{ backgroundColor: softStatusBg, color: statusInfo.color }}>
                        {getInitials(currentClient.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold">{currentClient.name}</h2>
                      <p className="text-muted-foreground">
                        {currentClient.company ? `${currentClient.company}${currentClient.position ? ` - ${currentClient.position}` : ''}` : 'Company not provided'}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                          <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full" style={{ backgroundColor: softStatusBg }}>
                            <Mail className="h-5 w-5" style={{ color: statusInfo.color }} />
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Email</span>
                            <p className="font-medium">{currentClient.email}</p>
                          </div>
                        </div>
                        
                        {currentClient.phone && (
                          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                            <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full" style={{ backgroundColor: softStatusBg }}>
                              <Phone className="h-5 w-5" style={{ color: statusInfo.color }} />
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground">Phone</span>
                              <p className="font-medium">{currentClient.phone}</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                          <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full" style={{ backgroundColor: softStatusBg }}>
                            <User className="h-5 w-5" style={{ color: statusInfo.color }} />
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Assigned to</span>
                            <p className="font-medium">{currentClient.agentId ? getAgentName(currentClient.agentId) : "Unassigned"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Source</h3>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: statusInfo.color }}></div>
                          <span className="font-medium">{currentClient.sourceId ? getSourceName(currentClient.sourceId) : "Not specified"}</span>
                        </div>
                      </div>
                      
                      {currentClient.website && (
                        <>
                          <h3 className="text-lg font-semibold">Website</h3>
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              <a href={currentClient.website.startsWith('http') ? currentClient.website : `https://${currentClient.website}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {currentClient.website}
                              </a>
                            </div>
                          </div>
                        </>
                      )}
                      
                      {currentClient.address && (
                        <>
                          <h3 className="text-lg font-semibold">Address</h3>
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{currentClient.address}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Creation Details</h3>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Created</span>
                          <span>{format(new Date(currentClient.createdAt), "MMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Last updated</span>
                          <span>{format(new Date(currentClient.updatedAt), "MMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Status</span>
                          <Badge style={{ backgroundColor: statusInfo.color, color: "#fff" }}>
                            {statusInfo.name}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="notes" className="space-y-5">
              <div>
                <h3 className="text-lg font-medium mb-3">Add a Note</h3>
                <div className="space-y-3">
                  <Textarea
                    id="newNote"
                    placeholder="Enter your note here..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="min-h-24 resize-none"
                  />
                  <Button 
                    onClick={addNote} 
                    disabled={!newNote.trim()}
                    className="w-full"
                    style={{ backgroundColor: statusInfo.color }}
                  >
                    Add Note
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-4">Notes History</h3>
                {notes.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <p>No notes found for this client.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notes.map((note) => (
                      <div key={note.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2 text-sm text-muted-foreground">
                          <div>
                            <User className="inline h-3 w-3 mr-1" />
                            {user?.id === note.created_by ? "You" : "User"}
                          </div>
                          <div>
                            <Calendar className="inline h-3 w-3 mr-1" />
                            {format(new Date(note.created_at), "MMM d, yyyy h:mm a")}
                          </div>
                        </div>
                        <p className="whitespace-pre-wrap">{note.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
} 