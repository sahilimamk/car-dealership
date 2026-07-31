/**
 * seed.ts
 *
 * Populates the database with demo users and vehicles.
 * This function is idempotent: running it multiple times will not create
 * duplicate records. It checks for existing data before inserting.
 */

import bcrypt from 'bcryptjs';
import { findUserByUsername, createUser } from '../stores/userStore';
import { listVehicles, createVehicle } from '../stores/vehicleStore';
import { UserModel } from '../models/user';

// ---------------------------------------------------------------------------
// Demo users
// ---------------------------------------------------------------------------

const ADMIN_USER = {
  username: 'admin',
  email: 'admin@dealership.com',
  password: 'Admin123!',
  role: 'admin' as const,
};

const DEMO_USER = {
  username: 'demo',
  email: 'demo@dealership.com',
  password: 'Demo123!',
  role: 'user' as const,
};

// ---------------------------------------------------------------------------
// Demo vehicles — at least 10, covering Sedan / SUV / Coupe / Hatchback / Truck.
// One vehicle intentionally has quantity = 0 for inventory edge-case testing.
// ---------------------------------------------------------------------------

const VEHICLE_DATA = [
  // ── Sedans ──────────────────────────────────────────────────────────────
  {
    make: 'Toyota',
    model: 'Camry',
    category: 'Sedan',
    year: 2023,
    price: 26_990,
    quantity: 5,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    mileage: 0,
    bodyType: 'Sedan',
    color: 'Midnight Black',
    imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?w=800',
    description: 'Reliable mid-size sedan with a smooth ride and excellent fuel economy.',
  },
  {
    make: 'Honda',
    model: 'Accord',
    category: 'Sedan',
    year: 2024,
    price: 29_500,
    quantity: 4,
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    mileage: 0,
    bodyType: 'Sedan',
    color: 'Platinum White',
    imageUrl: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0b65?w=800',
    description: 'Award-winning hybrid sedan with a premium interior and ADAS suite.',
  },
  {
    make: 'Tesla',
    model: 'Model 3',
    category: 'Sedan',
    year: 2024,
    price: 42_990,
    quantity: 8,
    transmission: 'Automatic (Single-Speed)',
    fuelType: 'Electric',
    mileage: 0,
    bodyType: 'Sedan',
    color: 'Pearl White',
    imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
    description: 'Long-range electric sedan with Autopilot and over-the-air updates.',
  },

  // ── SUVs ────────────────────────────────────────────────────────────────
  {
    make: 'Jeep',
    model: 'Wrangler',
    category: 'SUV',
    year: 2023,
    price: 35_795,
    quantity: 3,
    transmission: 'Manual',
    fuelType: 'Gasoline',
    mileage: 0,
    bodyType: 'SUV',
    color: 'Firecracker Red',
    imageUrl: 'https://images.unsplash.com/photo-1559405624-94119d698e5e?w=800',
    description: 'Iconic off-roader with a removable top and legendary 4×4 capability.',
  },
  {
    make: 'Mercedes-Benz',
    model: 'GLE 450',
    category: 'SUV',
    year: 2024,
    price: 66_900,
    quantity: 2,
    transmission: 'Automatic (9-Speed)',
    fuelType: 'Gasoline',
    mileage: 0,
    bodyType: 'SUV',
    color: 'Obsidian Black',
    imageUrl: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800',
    description: 'Luxury mid-size SUV with EQ Boost mild-hybrid and AMG Line styling.',
  },
  {
    make: 'Toyota',
    model: 'RAV4 Hybrid',
    category: 'SUV',
    year: 2023,
    price: 33_450,
    quantity: 0, // Out of stock — used for inventory edge-case testing
    transmission: 'Automatic (e-CVT)',
    fuelType: 'Hybrid',
    mileage: 0,
    bodyType: 'SUV',
    color: 'Magnetic Gray',
    imageUrl: 'https://images.unsplash.com/photo-1629897048514-3dd741432726?w=800',
    description: 'Best-selling hybrid SUV with AWD and generous cargo space. Currently out of stock.',
  },

  // ── Coupes ──────────────────────────────────────────────────────────────
  {
    make: 'Ford',
    model: 'Mustang GT',
    category: 'Coupe',
    year: 2024,
    price: 54_995,
    quantity: 3,
    transmission: 'Manual (6-Speed)',
    fuelType: 'Gasoline',
    mileage: 0,
    bodyType: 'Coupe',
    color: 'Race Red',
    imageUrl: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42a5?w=800',
    description: '5.0L V8 muscle car with 450 hp and a signature growl.',
  },
  {
    make: 'BMW',
    model: 'M4 Competition',
    category: 'Coupe',
    year: 2024,
    price: 84_700,
    quantity: 1,
    transmission: 'Automatic (8-Speed)',
    fuelType: 'Gasoline',
    mileage: 0,
    bodyType: 'Coupe',
    color: 'São Paulo Yellow',
    imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
    description: 'Twin-turbo straight-six, 503 hp, carbon bucket seats — track-ready from the factory.',
  },

  // ── Hatchbacks ──────────────────────────────────────────────────────────
  {
    make: 'Honda',
    model: 'Civic Sport',
    category: 'Hatchback',
    year: 2023,
    price: 24_950,
    quantity: 7,
    transmission: 'Manual (6-Speed)',
    fuelType: 'Gasoline',
    mileage: 0,
    bodyType: 'Hatchback',
    color: 'Sonic Gray Pearl',
    imageUrl: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0b65?w=800',
    description: 'Sporty hatchback with turbocharged engine, large touchscreen, and Honda Sensing.',
  },
  {
    make: 'Volkswagen',
    model: 'Golf GTI',
    category: 'Hatchback',
    year: 2024,
    price: 32_995,
    quantity: 4,
    transmission: 'Manual (6-Speed)',
    fuelType: 'Gasoline',
    mileage: 0,
    bodyType: 'Hatchback',
    color: 'Tornado Red',
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
    description: 'The benchmark hot hatch — 241 hp, plaid seats, and go-kart handling.',
  },

  // ── Trucks ───────────────────────────────────────────────────────────────
  {
    make: 'Ford',
    model: 'F-150 XLT',
    category: 'Truck',
    year: 2023,
    price: 46_500,
    quantity: 6,
    transmission: 'Automatic (10-Speed)',
    fuelType: 'Gasoline',
    mileage: 0,
    bodyType: 'Truck',
    color: 'Iconic Silver',
    imageUrl: 'https://images.unsplash.com/photo-1600045437812-706f97ef78f2?w=800',
    description: 'America\'s best-selling truck with a 2.7L EcoBoost V6 and 2,000 lb payload.',
  },
  {
    make: 'Chevrolet',
    model: 'Silverado 1500 LT',
    category: 'Truck',
    year: 2023,
    price: 44_800,
    quantity: 5,
    transmission: 'Automatic (8-Speed)',
    fuelType: 'Gasoline',
    mileage: 0,
    bodyType: 'Truck',
    color: 'Summit White',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    description: 'Full-size truck with a 5.3L V8, trailering package, and class-leading towing.',
  },
];

