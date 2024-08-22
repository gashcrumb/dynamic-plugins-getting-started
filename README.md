
# A simple getting started project for building Dynamic Plugins with Red Hat Developer Hub

## Overview

> Note: The Dynamic Plugin functionality is a tech preview feature of Red Hat Developer Hub and is still under active development.  Aspects of developing, packaging and deployment of dynamic plugins are subject to change

This project is an example approach to developing a new set of dynamic plugins by starting from a newly created Backstage application.  The code in this repository is at the state where the plugins should be deployable to OpenShift (OCP) after building.  This guide will go through the steps leading up to this state, and continue on to describe the commands needed to upload the dynamic plugin static content to a standalone httpd server that runs alongside the Red Hat Developer Hub instance.

The initial steps will focus on an operator based Developer Hub installation, perhaps a future update to this README can add the specifics for the Helm-based installation.

At a high level plugin development involves bootstrapping a new Backstage instance using the Backstage `create-app` script, using `yarn new` to create new plugins, and finally developing these plugins using their respective development setup.  The provided Backstage app gives an integration point to try all of the plugins together in a Backstage instance by statically integrating the plugins into the Backstage application code.

Once the plugin functionality is working as intended the plugins can be bundled and deployed to Developer Hub running on OCP by adding an additional build target to each plugin to export the dynamic plugin's static assets in a way that can be loaded by Developer Hub.

## Prerequisites

