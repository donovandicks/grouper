# Use a lightweight Node.js base image
FROM node:21-alpine AS builder

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (including dev dependencies for building)
RUN npm install

# Copy the rest of the application code
COPY . .

# Build TypeScript code
RUN npm run build

# Use a minimal Node.js base image for the production build
FROM node:21-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json from builder stage
COPY --from=builder /usr/src/app/package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy built files from builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose port
EXPOSE 3001

# Command to run the app
CMD ["node", "./dist/index.js"]
