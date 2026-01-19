import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye, Package } from "lucide-react";
import { useCatalogProducts } from "@/hooks/useCatalogProducts";
import { Skeleton } from "@/components/ui/skeleton";

interface CatalogGridProps {
  searchTerm: string;
  categoryFilter: string;
}

export function CatalogGrid({ searchTerm, categoryFilter }: CatalogGridProps) {
  const { products, loading, deleteProduct, toggleProductActive } = useCatalogProducts();

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const formatCurrency = (value?: number) => {
    if (!value) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Nenhum produto encontrado</h3>
        <p className="text-muted-foreground">
          Adicione produtos ao catálogo para começar
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {filteredProducts.map((product) => (
        <Card
          key={product.id}
          className={`overflow-hidden ${!product.isActive ? "opacity-60" : ""}`}
        >
          <div className="aspect-square bg-muted relative">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
            {!product.isActive && (
              <Badge
                variant="secondary"
                className="absolute top-2 left-2 bg-red-500 text-white"
              >
                Inativo
              </Badge>
            )}
            {!product.inStock && (
              <Badge
                variant="secondary"
                className="absolute top-2 right-2 bg-amber-500 text-white"
              >
                Sem Estoque
              </Badge>
            )}
          </div>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-medium line-clamp-1">
                  {product.name}
                </CardTitle>
                {product.brand && (
                  <p className="text-xs text-muted-foreground">{product.brand}</p>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    Visualizar
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleProductActive(product.id)}>
                    {product.isActive ? "Desativar" : "Ativar"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => deleteProduct(product.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Badge variant="outline" className="text-xs mb-2">
              {product.category}
            </Badge>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-primary">
                {formatCurrency(product.salePrice)}
              </span>
              {product.sku && (
                <span className="text-xs text-muted-foreground font-mono">
                  {product.sku}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
