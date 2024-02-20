set -e

verbose() {
  echo "$@" >&2
  "$@"
}

VERSION="$(node -p -e 'require("./manifest.json").version')"
test -n "$VERSION"

mkdir -p dist
FILE="dist/time-to-bereal-chrome-${VERSION}.zip"

test -e "$FILE" && rm "$FILE"
verbose zip "$FILE" -r \
  manifest.json \
  src \
  node_modules/react/umd/react.production.min.js \
  node_modules/react-dom/umd/react-dom.production.min.js
