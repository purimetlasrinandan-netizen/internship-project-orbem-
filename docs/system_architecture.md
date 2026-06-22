# System Architecture Documentation

This document describes the logical, physical, and operational architecture of the **Air Freight Quotation Management System** for **ORBEM Solutions Private Limited**.

---

## Architecture Blueprint

The system follows a classic **Client-Server-Database** layout built on a modular web application foundation.

```text
+--------------------------------------------------------+
|                      CLIENT LAYER                      |
|                  Vite React Single Page App            |
|                                                        |
|  +--------------------+        +--------------------+  |
|  |  Dashboard / Lists |        |   Quotation Form   |  |
|  +--------------------+        +--------------------+  |
|  | AI Diagnostic Panel|        | Milestone Stepper  |  |
|  +--------------------+        +--------------------+  |
+---------------------------|----------------------------+
                            | HTTP / JSON REST
                            v
+--------------------------------------------------------+
|                     SERVICES LAYER                     |
|                   Express.js Router                    |
|                                                        |
|   +--------------------+      +--------------------+   |
|   |  Quotation Manager |      |   Pricing Engine   |   |
|   +--------------------+      +--------------------+   |
|   |    AI Diagnostic   |      |   Workflow State   |   |
|   |      Simulator     |      |      Trigger       |   |
|   +--------------------+      +--------------------+   |
+---------------------------|----------------------------+
                            | SQLite Connection
                            v
+--------------------------------------------------------+
|                     DATABASE LAYER                     |
|                     SQLite Engine                      |
|                 (database.sqlite file)                 |
+--------------------------------------------------------+
```

---

## Core Components

### 1. Presentation Client (Frontend)
- **Framework**: React.js bundled via Vite.
- **Styling**: Vanilla CSS utilizing CSS Custom Properties to establish a consistent, modern dark UI theme (glowing borders, blur-backdrop cards, and responsive grids).
- **Icons**: React components representing high-quality vectors from `lucide-react`.
- **State Management**: React context and local states to orchestrate route changes, select exporters, calculate client-side estimations, and view tracking milestones.

### 2. API Server (Backend)
- **Engine**: Node.js Express server.
- **Routing**: Modular endpoints processing shippers, routing airports, quotations, revisions history, airway bills, billing invoices, and claim incidents.
- **Middleware**: CORS (handling frontend cross-origin requests) and JSON body-parsers.

### 3. Business Logic pricing rules Engine (`pricing_rules.js`)
- **Chargeable Weight Calculator**: Standard volumetric calculation. Packs length, width, height, and count to calculate volumetric weight, comparing against gross actual weight.
- **Base Pricing Slab Discount**: Standardized weight tiers (<45kg, >=45kg, >=100kg, >=500kg) applying cumulative discounts.
- **Surcharges Engine**: Calculates fuel, handling, urgency, and hazard fees dynamically.
- **AI Diagnostics Module**: Simulates AI behaviors to rewrite cargo descriptions, retrieve custom document requirements, and parse transit legs.

### 4. Database Engine (`database.js`)
- **Technology**: SQLite relational database.
- **Driver**: `sqlite3` driver.
- **Relational Integrity**: Configured with pragma statements enforcing foreign keys. Contains structured seed routines to populate mock data automatically.
