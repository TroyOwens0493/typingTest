# Welcome to Royal Type

A game that lets you create typing battle royals with your friends.

## Getting Started

These steps will get the app running locally with Convex and the dev server.

### 1) Install prerequisites

(You have probably done this already)
- Install Node.js (LTS): https://nodejs.org/
- Install pnpm: https://pnpm.io/installation

### 2) Install dependencies

```bash
pnpm install
```

### 3) Start the Convex server

In a new terminal window:

```bash
npx convex dev
```

What to expect:

- The first time you run this, Convex will ask you to sign in/create an account and create or select a project. (This is my database.)
- It will create/update a `.env.local` file with your Convex deployment and URL.
- Leave this command running while you develop/test, as it is what communicates with the server.

### 4) Start the app dev server

In another terminal window:

```bash
pnpm dev
```

You should now have the app running locally. Go to the url to see the site.
Keep both terminals open while you work.

---

If you run into issues with Convex, the docs are a great starting point:
https://docs.convex.dev/
