# -*- image: "garo/templates:1.0.0" -*-
FROM manager.asora.co/asora/template-engine:3.0.0-beta
MAINTAINER Luis Gutiérrez <legua.25@asora.co>

# Load application data to the container
COPY package.prod.json /srv/package.json
RUN set -ex && npm install

COPY router.js /srv/router.js
COPY ads.yml /srv/ads.yml
COPY pug /srv/pug

EXPOSE 3030
