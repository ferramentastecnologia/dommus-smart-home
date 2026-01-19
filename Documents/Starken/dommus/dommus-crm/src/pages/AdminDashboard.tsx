import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AgentPerformance } from "@/types/crm";
import { supabase } from "@/services/supabase/client";
import { AccessDeniedCard } from "@/components/AdminDashboard/AccessDeniedCard";
import { AdminStatsGrid } from "@/components/AdminDashboard/AdminStatsGrid";
import { AdminTabs } from "@/components/AdminDashboard/AdminTabs";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [agentMetrics, setAgentMetrics] = useState<AgentPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [slowestTasks, setSlowestTasks] = useState<any[]>([]);
  const [fewestNotes, setFewestNotes] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      
      const { data: profile } = await supabase
        .from('agents')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'admin') {
        setIsAdmin(true);
      } else {
        navigate("/");
      }
    };
    
    checkAdminStatus();
  }, [navigate]);

  useEffect(() => {
    const fetchAgentMetrics = async () => {
      try {
        setLoading(true);
        const { data: agents, error: agentsError } = await supabase
          .from('agents')
          .select(`
            *,
            tasks:tasks(count),
            completed_tasks:tasks(count, status=eq.Completed),
            leads:leads(count),
            closed_leads:leads(count, status=eq.Closed)
          `);

        if (agentsError) throw agentsError;

        const metrics: AgentPerformance[] = agents.map(agent => ({
          id: agent.id,
          name: agent.name,
          photo: agent.photoUrl || "",
          leadsCount: agent.leads.count,
          closedLeads: agent.closed_leads.count,
          conversionRate: agent.leads.count ? (agent.closed_leads.count / agent.leads.count) * 100 : 0,
          leadsConverted: agent.closed_leads.count,
          tasksCompleted: agent.completed_tasks.count,
        }));

        setAgentMetrics(metrics);
      } catch (error) {
        console.error("Error fetching agent metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSlowestTasks = async () => {
      try {
        setLoadingTasks(true);
        const { data, error } = await supabase
          .from('tasks')
          .select(`
            *,
            agent:agents(name)
          `)
          .order('created_at', { ascending: true })
          .limit(5);

        if (error) throw error;
        setSlowestTasks(data);
      } catch (error) {
        console.error("Error fetching slowest tasks:", error);
      } finally {
        setLoadingTasks(false);
      }
    };

    const fetchFewestNotes = async () => {
      try {
        setLoadingNotes(true);
        const { data, error } = await supabase
          .from('agents')
          .select(`
            id,
            name,
            notes:notes(count)
          `)
          .order('notes.count', { ascending: true })
          .limit(5);

        if (error) throw error;
        setFewestNotes(data);
      } catch (error) {
        console.error("Error fetching agents with fewest notes:", error);
      } finally {
        setLoadingNotes(false);
      }
    };

    if (isAdmin) {
      fetchAgentMetrics();
      fetchSlowestTasks();
      fetchFewestNotes();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return <AccessDeniedCard />;
  }

  const averageTaskTime = agentMetrics 
    ? agentMetrics.reduce((acc, agent) => acc + (agent.avgTaskTime || 0), 0) / agentMetrics.length
    : 0;

  const averageNotesPerAgent = agentMetrics
    ? agentMetrics.reduce((acc, agent) => acc + (agent.notesCount || 0), 0) / agentMetrics.length
    : 0;

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Team performance metrics visible only to administrators.
        </p>
      </div>

      <AdminStatsGrid agentMetrics={agentMetrics} />

      <AdminTabs
        slowestTasks={slowestTasks}
        isLoadingTasks={loadingTasks}
        agentMetrics={agentMetrics}
        isLoadingAgents={loading}
        fewestNotes={fewestNotes}
        isLoadingNotes={loadingNotes}
        averageTaskTime={averageTaskTime}
        averageNotesPerAgent={averageNotesPerAgent}
      />
    </div>
  );
}