// ---------------------------------------------------------------------------
// Seed function
// ---------------------------------------------------------------------------

export async function seed(): Promise<void> {
  console.log('[seed] Starting database seed...');

  // ── Users ──────────────────────────────────────────────────────────────
  // Always upsert the admin so the password is always correct even if
  // the record was previously created with a wrong/stale hash.
  const adminHash = await bcrypt.hash(ADMIN_USER.password, 10);
  const existingAdmin = await findUserByUsername(ADMIN_USER.username);
  if (!existingAdmin) {
    await createUser({
      username: ADMIN_USER.username,
      email: ADMIN_USER.email,
      passwordHash: adminHash,
      role: ADMIN_USER.role,
    });
    console.log(`[seed] Admin user '${ADMIN_USER.username}' created.`);
  } else {
    // Force-update password hash so deployment changes never break login
    await UserModel.findOneAndUpdate(
      { username: ADMIN_USER.username },
      { passwordHash: adminHash, role: 'admin', email: ADMIN_USER.email },
      { new: true }
    );
    console.log(`[seed] Admin user '${ADMIN_USER.username}' password refreshed.`);
  }

  const existingDemo = await findUserByUsername(DEMO_USER.username);
  if (!existingDemo) {
    const passwordHash = await bcrypt.hash(DEMO_USER.password, 10);
    await createUser({
      username: DEMO_USER.username,
      email: DEMO_USER.email,
      passwordHash,
      role: DEMO_USER.role,
    });
    console.log(`[seed] Demo user '${DEMO_USER.username}' created.`);
  } else {
    console.log(`[seed] Demo user '${DEMO_USER.username}' already exists — skipping.`);
  }

  // ── Vehicles ───────────────────────────────────────────────────────────
  // Check whether any vehicles exist already. If the collection is non-empty
  // we treat the seed as already applied and skip all inserts to stay idempotent.
  const existing = await listVehicles();
  if (existing.length > 0) {
    console.log(`[seed] ${existing.length} vehicle(s) already present — skipping vehicle seed.`);
  } else {
    for (const vehicle of VEHICLE_DATA) {
      await createVehicle(vehicle);
    }
    console.log(`[seed] ${VEHICLE_DATA.length} vehicles inserted.`);
  }

  console.log('[seed] Seed complete.');
}
