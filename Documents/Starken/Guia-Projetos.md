# Guia de Variáveis de Ambiente - Starken Projects

> **⚠️ FOCO ATUAL: Rosa Mexicano - Reservas (FASE 1)**
> - ✅ Rosa Mexicano - Reservas: Implementado (Autenticação JWT + Caixa de Informação + Telegram)
> - 🔒 Mortadella - Reservas: STAND-BY (Mesma estrutura que Rosa, aguardando confirmação de design/funcionalidades com cliente)
> - ⏳ Rosa Mexicano - Vouchers: FASE 2
> - ⏳ Estilo Tulipa: FASE 3

## 📍 Plataformas de Deployment

| Projeto | Frontend/App | Banco de Dados |
|---------|-------------|----------------|
| **Rosa Mexicano - Reservas** | Netlify | Railway |
| **Rosa Mexicano - Vouchers** | Netlify (Express) | Railway |
| **Mortadella - Reservas** | Netlify | Railway |
| **Estilo Tulipa - Frontend** | Firebase | - |
| **Estilo Tulipa - Backend** | Railway | Railway |

---

## 1. ROSA MEXICANO - RESERVAS (rosamexicano-reservas-frontend)

### Netlify (Frontend + API Routes)
```
JWT_SECRET=seu-valor-super-secreto-minimo-64-caracteres-random-aqui-1234567890
JWT_REFRESH_SECRET=outro-valor-super-secreto-minimo-64-caracteres-random-aqui-0987654321
NEXT_PUBLIC_ASAAS_API_URL=https://api.asaas.com
ASAAS_API_KEY=sua-chave-api-asaas-aqui
ASAAS_WEBHOOK_TOKEN=seu-token-webhook-asaas-aqui
SENDGRID_API_KEY=sua-chave-sendgrid-aqui
NEXT_PUBLIC_API_URL=https://seu-dominio.netlify.app
TELEGRAM_BOT_TOKEN=seu-token-do-bot-telegram-aqui
TELEGRAM_CHAT_ID=seu-chat-id-telegram-aqui
```

### Railway (Banco de Dados)
```
DATABASE_URL=postgresql://user:password@host:5432/rosamexicano-reservas
```

---

## 2. ROSA MEXICANO - VOUCHERS (rosa-mexicano-vouchers) - FASE 2

### Netlify (Express Backend)
```
JWT_SECRET=seu-valor-super-secreto-minimo-64-caracteres-random-aqui-1234567890
JWT_REFRESH_SECRET=outro-valor-super-secreto-minimo-64-caracteres-random-aqui-0987654321
ASAAS_API_KEY=sua-chave-api-asaas-aqui
ASAAS_WEBHOOK_TOKEN=seu-token-webhook-asaas-aqui
SENDGRID_API_KEY=sua-chave-sendgrid-aqui
NODE_ENV=production
PORT=3000
```

### Railway (Banco de Dados)
```
DATABASE_URL=postgresql://user:password@host:5432/rosa-mexicano-vouchers
```

---

## 3. MORTADELLA - RESERVAS (mortadellareservas) - STAND-BY

### Netlify (Frontend + API Routes)
```
JWT_SECRET=seu-valor-super-secreto-minimo-64-caracteres-random-aqui-1234567890
JWT_REFRESH_SECRET=outro-valor-super-secreto-minimo-64-caracteres-random-aqui-0987654321
NEXT_PUBLIC_ASAAS_API_URL=https://api.asaas.com
ASAAS_API_KEY=sua-chave-api-asaas-aqui
ASAAS_WEBHOOK_TOKEN=seu-token-webhook-asaas-aqui
SENDGRID_API_KEY=sua-chave-sendgrid-aqui
NEXT_PUBLIC_API_URL=https://seu-dominio.netlify.app
```

### Railway (Banco de Dados)
```
DATABASE_URL=postgresql://user:password@host:5432/mortadella-reservas
```

---

## 4. ESTILO TULIPA (estilo-tulipa-frontend + backend) - FASE 3

### Firebase (Frontend - React + Vite)
```
VITE_API_URL=https://seu-api-backend-url-railway.com
VITE_ASAAS_API_URL=https://api.asaas.com
VITE_FIREBASE_API_KEY=sua-chave-firebase-aqui
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-firebase
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu-id-firebase
VITE_FIREBASE_APP_ID=seu-app-id-firebase
```

### Railway (Backend + Database)
```
JWT_SECRET=seu-valor-super-secreto-minimo-64-caracteres-random-aqui-1234567890
JWT_REFRESH_SECRET=outro-valor-super-secreto-minimo-64-caracteres-random-aqui-0987654321
DATABASE_URL=postgresql://user:password@host:5432/estilo-tulipa
ASAAS_API_KEY=sua-chave-api-asaas-aqui
ASAAS_WEBHOOK_TOKEN=seu-token-webhook-asaas-aqui
SENDGRID_API_KEY=sua-chave-sendgrid-aqui
NODE_ENV=production
PORT=3000
```

