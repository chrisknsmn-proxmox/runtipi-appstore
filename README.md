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
| [OpenPencil](https://github.com/open-pencil/open-pencil) | Self-hosted, browser-based design editor with cloud project storage (beta). | 8787 |

## OpenPencil

OpenPencil Cloud runs as seven containers: the OpenPencil server, PostgreSQL, SeaweedFS (S3 storage), Mailpit (a built-in inbox), an nginx front door, and two one-shot jobs. One job writes the config files and the other creates the storage bucket. Browsers upload files straight to storage, so nginx serves the editor and the bucket (`/openpencil-objects/`) from the same address. On every start, the config job rebuilds `openpencil-cloud.toml` from the app's Runtipi settings. Secrets stay in environment variables.

**Server image:** upstream's image, `ghcr.io/open-pencil/cloud`, can't be pulled anonymously, so this app uses `ghcr.io/chrisknsmn-proxmox/openpencil-cloud` instead. That image is built from the fork [chrisknsmn-proxmox/open-pencil](https://github.com/chrisknsmn-proxmox/open-pencil) by the fork's **Cloud image** workflow. It's upstream's own workflow, changed only to publish under this name.

The app uses `0.17.0-beta.4-lan.1`, built from the fork's `runtipi/v0.17.0-beta.4` branch: upstream's `v0.17.0-beta.4` plus one patch (`src/app/cloud/servers/address.ts`) that lets the editor use the server it was loaded from over plain HTTP. Upstream only accepts HTTPS or `localhost` servers, so on a LAN address the editor fails with "Cloud server address is invalid" and can't sign in or save. For a new upstream version, rebase that branch onto the new tag and tag the result `v<version>-lan.1`.

To build a version, push its tag to the fork, then go to **Actions → Cloud image → Run workflow** in the fork and enter that tag:

```sh
# in a clone of the fork, with upstream as a remote
git fetch upstream tag v0.17.0-beta.4 --no-tags
git push origin v0.17.0-beta.4
```

The image is tagged with the version minus the `v`, e.g. `0.17.0-beta.4`. The package must be **Public** (package settings → Change visibility) or Runtipi can't pull it. Keep the fork's `build.yml` workflow disabled: it builds the desktop apps for every `v*` tag you push.

**Refresh the store:** in Runtipi, go to **Settings → Actions → Update App Stores** and click **Update**.

**Install:** open OpenPencil in the app store and install it. The only required setting is **Mail inbox password**. **Account sign-up** defaults to *Open*. The auth secret, database password and storage keys are generated for you. OpenPencil and Ignis are independent and can be installed separately.

**Access:** the editor needs a secure context (HTTPS or `localhost`). Plain `http://<server-ip>:8787` loads, but cloud documents fail to open or save. Use one of these:
- Expose the app on a domain with a valid certificate in Runtipi, then restart the app.
- For LAN or WireGuard without TLS, add `http://<server-ip>:8787` to `chrome://flags/#unsafely-treat-insecure-origin-as-secure` on each device, set it to **Enabled** and relaunch. Plain HTTP on a LAN address also needs the fork's patch, which the image already has (see **Server image**).

Runtipi's local `*.tipi.lan` address isn't supported: the server can't verify its self-signed certificate when it reaches its own storage at that address. Always use the exact address Runtipi shows.

**First account:** sign up, then open `<app address>/mailpit/`, log in as `mail` with your inbox password, and click the verification link. When everyone has an account, set sign-up to *Closed* in the app settings.

**Storage folder:** by default the database and the bucket live in `app-data/<store>/openpencil/data`. The optional **Storage folder** setting (`OPENPENCIL_STORAGE_DIR`) moves the bucket, the design files, to `<folder>/seaweedfs` on another drive. The database always stays in app-data. PostgreSQL needs real Unix ownership and `0700` permissions, which NTFS and exFAT can't give. SeaweedFS runs `weed` directly as root, bypassing the image's entrypoint, which would `chown` `/data` to uid 1000 and drop to it, so it works on any filesystem. The drive must be mounted inside the Runtipi host. Proxmox seeing it isn't enough. On every start, storage waits for the config job:
- If the storage folder is on the same filesystem as app-data, the job fails, so an unmounted drive stops the app instead of filling the system disk.
- If `<folder>/seaweedfs` is empty, the job copies app-data's `data/seaweedfs` there (`cp -a` into `.copying/`, then renamed into place). The old storage container has already stopped by then, because Runtipi recreates every container.
- Once storage is healthy and the bucket exists, the bucket job records the folder in app-data's `data/MOVED_TO`. After that, if the setting is cleared or points at an empty folder, the config job fails instead of starting an out-of-date or empty copy. Deleting `MOVED_TO` overrides this. A folder that never worked isn't recorded, so clearing the setting simply goes back to app-data. Uninstalling doesn't delete the storage folder, but a reinstall generates new secrets that can't open the old database, so move the folder aside first.

**Health:** every long-running container should report `healthy`, and `/ready` succeeds only when the database and storage both work:

```sh
docker ps --filter name=openpencil --format 'table {{.Names}}\t{{.Status}}'
curl -s http://<server-ip>:8787/ready   # {"status":"ready",...}
```

**Backup:** the database and the bucket must be backed up together. Stop the app in Runtipi, archive its whole app-data folder (and the storage folder, if set), then start it again:

```sh
cd /path/to/runtipi/app-data/<store>/openpencil
tar czf ~/openpencil-$(date +%F).tar.gz data config
# with a storage folder, e.g. /mnt/hdd/openpencil:
sudo tar czf ~/openpencil-data-$(date +%F).tar.gz -C /mnt/hdd openpencil
```

**Update:** take a backup first. Database migrations only run forward, so rolling back means restoring the backup. Build the new version's image in the fork (see **Server image**). Then bump the `openpencil-server` image tag here and run `bun scripts/update-config.ts apps/openpencil/docker-compose.yml --service=openpencil-server`. The main service is nginx, so without `--service` the version would come from nginx's tag. Push, then use **Update** on the app in Runtipi. Data in `app-data/<store>/openpencil/data` is kept.

**Limitations:**
- 0.17.0 is a beta.
- Email only reaches the built-in Mailpit inbox. No SMTP relay is configured.
- Passkeys are disabled because they don't work on bare IP addresses.
- The image doesn't include the `admin` CLI, so there's no deployment administrator. *Approval* sign-up mode is therefore not offered.
- All requests reach OpenPencil from nginx, so sign-in rate limits apply to the whole server rather than per client.

## Development

```sh
bun install        # or: npm install
bun test           # or: npx bun test
```

Tests check that each app has the required files, a valid `config.json`, and a `docker-compose.yml` that uses `x-runtipi` schema version 2 with exactly one main service, pins every image to a tag other than `latest`, and has no top-level `version` key. They also run in GitHub Actions on every push and pull request.

### Adding an app

1. Create `apps/<app-id>/` with `config.json`, `docker-compose.yml`, `metadata/description.md` and `metadata/logo.jpg`. Use an unused port and a pinned image tag, never `latest`.
2. Set `created_at` and `updated_at` to the current time in milliseconds, and start `tipi_version` at 1.
3. Run `bun test`.

### Updating an app

After bumping the image tag in `docker-compose.yml`, run:

```sh
bun scripts/update-config.ts apps/<app-id>/docker-compose.yml
```

This syncs `version` in `config.json` with the main service's image tag, increments `tipi_version` and updates `updated_at`. Runtipi uses `tipi_version` to detect that an update is available.
