FROM nginx
COPY nginx.conf /etc/nginx/nginx.conf
RUN sed -i "s|http://web:3008|http://localhost:3008|g" etc/nginx/nginx.conf
