# Quality Assurance Test Tracker
## Air Freight Quotation Management System

This document catalogs the test suite, coverage, and validation outcomes for the system.

---

## 1. Automated Unit Tests

Automated assertions are executed via `node tests/api_tests.js`.

| Test ID | Test Category | Target Function | Test Input | Expected Outcome | Actual Outcome | Status |
|---|---|---|---|---|---|---|
| **AUT-01** | Unit Logic | `calculateVolumetricWeight` | L: 100cm, W: 100cm, H: 100cm, Count: 1 | Volumetric Wt = `200 kg` | Volumetric Wt = `200 kg` | **PASSED** |
| **AUT-02** | Unit Logic | `calculateVolumetricWeight` | L: 50cm, W: 50cm, H: 50cm, Count: 2 | Volumetric Wt = `50 kg` | Volumetric Wt = `50 kg` | **PASSED** |
| **AUT-03** | Unit Logic | `calculateChargeableWeight` | Actual: 120kg, Volumetric: 150kg | Chargeable = `150 kg` (Volumetric) | Chargeable = `150 kg` | **PASSED** |
| **AUT-04** | Unit Logic | `calculateChargeableWeight` | Actual: 250kg, Volumetric: 180kg | Chargeable = `250 kg` (Actual) | Chargeable = `250 kg` | **PASSED** |
| **AUT-05** | Unit Logic | `getSlabDiscount` | Weight: 10kg (< 45kg) | Discount Factor = `1.0` (0% discount) | Factor = `1.0` | **PASSED** |
| **AUT-06** | Unit Logic | `getSlabDiscount` | Weight: 80kg (45-99kg) | Discount Factor = `0.9` (10% discount) | Factor = `0.9` | **PASSED** |
| **AUT-07** | Unit Logic | `getSlabDiscount` | Weight: 250kg (100-499kg) | Discount Factor = `0.8` (20% discount) | Factor = `0.8` | **PASSED** |
| **AUT-08** | Unit Logic | `getSlabDiscount` | Weight: 600kg (>= 500kg) | Discount Factor = `0.7` (30% discount) | Factor = `0.7` | **PASSED** |
| **AUT-09** | Unit Logic | `calculateQuotePricing` | Cargo weight: 120kg, Route rate: $4.50 | Base price: `$432.00` | Base price: `$432.00` | **PASSED** |
| **AUT-10** | Unit Logic | `calculateQuotePricing` | Cargo: Hazardous, Base price: $30.00 | Cargo surcharge: `$12.00` (40% fee) | Surcharge: `$12.00` | **PASSED** |
| **AUT-11** | Integration DB | `status_history` Seeding | Query status logs for `q-1` | 2 records returned, final state = `Approved` | 2 records returned, state = `Approved` | **PASSED** |
| **AUT-12** | Integration DB | `notifications` Seeding | Query notification dispatches for `q-1` | 2 records returned: `Email` & `WhatsApp` | 2 records returned | **PASSED** |

---

## 2. Manual Functional Verification

Manual validation checklist walk-throughs executed locally.

### 2.1 Quotation & Client Onboarding

*   **Test Case ID: MT-01**
    *   **Description**: Register a new client company in the Quotation form screen.
    *   **Inputs**: Company: "Tata Electronics", POC: "Aditya Roy", Email: "aroy@tata.com", Phone: "+919999888877".
    *   **Expected**: Customer is saved to the backend database, UI transitions back to list, and "Tata Electronics" is auto-selected.
    *   **Outcome**: Correctly registered, database verified, auto-selected in dropdown.
    *   **Status**: **PASSED**

*   **Test Case ID: MT-02**
    *   **Description**: Create a quotation with matching Origin and Destination airports.
    *   **Inputs**: Origin: "BOM", Destination: "BOM", cargo parameters.
    *   **Expected**: Client-side validation blocks execution, showing "Origin and Destination airports must be different."
    *   **Outcome**: Validation error alert displayed instantly, form blocked.
    *   **Status**: **PASSED**

### 2.2 Workflow & Automation Triggers

*   **Test Case ID: MT-03**
    *   **Description**: Approve a quotation (`Draft` -> `Approved`) from the quote detail workspace.
    *   **Action**: Click "Approve & Dispatch" with remark "Approved after documents clearance".
    *   **Expected**:
        1. Quote status updates to `Approved` in ledger.
        2. AWB record is generated.
        3. Invoice ledger record created matching total price.
        4. Simulated email & WhatsApp messages logged.
        5. Status history row logged.
    *   **Outcome**: Checked all 5 indicators. AWB created, Invoice created, WhatsApp notification logged, history timeline updated.
    *   **Status**: **PASSED**

*   **Test Case ID: MT-04**
    *   **Description**: Verify milestone advance updates inside Cargo Tracking.
    *   **Action**: Select the newly issued AWB, change status to `In-Transit`, shelf to `Aisle C - Shelf 4`, and save.
    *   **Expected**: Stepper progress bar moves, warehouse shelf details update in database and quotation detail dashboard logs.
    *   **Outcome**: Milestone visual stepper correctly lit up, updates persisted.
    *   **Status**: **PASSED**

### 2.3 AI Assistant Validation

*   **Test Case ID: MT-05**
    *   **Description**: Run AI Diagnostics on messy cargo descriptions.
    *   **Inputs**: "vaccines with cold packs to JFK".
    *   **Expected**: AI cleans description to "CLINICAL SPECIMENS, REFRIGERATED (PHARMACEUTICALS) - TEMP SENSITIVE 2-8°C", retrieves JFK-specific priority custom documents (FDA, USDA), suggests airline rate tables, and computes risk insurance quotes.
    *   **Outcome**: Diagnostic outputs parsed cleanly, customs list correctly displayed, rates tabulated.
    *   **Status**: **PASSED**

---

## 3. Environment & Conflict Verification

*   **Test Case ID: EV-01**
    *   **Description**: Build Vite React application for production.
    *   **Command**: `npm run build`
    *   **Expected**: Clean compilation, zero linter errors, generates output bundle `/dist`.
    *   **Outcome**: Production files created successfully in `/dist/assets` in 1.91 seconds.
    *   **Status**: **PASSED**
