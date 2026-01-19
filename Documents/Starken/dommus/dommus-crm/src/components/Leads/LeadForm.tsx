import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lead } from "@/types/crm";
import { useLeadStatuses } from "@/hooks/useLeadStatuses";
import { useLeadSources } from "@/hooks/useLeadSources";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { supabase } from "@/services/supabase/client";
import { Check, ChevronsUpDown, Mail } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Agent {
  id: string;
  name: string;
  email?: string;
}

interface LeadFormProps {
  lead: Lead;
  editedLead: Partial<Lead>;
  setEditedLead: (lead: Partial<Lead>) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'edit' | 'create';
}

export const LeadForm: React.FC<LeadFormProps> = ({
  lead,
  editedLead,
  setEditedLead,
  onSave,
  onCancel,
  isLoading = false,
  mode
}) => {
  const { leadStatuses, getStatusColor } = useLeadStatuses();
  const { leadSources, getSourceColor } = useLeadSources();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [openStatusCombobox, setOpenStatusCombobox] = useState(false);
  const [openSourceCombobox, setOpenSourceCombobox] = useState(false);
  const [openAgentCombobox, setOpenAgentCombobox] = useState(false);
  
  // Estado local para controlar o status selecionado na UI
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(lead.status);
  
  // State for Lead Source
  const [selectedSource, setSelectedSource] = useState<string | undefined>(
    lead?.source || undefined
  );
  const [selectedSourceName, setSelectedSourceName] = useState<string | undefined>(
    lead?.source || undefined
  );
  
  const [sourceOpen, setSourceOpen] = useState(false);
  
  // Atualizar o status selecionado quando editedLead ou lead mudar
  useEffect(() => {
    setSelectedStatus(editedLead.status || lead.status);
  }, [editedLead.status, lead.status]);
  
  // Set initial values when lead or leadSources change
  useEffect(() => {
    if (lead) {
      console.log('DEBUG: Setting initial source from lead:', lead.source);
      setSelectedSource(lead.source);
      setSelectedSourceName(lead.source);
    }
  }, [lead]);
  
  // Debug logs
  useEffect(() => {
    console.log('DEBUG: Source state:', {
      selectedSource,
      selectedSourceName,
      leadSource: lead?.source
    });
  }, [selectedSource, selectedSourceName, lead?.source]);

  useEffect(() => {
    const fetchAgents = async () => {
      setIsLoadingAgents(true);
      try {
        const { data, error } = await supabase
          .from('agents')
          .select('id, name, email')
          .order('name');

        if (error) throw error;
        setAgents(data || []);
      } catch (err) {
        console.error('Error loading agents:', err);
      } finally {
        setIsLoadingAgents(false);
      }
    };

    fetchAgents();
  }, []);

  const handleChange = (
    field: string,
    value: string | number | boolean | null
  ) => {
    console.log(`**DEBUG** LeadForm.handleChange: field=${field}, value=${value}`);
    
    // Atualiza diretamente o editedLead com a mudança atual
    const updatedLead = { ...editedLead, [field]: value };
    
    // Se a mudança for no status, atualiza o estado local também
    if (field === 'status') {
      setSelectedStatus(value as string);
    }
    
    // Se a mudança for no sourceId, atualiza o estado local da fonte
    if (field === 'sourceId') {
      if (value) {
        // Encontra o nome da fonte pelo ID para exibição
        const sourceObj = leadSources.find(s => s.id === value);
        if (sourceObj) {
          setSelectedSource(sourceObj.name);
          setSelectedSourceName(sourceObj.name);
        }
      } else {
        // Se sourceId foi limpo, limpa também o nome da fonte
        setSelectedSource(undefined);
        setSelectedSourceName(undefined);
      }
    }
    
    // Atualiza o estado editedLead no componente pai
    setEditedLead(updatedLead);
  };
  
  // Log para verificar o valor atual do status no início da renderização
  console.log(`**DEBUG** LeadForm render:`, {
    currentStatus: editedLead.status || lead.status,
    currentSource: editedLead.source || lead.source,
    currentSourceId: editedLead.sourceId || lead.sourceId,
    selectedSource
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={editedLead.name || lead.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Lead name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={editedLead.email !== undefined && editedLead.email !== null ? editedLead.email : lead.email || ""}
            onChange={(e) => handleChange("email", e.target.value || null)}
            placeholder="Lead email (optional)"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={editedLead.phone || lead.phone || ""}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="Lead phone"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            value={editedLead.company || lead.company || ""}
            onChange={(e) => handleChange("company", e.target.value)}
            placeholder="Company name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={editedLead.website || lead.website || ""}
            onChange={(e) => handleChange("website", e.target.value)}
            placeholder="Company website"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={editedLead.address || lead.address || ""}
            onChange={(e) => handleChange("address", e.target.value)}
            placeholder="Lead address"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            value={editedLead.position || lead.position || ""}
            onChange={(e) => handleChange("position", e.target.value)}
            placeholder="Lead position"
          />
        </div>

        {/* Status Selection */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Popover open={openStatusCombobox} onOpenChange={setOpenStatusCombobox}>
            <PopoverTrigger asChild>
              <Button
                id="status"
                variant="outline"
                role="combobox"
                aria-expanded={openStatusCombobox}
                className="justify-between w-full font-normal text-left"
                onClick={() => {
                  console.log(`**DEBUG** Status button clicked. Current status: ${selectedStatus}`);
                }}
              >
                {selectedStatus ? (
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: getStatusColor(selectedStatus) }}
                    />
                    {selectedStatus}
                  </div>
                ) : (
                  "Select status"
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search status..." />
                <CommandList>
                  <CommandEmpty>No status found.</CommandEmpty>
                  <CommandGroup>
                    {leadStatuses.map((status) => (
                      <CommandItem
                        key={status.id}
                        value={status.name}
                        onSelect={() => {
                          console.log(`**DEBUG** Status selected: ${status.name}, ID: ${status.id}`);
                          handleChange("status", status.name);
                          handleChange("statusId", status.id);
                          setSelectedStatus(status.name);
                          setOpenStatusCombobox(false);
                        }}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: status.color || getStatusColor(status.name) }}
                          />
                          <span>{status.name}</span>
                          {(selectedStatus === status.name) && (
                            <Check className="ml-auto h-4 w-4" />
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Source Selection */}
        <div className="space-y-2">
          <Label htmlFor="source">Source</Label>
          <Popover open={openSourceCombobox} onOpenChange={setOpenSourceCombobox}>
            <PopoverTrigger asChild>
              <Button
                id="source"
                variant="outline"
                role="combobox"
                aria-expanded={openSourceCombobox}
                className="justify-between w-full font-normal text-left"
              >
                {selectedSource ? (
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: getSourceColor(selectedSource) }}
                    />
                    {selectedSource}
                  </div>
                ) : (
                  "Not Provided"
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search source..." />
                <CommandList>
                  <CommandEmpty>No source found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value=""
                      onSelect={() => {
                        handleChange("sourceId", null);
                        setSelectedSource(undefined);
                        setOpenSourceCombobox(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          !selectedSource ? "opacity-100" : "opacity-0"
                        )}
                      />
                      Not Provided
                    </CommandItem>
                    {leadSources.map((source) => (
                      <CommandItem
                        key={source.id}
                        value={source.name}
                        onSelect={() => {
                          console.log(`**DEBUG** Source selected: ${source.name}, ID: ${source.id}`);
                          handleChange("sourceId", source.id);
                          setSelectedSource(source.name);
                          setOpenSourceCombobox(false);
                        }}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: source.color }}
                          />
                          <span>{source.name}</span>
                          {(selectedSource === source.name) && (
                            <Check className="ml-auto h-4 w-4" />
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Agent Selection */}
        <div className="space-y-2">
          <Label htmlFor="agent">Assigned Agent</Label>
          <Popover open={openAgentCombobox} onOpenChange={setOpenAgentCombobox}>
            <PopoverTrigger asChild>
              <Button
                id="agent"
                variant="outline"
                role="combobox"
                aria-expanded={openAgentCombobox}
                className="justify-between w-full font-normal text-left"
              >
                {editedLead.agentId ? 
                  agents.find(a => a.id === editedLead.agentId)?.name || "Unknown agent" : 
                  "Not assigned"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search agent..." />
                <CommandList>
                  <CommandEmpty>No agent found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="Not assigned"
                      onSelect={() => {
                        handleChange("agentId", null);
                        setOpenAgentCombobox(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          !editedLead.agentId ? "opacity-100" : "opacity-0"
                        )}
                      />
                      Not assigned
                    </CommandItem>
                    {agents.map((agent) => (
                      <CommandItem
                        key={agent.id}
                        value={agent.name}
                        onSelect={() => {
                          handleChange("agentId", agent.id);
                          setOpenAgentCombobox(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            editedLead.agentId === agent.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <div className="font-medium">{agent.name}</div>
                          {agent.email && (
                            <div className="text-xs text-muted-foreground flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {agent.email}
                            </div>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}; 