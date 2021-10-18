#Specify a base image
FROM node:14 as base

#Specify a working directory
WORKDIR /usr/app

#Copy the dependencies file
COPY ./package.json ./

#Install dependencies
RUN npm install --quiet

#Copy remaining files
COPY ./ ./


# Development image definition
FROM base as development

CMD ["npm", "run", "dev"]


# Production image definition
FROM base as production

RUN npm run build

CMD ["npm", "run", "start"]
