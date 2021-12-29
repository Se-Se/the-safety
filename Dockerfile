FROM nginx:1.19.5-alpine

COPY ./dist /app
COPY ./nginx.conf.template /etc/nginx/templates/default.conf.template
