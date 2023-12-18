#!/bin/bash
TAG=1.1

docker build -t reveriegen.azurecr.io/sansadhak-chat-sdk:$TAG .

docker push reveriegen.azurecr.io/sansadhak-chat-sdk:$TAG
