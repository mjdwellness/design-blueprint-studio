# Desktop app (.dmg / .exe)

The desktop app is Electron loading the live web app in a plain window —
`electron/main.cjs` is about 25 lines, no separate desktop codebase to
maintain. This is the same architecture Slack, Discord, and VS Code use for
their desktop builds, and it's already fully wired up in this repo
(`electron/`, the `installer:mac` / `installer:win` scripts, and the
`Desktop installers` GitHub Actions workflow) — nothing new needed there.

## Why I couldn't build the .dmg directly

I tried, from the connected computer. It failed — not from a bug, but
because that shell runs in a sandboxed **Linux** VM on the Mac, not on
macOS itself (`uname -a` there reports Linux). Building a real `.dmg`
requires Apple's own `hdiutil`, which only exists on macOS. This isn't
something I can work around; it needs a real Mac.

## Getting a real .dmg / .exe

The GitHub Actions workflow already handles this correctly — it runs the
macOS build job on GitHub's actual `macos-latest` runners (real macOS) and
the Windows build on `windows-latest`. To run it:

1. Open the repo on GitHub → **Actions** tab → **Desktop installers**
   workflow → **Run workflow**.
2. Optionally fill in `app_url` with the live Azure URL (once
   `docs/azure-deployment.md` is done) — leave it blank to build against the
   current Lovable preview.
3. Once it finishes (a few minutes), open the run and download the
   `MJD-Wellness-macOS-Installer` (contains the `.dmg`) and
   `MJD-Wellness-Windows-Installer` (contains the `.exe`) artifacts.

This can also be run from a Mac terminal directly, without GitHub Actions,
using the same commands the workflow runs:

```
bun install --frozen-lockfile
APP_URL=https://<your-azure-app>.azurecontainerapps.io bun run installer:mac
```

The `.dmg` lands in `desktop-installers/`.

## Distribution beyond a downloaded .dmg

The `.dmg` this produces is unsigned — macOS will show an "unidentified
developer" warning on first open, which is normal for a build like this and
doesn't block installation (right-click → Open once). Two further steps,
each needing something only MJD can provide, get past that:

- **Code signing** — needs an Apple Developer Program membership ($99/yr)
  and a Developer ID Application certificate. Once MJD has that, I can wire
  the signing identity into `electron-builder`'s `mac.identity` config so
  the workflow produces a signed, notarized `.dmg` with no warning.
- **Mac App Store** — a materially different, stricter path (sandboxing
  requirements, Apple's review process, a separate Apple Developer
  Program enrollment) than a signed `.dmg` distributed directly. Worth
  planning separately if that's still wanted, rather than folding into this.
