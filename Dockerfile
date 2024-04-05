FROM oven/bun:alpine AS builder

# Set working directory
WORKDIR /usr/

# Copy package.json and bun.lockb
COPY package.json .
COPY bun.lockb .

# Install dependencies (including dev dependencies for building)
RUN bun install --production

FROM builder AS runner

# Copy the rest of the application code
COPY ./src ./src

# Expose port
EXPOSE 3001

# Command to run the app
CMD ["bun", "run", "./src/index.ts"]
