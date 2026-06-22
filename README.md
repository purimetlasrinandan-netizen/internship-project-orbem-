# Air Freight Quotation Management System

A comprehensive, production-ready reference prototype built for **ORBEM Solutions Private Limited**. This system streamlines the creation, validation, pricing, approval workflow, and consignment tracking of air cargo quotations.

## Project Structure
```text
├── backend/            # Express.js REST API server & SQLite database
├── frontend/           # React (Vite) single-page application
├── docs/               # System architecture, schemas, and reports
└── tests/              # Automated API & logic test suite
```

## Features
- **Chargeable Weight Calculator**: Computes actual vs volumetric weight using standard IATA formulas `(L * W * H) / 5000`.
- **Slab-Based Pricing Engine**: Calculates quotes dynamically with base routing rates, fuel surcharges, handling fees, and urgency tiers.
- **Workflow Approval System**: Supports status progressions: `Draft` -> `Pending Approval` -> `Approved` / `Rejected` / `Revision Required`.
- **AI Cargo Assistant**: Clean cargo descriptions, suggest optimal flight routes, recommend insurance premiums, and automatically build customs checklists.
- **Milestone & Tracking**: Automatic Airway Bill (AWB) generation, invoice generation, warehouse location management, and status updates.
- **Claims & Support**: Handle exporter complaints and claims.

## Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

## Getting Started

### 1. Run the Backend
```bash
cd backend
npm install
npm run dev
```
The server will run at `http://localhost:5000`.

### 2. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
The application will run at `http://localhost:5173`.
