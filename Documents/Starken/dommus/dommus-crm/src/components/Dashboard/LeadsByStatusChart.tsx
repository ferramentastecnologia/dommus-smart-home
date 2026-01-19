import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { LeadStatusConfig, TaskStatusConfig } from "@/types/crm";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/services/supabase/client";
import { useTheme } from "next-themes";

interface LeadsByStatusChartProps {
  data: Record<string, number>;
  statusConfigs: LeadStatusConfig[];
  className?: string;
  user?: any;
  role?: string;
}

// Componente para modo claro
function LightChart({
  chartData,
  activeTab,
  yAxisMax,
}: {
  chartData: any[];
  activeTab: "leads" | "tasks";
  yAxisMax: number;
}) {
  return (
    <div className="h-full w-full dark:hidden">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData} 
          margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
          barSize={35}
        >
          <XAxis 
            dataKey="status"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: '#000000',
              fontSize: 13,
              fontWeight: 600,
            }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{
              fill: '#000000',
              fontSize: 13,
              fontWeight: 600,
            }}
            domain={[0, yAxisMax]}
            allowDecimals={false}
          />
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke={'rgba(0, 0, 0, 0.2)'}
            opacity={0.8}
          />
          <Tooltip
            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '6px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              padding: '8px 12px',
            }}
            labelStyle={{ 
              color: '#000000',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '5px'
            }}
            itemStyle={{ 
              color: '#000000',
              fontSize: '12px', 
              fontWeight: 500,
              padding: '2px 0'
            }}
            formatter={(value: number) => [
              `${value}`, 
              activeTab === "leads" ? 'Leads' : 'Tasks'
            ]}
          />
          <Bar 
            dataKey="value" 
            radius={[4, 4, 0, 0]}
            animationDuration={800}
            label={{
              position: 'center',
              fill: '#000000',
              fontSize: 13,
              fontWeight: 600,
              formatter: (value: number) => value > 0 ? value : '',
            }}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                fillOpacity={0.85}
                stroke={entry.color}
                strokeWidth={1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Componente para modo escuro
function DarkChart({
  chartData,
  activeTab,
  yAxisMax,
}: {
  chartData: any[];
  activeTab: "leads" | "tasks";
  yAxisMax: number;
}) {
  return (
    <div className="h-full w-full hidden dark:block">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData} 
          margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
          barSize={35}
        >
          <XAxis 
            dataKey="status"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: '#FFFFFF',
              fontSize: 13,
              fontWeight: 600,
            }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{
              fill: '#FFFFFF',
              fontSize: 13,
              fontWeight: 600,
            }}
            domain={[0, yAxisMax]}
            allowDecimals={false}
          />
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke={'rgba(255, 255, 255, 0.4)'}
            opacity={0.8}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255, 255, 255, 0.15)' }}
            contentStyle={{
              backgroundColor: 'rgba(30, 41, 59, 0.98)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              padding: '8px 12px',
              color: '#FFFFFF'
            }}
            labelStyle={{ 
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 700,
              marginBottom: '5px'
            }}
            itemStyle={{ 
              color: '#FFFFFF',
              fontSize: '12px', 
              fontWeight: 600,
              padding: '2px 0'
            }}
            formatter={(value: number) => [
              `${value}`, 
              activeTab === "leads" ? 'Leads' : 'Tasks'
            ]}
          />
          <Bar 
            dataKey="value" 
            radius={[4, 4, 0, 0]}
            animationDuration={800}
            label={{
              position: 'center',
              fill: '#FFFFFF',
              fontSize: 13,
              fontWeight: 600,
              formatter: (value: number) => value > 0 ? value : '',
            }}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                fillOpacity={1}
                stroke={entry.color}
                strokeWidth={1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LeadsByStatusChart({ data, statusConfigs, className, user, role }: LeadsByStatusChartProps) {
  const [activeTab, setActiveTab] = useState<"leads" | "tasks">("leads");
  const [taskData, setTaskData] = useState<Record<string, number>>({});
  const [taskStatusConfigs, setTaskStatusConfigs] = useState<TaskStatusConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "tasks") {
      fetchTaskData();
    }
  }, [activeTab]);

  const fetchTaskData = async () => {
    setIsLoading(true);
    try {
      const { data: taskConfigs, error: configError } = await supabase
        .from('task_statuses')
        .select('*')
        .order('order_index', { ascending: true });
        
      if (configError) throw configError;
      
      // Aplicar filtro por usuário se for agent
      let tasksQuery = supabase
        .from('tasks')
        .select('*, task_statuses(id, name)');
        
      if (role === 'agent' && user) {
        console.log('📝 Applying tasks filter for agent in chart (only assigned):', user.id);
        // Agents veem APENAS tasks atribuídas a eles (não veem sem atribuição)
        tasksQuery = tasksQuery.eq('assigned_to', user.id);
      } else {
        console.log('👑 Admin/Manager - showing all tasks in chart');
      }
      
      const { data: tasks, error: tasksError } = await tasksQuery;
        
      if (tasksError) throw tasksError;
      
      const tasksByStatus = (tasks || []).reduce((acc: Record<string, number>, task) => {
        if (task.task_statuses && task.task_statuses.name) {
          const statusName = task.task_statuses.name.toLowerCase();
          acc[statusName] = (acc[statusName] || 0) + 1;
        }
        return acc;
      }, {});
      
      setTaskStatusConfigs(taskConfigs || []);
      setTaskData(tasksByStatus);
    } catch (error) {
      console.error('Error fetching task data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentData = activeTab === "leads" ? data : taskData;
  const currentConfigs = activeTab === "leads" ? statusConfigs : taskStatusConfigs;

  const chartData = currentConfigs
    .map(status => {
      const statusName = status.name.toLowerCase();
      // Tenta encontrar os dados pelo nome exato ou pelo nome em lowercase
      const value = 
        currentData[status.name] !== undefined 
          ? currentData[status.name] 
          : currentData[statusName] !== undefined
            ? currentData[statusName]
            : 0;
      
      return {
        status: status.name,
        value,
        color: status.color
      };
    });

  console.log('Chart Data:', chartData);

  const maxValue = Math.max(...chartData.map(d => d.value));
  const yAxisMax = maxValue === 0 ? 5 : Math.ceil(maxValue * 1.2);

  // Verifica se realmente não temos dados ou se todos os valores são zero
  const hasNoData = chartData.length === 0 || chartData.every(item => item.value === 0);

  return (
    <Card className={className}>
      <CardHeader className="pb-0 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">
          {activeTab === "leads" ? "Leads by Status" : "Tasks by Status"}
        </CardTitle>
        <Tabs defaultValue="leads" value={activeTab} onValueChange={(value) => setActiveTab(value as "leads" | "tasks")}>
          <TabsList className="grid w-[200px] grid-cols-2">
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full min-h-[300px] min-w-[200px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : hasNoData ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-muted-foreground text-lg mb-2">No data to display</p>
              <p className="text-muted-foreground text-sm">
                {activeTab === "leads" 
                  ? "Add some leads to see them by status" 
                  : "Add some tasks to see them by status"}
              </p>
            </div>
          ) : (
            <>
              <LightChart 
                chartData={chartData}
                activeTab={activeTab}
                yAxisMax={yAxisMax}
              />
              <DarkChart 
                chartData={chartData}
                activeTab={activeTab}
                yAxisMax={yAxisMax}
              />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}