# final review presentation slide outline
## Air Freight Quotation Management System
**Company**: ORBEM Solutions Private Limited  
**Academic Presentation**: Review Milestone 3 (Final Demo)

---

### Slide 1: Title Slide
- **Project Name**: Air Freight Quotation Management System
- **Company Sponsor**: ORBEM Solutions Private Limited
- **Team Size**: 3 Students
- **Roles**:
  - Student 1 (Frontend Developer)
  - Student 2 (Backend API Developer)
  - Student 3 (QA Auditor & Deployment Lead)

---

### Slide 2: Problem Statement & Vision
- **Problem**: Legacy manual calculations using static sheets delay response times, introduce pricing inconsistencies, hide revision details, and fail to track shipping milestones and claims.
- **Vision**: A consolidated logistics dashboard that automates volumetric pricing rules, manages quotation state transitions, runs AI diagnostics, generates bills, and tracks consignments in real-time.

---

### Slide 3: Objectives Checklist
- [x] Create automated pricing rules applying slab discounts dynamically.
- [x] Issue airway bills (AWB) and billing invoices instantly on approval.
- [x] Log historic quotes in version-controlled JSON blocks.
- [x] Map warehouse rack locations and consignment milestone steppers.
- [x] Log support claims and complaint resolution workflows.
- [x] Embed AI cargo diagnostic parsing.

---

### Slide 4: System Architecture Diagram
- **Presentation**: Single-page application built with React and Vite, utilizing a sleek dark CSS design.
- **Logic Broker**: Node.js and Express.js REST server.
- **Logic Module**: Volumetric pricing algorithm (`pricing_rules.js`).
- **Data Engine**: Relational SQLite3 database enforcing constraints.
- **Diagnostics**: Simulated AI analysis routines.

---

### Slide 5: Database Relational Schema
- **relational entity mapper**:
  - `customers` place `quotations`.
  - `quotations` generate `airway_bills` and `invoices`.
  - `quotations` log `revisions`, `claims`, `status_history`, and `notifications`.
- **Integrity**: Enforced foreign keys with `ON DELETE CASCADE` constraints.

---

### Slide 6: Quotation Workspace Walkthrough
- **Exporters Registration**: Instant inline exporter creation and auto-select.
- **Live Estimator**: Volumetric weight comparisons and slab discounts mapped dynamically on screen.
- **Status Workflows**: Transition from Draft to Approved, generating AWB numbers and invoice statements instantly.

---

### Slide 7: AI Cargo Diagnostics Helper
- **Standardizer**: Translates messy descriptions to standardized IATA descriptions.
- **Customs Prior Notice**: Generates CBP priority document checklists.
- **Carrier Rates**: Compares Emirates, Qatar, Lufthansa, and Singapore Cargo rates.
- **Insurance Premium**: Estimates damage risk payout coverage.

---

### Slide 8: Warehouse Tracking Stepper
- **AWB Lookup**: Query active airway bill tracking numbers.
- **Visual Stepper**: Six steps (Received -> Processed -> Departed -> In-Transit -> Arrived -> Delivered).
- **Racking slots**: Edit and save coordinates (e.g. Aisle B - Rack 3).

---

### Slide 9: Incident & Audit Logs
- **Support Claims**: Customer damage complaint submissions.
- **Audit Trails**: Visual timeline logging who updated status, when, and comments.
- **Simulated Communications**: scrolling feed showing WhatsApp alerts and emails sent.

---

### Slide 10: QA Testing Metrics
- **Logic coverage**: 100% assertions passed on volumetric formulas, slab limits, and surcharges.
- **DB coverage**: verified history timelines and notifications table constraints.
- **Manual coverage**: passed onboarding limits and conflict resolution checks.
- **Vite production compile**: successfully built client bundle in 1.91 seconds.

---

### Slide 11: Deployment & Cloud Strategy
- **Deploy instructions**:
  1. Build static pages: `npm run build` inside `/frontend`.
  2. Deploy API servers to Render/Railway free-tier slots.
  3. Deploy database using persistent file volume maps.
- **Configuration variables**: `.env` keys.

---

### Slide 12: Summary & Learnings
- **Learnings**: Practical experience mapping IATA volumetric standards, relational database rules, custom state components, and automated test coverages.
- **Future Enhancements**: Direct integration of real WhatsApp Business APIs and third-party airline cargo feeds.
- **Conclusion**: A production-grade prototype that successfully digitizes ORBEM logistics workflows.
