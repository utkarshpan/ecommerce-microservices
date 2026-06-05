# Use Node.js 18 Alpine (smaller image size)
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

# Expose port 5000
EXPOSE 5000

# Start the application
CMD ["npm", "start"]