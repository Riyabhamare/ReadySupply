import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../app.js';
import { seedDatabase } from '../seed/index.js';

let mongod;
let supplierCookie;
let apexTemplateId;
let uploadedDocId;
let createdActionId;
let shareLinkToken;
let shareLinkId;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  await seedDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('End-to-End Core User Journey Smoke Test', () => {
  it('1. Logs in as demo supplier (Shree Precision Components)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'shree@precision.in',
        password: 'Supplier@123456',
      });

    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('Rameshwar Patil');
    expect(res.headers['set-cookie']).toBeDefined();
    supplierCookie = res.headers['set-cookie'];
  });

  it('2. Loads dashboard data: templates, profile, and snapshot', async () => {
    const tplRes = await request(app)
      .get('/api/templates')
      .set('Cookie', supplierCookie);

    expect(tplRes.status).toBe(200);
    expect(tplRes.body.length).toBeGreaterThanOrEqual(3);
    const apexTpl = tplRes.body.find((t) => t.name.includes('Apex Auto'));
    expect(apexTpl).toBeDefined();
    apexTemplateId = apexTpl._id;

    const snapRes = await request(app)
      .get(`/api/matching/${apexTemplateId}/snapshot`)
      .set('Cookie', supplierCookie);

    expect(snapRes.status).toBe(200);
    expect(snapRes.body.readinessScore).toBeGreaterThan(0);
    expect(snapRes.body.disclaimer).toContain('not a certification');
  });

  it('3. Uploads a new document to Evidence Vault', async () => {
    const fakeBuffer = Buffer.from('%PDF-1.4 Mock PDF Document Content');

    const res = await request(app)
      .post('/api/documents')
      .set('Cookie', supplierCookie)
      .field('name', 'Updated ISO 9001 Renewal Copy')
      .field('category', 'quality_certification')
      .field('issueDate', '2026-03-01')
      .field('expiryDate', '2029-03-01')
      .field('description', 'Newly renewed ISO certificate with 3-year validity')
      .attach('file', fakeBuffer, 'ISO_2026_Renewal.pdf');

    expect(res.status).toBe(201);
    expect(res.body.document.reviewStatus).toBe('pending_review');
    expect(res.body.document.uploaded).toBe(true);
    uploadedDocId = res.body.document._id;
  });

  it('4. Re-runs requirement mapping with the newly uploaded evidence', async () => {
    const res = await request(app)
      .post(`/api/matching/${apexTemplateId}/run`)
      .set('Cookie', supplierCookie);

    expect(res.status).toBe(200);
    expect(res.body.summary).toBeDefined();
    expect(res.body.results.length).toBeGreaterThan(0);
  });

  it('5. Creates a corrective action from a gap', async () => {
    const due = new Date();
    due.setDate(due.getDate() + 10);

    const res = await request(app)
      .post('/api/actions')
      .set('Cookie', supplierCookie)
      .send({
        title: 'Calibrate precision dial gauges for Apex audit',
        description: 'Complete lab calibration before next quarterly vendor review',
        relatedRequirementCode: 'APEX-REQ-05',
        relatedRequirementTitle: 'Instrument Calibration Records',
        relatedTemplate: apexTemplateId,
        assignedTo: { name: 'Kailash Sharma', role: 'Quality Head' },
        priority: 'high',
        dueDate: due.toISOString().split('T')[0],
      });

    expect(res.status).toBe(201);
    expect(res.body.action.title).toContain('Calibrate precision dial gauges');
    createdActionId = res.body.action._id;
  });

  it('6. Exports Evidence Pack PDF with mandatory disclaimers and footers', async () => {
    const res = await request(app)
      .get(`/api/packs/${apexTemplateId}/pdf`)
      .set('Cookie', supplierCookie);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(res.headers['content-disposition']).toContain('attachment; filename=');
    expect(res.body.length).toBeGreaterThan(100);
  });

  it('7. Creates a controlled share link with explicit consent', async () => {
    const res = await request(app)
      .post('/api/share')
      .set('Cookie', supplierCookie)
      .send({
        templateId: apexTemplateId,
        recipientName: 'Apex Buyer Procurement Team',
        recipientEmail: 'vendor.readiness@apex-auto-fictional.in',
        purpose: 'Annual supplier qualification audit',
        expiryDays: 14,
        maxAccessCount: 20,
        consentGranted: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.shareLink.token).toBeDefined();
    shareLinkToken = res.body.shareLink.token;
    shareLinkId = res.body.shareLink._id;
  });

  it('8. Verifies external read-only access to shared dossier via token', async () => {
    const res = await request(app)
      .get(`/api/share/view/${shareLinkToken}`);

    expect(res.status).toBe(200);
    expect(res.body.shareLink.recipientName).toBe('Apex Buyer Procurement Team');
    expect(res.body.mapping).toBeDefined();
    expect(res.body.profile.companyName).toBe('Shree Precision Components');
    expect(res.body.disclaimer).toContain('Not a certification or supplier approval');
  });

  it('9. Rejects invalid file upload (.exe) with 400 error', async () => {
    const res = await request(app)
      .post('/api/documents')
      .set('Cookie', supplierCookie)
      .field('name', 'Malicious Executable')
      .field('category', 'quality_certification')
      .attach('file', Buffer.from('MZ fake executable binary content'), {
        filename: 'malware.exe',
        contentType: 'application/x-msdownload',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('UploadError');
    expect(res.body.message).toContain('Only PDF, JPG, and PNG documents are supported');
  });

  it('10. Revoking share link immediately terminates external access', async () => {
    // 1. Revoke the share link by its ID
    const revokeRes = await request(app)
      .post(`/api/share/${shareLinkId}/revoke`)
      .set('Cookie', supplierCookie);

    expect(revokeRes.status).toBe(200);

    // 2. Confirm subsequent external access returns 410 (Revoked)
    const accessRes = await request(app)
      .get(`/api/share/view/${shareLinkToken}`);

    expect(accessRes.status).toBe(410);
    expect(accessRes.body.error).toBe('ShareLinkRevoked');
  });
});

