import { useStatus } from "@/contexts/StatusContext";
import { TaskStatusConfig } from "@/types/crm";

interface UseTaskStatusesReturn {
  taskStatuses: TaskStatusConfig[];
  taskStatusColors: Record<string, string>;
  taskStatusBackgroundColors: Record<string, string>;
  defaultStatuses: string[];
  getStatusColor: (status: string) => string;
  getStatusBackgroundColor: (status: string) => string;
}

export function useTaskStatuses(): UseTaskStatusesReturn {
  const { taskStatuses } = useStatus();
  
  // Create a map of status names to their colors
  const taskStatusColors = taskStatuses.reduce((acc, status) => {
    acc[status.name] = status.color;
    return acc;
  }, {} as Record<string, string>);
  
  // Create background colors (lighter versions) for each status
  const taskStatusBackgroundColors = taskStatuses.reduce((acc, status) => {
    // Create a lighter version of the color for backgrounds
    acc[status.name] = `${status.color}20`; // Add 20% opacity
    return acc;
  }, {} as Record<string, string>);
  
  // Get an ordered list of status names (useful for rendering in correct order)
  const defaultStatuses = taskStatuses
    .sort((a, b) => a.order_index - b.order_index)
    .map(status => status.name);
  
  // Helper function to get a status color
  const getStatusColor = (status: string): string => {
    return taskStatusColors[status] || "#6B7280"; // Default gray if not found
  };
  
  // Helper function to get a status background color
  const getStatusBackgroundColor = (status: string): string => {
    return taskStatusBackgroundColors[status] || "#E5E7EB"; // Default light gray if not found
  };
  
  return {
    taskStatuses,
    taskStatusColors,
    taskStatusBackgroundColors,
    defaultStatuses,
    getStatusColor,
    getStatusBackgroundColor
  };
} 