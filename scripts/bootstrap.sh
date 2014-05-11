#!/usr/bin/env bash
#
# Bootstraps an Ubuntu 12.04 LTS server to run RawGit fronted by Nginx.
#

apt-get update
apt-get install -y g++ make python python-software-properties

add-apt-repository -y ppa:nginx/development
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
CN = rawgithub.com
emailAddress = nobody@example.com
EOF

openssl genrsa -out /data/ssl/rawgithub.com.key 1024
openssl req -config /tmp/openssl.cnf -new -key /data/ssl/rawgithub.com.key -out /data/ssl/rawgithub.com.csr
openssl x509 -req -days 1826 -in /data/ssl/rawgithub.com.csr -signkey /data/ssl/rawgithub.com.key -out /data/ssl/rawgithub.com.crt

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
CN = rawgit.com
emailAddress = nobody@example.com
EOF

openssl genrsa -out /data/ssl/rawgit.com.key 1024
openssl req -config /tmp/openssl.cnf -new -key /data/ssl/rawgit.com.key -out /data/ssl/rawgit.com.csr
openssl x509 -req -days 1826 -in /data/ssl/rawgit.com.csr -signkey /data/ssl/rawgit.com.key -out /data/ssl/rawgit.com.crt

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
CN = cdn-origin.rawgit.com
emailAddress = nobody@example.com
EOF

openssl genrsa -out /data/ssl/cdn-origin.rawgit.com.key 1024
openssl req -config /tmp/openssl.cnf -new -key /data/ssl/cdn-origin.rawgit.com.key -out /data/ssl/cdn-origin.rawgit.com.csr
openssl x509 -req -days 1826 -in /data/ssl/cdn-origin.rawgit.com.csr -signkey /data/ssl/cdn-origin.rawgit.com.key -out /data/ssl/cdn-origin.rawgit.com.crt

stop rawgit
start rawgit
/etc/init.d/nginx stop
/etc/init.d/nginx start
