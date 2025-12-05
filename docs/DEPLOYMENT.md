# 🚀 Guia de Deployment - Dommus Smart Home

## Deploy Automático com Docker

O projeto está configurado para fazer deploy automático na VPS quando há commits na branch `main`.

### Pré-requisitos na VPS

1. **Docker instalado**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   ```

2. **Docker Compose instalado**
   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Git configurado com SSH**
   ```bash
   ssh-keygen -t ed25519 -C "ubuntu@dommus" -f ~/.ssh/github_dommus -N ""
   # Adicionar chave pública em GitHub
   cat ~/.ssh/github_dommus.pub
   ```

### Configuração no GitHub

1. Acesse: **Settings → Secrets and variables → Actions**

2. Adicione os seguintes secrets:
   - **VPS_HOST**: `72.60.149.123`
   - **VPS_USER**: `ubuntu`
   - **VPS_SSH_KEY**: Cole aqui o conteúdo da chave SSH privada

### Como Funciona

```
1. Você faz commit na branch main
   ↓
2. GitHub Actions detecta o push
   ↓
3. Workflow conecta à VPS via SSH
   ↓
4. Atualiza o repositório
   ↓
5. Reconstrói imagem Docker
   ↓
6. Reinicia containers
   ↓
7. Deploy concluído! ✨
```

### Estrutura Docker

```yaml
Services:
- dommus: Aplicação principal
  - Porta 3000: Landing Pages
  - Porta 8080: APIs
  - Porta 5678: N8N (opcional)

Volumes:
- ./lp → /app/lp
- ./automacoes → /app/automacoes
- ./data → /app/data

Network:
- dommus-network (bridge)
```

### Deploy Manual

Se precisar fazer deploy manualmente:

```bash
# Tornando script executável
chmod +x scripts/deploy.sh

# Executando deploy
./scripts/deploy.sh
```

### Acessar a Aplicação

- **URL**: http://72.60.149.123:3000
- **SSH**: ssh -i ~/.ssh/starken.pem ubuntu@72.60.149.123
- **Projeto**: /opt/dommus

### Logs e Monitoramento

**Ver logs dos containers:**
```bash
ssh ubuntu@72.60.149.123
cd /opt/dommus
docker-compose logs -f
```

**Ver status dos containers:**
```bash
docker-compose ps
```

**Acessar container:**
```bash
docker-compose exec dommus bash
```

### Troubleshooting

**Container não inicia:**
```bash
docker-compose logs dommus
```

**Porta já em uso:**
```bash
docker-compose down
docker-compose up -d
```

**Resetar tudo:**
```bash
docker-compose down -v
docker-compose up -d --build
```

## Estrutura do Projeto

```
dommus-smart-home/
├── lp/                    # Landing pages
├── automacoes/            # Automações N8N
├── data/                  # Dados persistentes
├── docs/                  # Documentação
├── scripts/               # Scripts de deployment
├── Dockerfile             # Imagem Docker
├── docker-compose.yml     # Orquestração Docker
├── .github/
│   └── workflows/
│       └── deploy.yml     # Workflow de CI/CD
└── README.md
```

---

✨ **Deploy automático configurado e pronto para usar!**
