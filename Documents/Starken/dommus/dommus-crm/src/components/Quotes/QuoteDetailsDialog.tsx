import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Building,
  Calendar,
  FileText,
  Plus,
  Trash2,
  User,
  Package,
  Download,
  Send,
  CheckCircle,
  XCircle,
  Edit,
  Save,
} from "lucide-react";
import { Quote, QuoteItem, CatalogProduct } from "@/types/crm";
import { useQuotesData } from "@/hooks/useQuotesData";
import { useCatalogProducts } from "@/hooks/useCatalogProducts";
import { supabase } from "@/services/supabase/client";
import { toast } from "sonner";

interface QuoteDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: Quote | null;
  onQuoteUpdated?: () => void;
}

const statusColors: Record<string, string> = {
  Rascunho: "bg-gray-500",
  Enviado: "bg-blue-500",
  Visualizado: "bg-amber-500",
  Aprovado: "bg-green-500",
  Rejeitado: "bg-red-500",
  Expirado: "bg-gray-400",
  Convertido: "bg-emerald-500",
};

export function QuoteDetailsDialog({
  open,
  onOpenChange,
  quote,
  onQuoteUpdated,
}: QuoteDetailsDialogProps) {
  const { updateQuote, updateQuoteStatus } = useQuotesData();
  const { products } = useCatalogProducts();
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Form state for new item
  const [newItem, setNewItem] = useState({
    productId: "",
    description: "",
    quantity: 1,
    unitPrice: 0,
    room: "",
  });

  // Fetch quote items when dialog opens
  useEffect(() => {
    if (open && quote) {
      fetchQuoteItems();
    }
  }, [open, quote]);

  const fetchQuoteItems = async () => {
    if (!quote) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("quote_items")
        .select(`
          *,
          product:catalog_products(id, name, brand, category, sale_price, image_url)
        `)
        .eq("quote_id", quote.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (data) {
        const transformedItems: QuoteItem[] = data.map((item: any) => ({
          id: item.id,
          quoteId: item.quote_id,
          productId: item.product_id,
          product: item.product ? {
            id: item.product.id,
            name: item.product.name,
            brand: item.product.brand,
            category: item.product.category,
            salePrice: item.product.sale_price,
            imageUrl: item.product.image_url,
          } : undefined,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          discount: item.discount,
          totalPrice: item.total_price,
          room: item.room,
        }));
        setItems(transformedItems);
      }
    } catch (error) {
      console.error("Error fetching quote items:", error);
      toast.error("Erro ao carregar itens do orçamento");
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setNewItem({
        ...newItem,
        productId,
        description: product.name,
        unitPrice: product.salePrice,
      });
    }
  };

  const addItem = async () => {
    if (!quote || !newItem.description || newItem.unitPrice <= 0) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const totalPrice = newItem.quantity * newItem.unitPrice;
      const { data, error } = await supabase
        .from("quote_items")
        .insert({
          quote_id: quote.id,
          product_id: newItem.productId || null,
          description: newItem.description,
          quantity: newItem.quantity,
          unit_price: newItem.unitPrice,
          total_price: totalPrice,
          room: newItem.room || null,
        })
        .select(`
          *,
          product:catalog_products(id, name, brand, category, sale_price, image_url)
        `)
        .single();

      if (error) throw error;

      if (data) {
        const newQuoteItem: QuoteItem = {
          id: data.id,
          quoteId: data.quote_id,
          productId: data.product_id,
          product: data.product,
          description: data.description,
          quantity: data.quantity,
          unitPrice: data.unit_price,
          totalPrice: data.total_price,
          room: data.room,
        };
        setItems([...items, newQuoteItem]);
        setNewItem({
          productId: "",
          description: "",
          quantity: 1,
          unitPrice: 0,
          room: "",
        });
        updateQuoteTotals([...items, newQuoteItem]);
        toast.success("Item adicionado");
      }
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Erro ao adicionar item");
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("quote_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      const updatedItems = items.filter((item) => item.id !== itemId);
      setItems(updatedItems);
      updateQuoteTotals(updatedItems);
      toast.success("Item removido");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Erro ao remover item");
    }
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  const updateQuoteTotals = async (currentItems: QuoteItem[]) => {
    if (!quote) return;

    const subtotal = currentItems.reduce((acc, item) => acc + item.totalPrice, 0);
    const laborCost = quote.laborCost || 0;
    const installationCost = quote.installationCost || 0;
    let discount = quote.discount || 0;

    if (quote.discountType === "percentage") {
      discount = (subtotal * discount) / 100;
    }

    const totalValue = subtotal + laborCost + installationCost - discount;

    try {
      await updateQuote(quote.id, {
        subtotal,
        totalValue,
      });
      onQuoteUpdated?.();
    } catch (error) {
      console.error("Error updating quote totals:", error);
    }
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const calculateSubtotal = () => {
    return items.reduce((acc, item) => acc + item.totalPrice, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const laborCost = quote?.laborCost || 0;
    const installationCost = quote?.installationCost || 0;
    let discount = quote?.discount || 0;

    if (quote?.discountType === "percentage") {
      discount = (subtotal * discount) / 100;
    }

    return subtotal + laborCost + installationCost - discount;
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!quote) return;
    try {
      await updateQuoteStatus(quote.id, newStatus as any);
      toast.success(`Status atualizado para ${newStatus}`);
      onQuoteUpdated?.();
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  const exportToPDF = () => {
    // TODO: Implement PDF export
    toast.info("Funcionalidade de exportar PDF será implementada em breve");
  };

  if (!quote) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DialogTitle className="text-xl">
                  Orçamento {quote.number}
                </DialogTitle>
                <Badge className={statusColors[quote.status]}>
                  {quote.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={exportToPDF}>
                  <Download className="h-4 w-4 mr-1" />
                  PDF
                </Button>
                {quote.status === "Rascunho" && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange("Enviado")}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Enviar
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 pb-4">
              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Building className="h-4 w-4" />
                    <span className="text-sm font-medium">Cliente</span>
                  </div>
                  <p className="font-semibold">{quote.client?.name || "-"}</p>
                  <p className="text-sm text-muted-foreground">
                    {quote.client?.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {quote.client?.phone}
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-medium">Projeto</span>
                  </div>
                  <p className="font-semibold">
                    {quote.project?.name || "Sem projeto vinculado"}
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">Validade</span>
                  </div>
                  <p className="font-semibold">
                    {quote.validUntil
                      ? format(new Date(quote.validUntil), "dd/MM/yyyy", {
                          locale: ptBR,
                        })
                      : "-"}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Items Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Itens do Orçamento</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? (
                      <>
                        <Save className="h-4 w-4 mr-1" />
                        Concluir
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-1" />
                        Editar Itens
                      </>
                    )}
                  </Button>
                </div>

                {/* Add Item Form */}
                {isEditing && (
                  <div className="bg-muted/30 rounded-lg p-4 mb-4 space-y-3">
                    <h4 className="font-medium text-sm">Adicionar Item</h4>
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                      <div className="md:col-span-2">
                        <Select
                          value={newItem.productId}
                          onValueChange={handleProductSelect}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um produto" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Item personalizado</SelectItem>
                            {products
                              .filter((p) => p.isActive)
                              .map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} - {formatCurrency(product.salePrice)}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <Input
                          placeholder="Descrição"
                          value={newItem.description}
                          onChange={(e) =>
                            setNewItem({ ...newItem, description: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          placeholder="Qtd"
                          min="1"
                          value={newItem.quantity}
                          onChange={(e) =>
                            setNewItem({
                              ...newItem,
                              quantity: parseInt(e.target.value) || 1,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          placeholder="Preço Unit."
                          step="0.01"
                          value={newItem.unitPrice || ""}
                          onChange={(e) =>
                            setNewItem({
                              ...newItem,
                              unitPrice: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                      <div className="md:col-span-2">
                        <Input
                          placeholder="Ambiente (ex: Sala de Estar)"
                          value={newItem.room}
                          onChange={(e) =>
                            setNewItem({ ...newItem, room: e.target.value })
                          }
                        />
                      </div>
                      <div className="md:col-span-4 flex justify-end">
                        <Button onClick={addItem}>
                          <Plus className="h-4 w-4 mr-1" />
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Items Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Ambiente</TableHead>
                        <TableHead className="text-right">Qtd</TableHead>
                        <TableHead className="text-right">Preço Unit.</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        {isEditing && <TableHead className="w-10"></TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={isEditing ? 6 : 5}
                            className="text-center py-8 text-muted-foreground"
                          >
                            <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            Nenhum item adicionado
                          </TableCell>
                        </TableRow>
                      ) : (
                        items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{item.description}</p>
                                {item.product && (
                                  <p className="text-xs text-muted-foreground">
                                    {item.product.brand} - {item.product.category}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{item.room || "-"}</TableCell>
                            <TableCell className="text-right">
                              {item.quantity}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.unitPrice)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(item.totalPrice)}
                            </TableCell>
                            {isEditing && (
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive"
                                  onClick={() => {
                                    setItemToDelete(item.id);
                                    setShowDeleteConfirm(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <Separator />

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-full max-w-sm space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  {quote.laborCost && quote.laborCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Mão de obra:</span>
                      <span>{formatCurrency(quote.laborCost)}</span>
                    </div>
                  )}
                  {quote.installationCost && quote.installationCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Instalação:</span>
                      <span>{formatCurrency(quote.installationCost)}</span>
                    </div>
                  )}
                  {quote.discount && quote.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>
                        Desconto
                        {quote.discountType === "percentage"
                          ? ` (${quote.discount}%)`
                          : ""}
                        :
                      </span>
                      <span>
                        -
                        {formatCurrency(
                          quote.discountType === "percentage"
                            ? (calculateSubtotal() * quote.discount) / 100
                            : quote.discount
                        )}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes & Conditions */}
              {(quote.paymentConditions || quote.terms || quote.notes) && (
                <>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quote.paymentConditions && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">
                          Condições de Pagamento
                        </h4>
                        <p className="text-sm">{quote.paymentConditions}</p>
                      </div>
                    )}
                    {quote.terms && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">
                          Termos e Condições
                        </h4>
                        <p className="text-sm whitespace-pre-wrap">{quote.terms}</p>
                      </div>
                    )}
                    {quote.notes && (
                      <div className="md:col-span-2">
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">
                          Observações
                        </h4>
                        <p className="text-sm whitespace-pre-wrap">{quote.notes}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover item</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este item do orçamento?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => itemToDelete && deleteItem(itemToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