---

## Checklist de Setup para Cada Projeto

### ✅ Rosa Mexicano - Reservas
**Autenticação e Segurança:**
- [ ] JWT_SECRET e JWT_REFRESH_SECRET no Netlify
- [ ] DATABASE_URL no Railway
- [ ] ASAAS_API_KEY e ASAAS_WEBHOOK_TOKEN no Netlify
- [ ] SENDGRID_API_KEY no Netlify
- [ ] WHATSAPP_API_KEY no Netlify
- [ ] Testar login em `/api/admin/auth`
- [ ] Testar refresh token em `/api/admin/auth/refresh`
- [ ] Validar headers de segurança

**Novos Recursos (Fase 1):**
- [ ] TELEGRAM_BOT_TOKEN no Netlify (obter via BotFather em t.me/botfather)
- [ ] TELEGRAM_CHAT_ID no Netlify (ID do grupo/chat para receber alertas)
- [ ] ✅ Caixa de Informação no pagamento: exibe nome do cliente + lembrete R$50
- [ ] ✅ Alerta Telegram: notifica apenas para reservas do mesmo dia (última hora)
- [ ] Testar página `/pagamento` e verificar exibição da caixa de informação
- [ ] Testar alerta Telegram criando uma reserva para hoje
- [ ] Configurar Telegram: criar bot com BotFather e obter chat ID do grupo/chat destino

### ⏳ Rosa Mexicano - Vouchers (FASE 2)
- [ ] JWT_SECRET e JWT_REFRESH_SECRET no Netlify
- [ ] DATABASE_URL no Railway
- [ ] ASAAS_API_KEY e ASAAS_WEBHOOK_TOKEN no Netlify
- [ ] SENDGRID_API_KEY no Netlify
- [ ] Migrar autenticação de plaintext para JWT
- [ ] Testar endpoints de auth
- [ ] Refatorar estrutura (controllers/services/routes)

### 🔒 Mortadella - Reservas (STAND-BY)
**Status:** Mesma estrutura de segurança que Rosa Mexicano implementada. Aguardando confirmação do cliente sobre design e funcionalidades específicas antes de prosseguir.

**Implementado:**
- ✅ JWT_SECRET e JWT_REFRESH_SECRET configuráveis
- ✅ DATABASE_URL configurável
- ✅ ASAAS_API_KEY e ASAAS_WEBHOOK_TOKEN configuráveis
- ✅ SENDGRID_API_KEY configurável
- ✅ Autenticação JWT completa (`/api/admin/auth`)
- ✅ Refresh token endpoint (`/api/admin/auth/refresh`)
- ✅ Security headers e CORS

**Pendente (aguardando requisitos do cliente):**
- [ ] Confirmação de design/template frontend
- [ ] Confirmação de funcionalidades específicas
- [ ] Melhorias de UI/UX
- [ ] Possível implementação de features similares ao Rosa (Caixa Info + Telegram)

### ⏳ Estilo Tulipa (FASE 3)
- [ ] VITE_API_URL no Netlify (frontend)
- [ ] Criar backend completo no Railway
- [ ] Implementar JWT authentication no backend
- [ ] Integrar com Asaas para pagamentos
- [ ] Criar API de produtos, carrinho, pedidos

---

## 🤖 Como Configurar Telegram para Alertas de Reserva

### Passo 1: Criar o Bot
1. Abra Telegram e procure por `@BotFather`
2. Envie: `/start`
3. Envie: `/newbot`
4. Siga as instruções para nomear o bot
5. BotFather vai retornar seu **TOKEN_DO_BOT** (salve este valor)

### Passo 2: Obter o Chat ID
1. Crie um grupo Telegram (privado ou público)
2. Adicione o bot ao grupo
3. Envie uma mensagem no grupo: `/start` ou qualquer mensagem
4. Acesse: `https://api.telegram.org/bot{TOKEN_DO_BOT}/getUpdates`
5. Procure por `"chat":{"id":XXXXX}` - este é seu **CHAT_ID**

### Passo 3: Configurar no Netlify
1. Vá para: Netlify Dashboard → Site → Site settings → Build & deploy → Environment
2. Adicione as variáveis:
   - **TELEGRAM_BOT_TOKEN**: `seu-token-do-bot`
   - **TELEGRAM_CHAT_ID**: `seu-chat-id`
3. Redeploy o site

### Funcionamento
- ✅ Quando um cliente faz uma reserva **para hoje**, o bot envia um alerta no Telegram com:
  - Nome do cliente
  - Data e horário da reserva
  - Número de pessoas
  - Valor pago (R$50)
  - ID da reserva
- ❌ Reservas para **datas futuras** NÃO geram alerta (apenas de mesma data)
- ⚠️ Se Telegram não estiver configurado, o sistema continua funcionando normalmente (não quebra)