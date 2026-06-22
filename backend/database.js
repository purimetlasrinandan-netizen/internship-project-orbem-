const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = process.env.DB_PATH || path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    db.run('PRAGMA foreign_keys = ON;', (err) => {
      if (err) console.error('Pragma error:', err);
    });
    initTables();
  }
});

// Helper wrapper to run SQL with Promises
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

// Helper to get a single row
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Helper to get multiple rows
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Initialize tables
function initTables() {
  db.serialize(() => {
    // 1. Customers Table
    db.run(`CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      company TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 2. Airports Table
    db.run(`CREATE TABLE IF NOT EXISTS airports (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      country TEXT NOT NULL
    )`);

    // 3. Airline Rates Table
    db.run(`CREATE TABLE IF NOT EXISTS airline_rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      airline_name TEXT NOT NULL,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      rate_per_kg REAL NOT NULL,
      transit_days INTEGER NOT NULL,
      validity TEXT NOT NULL
    )`);

    // 4. Quotations Table
    db.run(`CREATE TABLE IF NOT EXISTS quotations (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      cargo_type TEXT NOT NULL,
      package_count INTEGER NOT NULL,
      actual_weight REAL NOT NULL,
      length REAL NOT NULL,
      width REAL NOT NULL,
      height REAL NOT NULL,
      volumetric_weight REAL NOT NULL,
      chargeable_weight REAL NOT NULL,
      urgency TEXT CHECK(urgency IN ('Standard', 'Express', 'Flash')),
      base_price REAL NOT NULL,
      fuel_surcharge REAL NOT NULL,
      security_charge REAL NOT NULL,
      urgency_charge REAL NOT NULL,
      total_price REAL NOT NULL,
      status TEXT CHECK(status IN ('Draft', 'Pending Approval', 'Approved', 'Rejected', 'Revision Required')) DEFAULT 'Draft',
      owner TEXT NOT NULL,
      remarks TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )`);

    // 5. Revisions Table
    db.run(`CREATE TABLE IF NOT EXISTS revisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quotation_id TEXT NOT NULL,
      revision_number INTEGER NOT NULL,
      previous_data TEXT NOT NULL,
      reason TEXT NOT NULL,
      updated_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE
    )`);

    // 6. Airway Bills (Shipments) Table
    db.run(`CREATE TABLE IF NOT EXISTS airway_bills (
      id TEXT PRIMARY KEY,
      quotation_id TEXT UNIQUE NOT NULL,
      awb_number TEXT UNIQUE NOT NULL,
      flight_number TEXT NOT NULL,
      warehouse_location TEXT NOT NULL,
      dispatch_status TEXT CHECK(dispatch_status IN ('Received', 'Processed', 'Departed', 'In-Transit', 'Arrived', 'Delivered')) DEFAULT 'Received',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE
    )`);

    // 7. Invoices Table
    db.run(`CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      quotation_id TEXT UNIQUE NOT NULL,
      invoice_number TEXT UNIQUE NOT NULL,
      amount REAL NOT NULL,
      payment_status TEXT CHECK(payment_status IN ('Unpaid', 'Paid', 'Overdue')) DEFAULT 'Unpaid',
      due_date DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE
    )`);

    // 8. Claims/Complaints Table
    db.run(`CREATE TABLE IF NOT EXISTS claims (
      id TEXT PRIMARY KEY,
      quotation_id TEXT NOT NULL,
      claim_type TEXT CHECK(claim_type IN ('Complaint', 'Insurance Claim')),
      status TEXT CHECK(status IN ('Submitted', 'Investigating', 'Approved', 'Rejected')) DEFAULT 'Submitted',
      details TEXT NOT NULL,
      claim_amount REAL DEFAULT 0.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE
    )`);

    // 9. Status History Audit Trail Table
    db.run(`CREATE TABLE IF NOT EXISTS status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quotation_id TEXT NOT NULL,
      status TEXT NOT NULL,
      remarks TEXT,
      updated_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE
    )`);

    // 10. Communication Notifications Log Table
    db.run(`CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      quotation_id TEXT NOT NULL,
      type TEXT CHECK(type IN ('Email', 'WhatsApp')) NOT NULL,
      recipient TEXT NOT NULL,
      subject_message TEXT NOT NULL,
      status TEXT CHECK(status IN ('Sent', 'Failed')) DEFAULT 'Sent',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE
    )`);

    // Seed Data
    seedData();
  });
}

function seedData() {
  // Check if customers already exist
  db.get("SELECT COUNT(*) as count FROM customers", (err, row) => {
    if (err) return console.error('Error seeding check:', err.message);
    if (row.count > 0) return; // DB already seeded

    console.log('Seeding initial database data...');

    // Run all insertions in serialized block to guarantee referential constraint ordering
    db.serialize(() => {
      // Seed Customers
      db.run("INSERT INTO customers (id, name, email, phone, company) VALUES ('cust-1', 'John Doe', 'john.doe@tatabusiness.com', '+919876543210', 'Tata Logistics')");
      db.run("INSERT INTO customers (id, name, email, phone, company) VALUES ('cust-2', 'Sarah Jenkins', 'sjenkins@globalpharma.com', '+12025550143', 'Global Pharma Inc.')");
      db.run("INSERT INTO customers (id, name, email, phone, company) VALUES ('cust-3', 'Hiroshi Tanaka', 'tanaka@apextech.co.jp', '+81355550199', 'Apex Tech Corp')");

      // Seed Airports
      db.run("INSERT INTO airports (code, name, city, country) VALUES ('BOM', 'Chhatrapati Shivaji Maharaj International Airport', 'Mumbai', 'India')");
      db.run("INSERT INTO airports (code, name, city, country) VALUES ('JFK', 'John F. Kennedy International Airport', 'New York', 'United States')");
      db.run("INSERT INTO airports (code, name, city, country) VALUES ('FRA', 'Frankfurt Airport', 'Frankfurt', 'Germany')");
      db.run("INSERT INTO airports (code, name, city, country) VALUES ('DXB', 'Dubai International Airport', 'Dubai', 'United Arab Emirates')");
      db.run("INSERT INTO airports (code, name, city, country) VALUES ('SIN', 'Singapore Changi Airport', 'Singapore', 'Singapore')");
      db.run("INSERT INTO airports (code, name, city, country) VALUES ('LHR', 'London Heathrow Airport', 'London', 'United Kingdom')");

      // Seed Airline Rates
      db.run("INSERT INTO airline_rates (airline_name, origin, destination, rate_per_kg, transit_days, validity) VALUES ('Emirates SkyCargo', 'BOM', 'DXB', 1.8, 1, '2026-12-31')");
      db.run("INSERT INTO airline_rates (airline_name, origin, destination, rate_per_kg, transit_days, validity) VALUES ('Emirates SkyCargo', 'BOM', 'JFK', 4.5, 2, '2026-12-31')");
      db.run("INSERT INTO airline_rates (airline_name, origin, destination, rate_per_kg, transit_days, validity) VALUES ('Qatar Airways Cargo', 'BOM', 'FRA', 3.2, 2, '2026-12-31')");
      db.run("INSERT INTO airline_rates (airline_name, origin, destination, rate_per_kg, transit_days, validity) VALUES ('Lufthansa Cargo', 'FRA', 'JFK', 2.8, 1, '2026-12-31')");
      db.run("INSERT INTO airline_rates (airline_name, origin, destination, rate_per_kg, transit_days, validity) VALUES ('Singapore Airlines Cargo', 'SIN', 'BOM', 2.2, 1, '2026-12-31')");
      db.run("INSERT INTO airline_rates (airline_name, origin, destination, rate_per_kg, transit_days, validity) VALUES ('British Airways World Cargo', 'LHR', 'BOM', 3.5, 2, '2026-12-31')");

      // Seed Quotations
      db.run(`INSERT INTO quotations (id, customer_id, origin, destination, cargo_type, package_count, actual_weight, length, width, height, volumetric_weight, chargeable_weight, urgency, base_price, fuel_surcharge, security_charge, urgency_charge, total_price, status, owner, remarks, created_at, updated_at)
              VALUES ('q-1', 'cust-1', 'BOM', 'DXB', 'General Cargo', 10, 150.0, 60.0, 50.0, 40.0, 240.0, 240.0, 'Standard', 432.0, 48.0, 25.0, 0.0, 505.0, 'Approved', 'Operations Staff A', 'Automated standard rate calculation for machinery parts.', '2026-06-10 10:00:00', '2026-06-10 10:00:00')`);
      
      db.run(`INSERT INTO quotations (id, customer_id, origin, destination, cargo_type, package_count, actual_weight, length, width, height, volumetric_weight, chargeable_weight, urgency, base_price, fuel_surcharge, security_charge, urgency_charge, total_price, status, owner, remarks, created_at, updated_at)
              VALUES ('q-2', 'cust-2', 'BOM', 'FRA', 'Perishable (Pharma)', 5, 80.0, 50.0, 50.0, 50.0, 125.0, 125.0, 'Express', 400.0, 25.0, 20.0, 50.0, 495.0, 'Pending Approval', 'Operations Staff B', 'Urgent cold-chain pharmaceutical cargo.', '2026-06-17 14:30:00', '2026-06-17 14:30:00')`);

      db.run(`INSERT INTO quotations (id, customer_id, origin, destination, cargo_type, package_count, actual_weight, length, width, height, volumetric_weight, chargeable_weight, urgency, base_price, fuel_surcharge, security_charge, urgency_charge, total_price, status, owner, remarks, created_at, updated_at)
              VALUES ('q-3', 'cust-3', 'FRA', 'JFK', 'Hazardous Chemicals', 2, 45.0, 40.0, 40.0, 40.0, 25.6, 45.0, 'Flash', 126.0, 15.0, 15.0, 75.0, 231.0, 'Draft', 'Operations Staff A', 'Hazardous lithium battery packaging.', '2026-06-18 09:15:00', '2026-06-18 09:15:00')`);

      // Seed Airway Bill for q-1
      db.run("INSERT INTO airway_bills (id, quotation_id, awb_number, flight_number, warehouse_location, dispatch_status) VALUES ('awb-1', 'q-1', '176-48293048', 'EK-501', 'Aisle B - Shelf 3', 'Processed')");

      // Seed Invoice for q-1
      db.run("INSERT INTO invoices (id, quotation_id, invoice_number, amount, payment_status, due_date) VALUES ('inv-1', 'q-1', 'INV-2026-0001', 505.0, 'Paid', '2026-07-10 23:59:59')");

      // Seed Claim/Complaint for q-2
      db.run("INSERT INTO claims (id, quotation_id, claim_type, status, details, claim_amount) VALUES ('clm-1', 'q-2', 'Complaint', 'Submitted', 'Temperature logger showed variance in cold-chain box during ground handling.', 0.0)");

      // Seed Status History for q-1
      db.run("INSERT INTO status_history (quotation_id, status, remarks, updated_by, created_at) VALUES ('q-1', 'Draft', 'Initial cargo details entered', 'Operations Staff A', '2026-06-10 09:15:00')");
      db.run("INSERT INTO status_history (quotation_id, status, remarks, updated_by, created_at) VALUES ('q-1', 'Approved', 'Automated standard rate calculation for machinery parts.', 'Operations Staff A', '2026-06-10 10:00:00')");

      // Seed Status History for q-2
      db.run("INSERT INTO status_history (quotation_id, status, remarks, updated_by, created_at) VALUES ('q-2', 'Draft', 'Draft created', 'Operations Staff B', '2026-06-17 14:00:00')");
      db.run("INSERT INTO status_history (quotation_id, status, remarks, updated_by, created_at) VALUES ('q-2', 'Pending Approval', 'Urgent cold-chain pharmaceutical cargo.', 'Operations Staff B', '2026-06-17 14:30:00')");

      // Seed Notifications for q-1
      db.run("INSERT INTO notifications (id, quotation_id, type, recipient, subject_message, status, created_at) VALUES ('nt-1', 'q-1', 'Email', 'john.doe@tatabusiness.com', 'Your quotation q-1 has been Approved. Total cost: $505.00', 'Sent', '2026-06-10 10:00:10')");
      db.run("INSERT INTO notifications (id, quotation_id, type, recipient, subject_message, status, created_at) VALUES ('nt-2', 'q-1', 'WhatsApp', '+919876543210', 'ORBEM ALERT: AWB 176-48293048 has been generated for your cargo to DXB.', 'Sent', '2026-06-10 10:00:15')");

      console.log('Database seeded successfully.');
    });
  });
}

module.exports = {
  db,
  run,
  get,
  all
};
