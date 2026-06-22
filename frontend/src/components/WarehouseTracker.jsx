import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Inbox, RefreshCw, CheckCircle, Search, Save } from 'lucide-react';
import { API_BASE_URL } from '../config';

const MILESTONES = ['Received', 'Processed', 'Departed', 'In-Transit', 'Arrived', 'Delivered'];

export default function WarehouseTracker({ initialAwbId }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [shipments, setShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  // Form states for update
  const [dispatchStatus, setDispatchStatus] = useState('Received');
  const [warehouseLocation, setWarehouseLocation] = useState('');

  // Fetch all active shipments for list dropdown or grid
  const fetchShipments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/dashboard/stats`);
      if (res.ok) {
        const data = await res.json();
        setShipments(data.activeShipments || []);
        
        // If an initial AWB ID is provided from another workspace, auto-select it
        if (initialAwbId) {
          const matched = data.activeShipments.find(s => s.id === initialAwbId);
          if (matched) {
            handleSelectShipment(matched);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching shipments tracker:', err);
      setError('Failed to retrieve cargo active log.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [initialAwbId]);

  const handleSelectShipment = (shipment) => {
    setSelectedShipment(shipment);
    setDispatchStatus(shipment.dispatch_status);
    setWarehouseLocation(shipment.warehouse_location);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    setLoading(true);
    try {
      // Find matching quotation detail which has AWB
      const res = await fetch(`${API_BASE_URL}/api/quotes`);
      if (res.ok) {
        const quotes = await res.json();
        // search inside quotes that have AWB
        const matches = quotes.filter(q => q.status === 'Approved');
        // Let's filter client-side for simplicity
        const foundQuote = matches.find(q => q.id.includes(searchQuery) || (q.customer_company && q.customer_company.toLowerCase().includes(searchQuery.toLowerCase())));
        if (foundQuote) {
          // fetch details
          const detailRes = await fetch(`${API_BASE_URL}/api/quotes/${foundQuote.id}`);
          const detailData = await detailRes.json();
          if (detailData.airwayBill) {
            handleSelectShipment({
              ...detailData.airwayBill,
              origin: detailData.quote.origin,
              destination: detailData.quote.destination,
              customer_company: detailData.quote.customer_company
            });
            setError(null);
            return;
          }
        }
      }
      setError('Shipment Airway Bill record not found.');
    } catch (err) {
      setError('Search failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMilestone = async (e) => {
    e.preventDefault();
    if (!selectedShipment) return;
    setUpdating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/shipments/${selectedShipment.id}/milestone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dispatch_status: dispatchStatus,
          warehouse_location: warehouseLocation
        })
      });
      if (!res.ok) throw new Error('Failed to update shipment tracking.');
      const data = await res.json();
      
      // Update local state
      setSelectedShipment(prev => ({
        ...prev,
        dispatch_status: dispatchStatus,
        warehouse_location: warehouseLocation
      }));
      
      // Refresh general list
      await fetchShipments();
      alert('Logistics updates saved successfully.');
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const getStepIndex = (status) => {
    return MILESTONES.indexOf(status);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
      
      {/* Shipments List Sidebar */}
      <div className="glass-panel" style={{ margin: 0 }}>
        <div className="panel-header">
          <h2>Active Shipments</h2>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem' }}>
          <input 
            type="text" 
            placeholder="Search Company/Quote..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, padding: '0.5rem' }}
          />
          <button type="submit" className="btn btn-secondary" style={{ padding: '0.5rem' }}>
            <Search size={16} />
          </button>
        </form>

        {loading && (
          <div className="loading-spinner" style={{ padding: '1rem 0' }}>
            <RefreshCw className="animate-spin" size={16} />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
          {shipments.map((ship) => (
            <div 
              key={ship.id} 
              onClick={() => handleSelectShipment(ship)}
              style={{ 
                padding: '12px', 
                borderRadius: '10px', 
                border: '1px solid var(--border-muted)', 
                cursor: 'pointer',
                background: selectedShipment?.id === ship.id ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.01)',
                borderColor: selectedShipment?.id === ship.id ? 'var(--primary)' : 'var(--border-muted)',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.85rem' }}>
                <span style={{ color: '#6366f1' }}>{ship.awb_number}</span>
                <span className="badge badge-approved" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>{ship.dispatch_status}</span>
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 500, marginTop: '4px' }}>{ship.customer_company}</div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span>Route: {ship.origin} ➔ {ship.destination}</span>
                <span>Flight: {ship.flight_number}</span>
              </div>
            </div>
          ))}

          {shipments.length === 0 && !loading && (
            <div className="empty-state" style={{ padding: '2rem 0' }}>
              <Inbox size={24} style={{ opacity: 0.3, marginBottom: '6px' }} />
              <div>No active cargo shipments found. Approve a quote to create shipment entries.</div>
            </div>
          )}
        </div>
      </div>

      {/* Tracking Stepper & Operations Management */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {selectedShipment ? (
          <>
            {/* Tracking Milestones Visual */}
            <div className="glass-panel" style={{ margin: 0 }}>
              <div className="panel-header">
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f3f4f6' }}>Shipment Milestone Tracker</h2>
                  <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '2px' }}>
                    Airway Bill Ref: <strong style={{ color: '#6366f1' }}>{selectedShipment.awb_number}</strong> | Client: <strong>{selectedShipment.customer_company}</strong>
                  </p>
                </div>
              </div>

              {/* Stepper Progress */}
              <div className="stepper">
                {MILESTONES.map((status, index) => {
                  const currentIdx = getStepIndex(selectedShipment.dispatch_status);
                  const isActive = index === currentIdx;
                  const isCompleted = index < currentIdx;

                  return (
                    <div key={status} className={`step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                      <div className="step-dot">
                        {isCompleted ? '✓' : index + 1}
                      </div>
                      <span className="step-label">{status}</span>
                    </div>
                  );
                })}
              </div>

              {/* Current details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', background: 'rgba(0,0,0,0.15)', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-muted)', marginTop: '2rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Flight Identification</span>
                  <div style={{ fontWeight: 600, marginTop: '4px', fontSize: '1.05rem' }}>{selectedShipment.flight_number}</div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Warehouse Location</span>
                  <div style={{ fontWeight: 600, marginTop: '4px', fontSize: '1.05rem', color: '#10b981' }}>{selectedShipment.warehouse_location}</div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Last Update Stamp</span>
                  <div style={{ fontWeight: 600, marginTop: '4px', fontSize: '0.85rem' }}>
                    {new Date(selectedShipment.updated_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Warehouse Operations Form to Update Status */}
            <div className="glass-panel" style={{ margin: 0 }}>
              <div className="panel-header">
                <h2>Warehouse Management Console</h2>
              </div>

              <form onSubmit={handleUpdateMilestone} className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="form-group">
                  <label>Update Transit Status</label>
                  <select 
                    value={dispatchStatus} 
                    onChange={(e) => setDispatchStatus(e.target.value)}
                  >
                    {MILESTONES.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Update Warehouse Bin Location (Shelf, Aisle)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Aisle D - Rack 10"
                    value={warehouseLocation} 
                    onChange={(e) => setWarehouseLocation(e.target.value)}
                  />
                </div>

                <div className="form-group full-width" style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={updating}>
                    <Save size={16} /> {updating ? 'Saving updates...' : 'Save Logistics Update'}
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="glass-panel" style={{ margin: 0, padding: '5rem 2rem', textAlign: 'center', color: '#9ca3af' }}>
            <MapPin size={48} style={{ opacity: 0.2, marginBottom: '12px', color: '#6366f1' }} />
            <h3>Logistics Tracking Room</h3>
            <p style={{ maxWidth: '340px', fontSize: '0.85rem', margin: '8px auto 0' }}>
              Select an active shipment from the ledger panel or enter its reference key to manage milestones and warehouse shelf coordinates.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
