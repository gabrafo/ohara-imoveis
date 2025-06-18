# Estágio 1: Build da Aplicação
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./

RUN npm install --include=dev

COPY . .

# Executa os testes e o build
RUN npm run test:cov && npm run build


# ---
# Estágio 2: Imagem Final de Produção
FROM node:20-alpine

WORKDIR /app

# Copia apenas as dependências de produção do estágio anterior
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

ENV NODE_ENV development

# Expõe a porta que a aplicação vai usar
EXPOSE 3000

# Executa a aplicação com um usuário não-root por segurança
USER node
CMD ["node", "dist/main.js"]