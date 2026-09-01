import React, { useEffect, useState, useCallback } from 'react';
import { getReminders, createReminder, completeReminder, deleteReminder } from '../utils/api';
import toast from 'react-hot-toast';

const TYPE_CONFIG = {
  water: { icon: '💧', color: 'var(--blue)', bg: '#dbeafe', label: 'Water' },
  fertilize: { icon: '💊', color: '#d97706', bg: 'var(--amber-light)', label: 'Fertilize' },
  harvest: { icon: '🌾', color: 'var(--green-600)', bg: 'var(--green-100)', label: 'Harvest' },
  prune: { icon: '✂️', color: '#7c3aed', bg: '#ede9fe', label: 'Prune' },
  repot: { icon: '🪴', color: '#0891b2', bg: '#cffafe', label: 'Repot' },
  custom: { icon: '📝', color: 'var(--gray-600)', bg: 'var(--gray-100)', label: 'Custom' },
};

const RemindersPage = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ type: 'water', title: '', notes: '', dueDate: '', frequency: 'once' });
  const [adding, setAdding] = useState(false);

  const fetchReminders = useCallback(() => {
    setLoading(true);
    getReminders({ status: filter }).then(res => setReminders(res.data.reminders)).catch(() => {}).finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { fetchReminders(); }, [fetchReminders]);

  const handleAdd = async () => {
    if (!form.title || !form.dueDate) { toast.error('Title and date are required'); return; }
    setAdding(true);
    try {
      const res = await createReminder(form);
      setReminders(prev => [res.data.reminder, ...prev]);
      setShowAdd(false);
      setForm({ type: 'water', title: '', notes: '', dueDate: '', frequency: 'once' });
      toast.success('Reminder set!');
    } catch { toast.error('Failed to create reminder'); }
    finally { setAdding(false); }
  };

  const handleComplete = async (id) => {
    try {
      await completeReminder(id);
      setReminders(prev => prev.filter(r => r._id !== id));
      toast.success('Marked as done! ✅');
    } catch { toast.error('Error'); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteReminder(id);
      setReminders(prev => prev.filter(r => r._id !== id));
      toast.success('Reminder deleted');
    } catch { toast.error('Error'); }
  };

  const isOverdue = (dueDate) => new Date(dueDate) < new Date() && true;
  const isDueToday = (dueDate) => {
    const d = new Date(dueDate); const n = new Date();
    return d.toDateString() === n.toDateString();
  };

  return (
    <div style={{ paddingTop: 'var(--nav-height)', background: 'var(--cream)', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg, var(--green-50), white)', padding: '40px 0', borderBottom: '1px solid var(--gray-100)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <p className="section-label">Garden Reminders</p>
            <h1 className="page-title">My Reminders</h1>
            <p style={{ fontSize: 14, color: 'var(--gray-400)' }}>{reminders.length} {filter} reminder{reminders.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="btn btn-primary btn-lg">+ Set Reminder</button>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {['pending', 'completed'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '9px 22px', borderRadius: 'var(--radius-full)', fontSize: 14, fontWeight: 500, cursor: 'pointer', border: '1.5px solid', textTransform: 'capitalize',
              borderColor: filter === f ? 'var(--green-500)' : 'var(--gray-200)',
              background: filter === f ? 'var(--green-50)' : 'white',
              color: filter === f ? 'var(--green-700)' : 'var(--gray-600)'
            }}>{f === 'pending' ? '⏳' : '✅'} {f}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 90 }} />)}
          </div>
        ) : reminders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔔</div>
            <h3>No {filter} reminders</h3>
            <p>{filter === 'pending' ? 'Set reminders for watering, fertilizing and harvesting' : 'Complete some reminders to see them here'}</p>
            {filter === 'pending' && <button className="btn btn-primary" onClick={() => setShowAdd(true)}>Set First Reminder</button>}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reminders.map(r => {
              const type = TYPE_CONFIG[r.type] || TYPE_CONFIG.custom;
              const overdue = isOverdue(r.dueDate) && !r.isCompleted;
              const today = isDueToday(r.dueDate);
              return (
                <div key={r._id} className="card" style={{
                  padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16,
                  borderLeft: `4px solid ${overdue ? 'var(--red)' : today ? 'var(--amber)' : type.color}`,
                  borderRadius: 'var(--radius-lg)', transition: 'all .2s'
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: type.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    {type.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: r.isCompleted ? 'var(--gray-400)' : 'var(--gray-800)', textDecoration: r.isCompleted ? 'line-through' : 'none' }}>{r.title}</h3>
                      {overdue && <span className="badge badge-red">Overdue</span>}
                      {today && !overdue && <span className="badge badge-amber">Due Today</span>}
                      <span style={{ fontSize: 12, padding: '2px 10px', borderRadius: 'var(--radius-full)', background: type.bg, color: type.color, fontWeight: 500 }}>{type.label}</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 4 }}>
                      📅 {new Date(r.dueDate).toLocaleDateString()} · 🔁 {r.frequency}
                      {r.plant && ` · 🌱 ${r.plant.emoji} ${r.plant.name}`}
                    </div>
                    {r.notes && <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>{r.notes}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    {!r.isCompleted && (
                      <button onClick={() => handleComplete(r._id)} className="btn btn-primary btn-sm">✓ Done</button>
                    )}
                    <button onClick={() => handleDelete(r._id)} style={{ background: 'var(--gray-100)', border: 'none', borderRadius: 'var(--radius-md)', padding: '7px 10px', cursor: 'pointer', fontSize: 14, color: 'var(--gray-400)' }}>🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="card" style={{ padding: 36, width: '100%', maxWidth: 460 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>🔔 New Reminder</h3>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <div className="form-group">
              <label className="form-label">Type</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {Object.entries(TYPE_CONFIG).map(([key, val]) => (
                  <button key={key} type="button" onClick={() => setForm(p => ({ ...p, type: key }))} style={{
                    padding: '7px 14px', borderRadius: 'var(--radius-full)', fontSize: 13, border: '1.5px solid', cursor: 'pointer',
                    borderColor: form.type === key ? 'var(--green-500)' : 'var(--gray-200)',
                    background: form.type === key ? 'var(--green-50)' : 'white',
                    color: form.type === key ? 'var(--green-700)' : 'var(--gray-600)'
                  }}>{val.icon} {val.label}</button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Title *</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder={`e.g. Water the tomatoes`} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Due Date *</label>
                <input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="form-group">
                <label className="form-label">Frequency</label>
                <select value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))}>
                  <option value="once">Once</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Any extra notes..." />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowAdd(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={handleAdd} disabled={adding} className="btn btn-primary btn-lg" style={{ flex: 1, justifyContent: 'center' }}>
                {adding ? <span className="spinner" style={{ width: 16, height: 16 }} /> : '🔔 Set Reminder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemindersPage;
