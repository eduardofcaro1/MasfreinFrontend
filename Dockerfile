# Etapa 1: Construir a aplicação
FROM node:18-alpine AS builder
WORKDIR /app

COPY package.json ./
# Se você tivesse yarn.lock, copiaria aqui e usaria --frozen-lockfile
RUN yarn install

COPY . .
# Define NODE_ENV como production para o build
ENV NODE_ENV=production
RUN yarn build

# Etapa 2: Servir a aplicação com um servidor leve
FROM node:18-alpine
WORKDIR /app

# Copia os arquivos de build da etapa anterior
COPY --from=builder /app/build ./build

# Instala 'serve' para servir os arquivos estáticos
RUN yarn global add serve

EXPOSE 3000

# Comando para servir a pasta 'build'.
# Muitas plataformas de deploy (como Render, Heroku) definem a variável PORT.
# O 'serve' ouvirá nessa porta ou em 3000 como fallback.
CMD ["sh", "-c", "serve -s build -l ${PORT:-3000}"]