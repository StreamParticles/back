#Specify a base image
FROM node:14 as base

#Specify a working directory
WORKDIR /usr/app

#Copy the dependencies file
COPY ./package.json ./

#Install dependencies
RUN npm install --quiet

#Install pm2
RUN npm install -g pm2

#Copy remaining files
COPY ./ ./

RUN npm run build

# Development image definition
FROM base as dev-server

CMD ["npm", "run", "dev"]


# Production image definition
FROM base as server

CMD ["npm", "run", "start"]

# Multi-instances image definition
FROM base as multi-instances-server

CMD ["pm2-runtime", "start", "process.yml"]