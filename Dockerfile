FROM node:alpine as build

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

# RUN npm install
# RUN npm install -g @angular/cli

RUN npm ci
RUN npm install -g @angular/cli@17

COPY . .

# RUN ng build --configuration=production
RUN npm run build --configuration=production

FROM --platform=linux/arm64 nginx:latest

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build app/dist/map-advisor/* /usr/share/nginx/html

EXPOSE 4200
