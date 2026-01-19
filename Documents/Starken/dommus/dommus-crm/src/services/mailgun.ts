// Este serviço será chamado por uma função serverless do Firebase
// que tem acesso à API key do Mailgun

import { EmailTemplate, Lead } from "@/types/crm";

// Tipo para a configuração do Mailgun
interface MailgunConfig {
  apiKey: string;
  domain: string;
  from: string;
}

// Tipo para a fila de emails
interface EmailQueueItem {
  to: string;
  subject: string;
  html: string;
  leadId: string;
  templateId?: string;
}

// Função para processar o template de email com os dados do lead
export const processTemplate = (template: EmailTemplate, lead: Lead): { subject: string, html: string } => {
  let subject = template.subject;
  let html = template.content;
  
  // Substituir variáveis do template
  const replacements: Record<string, string> = {
    "{{nome}}": lead.name,
    "{{empresa}}": lead.company || "",
    "{{email}}": lead.email,
    "{{telefone}}": lead.phone || "",
    "{{status}}": lead.status
  };
  
  Object.entries(replacements).forEach(([key, value]) => {
    subject = subject.replace(new RegExp(key, "g"), value);
    html = html.replace(new RegExp(key, "g"), value);
  });
  
  return { subject, html };
};

// Função para converter markdown em HTML (simplificada)
export const markdownToHtml = (markdown: string): string => {
  // Converter cabeçalhos
  let html = markdown
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>');
  
  // Converter negrito
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Converter itálico
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Converter links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  // Converter quebras de linha
  html = html.replace(/\n/g, '<br>');
  
  return html;
};

// Esta função seria implementada em uma função serverless no Firebase
export const sendEmail = async (
  email: EmailQueueItem,
  leadId: string
): Promise<{ success: boolean, message: string, id?: string }> => {
  // Na função serverless real, usaríamos a SDK do Mailgun
  console.log("Enviando email para", email.to);
  console.log("Assunto:", email.subject);
  console.log("Conteúdo HTML:", email.html);
  
  // Mock de retorno bem-sucedido
  return {
    success: true,
    message: "Email enviado com sucesso",
    id: "mock-email-id-" + Date.now()
  };
};

// Função para preparar emails em lote (para campanhas)
export const prepareBatchEmails = (
  leads: Lead[],
  template: EmailTemplate
): EmailQueueItem[] => {
  return leads.map(lead => {
    const { subject, html } = processTemplate(template, lead);
    
    return {
      to: lead.email,
      subject,
      html,
      leadId: lead.id,
      templateId: template.id
    };
  });
};
