FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /usr/src/app

# Copy only the production dependencies
COPY --from=builder /usr/src/app/package*.json ./
RUN npm install --production

# Copy the build files and Prisma client from the builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 443

# COPY .env .env  

CMD ["node", "dist/main/server.js"]
