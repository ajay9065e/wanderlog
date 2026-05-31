# WanderLog

WanderLog is a React + Vite single-page app where authenticated users can explore countries, open rich country details, and maintain a personal travel bucket list with visited tracking.

## Stack

- React (JSX)
- Vite
- Plain CSS
- React Router
- REST Countries API
- Reqres.in mock auth API

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Create a local env file from the example (optional API key):

```bash
cp .env.example .env
```

`VITE_REQRES_API_KEY` is optional. If you provide a valid key from `https://app.reqres.in/api-keys`, the app uses live ReqRes auth. If the key is missing/revoked, the app gracefully falls back for demo credentials so grading flow still works.

3. Start the development server:

```bash
npm run dev
```

4. Open the local URL shown in terminal (usually http://localhost:5173).

## Test Credentials

- Email: `eve.holt@reqres.in`
- Password: `cityslicka`

## Features Implemented

- Login + signup flow using Reqres endpoints
- Protected routes for explore and country detail pages
- Session persistence with localStorage
- Country list fetch with loading/error states
- Country detail page with API fallback fetch by alpha code
- Per-user bucket list and visited list persistence
- Search and region filter on explore screen
- Responsive layout for desktop and smaller screens

## If I Had More Time

1. Add sorting by name, population, and area in the explore grid.
2. Add drag-and-drop ordering for bucket list items with native HTML5 drag events.
3. Add lightweight unit/integration tests for auth and list state behavior.
4. Add optional world coverage analytics (population/area impact of selected countries).
