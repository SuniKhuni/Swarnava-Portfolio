#!/bin/sh
# Container entrypoint. A freshly attached disk is owned by root: hand /data to the `node`
# user, then run the server as that user (never as root).
set -e
if [ "$(id -u)" = "0" ]; then
  mkdir -p "${CONTENT_DIR:-/data}"
  chown -R node:node "${CONTENT_DIR:-/data}"
  exec setpriv --reuid=node --regid=node --init-groups node server.js
fi
exec node server.js
