import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  color?: string;
}

export function StatCard({ title, value, icon, trend, className, color }: StatCardProps) {
  // Determine the base color theme from className or fallback to primary
  const baseColor = color || 'primary';
  
  return (
    <Card className={cn(
      "p-4 relative overflow-hidden",
      "dark:border-primary/20",
      className
    )}>
      <div className="absolute inset-0 dark:bg-card opacity-80 z-0"></div>
      <div className="relative z-10 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="text-primary">{icon}</div>
        </div>
        <p className="text-2xl font-medium">{value}</p>
        {trend && (
          <div className="flex items-center">
            {trend.isPositive ? (
              <ArrowUpIcon className="h-3 w-3 text-emerald-500 dark:text-emerald-400" />
            ) : (
              <ArrowDownIcon className="h-3 w-3 text-red-500 dark:text-red-400" />
            )}
            <span className={cn(
              "text-xs ml-1",
              trend.isPositive ? "text-emerald-500 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
            )}>
              {Math.abs(trend.value).toFixed(0)}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">vs. previous month</span>
          </div>
        )}
      </div>
    </Card>
  );
}
