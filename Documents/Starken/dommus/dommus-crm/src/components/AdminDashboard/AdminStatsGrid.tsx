import React from "react";
import { Clock, FileText, Users, BarChart2 } from "lucide-react";
import { StatCard } from "@/components/Dashboard/StatCard";
import { AgentPerformance } from "@/types/crm";

interface AdminStatsGridProps {
  agentMetrics: AgentPerformance[] | undefined;
}

export function AdminStatsGrid({ agentMetrics }: AdminStatsGridProps) {
  const averageTaskTime = agentMetrics 
    ? agentMetrics.reduce((acc, agent) => acc + (agent.avgTaskTime || 0), 0) / agentMetrics.length
    : 0;

  const averageNotesPerAgent = agentMetrics
    ? agentMetrics.reduce((acc, agent) => acc + (agent.notesCount || 0), 0) / agentMetrics.length
    : 0;

  const totalAgents = agentMetrics?.length || 0;
  const totalTasks = agentMetrics
    ? agentMetrics.reduce((acc, agent) => acc + (agent.tasksCompleted || 0), 0)
    : 0;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Average Time per Task"
        value={`${Math.round(averageTaskTime)}h`}
        icon={<Clock className="text-amber-500" />}
        description="per agent"
        className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200"
      />
      <StatCard
        title="Average Notes"
        value={Math.round(averageNotesPerAgent)}
        icon={<FileText className="text-purple-500" />}
        description="per agent"
        className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
      />
      <StatCard
        title="Total Agents"
        value={totalAgents}
        icon={<Users className="text-blue-500" />}
        className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
      />
      <StatCard
        title="Total Tasks"
        value={totalTasks}
        icon={<BarChart2 className="text-green-500" />}
        className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
      />
    </div>
  );
}
