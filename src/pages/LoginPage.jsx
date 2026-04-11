import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { loginUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.email) setEmail(location.state.email);
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      loginUser({ name: data.name, email: data.email, role: data.role }, data.token);
      addToast('Welcome back!', 'success');
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        setError('Server is taking too long to respond. Please check if your database/backend is running.');
      } else if (!err.response) {
        setError('Network Error: Cannot connect to backend server on port 8080.');
      } else {
        setError(err.response?.data?.message || 'Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Left: Form Side */}
      <div style={styles.formSide}>
        <div style={styles.formWrapper}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>⚡</span>
            TaskFlow<span style={{ color: 'var(--accent-purple)' }}>.ai</span>
          </div>

          <h1 style={styles.title}>Welcome back</h1>
          <p style={styles.subtitle}>Please enter your details to sign in.</p>

          {error && <div className="auth-error" style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
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

            <div style={styles.inputGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label style={styles.label}>Password</label>
                <a href="#" style={styles.forgotLink}>Forgot password?</a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              style={{...styles.submitBtn, opacity: loading ? 0.7 : 1}}
              disabled={loading}
            >
              {loading ? <span className="spinner" style={styles.spinnerSm}></span> : 'Sign In'}
            </button>
          </form>

          <p style={styles.switchText}>
            Don't have an account? <Link to="/register" style={styles.switchLink}>Sign up for free</Link>
          </p>
        </div>
      </div>

      {/* Right: Visual Side */}
      <div style={styles.visualSide}>
        <div style={styles.visualOverlay}></div>
        <div style={styles.visualContent}>
          <h2 style={styles.visualTitle}>Supercharge your productivity with AI.</h2>
          <p style={styles.visualSubtitle}>
            Join thousands of professionals using TaskFlow to intelligently manage their daily workflows with AI-powered insights.
          </p>
          
          <div style={styles.testimonialContainer}>
             <div style={styles.testimonialStars}>★★★★★</div>
             <p style={styles.testimonialText}>"This platform completely changed how our engineering team tracks sprint tasks. The AI auto-tagging is pure magic."</p>
             <div style={styles.testimonialAuthor}>— Senior Engineer at TechCorp</div>
          </div>
        </div>
        {/* Dynamic mesh gradient background effect */}
        <div style={styles.meshGlow1}></div>
        <div style={styles.meshGlow2}></div>
      </div>
    </div>
  );
}

// Inline styles for ultra-clean SAAS look
const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#000000', // Deep pure black
    color: '#ffffff',
    fontFamily: '"Inter", sans-serif',
  },
  formSide: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '40px',
    maxWidth: '600px',
    width: '100%',
    margin: '0 auto',
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
    marginBottom: '60px',
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
    marginBottom: '40px',
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
  forgotLink: {
    fontSize: '13px',
    color: '#888',
    textDecoration: 'none',
    transition: 'color 0.2s',
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
    borderLeft: '1px solid #1a1a1a',
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
  visualTitle: {
    fontSize: '44px',
    fontWeight: '800',
    letterSpacing: '-1.5px',
    lineHeight: '1.1',
    marginBottom: '20px',
    background: 'linear-gradient(to right, #fff, #888)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  visualSubtitle: {
    fontSize: '18px',
    color: '#888',
    lineHeight: '1.6',
    marginBottom: '60px',
  },
  testimonialContainer: {
    padding: '24px',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.05)',
    backdropFilter: 'blur(10px)',
  },
  testimonialStars: {
    color: '#7c3aed',
    fontSize: '18px',
    marginBottom: '12px',
  },
  testimonialText: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#ccc',
    fontStyle: 'italic',
    marginBottom: '16px',
  },
  testimonialAuthor: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#888',
  },
  meshGlow1: {
    position: 'absolute',
    top: '-20%',
    left: '-10%',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, rgba(0,0,0,0) 70%)',
    filter: 'blur(80px)',
    zIndex: 1,
    animation: 'orb1 20s ease infinite',
  },
  meshGlow2: {
    position: 'absolute',
    bottom: '-10%',
    right: '-20%',
    width: '700px',
    height: '700px',
    background: 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, rgba(0,0,0,0) 70%)',
    filter: 'blur(90px)',
    zIndex: 1,
    animation: 'orb2 25s ease infinite',
  }
};

// Simple media query via injected scope or handled via external CSS typically, 
// but since we are doing inline, I'll ensure visual side displays block on large screens.
// For true responsive, I will output a small style block.
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
  const styleEl = document.getElementById('login-styles') || document.createElement('style');
  styleEl.id = 'login-styles';
  styleEl.innerHTML = responsiveCSS;
  document.head.appendChild(styleEl);
}
