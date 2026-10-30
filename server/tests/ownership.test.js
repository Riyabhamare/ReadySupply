import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../app.js';
import { User } from '../models/User.js';
import { SupplierProfile } from '../models/SupplierProfile.js';
import { Document } from '../models/Document.js';
import { CorrectiveAction } from '../models/CorrectiveAction.js';
import { ROLES, REVIEW_STATUSES } from '../config/constants.js';

let mongod;
let supplierACookie;
let supplierBCookie;
let adminCookie;
let docBId;
let actionBId;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  // 1. Create Supplier A
  const userA = await User.create({
    name: 'Supplier A',
    email: 'supplierA@test.com',
    password: 'Password123!',
    role: ROLES.SUPPLIER,
  });
  await SupplierProfile.create({ supplier: userA._id, companyName: 'Company A' });

  // 2. Create Supplier B
  const userB = await User.create({
    name: 'Supplier B',
    email: 'supplierB@test.com',
    password: 'Password123!',
    role: ROLES.SUPPLIER,
  });
  await SupplierProfile.create({ supplier: userB._id, companyName: 'Company B' });

  // 3. Create Admin
  const adminUser = await User.create({
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'AdminPassword123!',
    role: ROLES.ADMIN,
  });

  // Create a document belonging to Supplier B
  const docB = await Document.create({
    supplier: userB._id,
    name: 'Supplier B Sensitive GST',
    category: 'gst',
    fileRef: {
      filename: 'sample.pdf',
      originalName: 'gst.pdf',
      mimeType: 'application/pdf',
      size: 1024,
      storageDriver: 'local',
      storagePath: 'sample.pdf',
    },
    reviewStatus: REVIEW_STATUSES.PENDING_REVIEW,
  });
  docBId = docB._id.toString();

  // Create an action belonging to Supplier B
  const actionB = await CorrectiveAction.create({
    supplier: userB._id,
    title: 'Action for Supplier B',
    dueDate: new Date(Date.now() + 86400000),
  });
  actionBId = actionB._id.toString();

  // Login Supplier A
  const loginA = await request(app)
    .post('/api/auth/login')
    .send({ email: 'supplierA@test.com', password: 'Password123!' });
  supplierACookie = loginA.headers['set-cookie'];

  // Login Supplier B
  const loginB = await request(app)
    .post('/api/auth/login')
    .send({ email: 'supplierB@test.com', password: 'Password123!' });
  supplierBCookie = loginB.headers['set-cookie'];

  // Login Admin
  const loginAdmin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@test.com', password: 'AdminPassword123!' });
  adminCookie = loginAdmin.headers['set-cookie'];
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('Multi-Tenant Ownership Isolation & Role Security', () => {
  it('prevents Supplier A from downloading Supplier B document (returns 403 Forbidden)', async () => {
    const res = await request(app)
      .get(`/api/documents/${docBId}/download`)
      .set('Cookie', supplierACookie);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Forbidden');
  });

  it('prevents Supplier A from editing Supplier B document metadata (returns 403 Forbidden)', async () => {
    const res = await request(app)
      .put(`/api/documents/${docBId}`)
      .set('Cookie', supplierACookie)
      .send({ name: 'Hacked Name' });

    expect(res.status).toBe(403);
  });

  it('prevents Supplier A from soft-deleting Supplier B document (returns 403 Forbidden)', async () => {
    const res = await request(app)
      .delete(`/api/documents/${docBId}`)
      .set('Cookie', supplierACookie);

    expect(res.status).toBe(403);
  });

  it('prevents Supplier A from updating Supplier B corrective action (returns 404/403)', async () => {
    const res = await request(app)
      .put(`/api/actions/${actionBId}`)
      .set('Cookie', supplierACookie)
      .send({ title: 'Tampered title' });

    expect([403, 404]).toContain(res.status);
  });

  it('prevents Supplier A from accessing Admin Review Queue (returns 403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/admin/queue')
      .set('Cookie', supplierACookie);

    expect(res.status).toBe(403);
  });

  it('prevents Supplier A from verifying documents (returns 403 Forbidden)', async () => {
    const res = await request(app)
      .post(`/api/admin/verify/${docBId}`)
      .set('Cookie', supplierACookie)
      .send({ notes: 'Self verify attempt' });

    expect(res.status).toBe(403);
  });

  it('allows Admin to access review queue', async () => {
    const res = await request(app)
      .get('/api/admin/queue')
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some(d => d._id === docBId)).toBe(true);
  });
});

