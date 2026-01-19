
import React from "react";
import { Lead } from "@/types/crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mail, Phone, Building2, Briefcase, MapPin, Globe, Tag, User, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface InfoTabProps {
  lead: Lead;
  isEditing: boolean;
  editedLead: Partial<Lead>;
  setEditedLead: (lead: Partial<Lead>) => void;
  agents: { id: string; name: string }[];
}

export function InfoTab({ lead, isEditing, editedLead, setEditedLead, agents }: InfoTabProps) {
  // Function to format date
  const formatDate = (date: Date) => {
    return format(date, "dd 'of' MMMM 'of' yyyy 'at' HH:mm", { locale: ptBR });
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Client Information */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Client Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isEditing ? (
            <>
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-base text-muted-foreground">{lead.email}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-base text-muted-foreground">{lead.phone || "Not provided"}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Building2 className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Company</p>
                  <p className="text-base text-muted-foreground">{lead.company || "Not provided"}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Briefcase className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Position</p>
                  <p className="text-base text-muted-foreground">{lead.position || "Not provided"}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-base text-muted-foreground">{lead.address || "Not provided"}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Globe className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Website</p>
                  <p className="text-base text-muted-foreground">{lead.website || "Not provided"}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input 
                  value={editedLead.email || ''} 
                  onChange={(e) => setEditedLead({...editedLead, email: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefone</label>
                <Input 
                  value={editedLead.phone || ''} 
                  onChange={(e) => setEditedLead({...editedLead, phone: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Empresa</label>
                <Input 
                  value={editedLead.company || ''} 
                  onChange={(e) => setEditedLead({...editedLead, company: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Cargo</label>
                <Input 
                  value={editedLead.position || ''} 
                  onChange={(e) => setEditedLead({...editedLead, position: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Endereço</label>
                <Input 
                  value={editedLead.address || ''} 
                  onChange={(e) => setEditedLead({...editedLead, address: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Website</label>
                <Input 
                  value={editedLead.website || ''} 
                  onChange={(e) => setEditedLead({...editedLead, website: e.target.value})}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Status and Details */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Status and Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start space-x-3">
            <Tag className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Status</p>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                  ${lead.status === 'New' ? 'bg-blue-100 text-blue-800' : 
                  lead.status === 'Qualified' ? 'bg-emerald-100 text-emerald-800' : 
                  lead.status === 'Proposal' ? 'bg-amber-100 text-amber-800' : 
                  lead.status === 'Closed' ? 'bg-green-100 text-green-800' : 
                  'bg-red-100 text-red-800'}`}
                >
                  {lead.status}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <User className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Responsible</p>
              <p className="text-base text-muted-foreground">
                {agents.find(a => a.id === lead.agentId)?.name || "Not assigned"}
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Creation date</p>
              <p className="text-base text-muted-foreground">{formatDate(lead.createdAt)}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Last interaction</p>
              <p className="text-base text-muted-foreground">
                {lead.lastInteraction ? formatDate(lead.lastInteraction) : "No interactions"}
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Tag className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Source</p>
              <p className="text-base text-muted-foreground">{lead.source || "Not provided"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
