#!/bin/bash


# Reboot S9 miner
# Corporation: Versates INC
# Author: Inacio Klassmann

set -e

if [ "$#" -lt 1 ]; then
    echo "Usage: $0 <HOST> [USER=root] [PASSWD=admin]" >&2
    exit 1
fi

HOST=$1
USER=root
PASSWD=admin

if [ "$2" != "" ]; then
    USER=$2
fi

if [ "$3" != "" ]; then
    PASSWD=$3
fi


echo "connecting $USER@$HOST..."
export HOST=$HOST
output=$(
/usr/bin/expect <<EOF
    spawn ssh -oStrictHostKeyChecking=no root@$HOST
    expect "*?password:"
    send "admin\r"
    expect "root*"
    send "reboot\r"
    expect "*closed?*"
    close
    exit
EOF
)
echo $output
