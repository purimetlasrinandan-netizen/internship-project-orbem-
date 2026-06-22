// Automated API & Logic verification test suite for Air Freight system
const assert = require('assert');
const { 
  calculateVolumetricWeight, 
  calculateChargeableWeight, 
  getSlabDiscount, 
  calculateQuotePricing 
} = require('../backend/pricing_rules');

console.log('========================================');
console.log('   RUNNING LOGISTICS LOGIC TEST SUITE   ');
console.log('========================================\n');

function runTest(name, fn) {
  try {
    fn();
    console.log(`✓ [PASSED] : ${name}`);
  } catch (err) {
    console.error(`✗ [FAILED] : ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// 1. Test Volumetric Weight Calculation
runTest('Volumetric Weight Calculation Formula', () => {
  // Package: 100x100x100 cm, Qty: 1
  // Vol weight = (100 * 100 * 100 * 1) / 5000 = 200 kg
  const w1 = calculateVolumetricWeight(100, 100, 100, 1);
  assert.strictEqual(w1, 200);

  // Package: 50x50x50 cm, Qty: 2
  // Vol weight = (50 * 50 * 50 * 2) / 5000 = 50 kg
  const w2 = calculateVolumetricWeight(50, 50, 50, 2);
  assert.strictEqual(w2, 50);
});

// 2. Test Chargeable Weight Calculation
runTest('Chargeable Weight Max Selection', () => {
  // Actual weight 120kg, Volumetric weight 150kg -> Chargeable 150kg
  const chg1 = calculateChargeableWeight(120, 150);
  assert.strictEqual(chg1, 150);

  // Actual weight 250kg, Volumetric weight 180kg -> Chargeable 250kg
  const chg2 = calculateChargeableWeight(250, 180);
  assert.strictEqual(chg2, 250);
});

// 3. Test Slab Discount Multipliers
runTest('Slab weight discount rates', () => {
  // < 45 kg -> no discount (1.0)
  assert.strictEqual(getSlabDiscount(10), 1.0);
  assert.strictEqual(getSlabDiscount(44.9), 1.0);

  // 45 to 99 kg -> 10% discount (0.9)
  assert.strictEqual(getSlabDiscount(45), 0.9);
  assert.strictEqual(getSlabDiscount(99.9), 0.9);

  // 100 to 499 kg -> 20% discount (0.8)
  assert.strictEqual(getSlabDiscount(100), 0.8);
  assert.strictEqual(getSlabDiscount(499), 0.8);

  // >= 500 kg -> 30% discount (0.7)
  assert.strictEqual(getSlabDiscount(500), 0.7);
  assert.strictEqual(getSlabDiscount(1200), 0.7);
});

// 4. Test Complete Quotation Costing Breakdown
runTest('Pricing Engine Cost Breakdown math', () => {
  // Case: BOM to JFK, Actual weight 120kg, 100x100x50 cm package, qty 1, urgency Standard, General Cargo
  // Volumetric: (100 * 100 * 50 * 1)/5000 = 100 kg
  // Chargeable: Max(120, 100) = 120 kg
  // Base rate on route: $4.50/kg
  // Slab discount for 120kg: 20% discount (multiplier 0.80) -> Effective Rate: $3.60/kg
  // Base Price: 120 * $3.60 = $432.00
  // Fuel Surcharge: 120 * $0.20 = $24.00 (above $10 minimum)
  // Security Surcharge: Max(1 * $15, 120 * $0.10) = Max(15, 12) = $15.00
  // Urgency Fee (Standard): $0.00
  // Cargo Special Fee (General): $0.00
  // Total: 432 + 24 + 15 + 0 + 0 = $471.00
  
  const pricing = calculateQuotePricing({
    actualWeight: 120,
    length: 100,
    width: 100,
    height: 50,
    packageCount: 1,
    urgency: 'Standard',
    cargoType: 'General Cargo',
    routeRatePerKg: 4.5
  });

  assert.strictEqual(pricing.volumetricWeight, 100);
  assert.strictEqual(pricing.chargeableWeight, 120);
  assert.strictEqual(pricing.appliedRatePerKg, 3.60);
  assert.strictEqual(pricing.basePrice, 432.00);
  assert.strictEqual(pricing.fuelSurcharge, 24.00);
  assert.strictEqual(pricing.securityCharge, 15.00);
  assert.strictEqual(pricing.urgencyCharge, 0.00);
  assert.strictEqual(pricing.cargoSurcharge, 0.00);
  assert.strictEqual(pricing.totalPrice, 471.00);
});

// 5. Test Special Surcharges (Urgency and Perishables)
runTest('Dynamic Surcharges for Priority & Hazmat', () => {
  // Case: actual weight 10kg, 10x10x10 cm, qty 1, Express (+15%), Perishable Pharma (+20%)
  // Volumetric: (10*10*10*1)/5000 = 0.2 kg
  // Chargeable: Max(10, 0.2) = 10 kg
  // Rate: $3.00 (fallback)
  // Slab: no discount
  // Base Price: 10 * 3 = $30.00
  // Fuel Surcharge: Max(10 * 0.2, 10.0) = $10.00 (minimum applied)
  // Security Surcharge: Max(1 * 15, 10 * 0.1) = $15.00 (minimum applied)
  // Urgency Charge: 15% of 30 = $4.50
  // Cargo Surcharge: 20% of 30 = $6.00
  // Total: 30 + 10 + 15 + 4.5 + 6 = $65.50

  const pricing = calculateQuotePricing({
    actualWeight: 10,
    length: 10,
    width: 10,
    height: 10,
    packageCount: 1,
    urgency: 'Express',
    cargoType: 'Perishable (Pharma)',
    routeRatePerKg: 3.0
  });

  assert.strictEqual(pricing.basePrice, 30.00);
  assert.strictEqual(pricing.fuelSurcharge, 10.00);
  assert.strictEqual(pricing.securityCharge, 15.00);
  assert.strictEqual(pricing.urgencyCharge, 4.50);
  assert.strictEqual(pricing.cargoSurcharge, 6.00);
  assert.strictEqual(pricing.totalPrice, 65.50);
});

// 6. Test Database Audit Trail & Notifications Schema Setup
const { all } = require('../backend/database');

async function runAsyncTests() {
  console.log('\nRunning database integration checks...');
  
  // Verify q-1 status history seeded
  try {
    const history = await all("SELECT * FROM status_history WHERE quotation_id = 'q-1' ORDER BY created_at ASC");
    if (history.length !== 2) throw new Error(`Expected 2 history records, found ${history.length}`);
    if (history[0].status !== 'Draft') throw new Error(`Expected first status 'Draft', got ${history[0].status}`);
    if (history[1].status !== 'Approved') throw new Error(`Expected second status 'Approved', got ${history[1].status}`);
    console.log('✓ [PASSED] : Database Status History audit seeding');
  } catch (e) {
    console.error('✗ [FAILED] : Database Status History audit seeding', e);
    process.exit(1);
  }

  // Verify q-1 notifications seeded
  try {
    const notifs = await all("SELECT * FROM notifications WHERE quotation_id = 'q-1' ORDER BY type ASC");
    if (notifs.length !== 2) throw new Error(`Expected 2 notifications, found ${notifs.length}`);
    if (notifs[0].type !== 'Email') throw new Error(`Expected first type 'Email', got ${notifs[0].type}`);
    if (notifs[1].type !== 'WhatsApp') throw new Error(`Expected second type 'WhatsApp', got ${notifs[1].type}`);
    console.log('✓ [PASSED] : Database Notifications dispatch seeding');
  } catch (e) {
    console.error('✗ [FAILED] : Database Notifications dispatch seeding', e);
    process.exit(1);
  }

  console.log('\n========================================');
  console.log('   ALL LOGIC & DB INTEGRITY TESTS PASSED ');
  console.log('========================================');
}

// Run async tests
runAsyncTests();
