#!/bin/sh

PATH="$PATH:/home/inacio/.nvm/versions/node/v6.11.2/bin"
DIR=/var/versates
APP=mining-monitor
export PATH
export email_password=change-me
export mysql_database=vminer
export mysql_database_host=35.165.220.140
export mysql_database_user=change-me
export mysql_database_passwd=change-me

cd $DIR/$APP
nohup npm start > $DIR/logs/$APP.log &
