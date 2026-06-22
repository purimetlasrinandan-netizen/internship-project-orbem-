import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  HelpCircle, 
  FileText, 
  CheckCircle2, 
  PlaneTakeoff, 
  ShieldCheck, 
  RefreshCw,
  Search,
  DollarSign
} from 'lucide-react';
import { API_BASE_URL } from '../config';

const AIRPORTS = [
  { code: 'BOM', name: 'Mumbai (BOM)' },
  { code: 'JFK', name: 'New York (JFK)' },
  { code: 'FRA', name: 'Frankfurt (FRA)' },
  { code: 'DXB', name: 'Dubai (DXB)' },
  { code: 'SIN', name: 'Singapore (SIN)' },
  { code: 'LHR', name: 'London (LHR)' }
];

export default function AIAssistant() {
  const [params, setParams] = useState({
    origin: 'BOM',
    destination: 'JFK',
    cargo_type: 'Perishable (Pharma)',
    raw_description: 'some medicine packages and vaccine ice packs',
    cargo_value: '25000'
  });

  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: value }));
  };

  const handleRunAI = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (!res.ok) throw new Error('AI processing failed. Check backend connection.');
      const data = await res.json();
      setAiResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem', alignItems: 'start' }}>
      
      {/* Input Form Panel */}
      <div className="glass-panel" style={{ margin: 0 }}>
        <div className="panel-header">
          <h2>
            AI Cargo Assistant <span className="ai-badge">Gemini Core</span>
          </h2>
        </div>
        
        <form onSubmit={handleRunAI} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group">
              <label>Origin</label>
              <select name="origin" value={params.origin} onChange={handleInputChange}>
                {AIRPORTS.map(a => (
                  <option key={a.code} value={a.code}>{a.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Destination</label>
              <select name="destination" value={params.destination} onChange={handleInputChange}>
                {AIRPORTS.map(a => (
                  <option key={a.code} value={a.code}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Cargo Classification</label>
            <select name="cargo_type" value={params.cargo_type} onChange={handleInputChange}>
              <option value="General Cargo">General Cargo</option>
              <option value="Perishable (Pharma)">Perishable (Pharma)</option>
              <option value="Perishable (Food)">Perishable (Food)</option>
              <option value="Hazardous Chemicals">Hazardous Chemicals</option>
              <option value="Dangerous Goods">Dangerous Goods</option>
              <option value="High-Value Electronics">High-Value Electronics</option>
            </select>
          </div>

          <div className="form-group">
            <label>Estimated Cargo Declared Value (USD)</label>
            <div style={{ position: 'relative' }}>
              <DollarSign size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: '#9ca3af' }} />
              <input 
                type="number" 
                name="cargo_value" 
                placeholder="25000"
                value={params.cargo_value} 
                onChange={handleInputChange}
                style={{ paddingLeft: '32px', width: '100%' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Raw Description ( Messy Customer Input )</label>
            <textarea 
              name="raw_description" 
              rows="4" 
              placeholder="e.g. we have some lithium battery cells packed with wires and charging docks..."
              value={params.raw_description} 
              onChange={handleInputChange}
              required
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="animate-spin" size={16} /> Analysing Details...
              </>
            ) : (
              <>
                <Sparkles size={16} /> Run Smart Diagnostics
              </>
            )}
          </button>
        </form>

        {error && (
          <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '10px', marginTop: '1rem', color: '#ef4444', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}
      </div>

      {/* AI Assistant Output Workspace */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {aiResult ? (
          <>
            {/* Standardized Cargo Description Card */}
            <div className="glass-panel ai-card" style={{ margin: 0 }}>
              <div className="panel-header" style={{ marginBottom: '1rem', paddingBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} style={{ color: '#6366f1' }} /> Standardized Cargo Declaration
                </h3>
              </div>
              <div style={{ background: 'rgba(99,102,241,0.05)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.2)' }}>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 500 }}>PROCESSED DECLARATION TERM (IATA CODE)</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f3f4f6', marginTop: '4px', letterSpacing: '0.02em' }}>
                  {aiResult.standardizedCargoDescription}
                </div>
              </div>
            </div>

            {/* Route & Carrier Comparison Tabs/Views */}
            <div className="glass-panel ai-card" style={{ margin: 0, borderLeftColor: '#10b981' }}>
              <div className="panel-header" style={{ marginBottom: '1rem', paddingBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PlaneTakeoff size={16} style={{ color: '#10b981' }} /> Airline Routing & Rate Comparison
                </h3>
              </div>

              <h4 style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '8px', textTransform: 'uppercase' }}>Recommended Routing Options</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
                {aiResult.recommendedRoutes?.map((route, i) => (
                  <div key={i} className="route-option">
                    <div className="route-option-header">
                      <span>{route.type}</span>
                      <span style={{ color: '#10b981' }}>Transit: {route.transitDays} Day{route.transitDays > 1 ? 's' : ''}</span>
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, margin: '4px 0', color: '#6366f1' }}>{route.route}</div>
                    <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{route.explanation}</div>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '0.75rem', color: '#9ca3af', marginTop: '6px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '4px' }}>
                      <span>Carrier: <strong>{route.carrier}</strong></span>
                      <span>Carbon footprint: <strong>{route.carbonFootprint}</strong></span>
                    </div>
                  </div>
                ))}
              </div>

              <h4 style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '8px', textTransform: 'uppercase' }}>Simulated Airline Cargo Rates (Estimates for 150kg)</h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Carrier</th>
                      <th>Rate/Kg</th>
                      <th>Total Cost</th>
                      <th>Transit</th>
                      <th>Reliability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aiResult.airlineRateComparison?.map((line, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{line.airline}</td>
                        <td>${line.ratePerKg.toFixed(2)}</td>
                        <td style={{ color: '#10b981', fontWeight: 700 }}>${line.estimatedTotal.toLocaleString()}</td>
                        <td>{line.transitDays} Days</td>
                        <td style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f59e0b' }}>{line.reliabilityScore}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Customs & Insurance checklist */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
              {/* Customs Checklist */}
              <div className="glass-panel ai-card" style={{ margin: 0, borderLeftColor: '#f59e0b' }}>
                <div className="panel-header" style={{ marginBottom: '1rem', paddingBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} style={{ color: '#f59e0b' }} /> Customs Checklist
                  </h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {aiResult.customsDocumentationChecklist?.map((doc, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'start' }}>
                      <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{doc.document}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{doc.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Insurance Quote */}
              <div className="glass-panel ai-card" style={{ margin: 0, borderLeftColor: '#3b82f6' }}>
                <div className="panel-header" style={{ marginBottom: '1rem', paddingBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={16} style={{ color: '#3b82f6' }} /> Insurance Risk Assessment
                  </h3>
                </div>
                {aiResult.insuranceEstimate ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: '#9ca3af' }}>Declared Cargo Value:</span>
                      <strong>${parseFloat(params.cargo_value).toLocaleString()}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: '#9ca3af' }}>Computed Risk Rate:</span>
                      <strong>{aiResult.insuranceEstimate.premiumRatePercent}</strong>
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Premium Premium:</span>
                      <strong style={{ fontSize: '1.25rem', color: '#10b981' }}>${aiResult.insuranceEstimate.premiumAmount.toFixed(2)}</strong>
                    </div>
                    <p style={{ fontSize: '0.7rem', color: '#9ca3af', fontStyle: 'italic', marginTop: '6px' }}>
                      Includes transit damage and theft cover under Cargo Clause A.
                    </p>
                  </div>
                ) : (
                  <div className="empty-state" style={{ padding: '1rem 0' }}>Provide Cargo Value to estimate insurance</div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="glass-panel" style={{ margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', color: '#9ca3af', textAlign: 'center' }}>
            <Sparkles size={48} style={{ opacity: 0.2, marginBottom: '1rem', color: '#6366f1' }} />
            <h3>AI Diagnostic Workspace</h3>
            <p style={{ maxWidth: '340px', fontSize: '0.85rem', marginTop: '8px' }}>
              Input shipper cargo description and route specs on the left, then trigger diagnostics to standardise classifications and run rate audits.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
