# PROMPTS.md — AI Tooling Chat History

This file contains the complete record of AI prompts and responses used during the development of the Car Dealership project. All interactions were conducted using **Kiro AI** inside the Kiro IDE.

---

## Session 1 — Project Scaffolding

### Prompt 1
> "Create a full-stack car dealership app. Backend should use Node.js with Express and TypeScript. Frontend should use React with Vite and Tailwind CSS. I want JWT authentication, a vehicle inventory system, and Vitest for testing."

**AI Response Summary:**
Generated the initial project structure with separate `backend/` and `frontend/` folders, configured `package.json` for both, set up `tsconfig.json` for the backend, and created the Vite config with the React plugin and Tailwind CSS v4 integration.

---

### Prompt 2
> "Set up the Express app with CORS, JSON body parsing, and a health check endpoint. Also add auth routes and vehicle routes."

**AI Response Summary:**
Created `src/app.ts` as an app factory function using `createApp()`. Added CORS middleware with configurable `CORS_ORIGIN` environment variable support, wired up `/api/auth` and `/api/vehicles` route groups, and added a `GET /health` endpoint returning `{ ok: true }`.

---

### Prompt 3
> "Create the server entry point that connects to MongoDB if MONGODB_URI is set, otherwise just start the server with the in-memory store."

**AI Response Summary:**
Created `src/index.ts` that loads `.env`, conditionally calls `connectDatabase()` when `MONGODB_URI` is present, and starts the Express server on the configured `PORT` (defaulting to 3001).

---

## Session 2 — Authentication

### Prompt 4
> "Create a user store with in-memory storage. It should support creating users, finding by username, and ensuring a default admin user exists on startup."

**AI Response Summary:**
Created `src/stores/userStore.ts` with a `Map`-based in-memory user store. Implemented `createUser`, `findUserByUsername`, `clearUsers`, and `ensureDefaultAdminUser` functions. The admin user (`admin` / `Admin123!`) is seeded at module load time.

---

### Prompt 5
> "Create the auth routes: POST /api/auth/register and POST /api/auth/login. Register should hash the password with bcrypt and return a JWT. Login should verify the password and return a JWT. Both should return the user object without the password hash."

**AI Response Summary:**
Generated `src/routes/auth.ts` with both endpoints. Used `bcrypt.hash` (10 rounds) on registration, `bcrypt.compare` on login, and signed JWTs with a 24h expiry using `jsonwebtoken`. Returns `{ user: { id, username, email, role }, token }`.

---

### Prompt 6
> "Create JWT authentication middleware that reads the Bearer token from the Authorization header and attaches the decoded user to req.user."

**AI Response Summary:**
Created `src/middleware/auth.ts` with an `authenticate` middleware that verifies the token and attaches the payload to `req.user`. Returns 401 if the token is missing or invalid.

---

### Prompt 7
> "Create an admin-only middleware that checks req.user.role === 'admin' and returns 403 if not."

**AI Response Summary:**
Created `src/middleware/admin.ts` with an `adminOnly` middleware that checks the role and returns `403 Forbidden` for non-admin users.

---

## Session 3 — Vehicle API

### Prompt 8
> "Create the vehicle model with these fields: make, model, category, year, price, quantity, imageUrl, description. Also optional fields: transmission, fuelType, mileage, bodyType, color. Use Mongoose with timestamps."

**AI Response Summary:**
Generated `src/models/vehicle.ts` with a full Mongoose schema including all specified fields, timestamps, and helper functions: `createVehicle`, `findVehicleById`, `updateVehicleById`, `deleteVehicleById`, `listVehicles`, `listAvailableVehicles`, `incrementVehicleQuantity`, and `decrementVehicleQuantity`.

---

### Prompt 9
> "Create an in-memory vehicle store that mirrors the Mongoose model API so the app works without MongoDB."

**AI Response Summary:**
Created `src/stores/vehicleStore.ts` with a `Map`-based store. Implements `createVehicle`, `listVehicles`, `searchVehicles`, `updateVehicle`, `deleteVehicle`, `purchaseVehicle`, `restockVehicle`, and `clearVehicles`.

---

### Prompt 10
> "Create the vehicle routes. I need: GET / (list in-stock), GET /admin (all including OOS), GET /search (with make/model/category/minPrice/maxPrice params), POST / (create), PUT /:id (update), DELETE /:id (delete), POST /:id/purchase (buy one), POST /:id/restock (add quantity). Use Zod for validation."

