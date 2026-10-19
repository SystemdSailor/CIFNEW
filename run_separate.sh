#!/bin/bash

gnome-terminal --title="ipfs" -- bash -c "
    npm run ipfs
    exec bash
"

sleep 15

gnome-terminal --title="backend" -- bash -c "
    npm run backend
    exec bash
"

sleep 5

gnome-terminal --title="app" -- bash -c "
    npm run start
    exec bash
"

echo
echo "3个命令已全部启动！"