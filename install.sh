#!/bin/bash

PROJECT="RulzUrFront"
TOP_DIR=$(cd $(dirname "$0") && pwd)

docker_create () {
  docker build -t="front" -rm=true .
}

docker_run () {
  docker run -d -p 80 front
}

repository_initialization () {
  sudo apt-get install -y node-js
  sudo npm install -g grunt-cli
  sudo npm install -g bower
  npm install
  bower install
}

main () {
  repository_initialization
}

main
