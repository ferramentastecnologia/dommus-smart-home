import React, { useState } from "react";
import { Lead, LeadStatus } from "@/types/crm";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  ArrowUpDown, Building, Mail, Phone, Calendar, MoreHorizontal, 
  ChevronDown, ChevronRight, Pencil, Trash2
} from "lucide-react";
import { useDrag } from "react-dnd";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogHeader, AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useLeadStatuses } from "@/hooks/useLeadStatuses";

interface LeadsListViewProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
  searchQuery?: string;
  onEditLead?: (lead: Lead) => void;
  onDeleteLead?: (leadId: string) => void;
}

type SortField = 'name' | 'email' | 'company' | 'phone' | 'lastInteraction';
type SortDirection = 'asc' | 'desc';

export function LeadsListView({ 
  leads, 
  onLeadClick, 
  onStatusChange,
  searchQuery = "",
  onEditLead = () => {},
  onDeleteLead = () => {}
}: LeadsListViewProps) {
  const { defaultStatuses, getStatusColor, getStatusBackgroundColor, leadStatuses } = useLeadStatuses();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

  // Filter leads by search query
  const filteredLeads = leads.filter(lead => 
    searchQuery === "" ||
    lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (lead.company && lead.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (lead.phone && lead.phone.includes(searchQuery)) ||
    lead.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort leads
  const sortedLeads = [...filteredLeads];
  if (sortField) {
    sortedLeads.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle dates separately
      if (sortField === 'lastInteraction') {
        const aDate = a.lastInteraction ? new Date(a.lastInteraction).getTime() : 0;
        const bDate = b.lastInteraction ? new Date(b.lastInteraction).getTime() : 0;
        return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
      }
      
      // Handle null/undefined values
      if (aValue === undefined || aValue === null) aValue = '';
      if (bValue === undefined || bValue === null) bValue = '';
      
      // Convert to string for string comparison
      const strA = String(aValue).toLowerCase();
      const strB = String(bValue).toLowerCase();
      
      if (sortDirection === 'asc') {
        return strA.localeCompare(strB);
      } else {
        return strB.localeCompare(strA);
      }
    });
  }

  // Group leads by status
  const leadsByStatus: Record<string, Lead[]> = {};
  
  // Initialize groups with configured statuses
  defaultStatuses.forEach(status => {
    leadsByStatus[status] = [];
  });
  
  // Add an 'Other' category for unrecognized statuses
  leadsByStatus['Other'] = [];
  
  // Assign leads to their status groups
  sortedLeads.forEach(lead => {
    if (leadsByStatus[lead.status]) {
      leadsByStatus[lead.status].push(lead);
    } else {
      leadsByStatus['Other'].push(lead);
    }
  });

  const toggleCollapse = (status: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle sort direction if the same field is clicked
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and reset direction to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const confirmDelete = (lead: Lead) => {
    setLeadToDelete(lead);
  };

  const handleDeleteConfirmed = () => {
    if (leadToDelete) {
      onDeleteLead(leadToDelete.id);
      setLeadToDelete(null);
    }
  };

  return (
    <>
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 py-3 px-4 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
          <div className="col-span-1 flex items-center justify-center max-w-[40px]">
            <span>#</span>
          </div>
          <div className="col-span-2 flex items-center gap-2 pl-2">
            <span>Name</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 text-gray-400"
              onClick={() => handleSort('name')}
            >
              <ArrowUpDown className="h-3 w-3" />
            </Button>
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <span>Email</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 text-gray-400"
              onClick={() => handleSort('email')}
            >
              <ArrowUpDown className="h-3 w-3" />
            </Button>
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <span>Phone</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 text-gray-400"
              onClick={() => handleSort('phone')}
            >
              <ArrowUpDown className="h-3 w-3" />
            </Button>
          </div>
          <div className="col-span-1 flex items-center gap-2">
            <span>Company</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 text-gray-400"
              onClick={() => handleSort('company')}
            >
              <ArrowUpDown className="h-3 w-3" />
            </Button>
          </div>
          <div className="col-span-1 flex items-center gap-2">
            <span>Status</span>
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <span>Last Interaction</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 text-gray-400"
              onClick={() => handleSort('lastInteraction')}
            >
              <ArrowUpDown className="h-3 w-3" />
            </Button>
          </div>
          <div className="col-span-1 flex justify-end">
            <span>Actions</span>
          </div>
        </div>

        {/* Table Body */}
        <div>
          {filteredLeads.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No leads found</p>
            </div>
          ) : (
            // Use dynamic status order from the hook
            [...defaultStatuses, 'Other'].map(status => {
              const leadsInStatus = leadsByStatus[status];
              if (!leadsInStatus || leadsInStatus.length === 0) return null;
              
              const isCollapsed = collapsedGroups[status] || false;
              const statusColor = getStatusColor(status);
              const statusBgColor = getStatusBackgroundColor(status);
              
              const headerStyle = {
                backgroundColor: `${statusBgColor}`,
              };
              
              const dotStyle = {
                backgroundColor: statusColor,
              };
              
              return (
                <div key={status} className="border-b border-gray-100 last:border-b-0">
                  {/* Status Group Header */}
                  <div 
                    className="flex items-center px-4 py-2.5 cursor-pointer select-none hover:bg-opacity-80 transition-colors"
                    style={headerStyle}
                    onClick={() => toggleCollapse(status)}
                  >
                    <div className="flex items-center gap-1.5">
                      {isCollapsed ? 
                        <ChevronRight className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                      <div className="w-2.5 h-2.5 rounded-full" style={dotStyle}></div>
                      <span className="font-medium ml-1.5">{status}</span>
                      <span className="ml-2 text-gray-500 text-xs">({leadsInStatus.length})</span>
                    </div>
                  </div>
                  
                  {/* Leads in this status */}
                  {!isCollapsed && (
                    <div className="divide-y divide-gray-100">
                      {leadsInStatus.map((lead, index) => (
                        <LeadRow 
                          key={lead.id} 
                          lead={lead} 
                          rowNumber={index + 1}
                          onLeadClick={onLeadClick}
                          onStatusChange={onStatusChange}
                          onEditLead={onEditLead}
                          onDeleteLead={confirmDelete}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!leadToDelete} onOpenChange={(open) => !open && setLeadToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the lead "{leadToDelete?.name}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteConfirmed}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface LeadRowProps {
  lead: Lead;
  rowNumber: number;
  onLeadClick: (lead: Lead) => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (lead: Lead) => void;
}

function LeadRow({ 
  lead, 
  rowNumber, 
  onLeadClick, 
  onStatusChange,
  onEditLead,
  onDeleteLead
}: LeadRowProps) {
  const { defaultStatuses, getStatusColor, getStatusBackgroundColor } = useLeadStatuses();
  
  const [{ isDragging }, drag] = useDrag({
    type: 'LEAD',
    item: { id: lead.id, type: 'LEAD', originalStatus: lead.status },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  });
  
  // Get status style dynamically
  const getStatusStyle = (status: string) => {
    return {
      backgroundColor: getStatusBackgroundColor(status),
      color: getStatusColor(status),
      border: `1px solid ${getStatusColor(status)}40`
    };
  };
  
  const statusStyle = getStatusStyle(lead.status);
  
  return (
    <div 
      ref={drag}
      className={cn(
        "grid grid-cols-12 gap-2 py-3 px-4 hover:bg-muted/30 cursor-pointer transition-colors",
        isDragging ? "opacity-50" : "opacity-100"
      )}
      onClick={() => onLeadClick(lead)}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="col-span-1 flex items-center justify-center text-gray-400 font-mono max-w-[40px]">
        {rowNumber}
      </div>
      
      <div className="col-span-2 flex items-center gap-2 pl-2">
        <span className="font-medium truncate">{lead.name}</span>
      </div>
      
      <div className="col-span-2 flex items-center">
        <span className="truncate text-sm text-gray-600">{lead.email}</span>
      </div>
      
      <div className="col-span-2 flex items-center">
        <span className="truncate text-sm text-gray-600">{lead.phone || "—"}</span>
      </div>
      
      <div className="col-span-1 flex items-center">
        <span className="truncate text-sm text-gray-600">{lead.company || "—"}</span>
      </div>
      
      <div className="col-span-1 flex items-center">
        <Badge style={statusStyle} className="text-xs font-normal">
          {lead.status}
        </Badge>
      </div>
      
      <div className="col-span-2 flex items-center">
        <span className="text-sm text-gray-600">
          {lead.lastInteraction 
            ? format(new Date(lead.lastInteraction), "MMM d, yyyy") 
            : "No interaction"}
        </span>
      </div>
      
      <div className="col-span-1 flex justify-end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-700">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEditLead(lead)}>
              <div className="flex items-center gap-2">
                <Pencil className="h-4 w-4 text-blue-500" />
                <span>Edit</span>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuItem disabled className="text-xs font-semibold text-gray-500">
              Change Status
            </DropdownMenuItem>
            {defaultStatuses.map((status) => (
              <DropdownMenuItem 
                key={status}
                onClick={() => onStatusChange(lead.id, status)}
                disabled={lead.status === status}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: getStatusColor(status) }}
                  ></div>
                  <span>{status}</span>
                </div>
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              className="text-red-600"
              onClick={() => onDeleteLead(lead)}
            >
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
} 