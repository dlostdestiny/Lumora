#!/bin/sh
# Lädt den aktuellen Stand (letzter Commit) nach GitHub Pages hoch – ohne den lokalen Verlauf und ohne E-Mail.
# Aufruf: sh tools/veroeffentlichen.sh "Was ist neu"
set -e
cd "$(dirname "$0")/.."
MSG="${1:-Neue Version}"
NAME=dlostdestiny
MAIL=dlostdestiny@users.noreply.github.com

export GIT_INDEX_FILE="${TMPDIR:-${TEMP:-/tmp}}/lumora-pub-index"
rm -f "$GIT_INDEX_FILE"
git read-tree HEAD
git rm -r --cached -q --ignore-unmatch "bilder für game"
git update-index --add --cacheinfo 100644,"$(printf '' | git hash-object -w --stdin)",.nojekyll
TREE=$(git write-tree)
unset GIT_INDEX_FILE

PARENT=$(git rev-parse -q --verify refs/heads/veroeffentlichung || true)
if [ -n "$PARENT" ] && [ "$(git rev-parse "$PARENT^{tree}")" = "$TREE" ]; then
  echo "Nichts Neues zum Hochladen."; exit 0
fi
COMMIT=$(GIT_AUTHOR_NAME=$NAME GIT_AUTHOR_EMAIL=$MAIL GIT_COMMITTER_NAME=$NAME GIT_COMMITTER_EMAIL=$MAIL \
  git commit-tree "$TREE" ${PARENT:+-p "$PARENT"} -m "$MSG")
git update-ref refs/heads/veroeffentlichung "$COMMIT"
git push github veroeffentlichung:main
echo "Hochgeladen. In 1–2 Minuten online: https://dlostdestiny.github.io/Lumora/"
