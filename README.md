# Astro Starter Kit: Minimal

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Android and web match invitations

This repository is the public website for `https://blinddraw.ink`. GitHub Pages publishes Astro's `dist/` on pushes to `main`.

- `public/.well-known/assetlinks.json` must contain the Play app-signing SHA-256 fingerprints for `com.tendonlife.invisibleink`. Keep it synchronized with the Invisible-Ink app repository; do not publish upload or shared debug certificates.
- `public/match/index.html` and `public/match/invite.js` serve six-character Android/web invitations. Existing `/match/<mode>?code=...` links route six-character codes to that landing page, preserving the existing four-digit iOS Game Center flow.
- The browser fallback uses the default Firebase Hosting web game, `https://blind-draw-c6ee2.web.app`. That app must be deployed separately from the marketing site.
- The deployment checks both association files and the invitation landing files in the build output. Check the public URL after deployment: `curl -i https://blinddraw.ink/.well-known/assetlinks.json`.

## Android beta testing portal

The shared tester invitation page is `https://blinddraw.ink/beta/`. It uses the existing Google Group `alpha-android-testers@googlegroups.com` and links to each game's separate Google Play opt-in and installation pages. Add future games to `src/data/beta.mjs`, using their verified Android application IDs and public artwork.

Before sharing the portal publicly, confirm in each app's **Closed testing → Testers** settings that this exact Google Group has been added, and that existing testers have retained eligibility. Copy and compare each track's official opt-in URL with the portal link. Confirm the group accepts new members without manual approval, and keep member emails private. Verify with a non-owner test account that has joined the group, opted in, and installed each active test. Membership by itself does not count as an opt-in. Do not switch existing testers away from an email list until their continued access is verified.

The site does not collect emails, change Play settings, or report a live tester count. It asks for genuine testing and feedback over 14 days. Run `npm run build && node --test tests/beta-portal.test.mjs` to verify the public route, enrollment links, icons, and homepage navigation. The existing GitHub Pages deployment publishes the site after main is updated; review the deployment and public URL before sharing.
