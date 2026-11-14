## OpenPencil

[OpenPencil](https://openpencil.dev) is an open-source design editor that runs in your browser. This app runs **OpenPencil Cloud**, the self-hosted server, which stores projects on your own machine and adds accounts, version history, share links and live collaboration.

> **Beta:** OpenPencil Cloud first shipped in 0.17.0, which is still in beta. This app uses `0.17.0-beta.4` with one patch so the editor can use your server over plain HTTP on your home network.

### What gets installed

| Service | Purpose |
| --- | --- |
| OpenPencil Cloud | The editor, the API and the sign-in/account pages |
| PostgreSQL 17 | Accounts, workspaces and document revisions |
| SeaweedFS | S3-compatible object storage for project files |
| Mailpit | A built-in inbox for sign-up and password-reset emails |
| nginx | Serves the editor and storage from one address |

Everything stays on your server. Nothing needs a public domain or an outside email or login provider.

### Before you start: HTTPS

The editor relies on browser features (Web Crypto) that only work in a **secure context**: HTTPS, or `localhost`. Over plain `http://<server-ip>:8787` the page loads, but opening and saving cloud documents fails. Choose one of these:

- **Expose the app on a domain** in Runtipi, with a valid certificate. The app picks up the new address automatically after a restart.
- **LAN or VPN without HTTPS:** in Chrome, Edge or Brave, open `chrome://flags/#unsafely-treat-insecure-origin-as-secure`, add `http://<server-ip>:8787`, and relaunch the browser. Do this on each device you use.

Runtipi's local `*.tipi.lan` address is **not** supported. The OpenPencil server has to reach its own storage at the browser's address, and it won't trust that self-signed certificate.

### First sign-in

1. Open the app and choose **Sign up**.
2. Open `<app address>/mailpit/` and sign in as **mail** with the inbox password you set at install. Click the verification link in the email.
3. Sign in to OpenPencil.

Once everyone has an account, set **Account sign-up** to **Closed** in the app's settings.

### Saving

Save a design to your server once with **Save** or **File → Save to…**, and choose your server. From then on, it saves automatically about 3 seconds after each change. (**Auto-save to local file** in the File menu is for files on your own computer, not your server.)

### Keeping documents on another drive

By default, documents live in Runtipi's app-data folder. To keep them somewhere else, such as a large HDD, set **Storage folder** in the app's settings to a folder on that drive, e.g. `/mnt/hdd/openpencil`, and save. Runtipi itself stays where it is.

- On the next start, your existing documents and accounts are copied into that folder, and from then on everything is saved there. The old copy stays in app-data until you delete it.
- The drive must be mounted inside the Runtipi server (the VM or machine running Runtipi), permanently via `/etc/fstab`. If it isn't mounted, the app refuses to start rather than save to the system disk.
- Clearing the setting or pointing it at an empty folder later doesn't move anything back. The app refuses to start so it never opens an out-of-date copy. Copy the folder's contents yourself first.
- Uninstalling the app doesn't delete the storage folder. Before you reinstall, move that folder aside: a reinstall creates new passwords that won't open the old database.

### Good to know

- Use exactly the address Runtipi shows for the app. Sign-in is tied to that address, so a different hostname or port for the same server is rejected.
- If you change the port or domain, restart the app. Its config is rebuilt from your settings on every start.
- Back up the whole app-data folder, plus the storage folder if you set one, while the app is stopped. The database and the files belong together.
- Passkeys are off because they don't work on a bare IP address. Authenticator-app two-factor (TOTP) is available.
- Server administrator tools (the `admin` command) aren't included in the image, so this app has no deployment administrator. Workspace roles work as normal.

### Links

- Website: https://openpencil.dev
- Source: https://github.com/open-pencil/open-pencil
- This app's server image is built from the fork at https://github.com/chrisknsmn-proxmox/open-pencil
- Self-hosting guide: https://openpencil.dev/reference/self-hosting-cloud

OpenPencil is MIT licensed. The Cloud server is licensed under Apache-2.0 and MIT.
