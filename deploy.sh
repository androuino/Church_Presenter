#!/bin/bash

IP=$1
DIR=$2
if [[ $DIR == "" ]]; then
  DIR="www"
fi
echo "$USER@$IP"
if [[ ! -d deploy ]]; then
  mkdir deploy
fi
cp app/build/libs/*.jar deploy/
cp config.properties deploy/
cp run deploy/
cp kiosk deploy/

rsync -ia resources/public deploy/resources/
rsync -ia --exclude=app/lib/ deploy/lib/
if [[ $IP == "" ]]; then
  IP="192.168.20.82"
  DIR="www"
  rsync -aiv deploy/* --exclude 'deploy/log/' "sem@$IP:$DIR/."
else
  DIR="www"
  rsync -aiv deploy/* --exclude 'deploy/log/' "sem@$IP:$DIR/."
fi
LOG=log/
if [[ -f "$LOG" ]]; then
  echo $LOG
fi
