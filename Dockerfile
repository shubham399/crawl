FROM node:slim

#Create an app directory.
WORKDIR /usr/crawl

COPY . .
RUN npm i && npm audit
EXPOSE 4567
ENTRYPOINT ["npm" , "start"]
