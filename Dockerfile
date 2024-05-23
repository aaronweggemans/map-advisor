FROM node:alpine as build

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm install
RUN npm install -g @angular/cli

COPY . .

RUN ng build --configuration=production

FROM --platform=linux/arm64 nginx:latest

COPY ./nginx.conf /etc/nginx/conf.d/default.conf 
COPY --from=build app/dist/map-advisor/* /usr/share/nginx/html

EXPOSE 4200