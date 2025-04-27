FROM node:latest

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Expose port (adjust if your app uses a different port)
EXPOSE 3000


# Start the application
CMD ["npm", "run", "dev"]
