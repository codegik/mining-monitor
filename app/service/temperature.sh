#!/bin/bash


# Get S9 temperature and fans
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
    send "bmminer-api stats\r"
    expect "R*?\r"
    close
    exit
EOF
)

temp1=$(echo $output | egrep -o 'temp2_6=(-?\d+)' | egrep -o '(\d+)$')
temp2=$(echo $output | egrep -o 'temp2_7=(-?\d+)' | egrep -o '(\d+)$')
temp3=$(echo $output | egrep -o 'temp2_8=(-?\d+)' | egrep -o '(\d+)$')
fan3=$(echo $output | egrep -o 'fan3=(-?\d+)' | egrep -o '(\d+)$')
fan6=$(echo $output | egrep -o 'fan6=(-?\d+)' | egrep -o '(\d+)$')

echo "{\"temp1\": $temp1, \"temp2\": $temp2, \"temp3\": $temp3, \"fan3\": $fan3, \"fan6\": $fan6}"
