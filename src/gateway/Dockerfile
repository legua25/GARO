# Dockerfile; automatically generated on {{ created }}
## DO NOT MANUALLY EDIT.
FROM nginx:1.17.9-alpine

## Artifact "nginx.conf" checksum sha256:{{ artifacts.nginx_conf.checksum }}
## Artifact "mime-types.conf" checksum sha256:{{ artifacts.mime_types.checksum }}
COPY [ "mime-types.conf", "nginx.conf", "/etc/nginx/" ]
## Artifact "default.conf" checksum sha256:{{ artifacts.default_conf.checksum }}
COPY "default.conf" "/etc/nginx/conf.d"

WORKDIR "/etc/nginx"
VOLUME [ "/etc/nginx/ssl" ]
EXPOSE 80 443

CMD [ "nginx" ]
