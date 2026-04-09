import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';

function calculateStrength(password) {
  let score = 0;
  if (!password) return score;
  if (password.length > 5) score += 1;
  if (password.length > 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score; // Max 5
}

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { loginUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const strength = calculateStrength(password);
  let strengthColor = '#333';
  let strengthText = 'Too short';
  if (strength >= 2 && strength <= 3) { strengthColor = '#f59e0b'; strengthText = 'Fair'; }
  if (strength >= 4) { strengthColor = '#10b981'; strengthText = 'Strong'; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (strength < 2) throw new Error("Please use a stronger password");
      const { data } = await api.post('/api/auth/register', { name, email, password });
      loginUser({ name: data.name, email: data.email, role: data.role }, data.token);
      addToast('Account created successfully!', 'success');
      navigate('/dashboard', { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Left: Visual Side (Reversed for Register) */}
      <div style={styles.visualSide}>
        <div style={styles.visualOverlay}></div>
        <div style={styles.visualContent}>
          <div style={styles.badge}>Join the waitlist</div>
          <h2 style={styles.visualTitle}>Build something incredible.</h2>
          <p style={styles.visualSubtitle}>
            Our AI analyzes your task descriptions instantly to predict priorities and group similar workflows, cutting management time in half.
          </p>
          
          <div style={styles.statsGrid}>
             <div style={styles.statBox}>
                <div style={styles.statNum}>10x</div>
                <div style={styles.statLabel}>Faster Planning</div>
             </div>
             <div style={styles.statBox}>
                <div style={styles.statNum}>Zero</div>
                <div style={styles.statLabel}>Latency Overhead</div>
             </div>
          </div>
        </div>
        <div style={styles.meshGlow1}></div>
        <div style={styles.meshGlow2}></div>
      </div>

      {/* Right: Form Side */}
      <div style={styles.formSide}>
        <div style={styles.formWrapper}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>⚡</span>
            TaskFlow<span style={{ color: 'var(--accent-purple)' }}>.ai</span>
          </div>

          <h1 style={styles.title}>Create your account</h1>
          <p style={styles.subtitle}>Get started with a free forever plan.</p>

          {error && <div className="auth-error" style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={styles.input}
                placeholder="John Doe"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
                placeholder="name@taskflow.ai"
              />
            </div>

            <div style={{...styles.inputGroup, marginBottom: password ? '0px' : '0px'}}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
                placeholder="••••••••"
              />
            </div>

            {/* Premium Minimal Password Meter */}
            {password.length > 0 && (
              <div style={styles.meterContainer}>
                <div style={styles.meterBars}>
                  {[1, 2, 3, 4, 5].map(level => (
                    <div 
                      key={level} 
                      style={{ 
                        ...styles.meterBar,
                        background: strength >= level ? strengthColor : '#222',
                      }} 
                    />
                  ))}
                </div>
                <div style={{ ...styles.meterText, color: strengthColor }}>
                  {strengthText}
                </div>
              </div>
            )}

            <button
              type="submit"
              style={{...styles.submitBtn, opacity: loading || (password.length > 0 && strength < 2) ? 0.7 : 1}}
              disabled={loading || (password.length > 0 && strength < 2)}
            >
              {loading ? <span className="spinner" style={styles.spinnerSm}></span> : 'Create Account'}
            </button>
          </form>

          <p style={styles.switchText}>
            Already have an account? <Link to="/login" style={styles.switchLink}>Sign in to TaskFlow</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Inline styles for ultra-clean SAAS look
const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#000000',
    color: '#ffffff',
    fontFamily: '"Inter", sans-serif',
  },
  formSide: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '40px',
    maxWidth: '650px',
    width: '100%',
    position: 'relative',
    animation: 'fadeIn 0.6s ease-out',
  },
  formWrapper: {
    width: '100%',
    maxWidth: '380px',
    margin: '0 auto',
  },
  logo: {
    fontSize: '20px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    marginBottom: '50px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logoIcon: {
    fontSize: '24px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    letterSpacing: '-1px',
    marginBottom: '8px',
  },
  subtitle: {
    color: '#888',
    fontSize: '15px',
    marginBottom: '36px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#eaeaea',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#111',
    border: '1px solid #333',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '15px',
    transition: 'all 0.2s ease',
    outline: 'none',
  },
  meterContainer: {
    animation: 'fadeIn 0.3s ease',
  },
  meterBars: {
    display: 'flex',
    gap: '4px',
    height: '4px',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  meterBar: {
    flex: 1,
    transition: 'background 0.3s ease',
  },
  meterText: {
    fontSize: '11px',
    marginTop: '6px',
    fontWeight: '600',
    textAlign: 'right',
  },
  submitBtn: {
    marginTop: '10px',
    width: '100%',
    padding: '14px',
    backgroundColor: '#ffffff',
    color: '#000000',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.1s, opacity 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchText: {
    marginTop: '30px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#888',
  },
  switchLink: {
    color: '#fff',
    fontWeight: '500',
    textDecoration: 'none',
  },
  errorBox: {
    padding: '12px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderLeft: '3px solid #ef4444',
    color: '#ef4444',
    fontSize: '14px',
    marginBottom: '20px',
    borderRadius: '4px',
  },
  spinnerSm: {
    width: '18px',
    height: '18px',
    borderWidth: '2px',
    borderColor: 'rgba(0,0,0,0.2)',
    borderTopColor: '#000',
  },
  visualSide: {
    flex: '1.2',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#050510',
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
    borderRight: '1px solid #1a1a1a',
  },
  visualOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(circle at center, transparent 0%, #050510 100%)',
    zIndex: 2,
  },
  visualContent: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '500px',
  },
  badge: {
    display: 'inline-block',
    padding: '6px 12px',
    backgroundColor: 'rgba(124,58,237,0.1)',
    color: '#a78bfa',
    borderRadius: '100px',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    marginBottom: '24px',
    border: '1px solid rgba(124,58,237,0.2)'
  },
  visualTitle: {
    fontSize: '44px',
    fontWeight: '800',
    letterSpacing: '-1.5px',
    lineHeight: '1.1',
    marginBottom: '20px',
    background: 'linear-gradient(to bottom right, #fff, #666)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  visualSubtitle: {
    fontSize: '18px',
    color: '#888',
    lineHeight: '1.6',
    marginBottom: '40px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  statBox: {
    padding: '24px',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.05)',
    backdropFilter: 'blur(10px)',
  },
  statNum: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#fff',
    marginBottom: '4px',
    letterSpacing: '-1px',
  },
  statLabel: {
    fontSize: '13px',
    color: '#888',
    fontWeight: '500',
  },
  meshGlow1: {
    position: 'absolute',
    top: '-10%',
    right: '-20%',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, rgba(0,0,0,0) 70%)',
    filter: 'blur(80px)',
    zIndex: 1,
    animation: 'orb1 24s ease infinite',
  },
  meshGlow2: {
    position: 'absolute',
    bottom: '-20%',
    left: '-10%',
    width: '700px',
    height: '700px',
    background: 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, rgba(0,0,0,0) 70%)',
    filter: 'blur(90px)',
    zIndex: 1,
    animation: 'orb2 20s ease infinite',
  }
};

const responsiveCSS = `
  @media (min-width: 900px) {
    div[style*="background-color: #050510"] {
      display: flex !important;
    }
  }
  input:focus {
    border-color: #555 !important;
    background-color: #1a1a1a !important;
  }
  button:hover {
    transform: translateY(-1px) !important;
    opacity: 0.9 !important;
  }
  a:hover {
    color: #fff !important;
  }
`;

if (typeof document !== 'undefined') {
  const styleEl = document.getElementById('reg-styles') || document.createElement('style');
  styleEl.id = 'reg-styles';
  styleEl.innerHTML = responsiveCSS;
  document.head.appendChild(styleEl);
}
