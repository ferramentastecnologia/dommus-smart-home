import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Phone, Edit, Eye, UserPlus, Lock, Loader2 } from "lucide-react";
import { Agent } from "@/types/crm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/services/supabase/client";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewAgentDialogOpen, setIsNewAgentDialogOpen] = useState(false);
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
        toast.error("Failed to load agents");
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAgent(prev => ({ ...prev, [name]: value }));
  };

  const handlePositionChange = (value: string) => {
    setNewAgent(prev => ({ ...prev, position: value }));
  };

  const handleRoleChange = (value: string) => {
    setNewAgent(prev => ({ ...prev, role: value }));
  };

  const handleToggleEmailInvite = (checked: boolean) => {
    setNewAgent(prev => ({ ...prev, sendEmailInvite: checked }));
  };

  const handleCreateAgent = async () => {
    try {
      // Validate input
      if (!newAgent.name || !newAgent.email || !newAgent.position || !newAgent.password) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      if (newAgent.password !== newAgent.passwordConfirmation) {
        toast.error("Passwords do not match");
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

      toast.success("Agent created successfully! A confirmation email has been sent.");
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
      const { data, error } = await supabase
        .from('agents')
        .select('*');
        
      if (error) throw error;
      setAgents(data);
    } catch (error) {
      console.error("Error creating agent:", error);
      toast.error(`Failed to create agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewLeads = (agentId: string) => {
    navigate(`/leads?agentId=${agentId}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
          <p className="text-muted-foreground">
            Manage your sales team.
          </p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => setIsNewAgentDialogOpen(true)}
        >
          <Plus size={18} className="mr-2" />
          Add Agent
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {agents.map(agent => (
          <Card key={agent.id} className="overflow-hidden border-border shadow-md hover:shadow-lg transition-all duration-300">
            <CardContent className="p-0">
              <div className="bg-primary/10 p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-4 border-background shadow-md">
                    <AvatarImage src={agent.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=0D8A6C&color=fff`} />
                    <AvatarFallback className="bg-primary text-primary-foreground">{agent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{agent.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20">{agent.position}</Badge>
                      <Badge variant={agent.status === 'active' ? 'success' : 'secondary'}>
                        {agent.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center">
                  <Mail size={16} className="text-primary mr-2" />
                  <p className="text-sm">{agent.email}</p>
                </div>
                <div className="flex items-center">
                  <Phone size={16} className="text-primary mr-2" />
                  <p className="text-sm">{agent.phone || "No phone number"}</p>
                </div>
                <div className="pt-4 flex justify-between gap-2 border-t border-border">
                  <Button variant="outline" size="sm" className="hover:bg-primary/10 flex-1">
                    <Edit size={14} className="mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="hover:bg-primary/10 flex-1"
                    onClick={() => handleViewLeads(agent.id)}
                  >
                    <Eye size={14} className="mr-1" />
                    View leads
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* New Agent Dialog */}
      <Dialog open={isNewAgentDialogOpen} onOpenChange={setIsNewAgentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Create New Agent</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input 
                  id="name"
                  name="name"
                  value={newAgent.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newAgent.email}
                    onChange={handleInputChange}
                    placeholder="agent@company.com"
                    disabled={isLoading}
                  />
                  <Mail className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Input
                    id="phone"
                    name="phone"
                    value={newAgent.phone}
                    onChange={handleInputChange}
                    placeholder="(123) 456-7890"
                    disabled={isLoading}
                  />
                  <Phone className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Position *</Label>
                <Select 
                  value={newAgent.position} 
                  onValueChange={handlePositionChange}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sales Representative">Sales Representative</SelectItem>
                    <SelectItem value="Sales Manager">Sales Manager</SelectItem>
                    <SelectItem value="Account Executive">Account Executive</SelectItem>
                    <SelectItem value="Customer Success">Customer Success</SelectItem>
                    <SelectItem value="Supervisor">Supervisor</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select 
                  value={newAgent.role} 
                  onValueChange={handleRoleChange}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={newAgent.password}
                    onChange={handleInputChange}
                    placeholder="Create password"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="passwordConfirmation">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="passwordConfirmation"
                    name="passwordConfirmation"
                    type="password"
                    value={newAgent.passwordConfirmation}
                    onChange={handleInputChange}
                    placeholder="Confirm password"
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
              <Label htmlFor="emailInvite">Send email invitation</Label>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsNewAgentDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateAgent}
              disabled={isLoading || !isFormValid}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Agent'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
