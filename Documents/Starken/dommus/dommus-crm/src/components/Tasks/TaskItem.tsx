import React from "react";
import { Task } from "@/types/crm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Calendar, Check, Clock, UserCircle, Mail, Phone, Users, FileText, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDrag } from 'react-dnd';

interface TaskItemProps {
  task: Task;
  agentName: string;
  leadName: string;
  onStatusChange: (taskId: string, newStatus: "Pending" | "In Progress" | "Completed") => void;
  tags?: { id: string; name: string; color: string }[];
}

export function TaskItem({ task, agentName, leadName, onStatusChange, tags = [] }: TaskItemProps) {
  const typeIcons = {
    "Email": <Mail size={14} />,
    "Call": <Phone size={14} />,
    "Meeting": <Users size={14} />,
    "Other": <FileText size={14} />
  };
  
  const statusColors = {
    "Pending": "default",
    "In Progress": "secondary",
    "Completed": "secondary"
  } as const;
  
  const isOverdue = task.status !== "Completed" && new Date() > task.dueDate;

  // Set up drag capabilities for the task item
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));
  
  // Filter task tags from all tags
  const taskTags = task.tags?.length 
    ? tags.filter(tag => task.tags?.includes(tag.id)) 
    : [];

  // Manipulador de alteração do checkbox  
  const handleCheckboxChange = (checked: boolean) => {
    // Usar o método onStatusChange para atualizar o status da tarefa
    // Isso vai chamar handleStatusChange em Tasks.tsx, que atualiza corretamente o status_id
    onStatusChange(task.id, checked ? "Completed" : "Pending");
  };
  
  return (
    <Card 
      ref={drag}
      className={cn(
        "transition-shadow cursor-grab",
        task.status === "Completed" ? "opacity-60" : "",
        isOverdue ? "border-red-200" : "",
        isDragging ? "opacity-50" : ""
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox 
            checked={task.status === "Completed"}
            onCheckedChange={handleCheckboxChange}
          />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <h4 className={cn(
                "font-medium",
                task.status === "Completed" && "line-through text-muted-foreground"
              )}>
                {task.description}
              </h4>
              <Badge variant={statusColors[task.status]}>
                {task.status}
              </Badge>
            </div>
            
            {taskTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {taskTags.map(tag => (
                  <Badge
                    key={tag.id}
                    style={{ backgroundColor: tag.color + "20", color: tag.color, borderColor: tag.color }}
                    className="px-2 py-0 text-xs border"
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-1">
                  <UserCircle size={14} />
                  <span>{agentName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User size={14} />
                  <span>{leadName}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-5 mt-1">
                <div className="flex items-center gap-1">
                  {typeIcons[task.type] || <FileText size={14} />}
                  <span>{task.type}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{format(task.dueDate, "dd/MM/yyyy")}</span>
                </div>
                {isOverdue && (
                  <div className="flex items-center gap-1 text-red-500">
                    <Clock size={14} />
                    <span>Overdue</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
