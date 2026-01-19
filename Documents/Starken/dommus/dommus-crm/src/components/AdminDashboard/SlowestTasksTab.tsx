import React from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface SlowestTasksTabProps {
  slowestTasks: any[] | undefined;
  isLoading: boolean;
}

export function SlowestTasksTab({ slowestTasks, isLoading }: SlowestTasksTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle size={20} className="text-amber-500" />
          Tasks That Took Longest to Complete
        </CardTitle>
        <CardDescription>
          List of tasks that took the most time to complete
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="w-full h-12" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead className="text-right">Duration (hours)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slowestTasks?.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.description}</TableCell>
                  <TableCell>{task.leadName}</TableCell>
                  <TableCell>{task.agentName}</TableCell>
                  <TableCell className="text-right">
                    <span className={task.durationHours > 72 ? "text-red-500 font-bold" : ""}>{task.durationHours}h</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
