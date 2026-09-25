# Changelog

All notable changes to `@vit-foundation/ui` are documented here, **one page per
version**, newest first. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

| Version                       | Released   | What it is                                                         |
| ----------------------------- | ---------- | ------------------------------------------------------------------ |
| [Unreleased](./unreleased.md) | —          | On `main`, not yet in a tagged version                             |
| [0.32.2](./0.32.2.md)         | 2026-09-25 | `./madlib` metrics match the selector it was extracted from        |
| [0.32.1](./0.32.1.md)         | 2026-09-25 | Identical to 0.32.0 — published before its fix was merged          |
| [0.32.0](./0.32.0.md)         | 2026-09-25 | The `./madlib` subpath: `<Madlib>`, `<InlineSelect>`, tree helpers |
| [0.31.0](./0.31.0.md)         | 2026-09-22 | The `./overlay` subpath: `anchor` placement and `<HoverCard>`      |
| [0.30.0](./0.30.0.md)         | 2026-09-21 | `CrossfadeVideoHandle` reaches the `./scrolly` surface             |
| [0.29.0](./0.29.0.md)         | 2026-09-21 | The `./scrolly` subpath; the `user` glyph rejoins the repository   |

This package is installed rather than deployed, so the number describes the
API: MINOR for new exports and features, PATCH for fixes alone, MAJOR for a
change that breaks a consumer's imports or markup.

**Versions before 0.29.0 predate this changelog.** Their history is the git
log between tags — `git log v0.26.0..v0.27.0` — and the release commits are
each named for their version. Two gaps in that history are worth knowing:

- **There is no `v0.28.0` tag, and no 0.28.0 commit.** The version was
  published to npm on 2026-09-10 from a working tree that never reached
  `main`; the tarball has no `gitHead`. Its one change over 0.27.0 — the `user`
  icon — was recovered from the published tarball and committed for 0.29.0.
- `v0.24.2` and `v0.28.0` exist on npm without a matching tag on the remote.

A released page is history and is never edited again; a correction lands on the
next version's page. The [release ritual](../../README.md#cutting-a-release) is
in the README.
