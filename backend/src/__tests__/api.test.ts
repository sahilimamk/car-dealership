import express from 'express';
import request from 'supertest';
import { describe, expect, it, beforeAll } from 'vitest';

function createTestApp() {
  const app = express();
  app.use(express.json());
  return app;
}

let app: ReturnType<typeof createTestApp>;

beforeAll(() => {
  app = createTestApp();
});

describe('Auth Endpoints (TDD)', () => {
  it('POST /api/auth/register - should create a new user and return token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@dealership.com',
        password: 'Password123!'
      });

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.username).toBe('testuser');
    expect(res.body.user.role).toBe('user');
    expect(res.body.token).toBeDefined();
  });

  it('POST /api/auth/register - should reject duplicate username with 409', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'another@dealership.com',
        password: 'Password123!'
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Username already taken.');
  });

  it('POST /api/auth/login - should authenticate valid user and return JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'Password123!'
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe('testuser');
  });

  it('POST /api/auth/login - should reject invalid password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'WrongPassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials.');
  });
});
