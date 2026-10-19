#!/bin/bash

echo "启动ipfs"
npm run ipfs &

sleep 5

echo "启动后端"
npm run backend &

sleep 10

echo "启动应用"
npm run start &

echo
echo "所有命令已启动！"

wait