FROM node:22-alpine AS builder

# Habilitar pnpm
RUN corepack enable pnpm

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml* ./

# Instalar dependencias
RUN pnpm config set ignore-scripts false
RUN pnpm install --frozen-lockfile || pnpm install

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación
RUN pnpm run build

# Imagen de producción
FROM node:22-alpine AS runner

WORKDIR /app

# Copiar los archivos construidos de Nitro y Vite
COPY --from=builder /app/.output ./.output

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", ".output/server/index.mjs"]