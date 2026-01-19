import React from "react";
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
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Send,
  CheckCircle,
  XCircle,
  Copy,
  Download,
} from "lucide-react";
import { useQuotesData } from "@/hooks/useQuotesData";
import { Skeleton } from "@/components/ui/skeleton";

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
  const { quotes, loading, deleteQuote, updateQuoteStatus } = useQuotesData();

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
                Nenhum orçamento encontrado
              </TableCell>
            </TableRow>
          ) : (
            filteredQuotes.map((quote) => (
              <TableRow key={quote.id}>
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
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
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
                      <DropdownMenuItem>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Exportar PDF
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
                        onClick={() => deleteQuote(quote.id)}
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
  );
}
