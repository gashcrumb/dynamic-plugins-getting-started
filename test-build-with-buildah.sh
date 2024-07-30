#!/bin/bash

# create the index file
pushd . && cd ./deploy 
#jq '{("./\(input_filename)" | rtrimstr("/package.json" )): with_entries(select(.key == ["name", "version", "description", "backstage", "homepage", "repository", "license", "maintainers", "author", "bugs", "keywords"][]))}' */package.json > index.json

echo "from scratch
COPY . .
" | buildah build --annotation com.redhat.rhdh.plugins="$(jq -c . index.json)" -t quay.io/gashcrumb/simple-chat-plugin-registry:0.1.0 -f -

popd
