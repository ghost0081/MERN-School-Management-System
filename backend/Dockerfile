FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy application source code
COPY . .

# Expose HTTP API & Served Frontend (5000) and GT06 Tracker TCP (5023)
EXPOSE 5000
EXPOSE 5023

# Start Express server & GT06 Tracker TCP Server
CMD ["node", "index.js"]
