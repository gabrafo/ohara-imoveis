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

ENV NODE_ENV development

EXPOSE 3000
USER node
CMD ["node", "dist/main.js"]