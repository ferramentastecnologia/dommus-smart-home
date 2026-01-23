import React, { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Send,
  CheckCircle,
  XCircle,
  Copy,
  Download,
  FileText,
} from "lucide-react";
import { useQuotesData } from "@/hooks/useQuotesData";
import { Skeleton } from "@/components/ui/skeleton";
import { Quote } from "@/types/crm";
import { QuoteDetailsDialog } from "./QuoteDetailsDialog";
import { toast } from "sonner";

interface QuotesListProps {
  searchTerm: string;
  statusFilter: string;
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

export function QuotesList({ searchTerm, statusFilter }: QuotesListProps) {
  const { quotes, loading, deleteQuote, updateQuoteStatus, createQuote, fetchQuotes } = useQuotesData();
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<string | null>(null);

  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch =
      quote.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.project?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (value?: number) => {
    if (!value) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleView = (quote: Quote) => {
    setSelectedQuote(quote);
    setShowDetails(true);
  };

  const handleDuplicate = async (quote: Quote) => {
    try {
      const duplicatedQuote = await createQuote({
        clientId: quote.clientId,
        projectId: quote.projectId,
        status: "Rascunho",
        validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        subtotal: quote.subtotal,
        discount: quote.discount,
        discountType: quote.discountType,
        laborCost: quote.laborCost,
        installationCost: quote.installationCost,
        totalValue: quote.totalValue,
        notes: quote.notes,
        terms: quote.terms,
        paymentConditions: quote.paymentConditions,
        agentId: quote.agentId,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      if (duplicatedQuote) {
        toast.success("Orçamento duplicado com sucesso!");
        fetchQuotes();
      }
    } catch (error) {
      toast.error("Erro ao duplicar orçamento");
    }
  };

  const handleExportPDF = (quote: Quote) => {
    const content = `
ORÇAMENTO ${quote.number}
=====================================

Cliente: ${quote.client?.name || "-"}
Email: ${quote.client?.email || "-"}
Telefone: ${quote.client?.phone || "-"}

Projeto: ${quote.project?.name || "-"}
Status: ${quote.status}
Validade: ${quote.validUntil ? format(new Date(quote.validUntil), "dd/MM/yyyy", { locale: ptBR }) : "-"}

-------------------------------------
VALORES
-------------------------------------
Subtotal: ${formatCurrency(quote.subtotal)}
Mão de Obra: ${formatCurrency(quote.laborCost)}
Instalação: ${formatCurrency(quote.installationCost)}
Desconto: ${formatCurrency(quote.discount)}
TOTAL: ${formatCurrency(quote.totalValue)}

-------------------------------------
CONDIÇÕES DE PAGAMENTO
-------------------------------------
${quote.paymentConditions || "-"}

-------------------------------------
TERMOS E CONDIÇÕES
-------------------------------------
${quote.terms || "-"}

-------------------------------------
OBSERVAÇÕES
-------------------------------------
${quote.notes || "-"}

=====================================
Dommus Smart Home
www.dommus.com.br
contato@dommus.com.br
    `.trim();

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orcamento-${quote.number}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Orçamento exportado!");
  };

  const handleDelete = (quoteId: string) => {
    setQuoteToDelete(quoteId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (quoteToDelete) {
      try {
        await deleteQuote(quoteToDelete);
        toast.success("Orçamento excluído");
      } catch (error) {
        toast.error("Erro ao excluir orçamento");
      }
    }
    setShowDeleteConfirm(false);
    setQuoteToDelete(null);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Projeto</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Valor Total</TableHead>
              <TableHead>Validade</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  Nenhum orçamento encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredQuotes.map((quote) => (
                <TableRow
                  key={quote.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleView(quote)}
                >
                  <TableCell className="font-medium font-mono">
                    {quote.number || "-"}
                  </TableCell>
                  <TableCell>{quote.client?.name || "-"}</TableCell>
                  <TableCell>{quote.project?.name || "-"}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[quote.status] || "bg-gray-500"}>
                      {quote.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(quote.totalValue)}</TableCell>
                  <TableCell>
                    {quote.validUntil
                      ? format(new Date(quote.validUntil), "dd/MM/yyyy", { locale: ptBR })
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {format(new Date(quote.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(quote)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleView(quote)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(quote)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportPDF(quote)}>
                          <Download className="mr-2 h-4 w-4" />
                          Exportar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {quote.status === "Rascunho" && (
                          <DropdownMenuItem onClick={() => updateQuoteStatus(quote.id, "Enviado")}>
                            <Send className="mr-2 h-4 w-4" />
                            Enviar
                          </DropdownMenuItem>
                        )}
                        {quote.status === "Enviado" && (
                          <>
                            <DropdownMenuItem
                              onClick={() => updateQuoteStatus(quote.id, "Aprovado")}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Marcar como Aprovado
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateQuoteStatus(quote.id, "Rejeitado")}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Marcar como Rejeitado
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(quote.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <QuoteDetailsDialog
        open={showDetails}
        onOpenChange={setShowDetails}
        quote={selectedQuote}
        onQuoteUpdated={fetchQuotes}
      />

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir orçamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
