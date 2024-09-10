if [[ $IP == "" ]]; then
  IP="192.168.100.12"
  DIR="pnw"
fi
if [[ $DIR == "" ]]; then
  DIR="pnw"
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
LOG=log/
if [[ -f "$LOG" ]]; then
  echo $LOG
fi