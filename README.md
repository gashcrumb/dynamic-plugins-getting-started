# Getting Started with Dynamic Plugins for Red Hat Developer Hub

This repository is a small **simple-chat** dynamic plugin example aligned with
**Backstage 1.52** / current RHDH `next`. The frontend plugin targets the
**Backstage new frontend system** only and ships standard Module Federation
assets (no legacy `createPlugin` frontend packaging).

For general Backstage plugin development background, see the
[Backstage documentation](https://backstage.io/docs/plugins/create-a-plugin).

## Compatibility

| RHDH / image | Backstage | Node |
| :----------: | :-------: | :--: |
| `next` (BS 1.52 line) | **1.52.0** | 22 / 24 |

Package versions are pinned to match [redhat-developer/rhdh](https://github.com/redhat-developer/rhdh)
at Backstage `1.52.0`.

## Prerequisites

- **Node.js** 22 or 24
- **Yarn** 4.x (`corepack enable`)
- **Podman** (or Docker) for local container testing

## Quick start

```bash
yarn install
yarn tsc
yarn build

# Clean and export dynamic plugin packages
rm -rf ./dynamic-plugins-root/*
yarn export-plugins

# Run against RHDH with the new frontend system enabled
./run-example.sh
```

Open [http://localhost:7007/simple-chat](http://localhost:7007/simple-chat).

`run-example.sh` sets the temporary NFS enablement variables:

- `APP_CONFIG_app_packageName=app-next`
- `ENABLE_STANDARD_MODULE_FEDERATION=true`

Override the image with `APP_IMAGE=...` if needed (default:
`quay.io/rhdh-community/rhdh:next`).

### Local plugin start (no container)

```bash
yarn workspace @red-hat-developer-hub/backstage-plugin-simple-chat start
```

This uses `@backstage/frontend-defaults` `createApp` with a mock chat API.
BUI styles are loaded from `dev/index.tsx` via `@backstage/ui/css/styles.css`
(the host app is expected to provide those styles in real deployments).

## Plugin layout

```
plugins/simple-chat/          # NFS frontend (src/alpha.tsx)
plugins/simple-chat-backend/  # New backend system plugin
```

The frontend package exposes the new frontend system entry via `./alpha` and
exports standard Module Federation assets (`dist/remoteEntry.js`). Extensions
(page + API; nav is inferred from the page `title`/`icon`) are declared in
`createFrontendPlugin` — no `dynamicPlugins.frontend` YAML wiring is required
under `app-next`.

## Packaging for OCI / rhdh-local

```bash
# Local export (already covered above)
yarn export-plugins

# Or package as OCI
export QUAY_USERNAME=<your-quay-username>
npx -y @red-hat-developer-hub/cli@1.10.7 plugin package \
  --tag quay.io/$QUAY_USERNAME/simple-chat:latest
podman push quay.io/$QUAY_USERNAME/simple-chat:latest
```

Point [rhdh-local](https://github.com/redhat-developer/rhdh-local) at the
exported plugins or OCI refs, and enable the new frontend system the same way
(`app.packageName: app-next` + `ENABLE_STANDARD_MODULE_FEDERATION=true`).

## Feature-flag exploration

This branch (`feature-flag-exploration`) is the starting point for declaring a
plugin-level feature flag and verifying it appears under
**Settings → Feature Flags** in RHDH `app-next`.
