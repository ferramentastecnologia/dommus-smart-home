import React, { useState } from "react";
import { Task, TaskStatus, TaskPriority } from "@/types/crm";
import { Badge } from "@/components/ui/badge";
import { format, isBefore, isValid, parse } from "date-fns";
import { 
  CircleCheck, 
  ArrowUpDown, 
  Calendar, 
  MoreHorizontal, 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2, 
  Trash2, 
  CalendarPlus,
  User,
  Edit
} from "lucide-react";
import { useDrag } from "react-dnd";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useTaskStatuses } from "@/hooks/useTaskStatuses";
import { generateGoogleCalendarLink } from "@/utils/calendar";

interface TasksListViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
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
  leads?: { id: string; name: string; email?: string }[];
}

type SortField = 'title' | 'assignedTo' | 'status' | 'priority' | 'dueDate';
type SortDirection = 'asc' | 'desc';

export function TasksListView({ 
  tasks, 
  onTaskClick, 
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  onDateChange,
  onTaskDelete,
  onTaskEdit,
  searchQuery = "",
  statusFilter = "all",
  priorityFilter = "all",
  teamMembers = [],
  leads = []
}: TasksListViewProps) {
  const { defaultStatuses, getStatusColor, getStatusBackgroundColor } = useTaskStatuses();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Priority colors for badges
  const priorityColors = {
    "Low": "bg-green-100 text-green-700 hover:bg-green-100",
    "Medium": "bg-amber-100 text-amber-700 hover:bg-amber-100",
    "High": "bg-red-100 text-red-700 hover:bg-red-100"
  };

  // Filter tasks by search query, status, and priority
  const filteredTasks = tasks.filter(task => {
    // Apply search filter across all fields
    const searchMatches = 
      searchQuery === "" ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.assignedTo && task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      task.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.priority.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply status filter
    const statusMatches = statusFilter === "all" || task.status === statusFilter;
    
    // Apply priority filter
    const priorityMatches = priorityFilter === "all" || task.priority === priorityFilter;
    
    return searchMatches && statusMatches && priorityMatches;
  });

  // Sort tasks based on current sort field and direction
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (!sortField) return 0;
    
    let valueA, valueB;
    
    switch (sortField) {
      case 'title':
        valueA = a.title.toLowerCase();
        valueB = b.title.toLowerCase();
        break;
      case 'assignedTo':
        valueA = a.assignedTo ? a.assignedTo.toLowerCase() : '';
        valueB = b.assignedTo ? b.assignedTo.toLowerCase() : '';
        break;
      case 'status':
        // Define order of statuses based on their configured order
        const statusOrder = defaultStatuses.reduce((acc, status, index) => {
          acc[status] = index;
          return acc;
        }, {} as Record<string, number>);
        
        valueA = statusOrder[a.status] ?? 999;
        valueB = statusOrder[b.status] ?? 999;
        break;
      case 'priority':
        // Define order of priorities
        const priorityOrder = { "Low": 0, "Medium": 1, "High": 2 };
        valueA = priorityOrder[a.priority];
        valueB = priorityOrder[b.priority];
        break;
      case 'dueDate':
        valueA = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        valueB = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        break;
      default:
        return 0;
    }
    
    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Handle sort click
  const handleSortClick = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Group tasks by status
  const tasksByStatus: Record<string, Task[]> = {};
  
  // Initialize groups using the configured statuses
  defaultStatuses.forEach(status => {
    tasksByStatus[status] = [];
  });
  
  // Assign tasks to their status groups
  sortedTasks.forEach(task => {
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

  const toggleCollapse = (status: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  // Sort icon component
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3" />;
    }
    
    return sortDirection === 'asc' ? 
      <ArrowUpDown className="h-3 w-3 text-blue-600" /> : 
      <ArrowUpDown className="h-3 w-3 text-blue-600 rotate-180" />;
  };

  return (
    <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 py-3 px-4 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
        <div className="col-span-1 flex items-center justify-center max-w-[40px]">
          <span>#</span>
        </div>
        <div 
          className="col-span-3 flex items-center gap-2 pl-2 cursor-pointer"
          onClick={() => handleSortClick('title')}
        >
          <span>Name</span>
          <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-400">
            <SortIcon field="title" />
          </Button>
        </div>
        <div 
          className="col-span-2 flex items-center gap-2 cursor-pointer"
          onClick={() => handleSortClick('assignedTo')}
        >
          <span>Assigned To</span>
          <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-400">
            <SortIcon field="assignedTo" />
          </Button>
        </div>
        <div 
          className="col-span-2 flex items-center gap-2 cursor-pointer"
          onClick={() => handleSortClick('status')}
        >
          <span>Status</span>
          <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-400">
            <SortIcon field="status" />
          </Button>
        </div>
        <div 
          className="col-span-1 flex items-center gap-2 cursor-pointer"
          onClick={() => handleSortClick('priority')}
        >
          <span>Priority</span>
          <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-400">
            <SortIcon field="priority" />
          </Button>
        </div>
        <div 
          className="col-span-2 flex items-center gap-2 cursor-pointer"
          onClick={() => handleSortClick('dueDate')}
        >
          <span>Due Date</span>
          <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-400">
            <SortIcon field="dueDate" />
          </Button>
        </div>
        <div className="col-span-1 flex justify-end">
          <span>Actions</span>
        </div>
      </div>

      {/* Table Body - Group by Status */}
      {Object.entries(tasksByStatus).map(([status, statusTasks]) => {
        // Skip empty statuses
        if (statusTasks.length === 0) return null;
        
        const isCollapsed = !!collapsedGroups[status];
        const statusColor = getStatusColor(status);
        const statusBgColor = getStatusBackgroundColor(status);
        
        // Status header style
        const headerStyle = {
          backgroundColor: statusBgColor,
        };
        
        // Status dot style
        const dotStyle = {
          backgroundColor: statusColor,
        };
        
        return (
          <div key={status} className="border-b border-gray-100 last:border-0">
            {/* Status Group Header */}
            <div 
              className="py-2 px-4 flex items-center gap-2 cursor-pointer hover:bg-opacity-80 transition-colors"
              style={headerStyle}
              onClick={() => toggleCollapse(status)}
            >
              <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-400 p-0">
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              <div className="w-2.5 h-2.5 rounded-full" style={dotStyle}></div>
              <span className="font-medium">{status}</span>
              <span className="text-sm text-muted-foreground">({statusTasks.length})</span>
            </div>
            
            {/* Status Tasks */}
            {!isCollapsed && (
              <div>
                {statusTasks.map((task, index) => (
                  <TaskRow 
                    key={task.id}
                    task={task}
                    rowNumber={index + 1}
                    onTaskClick={onTaskClick}
                    onStatusChange={onStatusChange}
                    onPriorityChange={onPriorityChange}
                    onAssigneeChange={onAssigneeChange}
                    onDateChange={onDateChange}
                    onTaskDelete={onTaskDelete}
                    onTaskEdit={onTaskEdit}
                    teamMembers={teamMembers}
                    leads={leads}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
      
      {/* Empty State */}
      {sortedTasks.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No tasks found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

interface TaskRowProps {
  task: Task;
  rowNumber: number;
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onPriorityChange: (taskId: string, priority: TaskPriority) => void;
  onAssigneeChange: (taskId: string, assignee: string) => void;
  onDateChange: (taskId: string, date: Date | null) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskEdit?: (task: Task) => void;
  teamMembers?: string[];
  leads?: { id: string; name: string; email?: string }[];
}

function TaskRow({ 
  task, 
  rowNumber, 
  onTaskClick, 
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  onDateChange,
  onTaskDelete,
  onTaskEdit,
  teamMembers = [],
  leads = []
}: TaskRowProps) {
  const { defaultStatuses, getStatusColor, getStatusBackgroundColor } = useTaskStatuses();
  
  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  });
  
  // Priority colors for badges
  const priorityColors = {
    "Low": "bg-green-100 text-green-700 hover:bg-green-100",
    "Medium": "bg-amber-100 text-amber-700 hover:bg-amber-100",
    "High": "bg-red-100 text-red-700 hover:bg-red-100"
  };
  
  // Get status style
  const getStatusStyle = (status: string) => {
    return {
      backgroundColor: getStatusBackgroundColor(status),
      color: getStatusColor(status),
    };
  };
  
  // Format due date
  const formattedDueDate = task.dueDate 
    ? format(new Date(task.dueDate), 'MMM dd, yyyy') 
    : "—";
  
  // Check if overdue
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  // Handler to stop propagation for interactive elements
  const handleInteractiveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  return (
    <div 
      ref={drag}
      className={cn(
        "grid grid-cols-12 gap-2 py-3 px-4 border-b border-border last:border-0 hover:bg-muted/30 transition-colors",
        isDragging ? "opacity-50" : "opacity-100"
      )}
      onClick={() => onTaskClick(task)}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="col-span-1 flex items-center justify-center text-sm text-gray-500 max-w-[40px]">
        {rowNumber}
      </div>
      
      <div className="col-span-3 flex items-center gap-2 pl-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{task.title}</p>
          {task.description && (
            <p className="text-xs text-muted-foreground truncate">{task.description}</p>
          )}
        </div>
      </div>
      
      {/* Assigned To Column */}
      <div className="col-span-2 flex items-center" data-interactive="true" onClick={handleInteractiveClick}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="cursor-pointer hover:bg-muted/50 p-1 rounded flex items-center gap-2">
              {task.assignedTo ? (
                <>
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                    {task.assignedTo.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm truncate">{task.assignedTo}</span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">Unassigned</span>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {teamMembers.length > 0 ? (
              <>
                {teamMembers.map((member) => (
                  <DropdownMenuItem 
                    key={member}
                    onClick={() => onAssigneeChange(task.id, member)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                        {member.charAt(0).toUpperCase()}
                      </div>
                      <span>{member}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
                
                {task.assignedTo && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onAssigneeChange(task.id, "")}>
                      <div className="flex items-center gap-2 text-gray-500">
                        <User className="h-4 w-4" />
                        <span>Remove assignment</span>
                      </div>
                    </DropdownMenuItem>
                  </>
                )}
              </>
            ) : (
              <DropdownMenuItem disabled>No team members available</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Status Column */}
      <div className="col-span-2 flex items-center" data-interactive="true" onClick={handleInteractiveClick}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Badge 
              className="truncate text-xs font-normal cursor-pointer"
              style={getStatusStyle(task.status)}
            >
              {task.status}
            </Badge>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {defaultStatuses.map(status => (
              <DropdownMenuItem 
                key={status}
                disabled={task.status === status}
                onClick={() => onStatusChange(task.id, status)}
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
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Priority Column */}
      <div className="col-span-1 flex items-center" data-interactive="true" onClick={handleInteractiveClick}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Badge className={cn(priorityColors[task.priority] || "", "cursor-pointer")}>
              {task.priority}
            </Badge>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem 
              onClick={() => onPriorityChange(task.id, "Low")}
              disabled={task.priority === "Low"}
            >
              <Badge className={priorityColors["Low"]}>Low</Badge>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onPriorityChange(task.id, "Medium")}
              disabled={task.priority === "Medium"}
            >
              <Badge className={priorityColors["Medium"]}>Medium</Badge>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onPriorityChange(task.id, "High")}
              disabled={task.priority === "High"}
            >
              <Badge className={priorityColors["High"]}>High</Badge>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Due Date Column */}
      <div className="col-span-2 flex items-center" data-interactive="true" onClick={handleInteractiveClick}>
        <Popover>
          <PopoverTrigger asChild>
            <span className={cn(
              "text-sm cursor-pointer hover:bg-muted/50 p-1 rounded flex items-center gap-1",
              isOverdue ? "text-red-600" : "text-gray-600"
            )}>
              <Calendar className="h-3 w-3" />
              {formattedDueDate}
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <CalendarComponent
              mode="single"
              selected={task.dueDate ? new Date(task.dueDate) : undefined}
              onSelect={(date) => onDateChange(task.id, date)}
              initialFocus
            />
            {task.dueDate && (
              <div className="p-2 border-t border-gray-100">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-gray-500"
                  onClick={() => onDateChange(task.id, null)}
                >
                  Clear date
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="col-span-1 flex items-center justify-end" data-interactive="true" onClick={handleInteractiveClick}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onTaskEdit && (
              <DropdownMenuItem onClick={() => onTaskEdit(task)}>
                <div className="flex items-center gap-2">
                  <Edit className="h-4 w-4 text-blue-600" />
                  <span>Edit</span>
                </div>
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem 
              onClick={() => {
                const leadEmail = task.leadId ? 
                  leads?.find(lead => lead.id === task.leadId)?.email : '';
                
                const title = `Task: ${task.title}`;
                const description = task.description || '';
                const startDate = task.dueDate ? new Date(task.dueDate) : new Date();
                const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour later
                
                const emails = [];
                if (leadEmail) emails.push(leadEmail);
                
                const calendarUrl = generateGoogleCalendarLink({
                  title,
                  description,
                  startTime: startDate,
                  endTime: endDate,
                  emails
                });
                
                window.open(calendarUrl, '_blank');
              }}
            >
              <div className="flex items-center gap-2">
                <CalendarPlus className="h-4 w-4 text-green-600" />
                <span>Add to Google Calendar</span>
              </div>
            </DropdownMenuItem>
            
            {onTaskDelete && (
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => onTaskDelete(task.id)}
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </div>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
} 