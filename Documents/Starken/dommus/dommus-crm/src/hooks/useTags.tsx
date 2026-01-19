import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/services/supabase/config";
import { Tag } from "@/types/crm";
import { toast } from "sonner";

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load tags from Supabase
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoading(true);
        const { data: fetchedTags, error } = await supabase
          .from('tags')
          .select('*');

        if (error) throw error;
        
        setTags(fetchedTags || []);
      } catch (error) {
        console.error("Error fetching tags:", error);
        toast.error("Failed to load tags");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, []);

  // Create a new tag
  const createTag = useCallback(async (name: string, color: string) => {
    try {
      // Check if tag with same name already exists
      const { data: existingTags } = await supabase
        .from('tags')
        .select('id')
        .eq('name', name)
        .single();
      
      if (existingTags) {
        toast.error(`Tag "${name}" already exists`);
        return null;
      }
      
      const newTag: Omit<Tag, "id"> = {
        name,
        color,
        created_at: new Date().toISOString()
      };
      
      const { data: createdTag, error } = await supabase
        .from('tags')
        .insert([newTag])
        .select()
        .single();

      if (error) throw error;
      
      setTags(prev => [...prev, createdTag]);
      toast.success(`Tag "${name}" created successfully`);
      
      return createdTag;
    } catch (error) {
      console.error("Error creating tag:", error);
      toast.error("Failed to create tag");
      return null;
    }
  }, []);

  // Remove a tag
  const removeTag = useCallback(async (tagId: string) => {
    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;
      
      setTags(prev => prev.filter(tag => tag.id !== tagId));
      toast.success("Tag removed successfully");
    } catch (error) {
      console.error("Error removing tag:", error);
      toast.error("Failed to remove tag");
    }
  }, []);

  return {
    tags,
    isLoading,
    createTag,
    removeTag,
  };
}
