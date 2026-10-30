import PDFDocument from 'pdfkit';

/**
 * Generates the official ReadySupply Evidence Pack / Submission Package PDF.
 * Streams the generated PDF directly to the output stream.
 */
export const generateEvidencePackPDF = async ({
  supplierProfile,
  supplierUser,
  buyer,
  template,
  mapping,
  documents,
  actions,
  outputStream,
}) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
      bufferPages: true,
    });

    doc.pipe(outputStream);

    // Color definitions
    const primaryNavy = '#0B1F44';
    const primaryBlue = '#2563EB';
    const textDark = '#0F172A';
    const textMuted = '#64748B';
    const borderGrey = '#E2E8F0';
    const successGreen = '#16A34A';
    const warningOrange = '#D97706';
    const dangerRed = '#DC2626';

    // 1. Cover / Header Banner
    doc.rect(40, 40, 515, 80).fill(primaryNavy);
    doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold').text('ReadySupply', 60, 55);
    doc.fontSize(11).font('Helvetica').text('Intelligent Supplier-Readiness Platform for Indian MSMEs', 60, 82);
    doc.fontSize(9).font('Helvetica-Oblique').fillColor('#94A3B8')
      .text('Self-Prepared Supplier Evidence Dossier & Gap Assessment', 60, 98);

    doc.moveDown(4);

    // Metadata Grid
    const startY = 140;
    doc.rect(40, startY, 515, 105).strokeColor(borderGrey).stroke();
    
    doc.fillColor(textDark).fontSize(14).font('Helvetica-Bold')
      .text(supplierProfile.companyName || 'Supplier Profile', 55, startY + 15);
    
    doc.fontSize(10).font('Helvetica').fillColor(textMuted);
    doc.text(`Target Buyer: ${buyer?.name || 'Generic Buyer'}`, 55, startY + 38);
    doc.text(`Checklist Template: ${template?.name || 'Standard Checklist'}`, 55, startY + 54);
    doc.text(`Location: ${supplierProfile.location?.city || 'N/A'}, ${supplierProfile.location?.state || 'Maharashtra'}`, 55, startY + 70);
    doc.text(`Date of Compilation: ${new Date().toLocaleDateString('en-IN')}`, 55, startY + 86);

    // Readiness Indicator Score Box
    const score = mapping?.readinessScore || 0;
    const scoreColor = score >= 80 ? successGreen : score >= 50 ? warningOrange : dangerRed;

    doc.rect(400, startY + 12, 140, 80).fillAndStroke('#F8FAFC', borderGrey);
    doc.fillColor(scoreColor).fontSize(26).font('Helvetica-Bold').text(`${score}%`, 400, startY + 25, { width: 140, align: 'center' });
    doc.fillColor(textDark).fontSize(9).font('Helvetica-Bold').text('Readiness Indicator', 400, startY + 56, { width: 140, align: 'center' });
    doc.fillColor(textMuted).fontSize(7).font('Helvetica').text('Not an official approval score', 400, startY + 70, { width: 140, align: 'center' });

    doc.moveDown(3);

    // 2. Readiness Disclaimer Banner
    const discY = startY + 120;
    doc.rect(40, discY, 515, 36).fillAndStroke('#FEF3C7', '#F59E0B');
    doc.fillColor('#92400E').fontSize(8).font('Helvetica-Bold')
      .text('IMPORTANT DISCLAIMER & NOTICE:', 50, discY + 6);
    doc.fontSize(7.5).font('Helvetica')
      .text('This submission dossier is generated for preparation purposes only. ReadySupply is not a certification authority or buyer representative. Final supplier qualification and purchase order decisions rest exclusively with the buyer.', 50, discY + 18, { width: 495 });

    // 3. Company Profile Summary & Machinery Roster
    doc.moveDown(3);
    doc.fillColor(primaryNavy).fontSize(13).font('Helvetica-Bold').text('1. Company Profile & Capability Overview');
    doc.rect(40, doc.y + 2, 515, 1).fill(borderGrey);
    doc.moveDown(0.6);

    doc.fontSize(9).font('Helvetica').fillColor(textDark);
    doc.text(`GSTIN: ${supplierProfile.gstNumber || 'Not provided'}    |    Udyam: ${supplierProfile.udyamNumber || 'Not provided'}    |    Employees: ${supplierProfile.employeeCount || 0}`);
    doc.text(`Primary Sector: ${supplierProfile.manufacturingSector || 'General Machining'}`);
    doc.text(`Manufacturing Capabilities: ${(supplierProfile.manufacturingCapabilities || []).join(', ') || 'None specified'}`);
    doc.moveDown(0.5);

    if (supplierProfile.machineryRoster && supplierProfile.machineryRoster.length > 0) {
      doc.fillColor(textDark).fontSize(10).font('Helvetica-Bold').text('Machinery & Equipment Roster:');
      doc.moveDown(0.3);
      supplierProfile.machineryRoster.forEach((m, idx) => {
        doc.fillColor(textMuted).fontSize(8.5).font('Helvetica')
          .text(`  • ${m.name} (${m.type}) - Qty: ${m.quantity} ${m.keySpec ? `[Spec: ${m.keySpec}]` : ''}`);
      });
    }

    // 4. Buyer Checklist & Status Matrix
    doc.addPage();
    doc.fillColor(primaryNavy).fontSize(13).font('Helvetica-Bold').text('2. Buyer Requirements & Evidence Mapping Matrix');
    doc.rect(40, doc.y + 2, 515, 1).fill(borderGrey);
    doc.moveDown(0.8);

    // Table Header
    const colCode = 40;
    const colTitle = 95;
    const colStatus = 290;
    const colEvidence = 410;

    let rowY = doc.y;
    doc.rect(40, rowY, 515, 20).fill('#F1F5F9');
    doc.fillColor(textDark).fontSize(8).font('Helvetica-Bold');
    doc.text('Code', colCode + 5, rowY + 6);
    doc.text('Requirement Title', colTitle, rowY + 6);
    doc.text('Readiness Status', colStatus, rowY + 6);
    doc.text('Evidence / Document', colEvidence, rowY + 6);
    doc.moveDown(1.5);

    rowY += 22;

    const results = mapping?.results || [];
    for (const res of results) {
      if (rowY > 740) {
        doc.addPage();
        rowY = 50;
      }

      doc.rect(40, rowY, 515, 24).strokeColor(borderGrey).stroke();

      doc.fillColor(textDark).fontSize(8).font('Helvetica-Bold').text(res.requirementCode, colCode + 5, rowY + 7);
      doc.font('Helvetica').fontSize(7.5).text(res.requirementTitle.substring(0, 42), colTitle, rowY + 7, { width: 190 });

      // Format status
      let statusColor = textMuted;
      if (res.status === 'fulfilled_by_evidence') statusColor = successGreen;
      else if (res.status === 'expiring_soon') statusColor = warningOrange;
      else if (res.status === 'missing' || res.status === 'evidence_expired') statusColor = dangerRed;
      else if (res.status === 'needs_manual_assessment') statusColor = primaryBlue;

      doc.fillColor(statusColor).fontSize(7).font('Helvetica-Bold')
        .text(res.status.replace(/_/g, ' ').toUpperCase(), colStatus, rowY + 7);

      const docName = res.matchedDocumentName || (res.status === 'needs_manual_assessment' ? 'On-site technical audit' : 'Missing');
      doc.fillColor(textMuted).fontSize(7).font('Helvetica')
        .text(docName.substring(0, 26), colEvidence, rowY + 7);

      rowY += 26;
    }

    // 5. Open Corrective Actions Section
    if (actions && actions.length > 0) {
      if (rowY > 600) {
        doc.addPage();
        rowY = 50;
      } else {
        rowY += 20;
      }

      doc.fillColor(primaryNavy).fontSize(13).font('Helvetica-Bold').text('3. Corrective Action Plan', 40, rowY);
      doc.rect(40, rowY + 16, 515, 1).fill(borderGrey);
      rowY += 26;

      for (const act of actions) {
        if (rowY > 740) {
          doc.addPage();
          rowY = 50;
        }

        doc.rect(40, rowY, 515, 28).strokeColor(borderGrey).stroke();
        doc.fillColor(textDark).fontSize(8).font('Helvetica-Bold').text(act.title, 50, rowY + 5);
        doc.fillColor(textMuted).fontSize(7.5).font('Helvetica')
          .text(`Assigned: ${act.assignedTo?.name || 'Unassigned'}  |  Priority: ${act.priority.toUpperCase()}  |  Due: ${new Date(act.dueDate).toLocaleDateString()}  |  Status: ${act.status.toUpperCase()}`, 50, rowY + 16);
        rowY += 32;
      }
    }

    // 6. Mandatory Footer on Every Page
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      
      // Top subtle header rule
      doc.rect(40, 25, 515, 0.5).fill('#CBD5E1');
      doc.fillColor('#94A3B8').fontSize(7).font('Helvetica')
        .text('ReadySupply MSME Readiness Dossier', 40, 16);
      doc.text(`Supplier: ${supplierProfile.companyName || 'MSME Supplier'}`, 350, 16, { align: 'right', width: 205 });

      // Bottom mandatory footer
      doc.rect(40, 785, 515, 0.5).fill('#CBD5E1');
      doc.fillColor('#64748B').fontSize(7.5).font('Helvetica')
        .text('Preparation document generated by ReadySupply. Not a certification or supplier approval. Final approval rests with the buyer.', 40, 792, {
          align: 'center',
          width: 515,
        });
      doc.fontSize(7).font('Helvetica')
        .text(`Page ${i + 1} of ${range.count}`, 40, 804, { align: 'center', width: 515 });
    }

    doc.end();
    outputStream.on('finish', () => resolve());
    outputStream.on('error', (err) => reject(err));
  });
};

