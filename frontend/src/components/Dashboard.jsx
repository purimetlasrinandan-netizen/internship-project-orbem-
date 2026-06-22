import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  FileText, 
  CheckCircle2, 
  Truck, 
  AlertOctagon, 
  Search, 
  Filter, 
  TrendingUp, 
  RefreshCw 
} from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function Dashboard({ onViewQuote, onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cargoFilter, setCargoFilter] = useState('');
  const [quotes, setQuotes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsRes = await fetch(`${API_BASE_URL}/api/dashboard/stats`);
      if (!statsRes.ok) throw new Error('Failed to fetch dashboard stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch quotes
      let url = `${API_BASE_URL}/api/quotes?`;
      if (statusFilter) url += `status=${statusFilter}&`;
      if (cargoFilter) url += `cargo_type=${cargoFilter}&`;
      if (search) url += `search=${search}&`;
      
      const quotesRes = await fetch(url);
      if (!quotesRes.ok) throw new Error('Failed to fetch quotations list');
      const quotesData = await quotesRes.json();
      setQuotes(quotesData);

      // Fetch notifications feed
      try {
        const notifRes = await fetch(`${API_BASE_URL}/api/notifications`);
        if (notifRes.ok) {
          const notifData = await notifRes.json();
          setNotifications(notifData);
        }
      } catch (ne) {
        console.error('Error fetching alerts feed:', ne);
      }
      
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [statusFilter, cargoFilter, search]);

  if (loading && !stats) {
    return (
      <div className="loading-spinner">
        <RefreshCw className="nav-icon animate-spin" />
        <span style={{ marginLeft: '10px' }}>Loading cargo logs...</span>
      </div>
    );
  }

  const kpis = stats?.kpis || {
    totalRevenue: 0,
    activeQuotes: 0,
    pendingApprovals: 0,
    activeShipments: 0,
    activeClaims: 0
  };

  return (
    <div>
      {error && (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '10px', marginBottom: '1.5rem', color: '#ef4444' }}>
          <strong>Error loading dashboard:</strong> {error}
        </div>
      )}

      {/* KPI Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-details">
            <h3>Approved Revenue</h3>
            <div className="value">${kpis.totalRevenue.toLocaleString()}</div>
          </div>
          <div className="kpi-icon-container secondary">
            <DollarSign />
          </div>
        </div>

        <div className="kpi-card" style={{ cursor: 'pointer' }} onClick={() => setStatusFilter('Pending Approval')}>
          <div className="kpi-details">
            <h3>Pending Approvals</h3>
            <div className="value">{kpis.pendingApprovals}</div>
          </div>
          <div className="kpi-icon-container warning">
            <CheckCircle2 />
          </div>
        </div>

        <div className="kpi-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('tracking')}>
          <div className="kpi-details">
            <h3>Active Cargo Bills</h3>
            <div className="value">{kpis.activeShipments}</div>
          </div>
          <div className="kpi-icon-container primary">
            <Truck />
          </div>
        </div>

        <div className="kpi-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('claims')}>
          <div className="kpi-details">
            <h3>Active Claims</h3>
            <div className="value">{kpis.activeClaims}</div>
          </div>
          <div className="kpi-icon-container info" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <AlertOctagon />
          </div>
        </div>
      </div>

      {/* Analytics Charts & Routing Performance */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Visual Volumetric Bar Chart */}
        <div className="glass-panel" style={{ margin: 0 }}>
          <div className="panel-header">
            <h2>Monthly Volume & Projected Revenue</h2>
            <TrendingUp style={{ color: '#10b981' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '180px', paddingTop: '10px' }}>
            {stats?.monthlyVolumes?.map((m, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>${m.revenue.toLocaleString()}</span>
                {/* Visual Bar representation */}
                <div style={{ 
                  width: '32px', 
                  height: `${(m.revenue / 22000) * 120}px`, 
                  background: 'linear-gradient(to top, #6366f1, #10b981)', 
                  borderRadius: '6px 6px 0 0',
                  boxShadow: '0 0 10px rgba(99, 102, 241, 0.2)'
                }}></div>
                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#9ca3af' }}>{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Routes */}
        <div className="glass-panel" style={{ margin: 0 }}>
          <div className="panel-header">
            <h2>Top Freight Routes</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats?.popularRoutes?.map((r, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.9rem' }}>
                  <span>{r.origin} ➔ {r.destination}</span>
                  <span style={{ color: '#10b981' }}>${r.total_revenue.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px' }}>
                  <span>{r.count} Quote Requests</span>
                  <span>Avg Rate</span>
                </div>
              </div>
            ))}
            {(!stats?.popularRoutes || stats.popularRoutes.length === 0) && (
              <div className="empty-state" style={{ padding: '1.5rem 0' }}>No route bookings yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Real-time Dispatch Notifications log */}
      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <div className="panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ position: 'relative', display: 'inline-flex' }}>
              <span className="animate-ping" style={{ position: 'absolute', display: 'inline-flex', height: '8px', width: '8px', borderRadius: '50%', backgroundColor: '#10b981', opacity: 0.75 }}></span>
              <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', height: '8px', width: '8px', backgroundColor: '#10b981' }}></span>
            </span>
            <h2>Communications Alert Feed (Simulated Exporter Messaging)</h2>
          </div>
          <span className="badge badge-draft" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>Live Dispatch</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {notifications.slice(0, 3).map((n) => (
            <div key={n.id} style={{ 
              background: 'rgba(255,255,255,0.01)', 
              border: '1px solid var(--border-muted)', 
              borderRadius: '12px', 
              padding: '12px 14px',
              borderLeft: n.type === 'WhatsApp' ? '4px solid #10b981' : '4px solid #6366f1',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: '#9ca3af', marginBottom: '6px' }}>
                  <span style={{ color: n.type === 'WhatsApp' ? '#10b981' : '#6366f1' }}>{n.type === 'WhatsApp' ? 'WhatsApp Business' : 'SMTP Email Gateway'}</span>
                  <span>{new Date(n.created_at).toLocaleTimeString()}</span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f3f4f6' }}>{n.customer_company}</div>
                <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '4px', fontStyle: 'italic' }}>"{n.subject_message}"</p>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6366f1', marginTop: '8px', textAlign: 'right' }}>
                Ref: <strong>{n.quotation_id}</strong>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '1.5rem', color: '#9ca3af', fontSize: '0.85rem' }}>
              No messages have been dispatched yet. Create and approve quotations to see alerts.
            </div>
          )}
        </div>
      </div>

      {/* Filter Toolbar & Data Grid */}
      <div className="glass-panel">
        <div className="panel-header">
          <h2>Quotation Ledger</h2>
          <button className="btn btn-secondary btn-sm" onClick={fetchDashboardData}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af' }} />
            <input 
              type="text" 
              placeholder="Search by Shipper Company, Contact Name or Quote ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: '36px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Revision Required">Revision Required</option>
            </select>

            <select value={cargoFilter} onChange={(e) => setCargoFilter(e.target.value)}>
              <option value="">All Cargo Categories</option>
              <option value="General Cargo">General Cargo</option>
              <option value="Perishable (Pharma)">Perishable (Pharma)</option>
              <option value="Perishable (Food)">Perishable (Food)</option>
              <option value="Hazardous Chemicals">Hazardous Chemicals</option>
              <option value="Dangerous Goods">Dangerous Goods</option>
              <option value="High-Value Electronics">High-Value Electronics</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          {quotes.length === 0 ? (
            <div className="empty-state">
              <FileText size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
              <p>No quotation records match the search filter. Create one to get started!</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Quote ID</th>
                  <th>Client Company</th>
                  <th>Route</th>
                  <th>Cargo Weight (Chg)</th>
                  <th>Total Cost</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => (
                  <tr key={q.id}>
                    <td style={{ fontWeight: 600, color: '#f3f4f6' }}>{q.id}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{q.customer_company}</div>
                      <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{q.customer_name}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{q.origin} ➔ {q.destination}</td>
                    <td>{q.chargeable_weight} kg <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>({q.cargo_type})</span></td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>${q.total_price.toFixed(2)}</td>
                    <td>
                      <span className={`badge badge-${q.status.toLowerCase().replace(' ', '-')}`}>
                        {q.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                      {new Date(q.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => onViewQuote(q.id)}>
                        Manage
                      </button>
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
