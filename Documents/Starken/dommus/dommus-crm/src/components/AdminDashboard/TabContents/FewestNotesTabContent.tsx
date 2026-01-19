
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { FewestNotesTab } from "../FewestNotesTab";

interface FewestNotesTabContentProps {
  fewestNotes: any[] | undefined;
  isLoading: boolean;
  averageNotesPerAgent: number;
}

export function FewestNotesTabContent({ 
  fewestNotes, 
  isLoading, 
  averageNotesPerAgent 
}: FewestNotesTabContentProps) {
  return (
    <TabsContent value="fewest-notes">
      <FewestNotesTab 
        fewestNotes={fewestNotes} 
        isLoading={isLoading} 
        averageNotesPerAgent={averageNotesPerAgent} 
      />
    </TabsContent>
  );
}
