FROM node:14.21.3

WORKDIR /app

COPY package*.json ./

RUN npm install

EXPOSE 4200

CMD ["npm", "start", "--", "--host", "0.0.0.0", "--disable-host-check"]
