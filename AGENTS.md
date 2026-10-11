# AGENTS.md: how to work on BavarianLemmings

This file overrides the parent `codingWithGPT/AGENTS.md` where they differ. The goal and the
specification are in [vision.md](vision.md).

## Current phase

**Requirements engineering.** No code until the owner has answered the open questions in
`vision.md` section 6 and frozen the specification. Until then, only documents are changed.

## Mission (implementation phase)

Read `vision.md` and understand the goal. Make a plan and implement everything it describes. Make the
decisions yourself and keep working until the whole vision is done and the product works. Ask only
for decisions that are really the owner's (see the parent AGENTS.md).

## Git

- Work directly on `main`. *(The repository currently has an unborn `master`; see vision.md Q6.)*
- Atomic commits with **Conventional Commits** messages (`feat:`, `fix:`, `docs:`, `test:`,
  `build:`, `ci:`, `refactor:`, `chore:`). The message says why.
- **Semantic versioning:** every commit bumps the patch version. Major features bump the minor
  version.
- Every commit is green before it is made: `./localPipeline.sh` passes.
- Push continuously once a remote exists.

## Local pipeline

- Set up `localPipeline.sh` as early as possible. It runs all tests, linting, formatting checks,
  type/static checks, coverage and builds. Later it also runs the end-to-end tests (Firefox and Chrome)
  and the Docker checks.
- Test coverage stays **at least 95 %**.
- GitHub Actions mirror the local pipeline exactly and stay green.
- Unit, integration and end-to-end tests where each fits. No requirement is skipped.

## Scripts

Write small, reusable scripts for repetitive tasks. Every script is documented: a header comment
with its purpose, usage and exit codes, and an entry in the README.

## Delivery order

1. The local version works in the browser.
2. Then dockerize it (a static web server image).
3. GitHub Actions build the Docker image and publish it to **GHCR**.

## Licence

**GPL-3.0-or-later.** A proper `LICENSE` file, and SPDX copyright/licence headers where they make
sense (REUSE-compliant, as in AlliumAssault).

## README

- Badges in the style of AlliumAssault, myLastFmPlayer and cullendula: play in browser, CI, Pages,
  release, licence, REUSE, and the tech stack.
- Documents setup, testing, the pipeline, Docker and usage.
- Includes at least one **real screenshot** of the running UI.

## Reference template

<https://github.com/marcelpetrick/AlliumAssault> is the model for the toolchain, the CI workflows,
the README and the badges. Check its licence and attribution rules before copying anything
(vision.md X-03).

## Definition of done

1. Run `/reviewBranch` and fix every finding.
2. Run `/githubAbout`.
3. Do a final check against **every** item in `vision.md`. Each one is done, or explicitly deferred by
   the owner.
4. The full `localPipeline.sh` is green, and GitHub Actions are green.
5. The Docker image builds, starts and serves the working game.
6. Everything is pushed and the working tree is clean.

Stop only when the whole `vision.md` is really done and the product works.

## Documentation style

Everything is understandable by humans: well documented, reviewed, with no unexplained magic numbers
(original-game constants carry their source). The living document is `vision.md`, and its "Resume
here" section is kept up to date.
