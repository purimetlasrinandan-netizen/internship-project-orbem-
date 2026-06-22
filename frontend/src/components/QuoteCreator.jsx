import React, { useState, useEffect } from 'react';
import { Plus, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';

const AIRPORTS = [
  { code: 'BOM', name: 'Mumbai (BOM)', rate: 3.2 },
  { code: 'JFK', name: 'New York (JFK)', rate: 4.5 },
  { code: 'FRA', name: 'Frankfurt (FRA)', rate: 3.5 },
  { code: 'DXB', name: 'Dubai (DXB)', rate: 2.2 },
  { code: 'SIN', name: 'Singapore (SIN)', rate: 2.8 },
  { code: 'LHR', name: 'London (LHR)', rate: 3.8 }
];

const CARGO_TYPES = [
  { value: 'General Cargo', markup: 0 },
  { value: 'Perishable (Pharma)', markup: 0.20 },
  { value: 'Perishable (Food)', markup: 0.20 },
  { value: 'Hazardous Chemicals', markup: 0.40 },
  { value: 'Dangerous Goods', markup: 0.40 },
  { value: 'High-Value Electronics', markup: 0.30 }
];

export default function QuoteCreator({ onQuoteCreated }) {
  // Customers selection
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [showNewCustForm, setShowNewCustForm] = useState(false);
  const [newCust, setNewCust] = useState({ name: '', email: '', phone: '', company: '' });
  const [submittingCust, setSubmittingCust] = useState(false);
  const [custError, setCustError] = useState('');

  // Quote Form State
  const [formData, setFormData] = useState({
    origin: 'BOM',
    destination: 'DXB',
    cargo_type: 'General Cargo',
    package_count: 1,
    actual_weight: 10,
    length: 30,
    width: 30,
    height: 30,
    urgency: 'Standard',
    owner: 'Operations Agent',
    remarks: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [livePricing, setLivePricing] = useState(null);

  // Fetch Customers
  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/customers`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
        if (data.length > 0 && !selectedCustomerId) {
          setSelectedCustomerId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Compute live calculations
  useEffect(() => {
    // 1. Get base rate for the route
    const origin = formData.origin;
    const dest = formData.destination;
    
    // Find rate mapping or compute dynamic rate
    const routeRate = getRouteRate(origin, dest);
    
    // Calculate volumetric
    const packageCount = parseInt(formData.package_count) || 1;
    const l = parseFloat(formData.length) || 0;
    const w = parseFloat(formData.width) || 0;
    const h = parseFloat(formData.height) || 0;
    const actW = parseFloat(formData.actual_weight) || 0;

    const volWeight = parseFloat(((l * w * h * packageCount) / 5000).toFixed(2));
    const chgWeight = parseFloat(Math.max(actW, volWeight).toFixed(2));

    // Get slab discount
    let slabDiscount = 1.0;
    if (chgWeight >= 500) slabDiscount = 0.70;
    else if (chgWeight >= 100) slabDiscount = 0.80;
    else if (chgWeight >= 45) slabDiscount = 0.90;

    const basePrice = parseFloat((chgWeight * routeRate * slabDiscount).toFixed(2));
    const fuel = parseFloat(Math.max(chgWeight * 0.20, 10.0).toFixed(2));
    const security = parseFloat(Math.max(packageCount * 15.0, chgWeight * 0.10).toFixed(2));

    const urgencyMult = formData.urgency === 'Express' ? 0.15 : formData.urgency === 'Flash' ? 0.35 : 0;
    const urgencyCharge = parseFloat((basePrice * urgencyMult).toFixed(2));

    const cargoMatch = CARGO_TYPES.find(c => c.value === formData.cargo_type);
    const cargoMarkup = cargoMatch ? cargoMatch.markup : 0;
    const cargoCharge = parseFloat((basePrice * cargoMarkup).toFixed(2));

    const total = parseFloat((basePrice + fuel + security + urgencyCharge + cargoCharge).toFixed(2));

    setLivePricing({
      volumetricWeight: volWeight,
      chargeableWeight: chgWeight,
      basePrice,
      fuelSurcharge: fuel,
      securityCharge: security,
      urgencyCharge,
      cargoSurcharge: cargoCharge,
      totalPrice: total,
      ratePerKg: parseFloat((routeRate * slabDiscount).toFixed(2)),
      discountApplied: Math.round((1 - slabDiscount) * 100)
    });

  }, [formData]);

  const getRouteRate = (origin, dest) => {
    if (origin === dest) return 1.0;
    
    // Simulate lookup based on database routes
    const oRate = AIRPORTS.find(a => a.code === origin)?.rate || 3.0;
    const dRate = AIRPORTS.find(a => a.code === dest)?.rate || 3.0;
    
    // Middle rate calculation
    return parseFloat((Math.abs(oRate - dRate) + 2.0).toFixed(2));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewCustChange = (e) => {
    const { name, value } = e.target;
    setNewCust(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!newCust.name || !newCust.email || !newCust.company) {
      setCustError('Please fill out Customer Name, Email, and Company.');
      return;
    }
    setSubmittingCust(true);
    setCustError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCust)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create customer');
      }
      const data = await res.json();
      setCustomers(prev => [...prev, data]);
      setSelectedCustomerId(data.id);
      setShowNewCustForm(false);
      setNewCust({ name: '', email: '', phone: '', company: '' });
    } catch (err) {
      setCustError(err.message);
    } finally {
      setSubmittingCust(false);
    }
  };

  const handleSubmitQuote = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setError('Please select or register a Shipper Customer.');
      return;
    }
    if (formData.origin === formData.destination) {
      setError('Origin and Destination airports must be different.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: selectedCustomerId,
          ...formData
        })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create quote');
      }
      const data = await res.json();
      onQuoteCreated(data.quote.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
      
      {/* Creation form */}
      <div className="glass-panel">
        <div className="panel-header">
          <h2>Create Freight Quotation</h2>
        </div>

        {error && (
          <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '10px', marginBottom: '1.5rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Customer Panel */}
        <div style={{ padding: '1.25rem', border: '1px solid var(--border-muted)', borderRadius: '14px', marginBottom: '1.5rem', background: 'rgba(255, 255, 255, 0.01)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>Shipper / Client Customer</label>
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              onClick={() => setShowNewCustForm(!showNewCustForm)}
            >
              {showNewCustForm ? 'Select Existing Shipper' : 'Register New Shipper'}
            </button>
          </div>

          {showNewCustForm ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {custError && <div style={{ color: '#ef4444', fontSize: '0.8rem' }}>{custError}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <input 
                  type="text" 
                  name="company" 
                  placeholder="Shipper Company Name" 
                  value={newCust.company} 
                  onChange={handleNewCustChange}
                />
                <input 
                  type="text" 
                  name="name" 
                  placeholder="Contact Full Name" 
                  value={newCust.name} 
                  onChange={handleNewCustChange}
                />
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Billing Email" 
                  value={newCust.email} 
                  onChange={handleNewCustChange}
                />
                <input 
                  type="text" 
                  name="phone" 
                  placeholder="Contact Phone No" 
                  value={newCust.phone} 
                  onChange={handleNewCustChange}
                />
              </div>
              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ alignSelf: 'flex-end', padding: '0.5rem 1rem', fontSize: '0.85rem' }} 
                onClick={handleCreateCustomer}
                disabled={submittingCust}
              >
                {submittingCust ? 'Registering...' : 'Save and Select Customer'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <select 
                value={selectedCustomerId} 
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="" disabled>-- Choose Shipper --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.company} ({c.name})</option>
                ))}
              </select>
              {selectedCustomerId && (
                <div style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <Check size={12} /> Exporter selection confirmed
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cargo inputs form */}
        <form onSubmit={handleSubmitQuote} className="form-grid">
          
          {/* Route Section */}
          <div className="form-group">
            <label>Origin Airport</label>
            <select name="origin" value={formData.origin} onChange={handleInputChange}>
              {AIRPORTS.map(a => (
                <option key={a.code} value={a.code}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Destination Airport</label>
            <select name="destination" value={formData.destination} onChange={handleInputChange}>
              {AIRPORTS.map(a => (
                <option key={a.code} value={a.code}>{a.name}</option>
              ))}
            </select>
          </div>

          {/* Cargo Type */}
          <div className="form-group">
            <label>Cargo Type / Category</label>
            <select name="cargo_type" value={formData.cargo_type} onChange={handleInputChange}>
              {CARGO_TYPES.map(c => (
                <option key={c.value} value={c.value}>{c.value}</option>
              ))}
            </select>
          </div>

          {/* Package Count */}
          <div className="form-group">
            <label>Package Count</label>
            <input 
              type="number" 
              name="package_count" 
              min="1" 
              value={formData.package_count} 
              onChange={handleInputChange}
            />
          </div>

          {/* Actual Weight */}
          <div className="form-group">
            <label>Actual Weight (Total in kg)</label>
            <input 
              type="number" 
              name="actual_weight" 
              min="0.1" 
              step="0.1"
              value={formData.actual_weight} 
              onChange={handleInputChange}
            />
          </div>

          {/* Dimensions */}
          <div className="form-group">
            <label>Dimensions per package (L x W x H in cm)</label>
            <div className="dimensions-container">
              <input 
                type="number" 
                name="length" 
                placeholder="L" 
                min="1" 
                value={formData.length} 
                onChange={handleInputChange}
              />
              <input 
                type="number" 
                name="width" 
                placeholder="W" 
                min="1" 
                value={formData.width} 
                onChange={handleInputChange}
              />
              <input 
                type="number" 
                name="height" 
                placeholder="H" 
                min="1" 
                value={formData.height} 
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Urgency */}
          <div className="form-group">
            <label>Urgency Tier</label>
            <select name="urgency" value={formData.urgency} onChange={handleInputChange}>
              <option value="Standard">Standard (Regular flight, cargo rates)</option>
              <option value="Express">Express (Next scheduled, +15% fee)</option>
              <option value="Flash">Flash (Next flight out / critical, +35% fee)</option>
            </select>
          </div>

          {/* Owner */}
          <div className="form-group">
            <label>Assigned Operations Owner</label>
            <input 
              type="text" 
              name="owner" 
              value={formData.owner} 
              onChange={handleInputChange}
            />
          </div>

          {/* Remarks */}
          <div className="form-group full-width">
            <label>Internal Handling Instructions / Remarks</label>
            <textarea 
              name="remarks" 
              rows="3" 
              placeholder="E.g. Keep refrigerated, fragile machinery, requires special customs clearance..."
              value={formData.remarks} 
              onChange={handleInputChange}
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="form-group full-width" style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
              style={{ minWidth: '160px' }}
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={16} /> Creating...
                </>
              ) : (
                'Generate Quote'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Live Cost Breakdown Panel */}
      <div className="glass-panel" style={{ position: 'sticky', top: '2rem' }}>
        <div className="panel-header">
          <h2>Pricing Estimator</h2>
        </div>

        {livePricing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-muted)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#9ca3af' }}>
                <span>Volumetric Weight:</span>
                <span>{livePricing.volumetricWeight} kg</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#9ca3af', marginTop: '4px' }}>
                <span>Actual Weight:</span>
                <span>{formData.actual_weight} kg</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 700, borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '8px', paddingTop: '8px' }}>
                <span>Chargeable Weight:</span>
                <span style={{ color: '#6366f1' }}>{livePricing.chargeableWeight} kg</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Route Base rate (per kg):</span>
                <span>${livePricing.ratePerKg.toFixed(2)}</span>
              </div>
              {livePricing.discountApplied > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontSize: '0.85rem', fontWeight: 500 }}>
                  <span>Slab Discount:</span>
                  <span>-{livePricing.discountApplied}%</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Base Freight Cost:</span>
                <span>${livePricing.basePrice.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Fuel Surcharge:</span>
                <span>${livePricing.fuelSurcharge.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Security Handling:</span>
                <span>${livePricing.securityCharge.toFixed(2)}</span>
              </div>
              
              {livePricing.urgencyCharge > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f59e0b' }}>
                  <span>Urgency surcharge:</span>
                  <span>+${livePricing.urgencyCharge.toFixed(2)}</span>
                </div>
              )}

              {livePricing.cargoSurcharge > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6366f1' }}>
                  <span>Special Category fee:</span>
                  <span>+${livePricing.cargoSurcharge.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--border-muted)', paddingTop: '1rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>Total Estimate:</span>
                <span style={{ fontWeight: 800, fontSize: '1.6rem', color: '#10b981' }}>
                  ${livePricing.totalPrice.toFixed(2)}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '6px', textAlign: 'center', fontStyle: 'italic' }}>
                Rates include dynamic surcharges and base fuel adjustments. Final rates depend on review and approval.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
