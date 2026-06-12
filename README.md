# Dynamic Plugins Getting Started (RHDH 1.5 config probe)

This repository is a small **simple-chat** dynamic plugin example, currently pinned to the package versions shipped with **Red Hat Developer Hub 1.5** (Backstage **1.35.1**). It exists on the `config-leak-check-1-5` branch to investigate whether reading backend configuration inside an HTTP request handler causes per-request memory growth or repeated config reloads.

The backend plugin reads several config values on every `GET /api/simple-chat` request. The frontend displays live probe metrics above the chat window so you can watch heap usage and config stability in semi-real time.

> **Preliminary result:** So far, testing has not shown excessive or alarming memory growth under normal polling, curl load, or repeated `touch` of the mounted `app-config.yaml`.

For general Backstage plugin development background, see the [Backstage documentation](https://backstage.io/docs/plugins/create-a-plugin).

## Compatibility

Package versions are pinned to match the RHDH `1.5.1` tag (see `packages/backend/package.json` and `packages/app/package.json` in [redhat-developer/rhdh](https://github.com/redhat-developer/rhdh) at that tag).

| RHDH version | Backstage version | Branch |
| :----------: | :---------------: | :----- |
| 1.5.x        | 1.35.1            | `config-leak-check-1-5` |

Key pinned packages:

| Package | Version |
| ------- | ------- |
| `@backstage/backend-plugin-api` | 1.1.1 |
| `@backstage/config` | 1.3.2 |
| `@backstage/cli` | 0.29.6 |
| `@backstage/core-plugin-api` | 1.10.3 |

The `alpha.tsx` new-frontend-system entry point is excluded from the TypeScript build on this branch because RHDH 1.5 uses the classic frontend system.

## Prerequisites

- **Node.js** 20
- **Yarn** 3.x (`corepack enable`)
- **Podman** (or Docker) for local container testing
- **python3** and **curl** (used by helper scripts)
- **jq** (optional, for inspecting probe JSON from the curl script)

## Quick start

From the repository root:

```bash
yarn install
yarn tsc
yarn build
yarn export-plugins
./run-example.sh
```

Open the app at [http://localhost:7007/simple-chat](http://localhost:7007/simple-chat).

The **Backend config / memory probe** card at the top of the page refreshes every second. Below it is the chat UI.

### What the probe shows

Each `GET /api/simple-chat` response includes a `_configProbe` object. The UI surfaces:

| Field | Meaning |
| ----- | ------- |
| **Heap** | `process.memoryUsage().heapUsed` in MB at response time |
| **Reads** | Cumulative count of config reads across all GET requests |
| **Config ref** | Whether the root `Config` object injected at plugin init is still the same reference |

If the config reference changes (for example after a config reload), the chip turns amber and a warning banner appears. The backend also logs a warning when this happens.

Config keys read on every GET:

- `simpleChat.configProbeString`
- `app.title`
- `backend.baseUrl`
- `auth.environment`

The probe string is defined in the root `app-config.yaml` under `simpleChat.configProbeString`.

## Build and export

### Install and compile

```bash
yarn install
yarn tsc
yarn build
```

### Export dynamic plugins

The root `package.json` includes an `export-plugins` script that packages both plugins into `./dynamic-plugins-root/` using the Janus CLI version appropriate for RHDH 1.5:

```bash
# Recommended: clean stale artifacts first
rm -rf ./dynamic-plugins-root/*

yarn export-plugins
```

This runs:

```bash
npx -y @janus-idp/cli@3.2.0 package package-dynamic-plugins \
  --force \
  --export-to ./dynamic-plugins-root/
```

## Run locally with Podman

`run-example.sh` starts an RHDH container with bind mounts for the exported plugins and configuration files.

Defaults:

| Setting | Default |
| ------- | ------- |
| Container image | `quay.io/rhdh-community/rhdh:1.5.3` |
| Plugins directory | `./dynamic-plugins-root` |
| App config | `./app-config.yaml` |
| Frontend plugin config | `./plugins/simple-chat/app-config.yaml` |
| Port | `7007` |

```bash
./run-example.sh
```

Override any value with environment variables:

```bash
APP_IMAGE=quay.io/rhdh-community/rhdh:1.5.1 \
LOG_LEVEL=debug \
./run-example.sh
```

Guest authentication is enabled in `app-config.yaml` for local testing.

## Load-testing scripts

Two helper scripts live under `scripts/` for stressing the backend and triggering config file watcher behaviour.

### `scripts/ping-simple-chat.sh`

Hammer `GET /api/simple-chat` with a guest token:

```bash
./scripts/ping-simple-chat.sh

# More aggressive
COUNT=5000 SLEEP_MS=0 ./scripts/ping-simple-chat.sh

# Print probe JSON on every request
SHOW_PROBE=true COUNT=5 ./scripts/ping-simple-chat.sh
```

| Variable | Default | Description |
| -------- | ------- | ----------- |
| `BASE_URL` | `http://localhost:7007` | RHDH base URL |
| `COUNT` | `1000` | Number of requests |
| `SLEEP_MS` | `0` | Delay between requests |
| `LOG_EVERY` | `100` | Progress log interval |
| `SHOW_PROBE` | `false` | Print `_configProbe` JSON |

Watch container memory in another terminal:

```bash
watch -n1 'podman stats --no-stream'
```

### `scripts/touch-app-config.sh`

Repeatedly `touch` the mounted `app-config.yaml` to bump its mtime and exercise config reload watchers:

```bash
./scripts/touch-app-config.sh

# Touch every 5 seconds, 100 times
COUNT=100 SLEEP_MS=5000 ./scripts/touch-app-config.sh

# Run until Ctrl+C
COUNT=0 SLEEP_MS=1000 ./scripts/touch-app-config.sh
```

| Variable | Default | Description |
| -------- | ------- | ----------- |
| `APP_CONFIG` | `<repo>/app-config.yaml` | File to touch |
| `COUNT` | `1000` | Number of touches (`0` = until interrupted) |
| `SLEEP_MS` | `0` | Delay between touches |
| `LOG_EVERY` | `100` | Progress log interval |

Because `app-config.yaml` is bind-mounted into the container, touches on the host update the same inode visible inside the container. Use `touch` (in-place update), not delete-and-recreate, when testing reload behaviour.

## Suggested experiment workflow

1. Build, export, and start the container (`yarn build && yarn export-plugins && ./run-example.sh`).
2. Open [http://localhost:7007/simple-chat](http://localhost:7007/simple-chat) and watch the probe card.
3. Optionally run `./scripts/ping-simple-chat.sh` in another terminal to add request load.
4. Optionally run `./scripts/touch-app-config.sh` to trigger config file changes.
5. Observe whether **Heap** climbs steadily, whether **Config ref** stays stable, and whether **Reads** increments as expected.

### Interpreting results

| Observation | Likely meaning |
| ----------- | -------------- |
| Heap flat, config ref stable | Config reads appear cheap; no reload |
| Heap climbs, config ref stable | Possible per-request allocation during reads |
| Config ref changes | Root `Config` object was replaced (reload) |
| Heap jumps after `touch` | May correlate with config reload processing |

## Project layout

```
.
├── app-config.yaml              # RHDH app config (includes simpleChat probe string)
├── backstage.json               # Backstage 1.35.1
├── dynamic-plugins-root/        # Exported plugins (generated, gitignored)
├── plugins/
│   ├── simple-chat/             # Frontend plugin + probe UI
│   └── simple-chat-backend/     # Backend plugin + config probe in GET handler
├── run-example.sh               # Start RHDH in Podman with local mounts
└── scripts/
    ├── ping-simple-chat.sh      # Curl load generator
    └── touch-app-config.sh      # Config mtime bump loop
```

## Deploying to OpenShift (optional)

For cluster deployment, package plugins as OCI artifacts and configure Developer Hub via a ConfigMap. On RHDH 1.5, use the Janus CLI rather than the newer `@red-hat-developer-hub/cli`:

```bash
yarn build

npx -y @janus-idp/cli@3.2.0 package package-dynamic-plugins \
  --tag quay.io/<your-org>/simple-chat:latest

podman push quay.io/<your-org>/simple-chat:latest
```

Paste the `plugins:` YAML block from the CLI output into your `dynamic-plugins` ConfigMap. Refer to the [RHDH dynamic plugins documentation](https://docs.redhat.com/en/documentation/red_hat_developer_hub) for your installed version.

## Other local testing options

You can also point `yarn export-plugins` output at [rhdh-local](https://github.com/redhat-developer/rhdh-local) or any RHDH 1.5.x installation that supports local dynamic plugin directories. The probe backend and UI work the same way as long as the simple-chat plugins are loaded and guest auth is available.
