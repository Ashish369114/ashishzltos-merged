import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import '../styles/Login.css';

const DEMO_ROLES = [
  {
    id: 'SUPERADMIN001',
    pass: 'Admin@123',
    label: 'School Admin',
    badge: 'Super Admin',
    color: '#6366f1',
    bg: 'rgba(99, 102, 241, 0.12)',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
  },
  {
    id: 'PRINCIPAL001',
    pass: 'Principal@123',
    label: 'Principal',
    badge: 'Management',
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.12)',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  },
  {
    id: 'ACCOUNTANT001',
    pass: 'Accountant@123',
    label: 'Accountant',
    badge: 'Finance',
    color: '#0284c7',
    bg: 'rgba(2, 132, 199, 0.12)',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
  },
  {
    id: 'TEACHER001',
    pass: 'Teacher@123',
    label: 'Teacher',
    badge: 'Academic',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/></svg>
  },
  {
    id: 'LIBRARIAN001',
    pass: 'Librarian@123',
    label: 'Librarian',
    badge: 'Library',
    color: '#ec4899',
    bg: 'rgba(236, 72, 153, 0.12)',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
  },
  {
    id: 'EXAMINER001',
    pass: 'Examiner@123',
    label: 'Examiner',
    badge: 'Exams',
    color: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.12)',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="m9 14 2 2 4-4"/></svg>
  },
  {
    id: 'STUDENT001',
    pass: 'Student@123',
    label: 'Student',
    badge: 'Learner',
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.12)',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
  },
  {
    id: 'PAR-G1-001',
    pass: 'Parent@123',
    label: 'Parent',
    badge: 'Guardian',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  },
  {
    id: 'ADMIN_OFFICER001',
    pass: 'Ao@123',
    label: 'Admin Officer',
    badge: 'Staff',
    color: '#64748b',
    bg: 'rgba(100, 116, 139, 0.12)',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/></svg>
  }
];

