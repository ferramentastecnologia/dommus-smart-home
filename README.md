# Dommus Smart Home

Projeto de automações, landing pages e integrações N8N para a Dommus.

## Estrutura do Projeto

```
dommus-smart-home/
├── lp/                    # Landing pages
├── automacoes/            # Automações N8N
├── docs/                  # Documentação
├── scripts/               # Scripts de deployment
└── .github/
    └── workflows/         # GitHub Actions
```

## Deploy

O projeto faz deploy automático na VPS quando há commits na branch `main`.

### Configuração Inicial

1. SSH Key já configurada no GitHub
2. Webhook automático via GitHub Actions
3. Deploy em: `/opt/dommus`

