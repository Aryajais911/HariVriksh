import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyGarden, addContainer, removeContainer, getPlants } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_CONFIG = { empty: { color: 'var(--gray-400)', bg: 'var(--gray-50)', label: 'Empty' }, growing: { color: 'var(--green-700)', bg: 'var(--green-50)', label: 'Growing 🌱' }, harvested: { color: '#d97706', bg: 'var(--amber-light)', label: 'Harvested 🌾' }, problem: { color: '#dc2626', bg: '#fee2e2', label: 'Problem ⚠️' } };

const CONTAINER_TYPES = ['bottle', 'bucket', 'grow-bag', 'pipe', 'pot', 'tray', 'other'];
const EMOJIS = { bottle: '🍾', bucket: '🪣', 'grow-bag': '🛍️', pipe: '🔧', pot: '🪴', tray: '📦', other: '📦' };

const MyGardenPage = () => {
  const { user } = useAuth();
  const [garden, setGarden] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [plants, setPlants] = useState([]);
  const [addForm, setAddForm] = useState({ containerType: 'pot', size: '', plantId: '', notes: '' });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    Promise.all([
      getMyGarden().then(res => setGarden(res.data.garden)),
      getPlants({ limit: 50 }).then(res => setPlants(res.data.plants))
    ]).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    setAdding(true);
    try {
      const res = await addContainer(addForm);
      setGarden(res.data.garden);
      setShowAdd(false);
      setAddForm({ containerType: 'pot', size: '', plantId: '', notes: '' });
      toast.success('Container added!');
    } catch { toast.error('Failed to add container'); }
    finally { setAdding(false); }
  };

  const handleRemove = async (containerId) => {
    if (!window.confirm('Remove this container?')) return;
    try {
      const res = await removeContainer(containerId);
      setGarden(res.data.garden);
      toast.success('Container removed');
    } catch { toast.error('Failed to remove'); }
  };

  const daysUntilHarvest = (container) => {
    if (!container.plant || !container.plantedDate) return null;
    const planted = new Date(container.plantedDate);
    const maxDays = container.plant.harvestDays?.max || 60;
    const harvest = new Date(planted.getTime() + maxDays * 86400000);
    const diff = Math.ceil((harvest - Date.now()) / 86400000);
    return diff > 0 ? diff : 0;
  };

  if (loading) return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 40px)' }}>
      <div className="container"><div className="skeleton" style={{ height: 400 }} /></div>
    </div>
  );

  return (
    <div style={{ paddingTop: 'var(--nav-height)', background: 'var(--cream)', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg, var(--green-50), white)', padding: '40px 0', borderBottom: '1px solid var(--gray-100)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <p className="section-label">Your Green Space</p>
            <h1 className="page-title">{garden?.name || `${user?.name}'s Garden`}</h1>
            <p style={{ fontSize: 14, color: 'var(--gray-400)' }}>{garden?.containers?.length || 0} containers · {garden?.containers?.filter(c => c.plant).length || 0} active plants</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="btn btn-primary btn-lg">+ Add Container</button>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px' }}>
        {/* Stats row */}
        <div className="grid-4" style={{ marginBottom: 40 }}>
          {[
            { label: 'Total Containers', value: garden?.containers?.length || 0, icon: '📦' },
            { label: 'Active Plants', value: garden?.containers?.filter(c => c.plant).length || 0, icon: '🌱' },
            { label: 'Ready to Harvest', value: garden?.containers?.filter(c => c.status === 'harvested' || (c.plant && daysUntilHarvest(c) === 0)).length || 0, icon: '🌾' },
            { label: 'Empty Containers', value: garden?.containers?.filter(c => c.status === 'empty').length || 0, icon: '🪣' },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '20px 24px', border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--green-700)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Containers grid */}
        {garden?.containers?.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🌵</div>
            <h3>No containers yet</h3>
            <p>Add your first container to start tracking your garden</p>
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>Add First Container</button>
          </div>
        ) : (
          <div className="grid-3">
            {garden.containers.map((c) => {
              const status = STATUS_CONFIG[c.status] || STATUS_CONFIG.empty;
              const daysLeft = daysUntilHarvest(c);
              return (
                <div key={c._id} className="card" style={{ padding: 24, position: 'relative', transition: 'all .25s' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'none'; }}>
                  <button onClick={() => handleRemove(c._id)} style={{ position: 'absolute', top: 12, right: 12, background: 'var(--gray-100)', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-500)' }}>✕</button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', background: 'var(--green-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                      {EMOJIS[c.containerType] || '📦'}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, textTransform: 'capitalize' }}>{c.containerType}</p>
                      {c.size && <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>{c.size}</p>}
                    </div>
                  </div>

                  {c.plant ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--green-50)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 12 }}>
                        <span style={{ fontSize: 24 }}>{c.plant.emoji}</span>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--green-800)' }}>{c.plant.name}</p>
                          <Link to={`/plants/${c.plant._id}`} style={{ fontSize: 11, color: 'var(--green-600)' }}>View Guide →</Link>
                        </div>
                      </div>
                      {c.plantedDate && (
                        <p style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 10 }}>
                          Planted: {new Date(c.plantedDate).toLocaleDateString()}
                        </p>
                      )}
                      {daysLeft !== null && (
                        <div style={{ background: daysLeft <= 7 ? 'var(--amber-light)' : 'var(--gray-50)', borderRadius: 'var(--radius-md)', padding: '8px 12px', marginBottom: 12 }}>
                          <p style={{ fontSize: 13, color: daysLeft <= 7 ? '#92400e' : 'var(--gray-600)', fontWeight: 500 }}>
                            {daysLeft === 0 ? '🌾 Ready to harvest!' : `🗓️ ~${daysLeft} days to harvest`}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--gray-400)' }}>
                      <p style={{ fontSize: 13, marginBottom: 8 }}>No plant yet</p>
                      <Link to="/container-matcher" className="btn btn-outline btn-sm">Find a Plant</Link>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: status.color }} />
                    <span style={{ fontSize: 12, fontWeight: 500, color: status.color }}>{status.label}</span>
                  </div>
                  {c.notes && <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 8, fontStyle: 'italic' }}>{c.notes}</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Container Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="card" style={{ padding: 36, width: '100%', maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>Add Container</h3>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--gray-400)' }}>✕</button>
            </div>

            <div className="form-group">
              <label className="form-label">Container Type</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {CONTAINER_TYPES.map(t => (
                  <button key={t} type="button" onClick={() => setAddForm(p => ({ ...p, containerType: t }))} style={{
                    padding: '8px 14px', borderRadius: 'var(--radius-full)', fontSize: 13, border: '1.5px solid', cursor: 'pointer',
                    borderColor: addForm.containerType === t ? 'var(--green-500)' : 'var(--gray-200)',
                    background: addForm.containerType === t ? 'var(--green-50)' : 'white',
                    color: addForm.containerType === t ? 'var(--green-700)' : 'var(--gray-600)'
                  }}>{EMOJIS[t]} {t}</button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Size (optional)</label>
              <input value={addForm.size} onChange={e => setAddForm(p => ({ ...p, size: e.target.value }))} placeholder="e.g. 2L, 10L, 6 inch" />
            </div>

            <div className="form-group">
              <label className="form-label">Plant (optional)</label>
              <select value={addForm.plantId} onChange={e => setAddForm(p => ({ ...p, plantId: e.target.value }))}>
                <option value="">-- Leave empty for now --</option>
                {plants.map(p => <option key={p._id} value={p._id}>{p.emoji} {p.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <input value={addForm.notes} onChange={e => setAddForm(p => ({ ...p, notes: e.target.value }))} placeholder="Any notes about this container..." />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowAdd(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={handleAdd} disabled={adding} className="btn btn-primary btn-lg" style={{ flex: 1, justifyContent: 'center' }}>
                {adding ? <span className="spinner" style={{ width: 16, height: 16 }} /> : '+ Add Container'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyGardenPage;
