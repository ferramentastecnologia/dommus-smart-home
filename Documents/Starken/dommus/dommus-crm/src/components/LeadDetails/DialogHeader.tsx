import React from "react";
import { Lead } from "@/types/crm";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Edit, Loader2 } from "lucide-react";
import { useLeadStatuses } from "@/hooks/useLeadStatuses";

interface DialogHeaderProps {
  lead: Lead;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  handleSaveEdit: () => void;
  onOpenChange: (open: boolean) => void;
  handleExpandToFullPage?: () => void;
  isLoading?: boolean;
}

export function DialogHeader({ 
  lead, 
  isEditing, 
  setIsEditing, 
  handleSaveEdit, 
  onOpenChange,
  isLoading = false
}: DialogHeaderProps) {
  const { getStatusColor } = useLeadStatuses();
  
  return (
    <div className="flex items-center space-x-2 mb-4 border-b pb-3">
      <Button 
        variant="ghost" 
        size="sm"
        className="rounded-full hover:bg-gray-100" 
        onClick={() => onOpenChange(false)}
        disabled={isLoading}
      >
        <ChevronLeft size={20} />
      </Button>
      <h2 className="text-2xl font-bold flex items-center">
        {lead.name}
        {lead.company && (
          <span className="ml-2 text-sm text-muted-foreground font-normal">
            {lead.company}
          </span>
        )}
        <span 
          className="ml-3 h-2 w-2 rounded-full" 
          style={{ backgroundColor: getStatusColor(lead.status) }}
        />
      </h2>
      
      <div className="ml-auto flex space-x-2">
        {!isEditing ? (
          <Button 
            variant="ghost" 
            size="sm"
            className="rounded-full hover:bg-gray-100 flex items-center gap-1"
            onClick={() => setIsEditing(true)}
            disabled={isLoading}
          >
            <Edit size={16} /> 
            <span className="text-sm font-normal ml-1">Edit</span>
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="rounded-full hover:bg-red-50 hover:text-red-600 text-gray-500"
              onClick={() => setIsEditing(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="rounded-full hover:bg-green-50 hover:text-green-600 text-gray-700 flex items-center gap-1"
              onClick={handleSaveEdit}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <span className="text-sm font-medium">Save</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
