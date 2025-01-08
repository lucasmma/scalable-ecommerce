FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /usr/src/app

# Install only production dependencies
COPY --from=builder /usr/src/app/package*.json ./
RUN npm install --production

# Copy the build files and Prisma client
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 443

# COPY .env .env  
# Copy Prisma migrations and apply them
COPY --from=builder /usr/src/app/prisma/migrations ./prisma/migrations

# COPY .env .env  

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main/server.js"]
