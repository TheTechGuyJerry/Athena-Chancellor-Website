# Osita Chidoka website recreation

An independently implemented, responsive recreation of the public-facing Osita Chidoka website. It includes the homepage, About, Blog, The Canon archive, Unlock Naija, Mekaria Mentorship, Press Inquiry, legal pages, search/filter interactions, forms, and a cookie notice.

## Run locally

```bash
npm install
npm run dev
```

Open the local address shown in the terminal.

## Production build

```bash
npm run build
```

## Integration points

- Connect the subscription, mentorship, movement, press, and sign-in controls to your preferred backend.
- Replace the demonstration legal text with approved policies before collecting public data.
- The archive content is stored in `lib/essays.ts`.
- Images are stored in `public/images` so the deployment does not depend on the reference site.
