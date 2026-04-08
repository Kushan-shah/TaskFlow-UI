import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTaskById, triggerAiAnalysis, updateTask, uploadFile } from '../api/tasks';
import { useToast } from '../context/ToastContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const priorityBadge = (p) => {
  const map = { HIGH: 'badge-high', MEDIUM: 'badge-medium', LOW: 'badge-low' };
  return <span className={`badge ${map[p] || 'badge-medium'}`}>{p || 'MEDIUM'}</span>;
};

function AiShimmer() {
  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <span style={{ fontSize: 20 }}>🤖</span>
        <span className="ai-panel-title">AI Insights</span>
        <span className="badge badge-ai-pending">⏳ Analyzing...</span>
      </div>
      <div className="skeleton skeleton-line w-full" style={{ height: 16 }}></div>
      <div className="skeleton skeleton-line w-three-quarter" style={{ height: 16 }}></div>
      <div className="skeleton skeleton-line w-half" style={{ height: 16 }}></div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <div className="skeleton" style={{ width: 60, height: 24, borderRadius: 100 }}></div>
        <div className="skeleton" style={{ width: 70, height: 24, borderRadius: 100 }}></div>
        <div className="skeleton" style={{ width: 50, height: 24, borderRadius: 100 }}></div>
      </div>
    </div>
  );
}

