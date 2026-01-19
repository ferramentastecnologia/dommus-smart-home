import React, { useState } from "react";
import { Plus, Search, Instagram as InstagramIcon, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InstagramPostsGrid } from "@/components/Instagram/InstagramPostsGrid";
import { AddInstagramPostDialog } from "@/components/Instagram/AddInstagramPostDialog";

const categories = [
  "Residencial",
  "Corporativo",
  "Home Theater",
  "Automação",
  "Áudio",
  "Geral",
];

export default function Instagram() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <InstagramIcon className="h-6 w-6" />
            Gestão de Posts Instagram
          </h1>
          <p className="text-muted-foreground">
            Gerencie os posts do Instagram que aparecem no site
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Post
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sectionFilter} onValueChange={setSectionFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seção" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Seções</SelectItem>
            <SelectItem value="feed">Feed</SelectItem>
            <SelectItem value="projects">Projetos</SelectItem>
            <SelectItem value="hero">Hero</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Info Card */}
      <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
        <GripVertical className="h-5 w-5 text-muted-foreground mt-0.5" />
        <div>
          <p className="text-sm font-medium">Dica: Arraste os posts para reordenar</p>
          <p className="text-sm text-muted-foreground">
            A ordem definida aqui será a mesma exibida no site da Dommus
          </p>
        </div>
      </div>

      {/* Content */}
      <InstagramPostsGrid
        searchTerm={searchTerm}
        categoryFilter={categoryFilter}
        sectionFilter={sectionFilter}
      />

      {/* Add Post Dialog */}
      <AddInstagramPostDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </div>
  );
}
