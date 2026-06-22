import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Edit3, 
  FileText, 
  History, 
  User, 
  AlertTriangle, 
  Calendar,
  Send,
  Download,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function QuoteDetail({ quoteId, onBack, onNavigateToShipment }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // History and notification states
  const [historyLogs, setHistoryLogs] = useState([]);
  const [notificationLogs, setNotificationLogs] = useState([]);

  // Workflow states
  const [remarks, setRemarks] = useState('');
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [revisionData, setRevisionData] = useState({
    package_count: 1,
    actual_weight: 10,
    length: 30,
    width: 30,
    height: 30,
    urgency: 'Standard',
    cargo_type: 'General Cargo',
    reason: '',
    updated_by: 'Logistics Planner'
  });
  const [submittingAction, setSubmittingAction] = useState(false);

  // Claim Form state
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimForm, setClaimForm] = useState({
    claim_type: 'Complaint',
    details: '',
    claim_amount: ''
  });

  const fetchQuoteDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/quotes/${quoteId}`);
      if (!res.ok) throw new Error('Quotation details not found.');
      const json = await res.json();
      setData(json);

      // Fetch history logs
      try {
        const historyRes = await fetch(`${API_BASE_URL}/api/quotes/${quoteId}/history`);
        if (historyRes.ok) {
          const historyJson = await historyRes.json();
          setHistoryLogs(historyJson);
        }
      } catch (e) {
        console.error('Error fetching history:', e);
      }

      // Fetch notifications
      try {
        const notifRes = await fetch(`${API_BASE_URL}/api/quotes/${quoteId}/notifications`);
        if (notifRes.ok) {
          const notifJson = await notifRes.json();
          setNotificationLogs(notifJson);
        }
      } catch (e) {
        console.error('Error fetching notifications:', e);
      }

      // Initialize revision form values with current quote values
      if (json.quote) {
        setRevisionData({
          package_count: json.quote.package_count,
          actual_weight: json.quote.actual_weight,
          length: json.quote.length,
          width: json.quote.width,
          height: json.quote.height,
          urgency: json.quote.urgency,
          cargo_type: json.quote.cargo_type,
          reason: '',
          updated_by: 'Operations Executive'
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quoteId) {
      fetchQuoteDetail();
    }
  }, [quoteId]);

  const handleUpdateStatus = async (newStatus) => {
    setSubmittingAction(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/quotes/${quoteId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, remarks })
      });
      if (!res.ok) throw new Error('Failed to update status.');
      await fetchQuoteDetail();
      setRemarks('');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleRevisionChange = (e) => {
    const { name, value } = e.target;
    setRevisionData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitRevision = async (e) => {
    e.preventDefault();
    if (!revisionData.reason || !revisionData.updated_by) {
      alert('Please fill out Reason and Updated By.');
      return;
    }
    setSubmittingAction(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/quotes/${quoteId}/revisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(revisionData)
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to submit revision');
      }
      setShowRevisionForm(false);
      await fetchQuoteDetail();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleClaimChange = (e) => {
    const { name, value } = e.target;
    setClaimForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    if (!claimForm.details) {
      alert('Please write complaint details.');
      return;
    }
    setSubmittingAction(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/claims`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotation_id: quoteId,
          ...claimForm
        })
      });
      if (!res.ok) throw new Error('Failed to submit claim.');
      setShowClaimForm(false);
      setClaimForm({ claim_type: 'Complaint', details: '', claim_amount: '' });
      await fetchQuoteDetail();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleExportPDF = () => {
    if (!data?.quote) return;
    const q = data.quote;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to export the PDF.");
      return;
    }
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Quotation Summary - ${q.id}</title>
        <style>
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #1f2937;
            margin: 40px;
            line-height: 1.5;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #6366f1;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          .logo {
            font-size: 24px;
            font-weight: 800;
            color: #6366f1;
            letter-spacing: 0.05em;
          }
          .doc-type {
            font-size: 16px;
            font-weight: 700;
            color: #4b5563;
            text-transform: uppercase;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 25px;
          }
          .section-title {
            font-size: 12px;
            color: #4f46e5;
            text-transform: uppercase;
            font-weight: 700;
            margin-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 4px;
          }
          .info-row {
            margin-bottom: 6px;
            font-size: 13px;
          }
          .info-row strong {
            color: #374151;
            display: inline-block;
            width: 140px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            margin-bottom: 25px;
          }
          th, td {
            border: 1px solid #e5e7eb;
            padding: 10px;
            text-align: left;
            font-size: 13px;
          }
          th {
            background-color: #f9fafb;
            font-weight: 600;
            color: #374151;
          }
          .totals-wrapper {
            display: flex;
            justify-content: flex-end;
          }
          .totals-table {
            width: 300px;
            margin: 0;
          }
          .totals-table td {
            padding: 8px 10px;
          }
          .grand-total {
            font-size: 16px;
            font-weight: 800;
            color: #10b981;
          }
          .badge {
            display: inline-block;
            padding: 2px 8px;
            font-size: 11px;
            font-weight: 700;
            border-radius: 4px;
            text-transform: uppercase;
          }
          .badge-approved { background-color: #d1fae5; color: #065f46; }
          .badge-pending { background-color: #fef3c7; color: #92400e; }
          .badge-draft { background-color: #e5e7eb; color: #374151; }
          .badge-rejected { background-color: #fee2e2; color: #991b1b; }
          .badge-revision { background-color: #e0e7ff; color: #3730a3; }
          .footer {
            text-align: center;
            margin-top: 40px;
            font-size: 11px;
            color: #9ca3af;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
          }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">ORBEM SOLUTIONS</div>
          <div class="doc-type">Quotation Summary</div>
        </div>

        <div class="grid">
          <div>
            <div class="section-title">Client Details</div>
            <div class="info-row"><strong>Company:</strong> ${q.customer_company}</div>
            <div class="info-row"><strong>Contact Person:</strong> ${q.customer_name}</div>
            <div class="info-row"><strong>Email:</strong> ${q.customer_email}</div>
            <div class="info-row"><strong>Phone:</strong> ${q.customer_phone || 'N/A'}</div>
          </div>
          <div>
            <div class="section-title">Quotation Reference</div>
            <div class="info-row"><strong>Quote Ref:</strong> ${q.id}</div>
            <div class="info-row"><strong>Created Date:</strong> ${new Date(q.created_at).toLocaleString()}</div>
            <div class="info-row"><strong>Assigned Owner:</strong> ${q.owner}</div>
            <div class="info-row"><strong>Status:</strong> 
              <span class="badge badge-${q.status.toLowerCase().replace(' ', '-')}">${q.status}</span>
            </div>
          </div>
        </div>

        <div class="section-title">Routing & Transit Info</div>
        <div class="grid" style="grid-template-columns: 1.5fr 1fr;">
          <div>
            <div class="info-row"><strong>Origin Airport:</strong> ${q.origin}</div>
            <div class="info-row"><strong>Destination Airport:</strong> ${q.destination}</div>
          </div>
          <div>
            <div class="info-row"><strong>Urgency Level:</strong> ${q.urgency}</div>
          </div>
        </div>

        <div class="section-title">Consignment Specifications</div>
        <table>
          <thead>
            <tr>
              <th>Cargo Classification</th>
              <th>Pkg Count</th>
              <th>Dimensions (L x W x H)</th>
              <th>Actual Weight</th>
              <th>Volumetric Weight</th>
              <th>Chargeable Weight</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${q.cargo_type}</td>
              <td>${q.package_count} units</td>
              <td>${q.length} x ${q.width} x ${q.height} cm</td>
              <td>${q.actual_weight} kg</td>
              <td>${q.volumetric_weight} kg</td>
              <td style="font-weight: 700;">${q.chargeable_weight} kg</td>
            </tr>
          </tbody>
        </table>

        <div class="section-title">Financial Breakdown</div>
        <div class="totals-wrapper">
          <table class="totals-table">
            <tr>
              <td>Base Freight Cost:</td>
              <td style="text-align: right;">$${q.base_price.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Fuel Surcharge:</td>
              <td style="text-align: right;">$${q.fuel_surcharge.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Security Handling Surcharge:</td>
              <td style="text-align: right;">$${q.security_charge.toFixed(2)}</td>
            </tr>
            ${q.urgency_charge > 0 ? ('<tr><td>Urgency Premium:</td><td style="text-align: right; color: #f59e0b;">+$' + q.urgency_charge.toFixed(2) + '</td></tr>') : ''}
            ${(q.total_price - (q.base_price + q.fuel_surcharge + q.security_charge + q.urgency_charge)) > 0.01 ? ('<tr><td>Special Handling Surcharge:</td><td style="text-align: right; color: #6366f1;">+$' + (q.total_price - (q.base_price + q.fuel_surcharge + q.security_charge + q.urgency_charge)).toFixed(2) + '</td></tr>') : ''}
            <tr class="grand-total">
              <td>Total Quotation Price:</td>
              <td style="text-align: right; color: #10b981;">$${q.total_price.toFixed(2)}</td>
            </tr>
          </table>
        </div>

        ${q.remarks ? ('<div class="section-title" style="margin-top: 25px;">Handling Instructions / Remarks</div><div style="font-size: 13px; background-color: #f9fafb; padding: 12px; border-radius: 6px; border-left: 3px solid #f59e0b; font-style: italic;">"' + q.remarks + '"</div>') : ''}

        <div class="footer">
          ORBEM Solutions Private Limited • Confidential Air Cargo Document • Generated automatically.
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <RefreshCw className="animate-spin" />
        <span style={{ marginLeft: '10px' }}>Loading Quote Details...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
        <AlertCircle size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} />
        <h2>Quotation Not Found</h2>
        <p style={{ color: '#9ca3af', margin: '0.5rem 0 1.5rem' }}>{error || 'Unable to retrieve workspace data.'}</p>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Ledger
        </button>
      </div>
    );
  }

  const { quote, airwayBill, invoice, revisions, claims } = data;

  return (
    <div>
      {/* Header toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Ledger
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={handleExportPDF}>
            <Download size={16} /> Export PDF
          </button>
          
          <button className="btn btn-secondary" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }} onClick={() => setShowClaimForm(true)}>
            Submit Claim/Complaint
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Side: General Details & Flow */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Main summary panel */}
          <div className="glass-panel" style={{ margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
              <div>
                <span className={`badge badge-${quote.status.toLowerCase().replace(' ', '-')}`} style={{ marginBottom: '0.5rem' }}>
                  {quote.status}
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Workspace: {quote.id}</h2>
                <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} /> Created: {new Date(quote.created_at).toLocaleString()}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={14} /> Assigned: {quote.owner}
                  </span>
                </div>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>TOTAL PAYABLE PRICE</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>${quote.total_price.toFixed(2)}</div>
              </div>
            </div>

            {/* Routing & Exporter Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', padding: '1.25rem', border: '1px solid var(--border-muted)', borderRadius: '12px', background: 'rgba(255,255,255,0.01)', marginBottom: '1.5rem' }}>
              <div>
                <h4 style={{ fontSize: '0.85rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Shipper Customer</h4>
                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{quote.customer_company}</div>
                <div style={{ fontSize: '0.9rem', marginTop: '2px' }}>{quote.customer_name}</div>
                <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '2px' }}>{quote.customer_email} | {quote.customer_phone}</div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Routing Plan</h4>
                <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#6366f1' }}>{quote.origin} ➔ {quote.destination}</div>
                <div style={{ fontSize: '0.9rem', color: '#9ca3af', marginTop: '2px' }}>Urgency: <strong style={{ color: quote.urgency === 'Flash' ? '#ef4444' : quote.urgency === 'Express' ? '#f59e0b' : 'var(--text-main)' }}>{quote.urgency}</strong></div>
              </div>
            </div>

            {/* Cargo dimensions breakdown */}
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Cargo & Dimensional Breakdown</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Cargo Type</span>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{quote.cargo_type}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Package Count / Dims</span>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '4px' }}>{quote.package_count} pcs ({quote.length}x{quote.width}x{quote.height} cm)</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Actual Gross Weight</span>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '4px' }}>{quote.actual_weight} kg</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', borderLeft: '3px solid #6366f1' }}>
                <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 600 }}>Chargeable Weight</span>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '4px', color: '#f3f4f6' }}>{quote.chargeable_weight} kg</div>
              </div>
            </div>

            {/* Remarks */}
            {quote.remarks && (
              <div style={{ background: 'rgba(245, 158, 11, 0.05)', borderLeft: '3px solid #f59e0b', padding: '10px 14px', borderRadius: '4px', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                <strong>Handling Notes:</strong> {quote.remarks}
              </div>
            )}
          </div>

          {/* Workflow Admin Control Panel */}
          {quote.status !== 'Approved' && quote.status !== 'Rejected' && !showRevisionForm && (
            <div className="glass-panel" style={{ margin: 0, border: '1px solid var(--primary-glow)' }}>
              <div className="panel-header">
                <h2>Workflow Actions</h2>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label>Add approval/rejection remarks or follow-up notes</label>
                  <input 
                    type="text" 
                    placeholder="Enter approval details or audit trail remarks here..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button 
                    className="btn btn-success" 
                    onClick={() => handleUpdateStatus('Approved')}
                    disabled={submittingAction}
                  >
                    <CheckCircle size={16} /> Approve & Dispatch
                  </button>

                  <button 
                    className="btn btn-secondary" 
                    style={{ border: '1px solid #ef4444', color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)' }}
                    onClick={() => handleUpdateStatus('Rejected')}
                    disabled={submittingAction}
                  >
                    <XCircle size={16} /> Reject Quote
                  </button>

                  <button 
                    className="btn btn-secondary"
                    onClick={() => setShowRevisionForm(true)}
                    disabled={submittingAction}
                  >
                    <Edit3 size={16} /> Request/Submit Revision
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Revision Form Overlay/Panel */}
          {showRevisionForm && (
            <div className="glass-panel" style={{ margin: 0, border: '1px dashed var(--primary)' }}>
              <div className="panel-header">
                <h2>Quotation Cargo Revision Panel</h2>
              </div>
              <form onSubmit={handleSubmitRevision} className="form-grid">
                
                <div className="form-group">
                  <label>Package Count</label>
                  <input 
                    type="number" 
                    name="package_count" 
                    value={revisionData.package_count} 
                    onChange={handleRevisionChange} 
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label>Actual Weight (Total in kg)</label>
                  <input 
                    type="number" 
                    name="actual_weight" 
                    value={revisionData.actual_weight} 
                    onChange={handleRevisionChange} 
                    min="0.1" 
                    step="0.1"
                  />
                </div>

                <div className="form-group">
                  <label>Dimensions per package (L x W x H in cm)</label>
                  <div className="dimensions-container">
                    <input 
                      type="number" 
                      name="length" 
                      placeholder="L" 
                      value={revisionData.length} 
                      onChange={handleRevisionChange}
                    />
                    <input 
                      type="number" 
                      name="width" 
                      placeholder="W" 
                      value={revisionData.width} 
                      onChange={handleRevisionChange}
                    />
                    <input 
                      type="number" 
                      name="height" 
                      placeholder="H" 
                      value={revisionData.height} 
                      onChange={handleRevisionChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Urgency Tier</label>
                  <select name="urgency" value={revisionData.urgency} onChange={handleRevisionChange}>
                    <option value="Standard">Standard</option>
                    <option value="Express">Express</option>
                    <option value="Flash">Flash</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Cargo Category</label>
                  <select name="cargo_type" value={revisionData.cargo_type} onChange={handleRevisionChange}>
                    <option value="General Cargo">General Cargo</option>
                    <option value="Perishable (Pharma)">Perishable (Pharma)</option>
                    <option value="Perishable (Food)">Perishable (Food)</option>
                    <option value="Hazardous Chemicals">Hazardous Chemicals</option>
                    <option value="Dangerous Goods">Dangerous Goods</option>
                    <option value="High-Value Electronics">High-Value Electronics</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Updated By Name</label>
                  <input 
                    type="text" 
                    name="updated_by" 
                    value={revisionData.updated_by} 
                    onChange={handleRevisionChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Reason for Revision (Archived in history log)</label>
                  <input 
                    type="text" 
                    name="reason" 
                    placeholder="E.g., Client updated box counts, correct dimensional weights..."
                    value={revisionData.reason} 
                    onChange={handleRevisionChange}
                  />
                </div>

                <div className="form-group full-width" style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowRevisionForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submittingAction}>Save Changes</button>
                </div>
              </form>
            </div>
          )}

          {/* Revision Logs / History */}
          {revisions.length > 0 && (
            <div className="glass-panel" style={{ margin: 0 }}>
              <div className="panel-header">
                <h2>Revision Audit Log ({revisions.length})</h2>
                <History size={18} style={{ color: '#6366f1' }} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {revisions.map((rev) => {
                  const prev = JSON.parse(rev.previous_data);
                  return (
                    <div key={rev.id} style={{ border: '1px solid var(--border-muted)', borderRadius: '10px', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.01)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                        <span style={{ color: '#6366f1' }}>Revision #{rev.revision_number}</span>
                        <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{new Date(rev.created_at).toLocaleString()}</span>
                      </div>
                      
                      <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '8px' }}>
                        <strong>Reason:</strong> "{rev.reason}" | <strong>Editor:</strong> {rev.updated_by}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '0.8rem', background: 'rgba(0,0,0,0.1)', padding: '8px', borderRadius: '6px' }}>
                        <div><strong>Prev Dims:</strong> {prev.length}x{prev.width}x{prev.height} cm</div>
                        <div><strong>Prev Weight:</strong> {prev.actual_weight} kg ({prev.chargeable_weight} chg)</div>
                        <div><strong>Prev Total:</strong> ${prev.total_price.toFixed(2)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Exporter Complaints & Claims details */}
          {claims.length > 0 && (
            <div className="glass-panel" style={{ margin: 0 }}>
              <div className="panel-header">
                <h2>Customer Incidents / Claims ({claims.length})</h2>
                <AlertTriangle style={{ color: '#ef4444' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {claims.map((claim) => (
                  <div key={claim.id} style={{ borderLeft: `3px solid ${claim.claim_type === 'Complaint' ? '#f59e0b' : '#ef4444'}`, background: 'rgba(255,255,255,0.01)', padding: '12px 16px', borderRadius: '0 8px 8px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>
                      <span>{claim.claim_type} ({claim.id})</span>
                      <span className={`badge badge-${claim.status.toLowerCase()}`}>{claim.status}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#9ca3af', margin: '4px 0' }}>"{claim.details}"</p>
                    {claim.claim_amount > 0 && (
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ef4444' }}>
                        Compensation requested: ${claim.claim_amount.toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status History Timeline */}
          <div className="glass-panel" style={{ margin: 0 }}>
            <div className="panel-header">
              <h2>Quotation Lifecycle Timeline</h2>
              <History size={18} style={{ color: '#10b981' }} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', paddingLeft: '1.25rem' }}>
              <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }}></div>
              
              {historyLogs.map((log) => (
                <div key={log.id} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    borderRadius: '50%', 
                    backgroundColor: log.status === 'Approved' ? '#10b981' : log.status === 'Rejected' ? '#ef4444' : log.status === 'Draft' ? '#9ca3af' : '#6366f1',
                    border: '3px solid var(--bg-secondary)',
                    position: 'absolute',
                    left: '-20px',
                    top: '4px',
                    zIndex: 2,
                    boxShadow: '0 0 8px rgba(255, 255, 255, 0.1)'
                  }}></div>
                  
                  <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-muted)', borderRadius: '10px', padding: '10px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f3f4f6' }}>{log.status}</span>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '4px' }}>{log.remarks}</p>
                    <div style={{ fontSize: '0.75rem', color: '#6366f1', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontWeight: 600 }}>By:</span> {log.updated_by}
                    </div>
                  </div>
                </div>
              ))}
              
              {historyLogs.length === 0 && (
                <p style={{ fontSize: '0.85rem', color: '#9ca3af', fontStyle: 'italic' }}>No audit history tracked yet.</p>
              )}
            </div>
          </div>

          {/* Communication Dispatch Logs */}
          <div className="glass-panel" style={{ margin: 0 }}>
            <div className="panel-header">
              <h2>Simulated Communication Logs</h2>
              <span className="badge badge-draft" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>Messaging API</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {notificationLogs.map((log) => (
                <div key={log.id} style={{ 
                  border: '1px solid var(--border-muted)', 
                  borderRadius: '12px', 
                  padding: '12px 16px', 
                  background: log.type === 'WhatsApp' ? 'rgba(16, 185, 129, 0.02)' : 'rgba(99, 102, 241, 0.02)',
                  borderLeft: log.type === 'WhatsApp' ? '4px solid #10b981' : '4px solid #6366f1'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span style={{ color: log.type === 'WhatsApp' ? '#10b981' : '#6366f1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {log.type === 'WhatsApp' ? 'WhatsApp Business' : 'SMTP Email Gateway'}
                    </span>
                    <span className="badge badge-approved" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>{log.status}</span>
                  </div>
                  
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '6px' }}>
                    <strong>Recipient:</strong> {log.recipient} | <strong>Sent:</strong> {new Date(log.created_at).toLocaleString()}
                  </div>
                  
                  <p style={{ fontSize: '0.85rem', color: '#f3f4f6', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '6px', fontStyle: 'italic' }}>
                    "{log.subject_message}"
                  </p>
                </div>
              ))}

              {notificationLogs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: '#9ca3af', fontSize: '0.85rem' }}>
                  No Email or WhatsApp updates have been simulated for this quote. Approve the quote to trigger automated messages.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Ledger Billing & Cargo tracking status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Price Breakdown Details */}
          <div className="glass-panel" style={{ margin: 0 }}>
            <div className="panel-header">
              <h2>Invoice Cost Breakdown</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Base Freight:</span>
                <span>${quote.base_price.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Fuel Surcharge:</span>
                <span>${quote.fuel_surcharge.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Security Handling:</span>
                <span>${quote.security_charge.toFixed(2)}</span>
              </div>
              {quote.urgency_charge > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f59e0b' }}>
                  <span>Urgency Fee:</span>
                  <span>+${quote.urgency_charge.toFixed(2)}</span>
                </div>
              )}
              {quote.total_price - (quote.base_price + quote.fuel_surcharge + quote.security_charge + quote.urgency_charge) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6366f1' }}>
                  <span>Handling Fee:</span>
                  <span>+${(quote.total_price - (quote.base_price + quote.fuel_surcharge + quote.security_charge + quote.urgency_charge)).toFixed(2)}</span>
                </div>
              )}
              
              <div style={{ borderTop: '1px solid var(--border-muted)', paddingTop: '10px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
                <span>Grand Total:</span>
                <span style={{ color: '#10b981' }}>${quote.total_price.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Active airway bill tracking */}
          {airwayBill ? (
            <div className="glass-panel" style={{ margin: 0, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div className="panel-header">
                <h2>Freight Shipment</h2>
                <span className="badge badge-approved">AWB Issued</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Airway Bill Number</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.05em', color: '#6366f1' }}>{airwayBill.awb_number}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: '#9ca3af' }}>Flight No:</span>
                    <div style={{ fontWeight: 600 }}>{airwayBill.flight_number}</div>
                  </div>
                  <div>
                    <span style={{ color: '#9ca3af' }}>Shelf Rack:</span>
                    <div style={{ fontWeight: 600 }}>{airwayBill.warehouse_location}</div>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Consignment State</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>
                    <CheckCircle size={16} /> {airwayBill.dispatch_status}
                  </div>
                </div>

                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', marginTop: '8px' }}
                  onClick={() => onNavigateToShipment(airwayBill.id)}
                >
                  Manage Milestone Status
                </button>
              </div>
            </div>
          ) : (
            quote.status === 'Approved' && (
              <div className="glass-panel" style={{ margin: 0, textAlign: 'center', border: '1px dashed #ef4444' }}>
                <AlertTriangle size={24} style={{ color: '#ef4444', marginBottom: '8px' }} />
                <h4 style={{ fontWeight: 600 }}>AWB Not Issued</h4>
                <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: '4px 0 12px' }}>This quote was approved but AWB generation failed.</p>
                <button className="btn btn-primary btn-sm" onClick={() => handleUpdateStatus('Approved')}>Retry AWB Issue</button>
              </div>
            )
          )}

          {/* Invoice tracking details */}
          {invoice && (
            <div className="glass-panel" style={{ margin: 0 }}>
              <div className="panel-header">
                <h2>Consignment Invoice</h2>
                <span className={`badge badge-${invoice.payment_status.toLowerCase()}`}>
                  {invoice.payment_status}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9ca3af' }}>Invoice Number:</span>
                  <strong style={{ marginLeft: 'auto' }}>{invoice.invoice_number}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9ca3af' }}>Amount Invoiced:</span>
                  <strong style={{ marginLeft: 'auto' }}>${invoice.amount.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9ca3af' }}>Payment Due Date:</span>
                  <strong style={{ marginLeft: 'auto' }}>{new Date(invoice.due_date).toLocaleDateString()}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Claim Form Modal (rendered simply inline as a panel if open) */}
      {showClaimForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', margin: 0, border: '1px solid var(--border-muted)' }}>
            <div className="panel-header">
              <h2>Submit Cargo Claim / Complaint</h2>
            </div>
            
            <form onSubmit={handleSubmitClaim} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Incident Type</label>
                <select name="claim_type" value={claimForm.claim_type} onChange={handleClaimChange}>
                  <option value="Complaint">Complaint (Operational Delay, Communication Issue)</option>
                  <option value="Insurance Claim">Insurance Claim (Lost Goods, Package Damage)</option>
                </select>
              </div>

              {claimForm.claim_type === 'Insurance Claim' && (
                <div className="form-group">
                  <label>Claim Value requested (USD)</label>
                  <input 
                    type="number" 
                    name="claim_amount" 
                    placeholder="Enter amount in USD"
                    value={claimForm.claim_amount} 
                    onChange={handleClaimChange} 
                    min="1"
                  />
                </div>
              )}

              <div className="form-group">
                <label>Write detailed summary of cargo incident</label>
                <textarea 
                  name="details" 
                  rows="4" 
                  placeholder="Describe what occurred, include box damage reports, milestones missed, temp deviations..."
                  value={claimForm.details} 
                  onChange={handleClaimChange}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowClaimForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submittingAction}>Submit Incident</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
