import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/services/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Shield, Loader2, Mail, AlertTriangle } from "lucide-react";
import { useUser } from "@/hooks/auth/useUser";
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

interface AdminEmail {
  id: string;
  email: string;
  notes: string | null;
  created_at: string;
  added_by: string | null;
}

export function AdminEmailsSettings() {
  const { user } = useUser();
  const [adminEmails, setAdminEmails] = useState<AdminEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [emailToDelete, setEmailToDelete] = useState<AdminEmail | null>(null);
  const [tableExists, setTableExists] = useState(true);

  useEffect(() => {
    fetchAdminEmails();
  }, []);

  const fetchAdminEmails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_emails')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        if (error.code === '42P01') {
          // Tabela não existe
          setTableExists(false);
          console.log('Tabela admin_emails não existe ainda');
        } else {
          throw error;
        }
      } else {
        setTableExists(true);
        setAdminEmails(data || []);
      }
    } catch (error) {
      console.error("Error fetching admin emails:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmail = async () => {
    if (!newEmail.trim()) {
      toast.error("Digite um email válido");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(newEmail)) {
      toast.error("Formato de email inválido");
      return;
    }

    try {
      setIsAdding(true);
      const { error } = await supabase
        .from('admin_emails')
        .insert({
          email: newEmail.toLowerCase().trim(),
          notes: newNotes.trim() || null,
          added_by: user?.id
        });

      if (error) {
        if (error.code === '23505') {
          toast.error("Este email já está na lista de administradores");
        } else if (error.code === '42P01') {
          toast.error("Tabela não existe. Execute o SQL de setup primeiro.");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Administrador adicionado com sucesso!");
      setNewEmail("");
      setNewNotes("");
      await fetchAdminEmails();
    } catch (error) {
      console.error("Error adding admin email:", error);
      toast.error("Erro ao adicionar administrador");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteClick = (adminEmail: AdminEmail) => {
    // Não permitir deletar o próprio email
    if (adminEmail.email.toLowerCase() === user?.email?.toLowerCase()) {
      toast.error("Você não pode remover seu próprio acesso de administrador");
      return;
    }

    // Não permitir deletar se só tem 1 admin
    if (adminEmails.length <= 1) {
      toast.error("Deve haver pelo menos um administrador no sistema");
      return;
    }

    setEmailToDelete(adminEmail);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!emailToDelete) return;

    try {
      const { error } = await supabase
        .from('admin_emails')
        .delete()
        .eq('id', emailToDelete.id);

      if (error) throw error;

      toast.success("Administrador removido com sucesso");
      setDeleteDialogOpen(false);
      setEmailToDelete(null);
      await fetchAdminEmails();
    } catch (error) {
      console.error("Error deleting admin email:", error);
      toast.error("Erro ao remover administrador");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!tableExists) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <CardTitle>Configuração Necessária</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            A tabela de administradores ainda não foi criada no banco de dados.
          </p>
          <p className="text-sm text-muted-foreground">
            Execute o arquivo <code className="bg-muted px-1 rounded">supabase/SETUP_COMPLETO.sql</code> no SQL Editor do Supabase para criar todas as tabelas necessárias.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Administradores do Sistema</CardTitle>
          </div>
          <CardDescription>
            Gerencie quais emails têm acesso de administrador ao sistema.
            Administradores podem acessar todas as configurações e gerenciar a equipe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Formulário para adicionar novo admin */}
          <div className="flex flex-col gap-4 p-4 border rounded-lg bg-muted/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-admin-email">Email do Administrador</Label>
                <div className="relative">
                  <Input
                    id="new-admin-email"
                    type="email"
                    placeholder="admin@empresa.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    disabled={isAdding}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
                  />
                  <Mail className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-admin-notes">Observação (opcional)</Label>
                <Input
                  id="new-admin-notes"
                  placeholder="Ex: CEO, Desenvolvedor..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  disabled={isAdding}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleAddEmail} disabled={isAdding || !newEmail.trim()}>
                {isAdding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Administrador
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Lista de admins */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">
              Administradores Cadastrados ({adminEmails.length})
            </h4>
            {adminEmails.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum administrador cadastrado</p>
                <p className="text-sm">Adicione o primeiro administrador acima</p>
              </div>
            ) : (
              <div className="space-y-2">
                {adminEmails.map((adminEmail) => (
                  <div
                    key={adminEmail.id}
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{adminEmail.email}</span>
                          {adminEmail.email.toLowerCase() === user?.email?.toLowerCase() && (
                            <Badge variant="secondary" className="text-xs">Você</Badge>
                          )}
                        </div>
                        {adminEmail.notes && (
                          <span className="text-sm text-muted-foreground">{adminEmail.notes}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(adminEmail)}
                      disabled={adminEmail.email.toLowerCase() === user?.email?.toLowerCase() || adminEmails.length <= 1}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info box */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Como funciona:</strong> Usuários com email nesta lista terão automaticamente acesso de administrador ao fazer login, independente de outras configurações.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Administrador</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{emailToDelete?.email}</strong> da lista de administradores?
              <br /><br />
              Esta pessoa perderá acesso às configurações do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
