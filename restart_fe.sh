#!/bin/bash

PID=( $(pgrep npm) )

# project specific explorer environment
. ~/.explorer.env

FEDIR=$HOME/nordic-energy-dashboard

FOUND=false
for pid in ${PID[@]}; do
        if sudo ls -l /proc/${pid}/cwd | grep -qE 'nordic-energy-dashboard$'; then
                FOUND=true
                kill $pid
                pushd $FEDIR
                npm run build
                nohup npm run start > fe.log 2> fe.err &
                popd
                break
        fi
dNet

# if no frontend process is found, just start a new Net
if [ "$FOUND" = "false" ]; then
        pushd $FEDIR
        npm run build
        nohup npm run start > fe.log 2> fe.err &
        popd
fi
