
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TasksHeaderProps {
  onAddTaskClick: () => void;
}

export function TasksHeader({ onAddTaskClick }: TasksHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
        <p className="text-muted-foreground">
          Manage your tasks and pending activities.
        </p>
      </div>
      
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <Button onClick={onAddTaskClick}>
          <Plus size={18} className="mr-2" />
          New Task
        </Button>
      </div>
    </div>
  );
}
