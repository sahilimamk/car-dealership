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

This project was developed with AI-assisted implementation and review.

- AI tools used: GitHub Copilot, local terminal-based verification, and iterative test-driven development.
- AI contributions included app scaffolding, backend route implementation, frontend state wiring, and documentation updates.
- Workflow reflection: the implementation followed a TDD approach for backend behavior and verification through automated tests and build checks.
