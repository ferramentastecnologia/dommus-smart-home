
import React from "react";
import { Tabs, TabsList } from "@/components/ui/tabs";
import { AgentPerformance } from "@/types/crm";
import { SlowestTasksTabTrigger } from "./TabTriggers/SlowestTasksTabTrigger";
import { AgentPerformanceTabTrigger } from "./TabTriggers/AgentPerformanceTabTrigger";
import { FewestNotesTabTrigger } from "./TabTriggers/FewestNotesTabTrigger";
import { SlowestTasksTabContent } from "./TabContents/SlowestTasksTabContent";
import { AgentPerformanceTabContent } from "./TabContents/AgentPerformanceTabContent";
import { FewestNotesTabContent } from "./TabContents/FewestNotesTabContent";

interface AdminTabsProps {
  slowestTasks: any[] | undefined;
  isLoadingTasks: boolean;
  agentMetrics: AgentPerformance[] | undefined;
  isLoadingAgents: boolean;
  fewestNotes: any[] | undefined;
  isLoadingNotes: boolean;
  averageTaskTime: number;
  averageNotesPerAgent: number;
}

export function AdminTabs({
  slowestTasks,
  isLoadingTasks,
  agentMetrics,
  isLoadingAgents,
  fewestNotes,
  isLoadingNotes,
  averageTaskTime,
  averageNotesPerAgent
}: AdminTabsProps) {
  return (
    <Tabs defaultValue="slowest-tasks">
      <TabsList className="grid grid-cols-3 mb-6">
        <SlowestTasksTabTrigger />
        <AgentPerformanceTabTrigger />
        <FewestNotesTabTrigger />
      </TabsList>

      <SlowestTasksTabContent 
        slowestTasks={slowestTasks} 
        isLoading={isLoadingTasks} 
      />

      <AgentPerformanceTabContent 
        agentMetrics={agentMetrics} 
        isLoading={isLoadingAgents} 
        averageTaskTime={averageTaskTime}
        averageNotesPerAgent={averageNotesPerAgent}
      />

      <FewestNotesTabContent 
        fewestNotes={fewestNotes} 
        isLoading={isLoadingNotes} 
        averageNotesPerAgent={averageNotesPerAgent} 
      />
    </Tabs>
  );
}
