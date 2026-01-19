import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  ExternalLink,
  Image,
  Video,
  Images,
} from "lucide-react";
import { useInstagramPosts } from "@/hooks/useInstagramPosts";
import { Skeleton } from "@/components/ui/skeleton";

interface InstagramPostsGridProps {
  searchTerm: string;
  categoryFilter: string;
  sectionFilter: string;
}

export function InstagramPostsGrid({
  searchTerm,
  categoryFilter,
  sectionFilter,
}: InstagramPostsGridProps) {
  const { posts, loading, deletePost, togglePostActive } = useInstagramPosts();

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || post.category === categoryFilter;
    const matchesSection =
      sectionFilter === "all" || post.showInSection?.includes(sectionFilter as any);
    return matchesSearch && matchesCategory && matchesSection;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "carousel":
        return <Images className="h-4 w-4" />;
      default:
        return <Image className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full" />
        ))}
      </div>
    );
  }

  if (filteredPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <Image className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Nenhum post encontrado</h3>
        <p className="text-muted-foreground">
          Adicione posts do Instagram para exibir no site
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {filteredPosts.map((post) => (
        <Card
          key={post.id}
          className={`overflow-hidden group ${!post.isActive ? "opacity-60" : ""}`}
        >
          <div className="aspect-square bg-muted relative">
            {post.imageUrl ? (
              <img
                src={post.imageUrl}
                alt={post.caption || "Instagram post"}
                className="w-full h-full object-cover"
              />
            ) : post.videoUrl ? (
              <video
                src={post.videoUrl}
                className="w-full h-full object-cover"
                muted
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Image className="h-16 w-16 text-muted-foreground" />
              </div>
            )}

            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.open(post.instagramUrl, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Ver no Instagram
              </Button>
            </div>

            {/* Type badge */}
            <Badge
              variant="secondary"
              className="absolute top-2 left-2 bg-black/50 text-white border-0"
            >
              {getTypeIcon(post.type)}
            </Badge>

            {/* Active toggle */}
            <div className="absolute top-2 right-2">
              <Switch
                checked={post.isActive}
                onCheckedChange={() => togglePostActive(post.id)}
                className="data-[state=checked]:bg-green-500"
              />
            </div>

            {/* Order number */}
            <Badge
              variant="secondary"
              className="absolute bottom-2 left-2 bg-black/50 text-white border-0"
            >
              #{post.displayOrder + 1}
            </Badge>
          </div>

          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                {post.caption && (
                  <p className="text-sm line-clamp-2 mb-2">{post.caption}</p>
                )}
                <div className="flex flex-wrap gap-1">
                  {post.category && (
                    <Badge variant="outline" className="text-xs">
                      {post.category}
                    </Badge>
                  )}
                  {post.showInSection?.map((section) => (
                    <Badge
                      key={section}
                      variant="secondary"
                      className="text-xs"
                    >
                      {section}
                    </Badge>
                  ))}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => window.open(post.instagramUrl, "_blank")}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Ver no Instagram
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => deletePost(post.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
