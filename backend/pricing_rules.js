// Pricing rules and AI engine simulator for Air Freight Quotation System

/**
 * Calculates volumetric weight according to IATA standard:
 * Volumetric Weight (kg) = (Length * Width * Height in cm) / 5000
 */
function calculateVolumetricWeight(length, width, height, count = 1) {
  if (!length || !width || !height) return 0;
  return parseFloat(((length * width * height * count) / 5000).toFixed(2));
}

/**
 * Calculates chargeable weight: Max of Actual Weight and Volumetric Weight
 */
function calculateChargeableWeight(actualWeight, volumetricWeight) {
  return parseFloat(Math.max(actualWeight, volumetricWeight).toFixed(2));
}

/**
 * Applies slab discounts based on chargeable weight:
 * - < 45 kg: Full rate
 * - 45 kg to 99 kg: 10% discount
 * - 100 kg to 499 kg: 20% discount
 * - >= 500 kg: 30% discount
 */
function getSlabDiscount(weight) {
  if (weight < 45) return 1.0;
  if (weight < 100) return 0.90;
  if (weight < 500) return 0.80;
  return 0.70;
}

/**
 * Calculates pricing details for a shipment
 */
function calculateQuotePricing(params) {
  const {
    actualWeight,
    length,
    width,
    height,
    packageCount,
    urgency,
    cargoType,
    routeRatePerKg // Base rate fetched from DB/airline matching origin-destination
  } = params;

  // 1. Weight Calculations
  const volWeight = calculateVolumetricWeight(length, width, height, packageCount);
  const chgWeight = calculateChargeableWeight(actualWeight, volWeight);

  // 2. Base Price with Slab Discount
  const baseRate = routeRatePerKg || 3.0; // fallback default rate per kg
  const slabMultiplier = getSlabDiscount(chgWeight);
  const effectiveRate = baseRate * slabMultiplier;
  const basePrice = parseFloat((chgWeight * effectiveRate).toFixed(2));

  // 3. Surcharges
  // Fuel: $0.20 per kg, min $10
  const fuelSurcharge = parseFloat(Math.max(chgWeight * 0.20, 10.0).toFixed(2));
  
  // Security: Flat $15 or $0.10 per kg, whichever is higher
  const securityCharge = parseFloat(Math.max(packageCount * 15.0, chgWeight * 0.10).toFixed(2));

  // Urgency Charge: Express (+15% of base), Flash (+35% of base), Standard (0%)
  let urgencyMultiplier = 0.0;
  if (urgency === 'Express') urgencyMultiplier = 0.15;
  else if (urgency === 'Flash') urgencyMultiplier = 0.35;
  const urgencyCharge = parseFloat((basePrice * urgencyMultiplier).toFixed(2));

  // Cargo Type Special Handling Fee: Perishable (+20%), Hazardous (+40%), High-Value (+30%), General (0%)
  let cargoMultiplier = 0.0;
  if (cargoType === 'Perishable (Pharma)' || cargoType === 'Perishable (Food)') {
    cargoMultiplier = 0.20;
  } else if (cargoType === 'Hazardous Chemicals' || cargoType === 'Dangerous Goods') {
    cargoMultiplier = 0.40;
  } else if (cargoType === 'High-Value Electronics' || cargoType === 'Valuables') {
    cargoMultiplier = 0.30;
  }
  const cargoSurcharge = parseFloat((basePrice * cargoMultiplier).toFixed(2));

  // 4. Total Price
  const totalPrice = parseFloat((basePrice + fuelSurcharge + securityCharge + urgencyCharge + cargoSurcharge).toFixed(2));

  return {
    volumetricWeight: volWeight,
    chargeableWeight: chgWeight,
    basePrice,
    fuelSurcharge,
    securityCharge,
    urgencyCharge,
    cargoSurcharge,
    totalPrice,
    appliedRatePerKg: parseFloat(effectiveRate.toFixed(2)),
    discountAppliedPercent: Math.round((1 - slabMultiplier) * 100)
  };
}

/**
 * AI simulation assistant functions
 */
