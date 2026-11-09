import React, { useEffect, useState, useCallback } from 'react';
import { getReminders, createReminder, completeReminder, deleteReminder, getWeather } from '../utils/api';
import toast from 'react-hot-toast';

const TYPE_CONFIG = {
  water: { icon: '💧', color: 'var(--blue)', bg: '#dbeafe', label: 'Water' },
  fertilize: { icon: '💊', color: '#d97706', bg: 'var(--amber-light)', label: 'Fertilize' },
  harvest: { icon: '🌾', color: 'var(--green-600)', bg: 'var(--green-100)', label: 'Harvest' },
  prune: { icon: '✂️', color: '#7c3aed', bg: '#ede9fe', label: 'Prune' },
  repot: { icon: '🪴', color: '#0891b2', bg: '#cffafe', label: 'Repot' },
  custom: { icon: '📝', color: 'var(--gray-600)', bg: 'var(--gray-100)', label: 'Custom' },
};

const POPULAR_CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Lucknow', 'Ahmedabad'];

const RemindersPage = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ type: 'water', title: '', notes: '', dueDate: '', frequency: 'once' });
  const [adding, setAdding] = useState(false);

  // Weather & Location state
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Delhi');
  const [userLocation, setUserLocation] = useState(null);
  const [autoSkipRain, setAutoSkipRain] = useState(true);

  const fetchReminders = useCallback(() => {
    setLoading(true);
    getReminders({ status: filter }).then(res => setReminders(res.data.reminders)).catch(() => {}).finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { fetchReminders(); }, [fetchReminders]);

  // Fetch Weather by City or Coordinates
  const fetchWeather = useCallback(async (params) => {
    setWeatherLoading(true);
    try {
      const res = await getWeather(params);
      if (res.data.success) {
        setWeatherData(res.data);
      }
    } catch {
      toast.error('Could not fetch live weather');
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  // Initial Weather load
  useEffect(() => {
    fetchWeather({ city: selectedCity });
  }, [selectedCity, fetchWeather]);

  // Geolocation Handler
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    toast.loading('Detecting your location...', { id: 'geo' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setUserLocation({ lat, lon });
        toast.success(`Location detected! (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`, { id: 'geo' });
        fetchWeather({ lat, lon });
      },
      (err) => {
        toast.error('Location access denied. Using city selection.', { id: 'geo' });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

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

  // Bulk Rain Skip for Today's Watering Reminders
  const handleBulkRainSkip = () => {
    const todayWateringReminders = reminders.filter(r => r.type === 'water' && isDueToday(r.dueDate) && !r.isCompleted);
    if (!todayWateringReminders.length) {
      toast('No pending watering reminders due today to skip!');
      return;
    }
    todayWateringReminders.forEach(r => handleComplete(r._id));
    toast.success(`Rain-Skipped ${todayWateringReminders.length} watering reminder(s)! 🌧️💧`);
  };

  const isOverdue = (dueDate) => new Date(dueDate) < new Date() && !isDueToday(dueDate);
  const isDueToday = (dueDate) => {
    const d = new Date(dueDate); const n = new Date();
    return d.toDateString() === n.toDateString();
  };

  return (
    <div style={{ paddingTop: 'var(--nav-height)', background: 'var(--cream)', minHeight: '100vh', paddingBottom: 80 }}>
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, var(--green-50), white)', padding: '40px 0', borderBottom: '1px solid var(--gray-100)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <p className="section-label">Smart Care Calendar & Reminders</p>
            <h1 className="page-title">Weather-Aware Reminders</h1>
            <p style={{ fontSize: 14, color: 'var(--gray-500)', margin: '4px 0 0' }}>
              Auto-adjusts watering schedules based on real-time local rainfall forecasts.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={handleDetectLocation} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderColor: 'var(--green-500)', color: 'var(--green-700)' }}>
              📍 Use My Current Location
            </button>
            <button onClick={() => setShowAdd(true)} className="btn btn-primary btn-lg">+ Set Reminder</button>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        {/* Weather Care Calendar Card */}
        <div className="card" style={{ padding: 28, marginBottom: 32, borderRadius: 20, background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 32 }}>🌤️</span>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, margin: 0 }}>
                  Smart Weather Care Calendar
                </h3>
                <p style={{ fontSize: 13, color: 'var(--gray-500)', margin: '2px 0 0' }}>
                  Location: <strong>{weatherData?.city || selectedCity}</strong> {userLocation ? '📍 (GPS)' : ''}
                </p>
              </div>
            </div>

            {/* City Switcher & Settings */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <select
                value={selectedCity}
                onChange={e => { setSelectedCity(e.target.value); setUserLocation(null); }}
                style={{ padding: '8px 14px', borderRadius: 12, fontSize: 13, border: '1px solid var(--gray-200)', background: 'white', fontWeight: 600 }}
              >
                {POPULAR_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', cursor: 'pointer', background: 'var(--gray-50)', padding: '8px 14px', borderRadius: 12, border: '1px solid var(--gray-200)' }}>
                <input type="checkbox" checked={autoSkipRain} onChange={e => setAutoSkipRain(e.target.checked)} style={{ accentColor: 'var(--green-600)' }} />
                🌧️ Rain Auto-Skip Guard
              </label>
            </div>
          </div>

          {weatherLoading ? (
            <div className="skeleton" style={{ height: 120, borderRadius: 14 }} />
          ) : weatherData ? (
            <div>
              {/* Rain Alert Banner */}
              {weatherData.shouldSkipWatering && (
                <div style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '1.5px solid #93c5fd', borderRadius: 14, padding: 18, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                      🌧️
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e3a8a' }}>
                        Rain Detected Today ({weatherData.rainAmountMm} mm)
                      </h4>
                      <p style={{ margin: '2px 0 0', fontSize: 13, color: '#1e40af' }}>
                        Watering is auto-paused to prevent root rot and save water. Outdoor pots receive natural rainfall!
                      </p>
                    </div>
                  </div>
                  <button onClick={handleBulkRainSkip} className="btn" style={{ background: '#2563eb', color: 'white', fontSize: 13, fontWeight: 700, borderRadius: 12, padding: '8px 16px' }}>
                    🌧️ Skip Today's Watering (Auto-Done)
                  </button>
                </div>
              )}

              {/* 5-Day Forecast Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                {weatherData.forecast?.map((day, idx) => (
                  <div key={idx} style={{
                    padding: '14px 12px', borderRadius: 14, textAlign: 'center',
                    background: day.rainExpected ? '#eff6ff' : '#f8fafc',
                    border: `1.5px solid ${day.rainExpected ? '#93c5fd' : '#e2e8f0'}`,
                    transition: 'all .2s'
                  }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-600)', margin: '0 0 6px' }}>
                      {idx === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })}
                    </p>
                    <div style={{ fontSize: 26, margin: '4px 0' }}>{day.weather.icon}</div>
                    <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--gray-900)', margin: '2px 0' }}>
                      {day.maxTemp}° / {day.minTemp}°C
                    </p>
                    {day.precipitation > 0 && (
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', margin: '2px 0' }}>
                        💧 {day.precipitation} mm
                      </p>
                    )}
                    <span style={{
                      display: 'inline-block', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 10, marginTop: 6,
                      background: day.rainExpected ? '#dbeafe' : 'white',
                      color: day.rainExpected ? '#1e40af' : 'var(--gray-600)',
                      border: '1px solid #cbd5e1'
                    }}>
                      {day.suggestedCare}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {['pending', 'completed'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '9px 22px', borderRadius: 'var(--radius-full)', fontSize: 14, fontWeight: 600, cursor: 'pointer', border: '1.5px solid', textTransform: 'capitalize',
                borderColor: filter === f ? 'var(--green-500)' : 'var(--gray-200)',
                background: filter === f ? 'var(--green-50)' : 'white',
                color: filter === f ? 'var(--green-700)' : 'var(--gray-600)'
              }}>{f === 'pending' ? '⏳' : '✅'} {f}</button>
            ))}
          </div>

          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-500)' }}>
            Showing {reminders.length} {filter} task(s)
          </span>
        </div>

        {/* Reminders List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 16 }} />)}
          </div>
        ) : reminders.length === 0 ? (
          <div className="empty-state" style={{ padding: 48, background: 'white', borderRadius: 20 }}>
            <div className="empty-state-icon">🔔</div>
            <h3>No {filter} reminders</h3>
            <p>{filter === 'pending' ? 'Set reminders for watering, fertilizing and harvesting' : 'Complete some reminders to see them here'}</p>
            {filter === 'pending' && <button className="btn btn-primary" onClick={() => setShowAdd(true)}>Set First Reminder</button>}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {reminders.map(r => {
              const type = TYPE_CONFIG[r.type] || TYPE_CONFIG.custom;
              const overdue = isOverdue(r.dueDate) && !r.isCompleted;
              const today = isDueToday(r.dueDate);
              const isWateringTask = r.type === 'water';
              const shouldRainSkip = autoSkipRain && isWateringTask && today && weatherData?.shouldSkipWatering;

              return (
                <div key={r._id} className="card" style={{
                  padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16,
                  borderLeft: `5px solid ${shouldRainSkip ? '#2563eb' : overdue ? 'var(--red)' : today ? 'var(--amber)' : type.color}`,
                  background: shouldRainSkip ? '#eff6ff' : 'white',
                  borderRadius: 'var(--radius-lg)', transition: 'all .2s'
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: type.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    {type.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: r.isCompleted ? 'var(--gray-400)' : 'var(--gray-800)', textDecoration: r.isCompleted ? 'line-through' : 'none', margin: 0 }}>{r.title}</h3>
                      
                      {shouldRainSkip && (
                        <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 12, background: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd' }}>
                          🌧️ AUTO-SKIPPED (Rain Today)
                        </span>
                      )}
                      {overdue && !shouldRainSkip && <span className="badge badge-red">Overdue</span>}
                      {today && !overdue && !shouldRainSkip && <span className="badge badge-amber">Due Today</span>}
                      <span style={{ fontSize: 12, padding: '2px 10px', borderRadius: 'var(--radius-full)', background: type.bg, color: type.color, fontWeight: 600 }}>{type.label}</span>
                    </div>
                    
                    <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>
                      📅 {new Date(r.dueDate).toLocaleDateString()} · 🔁 {r.frequency}
                      {r.plant && ` · 🌱 ${r.plant.emoji || ''} ${r.plant.name}`}
                    </div>
                    {r.notes && <p style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 4, margin: 0 }}>{r.notes}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    {!r.isCompleted && (
                      <button onClick={() => handleComplete(r._id)} className="btn btn-primary btn-sm" style={{ background: shouldRainSkip ? '#2563eb' : undefined }}>
                        {shouldRainSkip ? '🌧️ Skip (Rain)' : '✓ Done'}
                      </button>
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
