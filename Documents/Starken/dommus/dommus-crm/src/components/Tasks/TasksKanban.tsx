import React, { useState } from "react";
import { Task, TaskStatus, TaskPriority } from "@/types/crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TaskCard } from "./TaskCard";
import { useDrop } from "react-dnd";
import { useTaskStatuses } from "@/hooks/useTaskStatuses";
import { cn } from "@/lib/utils";
import { ColumnSort } from "@/components/ui/column-sort";

interface TasksKanbanProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onPriorityChange: (taskId: string, priority: TaskPriority) => void;
  onAssigneeChange: (taskId: string, assignee: string) => void;
  onDateChange: (taskId: string, date: Date | null) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskEdit?: (task: Task) => void;
  searchQuery?: string;
  statusFilter?: string;
  priorityFilter?: string;
  teamMembers?: string[];
}

interface StatusColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: () => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onPriorityChange: (taskId: string, priority: TaskPriority) => void;
  onAssigneeChange: (taskId: string, assignee: string) => void;
  onDateChange: (taskId: string, date: Date | null) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskEdit?: (task: Task) => void;
  teamMembers?: string[];
  color?: string;
  backgroundColor?: string;
  sortOption: string;
  onSortChange: (value: string) => void;
}

function StatusColumn({ 
  status, 
  tasks, 
  onTaskClick, 
  onAddTask, 
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  onDateChange,
  onTaskDelete,
  onTaskEdit,
  teamMembers = [],
  color,
  backgroundColor,
  sortOption,
  onSortChange
}: StatusColumnProps) {
  const { getStatusColor, getStatusBackgroundColor } = useTaskStatuses();
  
  const [{ isOver }, drop] = useDrop({
    accept: 'TASK',
    drop: (item: { id: string }) => {
      onStatusChange(item.id, status);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver()
    })
  });

  // Sort tasks based on the selected option
  const sortedTasks = [...tasks].sort((a, b) => {
    switch (sortOption) {
      case 'alpha_asc':
        return a.title.localeCompare(b.title);
      case 'alpha_desc':
        return b.title.localeCompare(a.title);
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

  // Use provided background color from the pipeline settings
  const statusColor = color || getStatusColor(status);
  const columnBgColor = backgroundColor || getStatusBackgroundColor(status);
  
  const columnStyle = {
    backgroundColor: columnBgColor || 'var(--muted)',
    borderColor: `${statusColor}40` // 40% opacity
  };

  const columnHoverStyle = {
    backgroundColor: `${statusColor}30` // 30% opacity
  };

  return (
    <div
      ref={drop}
      className={cn(
        "flex flex-col rounded-lg border p-3 min-w-80 transition-colors duration-200",
        isOver && "ring-2 ring-primary"
      )}
      style={isOver ? {...columnStyle, ...columnHoverStyle} : columnStyle}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-foreground">{status}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground bg-background/40 dark:bg-background/60 px-2 py-0.5 rounded-full">{tasks.length}</span>
          <ColumnSort value={sortOption} onValueChange={onSortChange} />
          <Button variant="ghost" size="icon" onClick={onAddTask} className="h-6 w-6 hover:bg-background/30">
            <Plus size={16} />
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col gap-3 overflow-auto flex-1">
        {sortedTasks.map((task) => (
          <div 
            key={task.id} 
            className="hover:cursor-pointer"
            onClick={() => onTaskClick(task)}
          >
            <TaskCard 
              task={task} 
              onStatusChange={onStatusChange}
              onPriorityChange={onPriorityChange}
              onAssigneeChange={onAssigneeChange}
              onDateChange={onDateChange}
              onTaskDelete={onTaskDelete}
              onTaskEdit={onTaskEdit}
              teamMembers={teamMembers}
            />
          </div>
        ))}
        
        {tasks.length === 0 && (
          <div className="py-8 px-4 text-center border border-dashed rounded-md bg-background/50">
            <p className="text-sm text-muted-foreground">No tasks</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function TasksKanban({ 
  tasks, 
  onTaskClick, 
  onAddTask, 
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  onDateChange,
  onTaskDelete,
  onTaskEdit,
  searchQuery = "",
  statusFilter = "all",
  priorityFilter = "all",
  teamMembers = []
}: TasksKanbanProps) {
  const { defaultStatuses, taskStatuses, getStatusColor, getStatusBackgroundColor } = useTaskStatuses();
  
  // Track sort option for each column
  const [columnSortOptions, setColumnSortOptions] = useState<Record<string, string>>(() => {
    const options: Record<string, string> = {};
    defaultStatuses.forEach(status => {
      options[status] = 'position_asc'; // Default sort option
    });
    return options;
  });

  // Filter tasks according to search query and priority filter
  const filteredTasks = tasks.filter(task => {
    // Apply search filter across all fields
    const searchMatches = 
      searchQuery === "" ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.assignedTo && task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      task.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.priority.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply priority filter
    const priorityMatches = priorityFilter === "all" || task.priority === priorityFilter;
    
    return searchMatches && priorityMatches;
  });
  
  // Group tasks by status
  const tasksByStatus: Record<string, Task[]> = {};
  
  // Initialize with all statuses from configuration
  defaultStatuses.forEach(status => {
    tasksByStatus[status] = [];
  });
  
  // Add tasks to their respective status groups
  filteredTasks.forEach(task => {
    if (tasksByStatus[task.status]) {
      tasksByStatus[task.status].push(task);
    } else {
      // Handle case where a task has a status not in our configured list
      if (!tasksByStatus['Other']) {
        tasksByStatus['Other'] = [];
      }
      tasksByStatus['Other'].push(task);
    }
  });

  const handleSortChange = (status: string, value: string) => {
    setColumnSortOptions(prev => ({
      ...prev,
      [status]: value
    }));
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-4 p-1 -mx-1">
      {defaultStatuses.map(status => {
        // Skip rendering column if it's filtered out
        if (statusFilter !== "all" && status !== statusFilter) {
          return null;
        }
        
        const statusConfig = taskStatuses.find(s => s.name === status);
        const color = statusConfig?.color || getStatusColor(status);
        const bgColor = getStatusBackgroundColor(status);
        
        return (
          <StatusColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status] || []}
            onTaskClick={onTaskClick}
            onAddTask={() => onAddTask(status)}
            onStatusChange={onStatusChange}
            onPriorityChange={onPriorityChange}
            onAssigneeChange={onAssigneeChange}
            onDateChange={onDateChange}
            onTaskDelete={onTaskDelete}
            onTaskEdit={onTaskEdit}
            teamMembers={teamMembers}
            color={color}
            backgroundColor={bgColor}
            sortOption={columnSortOptions[status]}
            onSortChange={(value) => handleSortChange(status, value)}
          />
        );
      })}
      
      {tasksByStatus['Other'] && tasksByStatus['Other'].length > 0 && (
        <StatusColumn
          status="Other"
          tasks={tasksByStatus['Other']}
          onTaskClick={onTaskClick}
          onAddTask={() => onAddTask("Other" as TaskStatus)}
          onStatusChange={onStatusChange}
          onPriorityChange={onPriorityChange}
          onAssigneeChange={onAssigneeChange}
          onDateChange={onDateChange}
          onTaskDelete={onTaskDelete}
          onTaskEdit={onTaskEdit}
          teamMembers={teamMembers}
          sortOption={columnSortOptions['Other']}
          onSortChange={(value) => handleSortChange('Other', value)}
        />
      )}
    </div>
  );
} 