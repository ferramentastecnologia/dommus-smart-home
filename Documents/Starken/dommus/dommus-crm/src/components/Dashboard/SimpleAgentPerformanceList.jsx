import React from 'react';
import { Users } from 'lucide-react';

// Componente placeholder para AgentPerformanceList
function SimpleAgentPerformanceList({ agents }) {
  return (
    <div className="bg-white dark:bg-gray-800 border rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-medium">Agent Performance</h3>
      </div>
      <div className="p-6">
        {agents && agents.length > 0 ? (
          <div className="space-y-4">
            {agents.map((agent) => (
              <div 
                key={agent.agentId}
                className="flex items-center justify-between p-3 border rounded-md"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Users size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-sm text-muted-foreground">{agent.email}</p>
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-bold">{agent.leadsConverted}</p>
                    <p className="text-muted-foreground">Converted</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold">{agent.tasksCompleted}</p>
                    <p className="text-muted-foreground">Tasks</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-gray-100 dark:bg-gray-700 p-3 mb-2">
              <Users className="h-6 w-6 text-gray-500" />
            </div>
            <p className="text-gray-500 mb-1">No agent data available</p>
            <p className="text-sm text-gray-400">
              Agent performance will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SimpleAgentPerformanceList; 