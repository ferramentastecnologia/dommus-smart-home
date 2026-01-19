import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Edit, Trash, SaveIcon, AlertCircle, ChevronUp, ChevronDown, CircleSlash, Mail, Calendar } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/services/supabase/client";
import { LeadStatusConfig, TaskStatusConfig } from "@/types/crm";
import { toast } from "sonner";
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
import { useStatus } from "@/contexts/StatusContext";
import { LeadSourcesSettings } from "@/components/Settings/LeadSourcesSettings";
import { ClientStatusSettings } from "@/components/Settings/ClientStatusSettings";

export default function Settings() {
  // User state
  const { user } = useUser();
  const { leadStatuses, taskStatuses, refreshStatuses } = useStatus();
  
  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
    phone: "",
    position: ""
  });
  
  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  // Company settings state
  const [companySettings, setCompanySettings] = useState({
    name: "CRM Pro",
    email: "contact@crmpro.com",
    phone: "(123) 456-7890",
    website: "www.crmpro.com",
    address: ""
  });
  
  // Pipeline tabs state - default to "leads"
  const [pipelineTab, setPipelineTab] = useState("leads");
  
  // Pipeline - Lead Status Management
  const [isLeadStatusDialogOpen, setIsLeadStatusDialogOpen] = useState(false);
  const [isDeleteLeadStatusDialogOpen, setIsDeleteLeadStatusDialogOpen] = useState(false);
  const [currentLeadStatus, setCurrentLeadStatus] = useState<LeadStatusConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Pipeline - Task Status Management
  const [isTaskStatusDialogOpen, setIsTaskStatusDialogOpen] = useState(false);
  const [isDeleteTaskStatusDialogOpen, setIsDeleteTaskStatusDialogOpen] = useState(false);
  const [currentTaskStatus, setCurrentTaskStatus] = useState<TaskStatusConfig | null>(null);
  const [isEditingTask, setIsEditingTask] = useState(false);
  
  // Load user data on mount
  useEffect(() => {
    if (user) {
      setUserProfile({
        name: user.user_metadata?.name || "",
        email: user.email || "",
        phone: user.user_metadata?.phone || "",
        position: user.user_metadata?.position || user.user_metadata?.role || ""
      });
    }
  }, [user]);

  // Handle input changes
  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setUserProfile(prev => ({ ...prev, [id]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const fieldName = id.replace("password-", "");
    setPasswordData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleCompanyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const fieldName = id.replace("company-", "");
    setCompanySettings(prev => ({ ...prev, [fieldName]: value }));
  };

  // Save user profile
  const saveUserProfile = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        email: userProfile.email,
        data: {
          name: userProfile.name,
          phone: userProfile.phone,
        }
      });
      
      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  // Change password
  const changePassword = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error("New passwords don't match");
        return;
      }
      
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });
      
      if (error) throw error;
      
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      toast.success("Password changed successfully");
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password");
    }
  };

  // Save company settings
  const saveCompanySettings = async () => {
    try {
      // Verificar se já existe uma configuração
      const { data, error: fetchError } = await supabase
        .from('settings')
        .select('*')
        .limit(1);
        
      if (fetchError) throw fetchError;
      
      if (data && data.length > 0) {
        // Update existing settings
        const { error } = await supabase
          .from('settings')
          .update({
            company_name: companySettings.name,
            company_email: companySettings.email,
            company_phone: companySettings.phone,
            company_website: companySettings.website,
            company_address: companySettings.address,
            updated_at: new Date(),
            updated_by: user?.id
          })
          .eq('id', data[0].id);
          
        if (error) throw error;
      } else {
        // Create new settings
        const { error } = await supabase
          .from('settings')
          .insert({
            company_name: companySettings.name,
            company_email: companySettings.email,
            company_phone: companySettings.phone,
            company_website: companySettings.website,
            company_address: companySettings.address,
            created_by: user?.id,
            updated_by: user?.id
          });
          
        if (error) throw error;
      }
      
      toast.success("Company settings saved successfully");
    } catch (error) {
      console.error("Error saving company settings:", error);
      toast.error("Failed to save company settings");
    }
  };
  
  // Open dialog to add new lead status
  const openAddLeadStatusDialog = () => {
    setCurrentLeadStatus({
      id: "",
      name: "",
      color: "#3B82F6",
      description: "",
      order_index: leadStatuses.length + 1,
      is_default: false,
      is_converted: false,
      is_discarded: false
    });
    setIsEditing(false);
    setIsLeadStatusDialogOpen(true);
  };
  
  // Open dialog to edit lead status
  const openEditLeadStatusDialog = (status: LeadStatusConfig) => {
    setCurrentLeadStatus({ ...status });
    setIsEditing(true);
    setIsLeadStatusDialogOpen(true);
  };
  
  // Handle lead status form input change
  const handleLeadStatusChange = (field: string, value: string | boolean) => {
    if (currentLeadStatus) {
      setCurrentLeadStatus({
        ...currentLeadStatus,
        [field]: value
      });
    }
  };
  
  // Save lead status (create or update)
  const saveLeadStatus = async () => {
    if (!currentLeadStatus?.name) {
      toast.error("Name is required");
      return;
    }
    
    try {
      if (isEditing) {
        // Update existing status
        const { error } = await supabase
          .from('lead_statuses')
          .update({
            name: currentLeadStatus.name,
            color: currentLeadStatus.color,
            description: currentLeadStatus.description,
            order_index: currentLeadStatus.order_index,
            is_default: currentLeadStatus.is_default,
            is_converted: currentLeadStatus.is_converted,
            is_discarded: currentLeadStatus.is_discarded,
            updated_at: new Date()
          })
          .eq('id', currentLeadStatus.id);
          
        if (error) throw error;
      } else {
        // Create new status
        const { error } = await supabase
          .from('lead_statuses')
          .insert({
            name: currentLeadStatus.name,
            color: currentLeadStatus.color,
            description: currentLeadStatus.description,
            order_index: currentLeadStatus.order_index,
            is_default: currentLeadStatus.is_default,
            is_converted: currentLeadStatus.is_converted,
            is_discarded: currentLeadStatus.is_discarded
          });
          
        if (error) throw error;
      }
      
      setIsLeadStatusDialogOpen(false);
      refreshStatuses();
      toast.success(`Lead status ${isEditing ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error("Error saving lead status:", error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} lead status`);
    }
  };
  
  // Open dialog to confirm delete
  const openDeleteLeadStatusDialog = (status: LeadStatusConfig) => {
    setCurrentLeadStatus(status);
    setIsDeleteLeadStatusDialogOpen(true);
  };
  
  // Delete lead status
  const deleteLeadStatus = async () => {
    if (!currentLeadStatus) return;
    
    try {
      // First check if any leads are using this status
      const { data: leadsUsingStatus, error: checkError } = await supabase
        .from('leads')
        .select('id')
        .eq('status_id', currentLeadStatus.id)
        .limit(1);
        
      if (checkError) throw checkError;
      
      if (leadsUsingStatus && leadsUsingStatus.length > 0) {
        toast.error("Cannot delete status that is being used by leads");
        setIsDeleteLeadStatusDialogOpen(false);
        return;
      }
      
      // If no leads are using this status, proceed with deletion
      const { error } = await supabase
        .from('lead_statuses')
        .delete()
        .eq('id', currentLeadStatus.id);
        
      if (error) throw error;
      
      setIsDeleteLeadStatusDialogOpen(false);
      refreshStatuses();
      toast.success("Lead status deleted successfully");
    } catch (error) {
      console.error("Error deleting lead status:", error);
      toast.error("Failed to delete lead status");
    }
  };
  
  // Move lead status up in order
  const moveLeadStatusUp = async (index: number) => {
    if (index === 0) return; // Already at the top
    
    try {
      const newOrderIndex = leadStatuses[index].order_index - 1;
      const prevStatus = leadStatuses[index - 1];
      
      // Update current status
      await supabase
        .from('lead_statuses')
        .update({ order_index: newOrderIndex })
        .eq('id', leadStatuses[index].id);
        
      // Update previous status
      await supabase
        .from('lead_statuses')
        .update({ order_index: leadStatuses[index].order_index })
        .eq('id', prevStatus.id);
        
      refreshStatuses();
    } catch (error) {
      console.error("Error reordering statuses:", error);
      toast.error("Failed to reorder statuses");
    }
  };
  
  // Move lead status down in order
  const moveLeadStatusDown = async (index: number) => {
    if (index === leadStatuses.length - 1) return; // Already at the bottom
    
    try {
      const newOrderIndex = leadStatuses[index].order_index + 1;
      const nextStatus = leadStatuses[index + 1];
      
      // Update current status
      await supabase
        .from('lead_statuses')
        .update({ order_index: newOrderIndex })
        .eq('id', leadStatuses[index].id);
        
      // Update next status
      await supabase
        .from('lead_statuses')
        .update({ order_index: leadStatuses[index].order_index })
        .eq('id', nextStatus.id);
        
      refreshStatuses();
    } catch (error) {
      console.error("Error reordering statuses:", error);
      toast.error("Failed to reorder statuses");
    }
  };
  
  // Open dialog to add new task status
  const openAddTaskStatusDialog = () => {
    setCurrentTaskStatus({
      id: "",
      name: "",
      color: "#3B82F6",
      description: "",
      order_index: taskStatuses.length + 1,
      is_default: false,
      is_completed: false,
      is_canceled: false
    });
    setIsEditingTask(false);
    setIsTaskStatusDialogOpen(true);
  };
  
  // Open dialog to edit task status
  const openEditTaskStatusDialog = (status: TaskStatusConfig) => {
    setCurrentTaskStatus({ ...status });
    setIsEditingTask(true);
    setIsTaskStatusDialogOpen(true);
  };
  
  // Handle task status form input change
  const handleTaskStatusChange = (field: string, value: string | boolean) => {
    if (currentTaskStatus) {
      setCurrentTaskStatus({
        ...currentTaskStatus,
        [field]: value
      });
    }
  };
  
  // Save task status (create or update)
  const saveTaskStatus = async () => {
    if (!currentTaskStatus?.name) {
      toast.error("Name is required");
      return;
    }
    
    try {
      if (isEditingTask) {
        // Update existing status
        const { error } = await supabase
          .from('task_statuses')
          .update({
            name: currentTaskStatus.name,
            color: currentTaskStatus.color,
            description: currentTaskStatus.description,
            order_index: currentTaskStatus.order_index,
            is_default: currentTaskStatus.is_default,
            is_completed: currentTaskStatus.is_completed,
            is_canceled: currentTaskStatus.is_canceled,
            updated_at: new Date()
          })
          .eq('id', currentTaskStatus.id);
          
        if (error) throw error;
      } else {
        // Create new status
        const { error } = await supabase
          .from('task_statuses')
          .insert({
            name: currentTaskStatus.name,
            color: currentTaskStatus.color,
            description: currentTaskStatus.description,
            order_index: currentTaskStatus.order_index,
            is_default: currentTaskStatus.is_default,
            is_completed: currentTaskStatus.is_completed,
            is_canceled: currentTaskStatus.is_canceled
          });
          
        if (error) throw error;
      }
      
      setIsTaskStatusDialogOpen(false);
      refreshStatuses();
      toast.success(`Task status ${isEditingTask ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error("Error saving task status:", error);
      toast.error(`Failed to ${isEditingTask ? 'update' : 'create'} task status`);
    }
  };
  
  // Open dialog to confirm delete
  const openDeleteTaskStatusDialog = (status: TaskStatusConfig) => {
    setCurrentTaskStatus(status);
    setIsDeleteTaskStatusDialogOpen(true);
  };
  
  // Delete task status
  const deleteTaskStatus = async () => {
    if (!currentTaskStatus) return;
    
    try {
      // First check if any tasks are using this status
      const { data: tasksUsingStatus, error: checkError } = await supabase
        .from('tasks')
        .select('id')
        .eq('status_id', currentTaskStatus.id)
        .limit(1);
        
      if (checkError) throw checkError;
      
      if (tasksUsingStatus && tasksUsingStatus.length > 0) {
        toast.error("Cannot delete status that is being used by tasks");
        setIsDeleteTaskStatusDialogOpen(false);
        return;
      }
      
      // If no tasks are using this status, proceed with deletion
      const { error } = await supabase
        .from('task_statuses')
        .delete()
        .eq('id', currentTaskStatus.id);
        
      if (error) throw error;
      
      setIsDeleteTaskStatusDialogOpen(false);
      refreshStatuses();
      toast.success("Task status deleted successfully");
    } catch (error) {
      console.error("Error deleting task status:", error);
      toast.error("Failed to delete task status");
    }
  };
  
  // Move task status up in order
  const moveTaskStatusUp = async (index: number) => {
    if (index === 0) return; // Already at the top
    
    try {
      const newOrderIndex = taskStatuses[index].order_index - 1;
      const prevStatus = taskStatuses[index - 1];
      
      // Update current status
      await supabase
        .from('task_statuses')
        .update({ order_index: newOrderIndex })
        .eq('id', taskStatuses[index].id);
        
      // Update previous status
      await supabase
        .from('task_statuses')
        .update({ order_index: taskStatuses[index].order_index })
        .eq('id', prevStatus.id);
        
      refreshStatuses();
    } catch (error) {
      console.error("Error reordering statuses:", error);
      toast.error("Failed to reorder statuses");
    }
  };
  
  // Move task status down in order
  const moveTaskStatusDown = async (index: number) => {
    if (index === taskStatuses.length - 1) return; // Already at the bottom
    
    try {
      const newOrderIndex = taskStatuses[index].order_index + 1;
      const nextStatus = taskStatuses[index + 1];
      
      // Update current status
      await supabase
        .from('task_statuses')
        .update({ order_index: newOrderIndex })
        .eq('id', taskStatuses[index].id);
        
      // Update next status
      await supabase
        .from('task_statuses')
        .update({ order_index: taskStatuses[index].order_index })
        .eq('id', nextStatus.id);
        
      refreshStatuses();
    } catch (error) {
      console.error("Error reordering statuses:", error);
      toast.error("Failed to reorder statuses");
    }
  };

  /* Pipeline Management Tab Content */
  const PipelineContent = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Management</CardTitle>
          <CardDescription>
            Configure your sales and client management pipelines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={pipelineTab} onValueChange={setPipelineTab}>
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="leads">Lead Statuses</TabsTrigger>
              <TabsTrigger value="tasks">Task Statuses</TabsTrigger>
              <TabsTrigger value="clients">Client Statuses</TabsTrigger>
            </TabsList>
            
            <TabsContent value="leads" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Lead Status Management</CardTitle>
                    <CardDescription>
                      Manage your lead statuses and pipeline flow
                    </CardDescription>
                  </div>
                  <Button onClick={openAddLeadStatusDialog}>Add Status</Button>
                </CardHeader>
                <CardContent>
                  {leadStatuses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center space-y-2 p-4">
                      <CircleSlash className="h-10 w-10 text-muted-foreground" />
                      <p className="text-muted-foreground text-center">No lead statuses defined yet.</p>
                      <p className="text-muted-foreground text-center">Add your first lead status to get started.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {leadStatuses.map((status, index) => (
                        <div key={status.id} className="flex items-center justify-between p-3 border rounded-md">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: status.color || '#888888' }} 
                            />
                            <span className="font-medium">{status.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              disabled={index === 0}
                              onClick={() => moveLeadStatusUp(index)}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              disabled={index === leadStatuses.length - 1}
                              onClick={() => moveLeadStatusDown(index)}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => openEditLeadStatusDialog(status)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => openDeleteLeadStatusDialog(status)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tasks" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Task Status Management</CardTitle>
                    <CardDescription>
                      Manage your task statuses and workflow
                    </CardDescription>
                  </div>
                  <Button onClick={openAddTaskStatusDialog}>Add Status</Button>
                </CardHeader>
                <CardContent>
                  {taskStatuses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center space-y-2 p-4">
                      <CircleSlash className="h-10 w-10 text-muted-foreground" />
                      <p className="text-muted-foreground text-center">No task statuses defined yet.</p>
                      <p className="text-muted-foreground text-center">Add your first task status to get started.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {taskStatuses.map((status, index) => (
                        <div key={status.id} className="flex items-center justify-between p-3 border rounded-md">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: status.color || '#888888' }} 
                            />
                            <span className="font-medium">{status.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              disabled={index === 0}
                              onClick={() => moveTaskStatusUp(index)}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              disabled={index === taskStatuses.length - 1}
                              onClick={() => moveTaskStatusDown(index)}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => openEditTaskStatusDialog(status)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => openDeleteTaskStatusDialog(status)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="clients" className="space-y-4">
              <ClientStatusSettings />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Lead Sources Section */}
      <LeadSourcesSettings />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your CRM settings.
        </p>
      </div>
      
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>
                Manage your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    value={userProfile.name} 
                    onChange={handleUserInputChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    value={userProfile.email} 
                    onChange={handleUserInputChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    value={userProfile.phone} 
                    onChange={handleUserInputChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input 
                    id="position" 
                    value={userProfile.position} 
                    disabled 
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={saveUserProfile}>Save changes</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage your password and authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password-currentPassword">Current password</Label>
                <Input 
                  id="password-currentPassword" 
                  type="password" 
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password-newPassword">New password</Label>
                  <Input 
                    id="password-newPassword" 
                    type="password" 
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-confirmPassword">Confirm password</Label>
                  <Input 
                    id="password-confirmPassword" 
                    type="password" 
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={changePassword}>Change password</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="company" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Configure your company information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company name</Label>
                  <Input 
                    id="company-name" 
                    value={companySettings.name}
                    onChange={handleCompanyInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-email">Contact email</Label>
                  <Input 
                    id="company-email" 
                    value={companySettings.email}
                    onChange={handleCompanyInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-phone">Phone</Label>
                  <Input 
                    id="company-phone" 
                    value={companySettings.phone}
                    onChange={handleCompanyInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-website">Website</Label>
                  <Input 
                    id="company-website" 
                    value={companySettings.website}
                    onChange={handleCompanyInputChange}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="company-address">Address</Label>
                  <Input 
                    id="company-address" 
                    value={companySettings.address}
                    onChange={handleCompanyInputChange}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={saveCompanySettings}>Save changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pipeline" className="space-y-4 mt-6">
          {PipelineContent()}
        </TabsContent>
        
        <TabsContent value="integrations" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Integration</CardTitle>
              <CardDescription>
                Connect your email account to send and receive emails
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between border rounded-md p-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium">Email Service</p>
                    <p className="text-sm text-muted-foreground">Connect your SMTP server</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/mailing'}
                >
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Calendar Integration</CardTitle>
              <CardDescription>
                Connect your calendar to manage appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between border rounded-md p-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium">Google Calendar</p>
                    <p className="text-sm text-muted-foreground">Sync your appointments and events</p>
                  </div>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => toast.info("Google Calendar links will be automatically generated when creating meetings. No integration required.")}
                >
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Lead Status Dialog */}
      <Dialog open={isLeadStatusDialogOpen} onOpenChange={(open) => {
        if (!open) setIsLeadStatusDialogOpen(false);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Lead Status' : 'Add Lead Status'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Update the details of this lead status' 
                : 'Create a new status for your lead pipeline'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status-name">Status name</Label>
              <Input 
                id="status-name" 
                value={currentLeadStatus?.name || ''}
                onChange={(e) => handleLeadStatusChange('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-description">Description (optional)</Label>
              <Input 
                id="status-description" 
                value={currentLeadStatus?.description || ''}
                onChange={(e) => handleLeadStatusChange('description', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-color">Color</Label>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded-full border cursor-pointer" 
                  style={{ backgroundColor: currentLeadStatus?.color || '#888888' }}
                  onClick={() => document.getElementById('status-color')?.click()}
                />
                <Input 
                  id="status-color" 
                  type="color"
                  value={currentLeadStatus?.color || '#888888'}
                  onChange={(e) => handleLeadStatusChange('color', e.target.value)}
                  className="w-auto"
                />
                <Input 
                  value={currentLeadStatus?.color || '#888888'}
                  onChange={(e) => handleLeadStatusChange('color', e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="status-converted"
                  checked={currentLeadStatus?.is_converted || false}
                  onCheckedChange={(checked) => handleLeadStatusChange('is_converted', checked)}
                />
                <Label htmlFor="status-converted">Mark as Converted Lead Status</Label>
              </div>
              <p className="text-sm text-muted-foreground pl-7">
                When a lead reaches this status, it will be counted as a successful conversion.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="status-discarded"
                  checked={currentLeadStatus?.is_discarded || false}
                  onCheckedChange={(checked) => handleLeadStatusChange('is_discarded', checked)}
                />
                <Label htmlFor="status-discarded">Mark as Discarded Lead Status</Label>
              </div>
              <p className="text-sm text-muted-foreground pl-7">
                When a lead reaches this status, it will be counted as lost or discarded.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="status-default"
                  checked={currentLeadStatus?.is_default || false}
                  onCheckedChange={(checked) => handleLeadStatusChange('is_default', checked)}
                />
                <Label htmlFor="status-default">Set as Default Status</Label>
              </div>
              <p className="text-sm text-muted-foreground pl-7">
                This status will be automatically assigned to new leads created through the contact form.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLeadStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveLeadStatus}>
              {isEditing ? 'Save changes' : 'Add status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Status Dialog */}
      <Dialog open={isTaskStatusDialogOpen} onOpenChange={(open) => {
        if (!open) setIsTaskStatusDialogOpen(false);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditingTask ? 'Edit Task Status' : 'Add Task Status'}</DialogTitle>
            <DialogDescription>
              {isEditingTask 
                ? 'Update the details of this task status' 
                : 'Create a new status for your task workflow'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-status-name">Status name</Label>
              <Input 
                id="task-status-name" 
                value={currentTaskStatus?.name || ''}
                onChange={(e) => handleTaskStatusChange('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-status-description">Description (optional)</Label>
              <Input 
                id="task-status-description" 
                value={currentTaskStatus?.description || ''}
                onChange={(e) => handleTaskStatusChange('description', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-status-color">Color</Label>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded-full border cursor-pointer" 
                  style={{ backgroundColor: currentTaskStatus?.color || '#888888' }}
                  onClick={() => document.getElementById('task-status-color')?.click()}
                />
                <Input 
                  id="task-status-color" 
                  type="color"
                  value={currentTaskStatus?.color || '#888888'}
                  onChange={(e) => handleTaskStatusChange('color', e.target.value)}
                  className="w-auto"
                />
                <Input 
                  value={currentTaskStatus?.color || '#888888'}
                  onChange={(e) => handleTaskStatusChange('color', e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="task-status-completed"
                  checked={currentTaskStatus?.is_completed || false}
                  onCheckedChange={(checked) => handleTaskStatusChange('is_completed', checked)}
                />
                <Label htmlFor="task-status-completed">Mark as Completed Task Status</Label>
              </div>
              <p className="text-sm text-muted-foreground pl-7">
                Tasks in this status will be counted as successfully completed.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="task-status-canceled"
                  checked={currentTaskStatus?.is_canceled || false}
                  onCheckedChange={(checked) => handleTaskStatusChange('is_canceled', checked)}
                />
                <Label htmlFor="task-status-canceled">Mark as Canceled Task Status</Label>
              </div>
              <p className="text-sm text-muted-foreground pl-7">
                Tasks in this status will be counted as canceled or discarded.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaskStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveTaskStatus}>
              {isEditingTask ? 'Save changes' : 'Add status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Lead Status Confirmation Dialog */}
      <AlertDialog open={isDeleteLeadStatusDialogOpen} onOpenChange={(open) => {
        if (!open) setIsDeleteLeadStatusDialogOpen(false);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete lead status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lead status? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteLeadStatus}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Delete Task Status Confirmation Dialog */}
      <AlertDialog open={isDeleteTaskStatusDialogOpen} onOpenChange={(open) => {
        if (!open) setIsDeleteTaskStatusDialogOpen(false);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task status? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteTaskStatus}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
