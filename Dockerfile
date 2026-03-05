# Use Node 18 Alpine as the base image for a small footprint
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy the prisma schema first so we can generate the client
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the TypeScript code
RUN npm run build

# Expose the API port
EXPOSE 3000

# Start the application
CMD [ "npm", "start" ]
