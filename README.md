# Vetty Board — Project Workspace

A colorful, responsive Kanban-style project board built with React, Vite, and browser localStorage.

## Features

- Create and delete lists; deleting a list also deletes its cards after confirmation.
- Create, edit, and delete task cards.
- Drag cards between lists. Dropping a card into a list sorts that list newest-first.
- Search card titles and descriptions.
- Automatically persists board changes in the browser and synchronizes changes across tabs.
- Responsive layout with a colorful dashboard, summary stats, empty states, and accessible labels.
- No backend or database required.

## Run locally

Requirements: Node.js 18 or newer and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

For a production build:

```bash
npm run build
npm run preview
```

## Deploy

This is a client-side Vite app and can be deployed to GitHub Pages, Vercel, or Netlify. For GitHub Pages, set Vite's `base` option to `/<repository-name>/` and configure GitHub Pages to deploy the `dist` build output. If using a GitHub Actions workflow with `npm ci`, commit the generated `package-lock.json` first.

## Data note

Board data is stored in localStorage in the current browser. It is not shared across different users or devices. Use **Reset demo** to restore the sample board.
