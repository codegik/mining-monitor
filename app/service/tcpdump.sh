#!/bin/bash


# Reboot S9 miner
# Corporation: Versates INC
# Author: Inacio Klassmann

set -e

if [ "$#" -lt 1 ]; then
    echo "Usage: $0 <PORT>" >&2
    exit 1
fi

PORT=$1

echo "listening S9 broadcast on port ${PORT}"

output=$(sudo tcpdump -c 1 udp port 14236)

ip=$(echo $output | egrep -o 'IP(.*)>' | egrep -o ' (.*) ')

echo $ip