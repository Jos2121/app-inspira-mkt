# Etapa 1: Construcción (Builder)
FROM node:20-alpine AS builder

# Habilitar pnpm
RUN corepack enable pnpm

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias primero para aprovechar la caché de Docker
COPY package.json pnpm-lock.yaml* ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile || pnpm install

# Copiar el resto del código fuente
COPY . .

# Compilar la aplicación (Frontend Vite + Backend Nitro)
RUN pnpm run build

# Etapa 2: Producción (Runner)
FROM node:20-alpine AS runner

# Establecer directorio de trabajo
WORKDIR /app

# Configurar variables de entorno para producción
ENV NODE_ENV=production
ENV PORT=8080

# Copiar únicamente la carpeta compilada (.output) desde la etapa de construcción
COPY --from=builder /app/.output ./.output

# Exponer el puerto configurado
EXPOSE 8080

# Comando de inicio del servidor
CMD ["node", ".output/server/index.mjs"]