# Project Diary / Logbook
## Air Freight Quotation Management System
**Company**: ORBEM Solutions Private Limited  
**Academic Year**: 2026  
**Team Structure**:
- **Student 1 (Frontend)**: UI, components, mockups, layout adjustments.
- **Student 2 (Backend)**: Database schema, Express routing, pricing formulas.
- **Student 3 (Testing & Deployment)**: Postman testing, automated verification scripts, deployment setup.

---

### Week 1: Project Initiation & Setup

#### Day 1 (01 June 2026)
- **Student 1**: Participated in the introduction video; analyzed the six frontend components required. Sketched UI layouts on paper.
- **Student 2**: Reviewed company overview and backend roles. Wrote down five fundamental questions regarding routing slab rates and database triggers.
- **Student 3**: Researched software testing methodologies, code repositories, and version control options. Started Day 1 logbook entry.
- **Deliverable**: Teams established, logbooks initialized, complete comprehension of system requirements.

#### Day 2 (02 June 2026)
- **Student 1**: Drafted the project problem statement from a UI perspective. Listed necessary user roles (Cargo Customer, Admin, Documentation Executive).
- **Student 2**: Outlined the system analysis problem statement. Defined API boundaries (create quote, update, get details, retrieve stats).
- **Student 3**: Created the team's GitHub repository. Established directories (`/frontend`, `/backend`, `/docs`, `/tests`) and pushed the initial `README.md`.
- **Deliverable**: Problem Statement and Abstract finalized and pushed to version control.

#### Day 3 (03 June 2026)
- **Student 1**: Defined five user objectives. Installed VS Code, Node.js environment, and initialized the React workspace via Vite.
- **Student 2**: Defined five technical objectives. Set up Express.js skeleton server and created a basic testing route.
- **Student 3**: Installed Postman for automated API verification. Executed a request checking the Hello world route on the backend server, logging results.
- **Deliverable**: Five objectives written, project development environment functional, first route tested.

#### Day 4 (04 June 2026)
- **Student 1**: Designed four wireframe screens (Quotation form, Admin ledger, AI Diagnostics, Consignment tracking).
- **Student 2**: Created the primary Use Case Diagram containing roles (Exporter, Warehouse Staff, Admin). Drafted API specs (JSON request/response fields).
- **Student 3**: Verified wireframe layouts against project inputs. Authored five initial test cases covering the quotation lifecycle.
- **Deliverable**: Wireframes and use case diagram pushed to `/docs`.

#### Day 5 (05 June 2026)
- **Student 1**: Created Review 1 slides for company overview and wireframe mockups. Conducted mock dry-run presentations.
- **Student 2**: Formulated slides explaining backend architecture objectives and API endpoints. Participated in mock review.
- **Student 3**: Created slides detailing repository structure and test strategy. Confirmed that all project folders are clean on GitHub.
- **Deliverable**: Review 1 PPT finished and practiced.

#### Day 6 (06 June 2026)
- **All Students**: Delivered the Review 1 Presentation to the mentor panel. Received score feedback and recorded suggestions regarding volumetric adjustments.
- **Deliverable**: Review 1 completed, feedback logged.

---

### Week 2: Analysis & Database Setup

#### Day 7 (08 June 2026)
- **Student 1**: Refined quotation creation wireframes based on Review 1 feedback. Drafted the base layout structure of the quote creator page.
- **Student 2**: Revised technical objectives. Researched IATA guidelines on volumetric weight calculation rules.
- **Student 3**: Updated the master test tracker list. Gathered bibliography and research articles on logistics systems for the literature survey.
- **Deliverable**: Review 1 feedback integrated, Week 2 research initiated.

#### Day 8 (09 June 2026)
- **Student 1**: Studied two market leaders in air cargo logistics. Authored comparative notes on layout efficiency and filtering widgets.
- **Student 2**: Conducted technical architecture analysis of existing legacy solutions. Documented system gaps (e.g. lack of version controls).
- **Student 3**: Summarized three key research papers on automated cargo pricing and routing rules for the literature survey.
- **Deliverable**: Existing System Analysis notes completed.

#### Day 9 (10 June 2026)
- **Student 1**: Wrote comparative tables summarizing manual processes versus the proposed system.
- **Student 2**: Designed the database schema mapping SQLite relations. Generated entity relationship diagrams (ERD) with keys and indices.
- **Student 3**: Generated the system test plan mapping tests to key milestones. Inspected DB fields to avoid missing parameters.
- **Deliverable**: Proposed System Description, ER Diagram, and DB Schema defined.

#### Day 10 (11 June 2026)
- **Student 1**: Built the React form fields for cargo inputs (L, W, H, counts, actual weights, and urgency selectors).
- **Student 2**: Setup SQLite3 relational database connection scripts (`database.js`). Coded the quotation creator table and tested insertion scripts.
- **Student 3**: Authored positive/negative API tests for quotation creation. Validated boundaries (zero weights, excessive package limits).
- **Deliverable**: SQLite tables initialized. `POST /api/quotes` functional and tested.

#### Day 11 (12 June 2026)
- **Student 1**: Constructed the dashboard main layout with visual indicator cards and status counters.
- **Student 2**: Added the quotation listing router (`GET /api/quotes`) supporting search queries and status filters.
- **Student 3**: Conducted JSON structure payload checks on list APIs using Postman parameters.
- **Deliverable**: Listing endpoint created; Dashboard static skeleton complete.

