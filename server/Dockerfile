# -*- image: "server:1.0.0" -*-
FROM manager.asora.co/nginx:1.11.10
MAINTAINER Luis Gutiérrez <legua.2507@gmail.com>

ARG config='default.conf'

COPY ssl/* /etc/nginx/ssl/
COPY ${config} /etc/nginx/sites-enabled/default.conf
COPY nginx.conf mime.types /etc/nginx/
COPY static /srv/static/

RUN set -ex && \
	mkdir -p /etc/nginx/sites-enabled /srv/static /srv/media && \
	chown -R nginx:nginx /srv

# Run the server
EXPOSE 80 443
CMD [ "nginx" ]
