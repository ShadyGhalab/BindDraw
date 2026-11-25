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

## Invisible Ink Android beta testing

The game-specific invitation page is `https://blinddraw.ink/beta/`. It uses the existing shared Google Group `alpha-android-testers@googlegroups.com` and links only to Invisible Ink's Google Play opt-in and installation pages. Other games should have their own branded pages on their respective websites; they may reuse the same Google Group.

Before sharing, confirm the Invisible Ink closed testing track accepts this exact Google Group, verify its official opt-in URL, and ensure existing testers retain eligibility. Test using a non-owner Google account. Group membership alone does not count as a testing opt-in.

The page does not collect email addresses or change Play settings. It asks for genuine testing and feedback over 14 days. Run `npm run build && node --test tests/beta-portal.test.mjs` to validate the route, game-specific links, artwork, and homepage navigation. The existing GitHub Pages workflow publishes the page after main is updated.

### Localized beta invitations

The beta landing page has 21 language editions matching the game's supported locales. The default `/beta/` page selects a supported browser language; explicit language routes such as `/beta/de/` are stable shareable links and never auto-redirect. Arabic uses RTL layout. Static English and all translated enrollment links work without JavaScript. Update `scripts/beta-content.mjs`, then run `node scripts/generate-beta.mjs` to regenerate the checked-in HTML; `node scripts/generate-beta.mjs --check` verifies freshness. Run the Astro build before the Node tests. Run `node --test tests/beta-portal.test.mjs` to verify language coverage, links, artwork and game isolation. Translation copy is provided in full, but native-speaker review and real-device checks are still recommended.

### Invitation experience

The beta page links directly to Google Groups, Google Play opt-in and installation in separate tabs/apps, and returning group members can go straight to the opt-in page. The self-reported enrollment checklist and manually selected language are stored in browser local storage only; they are never sent to a server and do not verify Google Play status. The checklist is optional, resettable and independent of language. A static QR code encodes the canonical `https://blinddraw.ink/beta/` URL; native sharing, copy and WhatsApp/Telegram links are user-triggered. No external QR service or analytics is used. All translations are in `scripts/beta-content.mjs` and `scripts/beta-invitation.mjs`. Regenerate and check pages with `node scripts/generate-beta.mjs` and `node scripts/generate-beta.mjs --check`. Run `node --test tests/beta-portal.test.mjs tests/beta-interaction.test.mjs` after building Astro to check the static output and interaction behavior. Actual tester access remains dependent on Google Play Console permissions and release status.