* node 20.x (node 18 may work fine also but untested)
* npm (10.8.1 was used during development)
* yarn (1.22.22 was used during initial development but now at least 3.8.1 is required _And you should [migrate](#migrate-generated-app-to-yarn-v3) to Yarn 3_)
* jq (1.7.1 was used during development)
* oc
* an OpenShift cluster with an untouched operator based Developer Hub deployment

The commands used for deployment were developed with the bash shell in mind on Linux, some steps may require adjustment when trying this on a Windows environment.  This guide will try and highlight these cases, though probably WSL would work also (but hasn't been tested).

## The Guide

This guide is broken up into four top-level phases, bootstrapping the project and getting it ready, implementing the demo functionality, preparing and exporting the plugins as dynamic plugins and finally deploying to OpenShift and configuring Developer Hub to load the plugins.

> Note: If you're just interested in a method to deploy a dynamic plugin to Developer Hub you can skip straight to [to this section](#phase-4---dynamic-plugin-deployment)

### Phase 1 - Project Bootstrapping

#### Bootstrapping Step 1

Create a new Backstage app using a version of `create-app` that correlates to the Backstage version that the target Developer Hub is running.  There is a little matrix of versions to be aware of:

```text
RHDH 1.1 -> Backstage 1.23.4 -> create-app 0.5.11
RHDH 1.2 -> Backstage 1.26.5 -> create-app 0.5.14
```

So for Developer Hub 1.2 run:

```cli
npx @backstage/create-app@0.5.14
```

When prompted for the name enter "dynamic-plugins-getting-started".  After prompting for a project name the `create-app` command will generate a git repo with the Backstage app and an [initial commit](https://github.com/gashcrumb/dynamic-plugins-getting-started/commit/6409e6e9a411387fc219dde00184e5cfe1dcb994)

`yarn install` is run automatically by the `create-app` script.  The generated `package.json` also contains scripts such as `yarn tsc` and `yarn build:all` to build the repo as needed.

#### Bootstrapping Step 2

The `create-app` script suggests to change to the "dynamic-plugins-getting-started" directory and run `yarn dev` however the plugins and development setup needs to be prepared first.

[Update](https://github.com/gashcrumb/dynamic-plugins-getting-started/commit/f6dbc0d24c15687a9fe09d676957c3a8c835fd04) the app's version of `@backstage/backend-defaults` by changing `packages/backend/package.json` to use the following version:

```json
"@backstage/backend-defaults": "0.3.3",
```

Run `yarn install` after making this change.

#### Bootstrapping Step 3

In development, it's easiest to work with the guest authentication provider vs disabling authentication altogether.  Set this up by adding a new file `app-config.local.yaml` with the following contents:

```yaml
auth:
  providers:
    guest: {}
```

#### Bootstrapping Step 4

Now the backend plugin can be bootstrapped.  Run `yarn new` and select `backend-plugin`.  When prompted for a name specify `simple-chat`.  This will generate some example backend plugin code and add this plugin as a dependency to `packages/backend/package.json`.  The backend app however still needs to be updated to load this new backend plugin, add this line to `packages/backend/src/index.ts`:

```typescript
backend.add(import('@internal/backstage-plugin-simple-chat-backend'));
```

The end result of all of this should look similar to [this commit](https://github.com/gashcrumb/dynamic-plugins-getting-started/commit/5d31fc3cb9b4a02e8d6dc51b5589ae95097657db) and the example backend endpoint should be accessible via `curl` when `yarn start` from `plugins/simple-chat-backend`

#### Bootstrapping Step 5

The frontend plugin can now be bootstrapped.  Run `yarn new` and select `plugin`.  When prompted for a name, specify `simple-chat`  This will generate some starting frontend code and add this plugin as a dependency to `packages/app/package.json`.  The `yarn new` script in this case will also update `packages/app/src/App.tsx` to define a new `Route` component for the new plugin.  However a link to the plugin still needs to be added to the application's main navigation.  Do this by editing `packages/app/src/components/Root/Root.tsx` and adding a new `SidebarItem` underneath the existing entry for "Create...":

```typescript
 <SidebarItem icon={ChatIcon} to="simple-chat" text="Simple Chat" />
```

Once completed, the end result should look similar to [this commit](https://github.com/gashcrumb/dynamic-plugins-getting-started/commit/0aa89cdfaae84d42366aca0ac8fa018a187cabba).  Do a rebuild with `yarn run tsc && yarn run build:all` and then the generated frontend plugin should be visible in the UI when running `yarn start` from the root of the repo.

### Phase 2 - Plugin Implementation

At this point it's time to develop the actual plugin functionality.  The example app will be a very simple chat application, with the username derived from the logged in user's identity.  The backend in this first implementation will simply keep a store of chat messages in-memory.  The frontend UI will just poll for chat messages and show a list of them, and offer a text input field that the user can send new messages with, using the Enter key.

The steps in this phase will not go to into much implementation detail but are called out separately to show how a frontend or backend plugin evolves from the generated code to an implementation and then finally a dynamic plugin.

#### Implementation Step 1

Create the frontend implementation by changing directory to `plugins/simple-chat` and running `yarn start` to start up the frontend plugin's development environment.  This simple development environment mimics much of the Backstage application shell and offers the ability to easily mock or proxy backend services when developing user-facing functionality.

First a simple API for the chat server is developed and mocked in the dev setup.  To make HTTP requests to the server, an API client is created.  A hook is used to handle polling the backend for updates, while a second API call takes care of sending new messages from the keydown event when the user hits Enter.

The client also uses the identity service to send along the user's username as a nickname.  When guest authentication is used this value is actually not set, so the code deals with this by swapping in a "guest" username for this case.

The details of all of these changes on the generated frontend plugin can be found in [this commit](https://github.com/gashcrumb/dynamic-plugins-getting-started/commit/39c7f183c47e91885fe99e0b20588676cf294296).

At this point the chat UI should appear functional even from other windows, however refreshing the page will reset the available chat messages.

#### Implementation Step 2

  To develop the backend using the frontend as a client, run `yarn start-backend` to run the app backend.  This also happens to serve out the same static assets as the main application, so the frontend UI plugin should be visible at `http://localhost:7007`, and can be used to help develop the backend.  It is also possible to create the backend implementation by changing directory to `plugins/simple-chat-backend` and running `yarn start` to start up the backend plugin's development environment.  This simple development environment runs a stripped down backend including the backend plugin, however no static assets such as the frontend UI are available in this mode.

In this case the backend implementation imports the httpAuth service to check if incoming requests have an authorization token, either for posting a new message or fetching the available messages.  These messages are simply stored in an array for this example.

The details of these changes on the generated backend plugin can be found in [this commit](https://github.com/gashcrumb/dynamic-plugins-getting-started/commit/139df22817cff2b2cc0cae2391ddba2cdf16d027)

At this point the chat UI should be fully functional, chat messages from other windows/users should show up in the UI and the chat messages should not be lost when refreshing the page.

### Phase 3 - Dynamic Plugin enablement

> Note: The Dynamic Plugin feature in Developer Hub is still under active development.  Features and tooling around dynamic plugin enablement are still subject to change.

In this phase new build targets will be added to the plugins, along with any necessary tweaks to the plugin code to get them working as a dynamic plugin.  

#### Enablement Step 1

First prepare the root `package.json` file by updating the `devDependencies` section and add the `@janus-idp/cli` tool:

```json
 "@janus-idp/cli": "^1.13.1",
```

The next job is to update the `scripts` section of the `package.json` files for the repo to add the `export-dynamic-plugin` command.

#### Enablement Step 2

Add the following to the `scripts` section of `plugins/simple-chat-backend/package.json`:

```json
 "export-dynamic": "janus-cli package export-dynamic-plugin"
```

#### Enablement Step 3

Add the following to the `scripts` section of `plugins/simple-chat/package.json`:

```json
"export-dynamic": "janus-cli package export-dynamic-plugin"
```

#### Enablement Step 4

Update the root `package.json` file to make it easy to run the `export-dynamic` command from the root of the repository by adding one of the following to the `scripts` section:

##### using yarn v1

> Note: If running this on Windows, either use WSL (or similar) or adjust this command

```json
"export-dynamic": "yarn --cwd plugins/simple-chat-backend export-dynamic && yarn --cwd plugins/simple-chat export-dynamic"
```

##### using yarn v3+

```json
"export-dynamic": "yarn workspaces foreach -A run export-dynamic"
```

Also update the `.gitignore` file at this point to ignore `dist-dynamic` directories:

```text
dist-dynamic
```

#### Enablement Step 5

The backend as generated needs a couple tweaks to work as a dynamic plugin, as the generated code relies on a component imported from `@backstage/backend-defaults`.  Update `plugins/simple-chat-backend/src/service/router.ts` to remove this import:

```typescript
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
```

and add this import instead:

```typescript
import { MiddlewareFactory } from '@backstage/backend-app-api';
```

These correspond to the versions of the packages released with Backstage 1.26.5.

#### Enablement Step 6

The frontend plugin has it's own icon in the main navigation which needs to be exported.  Update `plugins/simple-chat/src/index.ts` to re-export the `ChatIcon` from `@backstage/core-components` from the plugin so it can be referenced in the configuration.  Do this by updating `plugins/simple-chat/src/index.ts` to look like:

```typescript
import { ChatIcon as ChatIconBackstage } from '@backstage/core-components';
export { simpleChatPlugin, SimpleChatPage } from './plugin';
export const ChatIcon = ChatIconBackstage;
```

#### Enablement Step 7

Finally, the frontend plugin should include some basic configuration so that it will be visible in the Developer Hub app.  The convention currently is to put this into an `app-config.janus-idp.yaml` file.  Create the file `plugins/simple-chat/app-config.janus-idp.yaml` and add the following:

```yaml
dynamicPlugins:
  frontend:
    internal.backstage-plugin-simple-chat:
      appIcons:
        - name: chatIcon
          importName: ChatIcon
      dynamicRoutes:
        - path: /simple-chat
          importName: SimpleChatPage
          menuItem:
            text: 'Simple Chat'
            icon: chatIcon
```

While this is not currently used by any of the tooling, this still serves as a reference for plugin installers.

The results of all of these changes along with the additions discussed in the deployment phase are available in [this commit](https://github.com/gashcrumb/dynamic-plugins-getting-started/commit/08b637454f437d0c5a1f4185d8abfb2e0b84d83d)

### Phase 4 - Dynamic Plugin Deployment

> Note: The Dynamic Plugin feature in Developer Hub is still under active development.  Features regarding plugin deployment are still being defined and developed.  The method shown here is one method that doesn't involve using an NPM registry to host plugin static assets.

Deploying a dynamic plugin to Developer Hub involves exporting a special build of the plugin and packing it into a `.tar.gz` file.  Once the dynamic plugins are exported as `.tar.gz` to a directory, that directory will be used to create an image, which will then be served by an `httpd` instance in OCP.  Deployment in Developer Hub is still in a technical preview phase, so there's not much tooling to help.  Some scripts mentioned in the last phase have been added to this repo to hopefully make this process straightforward.

#### Deployment Step 1

Create a directory to put the `.tar.gz` files into called `deploy` and add a `.gitkeep` file to it.  Update the `.gitignore` file as well to ignore `.tar.gz` files:

```text
deploy/*.tgz
```

#### Deployment Step 2

Make sure to build everything at this point, often it's easiest to run a chain of commands from the root of the repo like:

```text
yarn install && yarn run tsc && yarn run build:all && yarn run export-dynamic
```

And then use the `01-stage-dynamic-plugins.sh` script to pack the plugins into `.tar.gz` files and display their integrity hashes:

```bash
bash ./01-stage-dynamic-plugins.sh
```

The output should look kind of like:

```text
Packaging up plugin static assets

Backend plugin integrity Hash: sha512-mwHcJV0Gx6+GHuvqxpJsw9Gzn/8H5AjoGQ2DlMY4ntntAhdpFr/o5IZO5bOri41R14ocDg3KUqDxaZY/4AWSLg==
Frontend plugin integrity Hash: sha512-t5HcciQFHsaSjjkiV5Ri1XqAsww9pdJy5zRRrOv8ddGdK1VXGe1ec2+WyDSkguZz1y3UDdaK3mW7asRanWXFOQ==

Plugin .tgz files:
total 3756
-rw-r--r--. 1 gashcrumb gashcrumb 1575584 Jul  3 14:55 internal-backstage-plugin-simple-chat-backend-dynamic-0.1.0.tgz
-rw-r--r--. 1 gashcrumb gashcrumb 2266355 Jul  3 14:55 internal-backstage-plugin-simple-chat-dynamic-0.1.0.tgz
```

Make note of or copy the integrity hashes, as these will be needed later when configuring Developer Hub on OpenShift.

#### Deployment Step 3

Now that the files are ready to deploy a new build can be created on OpenShift.  Make sure to use `oc project` to first switch the the same project that Developer Hub is running in.  Use the `02-create-plugin-registry.sh` script to create the build, start it and then start a new app using the built image stream:

```bash
bash ./02-create-plugin-registry.sh
```

Once the script is complete, have a look in the OpenShift console Topology view and there should be a new app running called "plugin-registry".  

#### Deployment Step 4

Create a custom configuration for Developer Hub called `app-config-rhdh` by creating a new `ConfigMap` with the following contents, however update the `baseUrl` and `origin` settings shown as needed:

> IT IS INCREDIBLY IMPORTANT THAT THE URLS IN THIS CONFIGURATION ARE CORRECT!!!

```yaml
kind: ConfigMap
apiVersion: v1
metadata:
  name: app-config-rhdh
data:
  app-config-rhdh.yaml: |-

    app:
      title: Red Hat Developer Hub - Getting Started
      # Be sure to use the correct url here, the URL given is an example
      baseUrl: https://backstage-developer-hub-example.apps-crc.testing
    backend:
      baseUrl: https://backstage-developer-hub-example.apps-crc.testing
      cors:
        origin: https://backstage-developer-hub-example.apps-crc.testing

    auth:
      environment: development
      providers:
        guest:
          dangerouslyAllowOutsideDevelopment: true
    dynamicPlugins:
      frontend:
        internal.backstage-plugin-simple-chat:
          appIcons:
            - name: chatIcon
              importName: ChatIcon
          dynamicRoutes:
            - path: /simple-chat
              importName: SimpleChatPage
              menuItem:
                text: 'Simple Chat'
                icon: chatIcon
```

#### Deployment Step 5

Create a custom dynamic plugin configuration for Developer Hub called `dynamic-plugins-rhdh` by creating another `ConfigMap` with the following contents, however be sure to update the integrity hashes to match the ones printed out by the `01-stage-dynamic-plugins.sh` script:

```yaml
kind: ConfigMap
apiVersion: v1
metadata:
  name: dynamic-plugins-rhdh
data:
  dynamic-plugins.yaml: |
    includes:
      - dynamic-plugins.default.yaml
    plugins:
      - package: 'http://plugin-registry:8080/internal-backstage-plugin-simple-chat-backend-dynamic-0.1.0.tgz'
        disabled: false
        integrity: 'sha512-mwHcJV0Gx6+GHuvqxpJsw9Gzn/8H5AjoGQ2DlMY4ntntAhdpFr/o5IZO5bOri41R14ocDg3KUqDxaZY/4AWSLg=='
      - package: 'http://plugin-registry:8080/internal-backstage-plugin-simple-chat-dynamic-0.1.0.tgz'
        disabled: false
        integrity: 'sha512-t5HcciQFHsaSjjkiV5Ri1XqAsww9pdJy5zRRrOv8ddGdK1VXGe1ec2+WyDSkguZz1y3UDdaK3mW7asRanWXFOQ=='
```

__Watch out for the quotes!__

#### Deployment Step 6

Now update the operator `CustomResource` to load these two ConfigMaps as configuration for DeveloperHub:

```yaml
spec:
  application:
    appConfig:
      configMaps:
        - name: app-config-rhdh
      mountPath: /opt/app-root/src
    dynamicPluginsConfigMapName: dynamic-plugins-rhdh
    extraFiles:
      mountPath: /opt/app-root/src
    replicas: 1
    route:
      enabled: true
  database:
    enableLocalDb: true
```

At this point clicking `Save` should cause the operator to redeploy Developer Hub.  Wait patiently while OpenShift redeploys Developer Hub.

If everything has worked properly the new instance of Developer Hub should contain a "Simple Chat" entry in the sidebar with an icon, clicking on this entry should reveal the chat UI, and it should be possible to send chat messages and view those messages even after a page refresh.

#### Appendix

### Development Loop

If there's a need to rebuild the plugins and redeploy the existing scripts can be used.  The development loop at this point looks like:

Rebuild everything:

```bash
yarn install && yarn run tsc && yarn run build:all && yarn run export-dynamic
```

Stage the `.tar.gz` files:

```bash
bash ./01-stage-dynamic-plugins.sh
```

Update the image:

```bash
bash ./03-update-plugin-registry.sh
```

### Migrate generated app to Yarn v3

Out of the box the `create-app` command sets up a Yarn v1 project, which quickly becomes troublesome as this version is almost unmaintained.  A good option is to migrate the project to Yarn v3 as discussed in the Backstage documentation [here](https://backstage.io/docs/tutorials/yarn-migration/).  This project has been migrated to use Yarn v3 now.

### Using a container image for local development

> Note: While it is possible to run Red Hat Developer Hub outside of Openshift using podman for local development purposes, this method of running Developer Hub is not currently supported for production deployments; only a Red Hat Developer Hub instance installed via the Helm chart or operator is supported for production usage

It's possible to run the RHDH container locally and is handy for developing dynamic plugin.  First extract each .tgz file under the `deploy` directory, each time rename the `package` directory to the plugin name.  Then remove the .tgz files, so the contents of the deploy directory would look like:

```text
internal-backstage-plugin-simple-chat-backend-dynamic
internal-backstage-plugin-simple-chat-dynamic
```

Then use the `appendix-run-container.sh` script to start Developer Hub:

```bash
bash ./appendix-run-container.sh
```

The app should be available at http://localhost:7007 and the Simple Chat plugin should be loaded and available on the sidebar after logging in as guest.
