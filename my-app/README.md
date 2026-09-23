# Samuel John Portfolio

The React app published at [samueljanderson756.github.io](https://samueljanderson756.github.io/).

The homepage introduces Samuel John and links to current music and software projects. Crypto Watch lives at
`/#/crypto`, and the private Euro Trip expense splitter lives at `/#/euro-trip`. Hash routes make direct links and
refreshes work on GitHub Pages without a server redirect.

## Euro Trip shared ledger

The Euro Trip route uses Firebase Authentication and Cloud Firestore so six travelers can use one shared password and
see the same expenses in real time. It shares the `centering-rex-464821-q4` Firebase project with Stage Plot Alpha,
while keeping its authentication identity and Firestore path separate. The Firebase Web configuration in
`.env.production` is public client configuration; the shared password is never stored in the repository.

The Firebase project needs this one-time setup:

1. Keep Google Authentication enabled for Stage Plot Alpha and also enable Email/Password Authentication.
2. Create `euro-trip@samueljanderson756.github.io` as the shared trip user and give the password to the group.
3. Add `samueljanderson756.github.io` to Authentication's authorized domains.
4. Publish the merged rules from this directory. They preserve Stage Plot's `/users/{userId}` data and add the
   isolated `/trips/euro-trip-2026` ledger:

```sh
pnpm dlx firebase-tools deploy --only firestore:rules
```

Do not replace these merged rules with a trip-only rule file; Firestore has one active ruleset for the whole Firebase
project, so an incomplete deployment could disable Stage Plot's cloud saves.

The first authenticated visitor enters the six traveler names. After that, each device remembers which traveler is
using it. Expenses are entered in USD, and the final payment plan stays read-only until the group settles up at the end
of the trip. All members share write access, so the password should only be given to the group.

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
pnpm run deploy:pages
```

The deploy command builds the Vite app and publishes `dist/` to the repository's `gh-pages` branch.
Use `pnpm run ...` for deploy scripts because `pnpm deploy` is a pnpm workspace command, not this app's GitHub Pages script.
