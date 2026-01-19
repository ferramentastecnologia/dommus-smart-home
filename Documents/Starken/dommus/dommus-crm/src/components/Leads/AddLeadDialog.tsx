import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lead, LeadStatus } from "@/types/crm";
import { supabase } from "@/services/supabase/client";
import { toast } from "sonner";
import { useLeadSources } from "@/hooks/useLeadSources";

interface AddLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddLead: (lead: Partial<Lead>) => Promise<void>;
}

export function AddLeadDialog({ open, onOpenChange, onAddLead }: AddLeadDialogProps) {
  const [newLead, setNewLead] = useState<Partial<Lead>>({
    name: "",
    email: "",
    phone: "",
    address: "",
    company: "",
    status: "New" as LeadStatus,
    sourceId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agents, setAgents] = useState<{ id: string; name: string }[]>([]);
  const { leadSources, isLoading: isLoadingSources } = useLeadSources();

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('id, name')
        .eq('status', 'active');

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (isSubmitting) {
      return;
    }
    
    if (!newLead.name) {
      toast.error('Name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddLead(newLead);
      setNewLead({
        name: "",
        email: "",
        phone: "",
        address: "",
        company: "",
        status: "New" as LeadStatus,
        sourceId: "",
      });
    } catch (error) {
      console.error('Error creating lead:', error);
      toast.error('Failed to create lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      // Only allow closing if not submitting
      if (!isSubmitting) {
        onOpenChange(open);
      }
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>
            Create a new lead in the system
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Name"
              value={newLead.name}
              onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={newLead.email}
              onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Input
              type="tel"
              placeholder="Phone"
              value={newLead.phone}
              onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Input
              placeholder="Address"
              value={newLead.address}
              onChange={(e) => setNewLead({ ...newLead, address: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Input
              placeholder="Company"
              value={newLead.company}
              onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              value={newLead.status}
              onValueChange={(value: LeadStatus) => setNewLead({ ...newLead, status: value })}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Qualified">Qualified</SelectItem>
                <SelectItem value="Proposal">Proposal</SelectItem>
                <SelectItem value="Negotiation">Negotiation</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
                <SelectItem value="Lost">Lost</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={newLead.sourceId}
              onValueChange={(value) => setNewLead({ ...newLead, sourceId: value })}
              disabled={isLoadingSources || isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_informed">Not informed</SelectItem>
                {leadSources.map((source) => (
                  <SelectItem key={source.id} value={source.name}>
                    <div className="flex items-center">
                      <div 
                        className="w-2 h-2 rounded-full mr-2" 
                        style={{ backgroundColor: source.color }}
                      />
                      {source.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select
              value={newLead.agentId || "unassigned"}
              onValueChange={(value) => setNewLead({ ...newLead, agentId: value === "unassigned" ? undefined : value })}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Assign to" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Not assigned</SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Add Lead'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
