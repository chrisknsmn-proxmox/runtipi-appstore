# Runtipi App Store

A custom [Runtipi](https://runtipi.io) app store.

## Using this app store

In Runtipi, go to **Settings → App Stores → Add app store** and enter this repository's URL:

```
https://github.com/chrisknsmn-proxmox/runtipi-appstore
```

The apps will then appear in the Runtipi app store alongside the official ones.

## Apps

| Name | Description | Port |
| ---- | ----------- | ---- |
| [Ignis](https://github.com/Nystik-gh/ignis) | Run Obsidian as a self-hosted web app. Not remote desktop, an actual web app. | 8287 |

## Repository layout

```
apps/
  <app-id>/
    config.json          # app metadata (id must match the folder name)
    docker-compose.yml   # runtipi dynamic compose (x-runtipi schema_version 2)
    metadata/
      description.md     # shown on the app page
      logo.jpg           # app icon
```

## Development

```sh
bun install        # or: npm install
bun test           # or: npx bun test
```

Tests check that each app has the required files, a valid `config.json`, and a `docker-compose.yml` with no top-level `version` key. They also run in GitHub Actions on every push and pull request.

### Adding an app

1. Create `apps/<app-id>/` with the four files above. Use an unused port and a pinned image tag, never `latest`.
2. Set `created_at` and `updated_at` to the current time in milliseconds, and start `tipi_version` at 1.
3. Run `bun test`.

### Updating an app

After bumping the image tag in `docker-compose.yml`, run:

```sh
bun scripts/update-config.ts apps/<app-id>/docker-compose.yml
```

This syncs `version` in `config.json` with the main service's image tag, increments `tipi_version` and updates `updated_at`. Runtipi uses `tipi_version` to detect that an update is available.
