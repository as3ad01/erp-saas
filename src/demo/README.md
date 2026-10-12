# Martial arts club demo

A sales demo, not the real product. It runs at `/demo` with no login and no database.

- `data.ts`: all fake data (members, classes, belts, revenue, tournaments). Edit here to change what the demo shows.
- `i18n.ts`: Arabic (default, RTL) and English text. Western digits and USD everywhere.
- `state.tsx`: in-memory state (check-ins, promotions, payments, WhatsApp messages). The reset button in the top bar restores it.
- `logic.ts`: package tiers (Basic / Standard / Pro) and which screens each unlocks.
- `pages/`, `components/`: the screens. Routes live in `src/app/(demo)/demo`.

Pitch flow: Belt promotions -> promote Omar -> "See it on the parent's phone".
`/demo/phone` is the parents' app full screen (for a real phone) and `/demo/site` is the champions website.
The app needs no environment variables.