**AI Response Summary:**
Generated `src/routes/vehicles.ts` with all 8 endpoints. Created three Zod schemas: `vehicleSchema` for creation, `updateSchema` (partial) for updates, and `restockSchema` for the restock amount. Validation errors are returned as `{ errors: [{ path, message }] }` with 422 status.

---

## Session 4 — Seed Data

### Prompt 11
> "Create a seed script that adds 12 diverse demo vehicles (mix of sedans, SUVs, coupes, trucks) and a demo user. The script should be idempotent — skip if data already exists."

**AI Response Summary:**
Generated `src/seeds/seed.ts` with 12 vehicle entries covering Toyota, BMW, Ford, Tesla, Porsche, Honda, Chevrolet, Mercedes-Benz, Subaru, Audi, Mazda, and Hyundai. The script checks for existing data before inserting and logs progress. A `demo` user (`demo` / `Demo123!`) is also created. The `seed()` function is called automatically from `app.ts` on startup.

---

## Session 5 — Frontend Scaffold

### Prompt 12
> "Set up the React frontend with Vite, Tailwind CSS v4, React Router v7, and Axios. Create the folder structure with pages for Home, Inventory, Login, Register, About, and Contact."

**AI Response Summary:**
Configured `vite.config.js` with the React plugin, Tailwind CSS v4 vite plugin, and a dev proxy that forwards `/api` to `http://localhost:3001`. Created `App.jsx` with all routes, and placeholder page components for each route.

---

### Prompt 13
> "Create an Axios instance that reads the base URL from the VITE_API_URL environment variable."

**AI Response Summary:**
Created `src/api/axios.js` with an Axios instance using `import.meta.env.VITE_API_URL` as the base URL with `withCredentials: true` and a JSON content-type header.

---

### Prompt 14
> "Create vehicle API helper functions: searchVehicles, createVehicle, updateVehicle, deleteVehicle, purchaseVehicle, restockVehicle."

**AI Response Summary:**
Generated `src/api/vehicles.js` with all helper functions. Each function uses the shared Axios instance, hits the correct endpoint, and returns `response.data`.

---

## Session 6 — Frontend Components

### Prompt 15
> "Create a Navbar component with the dealership name/logo, navigation links (Home, Inventory, About, Contact), and Login/Register or logout buttons based on auth state."

**AI Response Summary:**
Generated `src/components/Navbar.jsx` using Tailwind CSS. The navbar is sticky, shows the active route with highlighting, and reads from `AuthContext` to show either Login/Register links or the logged-in username with a Logout button.

---

### Prompt 16
> "Create a VehicleCard component that shows the vehicle image, make, model, year, category, price, and quantity. Include Purchase, Edit, and Delete buttons. The Purchase button should be disabled when quantity is 0."

**AI Response Summary:**
Generated `src/components/VehicleCard.jsx` with a card layout using Tailwind CSS. Handles missing images with a placeholder SVG. The Purchase button is disabled and greyed out when quantity reaches 0. Edit and Delete buttons call passed-in callback props.

---

### Prompt 17
> "Create a FilterSidebar component with filters for: search query (text), price range (min/max), brand (checkboxes), category (dropdown), year (dropdown), fuel type (checkboxes), and transmission (radio buttons)."

**AI Response Summary:**
Generated `src/components/FilterSidebar.jsx` with a collapsible sidebar layout. Each filter section can be expanded/collapsed. The component calls an `onFilterChange` prop with the current filter state whenever any input changes.

---

### Prompt 18
> "Create a VehicleFormModal component for adding and editing vehicles. It should be a modal dialog with fields for make, model, category, year, price, quantity, imageUrl, and description. Show validation errors from the API."

**AI Response Summary:**
Created `src/components/admin/VehicleFormModal.jsx` with a modal overlay and form. Pre-fills fields when an existing vehicle is passed in (edit mode). Sends POST or PUT to the API based on whether `vehicle` prop is set. Displays field-level validation errors from the Zod API response.

---

### Prompt 19
> "Build the Home/Inventory dashboard page. It should fetch vehicles using the search API with debouncing (300ms), apply client-side filtering for fields the API doesn't support (fuel type, transmission, year, brand), and support sorting by newest/price/quantity."

**AI Response Summary:**
Generated `src/pages/Home.jsx` as the main inventory dashboard. Implemented debounced API calls using `useRef` and `setTimeout`. Backend-supported filters (make, category, price) go in the query params; fuel type, transmission, year, and brand are filtered client-side using `useMemo`. Sorting is also applied client-side with `useMemo`.

