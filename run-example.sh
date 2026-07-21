#!/bin/bash

# --- Configuration ---
# RHDH image with Backstage 1.52 / new frontend system support
APP_IMAGE_DEFAULT="quay.io/rhdh-community/rhdh:next"
APP_IMAGE=${APP_IMAGE:-$APP_IMAGE_DEFAULT}

# Dynamic plugins local directory
PLUGIN_DIR_DEFAULT="./dynamic-plugins-root"
PLUGIN_DIR=${PLUGIN_DIR:-$PLUGIN_DIR_DEFAULT}

APP_CONFIG_HOST_DEFAULT="./app-config.yaml"
APP_CONFIG_HOST=${APP_CONFIG_HOST:-$APP_CONFIG_HOST_DEFAULT}

# Define mount arguments based on configured paths
PLUGIN_MOUNT_ARG="-v ${PLUGIN_DIR}:/opt/app-root/src/dynamic-plugins-root:Z"
CONFIG_MOUNT_ARG="-v ${APP_CONFIG_HOST}:/opt/app-root/src/app-config.yaml:Z"

echo "Starting RHDH container (new frontend system)..."
echo "  Using Image: ${APP_IMAGE}"
echo "  Mounting plugins from (host): ${PLUGIN_DIR}"
echo "  Mounting app config from (host): ${APP_CONFIG_HOST}"
echo "  APP_CONFIG_app_packageName=app-next"
echo "  ENABLE_STANDARD_MODULE_FEDERATION=true"
echo "  Container LOG_LEVEL will default to 'info' (override with LOG_LEVEL env var)"
echo "---"

podman run \
    -e LOG_LEVEL=${LOG_LEVEL:-info} \
    -e APP_CONFIG_app_packageName=app-next \
    -e ENABLE_STANDARD_MODULE_FEDERATION=true \
    --pull=newer \
    ${PLUGIN_MOUNT_ARG} \
    ${CONFIG_MOUNT_ARG} \
    -p 7007:7007 \
    --entrypoint='["node", "packages/backend", "--config", "app-config.yaml"]' \
    "${APP_IMAGE}"
