
import React from "react";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface FewestNotesTabProps {
  fewestNotes: any[] | undefined;
  isLoading: boolean;
  averageNotesPerAgent: number;
}

export function FewestNotesTab({ 
  fewestNotes, 
  isLoading, 
  averageNotesPerAgent 
}: FewestNotesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText size={20} className="text-purple-500" />
          Agentes com Menos Anotações
        </CardTitle>
        <CardDescription>
          Agentes que fizeram menos anotações nos leads
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
                <TableHead>Agente</TableHead>
                <TableHead className="text-right">Total de Anotações</TableHead>
                <TableHead className="text-right">Comparação com Média</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fewestNotes?.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell className="font-medium">{agent.name}</TableCell>
                  <TableCell className="text-right">{agent.notesCount}</TableCell>
                  <TableCell className="text-right">
                    <span className={agent.notesCount < averageNotesPerAgent ? "text-red-500" : "text-green-500"}>
                      {Math.round((agent.notesCount / averageNotesPerAgent) * 100)}%
                    </span>
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
