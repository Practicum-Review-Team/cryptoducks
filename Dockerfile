FROM node:18.16.0-alpine3.17 AS builder
ARG NODE_ENV=production
ARG YARN_VERSION=1.22.19
ENV NODE_ENV=${NODE_ENV}
ENV YARN_VERSION=${YARN_VERSION}
RUN npm i -g "yarn@$YARN_VERSION" --force
USER node
WORKDIR /var/www/app
COPY package.json yarn.lock ./
# Устанавливаем зависимости
RUN yarn --frozen-lockfile
COPY . .
RUN NODE_OPTIONS=--openssl-legacy-provider yarn build


FROM nginx:1.21.0-alpine as production
COPY --from=builder /var/www/app/build /usr/share/nginx/html
COPY docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
