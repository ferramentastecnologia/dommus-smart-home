import React from "react";
import { Lead } from "@/types/crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, CheckSquare, CalendarPlus } from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { generateGoogleCalendarLink } from "@/utils/calendar";

interface TasksTabProps {
  lead: Lead;
  newTask: { description: string; agentId: string; dueDate: string };
  setNewTask: (task: { description: string; agentId: string; dueDate: string }) => void;
  handleAddTask: () => void;
  agents: { id: string; name: string }[];
}

export function TasksTab({ lead, newTask, setNewTask, handleAddTask, agents }: TasksTabProps) {
  // Function to format date
  const formatDate = (date: Date) => {
    return format(date, "MMM d, yyyy", { locale: enUS });
  };
  
  return (
    <Card className="border-green-100">
      <CardHeader className="pb-2 border-b border-green-100">
        <CardTitle className="text-xl flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-600">
            <rect width="18" height="18" x="3" y="3" rx="2"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
          Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-6">
          <div className="space-y-4 border rounded-md p-4 border-green-100 bg-green-50">
            <h3 className="font-medium text-sm text-green-700">New Task</h3>
            <Input 
              placeholder="What needs to be done?" 
              value={newTask.description}
              onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              className="border-green-200 focus:border-green-400 focus:ring-green-400"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Select 
                  value={newTask.agentId} 
                  onValueChange={(value) => setNewTask({...newTask, agentId: value})}
                >
                  <SelectTrigger className="border-green-200 focus:border-green-400 focus:ring-green-400">
                    <SelectValue placeholder="Assigned to" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Input 
                type="date" 
                value={newTask.dueDate}
                onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                className="border-green-200 focus:border-green-400 focus:ring-green-400"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline"
                className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                onClick={() => {
                  const title = `Meeting with ${lead.name}`;
                  const description = newTask.description || `Discussion with ${lead.name} from ${lead.company || 'company'}`;
                  const startDate = newTask.dueDate ? new Date(newTask.dueDate) : new Date();
                  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour later
                  
                  const calendarUrl = generateGoogleCalendarLink({
                    title,
                    description,
                    startTime: startDate,
                    endTime: endDate,
                    emails: [lead.email]
                  });
                  
                  window.open(calendarUrl, '_blank');
                }}
              >
                <CalendarPlus size={16} className="mr-1" /> Schedule Meeting
              </Button>
              <Button onClick={handleAddTask} className="bg-green-600 hover:bg-green-700">
                <Plus size={16} className="mr-1" /> Add Task
              </Button>
            </div>
          </div>
          
          <div className="space-y-4 mt-6">
            {lead.history?.filter(item => item.action === "Task created").length === 0 ? (
              <p className="text-muted-foreground">No tasks found.</p>
            ) : (
              lead.history?.filter(item => item.action === "Task created")
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((task) => (
                  <div key={task.id} className="bg-green-50 p-4 rounded-md border border-green-100">
                    <div className="flex items-start">
                      <CheckSquare className="h-5 w-5 text-green-600 mt-0.5 mr-2" />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-green-700">
                            {formatDate(new Date(task.date))}
                          </p>
                        </div>
                        <p className="mt-1">{task.description}</p>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
