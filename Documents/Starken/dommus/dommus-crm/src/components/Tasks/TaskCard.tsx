import React from "react";
import { Task, TaskStatus, TaskPriority } from "@/types/crm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useDrag } from "react-dnd";
import { 
  Clock, 
  Calendar, 
  MoreVertical,
  User,
  CheckCircle2,
  Trash2,
  CalendarPlus,
  Edit,
  ChevronDown
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useTaskStatuses } from "@/hooks/useTaskStatuses";
import { generateGoogleCalendarLink } from "@/utils/calendar";

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onPriorityChange?: (taskId: string, priority: TaskPriority) => void;
  onAssigneeChange?: (taskId: string, assignee: string) => void;
  onDateChange?: (taskId: string, date: Date | null) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskEdit?: (task: Task) => void;
  teamMembers?: string[];
}

export function TaskCard({ 
  task, 
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  onDateChange,
  onTaskDelete,
  onTaskEdit,
  teamMembers = []
}: TaskCardProps) {
  const { defaultStatuses, getStatusColor, getStatusBackgroundColor } = useTaskStatuses();
  
  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  });

  const priorityColors = {
    Low: "bg-green-100 text-green-700 hover:bg-green-100",
    Medium: "bg-amber-100 text-amber-700 hover:bg-amber-100",
    High: "bg-red-100 text-red-700 hover:bg-red-100"
  };

  const getStatusStyle = (status: string) => {
    const color = getStatusColor(status);
    return {
      backgroundColor: `${color}20`, // 20% opacity
      color: color,
    };
  };

  const dueDateColor = task.dueDate && new Date(task.dueDate) < new Date() 
    ? "text-red-500" 
    : "text-gray-500";
  
  const formattedDueDate = task.dueDate 
    ? formatDistanceToNow(new Date(task.dueDate), { addSuffix: true }) 
    : "No due date";

  const priorityOptions: TaskPriority[] = ["Low", "Medium", "High"];

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Card 
        className="border shadow-sm hover:shadow"
        onClick={() => onTaskEdit && onTaskEdit(task)}
      >
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <h3 className="font-medium truncate">{task.title}</h3>
              
              <div className="flex items-center gap-2">
                {task.priority && (
                  <div onClick={handleAction} className="z-10" data-interactive="true">
                    {onPriorityChange ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className={cn(
                              priorityColors[task.priority] || "",
                              "text-xs px-2 py-0.5 h-auto font-normal rounded-full border flex items-center gap-1"
                            )}
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              e.preventDefault(); 
                            }}
                          >
                            {task.priority}
                            <ChevronDown className="h-3 w-3 opacity-70" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                          {priorityOptions.map((priority) => (
                            <DropdownMenuItem 
                              key={priority}
                              onClick={(e) => {
                                e.stopPropagation();
                                onPriorityChange(task.id, priority);
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <Badge className={cn(priorityColors[priority] || "", "text-xs px-2 font-normal")}>
                                  {priority}
                                </Badge>
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Badge className={priorityColors[task.priority] || ""}>
                        {task.priority}
                      </Badge>
                    )}
                  </div>
                )}
                
                {(onStatusChange || onAssigneeChange || onDateChange || onTaskDelete || onTaskEdit) && (
                  <div onClick={handleAction} data-interactive="true">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-gray-400 hover:text-gray-700"
                        >
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onTaskEdit && (
                          <DropdownMenuItem onClick={() => onTaskEdit(task)}>
                            <div className="flex items-center gap-2">
                              <Edit className="h-4 w-4 text-blue-500" />
                              <span>Edit</span>
                            </div>
                          </DropdownMenuItem>
                        )}
                        
                        {onStatusChange && (
                          <>
                            <DropdownMenuItem disabled className="text-xs font-semibold text-gray-500">
                              Change Status
                            </DropdownMenuItem>
                            {defaultStatuses.map((status) => (
                              <DropdownMenuItem 
                                key={status}
                                onClick={() => onStatusChange(task.id, status)}
                                disabled={task.status === status}
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
                          </>
                        )}
                        
                        {onTaskDelete && (
                          <DropdownMenuItem onClick={() => onTaskDelete(task.id)}>
                            <div className="flex items-center gap-2">
                              <Trash2 className="h-4 w-4 text-red-500" />
                              <span>Delete</span>
                            </div>
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuItem
                          onClick={() => {
                            const title = `Task: ${task.title}`;
                            const description = task.description || '';
                            const startDate = task.dueDate ? new Date(task.dueDate) : new Date();
                            const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour later
                            
                            const calendarUrl = generateGoogleCalendarLink({
                              title,
                              description,
                              startTime: startDate,
                              endTime: endDate,
                              emails: []
                            });
                            
                            window.open(calendarUrl, '_blank');
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <CalendarPlus className="h-4 w-4 text-green-500" />
                            <span>Add to Google Calendar</span>
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            </div>
            
            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
            )}
            
            <div className="flex items-center gap-2 text-xs">
              {onDateChange ? (
                <div onClick={handleAction} data-interactive="true">
                  <Popover>
                    <PopoverTrigger asChild>
                      <span className={`flex items-center gap-1 ${dueDateColor} cursor-pointer hover:bg-gray-100 p-1 rounded`}>
                        <Calendar className="h-3 w-3" />
                        {formattedDueDate}
                      </span>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
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
              ) : (
                <span className={`flex items-center gap-1 ${dueDateColor}`}>
                  <Calendar className="h-3 w-3" />
                  {formattedDueDate}
                </span>
              )}
              
              {task.createdAt && (
                <span className="flex items-center gap-1 text-gray-500">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                </span>
              )}
            </div>

            {onAssigneeChange ? (
              <div className="flex items-center gap-1 text-xs text-muted-foreground" onClick={handleAction} data-interactive="true">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 p-1 rounded">
                      {task.assignedTo ? (
                        <>
                          <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                            {task.assignedTo.substring(0, 1).toUpperCase()}
                          </div>
                          <span className="truncate">{task.assignedTo}</span>
                        </>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-400">
                          <User className="h-3 w-3" />
                          <span>Not assigned</span>
                        </div>
                      )}
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {teamMembers.length > 0 ? (
                      teamMembers.map((member) => (
                        <DropdownMenuItem 
                          key={member}
                          onClick={() => onAssigneeChange(task.id, member)}
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                              {member.substring(0, 1).toUpperCase()}
                            </div>
                            <span>{member}</span>
                          </div>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <DropdownMenuItem disabled>
                        No team members available
                      </DropdownMenuItem>
                    )}
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
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : task.assignedTo ? (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                  {task.assignedTo.substring(0, 1).toUpperCase()}
                </div>
                <span className="truncate">{task.assignedTo}</span>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 