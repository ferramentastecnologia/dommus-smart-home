import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { TaskStatusConfig } from "@/types/crm";
import { useTheme } from "next-themes";

interface TasksByStatusChartProps {
  data: Record<string, number>;
  statusConfigs: TaskStatusConfig[];
  className?: string;
  user?: any;
  role?: string;
}

// Componente para modo claro
function LightModeChart({
  chartData,
  yAxisMax,
}: {
  chartData: any[];
  yAxisMax: number;
}) {
  return (
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
          stroke={'rgba(0, 0, 0, 0.1)'}
          opacity={0.5}
        />
        <Tooltip
          cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '6px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            padding: '8px 12px',
            color: '#000000'
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
            'Tasks'
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
            fontWeight: 700,
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
  );
}

// Componente para modo escuro
function DarkModeChart({
  chartData,
  yAxisMax,
}: {
  chartData: any[];
  yAxisMax: number;
}) {
  return (
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
            fontWeight: 800,  // Extra bold para mais contraste
            stroke: '#FFFFFF', // Contorno branco
            strokeWidth: 0.5
          }}
          dy={10}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{
            fill: '#FFFFFF',
            fontSize: 13,
            fontWeight: 800,  // Extra bold para mais contraste
            stroke: '#FFFFFF', // Contorno branco
            strokeWidth: 0.5
          }}
          domain={[0, yAxisMax]}
          allowDecimals={false}
        />
        <CartesianGrid 
          strokeDasharray="3 3" 
          vertical={false} 
          stroke={'rgba(255, 255, 255, 0.3)'}
          opacity={0.7}
        />
        <Tooltip
          cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
          contentStyle={{
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '6px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            padding: '8px 12px',
            color: '#FFFFFF'
          }}
          labelStyle={{ 
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '5px'
          }}
          itemStyle={{ 
            color: '#FFFFFF',
            fontSize: '12px', 
            fontWeight: 500,
            padding: '2px 0'
          }}
          formatter={(value: number) => [
            `${value}`, 
            'Tasks'
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
            fontWeight: 800,  // Extra bold para mais contraste
            stroke: '#FFFFFF', // Contorno branco
            strokeWidth: 0.5,
            formatter: (value: number) => value > 0 ? value : '',
          }}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color}
              fillOpacity={0.95}  // Maior opacidade para mais contraste
              stroke={entry.color}
              strokeWidth={1}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TasksByStatusChart({ data, statusConfigs, className, user, role }: TasksByStatusChartProps) {
  const { resolvedTheme } = useTheme();
  
  // Create chart data based on the order of statuses in the configuration
  const chartData = statusConfigs
    .map(status => {
      const statusName = status.name.toLowerCase();
      return {
        status: status.name,
        value: data[statusName] || 0,
        color: status.color
      };
    });

  const maxValue = Math.max(...chartData.map(d => d.value));
  const yAxisMax = maxValue === 0 ? 5 : Math.ceil(maxValue * 1.2);

  return (
    <Card className={className}>
      <CardHeader className="pb-0">
        <CardTitle className="text-base font-medium">Tasks by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {chartData.length === 0 || chartData.every(item => item.value === 0) ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-muted-foreground text-lg mb-2">No data to display</p>
              <p className="text-muted-foreground text-sm">Add some tasks to see them by status</p>
            </div>
          ) : (
            // Renderiza o componente com base no tema atual
            resolvedTheme === "dark" ? (
              <DarkModeChart 
                chartData={chartData}
                yAxisMax={yAxisMax}
              />
            ) : (
              <LightModeChart 
                chartData={chartData}
                yAxisMax={yAxisMax}
              />
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
} 