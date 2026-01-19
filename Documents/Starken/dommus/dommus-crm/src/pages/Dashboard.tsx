import React, { useEffect, useState } from "react";
import { Briefcase, DollarSign, LineChart, Users, UserPlus, UserCheck, Hourglass, HeadsetIcon, Clock, HandCoins } from "lucide-react";
import { StatCard } from "@/components/Dashboard/StatCard";
import { LeadsByStatusChart } from "@/components/Dashboard/LeadsByStatusChart";
import { AgentPerformanceList } from "@/components/Dashboard/AgentPerformanceList";
import { RecentLeadsList } from "@/components/Dashboard/RecentLeadsList";
import MicroEmailQueueList from "../components/Dashboard/MicroEmailQueueList.jsx";
import { supabase } from "@/services/supabase/client";
import { startOfMonth, subMonths, endOfMonth } from "date-fns";
import { LeadStatusConfig, AgentPerformance as AgentPerformanceType } from '../types/crm';
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from '@/hooks/auth/useUser';
import { useUserRole } from '@/hooks/auth/useUserRole';
// import { fetchLeadStatusConfigs } from "@/services/leads";

interface Agent {
  id: string;
  name: string;
  email: string;
  status: string;
}

interface LeadStatus {
  id: string;
  name: string;
  color: string;
  is_converted: boolean;
  is_discarded: boolean;
}

interface TaskStatus {
  id: string;
  name: string;
  color: string;
  is_completed: boolean;
}

interface LeadSource {
  id: string;
  name: string;
  color: string;
}

interface AgentInfo {
  id: string;
  name: string;
  email: string;
}

interface DatabaseLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  website: string;
  created_at: string;
  updated_at: string;
  status_id: string;
  source_id: string;
  assigned_to: string;
  lead_statuses: LeadStatus;
  lead_sources?: LeadSource;
  agents?: AgentInfo;
}

interface DatabaseTask {
  id: string;
  title: string;
  description: string;
  due_date: string;
  created_at: string;
  updated_at: string;
  status_id: string;
  lead_id: string;
  assigned_to: string;
  task_statuses: TaskStatus;
}

