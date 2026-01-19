import React from 'react';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Edit, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const TasksTable = ({ tasks, onEditTask, onCompleteTask }) => {
  const getInitials = (name) => {
    const parts = name.split(' ');
    return parts[0].charAt(0) + parts[parts.length - 1].charAt(0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Table>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id}>
            <TableCell>
              <div className="font-medium">{task.title}</div>
              <div className="text-sm text-muted-foreground">{task.description}</div>
            </TableCell>
            <TableCell>
              <div className="flex justify-center">
                <Badge
                  className={cn(
                    task.status === "Pending" ? "bg-amber-100 text-amber-700 hover:bg-amber-100" :
                    task.status === "In Progress" ? "bg-blue-100 text-blue-700 hover:bg-blue-100" :
                    task.status === "Completed" ? "bg-green-100 text-green-700 hover:bg-green-100" :
                    "bg-gray-100 text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {task.status}
                </Badge>
              </div>
            </TableCell>
            <TableCell>
              {task.lead?.name || "No lead assigned"}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-sm text-white">
                    {task.agent?.name ? getInitials(task.agent.name) : "NA"}
                  </AvatarFallback>
                </Avatar>
                <span>{task.agent?.name || "Not assigned"}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={cn(
                  task.priority === "High" ? "border-red-200 text-red-700" :
                  task.priority === "Medium" ? "border-amber-200 text-amber-700" :
                  "border-blue-200 text-blue-700"
                )}
              >
                {task.priority}
              </Badge>
            </TableCell>
            <TableCell>
              {formatDate(task.dueDate || new Date())}
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditTask(task)}
                >
                  <Edit size={16} />
                </Button>
                {task.status !== "Completed" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-green-600"
                    onClick={() => onCompleteTask(task.id, "Completed")}
                  >
                    <CheckSquare size={16} />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TasksTable; 