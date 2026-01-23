import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/services/supabase/client";
import staticInstagramData from "@/data/instagramPosts.json";

export interface InstagramPost {
  id: string;
  imageUrl: string;
  type: "image" | "video";
  caption: string;
  permalink: string;
}

interface InstagramData {
  instagramHandle: string;
  profileUrl: string;
  posts: InstagramPost[];
}

export function useInstagramPosts() {
  const [data, setData] = useState<InstagramData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFromSupabase = useCallback(async (): Promise<InstagramData | null> => {
    if (!supabase || !isSupabaseConfigured) {
      return null;
    }

    try {
      const { data: postsData, error } = await supabase
        .from("instagram_posts")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) {
        console.error("Error fetching from Supabase:", error);
        return null;
      }

      if (postsData && postsData.length > 0) {
        const posts: InstagramPost[] = postsData.map((post: any) => ({
          id: post.id,
          imageUrl: post.image_url || post.video_url || "",
          type: post.type || "image",
          caption: post.caption || "",
          permalink: post.instagram_url || "",
        }));

        return {
          instagramHandle: staticInstagramData.instagramHandle,
          profileUrl: staticInstagramData.profileUrl,
          posts,
        };
      }

      return null;
    } catch (err) {
      console.error("Error fetching Instagram posts:", err);
      return null;
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Tenta buscar do Supabase primeiro
      const supabaseData = await fetchFromSupabase();

      if (supabaseData && supabaseData.posts.length > 0) {
        setData(supabaseData);
      } else {
        // Fallback para dados estáticos
        setData({
          instagramHandle: staticInstagramData.instagramHandle,
          profileUrl: staticInstagramData.profileUrl,
          posts: staticInstagramData.posts.map((post) => ({
            id: post.id,
            imageUrl: post.imageUrl,
            type: post.type as "image" | "video",
            caption: post.caption,
            permalink: post.permalink,
          })),
        });
      }
    } catch (err) {
      console.error("Error loading Instagram posts:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
      // Em caso de erro, usa dados estáticos
      setData({
        instagramHandle: staticInstagramData.instagramHandle,
        profileUrl: staticInstagramData.profileUrl,
        posts: staticInstagramData.posts.map((post) => ({
          id: post.id,
          imageUrl: post.imageUrl,
          type: post.type as "image" | "video",
          caption: post.caption,
          permalink: post.permalink,
        })),
      });
    } finally {
      setLoading(false);
    }
  }, [fetchFromSupabase]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    data,
    loading,
    error,
    refetch: fetchPosts,
  };
}
