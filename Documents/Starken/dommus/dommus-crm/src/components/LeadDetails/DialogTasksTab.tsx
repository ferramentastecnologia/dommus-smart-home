import React from "react";
import { Lead } from "@/types/crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface DialogTasksTabProps {
  lead: Lead;
  newTask: { description: string; agentId: string; dueDate: string };
  setNewTask: (task: { description: string; agentId: string; dueDate: string }) => void;
  handleAddTask: () => void;
  agents: { id: string; name: string }[];
}

export function DialogTasksTab({ 
  lead, 
  newTask, 
  setNewTask, 
  handleAddTask, 
  agents 
}: DialogTasksTabProps) {
  // Format date function
  const formatDate = (date: Date) => {
    return format(date, "dd 'of' MMMM 'of' yyyy 'at' HH:mm", { locale: enUS });
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                placeholder="Task description" 
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
              <Input 
                type="date" 
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
            </div>
            
            <div className="flex space-x-4">
              <Select 
                value={newTask.agentId} 
                onValueChange={(value) => setNewTask({ ...newTask, agentId: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Assign to" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button onClick={handleAddTask} disabled={!newTask.description || !newTask.agentId || !newTask.dueDate}>
                <Plus size={16} className="mr-1" /> Add Task
              </Button>
            </div>
          </div>
          
          <div className="space-y-4 mt-6">
            <h3 className="text-sm font-semibold">Pending Tasks</h3>
            {lead.history?.filter(item => item.action === "Task created").length === 0 ? (
              <p className="text-muted-foreground text-sm">No pending tasks.</p>
            ) : (
              <div className="space-y-2">
                {/* Task items would go here */}
                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-md bg-gray-50">
                  <div>
                    <p className="font-medium text-sm">Follow up with client</p>
                    <p className="text-sm text-gray-500">Due: April 15, 2023</p>
                  </div>
                  <Badge variant="outline">Pending</Badge>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
