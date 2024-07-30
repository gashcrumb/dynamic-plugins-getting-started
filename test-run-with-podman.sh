#!/bin/bash


# To use the local deploy directory
# -v ./deploy:/opt/app-root/src/dynamic-plugins-root:Z \

podman run \
--mount=type=image,src=localhost:5000/${USERNAME}/simple-chat-plugin-registry:0.1.0,dst=/opt/app-root/src/dynamic-plugins-root \
-v ./app-config.local.yaml:/opt/app-root/src/app-config.local.yaml:Z \
-p 7007:7007 \
--entrypoint='["node", "packages/backend", "--config", "app-config.yaml", "--config", "app-config.example.yaml", "--config", "app-config.local.yaml"]' \
quay.io/rhdh/rhdh-hub-rhel9:next