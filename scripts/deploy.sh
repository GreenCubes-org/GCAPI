#!/bin/sh

git pull origin production

npm install

# DB migration
node ../scripts/db-migrations.js

forever -a -l ../logs/forever.log -o ../logs/out.log -e ../logs/err.log restart gcapi.js
