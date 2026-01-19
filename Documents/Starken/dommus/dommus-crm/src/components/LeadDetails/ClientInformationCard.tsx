import React from "react";
import { Lead } from "@/types/crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mail, Phone, Building2, Briefcase, MapPin, Globe } from "lucide-react";
import { useLeadStatuses } from "@/hooks/useLeadStatuses";

interface ClientInformationCardProps {
  lead: Lead;
  isEditing: boolean;
  editedLead: Partial<Lead>;
  setEditedLead: (lead: Partial<Lead>) => void;
}

export function ClientInformationCard({ 
  lead, 
  isEditing, 
  editedLead, 
  setEditedLead 
}: ClientInformationCardProps) {
  const { getStatusColor } = useLeadStatuses();
  
  return (
    <Card className="shadow-sm border-t-4 transition-all hover:shadow-md"
      style={{ borderTopColor: getStatusColor(lead.status) }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between">
          Client Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEditing ? (
          <ReadOnlyClientInfo lead={lead} />
        ) : (
          <EditableClientInfo 
            editedLead={editedLead} 
            setEditedLead={setEditedLead} 
          />
        )}
      </CardContent>
    </Card>
  );
}

function ReadOnlyClientInfo({ lead }: { lead: Lead }) {
  return (
    <>
      <div className="flex items-start space-x-3">
        <div className="p-1.5 rounded-full bg-blue-50 text-blue-600">
          <Mail className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium">Email</p>
          <p className="text-sm text-muted-foreground">{lead.email}</p>
        </div>
      </div>
      
      <div className="flex items-start space-x-3">
        <div className="p-1.5 rounded-full bg-blue-50 text-blue-600">
          <Phone className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium">Phone</p>
          <p className="text-sm text-muted-foreground">{lead.phone || "Not provided"}</p>
        </div>
      </div>
      
      <div className="flex items-start space-x-3">
        <div className="p-1.5 rounded-full bg-blue-50 text-blue-600">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium">Company</p>
          <p className="text-sm text-muted-foreground">{lead.company || "Not provided"}</p>
        </div>
      </div>
      
      <div className="flex items-start space-x-3">
        <div className="p-1.5 rounded-full bg-blue-50 text-blue-600">
          <Briefcase className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium">Position</p>
          <p className="text-sm text-muted-foreground">{lead.position || "Not provided"}</p>
        </div>
      </div>
      
      <div className="flex items-start space-x-3">
        <div className="p-1.5 rounded-full bg-blue-50 text-blue-600">
          <MapPin className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium">Address</p>
          <p className="text-sm text-muted-foreground">{lead.address || "Not provided"}</p>
        </div>
      </div>
      
      <div className="flex items-start space-x-3">
        <div className="p-1.5 rounded-full bg-blue-50 text-blue-600">
          <Globe className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium">Website</p>
          <p className="text-sm text-muted-foreground">{lead.website || "Not provided"}</p>
        </div>
      </div>
    </>
  );
}

function EditableClientInfo({ 
  editedLead, 
  setEditedLead 
}: { 
  editedLead: Partial<Lead>; 
  setEditedLead: (lead: Partial<Lead>) => void; 
}) {
  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <Input 
          value={editedLead.email || ''} 
          onChange={(e) => setEditedLead({...editedLead, email: e.target.value})}
          className="focus:ring-2 focus:ring-blue-200"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Phone</label>
        <Input 
          value={editedLead.phone || ''} 
          onChange={(e) => setEditedLead({...editedLead, phone: e.target.value})}
          className="focus:ring-2 focus:ring-blue-200"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Company</label>
        <Input 
          value={editedLead.company || ''} 
          onChange={(e) => setEditedLead({...editedLead, company: e.target.value})}
          className="focus:ring-2 focus:ring-blue-200"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Position</label>
        <Input 
          value={editedLead.position || ''} 
          onChange={(e) => setEditedLead({...editedLead, position: e.target.value})}
          className="focus:ring-2 focus:ring-blue-200"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Address</label>
        <Input 
          value={editedLead.address || ''} 
          onChange={(e) => setEditedLead({...editedLead, address: e.target.value})}
          className="focus:ring-2 focus:ring-blue-200"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Website</label>
        <Input 
          value={editedLead.website || ''} 
          onChange={(e) => setEditedLead({...editedLead, website: e.target.value})}
          className="focus:ring-2 focus:ring-blue-200"
        />
      </div>
    </>
  );
}
