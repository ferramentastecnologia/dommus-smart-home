import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AgentPerformanceProps {
  agents: Array<{
    agentId: string;
    name: string;
    leadsConverted: number;
    tasksCompleted: number;
  }>;
}

export function AgentPerformanceList({ agents }: AgentPerformanceProps) {
  // Calcular o valor máximo para normalizar o progresso
  const maxLeads = Math.max(...agents.map(agent => agent.leadsConverted), 1);
  const maxTasks = Math.max(...agents.map(agent => agent.tasksCompleted), 1);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Agent Performance</CardTitle>
      </CardHeader>
      <CardContent>
        {!agents || agents.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No agent data available</p>
          </div>
        ) : (
          <div className="space-y-6">
            {agents.map((agent) => (
              <div key={agent.agentId} className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback>{agent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{agent.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Converted Leads</p>
                    <p className="text-2xl font-bold">{agent.leadsConverted}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Completed Tasks</p>
                    <p className="text-2xl font-bold">{agent.tasksCompleted}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