const AISimulator = {
  // Cleans description
  cleanCargoDescription(rawDescription, cargoType) {
    const desc = rawDescription.toLowerCase().trim();
    if (desc.includes('glass') || desc.includes('tube') || desc.includes('vaccine') || desc.includes('pill') || cargoType.includes('Perishable')) {
      return "CLINICAL SPECIMENS, REFRIGERATED (PHARMACEUTICALS) - TEMP SENSITIVE 2-8°C";
    }
    if (desc.includes('battery') || desc.includes('lithium') || desc.includes('chem') || cargoType.includes('Hazardous')) {
      return "UN 3481 LITHIUM ION BATTERIES PACKAGED WITH EQUIPMENT - CLASS 9 HAZARDOUS";
    }
    if (desc.includes('gold') || desc.includes('phone') || desc.includes('laptop') || desc.includes('chip') || cargoType.includes('High-Value')) {
      return "HIGH-SECURITY SECURED CARGO - PRECISION ELECTRONICS / VALUABLES";
    }
    return rawDescription.toUpperCase() + " - GENERAL CARGO STOWED SECURELY";
  },

  // Generates customs checklist
  generateCustomsChecklist(origin, destination, cargoType) {
    const checklist = [
      { document: "Commercial Invoice", description: "Standard document detailing buyer, seller, and values", required: true },
      { document: "Packing List", description: "Breakdown of package counts, contents, and net/gross weights", required: true },
      { document: "Airway Bill (AWB)", description: "Contract of carriage between shipper and carrier", required: true }
    ];

    if (origin === 'BOM') {
      checklist.push({ document: "Indian Customs Shipping Bill", description: "Export authorization declaration", required: true });
    }
    if (destination === 'JFK') {
      checklist.push({ document: "US CBP Entry Summary (Form 7501)", description: "Standard US Customs entry log", required: true });
      if (cargoType.includes('Perishable')) {
        checklist.push({ document: "FDA Prior Notice Import Declaration", description: "Pre-arrival notification for drug/food shipments", required: true });
        checklist.push({ document: "USDA Phytosanitary Certificate", description: "Biosecurity clearance for biological/perishable materials", required: true });
      }
    }
    if (destination === 'FRA') {
      checklist.push({ document: "EU Single Administrative Document (SAD)", description: "EU transit customs entry", required: true });
    }
    if (cargoType.includes('Hazardous')) {
      checklist.push({ document: "Shippers Declaration for Dangerous Goods", description: "IATA regulated DGD declaring UN code and class", required: true });
      checklist.push({ document: "Material Safety Data Sheet (MSDS)", description: "Handling guidelines and chemical properties sheet", required: true });
    }
    return checklist;
  },

  // Suggests routing options
  recommendRoutes(origin, destination) {
    const routes = [];
    
    // Default Direct Option
    routes.push({
      type: "Optimal Direct",
      carrier: "Lufthansa Cargo / Air India",
      route: `${origin} ➔ ${destination}`,
      transitDays: 1,
      costFactor: 1.0,
      carbonFootprint: "Medium (Direct)",
      explanation: "Direct flight with shortest transit time. Safest for perishables or time-critical parts."
    });

    // Transit Option A (via Dubai)
    routes.push({
      type: "Eco-Transit via Middle East",
      carrier: "Emirates SkyCargo / Qatar Cargo",
      route: `${origin} ➔ DXB (Dubai Hub) ➔ ${destination}`,
      transitDays: 2,
      costFactor: 0.85,
      carbonFootprint: "High (Multi-Leg)",
      explanation: "Layovers at major logistics hub. Cost-effective with high capacity availability."
    });

    // Transit Option B (via Singapore)
    if (origin === 'BOM' || destination === 'SIN') {
      routes.push({
        type: "Asia Gateway",
        carrier: "Singapore Airlines Cargo",
        route: `${origin} ➔ SIN (Changi Hub) ➔ ${destination}`,
        transitDays: 3,
        costFactor: 0.9,
        carbonFootprint: "High (Multi-Leg)",
        explanation: "Robust transit handling, ideal for shipments connecting Far-East Asia routes."
      });
    }

    return routes;
  },

  // Compare airline rates for direct UI feedback
  compareAirlineRates(origin, destination, chargeableWeight) {
    const baseRates = [
      { name: "Emirates SkyCargo", multiplier: 1.0, delay: 1 },
      { name: "Qatar Airways Cargo", multiplier: 0.95, delay: 2 },
      { name: "Lufthansa Cargo", multiplier: 1.1, delay: 1 },
      { name: "Singapore Airlines Cargo", multiplier: 1.05, delay: 2 }
    ];

    return baseRates.map(airline => {
      const perKg = parseFloat((3.2 * airline.multiplier).toFixed(2));
      const total = parseFloat((perKg * chargeableWeight).toFixed(2));
      return {
        airline: airline.name,
        ratePerKg: perKg,
        estimatedTotal: total,
        transitDays: airline.delay,
        reliabilityScore: Math.round(92 + Math.random() * 7) + "%",
        status: total > 2000 ? "Premium service" : "Best value"
      };
    });
  },

  // Predicts insurance premiums based on value
  estimateInsurance(cargoValue, cargoType) {
    let rate = 0.005; // 0.5% base
    if (cargoType.includes('Hazardous')) rate = 0.012; // 1.2%
    if (cargoType.includes('High-Value')) rate = 0.008; // 0.8%
    
    const premium = parseFloat((cargoValue * rate).toFixed(2));
    return {
      cargoValue,
      premiumRatePercent: (rate * 100).toFixed(2) + "%",
      premiumAmount: Math.max(premium, 25.0) // $25 minimum insurance premium
    };
  }
};

module.exports = {
  calculateVolumetricWeight,
  calculateChargeableWeight,
  getSlabDiscount,
  calculateQuotePricing,
  AISimulator
};
