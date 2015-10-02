FROM       debian:testing
MAINTAINER Maxime Vidori <maxime.vidori@gmail.com>

RUN apt-get update
RUN apt-get install -y nodejs npm
RUN ln -s /usr/bin/nodejs /usr/local/bin/node

RUN npm install -g gulp
WORKDIR /mnt/

