import { useEffect, useState } from "react";
import { supabase } from "@/services/supabase/client";

interface LeadSource {
  id: string;
  name: string;
  description: string;
  color: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface UseLeadSourcesReturn {
  leadSources: LeadSource[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  getSourceColor: (sourceName: string | undefined) => string;
  getSourceById: (id: string | null | undefined) => LeadSource | undefined;
}

export function useLeadSources(): UseLeadSourcesReturn {
  const [leadSources, setLeadSources] = useState<LeadSource[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  async function fetchLeadSources() {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('lead_sources')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;

      // Transform from snake_case to camelCase
      const formattedSources: LeadSource[] = data.map(source => ({
        id: source.id,
        name: source.name,
        description: source.description || "",
        color: source.color || "#22c55e",
        orderIndex: source.order_index,
        isActive: source.is_active,
        createdAt: new Date(source.created_at),
        updatedAt: new Date(source.updated_at)
      }));

      setLeadSources(formattedSources);
    } catch (err) {
      console.error('Error fetching lead sources:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred while fetching lead sources'));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchLeadSources();
  }, []);

  // Get color for a source by name
  const getSourceColor = (sourceName: string | undefined): string => {
    if (!sourceName) return "#64748b"; // Default color if no name provided
    
    // First try to find the source by exact name match
    const source = leadSources.find(s => s.name === sourceName);
    if (source) return source.color;
    
    // If not found, check if sourceName is actually an ID
    const sourceById = leadSources.find(s => s.id === sourceName);
    if (sourceById) return sourceById.color;
    
    // Default color if not found
    return "#64748b";
  };

  // Get source by ID
  const getSourceById = (id: string | null | undefined): LeadSource | undefined => {
    if (!id) return undefined;
    return leadSources.find(source => source.id === id);
  };

  return {
    leadSources,
    isLoading,
    error,
    refetch: fetchLeadSources,
    getSourceColor,
    getSourceById
  };
} 