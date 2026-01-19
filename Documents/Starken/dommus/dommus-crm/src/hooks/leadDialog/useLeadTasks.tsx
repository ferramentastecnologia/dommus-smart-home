import { useState } from "react";
import { Task, Lead } from "@/types/crm";
import { supabase } from "@/services/supabase/client";
import { toast } from "sonner";

export function useLeadTasks(lead: Lead | null, onLeadUpdate: (lead: Lead) => void) {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    priority: "Medium",
    status: "Pending",
    leadId: lead?.id || "",
  });

  const handleAddTask = async () => {
    if (!lead) return;
    
    try {
      // Converter para o formato do Supabase (snake_case)
      const supabaseTask = {
        title: newTask.title || "",
        description: newTask.description || "",
        priority: newTask.priority || "Medium",
        status: newTask.status || "Pending",
        lead_id: lead.id,
        assigned_to: newTask.assignedTo || null,
        due_date: newTask.dueDate instanceof Date ? newTask.dueDate.toISOString() : new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      
      console.log('Creating lead task with data:', supabaseTask);
      
      const { error } = await supabase
        .from('tasks')
        .insert(supabaseTask);

      if (error) {
        // Verificar se o erro é porque a tabela não existe
        if (error.code === "PGRST204" || error.message?.includes("not found")) {
          toast.error("A tabela 'tasks' não existe no banco de dados. Execute o script SQL fornecido para criar a tabela.");
          console.error("Tabela 'tasks' não existe:", error);
          return;
        }
        throw error;
      }

      // Update lead's last interaction
      const { error: updateError } = await supabase
        .from('leads')
        .update({ 
          last_interaction: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', lead.id);

      if (updateError) throw updateError;

      // Atualizar o estado local em vez de buscar tudo novamente
      const newTaskItem: Task = {
        id: Date.now().toString(), // Temporário até que o Supabase retorne o ID real
        title: newTask.title || "",
        description: newTask.description || "",
        priority: newTask.priority || "Medium",
        status: newTask.status || "Pending",
        leadId: lead.id,
        assignedTo: newTask.assignedTo || "",
        dueDate: newTask.dueDate instanceof Date ? newTask.dueDate : new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const updatedLead = {
        ...lead,
        lastInteraction: new Date(),
        updatedAt: new Date()
      };

      onLeadUpdate(updatedLead);
      toast.success("Task added successfully");
      setIsAddTaskOpen(false);
      setNewTask({
        title: "",
        description: "",
        priority: "Medium",
        status: "Pending",
        leadId: lead.id,
      });
    } catch (error) {
      toast.error("Error adding task");
      console.error("Error adding task:", error);
    }
  };

  return {
    isAddTaskOpen,
    setIsAddTaskOpen,
    newTask,
    setNewTask,
    handleAddTask,
  };
}