#### Day 12 (13 June 2026)
- **Student 1**: Opened feature branch for frontend layout code. Merged PR to main after resolution checks.
- **Student 2**: Opened feature branch for backend database configuration and initial endpoints. Completed clean pull request.
- **Student 3**: Reviewed branch merge conflicts. Verified that both applications boot correctly from a clean clone.
- **Deliverable**: Version branches merged; unified repository stable.

---

### Week 3: Core Logic & Review 2

#### Day 13 (15 June 2026)
- **Student 1**: Sketched mockups for the AI Assistant interface.
- **Student 2**: Formulated calculations module in `pricing_rules.js`, establishing chargeable weight and urgency surcharges.
- **Student 3**: Wrote ten testing assertions verifying volumetric formulas and slab discount percentages.
- **Deliverable**: Calculation module complete; unit tests added.

#### Day 14 (16 June 2026)
- **Student 1**: Finished UI layout codes. Compiled slides for Review 2.
- **Student 2**: Finalized schema scripts and tested revisions functionality. Prepared slides on DB schemas and ERD.
- **Student 3**: Compiled research notes for the final Literature Survey document. Prepared slides on testing and project structure.
- **Deliverable**: Review 2 materials ready.

#### Day 15 (17 June 2026)
- **Student 1**: Generated the logical System Architecture Diagram using draw.io. Pushed files to `/docs`.
- **Student 2**: Evaluated endpoint JSON formats. Checked compliance with RESTful api patterns.
- **Student 3**: Outlined full-system integration test procedures.
- **Deliverable**: System Architecture diagram pushed.

#### Day 16 (18 June 2026)
- **Student 1**: Integrated Axios calls connecting the Quote Creator form to the `POST /api/quotes` endpoint.
- **Student 2**: Added server-side validation error checks returning 400 bad requests for empty parameters.
- **Student 3**: Verified end-to-end quotation creation pipeline from browser page down to SQLite records.
- **Deliverable**: Exporter Quotation creator fully integrated.

#### Day 17 (19 June 2026)
- **All Students**: Presented Review 2 to the evaluators. Highlighted the SQLite relational design and the volumetric pricing engine.
- **Deliverable**: Review 2 completed.

#### Day 18 (20 June 2026)
- **Student 1**: Started coding status transition buttons and comments text boxes inside the Quotation Workspace view.
- **Student 2**: Created status modification endpoint `PUT /api/quotes/:id/status`. Coded automatic generation triggers for Invoices and AWB records.
- **Student 3**: Tested status change API logic. Checked that airway bills are successfully generated only upon Approved status changes.
- **Deliverable**: Quotation state transitions active.

---

### Week 4: Completion & Final Deliverables

#### Day 19 (22 June 2026)
- **Student 1**: Connected the dashboard counters to actual database APIs. Added visual indicators for urgent items.
- **Student 2**: Completed status automation logic. Designed and initialized the `status_history` and `notifications` tables.
- **Student 3**: Tested the integrated pipeline from quotation creation to status approval, verifying correct DB logging.
- **Deliverable**: Status lifecycle logs and alert triggers integrated into the system.

#### Day 20 (23 June 2026)
- **Student 1**: Designed the details workspace component (`QuoteDetail.jsx`), incorporating the status history timeline and notification logs.
- **Student 2**: Added GET history and GET notifications endpoints. Completed the claims management endpoints.
- **Student 3**: Ran full integration tests (Draft -> Approve -> Invoice generation -> AWB issuance -> warehouse shelf coordination).
- **Deliverable**: Quotation details workspace fully integrated.

#### Day 21 (24 June 2026)
- **Student 1**: Polished global CSS style sheets to establish outfit font variables, gradient overlays, and micro-animations.
- **Student 2**: Implemented try/catch blocks on all routing paths. Added debugging logs.
- **Student 3**: Tested error cases. Verified user-friendly warning dispatches for invalid routing formats.
- **Deliverable**: Visual layout polished; try-catch safety middleware active.

#### Day 22 (25 June 2026)
- **Student 1**: Configured API urls to transition between production and development configurations. Taken layout screenshots.
- **Student 2**: Wrote final SQLite schema and seeding guidelines.
- **Student 3**: Compiled deployment instruction checklists.
- **Deliverable**: Cloud deployment scripts finalized; documentation updated.

#### Day 23 (26 June 2026)
- **Student 1**: Verified responsive dashboard rendering on mobile and desktop layout configurations.
- **Student 2**: Performed SQL query optimizations.
- **Student 3**: Executed the complete test suite. Authored the final Bug Report documenting zero known blocking issues.
- **Deliverable**: Project bug logs finalized; test assertions passed.

#### Day 24 (27 June 2026)
- **Student 1**: Recorded the demo walkthrough video. Compiled final presentation slides.
- **Student 2**: Authored the project report conclusion and references.
- **Student 3**: Compiled the final PDF report. Conducted mock dry-run review session.
- **Deliverable**: Final presentation slides and report PDF ready.

---

### Week 5: Presentation & Wrap-up

#### Day 25 (29 June 2026)
- **All Students**: Submitted final project deliverables on the internship portal. Presented the final demo to the project panel, receiving praise for the AI assistant and notification dispatches.
- **Deliverable**: Review 3 demo completed.

#### Day 26 (30 June 2026)
- **All Students**: Participated in the team learnings panel. Documented final internship closing checklist and closed logs.
- **Deliverable**: Internship concluded.
