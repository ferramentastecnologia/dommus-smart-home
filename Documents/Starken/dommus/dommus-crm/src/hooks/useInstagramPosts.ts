import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/services/supabase/client";
import { toast } from "sonner";
import { InstagramPost, InstagramSection, InstagramPostCategory } from "@/types/crm";

export function useInstagramPosts() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPosts, setFilteredPosts] = useState<InstagramPost[]>([]);

  // Fetch posts from database
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("instagram_posts")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) {
        throw error;
      }

      if (data) {
        const transformedPosts: InstagramPost[] = data.map((post: any) => ({
          id: post.id,
          instagramUrl: post.instagram_url,
          imageUrl: post.image_url,
          videoUrl: post.video_url,
          caption: post.caption,
          type: post.type || "image",
          category: post.category,
          isActive: post.is_active ?? true,
          displayOrder: post.display_order || 0,
          showInSection: post.show_in_sections || ["feed"],
          createdAt: new Date(post.created_at),
          updatedAt: new Date(post.updated_at),
        }));

        setPosts(transformedPosts);
        setFilteredPosts(transformedPosts);
      }
    } catch (error) {
      console.error("Error fetching instagram posts:", error);
      toast.error("Erro ao carregar posts do Instagram");
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter posts when search query changes
  useEffect(() => {
    if (searchQuery) {
      const filtered = posts.filter(
        (post) =>
          post.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts(posts);
    }
  }, [searchQuery, posts]);

  // Fetch posts on mount
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Create post
  const createPost = async (postData: Partial<InstagramPost>) => {
    try {
      // Get highest display_order
      const maxOrder = Math.max(...posts.map((p) => p.displayOrder), -1);

      const snakeCaseData = {
        instagram_url: postData.instagramUrl,
        image_url: postData.imageUrl,
        video_url: postData.videoUrl,
        caption: postData.caption,
        type: postData.type || "image",
        category: postData.category,
        is_active: postData.isActive ?? true,
        display_order: maxOrder + 1,
        show_in_sections: postData.showInSection || ["feed"],
      };

      const { data, error } = await supabase
        .from("instagram_posts")
        .insert(snakeCaseData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const newPost: InstagramPost = {
          id: data.id,
          instagramUrl: data.instagram_url,
          imageUrl: data.image_url,
          videoUrl: data.video_url,
          caption: data.caption,
          type: data.type,
          category: data.category,
          isActive: data.is_active,
          displayOrder: data.display_order,
          showInSection: data.show_in_sections,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        };

        setPosts((prev) => [...prev, newPost]);
        return newPost;
      }

      return null;
    } catch (error) {
      console.error("Error creating instagram post:", error);
      toast.error("Erro ao criar post do Instagram");
      throw error;
    }
  };

  // Update post
  const updatePost = async (postId: string, updates: Partial<InstagramPost>) => {
    try {
      const snakeCaseUpdates: any = {};

      if (updates.instagramUrl !== undefined) snakeCaseUpdates.instagram_url = updates.instagramUrl;
      if (updates.imageUrl !== undefined) snakeCaseUpdates.image_url = updates.imageUrl;
      if (updates.videoUrl !== undefined) snakeCaseUpdates.video_url = updates.videoUrl;
      if (updates.caption !== undefined) snakeCaseUpdates.caption = updates.caption;
      if (updates.type !== undefined) snakeCaseUpdates.type = updates.type;
      if (updates.category !== undefined) snakeCaseUpdates.category = updates.category;
      if (updates.isActive !== undefined) snakeCaseUpdates.is_active = updates.isActive;
      if (updates.displayOrder !== undefined) snakeCaseUpdates.display_order = updates.displayOrder;
      if (updates.showInSection !== undefined) snakeCaseUpdates.show_in_sections = updates.showInSection;

      const { data, error } = await supabase
        .from("instagram_posts")
        .update(snakeCaseUpdates)
        .eq("id", postId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const updatedPost: InstagramPost = {
          id: data.id,
          instagramUrl: data.instagram_url,
          imageUrl: data.image_url,
          videoUrl: data.video_url,
          caption: data.caption,
          type: data.type,
          category: data.category,
          isActive: data.is_active,
          displayOrder: data.display_order,
          showInSection: data.show_in_sections,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        };

        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? updatedPost : p))
        );

        return updatedPost;
      }

      return null;
    } catch (error) {
      console.error("Error updating instagram post:", error);
      toast.error("Erro ao atualizar post do Instagram");
      throw error;
    }
  };

  // Delete post
  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from("instagram_posts")
        .delete()
        .eq("id", postId);

      if (error) {
        throw error;
      }

      setPosts((prev) => prev.filter((p) => p.id !== postId));
      return true;
    } catch (error) {
      console.error("Error deleting instagram post:", error);
      toast.error("Erro ao excluir post do Instagram");
      throw error;
    }
  };

  // Toggle post active status
  const togglePostActive = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (post) {
      return updatePost(postId, { isActive: !post.isActive });
    }
  };

  // Reorder posts
  const reorderPosts = async (reorderedPosts: InstagramPost[]) => {
    try {
      // Update all posts with new order
      const updates = reorderedPosts.map((post, index) => ({
        id: post.id,
        display_order: index,
      }));

      for (const update of updates) {
        await supabase
          .from("instagram_posts")
          .update({ display_order: update.display_order })
          .eq("id", update.id);
      }

      setPosts(reorderedPosts.map((p, i) => ({ ...p, displayOrder: i })));
      toast.success("Ordem atualizada com sucesso!");
    } catch (error) {
      console.error("Error reordering posts:", error);
      toast.error("Erro ao reordenar posts");
      throw error;
    }
  };

  return {
    posts,
    setPosts,
    loading,
    searchQuery,
    setSearchQuery,
    filteredPosts,
    createPost,
    updatePost,
    deletePost,
    togglePostActive,
    reorderPosts,
    fetchPosts,
  };
}
