#!/usr/bin/env bash
#
# Bootstraps an Ubuntu dev server to run RawGit fronted by Nginx.
#

apt-get update
apt-get install -y g++ make python python-software-properties

add-apt-repository -y ppa:nginx/stable
add-apt-repository -y ppa:chris-lea/node.js
apt-get update

apt-get install -y nginx nodejs

adduser --system --no-create-home rawgit

mkdir -p /data/cache/nginx/cdn /data/cache/nginx/rawgit /data/logs /data/ssl
rm /etc/nginx/sites-enabled/default
ln -sf /data/www/rawgit.com/conf/etc/rawgit.nginx.conf /etc/nginx/sites-enabled/
cp /data/www/rawgit.com/conf/etc/rawgit.upstart.conf /etc/init/rawgit.conf

cat >> /tmp/openssl.cnf <<EOF
[ req ]
prompt = no
distinguished_name = req_distinguished_name

[ req_distinguished_name ]
C = US
ST = Some State
L = Some City
O = Monkeys
OU = Pants
CN = localhost
emailAddress = nobody@example.com
EOF

openssl genrsa 2048 > /data/ssl/rawgit-key.pem
openssl req -config /tmp/openssl.cnf -new -key /data/ssl/rawgit-key.pem -out /data/ssl/rawgit.csr
openssl x509 -req -days 1826 -in /data/ssl/rawgit.csr -signkey /data/ssl/rawgit-key.pem -out /data/ssl/rawgit.crt

stop rawgit
start rawgit
/etc/init.d/nginx stop
/etc/init.d/nginx start
