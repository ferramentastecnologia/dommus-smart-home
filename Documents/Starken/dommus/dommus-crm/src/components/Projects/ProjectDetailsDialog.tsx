import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Edit,
  Save,
  X,
  Calendar,
  MapPin,
  User,
  DollarSign,
  FileText,
  Building2,
  Loader2,
} from "lucide-react";
import { Project, ProjectStatus, ProjectType } from "@/types/crm";
import { useProjectsData } from "@/hooks/useProjectsData";
import { useClientsData } from "@/hooks/useClientsData";
import { useAgents } from "@/hooks/useAgents";

interface ProjectDetailsDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: () => void;
  startInEditMode?: boolean;
}

const projectStatuses: ProjectStatus[] = [
  "Orçamento",
  "Aprovado",
  "Em Execução",
  "Instalação",
  "Finalizado",
  "Cancelado",
];

const projectTypes: ProjectType[] = [
  "Residencial",
  "Comercial",
  "Corporativo",
  "Academia",
  "Hotel",
  "Restaurante",
  "Outro",
];

const statusColors: Record<string, string> = {
  Orçamento: "bg-amber-500",
  Aprovado: "bg-emerald-500",
  "Em Execução": "bg-blue-500",
  Instalação: "bg-violet-500",
  Finalizado: "bg-green-500",
  Cancelado: "bg-red-500",
};

