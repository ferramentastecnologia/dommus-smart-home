
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { SlowestTasksTab } from "../SlowestTasksTab";

interface SlowestTasksTabContentProps {
  slowestTasks: any[] | undefined;
  isLoading: boolean;
}

export function SlowestTasksTabContent({ 
  slowestTasks, 
  isLoading 
}: SlowestTasksTabContentProps) {
  return (
    <TabsContent value="slowest-tasks">
      <SlowestTasksTab slowestTasks={slowestTasks} isLoading={isLoading} />
    </TabsContent>
  );
}
