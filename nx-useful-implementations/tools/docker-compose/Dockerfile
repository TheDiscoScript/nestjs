FROM --platform=linux/amd64 node:16-alpine

WORKDIR /src

RUN npm install -g --save typescript ts-node ts-node-dev tsconfig-paths nx @nrwl/nx-linux-x64-musl

COPY package.json package-lock.json ./

RUN npm ci