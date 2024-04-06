FROM oven/bun:alpine AS builder

# Set working directory
WORKDIR /usr/

# Copy package.json and bun.lockb
COPY package.json .
COPY bun.lockb .

# Install dependencies
RUN bun install --production --ignore-scripts

# Copy the rest of the application code
COPY ./src ./src
RUN bun build --compile --minify --sourcemap src/index.ts --outfile=app

FROM oven/bun:alpine

WORKDIR /usr/

COPY --from=builder /usr/app .
COPY --from=builder /usr/*.bun-build .
COPY --from=builder /usr/bun.lockb .
COPY ./src/migrations ./src/migrations

# Expose port
EXPOSE 3001

# Command to run the app
CMD ["./app"]
