FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Build React app
RUN npm run build

EXPOSE 3001

CMD ["node", "server.js"]
