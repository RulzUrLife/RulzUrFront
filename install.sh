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
  # Nodejs clean install
  sudo apt-get install -y python-software-properties
  sudo add-apt-repository -y ppa:chris-lea/node.js
  sudo apt-get update
  sudo apt-get install -y nodejs
  sudo npm install -g grunt-cli
  sudo npm install -g bower

  # Install environment specific scripts
  npm install
  bower install

  # Compass installation
  sudo gem update --system && sudo gem install compass
}

main () {
  repository_initialization
}

main
