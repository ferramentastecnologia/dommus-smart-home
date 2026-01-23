import React, { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash2, FileText } from "lucide-react";
import { useProjectsData } from "@/hooks/useProjectsData";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectDetailsDialog } from "./ProjectDetailsDialog";
import { Project } from "@/types/crm";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ProjectsListProps {
  searchTerm: string;
  statusFilter: string;
  typeFilter: string;
}

const statusColors: Record<string, string> = {
  "Orçamento": "bg-amber-500",
  "Aprovado": "bg-emerald-500",
  "Em Execução": "bg-blue-500",
  "Instalação": "bg-violet-500",
  "Finalizado": "bg-green-500",
  "Cancelado": "bg-red-500",
};

export function ProjectsList({ searchTerm, statusFilter, typeFilter }: ProjectsListProps) {
  const { projects, loading, deleteProject, fetchProjects } = useProjectsData();
  const navigate = useNavigate();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [startInEditMode, setStartInEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleView = (project: Project) => {
    setSelectedProject(project);
    setStartInEditMode(false);
    setShowDetails(true);
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setStartInEditMode(true);
    setShowDetails(true);
  };

  const handleCreateQuote = (project: Project) => {
    // Navigate to quotes page with project pre-selected
    navigate(`/quotes?projectId=${project.id}&clientId=${project.clientId}`);
    toast.success("Redirecionando para criar orçamento...");
  };

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;

    setIsDeleting(true);
    try {
      await deleteProject(projectToDelete.id);
      toast.success("Projeto excluído com sucesso!");
      setShowDeleteConfirm(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Erro ao excluir projeto");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    const matchesType = typeFilter === "all" || project.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  const formatCurrency = (value?: number) => {
    if (!value) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Projeto</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Valor Estimado</TableHead>
            <TableHead>Previsão</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProjects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                Nenhum projeto encontrado
              </TableCell>
            </TableRow>
          ) : (
            filteredProjects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>{project.client?.name || "-"}</TableCell>
                <TableCell>
                  <Badge variant="outline">{project.type}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[project.status] || "bg-gray-500"}>
                    {project.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatCurrency(project.estimatedValue)}</TableCell>
                <TableCell>
                  {project.estimatedEndDate
                    ? format(new Date(project.estimatedEndDate), "dd/MM/yyyy", { locale: ptBR })
                    : "-"}
                </TableCell>
                <TableCell>{project.agent?.name || "-"}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(project)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(project)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCreateQuote(project)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Criar Orçamento
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteClick(project)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Project Details Dialog */}
      <ProjectDetailsDialog
        project={selectedProject}
        open={showDetails}
        onOpenChange={(open) => {
          setShowDetails(open);
          if (!open) setStartInEditMode(false);
        }}
        onSave={() => fetchProjects()}
        startInEditMode={startInEditMode}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o projeto "{projectToDelete?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
