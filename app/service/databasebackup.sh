#!/bin/bash


# Backup database
# Corporation: Versates INC
# Author: Inacio Klassmann

set -e

echo "shutting down application..."
curl -Is http://localhost:8100/shutdown | head -1
echo "done"

host="ec2-user@ec2-52-88-178-129.us-west-2.compute.amazonaws.com"
local_path=/var/lib/mongodb
date=$(date '+%Y%m%d%H%M%S')
path="/efs/backup/mining-monitor/$date"

echo "Copying $local_path to $host:$path"
scp -i ~/.ssh/versates-devops-access.pem -r $local_path $host:$path
echo "done"

echo "starting application"
npm start &
echo "done"

exit 0