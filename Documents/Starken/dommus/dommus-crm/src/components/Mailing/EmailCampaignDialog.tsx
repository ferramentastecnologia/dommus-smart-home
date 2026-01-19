import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lead } from "@/types/crm";
import { useLeadStatuses } from "@/hooks/useLeadStatuses";

interface EmailCampaignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSendCampaign: (data: EmailCampaignData) => Promise<void>;
  leads: Lead[];
}

export interface EmailCampaignData {
  subject: string;
  content: string;
  recipients: string[]; // Array of lead IDs
}

export function EmailCampaignDialog({
  isOpen,
  onClose,
  onSendCampaign,
  leads,
}: EmailCampaignDialogProps) {
  const { leadStatuses, getStatusColor } = useLeadStatuses();
  const [isSending, setIsSending] = useState(false);
  
  // Form data
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [selectedTab, setSelectedTab] = useState<"byStatus" | "individual">("byStatus");
  
  // Status selection
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  
  // Individual lead selection
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  
  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);
  
  const resetForm = () => {
    setSubject("");
    setContent("");
    setSelectedTab("byStatus");
    setSelectedStatuses([]);
    setSelectedLeads([]);
  };
  
  // Calculate recipient count
  const getRecipientCount = () => {
    if (selectedTab === "byStatus") {
      return leads.filter(lead => 
        selectedStatuses.includes(lead.status) && 
        lead.email // Only count leads with email
      ).length;
    } else {
      return selectedLeads.length;
    }
  };
  
  // Handle status toggle
  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };
  
  // Handle lead toggle
  const toggleLead = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId)
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };
  
  // Handle select all statuses
  const handleSelectAllStatuses = () => {
    if (selectedStatuses.length === leadStatuses.length) {
      setSelectedStatuses([]);
    } else {
      setSelectedStatuses(leadStatuses.map(status => status.name));
    }
  };
  
  // Handle select all leads
  const handleSelectAllLeads = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.filter(lead => lead.email).map(lead => lead.id));
    }
  };
  
  // Handle send campaign
  const handleSendCampaign = async () => {
    try {
      if (!subject.trim()) {
        toast.error("Please provide an email subject");
        return;
      }
      
      if (!content.trim()) {
        toast.error("Please provide email content");
        return;
      }
      
      const recipientIds = selectedTab === "byStatus"
        ? leads
            .filter(lead => selectedStatuses.includes(lead.status) && lead.email)
            .map(lead => lead.id)
        : selectedLeads;
      
      if (recipientIds.length === 0) {
        toast.error("Please select at least one recipient");
        return;
      }
      
      setIsSending(true);
      
      await onSendCampaign({
        subject,
        content,
        recipients: recipientIds,
      });
      
      toast.success(`Campaign sent to ${recipientIds.length} leads`);
      onClose();
    } catch (error) {
      console.error("Error sending campaign:", error);
      toast.error("Failed to send campaign");
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] h-[80vh] max-h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Send Email Campaign</DialogTitle>
          <DialogDescription>
            Create a one-time email campaign to send to multiple leads at once.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
          <div>
            <Label htmlFor="subject">Email Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Your campaign subject"
            />
          </div>
          
          <div>
            <Label htmlFor="content">Email Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="<p>Hello {{name}},</p><p>Your message here...</p>"
              className="h-24 min-h-[6rem]"
            />
            <p className="text-xs text-muted-foreground">
              Use HTML for formatting. Available variables: {'{{name}}'}, {'{{company}}'}, {'{{email}}'}
            </p>
          </div>
          
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            <Label>Select Recipients</Label>
            <Tabs 
              value={selectedTab} 
              onValueChange={(value) => setSelectedTab(value as "byStatus" | "individual")}
              className="w-full flex-1 flex flex-col min-h-0"
            >
              <TabsList className="w-full">
                <TabsTrigger value="byStatus" className="flex-1">By Lead Status</TabsTrigger>
                <TabsTrigger value="individual" className="flex-1">Select Individual Leads</TabsTrigger>
              </TabsList>
              
              <div className="flex-1 overflow-hidden">
                <TabsContent value="byStatus" className="h-full">
                  <div className="space-y-4 h-full">
                    <div className="flex justify-between items-center">
                      <p className="text-sm">Select lead statuses to include</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleSelectAllStatuses}
                      >
                        {selectedStatuses.length === leadStatuses.length ? "Deselect All" : "Select All"}
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {leadStatuses.map(status => (
                        <Badge
                          key={status.id}
                          variant={selectedStatuses.includes(status.name) ? "default" : "outline"}
                          className="cursor-pointer"
                          style={{
                            backgroundColor: selectedStatuses.includes(status.name) ? getStatusColor(status.name) : "transparent",
                            color: selectedStatuses.includes(status.name) ? "white" : getStatusColor(status.name),
                            borderColor: getStatusColor(status.name)
                          }}
                          onClick={() => toggleStatus(status.name)}
                        >
                          {status.name}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <p className="text-sm">
                        {getRecipientCount()} leads will receive this email
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="individual" className="h-full">
                  <div className="flex flex-col h-full space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm">Select individual leads</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleSelectAllLeads}
                      >
                        {selectedLeads.length === leads.filter(l => l.email).length ? "Deselect All" : "Select All"}
                      </Button>
                    </div>
                    
                    <div className="border rounded-md flex-1 overflow-y-auto" style={{ height: "250px" }}>
                      <div className="p-2">
                        {leads.map(lead => (
                          <div key={lead.id} className="flex items-center space-x-2 p-2 rounded hover:bg-muted">
                            <Checkbox 
                              id={`lead-${lead.id}`} 
                              checked={selectedLeads.includes(lead.id)}
                              onCheckedChange={() => toggleLead(lead.id)}
                              disabled={!lead.email}
                            />
                            <div className="flex-1">
                              <Label
                                htmlFor={`lead-${lead.id}`}
                                className={`text-sm font-medium ${!lead.email ? 'text-muted-foreground' : ''}`}
                              >
                                {lead.name}
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                {lead.email || 'No email available'}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{
                                backgroundColor: getStatusColor(lead.status) + "20",
                                color: getStatusColor(lead.status),
                                borderColor: getStatusColor(lead.status)
                              }}
                            >
                              {lead.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm">
                        {selectedLeads.length} leads selected
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={handleSendCampaign} disabled={isSending || getRecipientCount() === 0}>
            {isSending ? "Sending..." : `Send to ${getRecipientCount()} Leads`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 