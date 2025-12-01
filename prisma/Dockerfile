FROM node:18-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy Prisma schema
COPY schema.prisma ./

# Generate Prisma Client
RUN npx prisma generate

# Expose Prisma Studio port
EXPOSE 5555

# Start Prisma Studio
CMD ["npm", "run", "studio"]