---

### Prompt 20
> "Create the Login and Register pages with form validation, error display, and redirect to home on success."

**AI Response Summary:**
Generated `src/pages/Login.jsx` and `src/pages/Register.jsx`. Both use controlled form inputs, call the auth API, store the JWT and user in `AuthContext` and `localStorage`, and redirect to `/` on success. Login page shows a demo credentials hint box for admin access.

---

## Session 7 — Auth Context

### Prompt 21
> "Create an AuthContext that stores the current user and JWT token. It should persist to localStorage and expose login, logout, and register functions."

**AI Response Summary:**
Created `src/context/AuthContext.jsx` with a React context provider. Initialises state from `localStorage` on mount. Provides `user`, `token`, `login(userData, token)`, and `logout()` (which clears localStorage). Wrapped around the app in `main.jsx`.

---

## Session 8 — Testing (TDD)

### Prompt 22
> "Write Vitest + Supertest tests for the auth endpoints using TDD. Cover: register creates user and returns token, duplicate username returns 409, login returns JWT, wrong password returns 401."

**AI Response Summary:**
Generated the `Auth Endpoints (TDD)` describe block in `src/__tests__/api.test.ts` with 4 tests covering all specified cases. Used `createApp()` directly to avoid port conflicts.

---

### Prompt 23
> "Write tests for the vehicle endpoints. Cover: CORS preflight, unauthenticated create, unauthenticated purchase, unauthenticated list, admin create, Zod validation rejection, search with filters, update, delete, purchase quantity decrement, and restock."

**AI Response Summary:**
Generated the `Vehicle Endpoints (RED)` describe block with 11 tests. Used `beforeAll` to register users, log in as admin, and create a test vehicle. Each test exercises a different endpoint and asserts specific status codes and response shapes.

---

### Prompt 24
> "Write feature tests covering: auto-seed on startup (admin loginnable, vehicles present), purchase flow (qty decrements to 0, fails when already 0), admin inventory view (OOS hidden from regular users, visible to admin), and restock flow."

**AI Response Summary:**
Generated `src/__tests__/features.test.ts` with 4 describe blocks and 10 tests total. Each describe block sets up its own users and vehicles in `beforeAll` for isolation. Tests verify business logic rather than just HTTP status codes.

---

## Session 9 — Bug Fixes & Polish

### Prompt 25
> "The CORS preflight test is failing. The OPTIONS request to /api/vehicles returns 404. Fix the CORS config in app.ts to handle preflight requests properly."

**AI Response Summary:**
Updated the CORS middleware in `app.ts` to include the `OPTIONS` method and `allowedHeaders`. The cors package handles preflight automatically when `methods` includes `OPTIONS` — confirmed by passing the test.

---

### Prompt 26
> "The frontend shows a blank page when the backend is down. Add a fallback to show sample vehicles from a local data file instead of showing nothing."

**AI Response Summary:**
Created `src/data/sampleVehicles.js` with 6 representative vehicles. Updated `Home.jsx` to catch API errors and set `vehicles` to `sampleVehicles` with an error banner explaining the fallback.

---

### Prompt 27
> "The Vite proxy isn't working in production. Add a vercel.json to the frontend that rewrites /api/* to the deployed backend URL."

**AI Response Summary:**
Created `frontend/vercel.json` with a rewrite rule mapping `/api/(.*)` to the backend Render deployment URL.

---

### Prompt 28
> "Create the About and Contact pages with appropriate content for a car dealership."

**AI Response Summary:**
Generated `src/pages/About.jsx` with dealership history, mission, and team section. Generated `src/pages/Contact.jsx` with a contact form (name, email, message), dealership address, phone, and hours of operation.

---

## Session 10 — README & Documentation

### Prompt 29
> "Create a comprehensive README.md that includes: a clear project explanation, setup instructions for both backend and frontend, screenshots section, test report, and a My AI Usage section. Also create a PROMPTS.md with the full AI chat history."

**AI Response Summary:**
Generated `README.md` with all required sections including project overview, tech stack table, features list, project structure, step-by-step setup instructions, API reference table, screenshots section (with placeholder paths), full test report table (25 tests), and the My AI Usage section.

Generated this `PROMPTS.md` file with the complete chronological record of all AI prompts and responses used throughout the project.

---

*End of AI chat history. Total prompts: 29 across 10 sessions.*
