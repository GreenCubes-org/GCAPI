#!/bin/sh

cd ..

git pull origin master

npm install
forever -a -l ../logs/forever.log -o ../logs/out.log -e ../logs/err.log restart gcapi.js