// Implementação direta para evitar problemas de importação
async function fetchLeadStatusConfigs(): Promise<LeadStatusConfig[]> {
  try {
    const { data, error } = await supabase
      .from('lead_statuses')
      .select('*')
      .order('order_index', { ascending: true });
      
    if (error) {
      console.error("Error fetching lead status configs:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Failed to fetch lead status configs:", error);
    return [];
  }
}

// Função auxiliar para verificar se um lead está convertido
const isLeadConverted = (lead: any) => {
  return lead?.lead_statuses?.is_converted === true;
};

type DashboardData = {
  totalLeads: number;
  inProgressLeads: number;
  convertedLeads: number;
  leadStatusConfigs: LeadStatusConfig[];
  leadsByStatus: Record<string, number>;
  agentPerformance: AgentPerformanceType[];
  recentLeads: any[];
  activeAgents: number;
  trends: {
    totalLeads: number;
    inProgressLeads: number;
    convertedLeads: number;
  };
};

export default function Dashboard() {
  const { user } = useUser();
  const { role, loading: roleLoading } = useUserRole();
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('agent');
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalLeads: 0,
    inProgressLeads: 0,
    convertedLeads: 0,
    activeAgents: 0,
    leadsByStatus: {},
    leadStatusConfigs: [],
    agentPerformance: [],
    recentLeads: [],
    trends: {
      totalLeads: 0,
      inProgressLeads: 0,
      convertedLeads: 0
    }
  });

  const [leadStats, setLeadStats] = useState({
    new: 0,
    qualified: 0,
    proposal: 0,
    closed: 0,
    lost: 0,
    total: 0,
    inProgress: 0,
  });

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const calculateConversionRate = (leads: any[]) => {
    const converted = leads.filter(isLeadConverted).length;
    return leads.length > 0 ? (converted / leads.length) * 100 : 0;
  };

  // Função para obter role do usuário

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Aguarda o role carregar antes de aplicar filtros
        if (roleLoading) {
          console.log('⏳ Waiting for role to load...');
          return;
        }
        
        setUserRole(role);
        console.log('🔍 Dashboard Filter Debug:', { role, userId: user?.id });
        // Fetch active agents - using status instead of is_active
        let agentsQuery = supabase
          .from('agents')
          .select('id, name, email, status, user_id')
          .eq('status', 'active');
        let leadsQuery = supabase
          .from('leads')
          .select('*, lead_statuses(*)')
          .order('created_at', { ascending: false });
        // Filtro por role
        if (role === 'agent' && user) {
          console.log('📝 Applying dashboard filter for agent (only assigned):', user.id);
          // Agents veem APENAS leads atribuídos a eles (não veem sem atribuição)
          leadsQuery = leadsQuery.eq('agent_id', user.id);
        }
        // Também filtrar tasks por role
        let tasksQuery = supabase
          .from('tasks')
          .select('id, status_id, assigned_to');
        if (role === 'agent' && user) {
          // Agents veem APENAS tasks atribuídas a eles (não veem sem atribuição)
          tasksQuery = tasksQuery.eq('assigned_to', user.id);
        }
        // Admin e manager veem tudo
        const { data: agents, error: agentsError } = await agentsQuery;
        if (agentsError) {
          console.error('Error fetching agents:', agentsError);
        }
        // Fetch lead statuses with all fields
        const { data: leadStatuses, error: statusError } = await supabase
          .from('lead_statuses')
          .select('*')
          .order('order_index', { ascending: true });
        if (statusError) {
          console.error('Error fetching lead statuses:', statusError);
        }
        const { data: leads, error: leadsError } = await leadsQuery;
        if (leadsError) {
          console.error('Error fetching leads:', leadsError);
        }
        console.log('Lead Statuses:', leadStatuses);
        console.log('Leads with status:', leads);
        // Create a map of status IDs to status objects for easier lookup
        const statusMap = new Map();
        leadStatuses?.forEach(status => {
          statusMap.set(status.id, status);
        });

        // Ensure we have lead status names ready in the dashboard data
        const leadStatusConfigs = leadStatuses?.map(status => ({
          id: status.id,
          name: status.name,
          color: status.color,
          is_converted: status.is_converted,
          is_discarded: status.is_discarded,
          order_index: status.order_index || 0,
          is_default: status.is_default || false,
          created_at: status.created_at || new Date().toISOString(),
          description: status.description || ''
        })) || [];

        // Calculate leads by status - preserving casing from the status name
        const leadsByStatus: Record<string, number> = {};
        
        // Initialize all status counts with zero
        leadStatusConfigs.forEach(status => {
          leadsByStatus[status.name] = 0;
        });
        
        // Count leads by their status
        leads?.forEach(lead => {
          if (lead.status_id) {
            const status = statusMap.get(lead.status_id);
            if (status && status.name) {
              leadsByStatus[status.name] += 1;
            }
          }
        });
        
        console.log('Status Map:', Array.from(statusMap.entries()));
        console.log('Calculated Leads by Status:', leadsByStatus);

        // Calculate agent performance (filtrar para gerente)
        let agentPerformance = await calculateAgentPerformance(agents || [], role, user);
        if ((role === 'manager' || role === 'agent') && user) {
          agentPerformance = agentPerformance.filter(ap => ap.agentId === user.id);
        }

        // Calculate current month metrics
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const currentMonthLeads = leads?.filter(lead => {
          const leadDate = new Date(lead.created_at);
          return leadDate.getMonth() === currentMonth && leadDate.getFullYear() === currentYear;
        }) || [];

        const previousMonthLeads = leads?.filter(lead => {
          const leadDate = new Date(lead.created_at);
          return leadDate.getMonth() === currentMonth - 1 && leadDate.getFullYear() === currentYear;
        }) || [];

        // Helper function to check if a lead is converted
        const isLeadConverted = (lead: any) => {
          const status = statusMap.get(lead.status_id);
          return status?.is_converted === true;
        };

        setDashboardData({
          totalLeads: leads?.length || 0,
          inProgressLeads: leads?.filter(lead => !isLeadConverted(lead)).length || 0,
          convertedLeads: leads?.filter(isLeadConverted).length || 0,
          leadStatusConfigs,
          leadsByStatus,
          agentPerformance,
          recentLeads: leads?.slice(0, 5) || [],
          activeAgents: agents?.length || 0,
          trends: {
            totalLeads: calculateGrowth(currentMonthLeads.length, previousMonthLeads.length),
            inProgressLeads: calculateGrowth(
              currentMonthLeads.filter(lead => !isLeadConverted(lead)).length,
              previousMonthLeads.filter(lead => !isLeadConverted(lead)).length
            ),
            convertedLeads: calculateGrowth(
              currentMonthLeads.filter(isLeadConverted).length,
              previousMonthLeads.filter(isLeadConverted).length
            )
          }
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, role, roleLoading]);

  const calculateAgentPerformance = async (agents: any[], role: string, currentUser: any) => {
    const agentPerformance = await Promise.all(
      agents.map(async (agent) => {
        try {
          console.log(`Calculating performance for agent: ${agent.name} (${agent.email})`);
          
          // Declarar as variáveis que serão usadas em ambos os caminhos
          let allAgentLeads: any[] = [];
          let allAgentTasks: any[] = [];
          
          // Se o agente não tiver user_id definido, busca pelo email e ID conforme antes
          if (!agent.user_id) {
            console.log(`Agent ${agent.email} does not have user_id, using email and agent_id fallback`);
            
            // Primeiro tenta buscar leads usando o assigned_to (email)
            const { data: leadsWithEmail, error: leadsErrorEmail } = await supabase
              .from('leads')
              .select('id, status_id')
              .eq('assigned_to', agent.email);
              
            if (leadsErrorEmail) {
              console.error(`Error fetching leads by email for agent ${agent.email}:`, leadsErrorEmail);
            }
            
            // Também busca leads usando o agent_id (ID do agente)
            const { data: leadsWithId, error: leadsErrorId } = await supabase
              .from('leads')
              .select('id, status_id')
              .eq('agent_id', agent.id);
              
            if (leadsErrorId) {
              console.error(`Error fetching leads by ID for agent ${agent.email}:`, leadsErrorId);
            }
            
            // Combina os resultados, removendo duplicatas por ID
            const leadIdsSet = new Set();
            
            // Adiciona leads encontrados pelo email
            if (leadsWithEmail && leadsWithEmail.length > 0) {
              for (const lead of leadsWithEmail) {
                if (!leadIdsSet.has(lead.id)) {
                  leadIdsSet.add(lead.id);
                  allAgentLeads.push(lead);
                }
              }
            }
            
            // Adiciona leads encontrados pelo ID (que não já foram adicionados)
            if (leadsWithId && leadsWithId.length > 0) {
              for (const lead of leadsWithId) {
                if (!leadIdsSet.has(lead.id)) {
                  leadIdsSet.add(lead.id);
                  allAgentLeads.push(lead);
                }
              }
            }
            
            console.log(`Found ${allAgentLeads.length} total leads for agent ${agent.email}`);

            // Primeiro tenta buscar tasks usando o assigned_to (email)
            const { data: tasksWithEmail, error: tasksErrorEmail } = await supabase
              .from('tasks')
              .select('id, status_id')
              .eq('assigned_to', agent.email);
              
            if (tasksErrorEmail) {
              console.error(`Error fetching tasks by email for agent ${agent.email}:`, tasksErrorEmail);
            }
            
            // Também busca tasks usando o agent_id (ID do agente)
            const { data: tasksWithId, error: tasksErrorId } = await supabase
              .from('tasks')
              .select('id, status_id')
              .eq('agent_id', agent.id);
              
            if (tasksErrorId) {
              console.error(`Error fetching tasks by ID for agent ${agent.email}:`, tasksErrorId);
            }
            
            // Combina os resultados, removendo duplicatas por ID
            const taskIdsSet = new Set();
            
            // Adiciona tasks encontradas pelo email
            if (tasksWithEmail && tasksWithEmail.length > 0) {
              for (const task of tasksWithEmail) {
                if (!taskIdsSet.has(task.id)) {
                  taskIdsSet.add(task.id);
                  allAgentTasks.push(task);
                }
              }
            }
            
            // Adiciona tasks encontradas pelo ID (que não já foram adicionadas)
            if (tasksWithId && tasksWithId.length > 0) {
              for (const task of tasksWithId) {
                if (!taskIdsSet.has(task.id)) {
                  taskIdsSet.add(task.id);
                  allAgentTasks.push(task);
                }
              }
            }
            
            console.log(`Found ${allAgentTasks.length} total tasks for agent ${agent.email}`);
          } else {
            // Usar o user_id do agente para buscar leads e tasks
            console.log(`Using user_id ${agent.user_id} for agent ${agent.email}`);
            
            // Busca leads pelo user_id - considerar filtro global
            let agentLeadsQuery = supabase
              .from('leads')
              .select('id, status_id, assigned_to')
              .eq('assigned_to', agent.user_id);
            
            // Se for agente/manager, só considera leads dele ou não atribuídos
            if ((role === 'manager' || role === 'agent') && currentUser && agent.user_id !== currentUser.id) {
              // Se não for o próprio usuário logado, não busca leads deste agente
              agentLeadsQuery = supabase.from('leads').select('id, status_id, assigned_to').eq('id', 'no-leads');
            }
            
            const { data: agentLeads, error: leadsError } = await agentLeadsQuery;
            
            if (leadsError) {
              console.error(`Error fetching leads for agent ${agent.email}:`, leadsError);
            }
            
            // Busca tasks pelo user_id - considerar filtro global
            let agentTasksQuery = supabase
              .from('tasks')
              .select('id, status_id, assigned_to')
              .eq('assigned_to', agent.user_id);
            
            // Se for agente/manager, só considera tasks dele ou não atribuídas
            if ((role === 'manager' || role === 'agent') && currentUser && agent.user_id !== currentUser.id) {
              // Se não for o próprio usuário logado, não busca tasks deste agente
              agentTasksQuery = supabase.from('tasks').select('id, status_id, assigned_to').eq('id', 'no-tasks');
            }
            
            const { data: agentTasks, error: tasksError } = await agentTasksQuery;
            
            if (tasksError) {
              console.error(`Error fetching tasks for agent ${agent.email}:`, tasksError);
            }
            
            allAgentLeads = agentLeads || [];
            allAgentTasks = agentTasks || [];
            
            console.log(`Found ${allAgentLeads.length} leads and ${allAgentTasks.length} tasks for agent ${agent.email} using user_id`);
          }

          // Fetch lead statuses for conversion check
          const { data: leadStatuses, error: statusError } = await supabase
            .from('lead_statuses')
            .select('id, is_converted');
            
          if (statusError) {
            console.error('Error fetching lead statuses:', statusError);
          }

          // Fetch task statuses for completion check
          const { data: taskStatuses, error: taskStatusError } = await supabase
            .from('task_statuses')
            .select('id, is_completed');
            
          if (taskStatusError) {
            console.error('Error fetching task statuses:', taskStatusError);
          }

          // Create maps for easier lookup
          const convertedStatusIds = new Set(
            leadStatuses?.filter(status => status.is_converted).map(status => status.id) || []
          );
          
          const completedStatusIds = new Set(
            taskStatuses?.filter(status => status.is_completed).map(status => status.id) || []
          );

          const leadsConverted = allAgentLeads.filter(lead => 
            convertedStatusIds.has(lead.status_id)
          ).length || 0;

          const tasksCompleted = allAgentTasks.filter(task => 
            completedStatusIds.has(task.status_id)
          ).length || 0;

          const totalLeads = allAgentLeads.length || 0;

          return {
            agentId: agent.id,
            name: agent.name,
            email: agent.email,
            leadsConverted,
            tasksCompleted,
            totalLeads
          };
        } catch (error) {
          console.error(`Error calculating performance for agent ${agent.email}:`, error);
          return {
            agentId: agent.id,
            name: agent.name,
            email: agent.email,
            leadsConverted: 0,
            tasksCompleted: 0,
            totalLeads: 0
          };
        }
      })
    );

    return agentPerformance.sort((a, b) => b.leadsConverted - a.leadsConverted);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[300px] w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }

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
          color="blue"
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
          color="green"
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
          color="purple"
        />
        <StatCard 
          title="Active Agents" 
          value={dashboardData.activeAgents} 
          icon={<HeadsetIcon size={20} className="text-orange-600 dark:text-orange-400" />}
          className="bg-orange-50 dark:bg-transparent border-orange-100 dark:border-orange-900/30"
          color="orange"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <LeadsByStatusChart 
          data={Object.fromEntries(
            dashboardData.leadStatusConfigs.map(status => [
              status.name.toLowerCase(),
              dashboardData.leadsByStatus[status.name] || 0
            ])
          )}
          statusConfigs={dashboardData.leadStatusConfigs}
          className="col-span-3"
          user={user}
          role={userRole}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        <AgentPerformanceList agents={dashboardData.agentPerformance} />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <RecentLeadsList 
          leads={dashboardData.recentLeads} 
          statusConfigs={dashboardData.leadStatusConfigs}
        />
        <MicroEmailQueueList />
      </div>
    </div>
  );
}
