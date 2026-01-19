
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Task, TaskStatus } from "@/types/crm";
import { TasksList } from "./TasksList";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface TaskTabsProps {
  filteredTasks: Task[];
  agentNames: Record<string, string>;
  leadNames: Record<string, string>;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  tags?: { id: string; name: string; color: string }[];
}

export function TaskTabs({ 
  filteredTasks, 
  agentNames, 
  leadNames, 
  onStatusChange,
  tags = []
}: TaskTabsProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="mine">Mine</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium text-center bg-blue-100 p-2 rounded">Pending</h3>
              <TasksList 
                tasks={filteredTasks.filter(task => task.status === "Pending")} 
                agentNames={agentNames} 
                leadNames={leadNames} 
                onStatusChange={onStatusChange}
                dropStatus="Pending"
                tags={tags}
              />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-center bg-purple-100 p-2 rounded">In Progress</h3>
              <TasksList 
                tasks={filteredTasks.filter(task => task.status === "In Progress")} 
                agentNames={agentNames} 
                leadNames={leadNames} 
                onStatusChange={onStatusChange}
                dropStatus="In Progress"
                tags={tags}
              />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-center bg-green-100 p-2 rounded">Completed</h3>
              <TasksList 
                tasks={filteredTasks.filter(task => task.status === "Completed")} 
                agentNames={agentNames} 
                leadNames={leadNames} 
                onStatusChange={onStatusChange}
                dropStatus="Completed"
                tags={tags}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="mine" className="mt-6">
          <p className="text-center text-muted-foreground py-8">
            Feature available after login.
          </p>
        </TabsContent>
        
        <TabsContent value="pending" className="mt-6">
          <TasksList 
            tasks={filteredTasks} 
            agentNames={agentNames} 
            leadNames={leadNames} 
            onStatusChange={onStatusChange} 
            filterStatus={null}
            tags={tags}
          />
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          <TasksList 
            tasks={filteredTasks} 
            agentNames={agentNames} 
            leadNames={leadNames} 
            onStatusChange={onStatusChange} 
            filterStatus="Completed"
            tags={tags}
          />
        </TabsContent>
      </Tabs>
    </DndProvider>
  );
}
