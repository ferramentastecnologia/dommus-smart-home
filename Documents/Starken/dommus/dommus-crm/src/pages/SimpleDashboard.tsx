import React from "react";
import { Users, Clock, HandCoins, HeadsetIcon, Mail } from "lucide-react";

// Componente simplificado de card de estatísticas
const StatCard = ({ title, value, icon, trend, className }) => (
  <div className={`p-6 rounded-lg border ${className || ""}`}>
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
        {trend && (
          <p className={`text-xs mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value).toFixed(1)}%
          </p>
        )}
      </div>
      <div className="rounded-full bg-background p-3">{icon}</div>
    </div>
  </div>
);

// Componente simplificado de fila de emails
const SimpleEmailQueueList = () => (
  <div className="bg-background border rounded-lg shadow">
    <div className="px-6 py-4 border-b">
      <h3 className="text-lg font-medium">Email Queue</h3>
    </div>
    <div className="p-6">
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="rounded-full bg-muted p-3 mb-2">
          <Mail className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground mb-1">No emails in queue</p>
        <p className="text-sm text-muted-foreground/70">
          Scheduled emails will appear here
        </p>
      </div>
    </div>
  </div>
);

// Componente simplificado de leads recentes
const SimpleRecentLeadsList = () => (
  <div className="bg-background border rounded-lg shadow">
    <div className="px-6 py-4 border-b">
      <h3 className="text-lg font-medium">Recent Leads</h3>
    </div>
    <div className="p-6">
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="rounded-full bg-muted p-3 mb-2">
          <Users className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground mb-1">No recent leads</p>
        <p className="text-sm text-muted-foreground/70">
          New leads will appear here
        </p>
      </div>
    </div>
  </div>
);

export default function SimpleDashboard() {
  // Dados de exemplo para mostrar no dashboard
  const dashboardData = {
    totalLeads: 124,
    inProgressLeads: 87,
    convertedLeads: 37,
    activeAgents: 5,
    trends: {
      totalLeads: 8.5,
      inProgressLeads: 4.2,
      convertedLeads: 12.7
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Track your metrics and leads in real-time.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Leads" 
          value={dashboardData.totalLeads} 
          icon={<Users size={20} className="text-blue-600 dark:text-blue-400" />}
          trend={{
            value: dashboardData.trends.totalLeads,
            isPositive: dashboardData.trends.totalLeads >= 0
          }}
          className="bg-blue-50 dark:bg-transparent border-blue-100 dark:border-blue-900/30"
        />
        <StatCard 
          title="In Progress Leads" 
          value={dashboardData.inProgressLeads} 
          icon={<Clock size={20} className="text-green-600 dark:text-green-400" />}
          trend={{
            value: dashboardData.trends.inProgressLeads,
            isPositive: dashboardData.trends.inProgressLeads >= 0
          }}
          className="bg-green-50 dark:bg-transparent border-green-100 dark:border-green-900/30"
        />
        <StatCard 
          title="Closed Deals" 
          value={dashboardData.convertedLeads} 
          icon={<HandCoins size={20} className="text-purple-600 dark:text-purple-400" />}
          trend={{
            value: dashboardData.trends.convertedLeads,
            isPositive: dashboardData.trends.convertedLeads >= 0
          }}
          className="bg-purple-50 dark:bg-transparent border-purple-100 dark:border-purple-900/30"
        />
        <StatCard 
          title="Active Agents" 
          value={dashboardData.activeAgents} 
          icon={<HeadsetIcon size={20} className="text-orange-600 dark:text-orange-400" />}
          className="bg-orange-50 dark:bg-transparent border-orange-100 dark:border-orange-900/30"
          trend={null}
        />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <SimpleRecentLeadsList />
        <SimpleEmailQueueList />
      </div>
    </div>
  );
} 