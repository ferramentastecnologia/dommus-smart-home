import { useEffect, useState } from "react";
import { Task, TaskStatus, TaskPriority } from "@/types/crm";
import { supabase } from "@/services/supabase/client";
import { useTasks } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";
import { Plus, List, Layout } from "lucide-react";
import { TasksFilter } from "@/components/Tasks/TasksFilter";
import { AddTaskDialog } from "@/components/Tasks/AddTaskDialog";
import { EditTaskDialog } from "@/components/Tasks/EditTaskDialog";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TasksKanban } from "@/components/Tasks/TasksKanban";
import { TasksListView } from "@/components/Tasks/TasksListView";
import { toast } from "sonner";
import { formatDateForAPI, parseAPIDate } from "@/lib/date-utils";
import { useUser, getUserRole } from "@/hooks/auth/useUser";

export default function Tasks() {
  const { user } = useUser();
  const [role, setRole] = useState('agent');
  
  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const userRole = await getUserRole(user);
        setRole(userRole);
      }
    };
    fetchUserRole();
  }, [user]);

  const [agents, setAgents] = useState<{ id: string; name: string; email: string }[]>([]);
  const [leads, setLeads] = useState<{ id: string; name: string; company: string; email: string; status: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch agents with more information
        const { data: agentsData, error: agentsError } = await supabase
          .from('agents')
          .select('id, name, email');
        
        if (agentsError) throw agentsError;
        setAgents(agentsData);

        // Fetch leads with more information
        const { data: leadsData, error: leadsError } = await supabase
          .from('leads')
          .select('id, name, company, email, lead_statuses!inner(id, name)');
        
        if (leadsError) throw leadsError;
        
        // Transform the leads data to include status name from join
        const transformedLeadsData = leadsData.map(lead => ({
          id: lead.id,
          name: lead.name,
          company: lead.company,
          email: lead.email,
          status: lead.lead_statuses.name
        }));
        
        setLeads(transformedLeadsData);

        // Fetch task statuses to have a mapping
        const { data: statusesData, error: statusesError } = await supabase
          .from('task_statuses')
          .select('id, name')
          .order('order_index', { ascending: true });
          
        if (statusesError) throw statusesError;
        
        // Create a mapping from status_id to status name
        const statusMap = statusesData.reduce((map, status) => {
          map[status.id] = status.name;
          return map;
        }, {});

        // Fetch tasks with join to get status name - aplicar filtro para agente/manager
        let tasksQuery = supabase
          .from('tasks')
          .select('*, task_statuses!inner(id, name)')
          .order('due_date', { ascending: true });
        
        const userRole = await getUserRole(user);
        if ((userRole === 'manager' || userRole === 'agent') && user) {
          tasksQuery = tasksQuery.or(`assigned_to.eq.${user.id},assigned_to.is.null`);
        }
        // Admin vê tudo
        
        const { data: tasksData, error: tasksError } = await tasksQuery;
        
        if (tasksError) throw tasksError;
        
        const fetchedTasks: Task[] = tasksData.map(task => {
          // Find agent name by ID
          const assignedAgent = task.assigned_to ? 
            agentsData.find(agent => agent.id === task.assigned_to) : null;
          
          return {
            id: task.id,
            title: task.title,
            description: task.description || "",
            status: task.task_statuses.name, // Use status name from the join
            statusId: task.status_id, // Store status_id for future operations
            priority: task.priority || "Medium",
            dueDate: parseAPIDate(task.due_date) || new Date(),
            assignedTo: assignedAgent ? assignedAgent.name : "",
            leadId: task.lead_id || "",
            createdAt: new Date(task.created_at),
            updatedAt: new Date(task.updated_at)
          };
        });
        
        setTasks(fetchedTasks);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error("Failed to load tasks data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleAddTask = async (newTask: Partial<Task>) => {
    try {
      // First, we need to get the status_id based on the status name
      const { data: statusData, error: statusError } = await supabase
        .from('task_statuses')
        .select('id')
        .eq('name', newTask.status || "Pending")
        .single();
        
      if (statusError) throw statusError;
      
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            title: newTask.title,
            description: newTask.description,
            status_id: statusData.id, // Use status_id instead of status
            priority: newTask.priority || "Medium",
            due_date: formatDateForAPI(newTask.dueDate),
            assigned_to: newTask.assignedTo || null,
            lead_id: newTask.leadId || null
          }
        ])
        .select();

      if (error) throw error;
      
      if (data && data[0]) {
        // Fetch the task with its status name
        const { data: taskWithStatus, error: fetchError } = await supabase
          .from('tasks')
          .select('*, task_statuses!inner(id, name)')
          .eq('id', data[0].id)
          .single();
          
        if (fetchError) throw fetchError;
        
        const createdTask: Task = {
          id: taskWithStatus.id,
          title: taskWithStatus.title,
          description: taskWithStatus.description || "",
          status: taskWithStatus.task_statuses.name,
          statusId: taskWithStatus.status_id,
          priority: taskWithStatus.priority,
          dueDate: new Date(taskWithStatus.due_date),
          assignedTo: taskWithStatus.assigned_to,
          leadId: taskWithStatus.lead_id,
          createdAt: new Date(taskWithStatus.created_at),
          updatedAt: new Date(taskWithStatus.updated_at)
        };
        
        setTasks(prev => [...prev, createdTask]);
        toast.success("Task created successfully");
      }
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Failed to create task");
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      // First, get the status_id for the new status
      const { data: statusData, error: statusError } = await supabase
        .from('task_statuses')
        .select('id')
        .eq('name', newStatus)
        .single();
        
      if (statusError) throw statusError;
      
      const { error } = await supabase
        .from('tasks')
        .update({ status_id: statusData.id }) // Update status_id instead of status
        .eq('id', taskId);

      if (error) throw error;
      
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId 
            ? { ...task, status: newStatus, statusId: statusData.id } 
            : task
        )
      );
      
      toast.success(`Task status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Failed to update task status");
    }
  };

  const handlePriorityChange = async (taskId: string, newPriority: TaskPriority) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ priority: newPriority })
        .eq('id', taskId);

      if (error) throw error;
      
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId 
            ? { ...task, priority: newPriority } 
            : task
        )
      );
      
      toast.success(`Task priority updated to ${newPriority}`);
    } catch (error) {
      console.error("Error updating task priority:", error);
      toast.error("Failed to update task priority");
    }
  };

  const handleAssigneeChange = async (taskId: string, newAssignee: string) => {
    try {
      // Find the agent ID based on the name
      const agentId = newAssignee 
        ? agents.find(agent => agent.name === newAssignee)?.id || null 
        : null;
      
      const { error } = await supabase
        .from('tasks')
        .update({ assigned_to: agentId })
        .eq('id', taskId);

      if (error) throw error;
      
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId 
            ? { ...task, assignedTo: newAssignee } 
            : task
        )
      );
      
      toast.success(newAssignee ? `Task assigned to ${newAssignee}` : "Task assignment removed");
    } catch (error) {
      console.error("Error updating task assignee:", error);
      toast.error("Failed to update task assignee");
    }
  };

  const handleDateChange = async (taskId: string, newDate: Date | null) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ due_date: formatDateForAPI(newDate) })
        .eq('id', taskId);

      if (error) throw error;
      
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId 
            ? { ...task, dueDate: newDate } 
            : task
        )
      );
      
      toast.success(newDate ? `Due date updated` : "Due date removed");
    } catch (error) {
      console.error("Error updating task due date:", error);
      toast.error("Failed to update due date");
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const handleTaskEdit = (task: Task) => {
    setSelectedTask(task);
    setIsEditTaskOpen(true);
  };

  const handleUpdateTask = async (taskId: string, taskData: Partial<Task>) => {
    try {
      // Get status_id for the status if it's being updated
      let status_id = undefined;
      if (taskData.status) {
        const { data: statusData, error: statusError } = await supabase
          .from('task_statuses')
          .select('id')
          .eq('name', taskData.status)
          .single();
          
        if (statusError) throw statusError;
        status_id = statusData.id;
      }
      
      // Find the agent ID if there's an assignedTo value
      let assigned_to = null;
      if (taskData.assignedTo && taskData.assignedTo !== "_unassigned") {
        assigned_to = agents.find(agent => agent.name === taskData.assignedTo)?.id || null;
      }
      
      // Prepare data for Supabase (convert to snake_case)
      const supabaseData = {
        title: taskData.title,
        description: taskData.description,
        status_id: status_id, // Use status_id instead of status
        priority: taskData.priority,
        due_date: formatDateForAPI(taskData.dueDate),
        assigned_to: assigned_to,
        lead_id: taskData.leadId && taskData.leadId !== "_nolead" ? taskData.leadId : null
      };

      // Remove undefined values
      Object.keys(supabaseData).forEach(key => 
        supabaseData[key] === undefined && delete supabaseData[key]
      );

      const { error } = await supabase
        .from('tasks')
        .update(supabaseData)
        .eq('id', taskId);

      if (error) throw error;
      
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId 
            ? { 
                ...task, 
                title: taskData.title || task.title,
                description: taskData.description !== undefined ? taskData.description : task.description,
                status: taskData.status || task.status,
                statusId: status_id || task.statusId,
                priority: taskData.priority || task.priority,
                dueDate: taskData.dueDate !== undefined ? taskData.dueDate : task.dueDate,
                assignedTo: taskData.assignedTo !== undefined ? (taskData.assignedTo === "_unassigned" ? "" : taskData.assignedTo) : task.assignedTo,
                leadId: taskData.leadId !== undefined ? (taskData.leadId === "_nolead" ? "" : taskData.leadId) : task.leadId
              } 
            : task
        )
      );
      
      toast.success("Task updated successfully");
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  };

  const handleTaskClick = (task: Task) => {
    handleTaskEdit(task);
  };

  // Handle search and filter changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
  };

  const handlePriorityFilterChange = (priority: string) => {
    setPriorityFilter(priority);
  };

  const handleAssigneeFilterChange = (assignee: string) => {
    // This function is not directly used in the current filter logic,
    // but it's part of the TasksFilter component's props.
    // If you need to filter by assignee, you'd add that logic here.
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage and track your team's tasks
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-1 border rounded-md">
            <Button 
              variant={viewMode === "list" ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setViewMode("list")}
              className="rounded-r-none"
            >
              <List className="h-4 w-4 mr-1" />
              List
            </Button>
            <Button 
              variant={viewMode === "kanban" ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setViewMode("kanban")}
              className="rounded-l-none"
            >
              <Layout className="h-4 w-4 mr-1" />
              Kanban
            </Button>
          </div>
          <Button onClick={() => setIsAddTaskOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      <TasksFilter 
        onSearchChange={handleSearchChange}
        onStatusFilterChange={handleStatusFilterChange}
        onPriorityFilterChange={handlePriorityFilterChange}
        onAssigneeFilterChange={handleAssigneeFilterChange}
        agents={agents}
        userRole={role}
      />

      <DndProvider backend={HTML5Backend}>
        {viewMode === "list" ? (
          <TasksListView
            tasks={tasks}
            onTaskClick={handleTaskClick}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onAssigneeChange={handleAssigneeChange}
            onDateChange={handleDateChange}
            onTaskDelete={handleTaskDelete}
            onTaskEdit={handleTaskEdit}
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            teamMembers={agents.map(agent => agent.name)}
            leads={leads}
          />
        ) : (
          <TasksKanban
            tasks={tasks}
            onTaskClick={handleTaskClick}
            onAddTask={() => setIsAddTaskOpen(true)}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onAssigneeChange={handleAssigneeChange}
            onDateChange={handleDateChange}
            onTaskDelete={handleTaskDelete}
            onTaskEdit={handleTaskEdit}
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            teamMembers={agents.map(agent => agent.name)}
          />
        )}
      </DndProvider>

      <AddTaskDialog
        open={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
        onAddTask={handleAddTask}
        agents={agents}
        leads={leads}
      />

      <EditTaskDialog
        open={isEditTaskOpen}
        onOpenChange={setIsEditTaskOpen}
        onUpdateTask={handleUpdateTask}
        task={selectedTask}
        agents={agents}
        leads={leads}
      />
    </div>
  );
}
