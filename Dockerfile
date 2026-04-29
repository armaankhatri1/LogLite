# ─── LogLite Dockerfile ──────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy application code
COPY . .

# Generate sample logs and build Next.js
RUN node sampleApp.js winston
RUN npm run build

EXPOSE 3001

ENV NODE_ENV=production
CMD ["node", "server.js"]
