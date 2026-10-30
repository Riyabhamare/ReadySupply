import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { SupplierProfile } from '../models/SupplierProfile.js';
import { Buyer } from '../models/Buyer.js';
import { RequirementTemplate } from '../models/RequirementTemplate.js';
import { Document } from '../models/Document.js';
import { CorrectiveAction } from '../models/CorrectiveAction.js';
import { RequirementMapping } from '../models/RequirementMapping.js';
import { createSamplePdf } from './generateSamplePdfs.js';
import { runMatchingEngine } from '../services/matchingEngine.js';
import { env } from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import {
  ROLES,
  REVIEW_STATUSES,
  CHECK_TYPES,
  ACTION_PRIORITIES,
  ACTION_STATUSES,
} from '../config/constants.js';

export const seedDatabase = async () => {
  console.log('[SEED] Starting seed script...');

  // 1. Admin User
  let admin = await User.findOne({ email: env.ADMIN_EMAIL.toLowerCase() });
  if (!admin) {
    admin = await User.create({
      name: 'Platform Administrator',
      email: env.ADMIN_EMAIL.toLowerCase(),
      password: env.ADMIN_PASSWORD,
      role: ROLES.ADMIN,
      phone: '+91 98200 11223',
      isDemo: true,
    });
    console.log(`[SEED] Created Admin user: ${admin.email}`);
  }

  // 2. Fictional Buyers
  const buyersData = [
    {
      name: 'Apex Auto Components Ltd (fictional)',
      sector: 'Automotive',
      location: 'Chakan Industrial Area, Pune, Maharashtra',
      description: 'Tier-1 automotive component manufacturer supplying powertrain and chassis parts.',
      contactEmail: 'vendor.readiness@apex-auto-fictional.in',
      isFictionalSample: true,
      isDemo: true,
    },
    {
      name: 'Meridian Industrial Equipment (fictional)',
      sector: 'Industrial Machinery',
      location: 'MIDC Waluj, Aurangabad, Maharashtra',
      description: 'Heavy machinery and fabricated pressure vessel manufacturer for chemical plants.',
      contactEmail: 'procurement@meridian-industrial-fictional.in',
      isFictionalSample: true,
      isDemo: true,
    },
    {
      name: 'Volt Electricals Pvt Ltd (fictional)',
      sector: 'Electrical Equipment',
      location: 'Ambad MIDC, Nashik, Maharashtra',
      description: 'Manufacturer of industrial switchgear, control panels, and transformer enclosures.',
      contactEmail: 'supplier.onboarding@volt-electricals-fictional.in',
      isFictionalSample: true,
      isDemo: true,
    },
  ];

  const buyers = {};
  for (const b of buyersData) {
    let buyer = await Buyer.findOne({ name: b.name });
    if (!buyer) {
      buyer = await Buyer.create(b);
      console.log(`[SEED] Created Fictional Buyer: ${buyer.name}`);
    }
    buyers[b.name] = buyer;
  }

  // 3. Buyer Requirement Templates
  // Template 1: Apex Auto Components
  let apexTemplate = await RequirementTemplate.findOne({ name: 'Apex Auto - Supplier Quality Checklist (fictional)' });
  if (!apexTemplate) {
    apexTemplate = await RequirementTemplate.create({
      buyer: buyers['Apex Auto Components Ltd (fictional)']._id,
      name: 'Apex Auto - Supplier Quality Checklist (fictional)',
      version: '2.1',
      description: 'Automotive tier-1 readiness checklist covering ISO 9001, PPAP capabilities, and CNC precision standards.',
      sector: 'Automotive',
      requirements: [
        {
          code: 'APEX-REQ-01',
          title: 'Business Registration / Certificate of Incorporation',
          description: 'Valid MCA Certificate of Incorporation, Partnership Deed, or Shops & Establishment license.',
          plainLanguageExplanation: 'Proof that your factory is a legally registered company in India.',
          category: 'business_registration',
          checkType: CHECK_TYPES.DOCUMENT,
          isMandatory: true,
          requiredEvidenceCategory: 'business_registration',
        },
        {
          code: 'APEX-REQ-02',
          title: 'Goods & Services Tax (GST) Registration',
          description: 'Active GSTIN registration certificate showing manufacturing business address.',
          plainLanguageExplanation: 'Official GST Certificate showing your current factory address.',
          category: 'gst',
          checkType: CHECK_TYPES.DOCUMENT,
          isMandatory: true,
          requiredEvidenceCategory: 'gst',
        },
        {
          code: 'APEX-REQ-03',
          title: 'ISO 9001:2015 Quality Management Certification',
          description: 'Accredited ISO 9001 certificate with active validity period and annual surveillance audit clearance.',
          plainLanguageExplanation: 'Active ISO 9001 certificate proving your factory follows standard quality management procedures.',
          category: 'quality_certification',
          checkType: CHECK_TYPES.DOCUMENT_WITH_VALIDITY,
          isMandatory: true,
          requiredEvidenceCategory: 'quality_certification',
        },
        {
          code: 'APEX-REQ-04',
          title: 'Zero Defect Zero Effect (ZED) Certification',
          description: 'Ministry of MSME ZED Bronze, Silver, or Gold certification.',
          plainLanguageExplanation: 'Optional MSME ZED certificate demonstrating zero-defect manufacturing intent.',
          category: 'quality_certification',
          checkType: CHECK_TYPES.DOCUMENT,
          isMandatory: false,
          requiredEvidenceCategory: 'quality_certification',
        },
        {
          code: 'APEX-REQ-05',
          title: 'Instrument Calibration Records (Valid Within 1 Year)',
          description: 'NABL accredited lab calibration certificates for vernier calipers, micrometers, and gauges.',
          plainLanguageExplanation: 'Calibration certificates showing your measuring tools and gauges were tested by an accredited lab within the last 12 months.',
          category: 'calibration_record',
          checkType: CHECK_TYPES.DOCUMENT_WITH_VALIDITY,
          isMandatory: true,
          requiredEvidenceCategory: 'calibration_record',
        },
        {
          code: 'APEX-REQ-06',
          title: 'Batch Inspection Report & First Article Sample',
          description: 'Standard Inspection Report (FIR/MIR) covering dimensional tolerances and material hardness.',
          plainLanguageExplanation: 'Sample quality inspection report demonstrating how your staff records dimensions and passes batches.',
          category: 'inspection_report',
          checkType: CHECK_TYPES.DOCUMENT,
          isMandatory: true,
          requiredEvidenceCategory: 'inspection_report',
        },
        {
          code: 'APEX-REQ-07',
          title: 'Production Part Approval Process (PPAP Level 3)',
          description: 'PPAP Level 3 readiness dossier including Control Plan, Process Flow Diagram, and PFMEA.',
          plainLanguageExplanation: 'Technical automotive PPAP capability. Requires engineering assessment by Apex quality engineers.',
          category: 'inspection_report',
          checkType: CHECK_TYPES.MANUAL_ASSESSMENT,
          isMandatory: true,
        },
        {
          code: 'APEX-REQ-08',
          title: 'CNC Turning & Precision Machining Capability (<= 15 Microns)',
          description: 'Shop floor machinery capable of holding continuous tolerances <= 15 microns.',
          plainLanguageExplanation: 'Machine capability check: verified through roster of CNC lathes and coordinate measuring machines.',
          category: 'CNC turning',
          checkType: CHECK_TYPES.CAPABILITY,
          requiredCapability: 'CNC turning',
          isMandatory: true,
        },
      ],
      isDemo: true,
    });
    console.log(`[SEED] Created Template: ${apexTemplate.name}`);
  }

  // Template 2: Meridian Industrial Equipment
  let meridianTemplate = await RequirementTemplate.findOne({ name: 'Meridian - Industrial Equipment Checklist (fictional)' });
  if (!meridianTemplate) {
    meridianTemplate = await RequirementTemplate.create({
      buyer: buyers['Meridian Industrial Equipment (fictional)']._id,
      name: 'Meridian - Industrial Equipment Checklist (fictional)',
      version: '1.4',
      description: 'Requirements for fabrication and industrial equipment suppliers focusing on welding and traceability.',
      sector: 'Industrial Machinery',
      requirements: [
        {
          code: 'MER-REQ-01',
          title: 'Weld Inspection & Non-Destructive Testing (NDT) Reports',
          description: 'Dye Penetrant (DPT) or Ultrasonic testing reports for structural joints.',
          plainLanguageExplanation: 'Test reports proving weld joints have no subsurface cracks or porosity.',
          category: 'inspection_report',
          checkType: CHECK_TYPES.DOCUMENT,
          isMandatory: true,
          requiredEvidenceCategory: 'inspection_report',
        },
        {
          code: 'MER-REQ-02',
          title: 'Raw Material Mill Test Certificates (MTC) & Heat Traceability',
          description: 'Mill test certificates verifying chemical and tensile properties of steel plates/bars.',
          plainLanguageExplanation: 'Steel supplier test certificates showing heat numbers and chemical analysis.',
          category: 'product_testing_report',
          checkType: CHECK_TYPES.DOCUMENT,
          isMandatory: true,
          requiredEvidenceCategory: 'product_testing_report',
        },
        {
          code: 'MER-REQ-03',
          title: 'Factory Safety Audit & Fire NOC',
          description: 'Industrial safety compliance audit report or local Fire Department NOC.',
          plainLanguageExplanation: 'Safety inspection report showing fire extinguishers and worker PPE compliance.',
          category: 'safety_audit_record',
          checkType: CHECK_TYPES.DOCUMENT,
          isMandatory: true,
          requiredEvidenceCategory: 'safety_audit_record',
        },
        {
          code: 'MER-REQ-04',
          title: 'GST Registration Certificate',
          description: 'Active GSTIN certificate with verified state address.',
          plainLanguageExplanation: 'GST registration certificate.',
          category: 'gst',
          checkType: CHECK_TYPES.DOCUMENT,
          isMandatory: true,
          requiredEvidenceCategory: 'gst',
        },
        {
          code: 'MER-REQ-05',
          title: 'Udyam MSME Registration Certificate',
          description: 'Ministry of MSME Udyam registration card.',
          plainLanguageExplanation: 'Udyam registration showing Small or Micro enterprise status.',
          category: 'udyam',
          checkType: CHECK_TYPES.DOCUMENT,
          isMandatory: true,
          requiredEvidenceCategory: 'udyam',
        },
        {
          code: 'MER-REQ-06',
          title: 'Pollution Control Board Consent to Operate (CTO)',
          description: 'State Pollution Control Board Consent to Operate / Green category certification.',
          plainLanguageExplanation: 'Consent to operate from State Pollution Control Board.',
          category: 'environmental_certification',
          checkType: CHECK_TYPES.DOCUMENT,
          isMandatory: false,
          requiredEvidenceCategory: 'environmental_certification',
        },
      ],
      isDemo: true,
    });
    console.log(`[SEED] Created Template: ${meridianTemplate.name}`);
  }

  // Template 3: Volt Electricals Pvt Ltd
  let voltTemplate = await RequirementTemplate.findOne({ name: 'Volt Electricals - Vendor Readiness Checklist (fictional)' });
  if (!voltTemplate) {
    voltTemplate = await RequirementTemplate.create({
      buyer: buyers['Volt Electricals Pvt Ltd (fictional)']._id,
      name: 'Volt Electricals - Vendor Readiness Checklist (fictional)',
      version: '1.0',
      description: 'Readiness checklist for electrical enclosure and copper busbar component suppliers.',
      sector: 'Electrical Equipment',
      requirements: [
        {
          code: 'VOLT-REQ-01',
          title: 'Product Type Testing Report (CPRI or ERDA)',
          description: 'Type test report from CPRI, ERDA or NABL-accredited test laboratory.',
          plainLanguageExplanation: 'Official electrical insulation or short-circuit withstand test report from CPRI or ERDA.',
          category: 'product_testing_report',
          checkType: CHECK_TYPES.DOCUMENT,
          isMandatory: true,
          requiredEvidenceCategory: 'product_testing_report',
        },
        {
          code: 'VOLT-REQ-02',
          title: 'ISO 9001:2015 Quality Certificate',
          description: 'Valid ISO 9001 certificate.',
          plainLanguageExplanation: 'ISO 9001 certificate with active validity.',
          category: 'quality_certification',
          checkType: CHECK_TYPES.DOCUMENT_WITH_VALIDITY,
          isMandatory: true,
          requiredEvidenceCategory: 'quality_certification',
        },
        {
          code: 'VOLT-REQ-03',
          title: 'GST Registration',
          description: 'Active GST registration certificate.',
          plainLanguageExplanation: 'GST registration certificate.',
          category: 'gst',
          checkType: CHECK_TYPES.DOCUMENT,
          isMandatory: true,
          requiredEvidenceCategory: 'gst',
        },
        {
          code: 'VOLT-REQ-04',
          title: 'Udyam Registration',
          description: 'Valid Udyam certificate.',
          plainLanguageExplanation: 'MSME Udyam certificate.',
          category: 'udyam',
          checkType: CHECK_TYPES.DOCUMENT,
          isMandatory: true,
          requiredEvidenceCategory: 'udyam',
        },
        {
          code: 'VOLT-REQ-05',
          title: 'Monthly Production Capacity Statement',
          description: 'Demonstrated capacity of at least 50,000 sheet-metal or busbar units per month.',
          plainLanguageExplanation: 'Capacity statement showing your machinery and staffing can meet peak delivery schedules.',
          category: 'machine_capability_evidence',
          checkType: CHECK_TYPES.CAPABILITY,
          requiredCapability: 'sheet metal',
          isMandatory: true,
        },
      ],
      isDemo: true,
    });
    console.log(`[SEED] Created Template: ${voltTemplate.name}`);
  }

  // 4. Supplier 1: Shree Precision Components (Nashik)
  let supplier1User = await User.findOne({ email: 'shree@precision.in' });
  if (!supplier1User) {
    supplier1User = await User.create({
      name: 'Rameshwar Patil',
      email: 'shree@precision.in',
      password: 'Supplier@123456',
      role: ROLES.SUPPLIER,
      phone: '+91 94222 33445',
      isDemo: true,
    });
    console.log(`[SEED] Created Demo Supplier 1: ${supplier1User.email}`);
  }

  let supplier1Profile = await SupplierProfile.findOne({ supplier: supplier1User._id });
  if (!supplier1Profile) {
    supplier1Profile = await SupplierProfile.create({
      supplier: supplier1User._id,
      companyName: 'Shree Precision Components',
      description: 'Manufacturer of high-precision CNC turned and VMC milled components for automotive Tier-1 assemblies.',
      udyamNumber: 'UDYAM-MH-26-0014829',
      gstNumber: '27AABCS1429B1Z8',
      industryCategory: 'Manufacturing',
      manufacturingSector: 'Automotive & Precision Machining',
      location: {
        state: 'Maharashtra',
        city: 'Nashik',
        address: 'Plot W-42, Ambad Industrial Area, MIDC',
        pincode: '422010',
      },
      contact: {
        personName: 'Rameshwar Patil',
        phone: '+91 94222 33445',
        email: 'rameshwar@shreeprecision.in',
        designation: 'Managing Partner',
      },
      productsManufactured: ['Steering knuckle pins', 'Gear shafts', 'Fuel injector nozzles', 'Flange bushings'],
      manufacturingCapabilities: ['CNC turning', 'VMC milling', 'Precision surface grinding', 'Wire EDM'],
      machineryRoster: [
        { name: 'Ace Micromatic Super Jobber CNC Lathe', type: 'CNC turning', quantity: 2, keySpec: 'Chuck 200mm, 15-micron tolerance' },
        { name: 'BFW Agni VMC Milling Center', type: 'VMC milling', quantity: 1, keySpec: '800x500mm table, 10,000 RPM' },
        { name: 'Micromatic Cylindrical Grinder', type: 'Grinding', quantity: 1, keySpec: 'Max Dia 150mm, 5-micron roundness' },
      ],
      monthlyCapacity: '65,000 turned precision components',
      qcEquipment: ['Mitutoyo Coordinate Measuring Machine (CMM)', 'Trimos Height Gauge 600mm', 'Digital Micrometers (0-25mm, 25-50mm)', 'Mitutoyo Surface Roughness Tester SJ-210'],
      employeeCount: 32,
      profileCompleteness: 100,
      isDemo: true,
    });
    console.log(`[SEED] Created Profile for: ${supplier1Profile.companyName}`);
  }

  // 5. Documents for Supplier 1 (Mix of statuses: verified, pending, expiring soon, expired, rejected)
  const existingDocs1 = await Document.countDocuments({ supplier: supplier1User._id });
  if (existingDocs1 === 0) {
    console.log('[SEED] Generating realistic sample PDF documents for Supplier 1...');

    // Verified GST
    const pdfGst = await createSamplePdf({
      title: 'FORM GST REG-06 - REGISTRATION CERTIFICATE',
      category: 'gst',
      entityName: 'Shree Precision Components',
      validityText: 'Valid until cancelled',
    });
    await Document.create({
      supplier: supplier1User._id,
      name: 'GST Registration Certificate (REG-06)',
      category: 'gst',
      issueDate: new Date('2018-07-01'),
      expiryDate: null,
      description: 'Official GSTIN registration certificate for Nashik MIDC unit.',
      fileRef: {
        filename: pdfGst.filename,
        originalName: 'GST_Certificate_ShreePrecision.pdf',
        mimeType: 'application/pdf',
        size: pdfGst.size,
        storagePath: pdfGst.storagePath,
      },
      uploaded: true,
      reviewStatus: REVIEW_STATUSES.VERIFIED,
      reviewDetails: {
        reviewedBy: admin._id,
        reviewedAt: new Date(),
        reviewNotes: 'Verified against Maharashtra GST portal records.',
      },
      isDemo: true,
    });

    // Verified Business Registration
    const pdfBiz = await createSamplePdf({
      title: 'PARTNERSHIP DEED & REGISTRAR OF FIRMS CERTIFICATE',
      category: 'business_registration',
      entityName: 'Shree Precision Components',
    });
    await Document.create({
      supplier: supplier1User._id,
      name: 'Registrar of Firms Certificate & Deed',
      category: 'business_registration',
      issueDate: new Date('2015-04-12'),
      expiryDate: null,
      description: 'Registered partnership deed under Maharashtra ROF.',
      fileRef: {
        filename: pdfBiz.filename,
        originalName: 'Partnership_Registration_Shree.pdf',
        mimeType: 'application/pdf',
        size: pdfBiz.size,
        storagePath: pdfBiz.storagePath,
      },
      uploaded: true,
      reviewStatus: REVIEW_STATUSES.VERIFIED,
      reviewDetails: {
        reviewedBy: admin._id,
        reviewedAt: new Date(),
        reviewNotes: 'Entity constitution verified.',
      },
      isDemo: true,
    });

    // ISO 9001: Verified but EXPIRING SOON (14 days from now)
    const isoExpiry = new Date();
    isoExpiry.setDate(isoExpiry.getDate() + 14);
    const pdfIso = await createSamplePdf({
      title: 'ISO 9001:2015 QUALITY MANAGEMENT SYSTEM CERTIFICATE',
      category: 'quality_certification',
      entityName: 'Shree Precision Components',
      validityText: `Expires on ${isoExpiry.toLocaleDateString()}`,
    });
    await Document.create({
      supplier: supplier1User._id,
      name: 'ISO 9001:2015 Certificate (TUV Nord)',
      category: 'quality_certification',
      issueDate: new Date('2023-11-01'),
      expiryDate: isoExpiry,
      description: 'Annual surveillance audited ISO 9001:2015 certificate.',
      fileRef: {
        filename: pdfIso.filename,
        originalName: 'ISO9001_2015_TUV_Shree.pdf',
        mimeType: 'application/pdf',
        size: pdfIso.size,
        storagePath: pdfIso.storagePath,
      },
      uploaded: true,
      reviewStatus: REVIEW_STATUSES.VERIFIED,
      reviewDetails: {
        reviewedBy: admin._id,
        reviewedAt: new Date(),
        reviewNotes: 'Verified scope: Machining of precision automotive components.',
      },
      isDemo: true,
    });

    // Calibration Record: Verified but EXPIRING SOON (22 days from now)
    const calExpiry = new Date();
    calExpiry.setDate(calExpiry.getDate() + 22);
    const pdfCal = await createSamplePdf({
      title: 'NABL ACCREDITED GAUGE CALIBRATION CERTIFICATE',
      category: 'calibration_record',
      entityName: 'Shree Precision Components',
      validityText: `Valid until ${calExpiry.toLocaleDateString()}`,
    });
    await Document.create({
      supplier: supplier1User._id,
      name: 'Annual Gauge Calibration Certificate (NABL)',
      category: 'calibration_record',
      issueDate: new Date('2025-11-20'),
      expiryDate: calExpiry,
      description: 'Calibration report for Mitutoyo height gauge and digital micrometers.',
      fileRef: {
        filename: pdfCal.filename,
        originalName: 'Gauge_Calibration_Report_2025.pdf',
        mimeType: 'application/pdf',
        size: pdfCal.size,
        storagePath: pdfCal.storagePath,
      },
      uploaded: true,
      reviewStatus: REVIEW_STATUSES.VERIFIED,
      reviewDetails: {
        reviewedBy: admin._id,
        reviewedAt: new Date(),
        reviewNotes: 'Master calibration standards traceable to National Physical Laboratory.',
      },
      isDemo: true,
    });

    // Udyam Registration
    const pdfUdyam = await createSamplePdf({
      title: 'UDYAM REGISTRATION CERTIFICATE',
      category: 'udyam',
      entityName: 'Shree Precision Components',
    });
    await Document.create({
      supplier: supplier1User._id,
      name: 'Udyam Registration Certificate',
      category: 'udyam',
      issueDate: new Date('2021-02-15'),
      expiryDate: null,
      description: 'Small Enterprise classification under Ministry of MSME.',
      fileRef: {
        filename: pdfUdyam.filename,
        originalName: 'Udyam_Certificate_Shree.pdf',
        mimeType: 'application/pdf',
        size: pdfUdyam.size,
        storagePath: pdfUdyam.storagePath,
      },
      uploaded: true,
      reviewStatus: REVIEW_STATUSES.VERIFIED,
      reviewDetails: {
        reviewedBy: admin._id,
        reviewedAt: new Date(),
        reviewNotes: 'MSME classification verified.',
      },
      isDemo: true,
    });

    // Inspection Sample Report: PENDING REVIEW
    const pdfInsp = await createSamplePdf({
      title: 'FIRST ARTICLE INSPECTION REPORT (FAIR)',
      category: 'inspection_report',
      entityName: 'Shree Precision Components',
    });
    await Document.create({
      supplier: supplier1User._id,
      name: 'First Article Inspection Report - Knuckle Pin Batch 44',
      category: 'inspection_report',
      issueDate: new Date(),
      expiryDate: null,
      description: 'CMM inspection data sheet with 10 critical dimension measurements.',
      fileRef: {
        filename: pdfInsp.filename,
        originalName: 'FAIR_KnucklePin_Batch44.pdf',
        mimeType: 'application/pdf',
        size: pdfInsp.size,
        storagePath: pdfInsp.storagePath,
      },
      uploaded: true,
      reviewStatus: REVIEW_STATUSES.PENDING_REVIEW,
      isDemo: true,
    });

    // Safety Audit Report: PENDING REVIEW
    const pdfSafety = await createSamplePdf({
      title: 'FACTORY SAFETY AUDIT REPORT',
      category: 'safety_audit_record',
      entityName: 'Shree Precision Components',
    });
    await Document.create({
      supplier: supplier1User._id,
      name: 'Annual Factory Safety Audit (Industrial Hygiene)',
      category: 'safety_audit_record',
      issueDate: new Date(),
      expiryDate: null,
      description: 'Internal safety walkthrough covering machine guards, fire alarms and eye wash stations.',
      fileRef: {
        filename: pdfSafety.filename,
        originalName: 'Safety_Audit_Shree_2026.pdf',
        mimeType: 'application/pdf',
        size: pdfSafety.size,
        storagePath: pdfSafety.storagePath,
      },
      uploaded: true,
      reviewStatus: REVIEW_STATUSES.PENDING_REVIEW,
      isDemo: true,
    });

    // Old Environmental Record: EXPIRED (45 days ago)
    const expDate = new Date();
    expDate.setDate(expDate.getDate() - 45);
    const pdfEnv = await createSamplePdf({
      title: 'CONSENT TO OPERATE (CTO) - POLLUTION CONTROL BOARD',
      category: 'environmental_certification',
      entityName: 'Shree Precision Components',
      validityText: `Expired on ${expDate.toLocaleDateString()}`,
    });
    await Document.create({
      supplier: supplier1User._id,
      name: 'MPCB Consent to Operate (Air/Water)',
      category: 'environmental_certification',
      issueDate: new Date('2021-01-01'),
      expiryDate: expDate,
      description: 'Previous 5-year consent to operate from Maharashtra Pollution Control Board.',
      fileRef: {
        filename: pdfEnv.filename,
        originalName: 'MPCB_Consent_Expired.pdf',
        mimeType: 'application/pdf',
        size: pdfEnv.size,
        storagePath: pdfEnv.storagePath,
      },
      uploaded: true,
      reviewStatus: REVIEW_STATUSES.VERIFIED,
      reviewDetails: {
        reviewedBy: admin._id,
        reviewedAt: new Date('2021-02-01'),
        reviewNotes: 'Recorded historical consent; note expiry has passed.',
      },
      isDemo: true,
    });

    // Rejected Mill Test Certificate: REJECTED
    const pdfRej = await createSamplePdf({
      title: 'RAW MATERIAL MILL TEST CERTIFICATE (DEFECTIVE)',
      category: 'product_testing_report',
      entityName: 'Shree Precision Components',
    });
    await Document.create({
      supplier: supplier1User._id,
      name: 'Steel Bar Mill Test Certificate (Heat 9912)',
      category: 'product_testing_report',
      issueDate: new Date('2026-01-10'),
      expiryDate: null,
      description: 'EN8D round bar mill test certificate.',
      fileRef: {
        filename: pdfRej.filename,
        originalName: 'MTC_EN8D_Heat9912.pdf',
        mimeType: 'application/pdf',
        size: pdfRej.size,
        storagePath: pdfRej.storagePath,
      },
      uploaded: true,
      reviewStatus: REVIEW_STATUSES.REJECTED,
      reviewDetails: {
        reviewedBy: admin._id,
        reviewedAt: new Date(),
        reviewNotes: 'Scan illegible: Spectro analysis column numbers cannot be deciphered. Please upload 300 DPI scan.',
      },
      isDemo: true,
    });

    // Machine Capability Spec Sheet
    const pdfMach = await createSamplePdf({
      title: 'CNC MACHINE CAPABILITY STUDY (Cpk >= 1.67)',
      category: 'machine_capability_evidence',
      entityName: 'Shree Precision Components',
    });
    await Document.create({
      supplier: supplier1User._id,
      name: 'Ace Micromatic CNC Lathe - Cpk Capability Study',
      category: 'machine_capability_evidence',
      issueDate: new Date('2025-09-15'),
      expiryDate: null,
      description: 'Statistical process capability study verifying 12-micron diameter consistency over 50 samples.',
      fileRef: {
        filename: pdfMach.filename,
        originalName: 'Cpk_Study_Ace_CNC.pdf',
        mimeType: 'application/pdf',
        size: pdfMach.size,
        storagePath: pdfMach.storagePath,
      },
      uploaded: true,
      reviewStatus: REVIEW_STATUSES.VERIFIED,
      reviewDetails: {
        reviewedBy: admin._id,
        reviewedAt: new Date(),
        reviewNotes: 'Cpk study verified by technical reviewer.',
      },
      isDemo: true,
    });

    console.log('[SEED] Created 10 sample documents for Supplier 1.');
  }

  // 6. Corrective Actions for Supplier 1 (6 actions: open, in_progress, completed, overdue)
  const existingActions1 = await CorrectiveAction.countDocuments({ supplier: supplier1User._id });
  if (existingActions1 === 0) {
    const pastDue = new Date();
    pastDue.setDate(pastDue.getDate() - 5);

    const nearDue = new Date();
    nearDue.setDate(nearDue.getDate() + 3);

    const farDue = new Date();
    farDue.setDate(farDue.getDate() + 20);

    await CorrectiveAction.create([
      {
        supplier: supplier1User._id,
        title: 'Renew ISO 9001:2015 surveillance audit with TUV Nord',
        description: 'ISO 9001 certificate expires in 14 days. Coordinate surveillance audit date and fee payment.',
        relatedRequirementCode: 'APEX-REQ-03',
        relatedRequirementTitle: 'ISO 9001:2015 Quality Management Certification',
        relatedTemplate: apexTemplate._id,
        assignedTo: { name: 'Kailash Sharma', role: 'Quality Head' },
        priority: ACTION_PRIORITIES.CRITICAL,
        dueDate: nearDue,
        status: ACTION_STATUSES.IN_PROGRESS,
        notes: 'Auditor scheduled for coming Wednesday.',
        isDemo: true,
      },
      {
        supplier: supplier1User._id,
        title: 'Calibrate vernier height gauge at NABL testing center',
        description: 'Gauge calibration is due within 22 days. Send master gauge to Nashik Metrology Lab.',
        relatedRequirementCode: 'APEX-REQ-05',
        relatedRequirementTitle: 'Instrument Calibration Records',
        relatedTemplate: apexTemplate._id,
        assignedTo: { name: 'Kailash Sharma', role: 'Quality Head' },
        priority: ACTION_PRIORITIES.HIGH,
        dueDate: nearDue,
        status: ACTION_STATUSES.OPEN,
        isDemo: true,
      },
      {
        supplier: supplier1User._id,
        title: 'Compile PPAP Level 3 Process Flow Diagram & PFMEA',
        description: 'Prepare preliminary automotive PPAP Level 3 documentation for Apex quality engineer on-site assessment.',
        relatedRequirementCode: 'APEX-REQ-07',
        relatedRequirementTitle: 'Production Part Approval Process (PPAP Level 3)',
        relatedTemplate: apexTemplate._id,
        assignedTo: { name: 'Rameshwar Patil', role: 'Managing Partner' },
        priority: ACTION_PRIORITIES.HIGH,
        dueDate: pastDue, // OVERDUE!
        status: ACTION_STATUSES.OVERDUE,
        notes: 'Delayed due to plant expansion; drafting process flow diagram now.',
        isDemo: true,
      },
      {
        supplier: supplier1User._id,
        title: 'Re-scan Raw Material Mill Test Certificate for Heat 9912',
        description: 'Previous scan was rejected due to illegible spectro analysis numbers. Scan original at 300 DPI.',
        relatedRequirementCode: 'MER-REQ-02',
        relatedRequirementTitle: 'Raw Material Mill Test Certificates',
        assignedTo: { name: 'Vinay Deshmukh', role: 'Store Keeper' },
        priority: ACTION_PRIORITIES.MEDIUM,
        dueDate: pastDue, // OVERDUE!
        status: ACTION_STATUSES.OVERDUE,
        isDemo: true,
      },
      {
        supplier: supplier1User._id,
        title: 'Apply for MSME ZED Bronze certification online',
        description: 'Initiate online assessment on ZED portal to earn Bronze level badge.',
        relatedRequirementCode: 'APEX-REQ-04',
        relatedRequirementTitle: 'Zero Defect Zero Effect (ZED) Certification',
        relatedTemplate: apexTemplate._id,
        assignedTo: { name: 'Rameshwar Patil', role: 'Managing Partner' },
        priority: ACTION_PRIORITIES.LOW,
        dueDate: farDue,
        status: ACTION_STATUSES.OPEN,
        isDemo: true,
      },
      {
        supplier: supplier1User._id,
        title: 'Update GST certificate with new extension shed address',
        description: 'Added unit 2 shed in Ambad MIDC to GST portal profile.',
        relatedRequirementCode: 'APEX-REQ-02',
        relatedRequirementTitle: 'Goods & Services Tax (GST) Registration',
        relatedTemplate: apexTemplate._id,
        assignedTo: { name: 'Rameshwar Patil', role: 'Managing Partner' },
        priority: ACTION_PRIORITIES.MEDIUM,
        dueDate: pastDue,
        status: ACTION_STATUSES.COMPLETED,
        completedAt: new Date(),
        notes: 'Amendment completed on GST portal and PDF uploaded.',
        isDemo: true,
      },
    ]);
    console.log('[SEED] Created 6 corrective actions for Supplier 1.');
  }

  // 7. Initial Requirement Mapping for Supplier 1 against Apex Auto
  const docs1 = await Document.find({ supplier: supplier1User._id, isSoftDeleted: false });
  const mapping1Result = runMatchingEngine(apexTemplate, supplier1Profile, docs1, { warningDays: 30 });
  await RequirementMapping.findOneAndUpdate(
    { supplier: supplier1User._id, template: apexTemplate._id },
    {
      supplier: supplier1User._id,
      template: apexTemplate._id,
      buyer: apexTemplate.buyer,
      generatedAt: new Date(),
      readinessScore: mapping1Result.readinessScore,
      formula: mapping1Result.formula,
      disclaimer: mapping1Result.disclaimer,
      summary: mapping1Result.summary,
      results: mapping1Result.results,
      isDemo: true,
    },
    { upsert: true }
  );
  console.log(`[SEED] Computed and saved initial mapping for Supplier 1: Readiness ${mapping1Result.readinessScore}%`);

  // 8. Supplier 2: Kaveri Fabrication Works (Pune)
  let supplier2User = await User.findOne({ email: 'kaveri@fabrication.in' });
  if (!supplier2User) {
    supplier2User = await User.create({
      name: 'Sunil Jagtap',
      email: 'kaveri@fabrication.in',
      password: 'Supplier@123456',
      role: ROLES.SUPPLIER,
      phone: '+91 98811 55667',
      isDemo: true,
    });
    console.log(`[SEED] Created Demo Supplier 2: ${supplier2User.email}`);
  }

  let supplier2Profile = await SupplierProfile.findOne({ supplier: supplier2User._id });
  if (!supplier2Profile) {
    supplier2Profile = await SupplierProfile.create({
      supplier: supplier2User._id,
      companyName: 'Kaveri Fabrication Works',
      description: 'Specialists in heavy structural welding, sheet metal enclosures, and certified pressure parts.',
      udyamNumber: 'UDYAM-MH-26-0099881',
      gstNumber: '27BCDEF5512M1Z2',
      industryCategory: 'Manufacturing',
      manufacturingSector: 'Industrial Machinery',
      location: {
        state: 'Maharashtra',
        city: 'Pune',
        address: 'Gat No 112, Chakan-Talegaon Road, Mahalunge',
        pincode: '410501',
      },
      contact: {
        personName: 'Sunil Jagtap',
        phone: '+91 98811 55667',
        email: 'sunil@kaverifab.in',
        designation: 'Proprietor',
      },
      productsManufactured: ['Heavy machine bases', 'Pressure vessel shells', 'Electrical enclosures', 'Hydraulic tanks'],
      manufacturingCapabilities: ['TIG welding', 'MIG welding', 'Sheet metal shearing', 'Hydraulic press braking'],
      machineryRoster: [
        { name: 'Lincoln Electric Invertec TIG/MIG Welding Stations', type: 'Welding', quantity: 4, keySpec: '400A pulsed arc' },
        { name: 'Amada CNC Hydraulic Press Brake', type: 'Sheet metal', quantity: 1, keySpec: '150 Tons, 3100mm bend length' },
        { name: 'Hydraulic Shearing Machine', type: 'Cutting', quantity: 1, keySpec: 'Cuts up to 8mm MS plate' },
      ],
      monthlyCapacity: '35 Metric Tons of fabricated structures',
      qcEquipment: ['Dye Penetrant Testing (DPT) Kit', 'Magnetic Particle Inspection Yoke', 'Digital Ultrasonic Thickness Gauge', 'Weld Fillet Gauges'],
      employeeCount: 18,
      profileCompleteness: 95,
      isDemo: true,
    });
    console.log(`[SEED] Created Profile for: ${supplier2Profile.companyName}`);
  }

  // 9. Documents for Supplier 2 (matches Meridian Industrial Equipment checklist)
  const existingDocs2 = await Document.countDocuments({ supplier: supplier2User._id });
  if (existingDocs2 === 0) {
    const pdfGst2 = await createSamplePdf({
      title: 'FORM GST REG-06 - REGISTRATION CERTIFICATE',
      category: 'gst',
      entityName: 'Kaveri Fabrication Works',
    });
    await Document.create({
      supplier: supplier2User._id,
      name: 'GST Registration Certificate',
      category: 'gst',
      issueDate: new Date('2019-03-01'),
      expiryDate: null,
      fileRef: {
        filename: pdfGst2.filename,
        originalName: 'GST_KaveriFab.pdf',
        mimeType: 'application/pdf',
        size: pdfGst2.size,
        storagePath: pdfGst2.storagePath,
      },
      uploaded: true,
      reviewStatus: REVIEW_STATUSES.VERIFIED,
      isDemo: true,
    });

    const pdfUdyam2 = await createSamplePdf({
      title: 'UDYAM REGISTRATION CERTIFICATE',
      category: 'udyam',
      entityName: 'Kaveri Fabrication Works',
    });
    await Document.create({
      supplier: supplier2User._id,
      name: 'Udyam Registration Certificate',
      category: 'udyam',
      issueDate: new Date('2021-08-10'),
      expiryDate: null,
      fileRef: {
        filename: pdfUdyam2.filename,
        originalName: 'Udyam_KaveriFab.pdf',
        mimeType: 'application/pdf',
        size: pdfUdyam2.size,
        storagePath: pdfUdyam2.storagePath,
      },
      uploaded: true,
      reviewStatus: REVIEW_STATUSES.VERIFIED,
      isDemo: true,
    });

    const pdfWeld = await createSamplePdf({
      title: 'WELD INSPECTION DPT & NDT REPORT',
      category: 'inspection_report',
      entityName: 'Kaveri Fabrication Works',
    });
    await Document.create({
      supplier: supplier2User._id,
      name: 'Dye Penetrant Weld Inspection Report - Tank Seam #12',
      category: 'inspection_report',
      issueDate: new Date('2026-02-01'),
      expiryDate: null,
      fileRef: {
        filename: pdfWeld.filename,
        originalName: 'Weld_NDT_Kaveri.pdf',
        mimeType: 'application/pdf',
        size: pdfWeld.size,
        storagePath: pdfWeld.storagePath,
      },
      uploaded: true,
      reviewStatus: REVIEW_STATUSES.VERIFIED,
      isDemo: true,
    });

    const pdfSafety2 = await createSamplePdf({
      title: 'INDUSTRIAL SAFETY AUDIT & FIRE NOC',
      category: 'safety_audit_record',
      entityName: 'Kaveri Fabrication Works',
    });
    await Document.create({
      supplier: supplier2User._id,
      name: 'Chakan Fire Department NOC & Safety Clearance',
      category: 'safety_audit_record',
      issueDate: new Date('2025-10-01'),
      expiryDate: null,
      fileRef: {
        filename: pdfSafety2.filename,
        originalName: 'Fire_NOC_KaveriFab.pdf',
        mimeType: 'application/pdf',
        size: pdfSafety2.size,
        storagePath: pdfSafety2.storagePath,
      },
      uploaded: true,
      reviewStatus: REVIEW_STATUSES.VERIFIED,
      isDemo: true,
    });

    // Traceability MTC: Pending review
    const pdfTrace = await createSamplePdf({
      title: 'RAW MATERIAL MILL TEST CERTIFICATE (IS 2062 E250)',
      category: 'product_testing_report',
      entityName: 'Kaveri Fabrication Works',
    });
    await Document.create({
      supplier: supplier2User._id,
      name: 'SAIL Mill Test Certificate - IS 2062 Steel Plates',
      category: 'product_testing_report',
      issueDate: new Date('2026-01-20'),
      expiryDate: null,
      fileRef: {
        filename: pdfTrace.filename,
        originalName: 'SAIL_Plate_MTC_Kaveri.pdf',
        mimeType: 'application/pdf',
        size: pdfTrace.size,
        storagePath: pdfTrace.storagePath,
      },
      uploaded: true,
      reviewStatus: REVIEW_STATUSES.PENDING_REVIEW,
      isDemo: true,
    });

    console.log('[SEED] Created sample documents for Supplier 2.');
  }

  // 10. Corrective Actions for Supplier 2
  const existingActions2 = await CorrectiveAction.countDocuments({ supplier: supplier2User._id });
  if (existingActions2 === 0) {
    const due1 = new Date();
    due1.setDate(due1.getDate() + 7);

    await CorrectiveAction.create([
      {
        supplier: supplier2User._id,
        title: 'Renew Maharashtra Pollution Control Board (MPCB) Green Consent',
        description: 'Apply for consent renewal for welding and cutting shop.',
        relatedRequirementCode: 'MER-REQ-06',
        relatedRequirementTitle: 'Pollution Control Board Consent to Operate',
        relatedTemplate: meridianTemplate._id,
        assignedTo: { name: 'Sunil Jagtap', role: 'Proprietor' },
        priority: ACTION_PRIORITIES.MEDIUM,
        dueDate: due1,
        status: ACTION_STATUSES.OPEN,
        isDemo: true,
      },
      {
        supplier: supplier2User._id,
        title: 'Complete Welder Qualification Test (WQT) as per ASME Section IX',
        description: 'Qualify 2 senior MIG welders for boiler plate joints.',
        relatedRequirementCode: 'MER-REQ-01',
        relatedRequirementTitle: 'Weld Inspection & NDT Reports',
        relatedTemplate: meridianTemplate._id,
        assignedTo: { name: 'Amol Shinde', role: 'Fabrication Foreman' },
        priority: ACTION_PRIORITIES.HIGH,
        dueDate: due1,
        status: ACTION_STATUSES.IN_PROGRESS,
        isDemo: true,
      },
    ]);
    console.log('[SEED] Created corrective actions for Supplier 2.');
  }

  // Initial mapping for Supplier 2 against Meridian
  const docs2 = await Document.find({ supplier: supplier2User._id, isSoftDeleted: false });
  const mapping2Result = runMatchingEngine(meridianTemplate, supplier2Profile, docs2, { warningDays: 30 });
  await RequirementMapping.findOneAndUpdate(
    { supplier: supplier2User._id, template: meridianTemplate._id },
    {
      supplier: supplier2User._id,
      template: meridianTemplate._id,
      buyer: meridianTemplate.buyer,
      generatedAt: new Date(),
      readinessScore: mapping2Result.readinessScore,
      formula: mapping2Result.formula,
      disclaimer: mapping2Result.disclaimer,
      summary: mapping2Result.summary,
      results: mapping2Result.results,
      isDemo: true,
    },
    { upsert: true }
  );

  console.log(`[SEED] Computed and saved initial mapping for Supplier 2: Readiness ${mapping2Result.readinessScore}%`);
  console.log('[SEED] Database seeding complete!\n');
};

// If run directly via CLI (node seed/index.js)
if (process.argv[1] && (process.argv[1].endsWith('seed/index.js') || process.argv[1].endsWith('seed\\index.js'))) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error('[SEED FATAL]', err);
      process.exit(1);
    }
  })();
}
