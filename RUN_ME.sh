#!/bin/bash

set -e

docker build -t spammer .
minikube image load spammer
kubectl apply -f ./spammer.yaml

mirrord exec -f mirrord.json -- node local_app.js
