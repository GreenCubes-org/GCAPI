#!/bin/sh

forever start -a -l ../logs/forever.log -o ../logs/out.log -e ../logs/err.log ../gcapi.sh