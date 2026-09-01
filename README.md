# Jojoo Portfolio

[Jojoo](https://jojoo.cc/) is a public personal portfolio and AI engineering blog. It presents verified experience and project evidence first, with AI chat as a secondary way to explore the same public material.

## Public sections

- **Home** — profile, representative work, skills, experience and education
- **Blog** — source-backed articles about coding agents, harnesses and AI engineering
- **Chat** — a public entry for asking about approved portfolio facts
- **Thoughts** — shorter technical notes and observations

## Deployment

This repository contains the static GitHub Pages output served from the `main` branch:

- `CNAME` maps the Pages site to `jojoo.cc`.
- `.nojekyll` keeps the generated output unchanged.
- `index.html` and `404.html` bootstrap the site.
- `blog/`, `chat/`, `thoughts/` and their assets contain the public routes.

Only explicitly approved public content belongs in this repository. Third-party attributions are recorded in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).
