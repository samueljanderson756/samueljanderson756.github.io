# Samuel John Portfolio

The React app published at [samueljanderson756.github.io](https://samueljanderson756.github.io/).

The homepage introduces Samuel John and links to current music and software projects. Crypto Watch is preserved as a
separate hash-routed page at `/#/crypto`, which makes direct links and refreshes work on GitHub Pages without a server
redirect.

## Local development

```sh
pnpm install
pnpm dev
```

The app runs at [http://localhost:5173](http://localhost:5173).

## Checks

```sh
pnpm test
pnpm typecheck
pnpm build
pnpm format:check
pnpm lint
```

## Deploy

```sh
pnpm deploy
```

The deploy command builds the Vite app and publishes `dist/` to the repository's `gh-pages` branch.
