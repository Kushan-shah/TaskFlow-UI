import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard, getTasks } from '../api/tasks';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#7c3aed', '#f59e0b', '#10b981', '#ef4444'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'rgba(10,14,33,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 16px', fontSize: 13, boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
        <p style={{ color: '#f1f5f9' }}>{payload[0].name}: <strong>{payload[0].value}</strong></p>
      </div>
    );
  }
  return null;
};

function CompletionRing({ percentage }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="completion-ring">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r={radius} className="completion-ring-bg" />
        <circle cx="50" cy="50" r={radius} className="completion-ring-fill"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ animation: 'ring-fill 1.2s ease forwards' }} />
      </svg>
      <div className="completion-ring-text">{Math.round(percentage)}%</div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      getDashboard(),
      getTasks({ page: 0, size: 5, sortBy: 'createdAt', sortDir: 'desc' }),
    ])
      .then(([d, t]) => { setStats(d.data); setRecentTasks(t.data.content || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-full"><span className="spinner"></span>Loading dashboard...</div>;

  const total = stats?.totalTasks || 0;
  const completionRate = stats?.completionRate || 0;
  const aiCount = stats?.aiAnalyzedCount || 0;

  const statCards = [
    { icon: '📋', label: 'Total Tasks', value: total },
    { icon: '🔵', label: 'Todo', value: stats?.todoCount || 0 },
    { icon: '🟡', label: 'In Progress', value: stats?.inProgressCount || 0 },
    { icon: '✅', label: 'Completed', value: stats?.doneCount || 0 },
    { icon: '🔴', label: 'Overdue', value: stats?.overdueCount || 0 },
    { icon: '🤖', label: 'AI Analyzed', value: aiCount },
  ];

  const pieData = [
    { name: 'Todo', value: stats?.todoCount || 0 },
    { name: 'In Progress', value: stats?.inProgressCount || 0 },
    { name: 'Done', value: stats?.doneCount || 0 },
  ];

  const barData = [
    { name: 'Todo', count: stats?.todoCount || 0, fill: '#7c3aed' },
    { name: 'In Progress', count: stats?.inProgressCount || 0, fill: '#f59e0b' },
    { name: 'Done', count: stats?.doneCount || 0, fill: '#10b981' },
    { name: 'Overdue', count: stats?.overdueCount || 0, fill: '#ef4444' },
  ];

  const statusIcon = (s) => ({ TODO: '🔵', IN_PROGRESS: '🟡', DONE: '✅' }[s] || '⚪');
  const aiBadge = (s) => {
    if (s === 'DONE') return <span className="badge badge-ai-done" style={{ fontSize: 10, padding: '2px 8px' }}>✨ AI</span>;
    if (s === 'PENDING') return <span className="badge badge-ai-pending" style={{ fontSize: 10, padding: '2px 8px' }}>⏳</span>;
    return null;
  };

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Your task intelligence overview at a glance</p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {statCards.map((s) => (
          <div className="stat-card" key={s.label}>
            <span className="stat-icon">{s.icon}</span>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        <div className="card">
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 20 }}>
            Completion Rate
          </h3>
          <div className="completion-ring-wrapper">
            <CompletionRing percentage={completionRate} />
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
                {stats?.doneCount || 0} of {total} tasks done
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16 }}>
            {pieData.map((d, i) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i], display: 'inline-block' }}></span>
                {d.name}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 20 }}>
            Task Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {barData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      {recentTasks.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Recent Activity
            </h3>
            <button className="btn btn-xs btn-secondary" onClick={() => navigate('/tasks')}>View All →</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {recentTasks.map((task, idx) => (
              <div key={task.id}
                onClick={() => navigate(`/tasks/${task.id}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 14px', borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)',
                  cursor: 'pointer', transition: 'var(--transition)',
                  animation: `fadeInUp 0.3s ease ${idx * 0.05}s backwards`,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.04)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.015)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.03)'; }}
              >
                <span style={{ fontSize: 16 }}>{statusIcon(task.status)}</span>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{task.priority} · {task.dueDate || 'No deadline'}</div>
                </div>
                {aiBadge(task.aiStatus)}
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>→</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Banner */}
      <div className="ai-banner">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <span style={{ fontSize: 32, flexShrink: 0 }}>🤖</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>AI-Powered Analysis</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.7 }}>
              Every task is automatically analyzed using <strong style={{ color: 'var(--accent-cyan)' }}>AI</strong> for
              intelligent summarization, priority prediction, and tag extraction. Processing is fully asynchronous with zero latency impact.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
