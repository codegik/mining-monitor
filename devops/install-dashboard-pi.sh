#!/bin/sh
# Install Versates Mining Dashboard on Raspberry PI Architecture
# Corporation: Versates INC
# Author: Inacio Klassmann
# Usage: ./install-dashboard-pi.sh

set -e

ROOT_PATH="/var/versates"
BRANCH="release/1.1"

echo "Installing pre requirements....."
cd /tmp
wget http://www.rabbitmq.com/releases/rabbitmq-server/v3.1.5/rabbitmq-server_3.1.5-1_all.deb
sudo apt-get install mongodb-server git nginx
sudo apt-get install expect erlang logrotate
sudo dpkg -i rabbitmq-server_3.1.5-1_all.deb
sudo apt-get -f install
sudo dpkg -i rabbitmq-server_3.1.5-1_all.deb
rm rabbitmq-server_3.1.5-1_all.deb

echo "Enabling rabbint management....."
sudo rabbitmq-plugins enable rabbitmq_management

echo "Installing nvm and nodejs......"
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.5/install.sh | bash
source ~/.bashrc
nvm install v6.11.2

sudo mkdir -p $ROOT_PATH
sudo chown -R $USER:$USER $ROOT_PATH
mkdir /var/versates/logs

APP="mining-monitor"
echo "Installing $APP......"
cd $ROOT_PATH
git clone https://github.com/codegik/$APP.git
cd $APP
git checkout $BRANCH
npm install

echo "Installing $APP service......"
sudo cp -r devops/* /
sudo chmod +x $ROOT_PATH/$APP.sh
sudo chmod +x /etc/init.d/$APP
cd /etc/init.d/
sudo update-rc.d $APP defaults

APP="mining-monitor-web"
echo "Installing $APP......"
cd $ROOT_PATH
git clone https://github.com/codegik/$APP.git
cd $APP
git checkout $BRANCH
sudo cp -r devops/* /
sudo chmod +x $ROOT_PATH/$APP.sh
sudo chmod +x /etc/init.d/$APP
ng build --prod
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/
cd /etc/init.d/
sudo update-rc.d $APP defaults

APP="mining-monitor-backup"
echo "Installing $APP......"
cd $ROOT_PATH
git clone https://github.com/codegik/$APP.git
cd $APP
npm install

echo "Installing $APP schedule......"
sudo cp -r devops/* /
sudo chmod +x $ROOT_PATH/$APP.sh
if grep -q "$ROOT_PATH/$APP.sh" "/etc/crontab"; then
    echo "service is already scheduled"
else
    sudo echo "0 */3 * * * $ROOT_PATH/$APP.sh" >> /etc/crontab
fi

echo "All changes was successful!"
echo "PLEASE REBOOT THE SYSTEM!!"
