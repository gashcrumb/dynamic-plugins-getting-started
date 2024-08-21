#!/bin/bash

podman run -v ./deploy:/opt/app-root/src/dynamic-plugins-root:Z -v ./app-config.local.yaml:/opt/app-root/src/app-config.local.yaml:Z -p 7007:7007 --entrypoint='["node", "packages/backend", "--config", "app-config.yaml", "--config", "app-config.example.yaml", "--config", "app-config.local.yaml"]' quay.io/janus-idp/backstage-showcase:next
