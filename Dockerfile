# Specify the base image
FROM node:lts-alpine3.17

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app's source code
COPY . .

RUN npm run build

# Your app binds to port 3000 so you use the EXPOSE instruction to have it mapped by the docker daemon
EXPOSE 3000

# Define the command to run your app
CMD [ "node", "dist/index.js" ]
