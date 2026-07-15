#!/usr/bin/env bash
set -e
export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH"
cd /home/aliemad/projects/portfolio
REPO="AliEmad0/portfolio"; BRANCH="feat/contact-seo-a11y"
git add -A
echo "=== commit ==="
git commit -F /tmp/msg.txt >/tmp/commit.log 2>&1 && echo "committed" || { echo "COMMIT FAILED"; tail -30 /tmp/commit.log; exit 1; }
git log --oneline -1
echo "=== push ==="
git push origin "$BRANCH" 2>&1 | tail -3
CRED=$(printf 'protocol=https\nhost=github.com\n\n' | git credential fill 2>/dev/null)
TOKEN=$(printf '%s\n' "$CRED" | sed -n 's/^password=//p')
API="https://api.github.com/repos/$REPO"; AUTH="Authorization: token $TOKEN"; ACC="Accept: application/vnd.github+json"
RESP=$(curl -s -X POST -H "$AUTH" -H "$ACC" "$API/pulls" -d @/tmp/pr.json)
NUM=$(printf '%s' "$RESP" | python3 -c 'import sys,json;print(json.load(sys.stdin).get("number",""))')
[ -z "$NUM" ] && NUM=$(curl -s -H "$AUTH" -H "$ACC" "$API/pulls?head=AliEmad0:$BRANCH&state=open" | python3 -c 'import sys,json;a=json.load(sys.stdin);print(a[0]["number"] if a else "")')
echo "$NUM" > /tmp/prnum
curl -s -H "$AUTH" -H "$ACC" "$API/pulls/$NUM" | python3 -c 'import sys,json;d=json.load(sys.stdin);print("PR #%s: %s"%(d["number"],d["html_url"]))'
