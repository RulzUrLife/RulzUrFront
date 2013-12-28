# RulzUrAPI
#
# VERSION               0.0.1

FROM      ubuntu
MAINTAINER Maxime Vidori <maxime.vidori@gmail.com>

# make sure the package repository is up to date
RUN echo "deb http://archive.ubuntu.com/ubuntu precise main universe" > /etc/apt/sources.list
RUN apt-get update
RUN apt-get upgrade -y

RUN apt-get install -y nginx

ADD dist rulzurfront
ADD nginx-rulzurfront.conf /etc/nginx/sites-available/

RUN rm /etc/nginx/sites-enabled/default
RUN ln -s /etc/nginx/sites-available/nginx-rulzurfront.conf /etc/nginx/sites-enabled

# hack for running nginx in a docker container
RUN echo "daemon off;" >> /etc/nginx/nginx.conf

CMD ["nginx"]

EXPOSE 80
