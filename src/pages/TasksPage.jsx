import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasks, deleteTask, searchTasks, updateTask } from '../api/tasks';
import { useToast } from '../context/ToastContext';
import TaskFormModal from '../components/TaskFormModal';

const statusBadge = (s) => {
  const map = { TODO: 'badge-todo', IN_PROGRESS: 'badge-inprogress', DONE: 'badge-done' };
  const labels = { TODO: 'Todo', IN_PROGRESS: 'In Progress', DONE: 'Done' };
  return <span className={`badge ${map[s] || 'badge-todo'}`}>{labels[s] || s}</span>;
};

const priorityBadge = (p) => {
  const map = { HIGH: 'badge-high', MEDIUM: 'badge-medium', LOW: 'badge-low' };
  return <span className={`badge ${map[p] || 'badge-medium'}`}>{p || 'MEDIUM'}</span>;
};

const aiBadge = (status) => {
  if (!status) return null;
  const map = { DONE: ['badge-ai-done', '✨ AI Analyzed'], PENDING: ['badge-ai-pending', '⏳ AI Pending'], FAILED: ['badge-ai-failed', '⚠️ Failed'] };
  const [cls, label] = map[status] || ['badge-ai-pending', '…'];
  return <span className={`badge ${cls}`}>{label}</span>;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [keyword, setKeyword] = useState('');
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [viewMode, setViewMode] = useState('cards');
  const { addToast } = useToast();
  const navigate = useNavigate();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTasks({ status: status || undefined, priority: priority || undefined, page, size: 12, sortBy: 'createdAt', sortDir: 'desc' });
      setTasks(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch { addToast('Failed to load tasks', 'error'); }
    finally { setLoading(false); }
  }, [status, priority, page]);

  useEffect(() => { if (!searching) fetchTasks(); }, [fetchTasks, searching]);

  const handleSearch = async (e) => {
    const val = e.target.value;
    setKeyword(val);
    if (!val.trim()) { setSearching(false); return; }
    setSearching(true);
    try { const res = await searchTasks(val); setTasks(res.data); setTotalPages(0); }
    catch { addToast('Search failed', 'error'); }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const taskToUpdate = tasks.find(t => t.id === id);
      await updateTask(id, { title: taskToUpdate.title, status: newStatus });
      setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
      addToast('Status updated to Done!', 'success');
    } catch { addToast('Failed to update status', 'error'); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this task?')) return;
    try { await deleteTask(id); addToast('Task deleted', 'success'); fetchTasks(); }
    catch { addToast('Failed to delete', 'error'); }
  };

  const handleEdit = (task, e) => { e.stopPropagation(); setEditTask(task); setShowModal(true); };
  const handleCreate = () => { setEditTask(null); setShowModal(true); };
  const handleModalClose = () => { setShowModal(false); setEditTask(null); fetchTasks(); };

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>My Tasks</h1>
          <p>Manage, filter and track your work with AI insights</p>
        </div>
        <button id="create-task-btn" className="btn btn-primary" onClick={handleCreate}>
          + New Task
        </button>
      </div>

      <div className="toolbar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input id="task-search" className="form-input search-input" type="text"
            placeholder="Search tasks..." value={keyword} onChange={handleSearch} />
        </div>

        <select id="filter-status" className="form-select" style={{ width: 'auto' }}
          value={status} onChange={e => { setStatus(e.target.value); setPage(0); }}>
          <option value="">All Status</option>
          <option value="TODO">Todo</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>

        <select id="filter-priority" className="form-select" style={{ width: 'auto' }}
          value={priority} onChange={e => { setPriority(e.target.value); setPage(0); }}>
          <option value="">All Priority</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        <div className="view-toggle">
          <button className={`view-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`} onClick={() => setViewMode('cards')}>▦</button>
          <button className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')}>☰</button>
        </div>
      </div>

      {loading ? (
        <div className="loading-full"><span className="spinner"></span> Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">📭</span>
          <h3>No tasks found</h3>
          <p>Create your first task to get started with AI-powered management!</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleCreate}>+ Create Task</button>
        </div>
      ) : viewMode === 'cards' ? (
        /* ===== CARD VIEW ===== */
        <div className="task-cards-grid">
          {tasks.map((task) => (
            <div key={task.id} className={`task-card priority-${task.priority}`}
              onClick={() => navigate(`/tasks/${task.id}`)}>
              <div className="task-card-title">{task.title}</div>
              {task.description && <div className="task-card-desc">{task.description}</div>}
              <div className="task-card-meta">
                <div className="flex gap-2 items-center">
                  {statusBadge(task.status)}
                  {priorityBadge(task.priority)}
                </div>
                {aiBadge(task.aiStatus)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>
                {task.dueDate ? `Due: ${task.dueDate}` : 'No deadline'}
              </div>
              <div className="task-card-actions">
                {task.status !== 'DONE' && (
                  <button className="btn btn-xs btn-primary" onClick={e => { e.stopPropagation(); handleStatusChange(task.id, 'DONE') }} style={{ background: 'var(--accent-green)' }}>✓ Done</button>
                )}
                <button className="btn btn-xs btn-secondary" onClick={e => handleEdit(task, e)}>✏️ Edit</button>
                <button className="btn btn-xs btn-danger" onClick={e => handleDelete(task.id, e)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ===== TABLE VIEW ===== */
        <div className="task-table-wrapper">
          <table className="task-table">
            <thead>
              <tr>
                <th>Task</th><th>Status</th><th>Priority</th><th>Due Date</th><th>AI Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td className="task-title-cell">
                    <span className="task-title-text">{task.title}</span>
                    {task.description && <span className="task-desc">{task.description}</span>}
                  </td>
                  <td>{statusBadge(task.status)}</td>
                  <td>{priorityBadge(task.priority)}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{task.dueDate || '—'}</td>
                  <td>{aiBadge(task.aiStatus)}</td>
                  <td>
                    <div className="task-actions">
                      {task.status !== 'DONE' && (
                        <button className="btn btn-sm btn-primary" onClick={e => { e.stopPropagation(); handleStatusChange(task.id, 'DONE') }} style={{ background: 'var(--accent-green)' }}>✓ Done</button>
                      )}
                      <button className="btn btn-sm btn-secondary" onClick={() => navigate(`/tasks/${task.id}`)}>View</button>
                      <button className="btn btn-sm btn-secondary" onClick={e => handleEdit(task, e)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={e => handleDelete(task.id, e)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!searching && totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>‹</button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} className={`page-btn ${i === page ? 'active' : ''}`} onClick={() => setPage(i)}>{i + 1}</button>
          ))}
          <button className="page-btn" disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)}>›</button>
        </div>
      )}

      {showModal && <TaskFormModal task={editTask} onClose={handleModalClose} />}
    </div>
  );
}
