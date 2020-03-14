# Dockerfile; automatically generated on {{ created }}
## DO NOT MANUALLY EDIT.
FROM python:3.8.1-alpine

## Artifact "{{ artifacts.server.name }}" checksum sha256:{{ artifacts.server.checksum }}
COPY "{{ artifacts.server.name }}" "/tmp/{{ artifacts.server.name }}"
RUN set -ex && \
    \
    addgroup -g 1000 garoqro && \
    adduser -G garoqro -HDu 1000 garoqro && \
    mkdir -p "/var/run/garoqro/.db" && \
    chown -R garoqro:garoqro "/var/run/garoqro" && \
    \
    apk add --no-cache --virtual .build build-base curl gcc git libffi-dev openssl-dev && \
    pip install --no-cache-dir --target="/var/run/garoqro" --use-pep517 "/tmp/{{ artifacts.server.name }}" && \
    apk del .build && \
    apk add --no-cache su-exec

ENV HOST_DOMAIN="https://garoqro.com"
ENV DATABASE_URL="sqlite:////var/run/garoqro/.db/garoqro.sqlite3"
ENV LOG_FILE_LOCATION="/var/run/garoqro/debug.log"

WORKDIR "/var/run/garoqro"
VOLUME [ "/var/run/garoqro/.db", "/var/run/garoqro/static" ]
EXPOSE 8000

ENTRYPOINT [ "su-exec", "garoqro:garoqro", "python3", "/var/run/garoqro/manage.py" ]
CMD [ "start", "8000" ]
