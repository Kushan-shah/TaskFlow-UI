import { useState } from 'react';
import { createTask, updateTask } from '../api/tasks';
import { useToast } from '../context/ToastContext';

export default function TaskFormModal({ task, onClose }) {
  const isEdit = !!task;
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'MEDIUM',
    dueDate: task?.dueDate || '',
    status: task?.status || 'TODO',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        priority: form.priority,
        dueDate: form.dueDate || null,
      };

      if (isEdit) {
        // Include status in update payload to prevent resetting it
        payload.status = form.status;
        await updateTask(task.id, payload);
        addToast('Task updated!', 'success');
      } else {
        await createTask(payload);
        addToast('Task created! AI analysis started ✨', 'success');
      }
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save task', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? '✏️ Edit Task' : '✨ New Task'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              id="task-title"
              className="form-input"
              type="text"
              placeholder="Enter task title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              id="task-description"
              className="form-textarea"
              placeholder="Describe what needs to be done..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                id="task-priority"
                className="form-select"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="LOW">🟢 Low</option>
                <option value="MEDIUM">🟡 Medium</option>
                <option value="HIGH">🔴 High</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                id="task-due-date"
                className="form-input"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
          </div>

          {/* Show status selector in edit mode */}
          {isEdit && (
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                id="task-status"
                className="form-select"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="TODO">📋 Todo</option>
                <option value="IN_PROGRESS">🔄 In Progress</option>
                <option value="DONE">✅ Done</option>
              </select>
            </div>
          )}

          {!isEdit && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(6,182,212,0.05))',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{ fontSize: '16px' }}>🤖</span>
              AI will automatically analyze this task for smart summarization and priority prediction.
            </div>
          )}

          <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button
              id="task-submit"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? <><span className="spinner"></span> Saving...</>
                : isEdit ? 'Update Task' : 'Create Task'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
