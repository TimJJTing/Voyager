FROM node:20-alpine AS builder

WORKDIR /app
COPY .npmrc /app
COPY package*.json /app
RUN npm ci
COPY . .

ENV VITE_ADAPTER="node"

RUN npm run build
RUN npm prune --production

FROM node:20-alpine

RUN adduser -D nodeuser
RUN mkdir -p /app
RUN chown nodeuser:nodeuser /app
USER nodeuser
WORKDIR /app
COPY --from=builder --chown=nodeuser:nodeuser /app/build build/
COPY --from=builder --chown=nodeuser:nodeuser /app/node_modules node_modules/
COPY package.json .

CMD ["node", "build"]
