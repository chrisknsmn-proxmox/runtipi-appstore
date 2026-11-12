## OpenPencil

[OpenPencil](https://openpencil.dev) is an open-source design editor that runs in your browser. This app runs **OpenPencil Cloud**, the self-hosted server, which stores projects on your own machine and adds accounts, version history, share links and live collaboration.

> **Beta:** OpenPencil Cloud first shipped in 0.17.0, which is still in beta. This app uses `0.17.0-beta.4`.

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

### Good to know

- Use exactly the address Runtipi shows for the app. Sign-in is tied to that address, so a different hostname or port for the same server is rejected.
- If you change the port or domain, restart the app. Its config is rebuilt from your settings on every start.
- Back up the whole app-data folder while the app is stopped. The database and the files belong together.
- Passkeys are off because they don't work on a bare IP address. Authenticator-app two-factor (TOTP) is available.
- Server administrator tools (the `admin` command) aren't included in the image, so this app has no deployment administrator. Workspace roles work as normal.

### Links

- Website: https://openpencil.dev
- Source: https://github.com/open-pencil/open-pencil
- Self-hosting guide: https://openpencil.dev/reference/self-hosting-cloud

OpenPencil is MIT licensed. The Cloud server is licensed under Apache-2.0 and MIT.
