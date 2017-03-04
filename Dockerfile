FROM mhart/alpine-node:7.7.1

COPY package.json package.json
RUN npm install

COPY . .

EXPOSE 7080

CMD ["npm", "start"]
