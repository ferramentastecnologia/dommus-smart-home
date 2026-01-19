import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building2, Calendar, DollarSign } from "lucide-react";
import { useProjectsData } from "@/hooks/useProjectsData";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProjectsKanbanProps {
  searchTerm: string;
  statusFilter: string;
  typeFilter: string;
}

const columns = [
  { id: "Orçamento", title: "Orçamento", color: "bg-amber-500" },
  { id: "Aprovado", title: "Aprovado", color: "bg-emerald-500" },
  { id: "Em Execução", title: "Em Execução", color: "bg-blue-500" },
  { id: "Instalação", title: "Instalação", color: "bg-violet-500" },
  { id: "Finalizado", title: "Finalizado", color: "bg-green-500" },
];

export function ProjectsKanban({ searchTerm, statusFilter, typeFilter }: ProjectsKanbanProps) {
  const { projects, loading, updateProjectStatus } = useProjectsData();

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    const matchesType = typeFilter === "all" || project.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getProjectsByStatus = (status: string) => {
    return filteredProjects.filter((p) => p.status === status);
  };

  const formatCurrency = (value?: number) => {
    if (!value) return "";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {columns.map((col) => (
          <div key={col.id} className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
      {columns.map((column) => {
        const columnProjects = getProjectsByStatus(column.id);
        return (
          <div key={column.id} className="min-w-[280px]">
            <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-muted">
              <div className={`w-3 h-3 rounded-full ${column.color}`} />
              <h3 className="font-semibold text-sm">{column.title}</h3>
              <Badge variant="secondary" className="ml-auto">
                {columnProjects.length}
              </Badge>
            </div>

            <div className="space-y-3">
              {columnProjects.map((project) => (
                <Card
                  key={project.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                >
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium line-clamp-1">
                      {project.name}
                    </CardTitle>
                    {project.client?.name && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {project.client.name}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-2">
                    <Badge variant="outline" className="text-xs">
                      {project.type}
                    </Badge>

                    {project.estimatedValue && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        {formatCurrency(project.estimatedValue)}
                      </div>
                    )}

                    {project.estimatedEndDate && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(project.estimatedEndDate), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    )}

                    {project.agent && (
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {project.agent.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {project.agent.name}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {columnProjects.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nenhum projeto
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
