import React, { useEffect } from "react";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuotesData } from "@/hooks/useQuotesData";
import { useClientsData } from "@/hooks/useClientsData";
import { useProjectsData } from "@/hooks/useProjectsData";
import { useAgents } from "@/hooks/useAgents";
import { toast } from "sonner";

const quoteSchema = z.object({
  clientId: z.string().min(1, "Selecione um cliente"),
  projectId: z.string().optional(),
  validUntil: z.string().optional(),
  laborCost: z.string().optional(),
  installationCost: z.string().optional(),
  discount: z.string().optional(),
  discountType: z.enum(["fixed", "percentage"]).optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  paymentConditions: z.string().optional(),
  agentId: z.string().optional(),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

interface AddQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
}

export function AddQuoteDialog({ open, onOpenChange, projectId }: AddQuoteDialogProps) {
  const { createQuote, loading } = useQuotesData();
  const { clients } = useClientsData();
  const { projects } = useProjectsData();
  const { agents } = useAgents();

  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      clientId: "",
      projectId: projectId || "",
      validUntil: "",
      laborCost: "",
      installationCost: "",
      discount: "",
      discountType: "fixed",
      notes: "",
      terms: "Validade do orçamento: 15 dias.\nForma de pagamento a combinar.",
      paymentConditions: "50% na aprovação, 50% na entrega",
      agentId: "",
    },
  });

  // Update projectId when prop changes
  useEffect(() => {
    if (projectId) {
      form.setValue("projectId", projectId);
      // Also set client from project
      const project = projects.find((p) => p.id === projectId);
      if (project?.clientId) {
        form.setValue("clientId", project.clientId);
      }
    }
  }, [projectId, projects, form]);

  const onSubmit = async (data: QuoteFormData) => {
    try {
      await createQuote({
        clientId: data.clientId,
        projectId: data.projectId || undefined,
        status: "Rascunho",
        validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
        subtotal: 0,
        discount: data.discount ? parseFloat(data.discount) : undefined,
        discountType: data.discountType,
        laborCost: data.laborCost ? parseFloat(data.laborCost) : undefined,
        installationCost: data.installationCost ? parseFloat(data.installationCost) : undefined,
        totalValue: 0,
        notes: data.notes,
        terms: data.terms,
        paymentConditions: data.paymentConditions,
        agentId: data.agentId || undefined,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      toast.success("Orçamento criado com sucesso!");
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao criar orçamento");
      console.error(error);
    }
  };

  // Set default validity date (15 days from now)
  useEffect(() => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 15);
    form.setValue("validUntil", defaultDate.toISOString().split("T")[0]);
  }, [form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Orçamento</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Projeto</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um projeto (opcional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Nenhum projeto</SelectItem>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="validUntil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Válido até</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um responsável" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="laborCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custo de Mão de Obra</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="installationCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custo de Instalação</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desconto</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Desconto</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                        <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentConditions"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Condições de Pagamento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 50% na aprovação, 50% na entrega" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Termos e Condições</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Termos do orçamento..."
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
                name="notes"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observações internas..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Criando..." : "Criar Orçamento"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
