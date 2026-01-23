import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Edit,
  Save,
  X,
  Package,
  DollarSign,
  Loader2,
  Tag,
  Warehouse,
  Image as ImageIcon,
} from "lucide-react";
import { CatalogProduct, ProductCategory } from "@/types/crm";
import { useCatalogProducts } from "@/hooks/useCatalogProducts";

interface ProductDetailsDialogProps {
  product: CatalogProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: () => void;
  startInEditMode?: boolean;
}

const productCategories: ProductCategory[] = [
  "Automação",
  "Iluminação",
  "Áudio",
  "Vídeo",
  "Home Theater",
  "Climatização",
  "Segurança",
  "Cortinas",
  "Infraestrutura",
  "Acessórios",
  "Outro",
];

export function ProductDetailsDialog({
  product,
  open,
  onOpenChange,
  onSave,
  startInEditMode = false,
}: ProductDetailsDialogProps) {
  const { updateProduct } = useCatalogProducts();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sku: "",
    brand: "",
    category: "Outro" as ProductCategory,
    subcategory: "",
    costPrice: 0,
    salePrice: 0,
    suggestedMarkup: 0,
    imageUrl: "",
    supplier: "",
    inStock: true,
    stockQuantity: 0,
    isActive: true,
  });

  // Load product data when dialog opens
  useEffect(() => {
    if (product && open) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        sku: product.sku || "",
        brand: product.brand || "",
        category: product.category || "Outro",
        subcategory: product.subcategory || "",
        costPrice: product.costPrice || 0,
        salePrice: product.salePrice || 0,
        suggestedMarkup: product.suggestedMarkup || 0,
        imageUrl: product.imageUrl || "",
        supplier: product.supplier || "",
        inStock: product.inStock ?? true,
        stockQuantity: product.stockQuantity || 0,
        isActive: product.isActive ?? true,
      });
      setIsEditing(startInEditMode);
      setHasChanges(false);
    }
  }, [product, open, startInEditMode]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  // Calculate markup when prices change
  useEffect(() => {
    if (formData.costPrice > 0 && formData.salePrice > 0 && isEditing) {
      const markup = ((formData.salePrice - formData.costPrice) / formData.costPrice) * 100;
      setFormData((prev) => ({ ...prev, suggestedMarkup: Math.round(markup * 100) / 100 }));
    }
  }, [formData.costPrice, formData.salePrice, isEditing]);

  const handleSave = async () => {
    if (!product) return;

    if (!formData.name) {
      toast.error("O nome do produto é obrigatório");
      return;
    }

    if (formData.salePrice <= 0) {
      toast.error("O preço de venda deve ser maior que zero");
      return;
    }

    setIsSaving(true);
    try {
      await updateProduct(product.id, {
        name: formData.name,
        description: formData.description,
        sku: formData.sku,
        brand: formData.brand,
        category: formData.category,
        subcategory: formData.subcategory,
        costPrice: formData.costPrice,
        salePrice: formData.salePrice,
        suggestedMarkup: formData.suggestedMarkup,
        imageUrl: formData.imageUrl,
        supplier: formData.supplier,
        inStock: formData.inStock,
        stockQuantity: formData.stockQuantity,
        isActive: formData.isActive,
      });

      toast.success("Produto atualizado com sucesso!");
      setIsEditing(false);
      setHasChanges(false);
      onSave?.();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Erro ao salvar produto");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (hasChanges && isEditing) {
      setShowConfirmClose(true);
    } else {
      onOpenChange(false);
    }
  };

  const confirmClose = () => {
    setShowConfirmClose(false);
    setIsEditing(false);
    setHasChanges(false);
    onOpenChange(false);
  };

  const formatCurrency = (value?: number) => {
    if (!value) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (!product) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  {isEditing ? "Editar Produto" : product.name}
                </DialogTitle>
                <DialogDescription>
                  {isEditing
                    ? "Edite os dados do produto"
                    : product.sku ? `SKU: ${product.sku}` : "Sem SKU"}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        if (product) {
                          setFormData({
                            name: product.name || "",
                            description: product.description || "",
                            sku: product.sku || "",
                            brand: product.brand || "",
                            category: product.category || "Outro",
                            subcategory: product.subcategory || "",
                            costPrice: product.costPrice || 0,
                            salePrice: product.salePrice || 0,
                            suggestedMarkup: product.suggestedMarkup || 0,
                            imageUrl: product.imageUrl || "",
                            supplier: product.supplier || "",
                            inStock: product.inStock ?? true,
                            stockQuantity: product.stockQuantity || 0,
                            isActive: product.isActive ?? true,
                          });
                        }
                        setHasChanges(false);
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
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
                  </>
                )}
              </div>
            </div>
          </DialogHeader>

          <Tabs defaultValue="info" className="mt-4">
            <TabsList>
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="pricing">Preços</TabsTrigger>
              <TabsTrigger value="stock">Estoque</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Product Image */}
                <div className="col-span-2 flex justify-center mb-4">
                  <div className="w-48 h-48 rounded-lg bg-muted flex items-center justify-center overflow-hidden border">
                    {isEditing ? (
                      <div className="space-y-2 p-4 w-full">
                        {formData.imageUrl ? (
                          <img
                            src={formData.imageUrl}
                            alt={formData.name}
                            className="w-full h-32 object-cover rounded"
                          />
                        ) : (
                          <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto" />
                        )}
                        <Input
                          placeholder="URL da imagem"
                          value={formData.imageUrl}
                          onChange={(e) => handleChange("imageUrl", e.target.value)}
                          className="text-xs"
                        />
                      </div>
                    ) : product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="h-16 w-16 text-muted-foreground" />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Produto</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Ex: Controlador de Iluminação HDL"
                    />
                  ) : (
                    <p className="text-sm font-medium">{product.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  {isEditing ? (
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => handleChange("sku", e.target.value)}
                      placeholder="Ex: HDL-CTR-001"
                    />
                  ) : (
                    <p className="text-sm font-mono">{product.sku || "-"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Marca</Label>
                  {isEditing ? (
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => handleChange("brand", e.target.value)}
                      placeholder="Ex: HDL, Savant, Control4"
                    />
                  ) : (
                    <p className="text-sm font-medium">{product.brand || "-"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  {isEditing ? (
                    <Select
                      value={formData.category}
                      onValueChange={(value: ProductCategory) =>
                        handleChange("category", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {productCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline">{product.category}</Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier">Fornecedor</Label>
                  {isEditing ? (
                    <Input
                      id="supplier"
                      value={formData.supplier}
                      onChange={(e) => handleChange("supplier", e.target.value)}
                      placeholder="Nome do fornecedor"
                    />
                  ) : (
                    <p className="text-sm font-medium">{product.supplier || "-"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isActive">Status</Label>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.isActive}
                        onCheckedChange={(checked) => handleChange("isActive", checked)}
                      />
                      <span className="text-sm">
                        {formData.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                  ) : (
                    <Badge
                      variant={product.isActive ? "default" : "secondary"}
                      className={product.isActive ? "bg-green-500" : "bg-gray-500"}
                    >
                      {product.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  )}
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  {isEditing ? (
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder="Descrição detalhada do produto..."
                      rows={4}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {product.description || "Sem descrição"}
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4 mt-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Preço de Custo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={formData.costPrice}
                        onChange={(e) =>
                          handleChange("costPrice", parseFloat(e.target.value) || 0)
                        }
                        placeholder="0,00"
                        step="0.01"
                      />
                    ) : (
                      <p className="text-2xl font-bold text-muted-foreground">
                        {formatCurrency(product.costPrice)}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Preço de Venda
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={formData.salePrice}
                        onChange={(e) =>
                          handleChange("salePrice", parseFloat(e.target.value) || 0)
                        }
                        placeholder="0,00"
                        step="0.01"
                      />
                    ) : (
                      <p className="text-2xl font-bold text-primary flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        {formatCurrency(product.salePrice)}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Markup
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-600">
                      {formData.suggestedMarkup.toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Lucro por unidade:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency((formData.salePrice || 0) - (formData.costPrice || 0))}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stock" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Warehouse className="h-4 w-4" />
                      Em Estoque
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={formData.inStock}
                          onCheckedChange={(checked) => handleChange("inStock", checked)}
                        />
                        <span className="text-sm">
                          {formData.inStock ? "Sim" : "Não"}
                        </span>
                      </div>
                    ) : (
                      <Badge
                        variant="outline"
                        className={
                          product.inStock
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }
                      >
                        {product.inStock ? "Disponível" : "Sem estoque"}
                      </Badge>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Quantidade em Estoque
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={formData.stockQuantity}
                        onChange={(e) =>
                          handleChange("stockQuantity", parseInt(e.target.value) || 0)
                        }
                        placeholder="0"
                        min="0"
                      />
                    ) : (
                      <p className="text-2xl font-bold">
                        {product.stockQuantity ?? 0} unidades
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmClose} onOpenChange={setShowConfirmClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem alterações não salvas. Tem certeza que deseja sair sem salvar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar editando</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClose}>
              Descartar alterações
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
