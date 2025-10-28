# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install
COPY . .
RUN npm run build

# Server stage (static server)
FROM node:20-alpine
WORKDIR /app
RUN npm i -g serve
COPY --from=build /app/dist ./dist
EXPOSE 4173
# Create a non-root user for running the static server (security hardening)
RUN addgroup -S app && adduser -S app -G app
RUN chown -R app:app /app
USER app

CMD [ "serve", "-s", "dist", "-l", "4173" ]
