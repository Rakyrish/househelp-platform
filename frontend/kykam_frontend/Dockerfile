# -------------------
# 1. Builder Stage
# -------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./
# If using npm → COPY package-lock.json ./

# Install ALL deps (dev included) — do NOT set NODE_ENV=production yet
RUN npm install   

# Copy source
COPY . .

# Build — adjust if you really need tsc -b
RUN npx vite build
# Alternative with type check only:
# RUN npx tsc --noEmit && npx vite build

# -------------------
# 2. Production Stage (NGINX)
# -------------------
FROM nginx:alpine

# Copy built static files
COPY --from=builder /app/dist /usr/share/nginx/html

# Optional: custom nginx config if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]