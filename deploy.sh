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
  rsync -av --exclude='deploy/log/*' deploy/resources/ deploy/*.jar deploy/config.properties deploy/kiosk deploy/run "sem@$IP:$DIR/."
else
  DIR="www"
  rsync -av --exclude='deploy/log/*' deploy/resources/ deploy/*.jar deploy/config.properties deploy/kiosk deploy/run "sem@$IP:$DIR/."
fi
LOG=log/
if [[ -f "$LOG" ]]; then
  echo $LOG
fi
