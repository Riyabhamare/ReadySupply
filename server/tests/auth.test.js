import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../app.js';
import { ROLES } from '../config/constants.js';

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('Authentication & Session Tests', () => {
  it('registers a new user as SUPPLIER and sets httpOnly cookie', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'New Test Supplier',
        email: 'newsupplier@test.com',
        password: 'Password123!',
        companyName: 'New Test MSME Ltd',
        // Attempt to pass role=admin, should be ignored
        role: 'admin',
      });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe(ROLES.SUPPLIER);
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie'][0]).toContain('token=');
    expect(res.headers['set-cookie'][0]).toContain('HttpOnly');
  });

  it('rejects registration with invalid email or short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Bad User',
        email: 'invalid-email',
        password: '123',
        companyName: 'Company',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('ValidationError');
  });

  it('logs in user with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'newsupplier@test.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('newsupplier@test.com');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('rejects login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'newsupplier@test.com',
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
  });

  it('clears cookie on logout', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'newsupplier@test.com', password: 'Password123!' });

    const cookie = loginRes.headers['set-cookie'];

    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookie);

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.headers['set-cookie'][0]).toContain('token=;');
  });
});

