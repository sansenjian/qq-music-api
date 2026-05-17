FROM node:22.22.1-alpine3.22

LABEL maintainer="Rain120 <1085131904@qq.com>"

# Create app directory
WORKDIR /app

COPY package.json .

RUN npm install --registry=https://registry.npmmirror.com

COPY . .

RUN npm run build

EXPOSE 3200

ENTRYPOINT ["npm", "run"]

CMD ["start"]
