#!/bin/bash

PROJECT="RulzUrFront"
TOP_DIR=$(cd $(dirname "$0") && pwd)

docker_create () {
  grunt && docker build -t="$PROJECT" -rm=true .
}

docker_run () {
  docker run -d -p 80 "$PROJECT"
}

docker_clean () {
  docker stop $(docker ps -a -q)
  docker rm $(docker ps -a -q)
}

repository_initialization () {
  cd "$TOP_DIR"
  sudo apt-get update

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

  # PhantomJS installation and protractor fix
  sudo apt-get install -y libfontconfig1 fontconfig libfontconfig1-dev libfreetype6-dev
  sudo npm install -g phantomjs
  cp "test/utils/protractor.js" "node_modules/protractor/lib/protractor.js"
}

main () {
  [[ -z "$1" ]] && repository_initialization && return

  case "$1" in
  "init")
    repository_initialization
    ;;
  "docker_create")
    docker_create
    ;;
  "docker_run")
    docker_run
    ;;
  "docker_clean")
    docker_clean
    ;;
  *)
    echo "Command not found"
    ;;
  esac
}

main "$@"
