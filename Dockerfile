# Estágio de build
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./

# Instala dependências de forma otimizada
RUN npm ci --include=dev --prefer-offline --no-audit

COPY . .

RUN npm run test -- --watchAll=false --detectOpenHandles --coverage && \
    npm run build

# Remove devDependencies e cache
RUN npm prune --production && \
    npm cache clean --force

# ---

# Estágio de produção
FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Configurações essenciais para produção
ENV NODE_ENV production
ENV TZ America/Sao_Paulo
RUN apk add --no-cache tzdata

EXPOSE 3000
USER node
CMD ["node", "dist/main.js"]