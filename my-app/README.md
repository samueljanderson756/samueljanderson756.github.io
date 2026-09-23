# Samuel John Portfolio

The React app published at [samueljanderson756.github.io](https://samueljanderson756.github.io/).

The homepage introduces Samuel John and links to current music and software projects. Crypto Watch lives at
`/#/crypto`, and the private Euro Trip expense splitter lives at `/#/euro-trip`. Hash routes make direct links and
refreshes work on GitHub Pages without a server redirect.

## Euro Trip shared ledger

The Euro Trip route uses Firebase Authentication and Cloud Firestore so six travelers can use one shared password and
see the same expenses in real time. The account email is supplied by the app; travelers only enter the password.

1. Create a Firebase project and add a Web app in the Firebase console.
2. Enable Email/Password under Authentication, then create one user for the trip. Use the same email in
   `VITE_EURO_TRIP_ACCOUNT_EMAIL` and keep its password to share with the group. Add
   `samueljanderson756.github.io` to Authentication's authorized domains.
3. Create a Cloud Firestore database.
4. Copy `.env.example` to `.env.local` and fill in the Web app configuration values. Firebase Web configuration is
   public by design; do not put the trip password in this file.
5. Copy the Authentication user's UID into `firestore.rules` in place of `REPLACE_WITH_TRIP_ACCOUNT_UID`. If changing
   `VITE_EURO_TRIP_ID`, update the matching trip path in the rules too.
6. From this directory, select the Firebase project and publish the rules:

```sh
pnpm dlx firebase-tools use --add
pnpm dlx firebase-tools deploy --only firestore:rules
```

The first authenticated visitor enters the six traveler names. After that, each device remembers which traveler is
using it. All members share write access, so the password should only be given to the group.

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
