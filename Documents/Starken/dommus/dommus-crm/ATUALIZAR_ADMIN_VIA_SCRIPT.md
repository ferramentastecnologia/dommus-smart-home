# 🚀 Atualizar Admin via Script (Método Mais Fácil!)

## Pré-requisitos

Você precisa da **Service Role Key** do Supabase.

### Como Pegar a Service Role Key:

1. Acesse: https://supabase.com/dashboard/project/responsive-c-r-m-templa-j9fqdc/settings/api
2. Na seção **"Project API keys"**
3. Copie a chave **"service_role"** (geralmente começa com `eyJ...`)
   - ⚠️ **NUNCA** compartilhe essa chave publicamente!

---

## Passo a Passo

### 1️⃣ Configure a Service Role Key

Abra o arquivo `.env` na raiz do projeto e adicione/atualize:

```bash
VITE_SUPABASE_URL=https://jxtqiq2jcofqetrwnea.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
```

**Substitua `sua-service-role-key-aqui` pela chave que você copiou!**

---

### 2️⃣ Execute o Script

No terminal, rode:

```bash
npm run update-user-metadata
```

---

### 3️⃣ Verifique o Resultado

Você deve ver algo assim:

```
🔍 Buscando usuário: contact@profortunagroup.com
✅ Usuário encontrado!
📧 Email: contact@profortunagroup.com
🆔 ID: c7ec67be-aa80-402f-b105-70f61db6b04c
📋 Metadata atual: { role: "agent" }

🔄 Atualizando metadata...
✅ Metadata atualizado com sucesso!
📋 Novo metadata: { role: "admin", name: "Contact ProFortuna" }

🎉 Pronto! O usuário agora tem permissões de ADMIN
⚠️  O usuário precisa fazer logout e login novamente.
```

---

## ✅ Pronto!

Depois que o script executar com sucesso:

1. O usuário `contact@profortunagroup.com` precisa fazer **logout**
2. Fazer **login** novamente
3. Agora terá permissões de **ADMIN** completas!

---

## 🔧 Troubleshooting

### Erro: "Variáveis de ambiente não configuradas"

**Solução:** Certifique-se de que o arquivo `.env` existe e tem as 3 variáveis:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Erro: "Usuário não encontrado"

**Solução:** Verifique se o email está correto no script:
- Abra: `src/scripts/updateUserMetadata.ts`
- Linha 25: `const targetEmail = 'contact@profortunagroup.com';`
- Certifique-se que está escrito exatamente como no Supabase

### Erro de permissão

**Solução:** Certifique-se de que está usando a **Service Role Key** (não a Anon Key)

---

## 📝 Notas

- Este script usa a API Admin do Supabase
- Apenas a Service Role Key tem permissão para atualizar user_metadata
- É seguro executar múltiplas vezes (apenas atualiza o metadata)
- Para atualizar outro usuário, edite o email no script

---

## 🔄 Para Atualizar Outros Usuários

Edite o arquivo `src/scripts/updateUserMetadata.ts`:

```typescript
const targetEmail = 'outro-email@example.com'; // Mude aqui
```

Depois execute novamente:
```bash
npm run update-user-metadata
```

