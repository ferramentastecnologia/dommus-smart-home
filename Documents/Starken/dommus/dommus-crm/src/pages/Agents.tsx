import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Phone, Edit, Eye, UserPlus, Lock, Loader2, Trash2, Power, PowerOff } from "lucide-react";
import { Agent } from "@/types/crm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/services/supabase/client";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewAgentDialogOpen, setIsNewAgentDialogOpen] = useState(false);
  const [isEditAgentDialogOpen, setIsEditAgentDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [newAgent, setNewAgent] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    role: "agent",
    password: "",
    passwordConfirmation: "",
    sendEmailInvite: false,
  });

  const [editAgent, setEditAgent] = useState({
    name: "",
    phone: "",
    position: "",
    role: "agent",
  });

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('agents')
          .select('*');

        if (error) throw error;
        setAgents(data);
      } catch (error) {
        console.error("Error fetching agents:", error);
        toast.error("Erro ao carregar equipe");
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const refreshAgents = async () => {
    const { data, error } = await supabase
      .from('agents')
      .select('*');
    if (!error && data) {
      setAgents(data);
    }
  };

  // Validate form fields
  const isFormValid =
    newAgent.name.trim() !== "" &&
    newAgent.email.trim() !== "" &&
    newAgent.position.trim() !== "" &&
    newAgent.role.trim() !== "" &&
    newAgent.password.trim() !== "" &&
    newAgent.password === newAgent.passwordConfirmation &&
    /\S+@\S+\.\S+/.test(newAgent.email)
  ;

  const isEditFormValid =
    editAgent.name.trim() !== "" &&
    editAgent.position.trim() !== "" &&
    editAgent.role.trim() !== ""
  ;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAgent(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditAgent(prev => ({ ...prev, [name]: value }));
  };

  const handlePositionChange = (value: string) => {
    setNewAgent(prev => ({ ...prev, position: value }));
  };

  const handleRoleChange = (value: string) => {
    setNewAgent(prev => ({ ...prev, role: value }));
  };

  const handleEditPositionChange = (value: string) => {
    setEditAgent(prev => ({ ...prev, position: value }));
  };

  const handleEditRoleChange = (value: string) => {
    setEditAgent(prev => ({ ...prev, role: value }));
  };

  const handleToggleEmailInvite = (checked: boolean) => {
    setNewAgent(prev => ({ ...prev, sendEmailInvite: checked }));
  };

  const handleOpenEditDialog = (agent: Agent) => {
    setSelectedAgent(agent);
    setEditAgent({
      name: agent.name,
      phone: agent.phone || "",
      position: agent.position || "",
      role: agent.role || "agent",
    });
    setIsEditAgentDialogOpen(true);
  };

  const handleUpdateAgent = async () => {
    if (!selectedAgent) return;

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('agents')
        .update({
          name: editAgent.name,
          phone: editAgent.phone,
          position: editAgent.position,
          role: editAgent.role,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedAgent.id);

      if (error) throw error;

      toast.success("Membro da equipe atualizado com sucesso!");
      setIsEditAgentDialogOpen(false);
      await refreshAgents();
    } catch (error) {
      console.error("Error updating agent:", error);
      toast.error("Erro ao atualizar membro da equipe");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (agent: Agent) => {
    try {
      const newStatus = agent.status === 'active' ? 'inactive' : 'active';

      const { error } = await supabase
        .from('agents')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', agent.id);

      if (error) throw error;

      toast.success(
        newStatus === 'active'
          ? "Membro ativado com sucesso!"
          : "Membro desativado com sucesso!"
      );
      await refreshAgents();
    } catch (error) {
      console.error("Error toggling agent status:", error);
      toast.error("Erro ao alterar status do membro");
    }
  };

  const handleDeleteAgent = async () => {
    if (!selectedAgent) return;

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', selectedAgent.id);

      if (error) throw error;

      toast.success("Membro removido com sucesso!");
      setIsDeleteDialogOpen(false);
      setSelectedAgent(null);
      await refreshAgents();
    } catch (error) {
      console.error("Error deleting agent:", error);
      toast.error("Erro ao remover membro da equipe");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDeleteDialog = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateAgent = async () => {
    try {
      // Validate input
      if (!newAgent.name || !newAgent.email || !newAgent.position || !newAgent.password) {
        toast.error("Preencha todos os campos obrigatórios");
        return;
      }

      if (newAgent.password !== newAgent.passwordConfirmation) {
        toast.error("As senhas não coincidem");
        return;
      }
      
      setIsLoading(true);
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newAgent.email,
        password: newAgent.password,
        options: {
          data: {
            name: newAgent.name,
            role: newAgent.role,
          },
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        }
      });

      if (authError) throw authError;

      // Create agent record com o telefone
      const { error: agentError } = await supabase
        .from('agents')
        .insert({
          id: authData.user?.id,
          name: newAgent.name,
          email: newAgent.email,
          phone: newAgent.phone,
          position: newAgent.position,
          role: newAgent.role,
          status: 'active',
          user_id: authData.user?.id,
        });

      if (agentError) throw agentError;

      // Se o usuário optou por não enviar email de convite, envie manualmente
      if (!newAgent.sendEmailInvite) {
        const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(newAgent.email, {
          data: {
            name: newAgent.name,
            role: newAgent.role,
          }
        });
        
        if (inviteError) {
          console.warn("Could not send manual invitation:", inviteError);
          // Continue anyway as the user account was created
        }
      }

      toast.success("Membro criado com sucesso! Um e-mail de confirmação foi enviado.");
      setIsNewAgentDialogOpen(false);

      // Reset form
      setNewAgent({
        name: "",
        email: "",
        phone: "",
        position: "",
        role: "agent",
        password: "",
        passwordConfirmation: "",
        sendEmailInvite: false,
      });

      // Refresh agent list
      await refreshAgents();
    } catch (error) {
      console.error("Error creating agent:", error);
      toast.error(`Erro ao criar membro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewLeads = (agentId: string) => {
    navigate(`/leads?agentId=${agentId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipe</h1>
          <p className="text-muted-foreground">
            Gerencie sua equipe de vendas e atendimento.
          </p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90"
          onClick={() => setIsNewAgentDialogOpen(true)}
        >
          <Plus size={18} className="mr-2" />
          Adicionar Membro
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {agents.map(agent => (
          <Card key={agent.id} className={`overflow-hidden border-border shadow-md hover:shadow-lg transition-all duration-300 ${agent.status !== 'active' ? 'opacity-60' : ''}`}>
            <CardContent className="p-0">
              <div className="bg-primary/10 p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-4 border-background shadow-md">
                    <AvatarImage src={agent.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=0D8A6C&color=fff`} />
                    <AvatarFallback className="bg-primary text-primary-foreground">{agent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{agent.name}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20">{agent.position || 'Sem cargo'}</Badge>
                      <Badge variant={agent.status === 'active' ? 'success' : 'secondary'}>
                        {agent.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                      {agent.role === 'admin' && (
                        <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">Admin</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center">
                  <Mail size={16} className="text-primary mr-2" />
                  <p className="text-sm truncate">{agent.email}</p>
                </div>
                <div className="flex items-center">
                  <Phone size={16} className="text-primary mr-2" />
                  <p className="text-sm">{agent.phone || "Sem telefone"}</p>
                </div>
                <div className="pt-4 flex flex-wrap justify-between gap-2 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-primary/10 flex-1"
                    onClick={() => handleOpenEditDialog(agent)}
                  >
                    <Edit size={14} className="mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-primary/10 flex-1"
                    onClick={() => handleViewLeads(agent.id)}
                  >
                    <Eye size={14} className="mr-1" />
                    Ver Leads
                  </Button>
                </div>
                <div className="flex justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`flex-1 ${agent.status === 'active' ? 'hover:bg-orange-100 hover:text-orange-700 hover:border-orange-300' : 'hover:bg-green-100 hover:text-green-700 hover:border-green-300'}`}
                    onClick={() => handleToggleStatus(agent)}
                  >
                    {agent.status === 'active' ? (
                      <>
                        <PowerOff size={14} className="mr-1" />
                        Desativar
                      </>
                    ) : (
                      <>
                        <Power size={14} className="mr-1" />
                        Ativar
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-red-100 hover:text-red-700 hover:border-red-300"
                    onClick={() => handleOpenDeleteDialog(agent)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {agents.length === 0 && (
        <div className="text-center py-12">
          <UserPlus size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhum membro na equipe</h3>
          <p className="text-muted-foreground mb-4">Adicione membros para começar a gerenciar sua equipe.</p>
          <Button onClick={() => setIsNewAgentDialogOpen(true)}>
            <Plus size={18} className="mr-2" />
            Adicionar Primeiro Membro
          </Button>
        </div>
      )}

      {/* New Agent Dialog */}
      <Dialog open={isNewAgentDialogOpen} onOpenChange={setIsNewAgentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Novo Membro</DialogTitle>
            <DialogDescription>Adicione um novo membro à equipe</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  name="name"
                  value={newAgent.name}
                  onChange={handleInputChange}
                  placeholder="João Silva"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newAgent.email}
                    onChange={handleInputChange}
                    placeholder="membro@empresa.com"
                    disabled={isLoading}
                  />
                  <Mail className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <div className="relative">
                  <Input
                    id="phone"
                    name="phone"
                    value={newAgent.phone}
                    onChange={handleInputChange}
                    placeholder="(47) 99999-9999"
                    disabled={isLoading}
                  />
                  <Phone className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Cargo *</Label>
                <Select
                  value={newAgent.position}
                  onValueChange={handlePositionChange}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vendedor">Vendedor</SelectItem>
                    <SelectItem value="Gerente de Vendas">Gerente de Vendas</SelectItem>
                    <SelectItem value="Executivo de Contas">Executivo de Contas</SelectItem>
                    <SelectItem value="Atendimento">Atendimento</SelectItem>
                    <SelectItem value="Supervisor">Supervisor</SelectItem>
                    <SelectItem value="Técnico">Técnico</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Função *</Label>
                <Select
                  value={newAgent.role}
                  onValueChange={handleRoleChange}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">Membro</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={newAgent.password}
                    onChange={handleInputChange}
                    placeholder="Criar senha"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="passwordConfirmation">Confirmar Senha *</Label>
                <div className="relative">
                  <Input
                    id="passwordConfirmation"
                    name="passwordConfirmation"
                    type="password"
                    value={newAgent.passwordConfirmation}
                    onChange={handleInputChange}
                    placeholder="Confirmar senha"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="emailInvite"
                checked={newAgent.sendEmailInvite}
                onCheckedChange={handleToggleEmailInvite}
                disabled={isLoading}
              />
              <Label htmlFor="emailInvite">Enviar convite por e-mail</Label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsNewAgentDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateAgent}
              disabled={isLoading || !isFormValid}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Membro'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Agent Dialog */}
      <Dialog open={isEditAgentDialogOpen} onOpenChange={setIsEditAgentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Editar Membro</DialogTitle>
            <DialogDescription>Atualize as informações do membro</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome Completo *</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={editAgent.name}
                  onChange={handleEditInputChange}
                  placeholder="João Silva"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone">Telefone</Label>
              <div className="relative">
                <Input
                  id="edit-phone"
                  name="phone"
                  value={editAgent.phone}
                  onChange={handleEditInputChange}
                  placeholder="(47) 99999-9999"
                  disabled={isLoading}
                />
                <Phone className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-position">Cargo *</Label>
                <Select
                  value={editAgent.position}
                  onValueChange={handleEditPositionChange}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vendedor">Vendedor</SelectItem>
                    <SelectItem value="Gerente de Vendas">Gerente de Vendas</SelectItem>
                    <SelectItem value="Executivo de Contas">Executivo de Contas</SelectItem>
                    <SelectItem value="Atendimento">Atendimento</SelectItem>
                    <SelectItem value="Supervisor">Supervisor</SelectItem>
                    <SelectItem value="Técnico">Técnico</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Função *</Label>
                <Select
                  value={editAgent.role}
                  onValueChange={handleEditRoleChange}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">Membro</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditAgentDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateAgent}
              disabled={isLoading || !isEditFormValid}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{selectedAgent?.name}</strong> da equipe?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAgent}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removendo...
                </>
              ) : (
                'Remover'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
