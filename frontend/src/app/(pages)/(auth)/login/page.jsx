'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function LoginPage() {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');
  const [emailError, setEmailError]     = useState('');
  const [passwordError, setPasswordError] = useState('');
  const router = useRouter();

  const validateEmail    = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const validatePassword = (v) => v.length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setEmailError(''); setPasswordError('');

    let hasError = false;
    if (!validateEmail(email))       { setEmailError('Please enter a valid email address'); hasError = true; }
    if (!validatePassword(password)) { setPasswordError('Password must be at least 6 characters'); hasError = true; }
    if (hasError) return;

    setIsLoading(true);
    try {
     const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
    { email, password },
    { withCredentials: true, timeout: 10000 }
);

      const token = response.data?.token;
      if (token) localStorage.setItem('authToken', token);
      if (response.data?.user) localStorage.setItem('user', JSON.stringify(response.data.user));

      setSuccess('Login successful! Redirecting...');
      const next = new URLSearchParams(window.location.search).get('next');
      const safeNext = next && next.startsWith('/') && !next.startsWith('//') && !next.includes('\\') ? next : null;
      setTimeout(() => router.push(safeNext || (response.data?.user?.isadmin ? '/dashboard' : '/care?view=bookings')), 800);

    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || 'Invalid email or password');
      } else if (err.request) {
        setError('Cannot connect to the server. Please check your connection and try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --ink:      #0d0f14;
          --ink-2:    #161920;
          --ink-3:    #1e2230;
          --border:   rgba(255,255,255,0.07);
          --gold:     #4f8ef7;
          --gold-lt:  #7db0ff;
          --gold-dim: rgba(79,142,247,0.15);
          --text:     #e8e6e1;
          --muted:    #7a7d8a;
          --danger:   #e05c5c;
          --success:  #4cad7a;
          --radius:   16px;
        }

        html, body { height: 100%; }

        .lp-root {
          min-height: 100vh;
          background: var(--ink);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          padding: 24px 16px;
          position: relative;
          overflow: hidden;
        }

        /* ── Ambient background ── */
        .lp-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 15% 20%, rgba(79,142,247,0.10) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 85% 75%, rgba(99,60,220,0.08) 0%, transparent 55%),
            radial-gradient(ellipse 40% 40% at 50% 50%, rgba(79,142,247,0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Fine grid overlay */
        .lp-root::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        /* ── Floating orbs ── */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          animation: drift 12s ease-in-out infinite;
        }
        .orb-1 { width: 380px; height: 380px; top: -80px;  left: -100px; background: rgba(79,142,247,0.14); animation-duration: 14s; }
        .orb-2 { width: 300px; height: 300px; bottom: -60px; right: -80px; background: rgba(99,60,220,0.12); animation-duration: 18s; animation-delay: -6s; }
        .orb-3 { width: 200px; height: 200px; top: 40%;  right: 15%;  background: rgba(79,142,247,0.08); animation-duration: 10s; animation-delay: -3s; }

        @keyframes drift {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(20px,-30px) scale(1.05); }
          66%      { transform: translate(-15px,15px) scale(0.97); }
        }

        /* ── Wrapper ── */
        .lp-wrap {
          width: 100%;
          max-width: 460px;
          position: relative;
          z-index: 10;
          animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Brand header ── */
        .lp-brand {
          text-align: center;
          margin-bottom: 36px;
          animation: fadeUp 0.7s 0.1s cubic-bezier(0.22,1,0.36,1) both;
        }

        .lp-logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          border-radius: 18px;
          background: linear-gradient(135deg, #4f8ef7 0%, #2563eb 100%);
          box-shadow: 0 0 0 1px rgba(79,142,247,0.3), 0 8px 32px rgba(79,142,247,0.25);
          margin-bottom: 20px;
        }

        .lp-logo svg { width: 28px; height: 28px; color: #fff; }

        .lp-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 6vw, 2.75rem);
          font-weight: 300;
          letter-spacing: 0.04em;
          color: var(--text);
          line-height: 1;
          margin-bottom: 8px;
        }

        .lp-title span {
          background: linear-gradient(90deg, var(--gold) 0%, var(--gold-lt) 50%, var(--gold) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .lp-subtitle {
          font-size: 0.78rem;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--muted);
        }

        /* ── Divider rule ── */
        .lp-rule {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0 0 28px;
        }
        .lp-rule::before, .lp-rule::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent);
        }
        .lp-rule-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--gold); opacity: 0.6; }

        /* ── Card ── */
        .lp-card {
          background: rgba(22,25,32,0.85);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: clamp(28px, 5vw, 44px);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.03) inset,
            0 2px 0 rgba(255,255,255,0.06) inset,
            0 32px 64px rgba(0,0,0,0.5),
            0 8px 24px rgba(0,0,0,0.3);
          animation: fadeUp 0.7s 0.15s cubic-bezier(0.22,1,0.36,1) both;
        }

        /* ── Alert banners ── */
        .lp-alert {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 0.82rem;
          line-height: 1.5;
          margin-bottom: 22px;
          animation: fadeUp 0.3s ease both;
        }
        .lp-alert svg { width: 16px; height: 16px; flex-shrink: 0; margin-top: 1px; }
        .lp-alert-error   { background: rgba(224,92,92,0.1);  border: 1px solid rgba(224,92,92,0.25);  color: #f07070; }
        .lp-alert-success { background: rgba(76,173,122,0.1); border: 1px solid rgba(76,173,122,0.25); color: #5ccf91; }

        /* ── Form fields ── */
        .lp-field { margin-bottom: 20px; }
        .lp-field:last-of-type { margin-bottom: 28px; }

        .lp-label {
          display: block;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 8px;
        }

        .lp-input-wrap { position: relative; }

        .lp-input-icon {
          position: absolute;
          top: 50%;
          left: 14px;
          transform: translateY(-50%);
          pointer-events: none;
          color: var(--muted);
          transition: color 0.2s;
        }
        .lp-input-icon svg { width: 16px; height: 16px; display: block; }

        .lp-input {
          width: 100%;
          padding: 13px 44px 13px 42px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .lp-input::placeholder { color: rgba(255,255,255,0.2); }

        .lp-input:focus {
          border-color: rgba(201,168,76,0.5);
          background: rgba(201,168,76,0.04);
          box-shadow: 0 0 0 3px rgba(201,168,76,0.08);
        }
        .lp-input:focus + .lp-input-icon,
        .lp-input-wrap:focus-within .lp-input-icon { color: var(--gold); }

        .lp-input.error {
          border-color: rgba(224,92,92,0.5);
          box-shadow: 0 0 0 3px rgba(224,92,92,0.08);
        }

        .lp-eye {
          position: absolute;
          top: 50%;
          right: 14px;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--muted);
          padding: 4px;
          transition: color 0.2s;
          display: flex;
          align-items: center;
        }
        .lp-eye:hover { color: var(--gold); }
        .lp-eye svg { width: 16px; height: 16px; }

        .lp-field-err {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 6px;
          font-size: 0.75rem;
          color: var(--danger);
        }
        .lp-field-err svg { width: 12px; height: 12px; flex-shrink: 0; }

        /* ── Submit button ── */
        .lp-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px 24px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #0d0f14;
          background: linear-gradient(135deg, var(--gold-lt) 0%, var(--gold) 50%, #a8782a 100%);
          background-size: 200% 100%;
          background-position: 0% 0%;
          box-shadow: 0 4px 24px rgba(201,168,76,0.3), 0 1px 0 rgba(255,255,255,0.2) inset;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s, background-position 0.4s;
          position: relative;
          overflow: hidden;
        }

        .lp-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%);
          transform: translateX(-100%);
          transition: transform 0.5s;
        }

        .lp-btn:hover:not(:disabled)::before { transform: translateX(100%); }
        .lp-btn:hover:not(:disabled) {
          box-shadow: 0 6px 32px rgba(201,168,76,0.45), 0 1px 0 rgba(255,255,255,0.2) inset;
          transform: translateY(-1px);
          background-position: 100% 0%;
        }
        .lp-btn:active:not(:disabled) { transform: translateY(0); }

        .lp-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .lp-btn svg { width: 16px; height: 16px; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .lp-spinner { animation: spin 0.8s linear infinite; }

        /* ── Footer ── */
        .lp-footer {
          margin-top: 20px;
          text-align: center;
          font-size: 0.72rem;
          letter-spacing: 0.06em;
          color: rgba(122,125,138,0.6);
        }

        /* ── Responsive ── */
        @media (max-width: 480px) {
          .lp-card { padding: 24px 20px; }
          .lp-logo { width: 52px; height: 52px; border-radius: 14px; }
        }
      `}</style>

      <div className="lp-root">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div className="lp-wrap">
          {/* Brand */}
          <div className="lp-brand">
            <div className="lp-logo">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="lp-title"><span>Welcome Back</span></h1>
            <p className="lp-subtitle">Muft Madad &nbsp;·&nbsp; Admin Portal</p>
          </div>

          {/* Card */}
          <div className="lp-card">
            <div className="lp-rule"><div className="lp-rule-dot" /></div>

            <form onSubmit={handleSubmit}>
              {/* Alerts */}
              {success && (
                <div className="lp-alert lp-alert-success">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {success}
                </div>
              )}
              {error && (
                <div className="lp-alert lp-alert-error">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="lp-field">
                <label className="lp-label">Email Address</label>
                <div className="lp-input-wrap">
                  <span className="lp-input-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => { setEmail(e.target.value); setEmailError(''); setError(''); }}
                    onBlur={() => setEmailError(email && !validateEmail(email) ? 'Please enter a valid email address' : '')}
                    placeholder="admin@example.com"
                    className={`lp-input${emailError ? ' error' : ''}`}
                  />
                </div>
                {emailError && (
                  <div className="lp-field-err">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {emailError}
                  </div>
                )}
              </div>

              {/* Password */}
              <div className="lp-field">
                <label className="lp-label">Password</label>
                <div className="lp-input-wrap">
                  <span className="lp-input-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => { setPassword(e.target.value); setPasswordError(''); setError(''); }}
                    onBlur={() => setPasswordError(password && !validatePassword(password) ? 'Password must be at least 6 characters' : '')}
                    placeholder="Enter your password"
                    className={`lp-input${passwordError ? ' error' : ''}`}
                  />
                  <button type="button" className="lp-eye" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordError && (
                  <div className="lp-field-err">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {passwordError}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button type="submit" disabled={isLoading} className="lp-btn">
                {isLoading ? (
                  <>
                    <svg className="lp-spinner" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="lp-footer">Only authorized admins can access the dashboard.</p>
        </div>
      </div>
    </>
  );
}