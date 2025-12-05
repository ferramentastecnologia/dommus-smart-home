FROM node:18-alpine

WORKDIR /app

# Copiar arquivos do projeto
COPY . .

# Instalar dependências
RUN npm install --production

# Expor portas
EXPOSE 3000 8080 5678

# Comando padrão
CMD ["npm", "start"]
