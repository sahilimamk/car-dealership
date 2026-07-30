# AutoVault Car Dealership

AutoVault is a full-stack car dealership inventory experience built with React + Tailwind on the frontend and Node.js + Express + MongoDB on the backend.

## Features

- User registration and login with JWT-based authentication
- Inventory browsing with search, filtering, sorting, and stock indicators
- Admin capabilities for creating, editing, deleting, and restocking vehicles
- Seeded demo inventory and an admin account for local and production use

## Local development

- Frontend: `npm run dev`
- Backend: `npm run dev`
- Backend tests: `npm test`

## Production notes

- Frontend should use `VITE_API_URL` pointing at the Render backend API base URL.
- The backend auto-seeds the database on startup when the app boots.

## My AI Usage

This project was developed with AI-assisted implementation, testing, and review.

- AI tools used: GitHub Copilot for code generation, debugging, and test scaffolding, plus local terminal-based verification and iterative TDD.
- How I used AI: I used GitHub Copilot to draft and refine backend tests for authentication and vehicle flows, then implemented the corresponding routes and UI wiring while verifying behavior through Vitest and Vite builds.
- Workflow reflection: AI accelerated the development loop by helping me move quickly from failing tests to working features, while I still reviewed the implementation carefully and verified behavior through automated checks.
