# Sistema de Email do Agile CRM

Este documento descreve o sistema de email do Agile CRM, incluindo a configuração de triggers e templates.

## Tipos de Trigger

O sistema suporta os seguintes tipos de trigger de email:

1. **new_lead**: Envio automático de email para o lead quando ele é criado
2. **birthday**: Envio automático de email de aniversário para leads
3. **meeting**: Envio automático de email para confirmação de reuniões
4. **agent_new_lead_notification**: Envio automático de email para todos os agentes quando um novo lead é criado
5. **custom**: Para emails manuais ou personalizados

## Notificação de Agentes para Novos Leads

Quando um novo lead é criado no sistema:

1. Um email é enviado automaticamente para o lead conforme template configurado em `new_lead`
2. Um email é enviado para cada agente ativo no sistema usando o template `agent_new_lead_notification`
3. Todos os emails são colocados na fila e processados na ordem de criação

### Template para Notificação de Agentes

O template para notificação de agentes suporta as seguintes variáveis:

- `{{lead_name}}`: Nome do lead
- `{{lead_email}}`: Email do lead
- `{{lead_phone}}`: Telefone do lead
- `{{lead_company}}`: Nome da empresa do lead
- `{{agent_name}}`: Nome do agente

## Fila de Emails

Todos os emails são enfileirados na tabela `email_queue` e processados de forma assíncrona pelo worker do sistema. Isso garante que:

1. Os emails são entregues em ordem de criação
2. Erros de envio não impactam a operação do sistema
3. O sistema pode ser escalado para lidar com grande volume de emails

## Configuração

Para ativar/desativar ou modificar as notificações:

1. Acesse o Painel Admin > Configurações > Templates de Email
2. Localize o template "Nova Notificação de Lead para Agentes"
3. Ative/desative o template ou edite seu conteúdo conforme necessário

## Implementação Técnica

A implementação utiliza:

1. Trigger SQL no PostgreSQL para detectar novos leads
2. Templates de email configuráveis armazenados no banco de dados
3. Fila de processamento para garantir entrega confiável
4. Substituição automática de variáveis para personalizar os emails

## Mensagens para Leads vs. Agentes

- Os leads recebem mensagens de boas-vindas usando templates `new_lead`
- Os agentes recebem notificações com detalhes do lead usando templates `agent_new_lead_notification` 