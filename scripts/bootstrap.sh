#!/usr/bin/env bash

# Bootstraps an Ubuntu 12.04 LTS server to run rawgithub fronted by Nginx.
# Doesn't install SSL certs; you get to do that manually.

apt-get update
apt-get install -y python-software-properties python g++ make

add-apt-repository ppa:nginx/stable
add-apt-repository ppa:chris-lea/node.js
apt-get update

apt-get install -y nginx nodejs

adduser --system --no-create-home rawgithub

mkdir -p /data/cache/nginx /data/logs /data/ssl
rm /etc/nginx/sites-enabled/default
ln -sf /data/www/rawgithub.com/conf/etc/rawgithub.nginx.conf /etc/nginx/sites-enabled/
cp /data/www/rawgithub.com/conf/etc/rawgithub.upstart.conf /etc/init/rawgithub.conf

start rawgithub
/etc/init.d/nginx start
