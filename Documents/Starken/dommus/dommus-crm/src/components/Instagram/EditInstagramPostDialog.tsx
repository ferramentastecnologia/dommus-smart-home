import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";
import {
  Save,
  Loader2,
  Instagram,
  Image,
  Video,
  Images,
  ExternalLink,
} from "lucide-react";
import { InstagramPost, InstagramPostCategory, InstagramSection } from "@/types/crm";
import { useInstagramPosts } from "@/hooks/useInstagramPosts";

interface EditInstagramPostDialogProps {
  post: InstagramPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: () => void;
}

const postCategories: InstagramPostCategory[] = [
  "Residencial",
  "Corporativo",
  "Home Theater",
  "Automação",
  "Áudio",
  "Geral",
];

const postTypes: { value: "image" | "video" | "carousel"; label: string; icon: React.ReactNode }[] = [
  { value: "image", label: "Imagem", icon: <Image className="h-4 w-4" /> },
  { value: "video", label: "Vídeo/Reel", icon: <Video className="h-4 w-4" /> },
  { value: "carousel", label: "Carrossel", icon: <Images className="h-4 w-4" /> },
];

const sections: { value: InstagramSection; label: string }[] = [
  { value: "feed", label: "Feed Principal" },
  { value: "projects", label: "Projetos" },
  { value: "hero", label: "Banner Hero" },
];

export function EditInstagramPostDialog({
  post,
  open,
  onOpenChange,
  onSave,
}: EditInstagramPostDialogProps) {
  const { updatePost } = useInstagramPosts();

  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    instagramUrl: "",
    imageUrl: "",
    videoUrl: "",
    caption: "",
    type: "image" as "image" | "video" | "carousel",
    category: "Geral" as InstagramPostCategory,
    isActive: true,
    showInSection: ["feed"] as InstagramSection[],
  });

  // Load post data when dialog opens
  useEffect(() => {
    if (post && open) {
      setFormData({
        instagramUrl: post.instagramUrl || "",
        imageUrl: post.imageUrl || "",
        videoUrl: post.videoUrl || "",
        caption: post.caption || "",
        type: post.type || "image",
        category: post.category || "Geral",
        isActive: post.isActive ?? true,
        showInSection: post.showInSection || ["feed"],
      });
    }
  }, [post, open]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSectionToggle = (section: InstagramSection) => {
    setFormData((prev) => {
      const current = prev.showInSection;
      if (current.includes(section)) {
        return {
          ...prev,
          showInSection: current.filter((s) => s !== section),
        };
      }
      return {
        ...prev,
        showInSection: [...current, section],
      };
    });
  };

  const handleSave = async () => {
    if (!post) return;

    if (!formData.instagramUrl) {
      toast.error("O link do Instagram é obrigatório");
      return;
    }

    if (!formData.imageUrl && !formData.videoUrl) {
      toast.error("Adicione uma imagem ou vídeo do post");
      return;
    }

    if (formData.showInSection.length === 0) {
      toast.error("Selecione pelo menos uma seção para exibir");
      return;
    }

    setIsSaving(true);
    try {
      await updatePost(post.id, {
        instagramUrl: formData.instagramUrl,
        imageUrl: formData.imageUrl,
        videoUrl: formData.videoUrl,
        caption: formData.caption,
        type: formData.type,
        category: formData.category,
        isActive: formData.isActive,
        showInSection: formData.showInSection,
      });

      toast.success("Post atualizado com sucesso!");
      onSave?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving post:", error);
      toast.error("Erro ao salvar post");
    } finally {
      setIsSaving(false);
    }
  };

  if (!post) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5 text-pink-500" />
            Editar Post do Instagram
          </DialogTitle>
          <DialogDescription>
            Edite as informações do post para exibição no site
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Preview */}
          <div className="flex justify-center">
            <div className="w-48 h-48 rounded-lg bg-muted flex items-center justify-center overflow-hidden border relative">
              {formData.imageUrl ? (
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : formData.videoUrl ? (
                <video
                  src={formData.videoUrl}
                  className="w-full h-full object-cover"
                  muted
                />
              ) : (
                <Instagram className="h-16 w-16 text-muted-foreground" />
              )}
              {formData.instagramUrl && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-2 right-2"
                  onClick={() => window.open(formData.instagramUrl, "_blank")}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Instagram URL */}
          <div className="space-y-2">
            <Label htmlFor="instagramUrl">Link do Instagram *</Label>
            <Input
              id="instagramUrl"
              value={formData.instagramUrl}
              onChange={(e) => handleChange("instagramUrl", e.target.value)}
              placeholder="https://www.instagram.com/p/..."
            />
          </div>

          {/* Image/Video URLs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL da Imagem</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => handleChange("imageUrl", e.target.value)}
                placeholder="URL da imagem/thumbnail"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="videoUrl">URL do Vídeo</Label>
              <Input
                id="videoUrl"
                value={formData.videoUrl}
                onChange={(e) => handleChange("videoUrl", e.target.value)}
                placeholder="URL do vídeo (para reels)"
              />
            </div>
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption">Legenda</Label>
            <Textarea
              id="caption"
              value={formData.caption}
              onChange={(e) => handleChange("caption", e.target.value)}
              placeholder="Legenda do post..."
              rows={3}
            />
          </div>

          {/* Type and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Post</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "image" | "video" | "carousel") =>
                  handleChange("type", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {postTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        {type.icon}
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value: InstagramPostCategory) =>
                  handleChange("category", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {postCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-2">
            <Label>Exibir nas Seções</Label>
            <div className="flex flex-wrap gap-4">
              {sections.map((section) => (
                <div key={section.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={section.value}
                    checked={formData.showInSection.includes(section.value)}
                    onCheckedChange={() => handleSectionToggle(section.value)}
                  />
                  <label
                    htmlFor={section.value}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {section.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Status do Post</Label>
              <p className="text-xs text-muted-foreground">
                Posts inativos não aparecem no site
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => handleChange("isActive", checked)}
              />
              <span className="text-sm">
                {formData.isActive ? "Ativo" : "Inativo"}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
