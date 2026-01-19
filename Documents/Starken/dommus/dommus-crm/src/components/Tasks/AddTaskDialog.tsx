import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Task, TaskStatus, TaskPriority } from "@/types/crm";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Building, Mail, CircleAlert, CalendarPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseLocalDate, formatDateForInput } from "@/lib/date-utils";
import { useTaskStatuses } from "@/hooks/useTaskStatuses";
import { generateGoogleCalendarLink } from "@/utils/calendar";

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTask: (task: Partial<Task>) => Promise<void>;
  agents: { id: string; name: string; email?: string; phone?: string }[];
  leads: { id: string; name: string; company?: string; email?: string; status?: string }[];
}

export function AddTaskDialog({ open, onOpenChange, onAddTask, agents, leads }: AddTaskDialogProps) {
  const { taskStatuses, defaultStatuses } = useTaskStatuses();
  
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    priority: "Medium" as TaskPriority,
    status: defaultStatuses.length > 0 ? defaultStatuses[0] : "Pending" as TaskStatus,
    dueDate: new Date(),
    assignedTo: "",
    leadId: ""
  });
  
  const [openAgentCombobox, setOpenAgentCombobox] = useState(false);
  const [openLeadCombobox, setOpenLeadCombobox] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Convertendo strings vazias para null para serem tratadas corretamente pelo Supabase
    const processedTask = {
      ...newTask,
      assignedTo: newTask.assignedTo || null,
      leadId: newTask.leadId || null
    };
    
    await onAddTask(processedTask);
    onOpenChange(false);
    setNewTask({
      title: "",
      description: "",
      priority: "Medium" as TaskPriority,
      status: defaultStatuses.length > 0 ? defaultStatuses[0] : "Pending" as TaskStatus,
      dueDate: new Date(),
      assignedTo: "",
      leadId: ""
    });
    setOpenAgentCombobox(false);
    setOpenLeadCombobox(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="task-description">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription id="task-description">
            Create a new task and assign it to a team member.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
          </div>
          <div>
            <Textarea
              placeholder="Task description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              value={newTask.priority}
              onValueChange={(value: TaskPriority) => setNewTask({ ...newTask, priority: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={"Low" as TaskPriority}>Low</SelectItem>
                <SelectItem value={"Medium" as TaskPriority}>Medium</SelectItem>
                <SelectItem value={"High" as TaskPriority}>High</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={newTask.status as string}
              onValueChange={(value: string) => setNewTask({ ...newTask, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {defaultStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Input
              type="date"
              value={formatDateForInput(newTask.dueDate)}
              onChange={(e) => {
                const selectedDate = parseLocalDate(e.target.value);
                setNewTask({ ...newTask, dueDate: selectedDate });
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Assignee Combobox */}
            <Popover open={openAgentCombobox} onOpenChange={setOpenAgentCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openAgentCombobox}
                  className="justify-between w-full text-left"
                >
                  {!newTask.assignedTo
                    ? "Select agent"
                    : agents && agents.length > 0
                      ? (agents.find((agent) => agent.name === newTask.assignedTo)?.name || newTask.assignedTo)
                      : newTask.assignedTo}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput placeholder="Search agents..." />
                  <CommandList>
                    <CommandEmpty>No agent found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="_unassigned"
                        onSelect={() => {
                          setNewTask({ ...newTask, assignedTo: "" });
                          setOpenAgentCombobox(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            !newTask.assignedTo ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Not assigned
                      </CommandItem>
                      {agents && agents.length > 0 ? agents.map((agent) => (
                        <CommandItem
                          key={agent.id}
                          value={agent.name}
                          onSelect={() => {
                            setNewTask({ ...newTask, assignedTo: agent.name });
                            setOpenAgentCombobox(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              newTask.assignedTo === agent.name ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <div className="font-medium">{agent.name}</div>
                            {agent.email && (
                              <div className="text-xs text-muted-foreground flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {agent.email}
                              </div>
                            )}
                          </div>
                        </CommandItem>
                      )) : null}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Lead Combobox */}
            <Popover open={openLeadCombobox} onOpenChange={setOpenLeadCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openLeadCombobox}
                  className="justify-between w-full text-left"
                >
                  {!newTask.leadId
                    ? "Select lead"
                    : leads && leads.length > 0
                      ? (leads.find((lead) => lead.id === newTask.leadId)?.name || "Select lead")
                      : "Select lead"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput placeholder="Search leads..." />
                  <CommandList>
                    <CommandEmpty>No lead found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="_nolead"
                        onSelect={() => {
                          setNewTask({ ...newTask, leadId: "" });
                          setOpenLeadCombobox(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            !newTask.leadId ? "opacity-100" : "opacity-0"
                          )}
                        />
                        No lead
                      </CommandItem>
                      {leads && leads.length > 0 ? leads.map((lead) => (
                        <CommandItem
                          key={lead.id}
                          value={lead.name}
                          onSelect={() => {
                            setNewTask({ ...newTask, leadId: lead.id });
                            setOpenLeadCombobox(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              newTask.leadId === lead.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col w-full">
                            <div className="font-medium">{lead.name}</div>
                            <div className="flex flex-col space-y-1 text-xs text-muted-foreground">
                              {lead.company && (
                                <div className="flex items-center">
                                  <Building className="h-3 w-3 mr-1" />
                                  {lead.company}
                                </div>
                              )}
                              {lead.email && (
                                <div className="flex items-center">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {lead.email}
                                </div>
                              )}
                              {lead.status && (
                                <div className="flex items-center">
                                  <CircleAlert className="h-3 w-3 mr-1" />
                                  {lead.status}
                                </div>
                              )}
                            </div>
                          </div>
                        </CommandItem>
                      )) : null}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                const selectedLead = leads.find(lead => lead.id === newTask.leadId);
                const leadEmail = selectedLead?.email;
                
                const title = `Task: ${newTask.title}`;
                const description = newTask.description || '';
                const startDate = newTask.dueDate || new Date();
                const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour later
                
                const emails = [];
                if (leadEmail) emails.push(leadEmail);
                
                const calendarUrl = generateGoogleCalendarLink({
                  title,
                  description,
                  startTime: startDate,
                  endTime: endDate,
                  emails
                });
                
                window.open(calendarUrl, '_blank');
              }}
            >
              <CalendarPlus className="h-4 w-4 mr-2" />
              Add to Calendar
            </Button>
            <Button type="submit">Add Task</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