export function ProjectDetailsDialog({
  project,
  open,
  onOpenChange,
  onSave,
  startInEditMode = false,
}: ProjectDetailsDialogProps) {
  const { updateProject } = useProjectsData();
  const { clients } = useClientsData();
  const { agents } = useAgents();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    clientId: "",
    status: "Orçamento" as ProjectStatus,
    type: "Residencial" as ProjectType,
    estimatedValue: 0,
    finalValue: 0,
    startDate: "",
    estimatedEndDate: "",
    address: "",
    city: "",
    state: "",
    agentId: "",
    notes: "",
  });

  // Load project data when dialog opens
  useEffect(() => {
    if (project && open) {
      setFormData({
        name: project.name || "",
        description: project.description || "",
        clientId: project.clientId || "",
        status: project.status || "Orçamento",
        type: project.type || "Residencial",
        estimatedValue: project.estimatedValue || 0,
        finalValue: project.finalValue || 0,
        startDate: project.startDate
          ? format(new Date(project.startDate), "yyyy-MM-dd")
          : "",
        estimatedEndDate: project.estimatedEndDate
          ? format(new Date(project.estimatedEndDate), "yyyy-MM-dd")
          : "",
        address: project.address || "",
        city: project.city || "",
        state: project.state || "",
        agentId: project.agentId || "",
        notes: project.notes || "",
      });
      setIsEditing(startInEditMode);
      setHasChanges(false);
    }
  }, [project, open, startInEditMode]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!project) return;

    setIsSaving(true);
    try {
      await updateProject(project.id, {
        name: formData.name,
        description: formData.description,
        clientId: formData.clientId,
        status: formData.status,
        type: formData.type,
        estimatedValue: formData.estimatedValue,
        finalValue: formData.finalValue,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        estimatedEndDate: formData.estimatedEndDate
          ? new Date(formData.estimatedEndDate)
          : undefined,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        agentId: formData.agentId || undefined,
        notes: formData.notes,
      });

      toast.success("Projeto atualizado com sucesso!");
      setIsEditing(false);
      setHasChanges(false);
      onSave?.();
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Erro ao salvar projeto");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (hasChanges && isEditing) {
      setShowConfirmClose(true);
    } else {
      onOpenChange(false);
    }
  };

  const confirmClose = () => {
    setShowConfirmClose(false);
    setIsEditing(false);
    setHasChanges(false);
    onOpenChange(false);
  };

  const formatCurrency = (value?: number) => {
    if (!value) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (!project) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  {isEditing ? "Editar Projeto" : project.name}
                </DialogTitle>
                <DialogDescription>
                  {isEditing
                    ? "Edite os dados do projeto"
                    : `Criado em ${format(new Date(project.createdAt), "dd/MM/yyyy", { locale: ptBR })}`}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        if (project) {
                          setFormData({
                            name: project.name || "",
                            description: project.description || "",
                            clientId: project.clientId || "",
                            status: project.status || "Orçamento",
                            type: project.type || "Residencial",
                            estimatedValue: project.estimatedValue || 0,
                            finalValue: project.finalValue || 0,
                            startDate: project.startDate
                              ? format(new Date(project.startDate), "yyyy-MM-dd")
                              : "",
                            estimatedEndDate: project.estimatedEndDate
                              ? format(new Date(project.estimatedEndDate), "yyyy-MM-dd")
                              : "",
                            address: project.address || "",
                            city: project.city || "",
                            state: project.state || "",
                            agentId: project.agentId || "",
                            notes: project.notes || "",
                          });
                        }
                        setHasChanges(false);
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Salvar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogHeader>

          <Tabs defaultValue="info" className="mt-4">
            <TabsList>
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="address">Endereço</TabsTrigger>
              <TabsTrigger value="financial">Financeiro</TabsTrigger>
              <TabsTrigger value="notes">Observações</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Projeto</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Ex: Automação Residencial - Casa Silva"
                    />
                  ) : (
                    <p className="text-sm font-medium">{project.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client">Cliente</Label>
                  {isEditing ? (
                    <Select
                      value={formData.clientId}
                      onValueChange={(value) => handleChange("clientId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {project.client?.name || "-"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  {isEditing ? (
                    <Select
                      value={formData.status}
                      onValueChange={(value: ProjectStatus) =>
                        handleChange("status", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {projectStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={statusColors[project.status] || "bg-gray-500"}>
                      {project.status}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Projeto</Label>
                  {isEditing ? (
                    <Select
                      value={formData.type}
                      onValueChange={(value: ProjectType) =>
                        handleChange("type", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {projectTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline">{project.type}</Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Data de Início</Label>
                  {isEditing ? (
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleChange("startDate", e.target.value)}
                    />
                  ) : (
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {project.startDate
                        ? format(new Date(project.startDate), "dd/MM/yyyy", {
                            locale: ptBR,
                          })
                        : "-"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedEndDate">Previsão de Término</Label>
                  {isEditing ? (
                    <Input
                      id="estimatedEndDate"
                      type="date"
                      value={formData.estimatedEndDate}
                      onChange={(e) =>
                        handleChange("estimatedEndDate", e.target.value)
                      }
                    />
                  ) : (
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {project.estimatedEndDate
                        ? format(new Date(project.estimatedEndDate), "dd/MM/yyyy", {
                            locale: ptBR,
                          })
                        : "-"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agent">Responsável</Label>
                  {isEditing ? (
                    <Select
                      value={formData.agentId}
                      onValueChange={(value) => handleChange("agentId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o responsável" />
                      </SelectTrigger>
                      <SelectContent>
                        {agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {project.agent?.name || "-"}
                    </p>
                  )}
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  {isEditing ? (
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder="Descrição do projeto..."
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {project.description || "Sem descrição"}
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="address" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  {isEditing ? (
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      placeholder="Rua, número, complemento"
                    />
                  ) : (
                    <p className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {project.address || "-"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  {isEditing ? (
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      placeholder="Cidade"
                    />
                  ) : (
                    <p className="text-sm font-medium">{project.city || "-"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  {isEditing ? (
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleChange("state", e.target.value)}
                      placeholder="UF"
                      maxLength={2}
                    />
                  ) : (
                    <p className="text-sm font-medium">{project.state || "-"}</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="financial" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Valor Estimado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={formData.estimatedValue}
                        onChange={(e) =>
                          handleChange("estimatedValue", parseFloat(e.target.value) || 0)
                        }
                        placeholder="0,00"
                        step="0.01"
                      />
                    ) : (
                      <p className="text-2xl font-bold text-primary flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        {formatCurrency(project.estimatedValue)}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Valor Final
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={formData.finalValue}
                        onChange={(e) =>
                          handleChange("finalValue", parseFloat(e.target.value) || 0)
                        }
                        placeholder="0,00"
                        step="0.01"
                      />
                    ) : (
                      <p className="text-2xl font-bold text-green-600 flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        {formatCurrency(project.finalValue)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                {isEditing ? (
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    placeholder="Observações sobre o projeto..."
                    rows={6}
                  />
                ) : (
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {project.notes || "Nenhuma observação registrada."}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmClose} onOpenChange={setShowConfirmClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem alterações não salvas. Tem certeza que deseja sair sem salvar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar editando</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClose}>
              Descartar alterações
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
