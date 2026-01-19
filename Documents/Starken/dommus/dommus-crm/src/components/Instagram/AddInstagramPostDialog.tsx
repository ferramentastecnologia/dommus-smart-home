import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInstagramPosts } from "@/hooks/useInstagramPosts";
import { toast } from "sonner";

const postSchema = z.object({
  instagramUrl: z.string().url("URL inválida").min(1, "URL do Instagram é obrigatória"),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  caption: z.string().optional(),
  type: z.enum(["image", "video", "carousel"]),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
  showInFeed: z.boolean().optional(),
  showInProjects: z.boolean().optional(),
  showInHero: z.boolean().optional(),
});

type PostFormData = z.infer<typeof postSchema>;

interface AddInstagramPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categories = [
  "Residencial",
  "Corporativo",
  "Home Theater",
  "Automação",
  "Áudio",
  "Geral",
];

export function AddInstagramPostDialog({ open, onOpenChange }: AddInstagramPostDialogProps) {
  const { createPost, loading } = useInstagramPosts();

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      instagramUrl: "",
      imageUrl: "",
      videoUrl: "",
      caption: "",
      type: "image",
      category: "Geral",
      isActive: true,
      showInFeed: true,
      showInProjects: false,
      showInHero: false,
    },
  });

  const onSubmit = async (data: PostFormData) => {
    try {
      const sections: string[] = [];
      if (data.showInFeed) sections.push("feed");
      if (data.showInProjects) sections.push("projects");
      if (data.showInHero) sections.push("hero");

      await createPost({
        instagramUrl: data.instagramUrl,
        imageUrl: data.imageUrl || undefined,
        videoUrl: data.videoUrl || undefined,
        caption: data.caption,
        type: data.type,
        category: data.category as any,
        isActive: data.isActive ?? true,
        showInSection: sections as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      toast.success("Post adicionado com sucesso!");
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao adicionar post");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Post do Instagram</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="instagramUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Post no Instagram *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://www.instagram.com/p/..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Cole a URL completa do post do Instagram
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Mídia *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="image">Imagem</SelectItem>
                      <SelectItem value="video">Vídeo / Reel</SelectItem>
                      <SelectItem value="carousel">Carrossel</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Imagem (local)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="/instagram/post1.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Caminho para a imagem salva localmente
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("type") === "video" && (
              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL do Vídeo (local)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="/instagram/reel1.mp4"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Caminho para o vídeo salvo localmente
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="caption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Legenda</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Legenda do post..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormLabel>Exibir nas seções:</FormLabel>

              <FormField
                control={form.control}
                name="showInFeed"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Feed principal</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="showInProjects"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Página de Projetos</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="showInHero"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Carrossel Hero</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Ativo</FormLabel>
                    <FormDescription>
                      Exibir este post no site
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Adicionando..." : "Adicionar Post"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
