# Martial Arts Club: Sales Demo

An interactive demo of a martial arts club management system, built to show clients what they would get.
It runs entirely in the browser: all data is fake, there is no login and no database.

- Arabic (right-to-left) by default, with an English toggle
- Basic / Standard / Pro package switcher that locks the screens each package does not include
- Dashboard, members, quick check-in, subscriptions, belt promotions, parents' view with WhatsApp updates,
  reports, competitions, branches and a champions website

## Run it

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. It redirects to `/demo`.

## Where things are

- `src/demo/data.ts`: the fake data
- `src/demo/i18n.ts`: Arabic and English text
- `src/demo/state.tsx`: in-memory demo state (the reset button restores it)
- `src/demo/logic.ts`: package tiers
- `src/app/demo`: routes

See `src/demo/README.md` for the pitch flow.
