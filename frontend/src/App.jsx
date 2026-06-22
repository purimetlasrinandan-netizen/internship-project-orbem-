import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Sparkles, 
  MapPin, 
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import QuoteCreator from './components/QuoteCreator';
import QuoteDetail from './components/QuoteDetail';
import AIAssistant from './components/AIAssistant';
import WarehouseTracker from './components/WarehouseTracker';
import ClaimsManager from './components/ClaimsManager';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedQuoteId, setSelectedQuoteId] = useState(null);
  const [selectedAwbId, setSelectedAwbId] = useState(null);

  const handleViewQuote = (id) => {
    setSelectedQuoteId(id);
    setCurrentTab('quote-detail');
  };

  const handleNavigateToShipment = (awbId) => {
    setSelectedAwbId(awbId);
    setCurrentTab('tracking');
  };

  const handleTabChange = (tabName) => {
    setCurrentTab(tabName);
    setSelectedQuoteId(null);
    setSelectedAwbId(null);
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-container">
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white', fontSize: '1.2rem' }}>O</div>
          <span className="logo-text">ORBEM FREIGHT</span>
        </div>

        <nav className="nav-links">
          <li 
            className={`nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleTabChange('dashboard')}
          >
            <LayoutDashboard className="nav-icon" />
            <span>Dashboard</span>
          </li>

          <li 
            className={`nav-item ${currentTab === 'creator' ? 'active' : ''}`}
            onClick={() => handleTabChange('creator')}
          >
            <PlusCircle className="nav-icon" />
            <span>Create Quote</span>
          </li>

          <li 
            className={`nav-item ${currentTab === 'ai-assistant' ? 'active' : ''}`}
            onClick={() => handleTabChange('ai-assistant')}
          >
            <Sparkles className="nav-icon" />
            <span>AI Assistant</span>
          </li>

          <li 
            className={`nav-item ${currentTab === 'tracking' ? 'active' : ''}`}
            onClick={() => handleTabChange('tracking')}
          >
            <MapPin className="nav-icon" />
            <span>Cargo Tracking</span>
          </li>

          <li 
            className={`nav-item ${currentTab === 'claims' ? 'active' : ''}`}
            onClick={() => handleTabChange('claims')}
          >
            <AlertTriangle className="nav-icon" />
            <span>Incident Claims</span>
          </li>

          {currentTab === 'quote-detail' && (
            <li className="nav-item active" style={{ marginTop: '2rem', borderLeftColor: '#f59e0b' }}>
              <FolderOpen className="nav-icon" style={{ color: '#f59e0b' }} />
              <span style={{ color: '#f59e0b' }}>Quote: {selectedQuoteId}</span>
            </li>
          )}
        </nav>

        <div style={{ fontSize: '0.75rem', color: '#9ca3af', borderTop: '1px solid var(--border-muted)', paddingTop: '1rem', textAlign: 'center' }}>
          <div>ORBEM solutions Pvt. Ltd.</div>
          <div style={{ opacity: 0.6, marginTop: '2px' }}>v1.0.0 Prototype</div>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="main-content">
        <header className="header">
          <div className="header-title">
            <h1>
              {currentTab === 'dashboard' && 'Operations Dashboard'}
              {currentTab === 'creator' && 'Freight Quotation System'}
              {currentTab === 'ai-assistant' && 'AI Cargo Assistant'}
              {currentTab === 'tracking' && 'Consignment Tracking Chamber'}
              {currentTab === 'claims' && 'Claims Audit Panel'}
              {currentTab === 'quote-detail' && `Quotation Workspace`}
            </h1>
            <p>
              {currentTab === 'dashboard' && 'Overview of freight revenues, active quotes, milestones, and claims.'}
              {currentTab === 'creator' && 'Generate price quotations based on route, chargeable weights, and urgency.'}
              {currentTab === 'ai-assistant' && 'Standardize descriptions, compile customs document checklists, and query rates.'}
              {currentTab === 'tracking' && 'Update warehouse racking logs and dispatch milestone tracks.'}
              {currentTab === 'claims' && 'Audit cargo damage claims, manage complaints, and track payouts.'}
              {currentTab === 'quote-detail' && `Review and edit details, process approvals, or download files.`}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
            <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 500 }}>Database connected</span>
          </div>
        </header>

        {/* Content Tabs */}
        {currentTab === 'dashboard' && (
          <Dashboard 
            onViewQuote={handleViewQuote} 
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        )}
        
        {currentTab === 'creator' && (
          <QuoteCreator onQuoteCreated={handleViewQuote} />
        )}

        {currentTab === 'quote-detail' && (
          <QuoteDetail 
            quoteId={selectedQuoteId} 
            onBack={() => handleTabChange('dashboard')} 
            onNavigateToShipment={handleNavigateToShipment}
          />
        )}

        {currentTab === 'ai-assistant' && (
          <AIAssistant />
        )}

        {currentTab === 'tracking' && (
          <WarehouseTracker initialAwbId={selectedAwbId} />
        )}

        {currentTab === 'claims' && (
          <ClaimsManager />
        )}
      </main>
    </div>
  );
}
