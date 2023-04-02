#!/bin/sh
# TEST
cd /var/www/app/poc-be-welcoming-call && npm install
cd /var/www/app/poc-be-welcoming-call && pm2 stop poc-be-welcoming-call
cd /var/www/app/poc-be-welcoming-call && pm2 delete poc-be-welcoming-call
cd /var/www/app/poc-be-welcoming-call && pm2 start pm2.json
