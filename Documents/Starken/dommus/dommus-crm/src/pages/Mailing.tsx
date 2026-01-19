import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Mail, AlertCircle, Calendar, User, Send, RefreshCw, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { formatDate } from "@/utils/date";
import { Badge } from "@/components/ui/badge";
import {
  getEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  toggleTemplateActive,
  getEmailTriggers,
  toggleTriggerActive,
  getSMTPConfig,
  updateSMTPConfig,
  sendEmailCampaign,
  getEmailQueue,
  processEmailQueue
} from "@/services/supabase/emailService";
import type { EmailTemplate, EmailTrigger, SMTPConfig } from "@/services/supabase/emailService";
import { useLeadsData } from "@/hooks/useLeadsData";
import { EmailCampaignDialog, EmailCampaignData } from "@/components/Mailing/EmailCampaignDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function Mailing() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [triggers, setTriggers] = useState<EmailTrigger[]>([]);
  const [smtpConfig, setSmtpConfig] = useState<SMTPConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate | null>(null);
  const [isSmtpDialogOpen, setIsSmtpDialogOpen] = useState(false);
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('triggers');
  const [emailQueue, setEmailQueue] = useState<EmailQueueItem[]>([]);
  const [queueCount, setQueueCount] = useState(0);
  const [queuePage, setQueuePage] = useState(1);
  const [queuePageSize] = useState(10);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);
  const [queueStatusFilter, setQueueStatusFilter] = useState<'pending' | 'sent' | 'failed' | undefined>(undefined);
  const [previewEmail, setPreviewEmail] = useState<EmailQueueItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Get leads data for campaign feature
  const { leads, loading: leadsLoading } = useLeadsData();

  // Form state for template editing
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    content: "",
    trigger_type: "birthday" as "birthday" | "new_lead" | "meeting",
    is_active: true
  });

  // Form state for SMTP configuration
  const [smtpFormData, setSmtpFormData] = useState({
    host: "",
    port: "",
    username: "",
    password: "",
    from_email: "",
    from_name: "",
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [templatesData, triggersData, smtpData] = await Promise.all([
        getEmailTemplates(),
        getEmailTriggers(),
        getSMTPConfig()
      ]);
      
      setTemplates(templatesData.filter(template => template.trigger_type !== 'manual'));
      setTriggers(triggersData);
      setSmtpConfig(smtpData);
    } catch (error) {
      console.error("Error fetching mailing data:", error);
      toast.error("Failed to load mailing data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTrigger = async (triggerId: string, isActive: boolean) => {
    try {
      await toggleTriggerActive(triggerId, isActive);
      setTriggers(prevTriggers => 
        prevTriggers.map(trigger => 
          trigger.id === triggerId ? { ...trigger, is_active: isActive } : trigger
        )
      );
      toast.success(`Trigger ${isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error("Error toggling trigger:", error);
      toast.error("Failed to update trigger");
    }
  };

  const handleToggleTemplate = async (templateId: string, isActive: boolean) => {
    try {
      await toggleTemplateActive(templateId, isActive);
      setTemplates(prevTemplates => 
        prevTemplates.map(template => 
          template.id === templateId ? { ...template, is_active: isActive } : template
        )
      );
      toast.success(`Template ${isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error("Error toggling template:", error);
      toast.error("Failed to update template");
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      try {
        await deleteEmailTemplate(templateId);
        setTemplates(prevTemplates => prevTemplates.filter(template => template.id !== templateId));
        toast.success("Template deleted");
      } catch (error) {
        console.error("Error deleting template:", error);
        toast.error("Failed to delete template");
      }
    }
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setCurrentTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      content: template.content,
      trigger_type: template.trigger_type,
      is_active: template.is_active
    });
    setIsDialogOpen(true);
  };

  const handleNewTemplate = () => {
    setCurrentTemplate(null);
    setFormData({
      name: "",
      subject: "",
      content: "",
      trigger_type: "birthday",
      is_active: true
    });
    setIsDialogOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTriggerTypeChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      trigger_type: value as "birthday" | "new_lead" | "meeting" 
    }));
  };

  const handleSaveTemplate = async () => {
    try {
      if (currentTemplate) {
        // Update existing template
        await updateEmailTemplate(currentTemplate.id, formData);
        setTemplates(prevTemplates => 
          prevTemplates.map(template => 
            template.id === currentTemplate.id ? { ...template, ...formData } : template
          )
        );
        toast.success("Template updated");
      } else {
        // Create new template
        const newTemplate = await createEmailTemplate(formData);
        setTemplates(prev => [...prev, newTemplate]);
        toast.success("Template created");
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    }
  };

  const handleEditSMTP = () => {
    if (smtpConfig) {
      setSmtpFormData({
        host: smtpConfig.host,
        port: smtpConfig.port.toString(),
        username: smtpConfig.username,
        password: smtpConfig.password,
        from_email: smtpConfig.from_email,
        from_name: smtpConfig.from_name,
        is_active: smtpConfig.is_active
      });
    } else {
      setSmtpFormData({
        host: "",
        port: "",
        username: "",
        password: "",
        from_email: "",
        from_name: "",
        is_active: true
      });
    }
    setIsSmtpDialogOpen(true);
  };

  const handleSmtpFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSmtpFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSMTP = async () => {
    try {
      const updatedConfig = {
        ...smtpFormData,
        port: parseInt(smtpFormData.port, 10)
      };
      
      await updateSMTPConfig(updatedConfig);
      setSmtpConfig(updatedConfig as SMTPConfig);
      toast.success("SMTP configuration updated");
      setIsSmtpDialogOpen(false);
    } catch (error) {
      console.error("Error saving SMTP config:", error);
      toast.error("Failed to save SMTP configuration");
    }
  };
  
  const handleOpenCampaignDialog = () => {
    if (!smtpConfig) {
      toast.error("Please configure SMTP settings first");
      return;
    }
    
    setIsCampaignDialogOpen(true);
  };
  
  const handleSendCampaign = async (data: EmailCampaignData) => {
    try {
      const sentCount = await sendEmailCampaign(
        data.subject,
        data.content,
        data.recipients
      );
      
      toast.success(`Email campaign queued: ${sentCount} emails to be sent`);
      setIsCampaignDialogOpen(false);
    } catch (error) {
      console.error("Error sending campaign:", error);
      toast.error("Failed to send campaign");
      throw error; // Rethrow to be handled by the calling component
    }
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'birthday':
        return <Calendar className="h-4 w-4 mr-2" />;
      case 'new_lead':
        return <User className="h-4 w-4 mr-2" />;
      case 'meeting':
        return <Calendar className="h-4 w-4 mr-2" />;
      default:
        return <Mail className="h-4 w-4 mr-2" />;
    }
  };

  const getTriggerLabel = (type: string) => {
    switch (type) {
      case 'birthday':
        return "Lead's Birthday";
      case 'new_lead':
        return "New Lead Registration";
      case 'meeting':
        return "Meeting Scheduled";
      default:
        return type;
    }
  };

  const fetchEmailQueue = async () => {
    setIsLoadingQueue(true);
    try {
      const result = await getEmailQueue(queuePage, queuePageSize, queueStatusFilter);
      setEmailQueue(result.data);
      setQueueCount(result.count);
    } catch (error) {
      console.error("Error fetching email queue:", error);
      toast.error("Failed to load email queue");
    } finally {
      setIsLoadingQueue(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'queue') {
      fetchEmailQueue();
    }
  }, [activeTab, queuePage, queuePageSize, queueStatusFilter]);

  const handlePreviewEmail = (email: EmailQueueItem) => {
    setPreviewEmail(email);
    setIsPreviewOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mailing</h1>
          <p className="text-muted-foreground">
            Manage email templates and campaigns for leads
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleEditSMTP}>
            SMTP Settings
          </Button>
          <Button variant="outline" onClick={handleOpenCampaignDialog}>
            <Send size={18} className="mr-2" />
            Send Campaign
          </Button>
          <Button onClick={handleNewTemplate}>
            <Plus size={18} className="mr-2" />
            New Template
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="triggers" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="triggers">Email Triggers</TabsTrigger>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="queue">Email Queue</TabsTrigger>
        </TabsList>
        
        <TabsContent value="triggers" className="space-y-4 mt-6">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <p>Loading triggers...</p>
            </div>
          ) : triggers.length === 0 ? (
            <div className="text-center py-10">
              <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">No triggers found</p>
            </div>
          ) : (
            triggers.map(trigger => (
              <Card key={trigger.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getTriggerIcon(trigger.trigger_type)}
                      <div>
                        <CardTitle>{getTriggerLabel(trigger.trigger_type)}</CardTitle>
                        <CardDescription>
                          {trigger.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Switch 
                      checked={trigger.is_active} 
                      onCheckedChange={(checked) => handleToggleTrigger(trigger.id, checked)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">Active Templates</p>
                      <p className="text-sm">
                        {templates.filter(t => t.trigger_type === trigger.trigger_type && t.is_active).length} templates
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">Last triggered</p>
                      <p className="text-sm">
                        {trigger.last_run ? formatDate(trigger.last_run) : 'Never'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="templates" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <p>Loading templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-10">
              <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">No templates found</p>
              <Button onClick={handleNewTemplate} className="mt-4">
                Create your first template
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map(template => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle>{template.name}</CardTitle>
                          <Badge variant={template.is_active ? "default" : "outline"}>
                            {template.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <CardDescription className="mt-1">
                          <span className="flex items-center">
                            {getTriggerIcon(template.trigger_type)}
                            {getTriggerLabel(template.trigger_type)}
                          </span>
                        </CardDescription>
                      </div>
                      <Switch 
                        checked={template.is_active} 
                        onCheckedChange={(checked) => handleToggleTemplate(template.id, checked)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">Subject</p>
                        <p className="text-sm">{template.subject}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Preview</p>
                        <div className="bg-muted p-3 rounded-md text-sm h-24 overflow-hidden text-ellipsis">
                          <div dangerouslySetInnerHTML={{ __html: template.content.substring(0, 150) + (template.content.length > 150 ? '...' : '') }} />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">Created</p>
                        <p className="text-sm">
                          {formatDate(template.created_at)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Edit size={16} className="mr-2" />
                      Edit
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="campaigns" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Campaigns</CardTitle>
              <CardDescription>
                Send one-time email campaigns to leads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm">
                  Create and send one-time email campaigns to leads based on their status or by selecting them individually.
                </p>
                
                <div className="flex justify-between items-center p-4 bg-muted rounded-md">
                  <div>
                    <h3 className="font-medium">Ready to create a campaign?</h3>
                    <p className="text-sm text-muted-foreground">
                      Send personalized emails to multiple leads at once.
                    </p>
                  </div>
                  <Button onClick={handleOpenCampaignDialog}>
                    <Send size={18} className="mr-2" />
                    Send Campaign
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-card p-4 rounded-lg border">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary mb-3">
                      <Send size={20} />
                    </div>
                    <h3 className="font-medium mb-1">Email Templates</h3>
                    <p className="text-sm text-muted-foreground">
                      Create email templates with dynamic variables like {'{{'}'name{'}}'} and {'{{'}'company{'}}'}.
                    </p>
                  </div>
                  
                  <div className="bg-card p-4 rounded-lg border">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary mb-3">
                      <User size={20} />
                    </div>
                    <h3 className="font-medium mb-1">Lead Selection</h3>
                    <p className="text-sm text-muted-foreground">
                      Select leads by status or choose individual leads to include in your campaign.
                    </p>
                  </div>
                  
                  <div className="bg-card p-4 rounded-lg border">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary mb-3">
                      <Mail size={20} />
                    </div>
                    <h3 className="font-medium mb-1">Instant Sending</h3>
                    <p className="text-sm text-muted-foreground">
                      Emails are processed by our email worker and sent to your leads immediately.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="queue" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Email Queue</CardTitle>
                  <CardDescription>
                    Monitor and manage pending and sent emails
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={queueStatusFilter || "all"}
                    onValueChange={(value) => setQueueStatusFilter(value === "all" ? undefined : value as any)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    onClick={() => fetchEmailQueue()}
                    disabled={isLoadingQueue}
                  >
                    <RefreshCw size={16} className={`mr-2 ${isLoadingQueue ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button onClick={async () => {
                    try {
                      toast.loading("Processing email queue...");
                      const result = await processEmailQueue(10);
                      toast.dismiss();
                      
                      if (result.success) {
                        toast.success(`Processed ${result.processed} email(s) successfully`);
                        fetchEmailQueue(); // Refresh the queue after processing
                      } else {
                        toast.error(`Error processing emails: ${result.errors?.length || 0} errors`);
                      }
                    } catch (error) {
                      toast.dismiss();
                      toast.error("Failed to process email queue");
                      console.error(error);
                    }
                  }}>
                    <Send size={16} className="mr-2" />
                    Process Queue
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingQueue ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ))}
                </div>
              ) : emailQueue.length === 0 ? (
                <div className="text-center py-10">
                  <Mail className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">No emails in queue {queueStatusFilter ? `with status '${queueStatusFilter}'` : ''}</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Sent At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {emailQueue.map((email) => (
                        <TableRow key={email.id}>
                          <TableCell className="font-medium">{email.to}</TableCell>
                          <TableCell>{email.subject}</TableCell>
                          <TableCell>
                            <Badge variant={
                              email.status === 'sent' ? 'success' : 
                              email.status === 'failed' ? 'destructive' : 
                              'default'
                            }>
                              {email.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(email.created_at)}</TableCell>
                          <TableCell>{email.sent_at ? formatDate(email.sent_at) : '-'}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handlePreviewEmail(email)}
                            >
                              <Eye size={16} className="mr-2" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {queueCount > queuePageSize && (
                    <div className="flex items-center justify-end space-x-2 py-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQueuePage(p => Math.max(1, p - 1))}
                        disabled={queuePage === 1}
                      >
                        Previous
                      </Button>
                      <div className="text-sm text-muted-foreground">
                        Page {queuePage} of {Math.ceil(queueCount / queuePageSize)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQueuePage(p => p + 1)}
                        disabled={queuePage >= Math.ceil(queueCount / queuePageSize)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentTemplate ? 'Edit Template' : 'Create Template'}</DialogTitle>
            <DialogDescription>
              Create or modify an email template for automatic sending
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="Welcome Email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="trigger_type">Trigger Event</Label>
              <Select 
                value={formData.trigger_type} 
                onValueChange={handleTriggerTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a trigger" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="birthday">Lead's Birthday</SelectItem>
                  <SelectItem value="new_lead">New Lead Registration</SelectItem>
                  <SelectItem value="meeting">Meeting Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleFormChange}
                placeholder="Happy Birthday {{name}}!"
              />
              <p className="text-xs text-muted-foreground">
                Use {'{{name}}'} for lead name, {'{{date}}'} for meeting date, {'{{time}}'} for meeting time
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Email Content</Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleFormChange}
                placeholder="<p>Hello {{name}},</p><p>Wishing you a happy birthday!</p>"
                className="min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground">
                Use HTML for formatting. Available variables: {'{{name}}'}, {'{{date}}'}, {'{{time}}'}, {'{{link}}'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SMTP Config Dialog */}
      <Dialog open={isSmtpDialogOpen} onOpenChange={setIsSmtpDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>SMTP Configuration</DialogTitle>
            <DialogDescription>
              Configure your email server settings
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Alerta sobre configurações do Gmail */}
            {smtpFormData.host?.includes('gmail') && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 text-sm">
                <p className="font-medium mb-1">Gmail SMTP Configuration:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Use an "App password" (not your regular password)</li>
                  <li>Enable two-factor authentication on your Google account</li>
                  <li>Create an app password at: Google Account &gt; Security &gt; App passwords</li>
                </ul>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="host">SMTP Host</Label>
                <Input
                  id="host"
                  name="host"
                  value={smtpFormData.host}
                  onChange={handleSmtpFormChange}
                  placeholder="smtp.example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="port">SMTP Port</Label>
                <Input
                  id="port"
                  name="port"
                  value={smtpFormData.port}
                  onChange={handleSmtpFormChange}
                  placeholder="587"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={smtpFormData.username}
                  onChange={handleSmtpFormChange}
                  placeholder="user@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={smtpFormData.password}
                  onChange={handleSmtpFormChange}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="from_email">From Email</Label>
                <Input
                  id="from_email"
                  name="from_email"
                  value={smtpFormData.from_email}
                  onChange={handleSmtpFormChange}
                  placeholder="noreply@yourcompany.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="from_name">From Name</Label>
                <Input
                  id="from_name"
                  name="from_name"
                  value={smtpFormData.from_name}
                  onChange={handleSmtpFormChange}
                  placeholder="Your Company Name"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSmtpDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSMTP}>
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Email Campaign Dialog */}
      {!leadsLoading && (
        <EmailCampaignDialog
          isOpen={isCampaignDialogOpen}
          onClose={() => setIsCampaignDialogOpen(false)}
          onSendCampaign={handleSendCampaign}
          leads={leads}
        />
      )}

      {/* Email Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
            <DialogDescription>
              Preview of email to be sent
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <div className="font-medium">To:</div>
              <div>{previewEmail?.to}</div>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <div className="font-medium">Subject:</div>
              <div>{previewEmail?.subject}</div>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <div className="font-medium">Status:</div>
              <div>
                <Badge variant={
                  previewEmail?.status === 'sent' ? 'success' : 
                  previewEmail?.status === 'failed' ? 'destructive' : 
                  'default'
                }>
                  {previewEmail?.status}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <div className="font-medium">Created:</div>
              <div>{previewEmail?.created_at ? formatDate(previewEmail.created_at) : '-'}</div>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <div className="font-medium">Sent:</div>
              <div>{previewEmail?.sent_at ? formatDate(previewEmail.sent_at) : '-'}</div>
            </div>
            {previewEmail?.error && (
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <div className="font-medium text-destructive">Error:</div>
                <div className="text-destructive">{previewEmail.error}</div>
              </div>
            )}
            <div className="border p-4 rounded-md bg-muted/30 mt-4">
              <div className="font-medium mb-2">Content:</div>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: previewEmail?.content || '' }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsPreviewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 