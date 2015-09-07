FROM ubuntu:14.04

MAINTAINER ContainerShip Developers <developers@containership.io>

# create app directory
RUN mkdir /app

# install curl / npm
RUN apt-get update && apt-get install -y npm curl

# install node
RUN npm install n -g
RUN n 0.10.35

# install dependencies
RUN npm install quarry-dns@0.5.2 -g

# set entrypoint
ENTRYPOINT ["quarry"]
