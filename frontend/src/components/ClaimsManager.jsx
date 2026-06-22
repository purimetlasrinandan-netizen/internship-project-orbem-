import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, RefreshCw, HelpCircle, ShieldAlert } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function ClaimsManager() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchClaims = async () => {
    setLoading(true);
    try {
      // Fetch quotes to extract linked claims (to display company names, etc)
      // Since SQLite db contains claims table directly, we can fetch them via details or run a query
      // Let's call quotes database list, then aggregate or let the server return list if we query.
      // Wait, let's fetch all quotations, and extract their claims! Since quotations contains claims,
      // or we can fetch quotations and check which ones have claims.
      // Alternatively, let's query all quotations, fetch details of each, or let's fetch quotes list and check if we can query claims directly.
      // Let's list all quotes. Since quotes contains claims, let's query details for quotes that might have claims,
      // or simpler: let's query our database list API. Wait, we seeded claims for q-2.
      // Let's write a fetch of quotations details or a simple database get of claims.
      // Wait, let's see how claims are fetched in backend/server.js. There is no direct "GET /api/claims" endpoint,
      // but wait! We can add a "GET /api/claims" endpoint in server.js, OR we can fetch quotes and retrieve claims.
      // Let's check: in backend/server.js we have:
      // "POST /api/claims" and "PUT /api/claims/:id/status"
      // Wait, is there a GET /api/claims? Let's check server.js. No, we only have get quotes, and we fetch claims in GET /api/quotes/:id.
      // So to display all claims, we should either:
      // A) Fetch all quotations, and check if they contain claims (since GET /api/quotes returns quotes list). But wait, GET /api/quotes does not return claims inside list.
      // B) Or we can write a quick endpoint in server.js "GET /api/claims" to fetch all claims directly. This is a very clean and standard REST pattern!
      // Let's modify backend/server.js to add `GET /api/claims`!
      // Wait, let's finish writing ClaimsManager.jsx first, assuming the GET /api/claims API exists, and then we will add it to server.js! That's a perfect strategy.
      
      const res = await fetch(`${API_BASE_URL}/api/claims`);
      if (!res.ok) throw new Error('Failed to retrieve claims.');
      const data = await res.json();
      setClaims(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleUpdateClaimStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/claims/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update claim status.');
      await fetchClaims();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredClaims = claims.filter(c => {
    const typeMatch = filterType ? c.claim_type === filterType : true;
    const statusMatch = filterStatus ? c.status === filterStatus : true;
    return typeMatch && statusMatch;
  });

  const getKPIStats = () => {
    const totalClaimsCount = claims.length;
    const pendingClaims = claims.filter(c => c.status === 'Submitted' || c.status === 'Investigating').length;
    const totalApprovedCompensation = claims
      .filter(c => c.status === 'Approved')
      .reduce((sum, c) => sum + (c.claim_amount || 0), 0);

    return { totalClaimsCount, pendingClaims, totalApprovedCompensation };
  };

  const stats = getKPIStats();

  if (loading && claims.length === 0) {
    return (
      <div className="loading-spinner">
        <RefreshCw className="animate-spin" />
        <span style={{ marginLeft: '10px' }}>Loading incident room...</span>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '10px', marginBottom: '1.5rem', color: '#ef4444' }}>
          <strong>Error loading claims:</strong> {error}
        </div>
      )}

      {/* KPI stats for claims */}
      <div className="kpi-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="kpi-card">
          <div className="kpi-details">
            <h3>Registered Incidents</h3>
            <div className="value">{stats.totalClaimsCount}</div>
          </div>
          <div className="kpi-icon-container primary">
            <AlertCircle />
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-details">
            <h3>Active Investigations</h3>
            <div className="value">{stats.pendingClaims}</div>
          </div>
          <div className="kpi-icon-container warning">
            <RefreshCw />
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-details">
            <h3>Disbursed Compensation</h3>
            <div className="value" style={{ color: '#ef4444' }}>${stats.totalApprovedCompensation.toLocaleString()}</div>
          </div>
          <div className="kpi-icon-container secondary" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <ShieldAlert />
          </div>
        </div>
      </div>

      {/* Filter and Table view */}
      <div className="glass-panel">
        <div className="panel-header">
          <h2>Support Incidents & Insurance Claims</h2>
          <button className="btn btn-secondary btn-sm" onClick={fetchClaims}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            <option value="Complaint">Complaint</option>
            <option value="Insurance Claim">Insurance Claim</option>
          </select>

          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Investigating">Investigating</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {filteredClaims.length === 0 ? (
            <div className="empty-state">
              <HelpCircle size={40} style={{ opacity: 0.3, marginBottom: '8px' }} />
              <p>No complaints or insurance claims are currently logged under these filters.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Quote Ref</th>
                  <th>Incident Type</th>
                  <th>Incident details</th>
                  <th>Compensation Requested</th>
                  <th>Status</th>
                  <th>Logged Date</th>
                  <th>Workflow Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.id}</td>
                    <td style={{ fontWeight: 600, color: '#6366f1' }}>{c.quotation_id}</td>
                    <td>
                      <span style={{ 
                        padding: '0.2rem 0.6rem', 
                        borderRadius: '4px', 
                        fontSize: '0.75rem', 
                        fontWeight: 600, 
                        background: c.claim_type === 'Complaint' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                        color: c.claim_type === 'Complaint' ? '#f59e0b' : '#ef4444' 
                      }}>
                        {c.claim_type}
                      </span>
                    </td>
                    <td style={{ maxWidth: '300px', fontSize: '0.85rem', color: '#f3f4f6' }}>
                      "{c.details}"
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {c.claim_amount > 0 ? `$${c.claim_amount.toLocaleString()}` : '-'}
                    </td>
                    <td>
                      <span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      {c.status !== 'Approved' && c.status !== 'Rejected' && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {c.status === 'Submitted' && (
                            <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleUpdateClaimStatus(c.id, 'Investigating')}>
                              Investigate
                            </button>
                          )}
                          <button className="btn btn-success" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleUpdateClaimStatus(c.id, 'Approved')}>
                            Approve
                          </button>
                          <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', border: '1px solid #ef4444', color: '#ef4444' }} onClick={() => handleUpdateClaimStatus(c.id, 'Rejected')}>
                            Reject
                          </button>
                        </div>
                      )}
                      {(c.status === 'Approved' || c.status === 'Rejected') && (
                        <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontStyle: 'italic' }}>Closed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