function AiInsightsPanel({ task, onRetry, retrying }) {
  if (!task.aiStatus || task.aiStatus === 'PENDING') return <AiShimmer />;

  if (task.aiStatus === 'FAILED') {
    return (
      <div className="ai-panel" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
        <div className="ai-panel-header">
          <span style={{ fontSize: 20 }}>🤖</span>
          <span className="ai-panel-title">AI Insights</span>
          <span className="badge badge-ai-failed">⚠️ Failed</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.6 }}>
          AI analysis failed. This could be due to a temporary API issue or rate limiting.
        </p>
        <button className="btn btn-sm btn-primary" onClick={onRetry} disabled={retrying}>
          {retrying ? <><span className="spinner"></span> Retrying...</> : '🔄 Retry Analysis'}
        </button>
      </div>
    );
  }

  const tags = task.aiTags ? task.aiTags.split(',').filter(Boolean) : [];

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <span style={{ fontSize: 20 }}>🤖</span>
        <span className="ai-panel-title">AI Insights</span>
        <span className="badge badge-ai-done">✨ AI Analyzed</span>
      </div>

      {task.aiSummary && <div className="ai-summary">{task.aiSummary}</div>}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>AI Priority:</span>
        {priorityBadge(task.aiPriority)}
      </div>

      {tags.length > 0 && (
        <div>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 8 }}>Auto Tags:</span>
          <div className="ai-tags">
            {tags.map((tag) => <span className="ai-tag" key={tag}>{tag.trim()}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchTask = async () => {
    try {
      const res = await getTaskById(id);
      setTask(res.data);
    } catch { addToast('Task not found', 'error'); navigate('/tasks'); }
    finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchTask();
    const interval = setInterval(async () => {
      try {
        const res = await getTaskById(id);
        setTask(res.data);
        if (res.data.aiStatus !== 'PENDING') clearInterval(interval);
      } catch { clearInterval(interval); }
    }, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await triggerAiAnalysis(id);
      addToast('AI analysis triggered!', 'info');
      setTask(t => ({ ...t, aiStatus: 'PENDING' }));
      const poll = setInterval(async () => {
        const res = await getTaskById(id);
        setTask(res.data);
        if (res.data.aiStatus !== 'PENDING') clearInterval(poll);
      }, 3000);
      setTimeout(() => clearInterval(poll), 30000);
    } catch { addToast('Failed to trigger analysis', 'error'); }
    finally { setRetrying(false); }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateTask(id, { title: task.title, status: newStatus });
      setTask(t => ({ ...t, status: newStatus }));
      addToast(`Status → ${newStatus.replace('_', ' ')}`, 'success');
    } catch { addToast('Failed to update status', 'error'); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadFile(id, file);
      setTask(t => ({ ...t, fileUrl: res.data.fileUrl || res.data }));
      addToast('File uploaded!', 'success');
    } catch { addToast('Upload failed', 'error'); }
    finally { setUploading(false); }
  };

  if (loading) return <div className="loading-full"><span className="spinner"></span> Loading task...</div>;
  if (!task) return null;

  const statusBtns = [
    { val: 'TODO', label: 'Todo', cls: 'active-todo' },
    { val: 'IN_PROGRESS', label: 'In Progress', cls: 'active-progress' },
    { val: 'DONE', label: 'Done', cls: 'active-done' },
  ];

  // Resolve file URL: if relative path, prepend API base URL; if absolute (S3), use as-is
  const resolveFileUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${API_BASE}${url}`;
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 20 }}>
        <button className="btn btn-sm btn-secondary" onClick={() => navigate('/tasks')}>← Back to Tasks</button>
      </div>

      {/* Task Info Card */}
      <div className="card" style={{ marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, width: 4, height: '100%',
          background: task.priority === 'HIGH' ? 'var(--accent-red)' : task.priority === 'MEDIUM' ? 'var(--accent-yellow)' : 'var(--accent-green)',
          borderRadius: '10px 0 0 10px',
        }} />

        <div style={{ paddingLeft: 16 }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.5px', flex: 1 }}>{task.title}</h2>
            <div className="flex gap-2 items-center">
              {task.status !== 'DONE' ? (
                <button 
                  className="btn btn-primary btn-sm" 
                  onClick={() => handleStatusChange('DONE')}
                  style={{ background: 'var(--accent-green)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}
                >
                  <span style={{ fontSize: 16 }}>✓</span> Mark Complete
                </button>
              ) : (
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => handleStatusChange('IN_PROGRESS')}
                  style={{ color: 'var(--accent-green)', borderColor: 'rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.1)' }}
                  title="Click to reopen task"
                >
                  ✅ Completed
                </button>
              )}
            </div>
          </div>

          {task.description && (
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.8, marginBottom: 20 }}>
              {task.description}
            </p>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 20 }}>
            <div>
              <div className="text-xs text-muted" style={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.8px' }}>Due Date</div>
              <div className="text-sm" style={{ marginTop: 5, fontWeight: 500 }}>{task.dueDate || 'Not set'}</div>
            </div>
            <div>
              <div className="text-xs text-muted" style={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.8px' }}>Created</div>
              <div className="text-sm" style={{ marginTop: 5, fontWeight: 500 }}>
                {task.createdAt ? new Date(task.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
              </div>
            </div>
            {task.fileUrl && (
              <div>
                <div className="text-xs text-muted" style={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.8px' }}>Attachment</div>
                <a href={resolveFileUrl(task.fileUrl)} target="_blank" rel="noopener" style={{ color: 'var(--accent-cyan)', display: 'block', marginTop: 5, fontWeight: 500, fontSize: 13 }}>📎 View File</a>
              </div>
            )}
          </div>

          {/* Quick Status Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Status:</span>
            <div className="status-btn-group">
              {statusBtns.map(s => (
                <button key={s.val} className={`status-btn ${task.status === s.val ? s.cls : ''}`}
                  onClick={() => handleStatusChange(s.val)}>{s.label}</button>
              ))}
            </div>
          </div>

          {/* File Upload */}
          {!task.fileUrl && (
            <div style={{ marginTop: 14 }}>
              <label className="btn btn-xs btn-secondary" style={{ cursor: 'pointer' }}>
                {uploading ? <><span className="spinner"></span> Uploading...</> : '📎 Attach File'}
                <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} disabled={uploading} />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* AI Insights Panel */}
      <AiInsightsPanel task={task} onRetry={handleRetry} retrying={retrying} />
    </div>
  );
}
