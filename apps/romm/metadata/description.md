## RomM

[RomM](https://romm.app) (ROM Manager) is a self-hosted game library. It scans your games, adds cover art and descriptions, and lets you play them in the browser.

Games run **on the device you play on**, not on the server. RomM sends the game and a WebAssembly build of the emulator to your browser, so your laptop or phone does the emulation and the server only stores and serves files.

### What gets installed

| Service | Purpose |
| --- | --- |
| RomM | The library, the in-browser player, and background scans |
| MariaDB 11.8 | Your library, users, saves and play history |

### What you can play in the browser

- **Nintendo:** NES, Famicom Disk System, SNES, N64, Game Boy, Game Boy Color, Game Boy Advance, DS, Virtual Boy
- **Sega:** Master System, Genesis / Mega Drive, Game Gear, Sega CD, 32X, Saturn
- **Sony:** PlayStation, PSP
- **Arcade:** MAME 2003 and FinalBurn Neo romsets, Neo Geo
- **Atari:** 2600, 5200, 7800, Lynx, Jaguar
- **Computers:** DOS, Windows 3.x / 9x (js-dos), Commodore 64 / 128 / VIC-20, Amiga, Amstrad CPC, ZX Spectrum
- **Other:** TurboGrafx-16 / PC Engine, Neo Geo Pocket, WonderSwan, 3DO, ColecoVision, PC-FX, Flash games (Ruffle), PICO-8, RPG Maker 2000 / 2003

Anything up to the 16-bit era, arcade and PlayStation runs smoothly on almost any device. N64, DS and PSP want a reasonably recent laptop. GameCube, Wii, PS2 and newer can be stored and downloaded, but can't be played in a browser.

### HTTPS for PSP, DOS and Windows games

**PSP**, **DOS** and **Windows 3.x / 9x** games use multi-threaded emulators, which browsers only allow on HTTPS (or `localhost`). Everything else plays fine over plain `http://<server-ip>:8178`. To play those games, use one of these:

- **Expose the app on a domain** in Runtipi, with a valid certificate.
- **LAN or VPN without HTTPS:** in Chrome, Edge or Brave, open `chrome://flags/#unsafely-treat-insecure-origin-as-secure`, add `http://<server-ip>:8178`, and relaunch the browser. Do this on each device you use.

Without one of these, RomM shows an "HTTPS required" message when you press Play on those games.

### First sign-in

Open the app. A setup wizard creates the first account, which is the administrator. You can add other people later from **Administration**.

### Adding games

You can upload games from the web interface, or copy them into the library folder:

```
<library>/
├─ roms/
│  ├─ snes/
│  │  └─ Super Mario World (USA).sfc
│  ├─ gba/
│  ├─ psx/
│  │  └─ Final Fantasy VII/          ← one folder per multi-disc game
│  │     ├─ FF7 (Disc 1).chd
│  │     └─ FF7 (Disc 2).chd
│  └─ arcade/
└─ bios/
   └─ psx/
      └─ scph5501.bin
```

The library folder is Runtipi's `media/data/roms` unless you set **ROM library folder** in the app settings, so by default SNES games go in `media/data/roms/roms/snes/`. The drive must be mounted inside the Runtipi server.

Folder names must match RomM's platform names exactly, e.g. `nes`, `snes`, `n64`, `gb`, `gbc`, `gba`, `nds`, `genesis`, `psx`, `psp`, `arcade`, `dos` and `browser` (Flash). See the [supported platforms list](https://docs.romm.app/latest/platforms/supported-platforms/) for the rest.

After copying files, run a scan in RomM so it picks them up.

Some systems need a BIOS file in `bios/<platform>/`, e.g. Sega CD, 3DO and the Famicom Disk System. PlayStation games run without one, but are more compatible with one.

### Cover art and descriptions

Out of the box, RomM identifies games through [Hasheous](https://hasheous.org), which matches each file by its hash and needs no account. It works best with clean, unmodified dumps. Romhacks and renamed files may come up unmatched; you can match them by hand from the game's page.

For better coverage, add any of the optional keys in the app settings. See [RomM's metadata guide](https://docs.romm.app/latest/getting-started/metadata-providers/) for how to get them.

- **ScreenScraper** (free account): box art, screenshots and manuals
- **RetroAchievements** (free account): achievement progress
- **SteamGridDB** (free account): alternative cover art
- **IGDB** (Twitch developer app): related games and more screenshots

After adding a key, run a scan with that provider selected to update games you already have.
