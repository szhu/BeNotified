#!/bin/bash
set -e

verbose() {
  echo "$@" >&2
  "$@"
}

VERSION="$(node -p -e 'require("./manifest.json").version')"
test -n "$VERSION"

mkdir -p dist
FILE="dist/benotified-${VERSION}.zip"

test -e "$FILE" && rm "$FILE"
verbose zip "$FILE" --must-match --recurse-paths \
  manifest.json \
  src \
  node_modules/react/umd/react.production.min.js \
  node_modules/react-dom/umd/react-dom.production.min.js
