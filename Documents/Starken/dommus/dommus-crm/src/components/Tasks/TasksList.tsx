
import React from "react";
import { Task, TaskStatus } from "@/types/crm";
import { TaskItem } from "@/components/Tasks/TaskItem";
import { useDrop } from 'react-dnd';

interface TasksListProps {
  tasks: Task[];
  agentNames: Record<string, string>;
  leadNames: Record<string, string>;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  filterStatus?: "Completed" | null;
  dropStatus?: TaskStatus;
  tags?: { id: string; name: string; color: string }[];
}

export function TasksList({ 
  tasks, 
  agentNames, 
  leadNames, 
  onStatusChange, 
  filterStatus,
  dropStatus,
  tags = []
}: TasksListProps) {
  const filteredTasks = filterStatus 
    ? tasks.filter(task => 
        filterStatus === "Completed" 
          ? task.status === "Completed" 
          : task.status !== "Completed"
      )
    : tasks;

  // Set up drop target for tasks
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TASK',
    drop: (item: { id: string, status: TaskStatus }) => {
      if (dropStatus && item.status !== dropStatus) {
        onStatusChange(item.id, dropStatus);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }), [dropStatus, onStatusChange]);

  if (filteredTasks.length === 0) {
    return (
      <div 
        ref={drop}
        className={`text-center text-muted-foreground py-8 min-h-[200px] rounded-lg border-2 ${isOver ? 'border-dashed border-blue-300 bg-blue-50' : 'border-transparent'}`}
      >
        No tasks found with the selected filters.
      </div>
    );
  }

  return (
    <div 
      ref={drop}
      className={`space-y-4 p-2 rounded-lg ${isOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''}`}
    >
      {filteredTasks.map(task => (
        <TaskItem 
          key={task.id} 
          task={task} 
          agentName={agentNames[task.agentId] || "Unknown"} 
          leadName={leadNames[task.leadId] || "Unknown"} 
          onStatusChange={onStatusChange}
          tags={tags}
        />
      ))}
    </div>
  );
}
