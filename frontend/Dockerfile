FROM nginx:alpine

# Copiar la configuración personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar todo el contenido del frontend (HTML, JS, assets)
COPY . /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]