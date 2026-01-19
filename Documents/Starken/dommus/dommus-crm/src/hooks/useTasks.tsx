import { useState, useEffect } from "react";
import { Task, TaskStatus } from "@/types/crm";
import { toast } from "sonner";
import { supabase } from "@/services/supabase/client";
import { useUser } from "@/hooks/auth/useUser";
import { useUserRole } from "@/hooks/auth/useUserRole";

export interface NewTaskData {
  title: string;
  description: string;
  priority: string;
  leadId: string;
  assignedTo: string;
  dueDate: string;
}

export function useTasks() {
  const { user } = useUser();
  const { role, loading: roleLoading } = useUserRole();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newTask, setNewTask] = useState<NewTaskData>({
    title: "",
    description: "",
    priority: "Medium",
    leadId: "",
    assignedTo: "",
    dueDate: new Date().toISOString().split('T')[0],
  });
  
  // Load tasks from Supabase
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        
        // Aguarda o role carregar antes de aplicar filtros
        if (roleLoading) {
          console.log('⏳ Waiting for role to load...');
          return;
        }
        
        let query = supabase
          .from('tasks')
          .select('*')
          .order('due_date', { ascending: true });

        // Filtro por role - usando o role do hook centralizado
        console.log('🔍 Tasks Filter Debug:', { role, userId: user?.id });
        if (role === 'agent' && user) {
          console.log('📝 Applying tasks filter for agent (only assigned):', user.id);
          // Agents veem APENAS tasks atribuídas a eles (não veem sem atribuição)
          query = query.eq('assigned_to', user.id);
        }
        else {
          console.log('👑 Admin/Manager - showing all tasks');
        }
        // Admin e manager veem tudo

        const { data, error } = await query;
        if (error) throw error;
        const fetchedTasks: Task[] = data.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: new Date(task.due_date),
          assignedTo: task.assigned_to,
          leadId: task.lead_id,
          createdAt: new Date(task.created_at),
          updatedAt: new Date(task.updated_at)
        }));
        setTasks(fetchedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast.error("Failed to load tasks");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [user, role, roleLoading]);
  
  const filteredTasks = tasks.filter(task => {
    return statusFilter === "all" || task.status === statusFilter;
  });
  
  const handleTaskStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;
      
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      
      toast.success(`Task status updated to: ${newStatus}`);
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Failed to update task status");
    }
  };
  
  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      toast.error("Task title is required");
      return;
    }
    
    try {
      const dueDate = new Date(newTask.dueDate);
      
      // Validar campos obrigatórios
      const taskData = {
        title: newTask.title.trim(),
        description: newTask.description || "",
        priority: newTask.priority || "Medium",
        status: "Pending" as TaskStatus,
        due_date: dueDate.toISOString(),
        assigned_to: newTask.assignedTo || null,
        lead_id: newTask.leadId || null
      };
      
      console.log('Creating task with data:', taskData);
      
      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      if (error) {
        console.error('Task creation error:', error);
        throw error;
      }
      
      const task: Task = {
        id: data.id,
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: new Date(data.due_date),
        assignedTo: data.assigned_to,
        leadId: data.lead_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
      
      setTasks([task, ...tasks]);
      setIsAddTaskOpen(false);
      resetNewTask();
      
      toast.success("Task created successfully");
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Failed to create task");
    }
  };
  
  const resetNewTask = () => {
    setNewTask({
      title: "",
      description: "",
      priority: "Medium",
      leadId: "",
      assignedTo: "",
      dueDate: new Date().toISOString().split('T')[0],
    });
  };
  
  return {
    tasks,
    filteredTasks,
    statusFilter,
    searchQuery,
    isAddTaskOpen,
    isLoading,
    newTask,
    setStatusFilter,
    setSearchQuery,
    setIsAddTaskOpen,
    setNewTask,
    handleTaskStatusChange,
    handleAddTask,
  };
}
