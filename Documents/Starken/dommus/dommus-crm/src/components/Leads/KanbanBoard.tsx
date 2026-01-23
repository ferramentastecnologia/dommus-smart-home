import React, { useState } from "react";
import { Lead, LeadStatus } from "@/types/crm";
import { LeadCard } from "./LeadCard";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDrag, useDrop } from 'react-dnd';
import { useLeadStatuses } from "@/hooks/useLeadStatuses";
import { ColumnSort } from "@/components/ui/column-sort";

// Type definition for drag item
type DragItem = {
  type: string;
  id: string;
  originalStatus: LeadStatus;
};

interface DraggableLeadCardProps {
  lead: Lead;
  onClick: () => void;
  onDrop: (id: string, status: LeadStatus) => void;
}

function DraggableLeadCard({ lead, onClick, onDrop }: DraggableLeadCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'LEAD',
    item: () => ({
      type: 'LEAD',
      id: lead.id,
      originalStatus: lead.status
    } as DragItem),
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div 
      ref={drag} 
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="cursor-grab active:cursor-grabbing"
    >
      <LeadCard lead={lead} onClick={onClick} />
    </div>
  );
}

interface KanbanColumnProps {
  title: string;
  leads: Lead[];
  status: LeadStatus;
  onLeadClick: (lead: Lead) => void;
  onAddClick?: () => void;
  onDrop: (id: string, status: LeadStatus) => void;
  className?: string;
  color?: string;
  backgroundColor?: string;
  sortOption: string;
  onSortChange: (value: string) => void;
}

function KanbanColumn({
  title,
  leads,
  status,
  onLeadClick,
  onAddClick,
  onDrop,
  className,
  color,
  backgroundColor,
  sortOption,
  onSortChange
}: KanbanColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'LEAD',
    drop: (item: DragItem) => {
      if (item.originalStatus !== status) {
        onDrop(item.id, status);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  // Sort leads based on the selected option
  const sortedLeads = [...leads].sort((a, b) => {
    switch (sortOption) {
      case 'alpha_asc':
        return a.name.localeCompare(b.name);
      case 'alpha_desc':
        return b.name.localeCompare(a.name);
      case 'date_asc':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'date_desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'position_desc':
        return -1; // New items at top
      case 'position_asc':
      default:
        return 1; // New items at bottom
    }
  });

  const columnStyle = {
    backgroundColor: backgroundColor || 'var(--muted)',
    borderColor: color ? `${color}40` : 'var(--border)', // 40% opacity
  };

  const columnHoverStyle = {
    backgroundColor: color ? `${color}30` : 'var(--muted)', // 30% opacity
  };

  return (
    <div 
      ref={drop}
      className={cn(
        "flex flex-col rounded-lg border p-3 min-w-80 transition-colors duration-200", 
        isOver && "ring-2 ring-primary",
        className
      )}
      style={isOver ? {...columnStyle, ...columnHoverStyle} : columnStyle}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-foreground">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground bg-background/40 dark:bg-background/60 px-2 py-0.5 rounded-full">{leads.length}</span>
          <ColumnSort value={sortOption} onValueChange={onSortChange} />
          {onAddClick && (
            <Button variant="ghost" size="icon" onClick={onAddClick} className="h-6 w-6 hover:bg-background/30">
              <Plus size={16} />
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-3 overflow-auto flex-1">
        {sortedLeads.map((lead) => (
          <DraggableLeadCard 
            key={lead.id} 
            lead={lead} 
            onClick={() => onLeadClick(lead)}
            onDrop={onDrop}
          />
        ))}
      </div>
    </div>
  );
}

interface KanbanBoardProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onAddLead?: (status: LeadStatus) => void;
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
  searchQuery?: string;
}

export function KanbanBoard({ 
  leads, 
  onLeadClick, 
  onAddLead, 
  onStatusChange,
  searchQuery = ""
}: KanbanBoardProps) {
  const { defaultStatuses, leadStatuses, getStatusColor, getStatusBackgroundColor } = useLeadStatuses();
  
  // Track sort option for each column
  const [columnSortOptions, setColumnSortOptions] = useState<Record<string, string>>(() => {
    const options: Record<string, string> = {};
    defaultStatuses.forEach(status => {
      options[status] = 'position_asc'; // Default sort option
    });
    return options;
  });

  // Group leads by status
  const leadsByStatus: Record<string, Lead[]> = {};
  
  // Initialize with all statuses from configuration
  defaultStatuses.forEach(status => {
    leadsByStatus[status] = [];
  });
  
  // Add leads to their respective status groups
  leads.forEach(lead => {
    if (!lead) {
      console.warn("Encountered null/undefined lead in KanbanBoard");
      return;
    }

    if (!lead.status) {
      console.warn(`Lead ${lead.id} has no status property:`, lead);
      // Tentar colocar no status padrão "Novo" ou no primeiro status disponível
      if (leadsByStatus["Novo"]) {
        leadsByStatus["Novo"].push(lead);
      } else if (defaultStatuses.length > 0 && leadsByStatus[defaultStatuses[0]]) {
        leadsByStatus[defaultStatuses[0]].push(lead);
      } else {
        if (!leadsByStatus['Outros']) {
          leadsByStatus['Outros'] = [];
        }
        leadsByStatus['Outros'].push(lead);
      }
      return;
    }

    if (leadsByStatus[lead.status]) {
      leadsByStatus[lead.status].push(lead);
    } else {
      // Status não reconhecido - colocar em "Outros"
      if (!leadsByStatus['Outros']) {
        leadsByStatus['Outros'] = [];
      }
      leadsByStatus['Outros'].push(lead);
    }
  });

  const handleDrop = (id: string, newStatus: LeadStatus) => {
    console.log(`KanbanBoard: Dropping lead ${id} to status ${newStatus}`);
    onStatusChange(id, newStatus);
  };

  const handleSortChange = (status: string, value: string) => {
    setColumnSortOptions(prev => ({
      ...prev,
      [status]: value
    }));
  };
  
  return (
    <div className="flex gap-6 overflow-x-auto pb-4 p-1 -mx-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
      {defaultStatuses.map(status => {
        const statusConfig = leadStatuses.find(s => s.name === status);
        const color = statusConfig?.color || getStatusColor(status);
        const bgColor = getStatusBackgroundColor(status);
        
        return (
          <KanbanColumn
            key={status}
            title={status}
            leads={leadsByStatus[status] || []}
            status={status}
            onLeadClick={onLeadClick}
            onAddClick={onAddLead ? () => onAddLead(status) : undefined}
            onDrop={handleDrop}
            color={color}
            backgroundColor={bgColor}
            sortOption={columnSortOptions[status]}
            onSortChange={(value) => handleSortChange(status, value)}
          />
        );
      })}
      
      {leadsByStatus['Outros'] && leadsByStatus['Outros'].length > 0 && (
        <KanbanColumn
          title="Outros"
          leads={leadsByStatus['Outros']}
          status={"Outros" as LeadStatus}
          onLeadClick={onLeadClick}
          onDrop={handleDrop}
          sortOption={columnSortOptions['Outros'] || 'position_asc'}
          onSortChange={(value) => handleSortChange('Outros', value)}
        />
      )}
    </div>
  );
}
