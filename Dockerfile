# Stage 1: Build React + Vite App
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy root package.json and lock file
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Run Vite build
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built files to nginx root
COPY --from=build /app/dist/public /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
