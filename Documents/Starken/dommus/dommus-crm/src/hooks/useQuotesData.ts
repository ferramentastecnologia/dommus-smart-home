import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/services/supabase/client";
import { useUser } from "@/hooks/auth/useUser";
import { useUserRole } from "@/hooks/auth/useUserRole";
import { toast } from "sonner";
import { Quote, QuoteItem, QuoteStatus } from "@/types/crm";

export function useQuotesData() {
  const { user } = useUser();
  const { role, loading: roleLoading } = useUserRole();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showQuoteDetails, setShowQuoteDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);

  // Fetch quotes from database
  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    try {
      if (roleLoading) {
        console.log("⏳ Waiting for role to load...");
        return;
      }

      let query = supabase
        .from("quotes")
        .select(`
          *,
          client:clients(id, name, email, phone),
          project:projects(id, name),
          agent:agents(id, name)
        `)
        .order("created_at", { ascending: false });

      console.log("🔍 Quotes Filter Debug:", { role, userId: user?.id });

      if (role === "agent" && user) {
        console.log("📝 Applying quotes filter for agent:", user.id);
        query = query.eq("agent_id", user.id);
      } else {
        console.log("👑 Admin/Manager - showing all quotes");
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (data) {
        const transformedQuotes: Quote[] = data.map((quote: any) => ({
          id: quote.id,
          number: quote.number,
          projectId: quote.project_id,
          project: quote.project,
          clientId: quote.client_id,
          client: quote.client,
          status: quote.status || "Rascunho",
          validUntil: quote.valid_until ? new Date(quote.valid_until) : undefined,
          items: [],
          subtotal: quote.subtotal || 0,
          discount: quote.discount,
          discountType: quote.discount_type,
          laborCost: quote.labor_cost,
          installationCost: quote.installation_cost,
          totalValue: quote.total_value || 0,
          notes: quote.notes,
          terms: quote.terms,
          paymentConditions: quote.payment_conditions,
          agentId: quote.agent_id,
          agent: quote.agent,
          sentAt: quote.sent_at ? new Date(quote.sent_at) : undefined,
          approvedAt: quote.approved_at ? new Date(quote.approved_at) : undefined,
          rejectedAt: quote.rejected_at ? new Date(quote.rejected_at) : undefined,
          rejectionReason: quote.rejection_reason,
          createdAt: new Date(quote.created_at),
          updatedAt: new Date(quote.updated_at),
        }));

        setQuotes(transformedQuotes);
        setFilteredQuotes(transformedQuotes);
      }
    } catch (error) {
      console.error("Error fetching quotes:", error);
      toast.error("Erro ao carregar orçamentos");
    } finally {
      setLoading(false);
    }
  }, [user, role, roleLoading]);

  // Filter quotes when search query changes
  useEffect(() => {
    if (searchQuery) {
      const filtered = quotes.filter(
        (quote) =>
          quote.number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          quote.client?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          quote.project?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredQuotes(filtered);
    } else {
      setFilteredQuotes(quotes);
    }
  }, [searchQuery, quotes]);

  // Fetch quotes on component mount and when user changes
  useEffect(() => {
    if (user) {
      fetchQuotes();
    }
  }, [user, fetchQuotes]);

  // Create quote
  const createQuote = async (quoteData: Partial<Quote>) => {
    try {
      const snakeCaseData = {
        project_id: quoteData.projectId || null,
        client_id: quoteData.clientId,
        status: quoteData.status || "Rascunho",
        valid_until: quoteData.validUntil?.toISOString().split("T")[0],
        subtotal: quoteData.subtotal || 0,
        discount: quoteData.discount || 0,
        discount_type: quoteData.discountType || "fixed",
        labor_cost: quoteData.laborCost || 0,
        installation_cost: quoteData.installationCost || 0,
        total_value: quoteData.totalValue || 0,
        notes: quoteData.notes,
        terms: quoteData.terms,
        payment_conditions: quoteData.paymentConditions,
        agent_id: quoteData.agentId || null,
      };

      const { data, error } = await supabase
        .from("quotes")
        .insert(snakeCaseData)
        .select(`
          *,
          client:clients(id, name, email, phone),
          project:projects(id, name),
          agent:agents(id, name)
        `)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const newQuote: Quote = {
          id: data.id,
          number: data.number,
          projectId: data.project_id,
          project: data.project,
          clientId: data.client_id,
          client: data.client,
          status: data.status,
          validUntil: data.valid_until ? new Date(data.valid_until) : undefined,
          items: [],
          subtotal: data.subtotal,
          discount: data.discount,
          discountType: data.discount_type,
          laborCost: data.labor_cost,
          installationCost: data.installation_cost,
          totalValue: data.total_value,
          notes: data.notes,
          terms: data.terms,
          paymentConditions: data.payment_conditions,
          agentId: data.agent_id,
          agent: data.agent,
          sentAt: data.sent_at ? new Date(data.sent_at) : undefined,
          approvedAt: data.approved_at ? new Date(data.approved_at) : undefined,
          rejectedAt: data.rejected_at ? new Date(data.rejected_at) : undefined,
          rejectionReason: data.rejection_reason,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        };

        setQuotes((prev) => [newQuote, ...prev]);
        return newQuote;
      }

      return null;
    } catch (error) {
      console.error("Error creating quote:", error);
      toast.error("Erro ao criar orçamento");
      throw error;
    }
  };

  // Update quote
  const updateQuote = async (quoteId: string, updates: Partial<Quote>) => {
    try {
      const snakeCaseUpdates: any = {};

      if (updates.projectId !== undefined) snakeCaseUpdates.project_id = updates.projectId;
      if (updates.clientId !== undefined) snakeCaseUpdates.client_id = updates.clientId;
      if (updates.status !== undefined) snakeCaseUpdates.status = updates.status;
      if (updates.validUntil !== undefined) snakeCaseUpdates.valid_until = updates.validUntil?.toISOString().split("T")[0];
      if (updates.subtotal !== undefined) snakeCaseUpdates.subtotal = updates.subtotal;
      if (updates.discount !== undefined) snakeCaseUpdates.discount = updates.discount;
      if (updates.discountType !== undefined) snakeCaseUpdates.discount_type = updates.discountType;
      if (updates.laborCost !== undefined) snakeCaseUpdates.labor_cost = updates.laborCost;
      if (updates.installationCost !== undefined) snakeCaseUpdates.installation_cost = updates.installationCost;
      if (updates.totalValue !== undefined) snakeCaseUpdates.total_value = updates.totalValue;
      if (updates.notes !== undefined) snakeCaseUpdates.notes = updates.notes;
      if (updates.terms !== undefined) snakeCaseUpdates.terms = updates.terms;
      if (updates.paymentConditions !== undefined) snakeCaseUpdates.payment_conditions = updates.paymentConditions;
      if (updates.agentId !== undefined) snakeCaseUpdates.agent_id = updates.agentId;

      const { data, error } = await supabase
        .from("quotes")
        .update(snakeCaseUpdates)
        .eq("id", quoteId)
        .select(`
          *,
          client:clients(id, name, email, phone),
          project:projects(id, name),
          agent:agents(id, name)
        `)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const updatedQuote: Quote = {
          id: data.id,
          number: data.number,
          projectId: data.project_id,
          project: data.project,
          clientId: data.client_id,
          client: data.client,
          status: data.status,
          validUntil: data.valid_until ? new Date(data.valid_until) : undefined,
          items: [],
          subtotal: data.subtotal,
          discount: data.discount,
          discountType: data.discount_type,
          laborCost: data.labor_cost,
          installationCost: data.installation_cost,
          totalValue: data.total_value,
          notes: data.notes,
          terms: data.terms,
          paymentConditions: data.payment_conditions,
          agentId: data.agent_id,
          agent: data.agent,
          sentAt: data.sent_at ? new Date(data.sent_at) : undefined,
          approvedAt: data.approved_at ? new Date(data.approved_at) : undefined,
          rejectedAt: data.rejected_at ? new Date(data.rejected_at) : undefined,
          rejectionReason: data.rejection_reason,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        };

        setQuotes((prev) =>
          prev.map((q) => (q.id === quoteId ? updatedQuote : q))
        );

        return updatedQuote;
      }

      return null;
    } catch (error) {
      console.error("Error updating quote:", error);
      toast.error("Erro ao atualizar orçamento");
      throw error;
    }
  };

  // Update quote status
  const updateQuoteStatus = async (quoteId: string, newStatus: QuoteStatus) => {
    try {
      const updates: any = { status: newStatus };

      // Set timestamp based on status
      if (newStatus === "Enviado") {
        updates.sent_at = new Date().toISOString();
      } else if (newStatus === "Aprovado") {
        updates.approved_at = new Date().toISOString();
      } else if (newStatus === "Rejeitado") {
        updates.rejected_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("quotes")
        .update(updates)
        .eq("id", quoteId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setQuotes((prev) =>
        prev.map((q) =>
          q.id === quoteId ? { ...q, status: newStatus } : q
        )
      );

      return data;
    } catch (error) {
      console.error("Error updating quote status:", error);
      toast.error("Erro ao atualizar status do orçamento");
      throw error;
    }
  };

  // Delete quote
  const deleteQuote = async (quoteId: string) => {
    try {
      const { error } = await supabase
        .from("quotes")
        .delete()
        .eq("id", quoteId);

      if (error) {
        throw error;
      }

      setQuotes((prev) => prev.filter((q) => q.id !== quoteId));
      return true;
    } catch (error) {
      console.error("Error deleting quote:", error);
      toast.error("Erro ao excluir orçamento");
      throw error;
    }
  };

  return {
    quotes,
    setQuotes,
    selectedQuote,
    setSelectedQuote,
    showQuoteDetails,
    setShowQuoteDetails,
    loading,
    searchQuery,
    setSearchQuery,
    filteredQuotes,
    createQuote,
    updateQuote,
    updateQuoteStatus,
    deleteQuote,
    fetchQuotes,
  };
}
