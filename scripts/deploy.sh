#!/bin/bash

# Script de Deploy Manual com Docker para VPS Dommus
# Uso: ./scripts/deploy.sh

set -e

VPS_HOST="72.60.149.123"
VPS_USER="ubuntu"
DEPLOY_PATH="/opt/dommus"
GIT_REPO="git@github.com:ferramentastecnologia/dommus-smart-home.git"
SSH_KEY="$HOME/.ssh/starken.pem"

echo "🚀 Iniciando deploy Docker para VPS..."
echo "Host: $VPS_HOST"
echo "Caminho: $DEPLOY_PATH"
echo ""

# Verificar se chave SSH existe
if [ ! -f "$SSH_KEY" ]; then
  echo "❌ Erro: Chave SSH não encontrada em $SSH_KEY"
  exit 1
fi

# Conectar e fazer deploy via SSH com Docker
ssh -i $SSH_KEY $VPS_USER@$VPS_HOST << 'REMOTE_SCRIPT'
  echo "📁 Verificando diretório de deployment..."

  # Criar diretório se não existir
  mkdir -p /opt/dommus

  cd /opt/dommus

  # Se não tiver git, fazer clone
  if [ ! -d ".git" ]; then
    echo "📦 Clonando repositório..."
    git clone git@github.com:ferramentastecnologia/dommus-smart-home.git .
  else
    echo "📥 Atualizando repositório..."
    git pull origin main
  fi

  # Parar containers anteriores
  echo "🛑 Parando containers anteriores..."
  docker-compose down 2>/dev/null || true

  # Build imagem
  echo "🏗️  Construindo imagem Docker..."
  docker-compose build

  # Iniciar containers
  echo "🚀 Iniciando containers..."
  docker-compose up -d

  # Log de deploy
  echo "✅ Deploy realizado em $(date)" >> deploy.log

  # Status
  echo ""
  echo "📊 Status dos containers:"
  docker-compose ps

  echo ""
  echo "🎉 Deploy concluído com sucesso!"
  echo "📍 Projeto está em: /opt/dommus"
  echo "📊 Acesse em: http://72.60.149.123:3000"

REMOTE_SCRIPT

echo ""
echo "✨ Deploy finalizado!"
