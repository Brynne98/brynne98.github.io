# Where this lives

- **GitHub**, public: `Brynne98/brynne98.github.io`, Brynne's personal account.
  Not GitLab.
- Remote is SSH (`git@github.com:Brynne98/brynne98.github.io.git`). The key
  decides the account; this machine has two GitHub logins, so an HTTPS remote
  would authenticate as whichever one `gh` happens to be switched to.
- Identity comes from `~/.gitconfig-personal` through an `includeIf` on
  `~/Projects/personal/`.
- Branch: `main`.
- Served by GitHub Pages at `https://brynne98.github.io/`, built with Jekyll
  from `main`.
- Issues: there is no Plane project for this repo. Changes belong to the app
  they serve: Health Switch RSA (`HSR-*`) or Hydro (`HYDRO-*`).

# Releasing

`git push origin main` publishes the site; GitHub Pages rebuilds it within a
minute or two. There is no other step.

Never push without asking Brynne first, every time. A push is public at once,
and several of these files are read by Apple, Google and the App Store.

# What is here

- Health Switch RSA moved to https://healthswitch.co.za on 7 Nov 2026
  (HSR-158): home, privacy, terms and PAIA live in `website/` of the app
  repo, served by Cloudflare Pages. `health-switch/` here was deleted,
  including `n/`, so old shared /health-switch/n/ links now 404.
- `hydro/`: the Hydro home, privacy and terms pages.
- `prince-todo/`: the Prince TODO pages, and `join/`, a family invite link.
- `.well-known/apple-app-site-association`: tells iOS which links open the
  Health Switch or Prince TODO app instead of the browser. Its Health Switch
  entry points at the deleted /health-switch/n/; left in place, harmless. No file extension, and Jekyll only
  publishes it because `_config.yml` includes `.well-known`. Apple fetches it
  through its own CDN; after a change, check
  `https://app-site-association.cdn-apple.com/a/v1/brynne98.github.io`.
- `app-ads.txt`: AdMob's seller file for the apps' ads. It must stay at the
  site root.

Changing a path here can break a link that is already in the App Store listing,
inside a shipped build, or in a message someone shared. Check the apps for the
old address before moving or renaming anything.
