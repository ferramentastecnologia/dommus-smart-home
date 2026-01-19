
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { AgentPerformanceTab } from "../AgentPerformanceTab";
import { AgentPerformance } from "@/types/crm";

interface AgentPerformanceTabContentProps {
  agentMetrics: AgentPerformance[] | undefined;
  isLoading: boolean;
  averageTaskTime: number;
  averageNotesPerAgent: number;
}

export function AgentPerformanceTabContent({ 
  agentMetrics, 
  isLoading, 
  averageTaskTime,
  averageNotesPerAgent
}: AgentPerformanceTabContentProps) {
  return (
    <TabsContent value="agent-performance">
      <AgentPerformanceTab 
        agentMetrics={agentMetrics} 
        isLoading={isLoading} 
        averageTaskTime={averageTaskTime}
        averageNotesPerAgent={averageNotesPerAgent}
      />
    </TabsContent>
  );
}
