# -*- image: "templates:asora-1.0.0" -*-
FROM manager.asora.co/template-engine:2.0.2
MAINTAINER Luis Gutiérrez <legua.25@asora.co>

#Load application data to the container
COPY package.json /srv/package.json
COPY urls.ts /srv/ts/urls.ts

RUN set -ex && npm install && npm run postinstall
COPY pug /srv/pug
COPY ads.yml /srv/ads.yml
EXPOSE 3030

