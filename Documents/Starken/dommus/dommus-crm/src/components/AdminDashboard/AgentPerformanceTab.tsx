import React from "react";
import { UserCog } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { AgentPerformance } from "@/types/crm";

interface AgentPerformanceTabProps {
  agentMetrics: AgentPerformance[] | undefined;
  isLoading: boolean;
  averageTaskTime: number;
  averageNotesPerAgent: number;
}

export function AgentPerformanceTab({ 
  agentMetrics, 
  isLoading, 
  averageTaskTime, 
  averageNotesPerAgent 
}: AgentPerformanceTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog size={20} className="text-blue-500" />
          Detailed Agent Performance
        </CardTitle>
        <CardDescription>
          Comparative metrics for all agents
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="w-full h-12" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {agentMetrics?.map((agent) => (
              <div key={agent.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{agent.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {agent.leadsConverted} converted leads | {agent.tasksCompleted} tasks
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Average task time</span>
                    <span className={agent.avgTaskTime > averageTaskTime ? "text-red-500" : "text-green-500"}>
                      {agent.avgTaskTime}h
                    </span>
                  </div>
                  <Progress 
                    value={100 - (agent.avgTaskTime / 100 * 100)} 
                    className="h-2" 
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Notes per lead</span>
                    <span className={agent.notesCount < averageNotesPerAgent ? "text-red-500" : "text-green-500"}>
                      {agent.notesCount} notes
                    </span>
                  </div>
                  <Progress 
                    value={(agent.notesCount / 30) * 100} 
                    className="h-2" 
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
