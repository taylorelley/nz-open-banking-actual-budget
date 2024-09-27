# Use official Node.js LTS version
FROM node:lts

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose any necessary ports if needed
EXPOSE 3000

# Run the application
CMD ["npm", "start"]