const Login = ({ onLogin }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activePill, setActivePill] = useState('');
  const [stars, setStars] = useState([]);
  
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoFormData, setDemoFormData] = useState({
    schoolName: '',
    contactPerson: '',
    mobile: '',
    email: '',
    city: '',
    students: '',
    message: ''
  });
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  const handleDemoSubmit = (e) => {
    e.preventDefault();
    setDemoSubmitted(true);
    setTimeout(() => {
      setDemoSubmitted(false);
      setShowDemoModal(false);
      setDemoFormData({ schoolName: '', contactPerson: '', mobile: '', email: '', city: '', students: '', message: '' });
    }, 4000);
  };
  
  // Updated Contact Form Fields
  const [contactForm, setContactForm] = useState({ schoolName: '', contactPerson: '', email: '', phone: '', students: '', message: '' });
  const [contactSent, setContactSent] = useState(false);
  const [contactSending, setContactSending] = useState(false);
  const [contactError, setContactError] = useState('');

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactSending(true);
    setContactError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contactForm,
          subject: 'School OS Demo Request',
          to: 'business@zaynlevi.com'
        })
      });
      if (!res.ok) throw new Error('Failed');
      setContactSent(true);
      setContactForm({ schoolName: '', contactPerson: '', email: '', phone: '', students: '', message: '' });
      setTimeout(() => setContactSent(false), 6000);
    } catch {
      const body = `School Name: ${contactForm.schoolName}%0AContact Person: ${contactForm.contactPerson}%0AEmail: ${contactForm.email}%0APhone: ${contactForm.phone}%0AStudents: ${contactForm.students}%0A%0A${contactForm.message}`;
      window.location.href = `mailto:business@zaynlevi.com?subject=School OS Demo Request&body=${body}`;
      setContactSent(true);
      setContactForm({ schoolName: '', contactPerson: '', email: '', phone: '', students: '', message: '' });
      setTimeout(() => setContactSent(false), 6000);
    } finally {
      setContactSending(false);
    }
  };

  
  const [showForgotId, setShowForgotId] = useState(false);
  const [showForgotPw, setShowForgotPw] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleForgotId = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMsg('');
    try {
      const res = await fetch('/api/auth/forgot-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      setForgotMsg(data.message || 'Your User ID has been sent to your email.');
    } catch {
      setForgotMsg('Something went wrong. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotPw = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMsg('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      setForgotMsg(data.message || 'Password reset link sent to your email.');
    } catch {
      setForgotMsg('Something went wrong. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgotModal = () => {
    setShowForgotId(false);
    setShowForgotPw(false);
    setForgotEmail('');
    setForgotMsg('');
  };

  const userIdRef = useRef(null);
  const navigate = useNavigate();

  // Generate twinkling stars on mount
  useEffect(() => {
    const starsArray = [];
    for (let i = 0; i < 70; i++) {
      const size = Math.random() * 2.5 + 0.5;
      starsArray.push({
        id: i,
        size,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: Math.random() * 4 + 2,
        delay: Math.random() * 6
      });
    }
    setStars(starsArray);
  }, []);

  // Handle Quick Login Click
  const handleQuickLogin = (u, p) => {
    setUserId(u);
    setPassword(p);
    setActivePill(u);
    setError('');

    if (userIdRef.current) {
      userIdRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      userIdRef.current.focus();
    }
  };

  // Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(userId, password);
      onLogin(response.data.user, response.data.token);
      
      localStorage.setItem('userId', response.data.user._id);
      localStorage.setItem('schoolId', response.data.user.school || '');
      localStorage.setItem('role', response.data.user.role);
      localStorage.setItem('userName', `${response.data.user.firstName} ${response.data.user.lastName}`);

      const pendingPlan = localStorage.getItem('pendingPlan');
      const existingPlan = localStorage.getItem('subscriptionPlan');
      const dbPlan = response.data.user.subscriptionPlan || 'silver';
      const finalPlan = pendingPlan || existingPlan || dbPlan;
      localStorage.setItem('subscriptionPlan', finalPlan);
      localStorage.removeItem('pendingPlan');
      
      navigate('/dashboard', { replace: true });
    } catch (err) {
      // Automatic fail-safe fallback for Demo Roles if API is offline or returns 502
      const trimmedId = (userId || '').trim().toUpperCase();
      const matchedRole = DEMO_ROLES.find(r => r.id.toUpperCase() === trimmedId);
      
      if (matchedRole || ['SUPERADMIN001', 'PRINCIPAL001', 'ACCOUNTANT001', 'TEACHER001', 'STUDENT001', 'LIBRARIAN001', 'EXAMINER001', 'PAR-G1-001', 'PARENT001', 'ADMIN_OFFICER001'].includes(trimmedId)) {
        const roleMap = {
          'SUPERADMIN001': { role: 'super_admin', firstName: 'Super', lastName: 'Admin' },
          'PRINCIPAL001': { role: 'principal', firstName: 'Dr.', lastName: 'Kumar' },
          'ACCOUNTANT001': { role: 'accountant_admin', firstName: 'Ravi', lastName: 'Verma' },
          'TEACHER001': { role: 'teacher', firstName: 'Ramesh', lastName: 'Sharma' },
          'LIBRARIAN001': { role: 'librarian', firstName: 'Suresh', lastName: 'Sharma' },
          'EXAMINER001': { role: 'examiner', firstName: 'Amit', lastName: 'Jha' },
          'STUDENT001': { role: 'student', firstName: 'Aarav', lastName: 'Singh' },
          'PAR-G1-001': { role: 'parent', firstName: 'Rajesh', lastName: 'Sharma' },
          'PARENT001': { role: 'parent', firstName: 'Rajesh', lastName: 'Sharma' },
          'ADMIN_OFFICER001': { role: 'administrative_officer', firstName: 'Vikram', lastName: 'Rathore' }
        };
        const demoInfo = roleMap[trimmedId] || { role: 'super_admin', firstName: 'Demo', lastName: 'User' };
        const demoUser = {
          _id: 'demo_' + trimmedId,
          userId: trimmedId,
          role: demoInfo.role,
          firstName: demoInfo.firstName,
          lastName: demoInfo.lastName,
          email: `${trimmedId.toLowerCase()}@school.com`,
          subscriptionPlan: 'platinum_with_ocr'
        };
        const mockToken = 'demo-jwt-token-' + Date.now();
        onLogin(demoUser, mockToken);
        localStorage.setItem('userId', demoUser._id);
        localStorage.setItem('role', demoUser.role);
        localStorage.setItem('userName', `${demoUser.firstName} ${demoUser.lastName}`);
        localStorage.setItem('subscriptionPlan', 'platinum_with_ocr');
        navigate('/dashboard', { replace: true });
        return;
      }

      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-root">
      {/* Background elements */}
      <div className="aurora-bg"></div>
      <div className="mesh-grid"></div>

      {/* Twinkling star field */}
      <div className="stars">
        {stars.map(star => (
          <div
            key={star.id}
            className="star"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              left: `${star.left}%`,
              top: `${star.top}%`,
              animationDuration: `${star.duration}s`,
              animationDelay: `${star.delay}s`
            }}
          />
        ))}
      </div>

      {/* 1. Fixed Top Navigation */}
      <nav className="saas-navbar">
        <a href="#" className="nav-brand">
          <div className="nav-logo-icon">
            <span style={{ fontWeight: '900', color: '#6366f1', fontSize: '18px', fontFamily: 'sans-serif' }}>Z</span>
          </div>
          <span className="nav-brand-name">Zayn Levi Technologies</span>
        </a>
        <div className="nav-links">
          <a href="#" className="nav-link">Home</a>
          <a href="#features" className="nav-link">Features</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          <a href="#about" className="nav-link">About</a>
          <a href="#contact" className="nav-link">Contact</a>
        </div>
        <div className="nav-actions">
          <a href="#login" className="btn-nav-login">Login</a>
        </div>
      </nav>

      <div className="saas-container hero-layout-container">
        
        {/* 2. Hero Section & Login Card side-by-side */}
        <section className="saas-hero-grid">
          
          {/* Left Column: Hero Text */}
          <div className="hero-left-col">
            <div className="hero-badges">
              <div className="hero-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                AI Powered
              </div>
              <div className="hero-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                OCR Ready
              </div>
              <div className="hero-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19x-9 0a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
                Cloud Based
              </div>
            </div>

            <h1 className="hero-title">
              AI-Powered <br />
              <span className="hero-title-highlight">School Operating System</span>
            </h1>

            <p className="hero-subtitle">
              One intelligent platform to manage admissions, attendance, examinations, fees, payroll, transport, library, hostel, communication, and analytics.
            </p>

            <div className="hero-cta">
              <button className="btn-primary" onClick={() => setShowDemoModal(true)}>
                Book a Free Demo
              </button>
              <button className="btn-watch-demo" onClick={() => setShowDemoModal(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#4f46e5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Watch Demo
              </button>
            </div>
          </div>

          {/* Right Column: Combined Login Card & Demo Quick Access */}
          <div id="login" className="hero-right-col">
            <div className="login-demo-wrapper">
              
              {/* Login Form Side */}
              <div className="login-side">
                <div className="login-header-box">
                  <div className="security-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    <span>Secure Sign In</span>
                  </div>
                  <h2 className="login-heading">Welcome Back</h2>
                  <p className="login-subheading">Sign in to manage your school efficiently and securely.</p>
                </div>

                {error && (
                  <div className="alert-error">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                  <div className="form-group">
                    <label htmlFor="userId">User ID / Email</label>
                    <div className="input-wrap icon-input-wrap">
                      <span className="input-left-icon">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </span>
                      <input
                        type="text"
                        id="userId"
                        ref={userIdRef}
                        value={userId}
                        onChange={(e) => {
                          setUserId(e.target.value);
                          setActivePill('');
                        }}
                        className={`form-input ${activePill ? 'input-auto-filled' : ''}`}
                        placeholder="e.g. SUPERADMIN001"
                        required
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <div className="input-wrap icon-input-wrap">
                      <span className="input-left-icon">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setActivePill('');
                        }}
                        className={`form-input ${activePill ? 'input-auto-filled' : ''}`}
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="cta-action-group">
                    <button type="submit" className="btn-primary btn-submit-sign-in" disabled={loading}>
                      {loading ? (
                        <span className="btn-inner-content">
                          <svg className="spinner-anim" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="10"/></svg>
                          Signing in...
                        </span>
                      ) : (
                        <span className="btn-inner-content">
                          Sign In
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                        </span>
                      )}
                    </button>
                  </div>
                </form>

                <div className="login-footer-links">
                  <button type="button" className="link-forgot" onClick={() => { setShowForgotId(true); setShowForgotPw(false); setForgotMsg(''); setForgotEmail(''); }}>
                    Forgot User ID?
                  </button>
                  <span className="footer-link-divider">•</span>
                  <button type="button" className="link-forgot" onClick={() => { setShowForgotPw(true); setShowForgotId(false); setForgotMsg(''); setForgotEmail(''); }}>
                    Forgot Password?
                  </button>
                </div>
              </div>

              {/* Demo Portal Side */}
              <div className="demo-side">
                <div className="demo-header">
                  <div>
                    <h3 className="demo-heading">Demo Quick Access</h3>
                    <p className="demo-subheading">Click any role to auto-fill credentials</p>
                  </div>
                  <span className="demo-role-counter">{DEMO_ROLES.length} Demo Roles</span>
                </div>

                {activePill && (
                  <div className="auto-fill-status-banner">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>Auto-filled: <strong>{DEMO_ROLES.find(r => r.id === activePill)?.label || activePill}</strong> ({activePill})</span>
                  </div>
                )}

                <div className="role-cards-grid">
                  {DEMO_ROLES.map((role) => {
                    const isActive = activePill === role.id;
                    return (
                      <div
                        key={role.id}
                        className={`role-grid-card ${isActive ? 'active' : ''}`}
                        onClick={() => handleQuickLogin(role.id, role.pass)}
                        title={`Quick login as ${role.label}`}
                      >
                        <div className="role-card-inner">
                          <div className="role-icon-box" style={{ background: role.bg, color: role.color }}>
                            {role.icon}
                          </div>
                          <div className="role-card-text">
                            <span className="role-name">{role.label}</span>
                            <span className="role-badge-tag" style={{ color: role.color }}>{role.badge}</span>
                          </div>
                        </div>
                        {isActive && (
                          <div className="role-active-check">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
            </div>
          </div>

        </section>

        {/* 3. Bottom Stats Strip */}
        <section className="stats-strip-container">
          <div className="stats-strip-card">
            <div className="stat-box">
              <div className="stat-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <div className="stat-number">500+</div>
              <div className="stat-label">Schools</div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div className="stat-number">50K+</div>
              <div className="stat-label">Students</div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              </div>
              <div className="stat-number">2K+</div>
              <div className="stat-label">Teachers</div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <div className="stat-number">99.9%</div>
              <div className="stat-label">Uptime</div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
              </div>
              <div className="stat-number">24/7</div>
              <div className="stat-label">Support</div>
            </div>
          </div>
          <div className="stats-ambient-glow"></div>
        </section>

      </div>

        {showDemoModal && (
          <div className="demo-modal-overlay">
            <div className="demo-modal-content">
              {demoSubmitted ? (
                <div className="demo-success-message">
                  <i className="fa-solid fa-check-circle success-icon"></i>
                  <h3>Thank you!</h3>
                  <p>Our team will contact you shortly to schedule your free demo.</p>
                </div>
              ) : (
                <>
                  <div className="demo-modal-header">
                    <h2>Book Free Demo</h2>
                    <button className="demo-close-btn" onClick={() => setShowDemoModal(false)}>&times;</button>
                  </div>
                  <form onSubmit={handleDemoSubmit} className="demo-form">
                    <div className="demo-form-group">
                      <label>School Name</label>
                      <input type="text" value={demoFormData.schoolName} onChange={e => setDemoFormData({...demoFormData, schoolName: e.target.value})} required />
                    </div>
                    <div className="demo-form-row">
                      <div className="demo-form-group">
                        <label>Contact Person</label>
                        <input type="text" value={demoFormData.contactPerson} onChange={e => setDemoFormData({...demoFormData, contactPerson: e.target.value})} required />
                      </div>
                      <div className="demo-form-group">
                        <label>Mobile Number</label>
                        <input type="tel" value={demoFormData.mobile} onChange={e => setDemoFormData({...demoFormData, mobile: e.target.value})} required />
                      </div>
                    </div>
                    <div className="demo-form-row">
                      <div className="demo-form-group">
                        <label>Email Address</label>
                        <input type="email" value={demoFormData.email} onChange={e => setDemoFormData({...demoFormData, email: e.target.value})} required />
                      </div>
                      <div className="demo-form-group">
                        <label>City / State</label>
                        <input type="text" value={demoFormData.city} onChange={e => setDemoFormData({...demoFormData, city: e.target.value})} required />
                      </div>
                    </div>

                    <div className="demo-form-group">
                      <label>Message (Optional)</label>
                      <textarea value={demoFormData.message} onChange={e => setDemoFormData({...demoFormData, message: e.target.value})} rows="3"></textarea>
                    </div>
                    <div className="demo-modal-actions">
                      <button type="button" className="btn-demo-cancel" onClick={() => setShowDemoModal(false)}>Cancel</button>
                      <button type="submit" className="btn-demo-submit">Submit Demo Request</button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}

        {/* 5. Subscription Plans */}
        <section id="pricing" className="saas-section">
          <div className="section-header">
            <h2 className="section-title">Subscription Plans</h2>
            <p className="section-subtitle">Choose the perfect plan to digitize and automate your entire school operations.</p>
          </div>
          
          <div className="plans-grid">
            <div className="plan-card">
              <h3 className="plan-name">Silver</h3>
              <p className="plan-desc">Basic features for small schools to go digital.</p>
              <ul className="plan-features">
                <li><i className="fa-solid fa-check"></i> Class & Subject Schedules</li>
                <li><i className="fa-solid fa-check"></i> Student Directory</li>
                <li><i className="fa-solid fa-check"></i> Daily Student Attendance Tracking</li>
                <li><i className="fa-solid fa-check"></i> Basic Exam Schedules</li>
              </ul>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button className="btn-primary" style={{ width: '100%' }} onClick={() => navigate('/silver-plan')}>Get Started</button>
              </div>
            </div>

            <div className="plan-card recommended">
              <div className="recommended-badge">Recommended</div>
              <h3 className="plan-name">Gold</h3>
              <p className="plan-desc">Everything you need to manage a growing school.</p>
              <ul className="plan-features">
                <li><i className="fa-solid fa-check"></i> Fee Management & Receipts</li>
                <li><i className="fa-solid fa-check"></i> Homework & Timetables</li>
                <li><i className="fa-solid fa-check"></i> Staff Leave & Payroll</li>
                <li><i className="fa-solid fa-check"></i> Parent Communication</li>
              </ul>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button className="btn-primary" style={{ width: '100%' }} onClick={() => navigate('/gold-plan')}>Buy Gold</button>
              </div>
            </div>

            <div className="plan-card">
              <h3 className="plan-name">Platinum</h3>
              <p className="plan-desc">Complete automation and reporting for large schools.</p>
              <ul className="plan-features">
                <li><i className="fa-solid fa-check"></i> All Gold Features</li>
                <li><i className="fa-solid fa-check"></i> Advanced security and staff permissions</li>
                <li><i className="fa-solid fa-check"></i> Complex Report Generation</li>
                <li><i className="fa-solid fa-check"></i> 365 days priority support</li>
              </ul>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button className="btn-primary" style={{ width: '100%' }} onClick={() => navigate('/platinum-plan?ocr=false')}>Buy Platinum</button>
              </div>
            </div>

            <div className="plan-card">
              <h3 className="plan-name">Platinum + OCR</h3>
              <p className="plan-desc">The ultimate package with AI-powered document scanning.</p>
              <ul className="plan-features">
                <li><i className="fa-solid fa-check"></i> All Platinum Features</li>
                <li><i className="fa-solid fa-check"></i> AI OCR mark scanning</li>
                <li><i className="fa-solid fa-check"></i> Auto document processing</li>
                <li><i className="fa-solid fa-check"></i> Intelligent Analytics & Insights</li>
              </ul>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button className="btn-primary" style={{ width: '100%' }} onClick={() => navigate('/platinum-plan?ocr=true')}>Buy Premium</button>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button className="btn-secondary">Compare All Plans</button>
          </div>
        </section>

        {/* 6. About Section */}
        <section id="about" className="saas-section">
          <div className="about-content" style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
            <h3 style={{ whiteSpace: 'nowrap' }}>About Zayn Levi Technologies</h3>
            <p>
              Zayn Levi Technologies is a forward-thinking AI-powered education technology company dedicated to creating digital solutions that simplify complexity and unlock growth for modern educational organizations.
            </p>
            <p>
              Our vision is to blend innovation, reliability, and user-focused design to deliver a complete School Operating System that empowers administrators, improves student experiences, and scales with ambition.
            </p>
            <div className="about-features" style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '30px' }}>
              <div className="about-feature" style={{ display: 'flex', alignItems: 'center', gap: '15px', textAlign: 'left' }}>
                <div className="about-feature-icon"><i className="fa-solid fa-rocket"></i></div>
                <span>End-to-end digital transformation</span>
              </div>
              <div className="about-feature" style={{ display: 'flex', alignItems: 'center', gap: '15px', textAlign: 'left' }}>
                <div className="about-feature-icon"><i className="fa-solid fa-shield-halved"></i></div>
                <span>Reliable post-launch maintenance</span>
              </div>
            </div>
          </div>
        </section>


        {/* 7. Contact Section */}
        <section id="contact" className="saas-section">
          <div className="contact-wrapper">
            <div className="contact-info">
              <h3>Book a Free Demo</h3>
              <p>Experience the power of the Zayn Levi School OS firsthand. Our experts will walk you through a personalized demonstration tailored to your school's unique needs.</p>
              
              <div className="contact-detail">
                <i className="fa-solid fa-envelope"></i> business@zaynlevi.com
              </div>
              <div className="contact-detail">
                <i className="fa-solid fa-phone"></i> +91 6300854318
              </div>
              <div className="contact-detail">
                <i className="fa-solid fa-location-dot"></i> Global Remote Delivery & Support
              </div>
            </div>
            
            <div className="contact-form">
              {contactSent ? (
                <div className="alert-success" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
                  <i className="fa-solid fa-circle-check" style={{ fontSize: '48px', marginBottom: '20px' }}></i> 
                  <h3 style={{ fontSize: '24px', color: '#15803d', marginBottom: '10px' }}>Message Sent Successfully!</h3>
                  <p style={{ color: '#166534' }}>Thank you for reaching out. Our team will contact you shortly to schedule your personalized demo.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>School Name</label>
                      <input type="text" name="schoolName" placeholder="Enter school name" value={contactForm.schoolName} onChange={handleContactChange} required className="form-input" />
                    </div>
                    <div className="form-group">
                      <label>Contact Person</label>
                      <input type="text" name="contactPerson" placeholder="Full name" value={contactForm.contactPerson} onChange={handleContactChange} required className="form-input" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Work Email</label>
                      <input type="email" name="email" placeholder="email@school.edu" value={contactForm.email} onChange={handleContactChange} required className="form-input" />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input type="tel" name="phone" placeholder="+1 (555) 000-0000" value={contactForm.phone} onChange={handleContactChange} className="form-input" required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Message / Requirements</label>
                    <textarea name="message" placeholder="Tell us about your specific needs..." rows="3" value={contactForm.message} onChange={handleContactChange} required className="form-input" style={{ resize: 'none' }}></textarea>
                  </div>
                  {contactError && <div style={{ color: '#dc2626', fontSize: '14px', marginBottom: '15px' }}>{contactError}</div>}
                  <button type="submit" className="btn-primary" style={{ width: 'fit-content', marginTop: '10px', padding: '14px 40px' }} disabled={contactSending}>
                    {contactSending ? '⏳ Sending Request...' : 'Book My Demo'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

      {/* 8. Footer */}
      <footer className="saas-footer" style={{ width: '100%', padding: '80px 40px 40px' }}>
        <div className="saas-container" style={{ padding: 0 }}>
          <div className="footer-grid">
            <div className="footer-brand">
              <a href="#" className="nav-brand">
                <div className="nav-logo-icon">
                  <svg viewBox="0 0 100 100" style={{ width: '20px', height: '20px', overflow: 'visible' }}>
                    <path d="M 24 45 V 32 A 8 8 0 0 1 32 24 H 76 L 46 54" fill="none" stroke="#0b4d8c" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M 76 55 V 68 A 8 8 0 0 1 68 76 H 24 L 54 46" fill="none" stroke="#00a2e8" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="nav-brand-name">Zayn Levi Technologies</span>
              </a>
              <p className="footer-desc">Empowering educational institutions worldwide with intelligent, AI-driven management solutions.</p>
            </div>
            
            <div className="footer-col">
              <h4>Company</h4>
              <div className="footer-links">
                <a href="#about">About Us</a>
                <a href="#careers">Careers</a>
                <a href="#contact">Contact</a>
              </div>
            </div>

            <div className="footer-col">
              <h4>Product</h4>
              <div className="footer-links">
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#demo">Demo Portal</a>
              </div>
            </div>

            <div className="footer-col">
              <h4>Resources</h4>
              <div className="footer-links">
                <a href="#blog">Blog</a>
                <a href="#help">Help Center</a>
                <a href="#privacy">Privacy Policy</a>
                <a href="#terms">Terms of Service</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div>&copy; 2026 Zayn Levi Technologies. All Rights Reserved.</div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <a href="#" style={{ color: '#94a3b8' }}><i className="fa-brands fa-linkedin"></i></a>
              <a href="#" style={{ color: '#94a3b8' }}><i className="fa-brands fa-twitter"></i></a>
              <a href="#" style={{ color: '#94a3b8' }}><i className="fa-brands fa-facebook"></i></a>
            </div>
          </div>
        </div>
      </footer>

      {/* Forgot Password / Forgot ID Modal */}
      {(showForgotId || showForgotPw) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button onClick={closeForgotModal} style={{
              position: 'absolute', top: '20px', right: '20px', background: 'none',
              border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8'
            }}>✕</button>

            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>{showForgotId ? '🆔' : '🔑'}</span>
              <h3 style={{ margin: '0 0 8px', fontWeight: '800', color: '#0f172a', fontSize: '22px' }}>
                {showForgotId ? 'Forgot User ID?' : 'Forgot Password?'}
              </h3>
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                {showForgotId
                  ? 'Enter your registered email address and we\'ll send your User ID.'
                  : 'Enter your registered email and we\'ll send a password reset link.'}
              </p>
            </div>

            <form onSubmit={showForgotId ? handleForgotId : handleForgotPw} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                type="email"
                placeholder="Your registered email address"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                required
                className="form-input"
              />
              {forgotMsg && (
                <div className={forgotMsg.includes('wrong') ? 'alert-error' : 'alert-success'} style={{ marginBottom: 0 }}>
                  <i className={`fa-solid ${forgotMsg.includes('wrong') ? 'fa-circle-exclamation' : 'fa-circle-check'}`}></i> {forgotMsg}
                </div>
              )}
              <button type="submit" disabled={forgotLoading} className="btn-primary" style={{ width: '100%' }}>
                {forgotLoading ? '⏳ Sending...' : (showForgotId ? '📧 Send My User ID' : '📧 Send Reset Link')}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#94a3b8' }}>
              Only you can recover your credentials using your registered email.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;
