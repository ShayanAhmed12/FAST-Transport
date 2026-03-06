# Base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all frontend files
COPY . .

# Build frontend
#RUN npm run build

# Expose port (optional, for dev server)
EXPOSE 3000

# Start frontend dev server
CMD ["npm", "run", "dev", "--", "--host", "--port", "3000"]