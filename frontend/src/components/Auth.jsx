import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Briefcase, 
  ShieldCheck, 
  Globe, 
  Cpu, 
  FileText, 
  MapPin, 
  Clipboard, 
  Activity, 
  CheckCircle2, 
  Info,
  Shield
} from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function Auth({ onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Register fields
  const [fullName, setFullName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  
  // Loading & notification states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Reset notifications on toggle
  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoginPassword('');
    setRegisterPassword('');
    setConfirmPassword('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login verification failed. Check credentials.');
      }

      // Success
      if (rememberMe) {
        localStorage.setItem('orbem_admin_token', data.token);
        localStorage.setItem('orbem_admin_user', JSON.stringify(data.user));
      } else {
        sessionStorage.setItem('orbem_admin_token', data.token);
        sessionStorage.setItem('orbem_admin_user', JSON.stringify(data.user));
      }

      setSuccessMsg('Successfully authenticated. Redirecting...');
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 800);

    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Basic Client Validations
    if (!fullName || !registerEmail || !employeeId || !registerPassword || !confirmPassword) {
      setErrorMsg('All fields are required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (registerPassword !== confirmPassword) {
      setErrorMsg('Password confirmation does not match original password.');
      return;
    }

    if (registerPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email: registerEmail,
          employee_id: employeeId,
          password: registerPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create administrator account.');
      }

      setSuccessMsg('Administrator account created successfully.');
      
      // Reset registration form
      setFullName('');
      setRegisterEmail('');
      setEmployeeId('');
      setRegisterPassword('');
      setConfirmPassword('');

      // Auto toggle to login page after 2 seconds
      setTimeout(() => {
        setAuthMode('login');
        setLoginEmail(registerEmail);
        setSuccessMsg(null);
        setErrorMsg(null);
      }, 2000);

    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      {/* Background Decorative Blur Blobs */}
      <div className="auth-blob blob-purple"></div>
      <div className="auth-blob blob-emerald"></div>
      
      <div className="auth-split-layout">
        
        {/* LEFT SHOWCASE PANEL (Desktop Only) */}
        <aside className="auth-showcase-panel">
          <div className="showcase-header">
            <div className="showcase-logo-container">
              <div className="showcase-logo-icon">O</div>
              <span className="showcase-logo-text-left">
                <span className="brand-orbem">ORBEM</span> <span className="brand-freight">FREIGHT</span>
              </span>
            </div>
            
            <h1 className="showcase-title">
              Air Freight. <span className="highlight-text">Simplified.</span>
            </h1>
            <p className="showcase-desc">
              Manage quotations, track shipments, monitor operations, and streamline freight workflows with AI-powered logistics intelligence.
            </p>
          </div>

          {/* Interactive World Cargo Illustration Background */}
          <div className="showcase-cargo-map-container">
            <img src="/logistics-showcase.png" alt="ORBEM Cargo network" className="showcase-map-image" />
            <div className="map-overlay-vessel">
              <svg className="map-svg-grid-overlay" viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
                {/* Dynamic flight paths connecting the cities */}
                {/* New York to London */}
                <path d="M 112 44 Q 142 25, 172 33" fill="none" stroke="rgba(99, 102, 241, 0.55)" strokeWidth="1.5" className="flight-line" />
                
                {/* London to Frankfurt */}
                <path d="M 172 33 Q 182 30, 192 33" fill="none" stroke="rgba(99, 102, 241, 0.55)" strokeWidth="1.5" className="flight-line" />
                
                {/* Frankfurt to Dubai */}
                <path d="M 192 33 Q 218 35, 244 55" fill="none" stroke="rgba(99, 102, 241, 0.55)" strokeWidth="1.5" className="flight-line" />
                
                {/* Dubai to Singapore */}
                <path d="M 244 55 Q 274 75, 304 117" fill="none" stroke="rgba(99, 102, 241, 0.55)" strokeWidth="1.5" className="flight-line" />
                
                {/* Dubai to Shanghai */}
                <path d="M 244 55 Q 272 50, 300 66" fill="none" stroke="rgba(16, 185, 129, 0.45)" strokeWidth="1.2" className="flight-line" />
                
                {/* Shanghai to Tokyo */}
                <path d="M 300 66 Q 316 52, 332 48" fill="none" stroke="rgba(99, 102, 241, 0.55)" strokeWidth="1.5" className="flight-line" />
                
                {/* Singapore to Tokyo */}
                <path d="M 304 117 Q 320 80, 332 48" fill="none" stroke="rgba(16, 185, 129, 0.45)" strokeWidth="1.2" className="flight-line" />
                
                {/* Singapore to Sydney */}
                <path d="M 304 117 Q 320 140, 352 158" fill="none" stroke="rgba(99, 102, 241, 0.55)" strokeWidth="1.5" className="flight-line" />

                {/* Pulsing Airport/City Nodes */}
                <circle cx="112" cy="44" r="4.5" className="airport-node" />
                <circle cx="172" cy="33" r="4.5" className="airport-node" />
                <circle cx="192" cy="33" r="4.5" className="airport-node" />
                <circle cx="244" cy="55" r="4.5" className="airport-node" />
                <circle cx="300" cy="66" r="4.5" className="airport-node" />
                <circle cx="332" cy="48" r="4.5" className="airport-node" />
                <circle cx="304" cy="117" r="5.5" className="airport-node" />
                <circle cx="352" cy="158" r="5.5" className="airport-node" />
              </svg>
            </div>
          </div>

        </aside>

        {/* RIGHT SIDEFORM PANEL (Login / Register Card) */}
        <main className="auth-form-side">
          <div className="auth-form-wrapper">
            
            {/* Logo container visible on Mobile/Tablet only */}
            <div className="auth-logo-badge">
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white', fontSize: '1.2rem' }}>O</div>
              <span className="logo-text" style={{ fontSize: '1.25rem', fontWeight: 800 }}>ORBEM FREIGHT</span>
            </div>

            <div className="auth-card-panel">
              
              {/* Notifications / Banner Alerts */}
              {errorMsg && (
                <div className="auth-banner auth-banner-error">
                  <Activity style={{ flexShrink: 0, width: '18px', height: '18px', marginTop: '2px' }} />
                  <span>{errorMsg}</span>
                </div>
              )}
              
              {successMsg && (
                <div className="auth-banner auth-banner-success">
                  <CheckCircle2 style={{ flexShrink: 0, width: '18px', height: '18px', marginTop: '2px' }} />
                  <span>{successMsg}</span>
                </div>
              )}

              {authMode === 'login' ? (
                /* LOGIN FORM */
                <form onSubmit={handleLoginSubmit}>
                  <div className="auth-header-block">
                    <span className="auth-subtitle-brand-welcome">Welcome Back!</span>
                    <h2 className="auth-main-title-access">Administrator Access Portal</h2>
                    <p className="auth-desc-text">
                      Sign in to manage freight quotations, cargo tracking, shipment operations, AI tools, invoice workflows, and business operations.
                    </p>
                  </div>

                  <div className="auth-input-group">
                    <label htmlFor="login-email">Admin Email</label>
                    <div className="input-with-icon-wrapper">
                      <Mail className="input-icon" size={16} />
                      <input
                        id="login-email"
                        type="email"
                        placeholder="Enter your admin email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-input-group">
                    <label htmlFor="login-password">Password</label>
                    <div className="input-with-icon-wrapper">
                      <Lock className="input-icon" size={16} />
                      <input
                        id="login-password"
                        type={showLoginPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        disabled={loading}
                        required
                      />
                      <button
                        type="button"
                        className="auth-password-toggle"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        title={showLoginPassword ? 'Hide Password' : 'Show Password'}
                      >
                        {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="auth-options-row">
                    <label className="auth-checkbox-label">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={loading}
                      />
                      <span>Remember Me</span>
                    </label>
                    <a
                      href="#forgot"
                      className="auth-forgot-link"
                      onClick={(e) => {
                        e.preventDefault();
                        setErrorMsg('Password recovery is restricted to system administrators. Please contact IT support operations.');
                      }}
                    >
                      Forgot Password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary auth-btn-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="auth-spinner" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <Lock size={16} style={{ marginRight: '4px' }} />
                        <span>Admin Sign In</span>
                      </>
                    )}
                  </button>

                  <div className="auth-divider">or</div>

                  {/* Seed Credentials Panel */}
                  <div className="auth-demo-card-box">
                    <div className="auth-demo-title-bar">
                      <Info size={16} className="info-icon" />
                      <span>Demo Credentials</span>
                    </div>
                    <div className="auth-demo-credentials-text">
                      <div className="cred-line">
                        <span className="lbl">Email:</span> <span className="val">admin@orbemfreight.com</span>
                      </div>
                      <div className="cred-line">
                        <span className="lbl">Password:</span> <span className="val">admin123</span>
                      </div>
                    </div>
                  </div>

                  <div className="auth-toggle-prompt">
                    <span>Don't have an account?</span>
                    <a href="#register" className="auth-toggle-action" onClick={(e) => { e.preventDefault(); toggleAuthMode(); }}>
                      Create Administrator Account
                    </a>
                  </div>
                </form>
              ) : (
                /* REGISTRATION FORM */
                <form onSubmit={handleRegisterSubmit}>
                  <div className="auth-header-block">
                    <span className="auth-subtitle-brand-welcome">Security Setup</span>
                    <h2 className="auth-main-title-access" style={{ fontSize: '1.6rem' }}>Create Administrator Account</h2>
                    <p className="auth-desc-text">
                      Register a new administrator account to access the ORBEM Freight Management System.
                    </p>
                  </div>

                  <div className="auth-input-group">
                    <label htmlFor="reg-name">Full Name</label>
                    <div className="input-with-icon-wrapper">
                      <User className="input-icon" size={16} />
                      <input
                        id="reg-name"
                        type="text"
                        placeholder="Enter full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-input-group">
                    <label htmlFor="reg-email">Company Email</label>
                    <div className="input-with-icon-wrapper">
                      <Mail className="input-icon" size={16} />
                      <input
                        id="reg-email"
                        type="email"
                        placeholder="name@orbemfreight.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-input-group">
                    <label htmlFor="reg-empid">Employee ID</label>
                    <div className="input-with-icon-wrapper">
                      <Briefcase className="input-icon" size={16} />
                      <input
                        id="reg-empid"
                        type="text"
                        placeholder="Enter Employee ID (e.g. EMP-101)"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-input-group">
                    <label htmlFor="reg-password">Password</label>
                    <div className="input-with-icon-wrapper">
                      <Lock className="input-icon" size={16} />
                      <input
                        id="reg-password"
                        type={showRegisterPassword ? 'text' : 'password'}
                        placeholder="Min. 6 characters"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        disabled={loading}
                        required
                      />
                      <button
                        type="button"
                        className="auth-password-toggle"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        title={showRegisterPassword ? 'Hide Password' : 'Show Password'}
                      >
                        {showRegisterPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="auth-input-group">
                    <label htmlFor="reg-confirm">Confirm Password</label>
                    <div className="input-with-icon-wrapper">
                      <Lock className="input-icon" size={16} />
                      <input
                        id="reg-confirm"
                        type="password"
                        placeholder="Repeat password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary auth-btn-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="auth-spinner" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={16} style={{ marginRight: '4px' }} />
                        <span>Create Account</span>
                      </>
                    )}
                  </button>

                  <div className="auth-toggle-prompt">
                    <span>Already have an account?</span>
                    <a href="#login" className="auth-toggle-action" onClick={(e) => { e.preventDefault(); toggleAuthMode(); }}>
                      Sign In
                    </a>
                  </div>
                </form>
              )}

              {/* Secure Access Badges (Inside the Form Card bottom) */}
              <div className="auth-card-security-badges">
                <div className="card-badge-col">
                  <ShieldCheck className="badge-icon text-cyan" size={20} />
                  <div className="badge-label-main">Secure Access</div>
                  <div className="badge-label-sub">256-bit Encryption</div>
                </div>
                <div className="card-badge-col">
                  <Lock className="badge-icon text-blue" size={20} />
                  <div className="badge-label-main">Freight Operations</div>
                  <div className="badge-label-sub">Management Portal</div>
                </div>
                <div className="card-badge-col">
                  <ShieldCheck className="badge-icon text-cyan" size={20} />
                  <div className="badge-label-main">Encrypted</div>
                  <div className="badge-label-sub">Authentication</div>
                </div>
              </div>

            </div>

            {/* Mobile/Tablet Security Badge & Footer */}
            <footer className="auth-footer-mobile">
              <div>ORBEM Solutions Pvt. Ltd.</div>
              <div style={{ opacity: 0.6, marginTop: '2px' }}>Air Freight Quotation Management System v1.0</div>
            </footer>

          </div>
        </main>
      </div>
    </div>
  );
}
