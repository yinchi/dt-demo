# Authentication frontend
FROM node:22-alpine AS builder

WORKDIR /app
COPY . .

ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

RUN yarn install
RUN yarn build

# Use Nginx to serve the static files. The root folder is set to /www in nginx.conf
FROM nginx:mainline-alpine-slim AS runtime
COPY --from=builder /app/dist /www
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

LABEL org.opencontainers.image.authors="Yin-Chi Chan"
LABEL org.opencontainers.image.source="https://github.com/yinchi/dt-demo"
LABEL org.opencontainers.image.title="dt-demo-auth-frontend"
LABEL org.opencontainers.image.description="Authentication frontend for the hospital digital twin demo"
LABEL org.opencontainers.image.base.name="nginx:mainline-alpine-slim"
