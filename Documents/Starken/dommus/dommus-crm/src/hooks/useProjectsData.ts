import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/services/supabase/client";
import { useUser } from "@/hooks/auth/useUser";
import { useUserRole } from "@/hooks/auth/useUserRole";
import { toast } from "sonner";
import { Project, ProjectStatus } from "@/types/crm";
import { camelToSnake, snakeToCamel } from "@/utils/stringUtils";

export function useProjectsData() {
  const { user } = useUser();
  const { role, loading: roleLoading } = useUserRole();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);

  // Fetch projects from database
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      // Wait for role to load before applying filters
      if (roleLoading) {
        console.log("⏳ Waiting for role to load...");
        return;
      }

      let query = supabase
        .from("projects")
        .select(`
          *,
          client:clients(id, name, email, phone),
          agent:agents(id, name)
        `)
        .order("created_at", { ascending: false });

      console.log("🔍 Projects Filter Debug:", { role, userId: user?.id });

      if (role === "agent" && user) {
        console.log("📝 Applying projects filter for agent:", user.id);
        // Agents only see projects assigned to them
        query = query.eq("agent_id", user.id);
      } else {
        console.log("👑 Admin/Manager - showing all projects");
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (data) {
        const transformedProjects: Project[] = data.map((project: any) => ({
          id: project.id,
          name: project.name,
          description: project.description,
          clientId: project.client_id,
          client: project.client ? {
            id: project.client.id,
            name: project.client.name,
            email: project.client.email,
            phone: project.client.phone,
          } : undefined,
          status: project.status || "Orçamento",
          statusId: project.status_id,
          type: project.type || "Residencial",
          estimatedValue: project.estimated_value,
          finalValue: project.final_value,
          startDate: project.start_date ? new Date(project.start_date) : undefined,
          estimatedEndDate: project.estimated_end_date ? new Date(project.estimated_end_date) : undefined,
          actualEndDate: project.actual_end_date ? new Date(project.actual_end_date) : undefined,
          address: project.address,
          city: project.city,
          state: project.state,
          agentId: project.agent_id,
          agent: project.agent ? {
            id: project.agent.id,
            name: project.agent.name,
            email: "",
            position: "",
            status: "",
          } : undefined,
          notes: project.notes,
          createdAt: new Date(project.created_at),
          updatedAt: new Date(project.updated_at),
        }));

        setProjects(transformedProjects);
        setFilteredProjects(transformedProjects);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Erro ao carregar projetos");
    } finally {
      setLoading(false);
    }
  }, [user, role, roleLoading]);

  // Filter projects when search query changes
  useEffect(() => {
    if (searchQuery) {
      const filtered = projects.filter(
        (project) =>
          project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.client?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.city?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(projects);
    }
  }, [searchQuery, projects]);

  // Fetch projects on component mount and when user changes
  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user, fetchProjects]);

  // Handle project click to show details
  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setShowProjectDetails(true);
  };

  // Create project
  const createProject = async (projectData: Partial<Project>) => {
    try {
      const snakeCaseData = {
        name: projectData.name,
        description: projectData.description,
        client_id: projectData.clientId,
        status: projectData.status || "Orçamento",
        type: projectData.type || "Residencial",
        estimated_value: projectData.estimatedValue,
        start_date: projectData.startDate?.toISOString().split("T")[0],
        estimated_end_date: projectData.estimatedEndDate?.toISOString().split("T")[0],
        address: projectData.address,
        city: projectData.city,
        state: projectData.state,
        agent_id: projectData.agentId || null,
        notes: projectData.notes,
      };

      const { data, error } = await supabase
        .from("projects")
        .insert(snakeCaseData)
        .select(`
          *,
          client:clients(id, name, email, phone),
          agent:agents(id, name)
        `)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const newProject: Project = {
          id: data.id,
          name: data.name,
          description: data.description,
          clientId: data.client_id,
          client: data.client,
          status: data.status,
          statusId: data.status_id,
          type: data.type,
          estimatedValue: data.estimated_value,
          finalValue: data.final_value,
          startDate: data.start_date ? new Date(data.start_date) : undefined,
          estimatedEndDate: data.estimated_end_date ? new Date(data.estimated_end_date) : undefined,
          actualEndDate: data.actual_end_date ? new Date(data.actual_end_date) : undefined,
          address: data.address,
          city: data.city,
          state: data.state,
          agentId: data.agent_id,
          agent: data.agent,
          notes: data.notes,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        };

        setProjects((prev) => [newProject, ...prev]);
        return newProject;
      }

      return null;
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Erro ao criar projeto");
      throw error;
    }
  };

  // Update project
  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      const snakeCaseUpdates: any = {};

      if (updates.name !== undefined) snakeCaseUpdates.name = updates.name;
      if (updates.description !== undefined) snakeCaseUpdates.description = updates.description;
      if (updates.clientId !== undefined) snakeCaseUpdates.client_id = updates.clientId;
      if (updates.status !== undefined) snakeCaseUpdates.status = updates.status;
      if (updates.type !== undefined) snakeCaseUpdates.type = updates.type;
      if (updates.estimatedValue !== undefined) snakeCaseUpdates.estimated_value = updates.estimatedValue;
      if (updates.finalValue !== undefined) snakeCaseUpdates.final_value = updates.finalValue;
      if (updates.startDate !== undefined) snakeCaseUpdates.start_date = updates.startDate?.toISOString().split("T")[0];
      if (updates.estimatedEndDate !== undefined) snakeCaseUpdates.estimated_end_date = updates.estimatedEndDate?.toISOString().split("T")[0];
      if (updates.actualEndDate !== undefined) snakeCaseUpdates.actual_end_date = updates.actualEndDate?.toISOString().split("T")[0];
      if (updates.address !== undefined) snakeCaseUpdates.address = updates.address;
      if (updates.city !== undefined) snakeCaseUpdates.city = updates.city;
      if (updates.state !== undefined) snakeCaseUpdates.state = updates.state;
      if (updates.agentId !== undefined) snakeCaseUpdates.agent_id = updates.agentId;
      if (updates.notes !== undefined) snakeCaseUpdates.notes = updates.notes;

      const { data, error } = await supabase
        .from("projects")
        .update(snakeCaseUpdates)
        .eq("id", projectId)
        .select(`
          *,
          client:clients(id, name, email, phone),
          agent:agents(id, name)
        `)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const updatedProject: Project = {
          id: data.id,
          name: data.name,
          description: data.description,
          clientId: data.client_id,
          client: data.client,
          status: data.status,
          statusId: data.status_id,
          type: data.type,
          estimatedValue: data.estimated_value,
          finalValue: data.final_value,
          startDate: data.start_date ? new Date(data.start_date) : undefined,
          estimatedEndDate: data.estimated_end_date ? new Date(data.estimated_end_date) : undefined,
          actualEndDate: data.actual_end_date ? new Date(data.actual_end_date) : undefined,
          address: data.address,
          city: data.city,
          state: data.state,
          agentId: data.agent_id,
          agent: data.agent,
          notes: data.notes,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        };

        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? updatedProject : p))
        );

        return updatedProject;
      }

      return null;
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Erro ao atualizar projeto");
      throw error;
    }
  };

  // Update project status
  const updateProjectStatus = async (projectId: string, newStatus: ProjectStatus) => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .update({ status: newStatus })
        .eq("id", projectId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update local state
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, status: newStatus } : p
        )
      );

      return data;
    } catch (error) {
      console.error("Error updating project status:", error);
      toast.error("Erro ao atualizar status do projeto");
      throw error;
    }
  };

  // Delete project
  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) {
        throw error;
      }

      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      return true;
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Erro ao excluir projeto");
      throw error;
    }
  };

  return {
    projects,
    setProjects,
    selectedProject,
    setSelectedProject,
    showProjectDetails,
    setShowProjectDetails,
    loading,
    searchQuery,
    setSearchQuery,
    filteredProjects,
    handleProjectClick,
    createProject,
    updateProject,
    updateProjectStatus,
    deleteProject,
    fetchProjects,
  };
}
