import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, getWeather, getReminders } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const WeatherWidget = ({ city }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const q = city || 'delhi';
    getWeather({ city: q.toLowerCase() })
      .then(res => setWeather(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [city]);

  if (loading) return (
    <div style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', borderRadius: 'var(--radius-lg)', padding: 24, color: '#fff' }}>
      <div className="skeleton" style={{ height: 80, background: 'rgba(255,255,255,.15)' }} />
    </div>
  );

  if (error || !weather) return (
    <div style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', borderRadius: 'var(--radius-lg)', padding: 24, color: '#fff', textAlign: 'center' }}>
      <p style={{ fontSize: 14, opacity: .8 }}>Weather unavailable</p>
      <p style={{ fontSize: 12, opacity: .6, marginTop: 4 }}>Check internet connection</p>
    </div>
  );

  const { current, forecast, farmingAdvice, city: weatherCity } = weather;

  return (
    <div style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', borderRadius: 'var(--radius-lg)', padding: 24, color: '#fff', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 12, opacity: .75, marginBottom: 2, textTransform: 'capitalize' }}>📍 {weatherCity}</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 48, fontFamily: 'var(--font-display)', fontWeight: 700, lineHeight: 1 }}>{current.temp}°</span>
            <span style={{ fontSize: 16, opacity: .8 }}>C</span>
          </div>
          <p style={{ fontSize: 14, opacity: .85, marginTop: 4 }}>{current.weather.icon} {current.weather.label}</p>
        </div>
        <div style={{ textAlign: 'right', fontSize: 13, opacity: .8 }}>
          <div>💧 {current.humidity}%</div>
          <div style={{ marginTop: 4 }}>💨 {current.windSpeed} km/h</div>
          <div style={{ marginTop: 4 }}>🌡 Feels {current.feelsLike}°</div>
        </div>
      </div>

      {/* 5-day forecast */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {forecast.slice(0, 5).map((d, i) => (
          <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,.12)', borderRadius: 10, padding: '8px 4px', textAlign: 'center', fontSize: 11 }}>
            <div style={{ opacity: .75, marginBottom: 4 }}>
              {i === 0 ? 'Today' : new Date(d.date).toLocaleDateString('en', { weekday: 'short' })}
            </div>
            <div style={{ fontSize: 16, marginBottom: 3 }}>{d.weather.icon}</div>
            <div style={{ fontWeight: 600 }}>{d.maxTemp}°</div>
            <div style={{ opacity: .6 }}>{d.minTemp}°</div>
          </div>
        ))}
      </div>

      {/* Farming advice */}
      {farmingAdvice?.length > 0 && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,.2)', paddingTop: 12 }}>
          <p style={{ fontSize: 11, opacity: .7, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.06em' }}>Garden advice for today</p>
          {farmingAdvice.slice(0, 2).map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 12, opacity: .9 }}>
              <span>{a.icon}</span>
              <span style={{ lineHeight: 1.5 }}>{a.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, color, link }) => (
  <Link to={link || '#'} style={{ textDecoration: 'none' }}>
    <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '20px 22px', border: '1px solid var(--gray-100)', transition: 'all .2s', cursor: link ? 'pointer' : 'default' }}
      onMouseEnter={e => { if (link) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; } }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
      <div style={{ fontSize: 26, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: color || 'var(--green-700)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>{label}</div>
    </div>
  </Link>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardStats().then(res => setStats(res.data.stats)).catch(() => {}),
      getReminders({ status: 'pending' }).then(res => setReminders(res.data.reminders?.slice(0, 5) || [])).catch(() => {})
    ]).finally(() => setLoadingStats(false));
  }, []);

  const todayReminders = reminders.filter(r => {
    const due = new Date(r.dueDate);
    const now = new Date();
    return due.toDateString() === now.toDateString() || due < now;
  });

  const typeIcons = { water: '💧', fertilize: '💊', harvest: '🌾', prune: '✂️', repot: '🪴', custom: '📝' };
  const typeColors = { water: '#dbeafe', fertilize: '#fef3c7', harvest: '#dcfce7', prune: '#ede9fe', repot: '#cffafe', custom: '#f3f4f6' };

  return (
    <div style={{ paddingTop: 'var(--nav-height)', background: 'var(--cream)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--green-50), #fff)', padding: '40px 0 32px', borderBottom: '1px solid var(--gray-100)' }}>
        <div className="container">
          <p className="section-label">My Dashboard</p>
          <h1 className="page-title">Good morning, {user?.name?.split(' ')[0]}! 🌿</h1>
          <p style={{ fontSize: 14, color: 'var(--gray-400)' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'start' }}>
          {/* Left column */}
          <div>
            {/* Stats grid */}
            {loadingStats ? (
              <div className="grid-4" style={{ marginBottom: 28 }}>
                {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 110 }} />)}
              </div>
            ) : (
              <div className="grid-4" style={{ marginBottom: 28 }}>
                <StatCard icon="📦" label="Total Containers" value={stats?.totalContainers || 0} link="/my-garden" />
                <StatCard icon="🌱" label="Active Plants" value={stats?.activePlants || 0} link="/my-garden" />
                <StatCard icon="🔔" label="Pending Reminders" value={stats?.pendingReminders || 0} color={stats?.overdueReminders > 0 ? 'var(--red)' : 'var(--green-700)'} link="/reminders" />
                <StatCard icon="❤️" label="Saved Plants" value={stats?.savedPlants || 0} link="/plants" />
              </div>
            )}

            {/* Upcoming Harvests */}
            {stats?.upcomingHarvests?.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)', padding: 24, marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                  🌾 Upcoming Harvests
                </h3>
                {stats.upcomingHarvests.map((h, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: i < stats.upcomingHarvests.length - 1 ? '1px solid var(--gray-100)' : 'none' }}>
                    <span style={{ fontSize: 28 }}>{h.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 600 }}>{h.plant}</p>
                      <p style={{ fontSize: 12, color: 'var(--gray-400)', textTransform: 'capitalize' }}>in {h.containerType}</p>
                    </div>
                    <div style={{
                      padding: '5px 14px', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 600,
                      background: h.daysLeft === 0 ? 'var(--green-100)' : h.daysLeft <= 7 ? 'var(--amber-light)' : 'var(--gray-100)',
                      color: h.daysLeft === 0 ? 'var(--green-800)' : h.daysLeft <= 7 ? '#92400e' : 'var(--gray-600)'
                    }}>
                      {h.daysLeft === 0 ? '🎉 Ready!' : `${h.daysLeft} days`}
                    </div>
                  </div>
                ))}
                <Link to="/my-garden" className="btn btn-outline btn-sm" style={{ marginTop: 14 }}>View Full Garden →</Link>
              </div>
            )}

            {/* Today's reminders */}
            <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)', padding: 24, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                  🔔 Today's Tasks
                  {todayReminders.length > 0 && (
                    <span style={{ background: 'var(--red)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>{todayReminders.length}</span>
                  )}
                </h3>
                <Link to="/reminders" style={{ fontSize: 13, color: 'var(--green-600)', fontWeight: 500 }}>See all →</Link>
              </div>
              {todayReminders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--gray-400)' }}>
                  <p style={{ fontSize: 28, marginBottom: 8 }}>✅</p>
                  <p style={{ fontSize: 14 }}>All tasks done for today!</p>
                </div>
              ) : (
                todayReminders.map(r => (
                  <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid var(--gray-50)' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: typeColors[r.type] || 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                      {typeIcons[r.type] || '📝'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)' }}>{r.title}</p>
                      <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>{r.plant ? `${r.plant.emoji} ${r.plant.name}` : r.frequency}</p>
                    </div>
                    {new Date(r.dueDate) < new Date() && (
                      <span style={{ fontSize: 10, fontWeight: 600, background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>Overdue</span>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Quick actions */}
            <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)', padding: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 18 }}>⚡ Quick Actions</h3>
              <div className="grid-3" style={{ gap: 12 }}>
                {[
                  { icon: '📦', label: 'Match Container', sub: 'Find best plant', link: '/container-matcher', color: 'var(--green-50)', border: 'var(--green-200)' },
                  { icon: '🤖', label: 'Ask AI', sub: 'Get instant help', link: '/ai-doctor', color: '#f0f9ff', border: '#bae6fd' },
                  { icon: '👥', label: 'Community', sub: 'Share your harvest', link: '/community', color: '#fdf4ff', border: '#e9d5ff' },
                  { icon: '🧪', label: 'Soil Guide', sub: 'DIY soil recipes', link: '/soil-guide', color: '#fff7ed', border: '#fed7aa' },
                  { icon: '🌱', label: 'My Garden', sub: 'Track plants', link: '/my-garden', color: 'var(--green-50)', border: 'var(--green-200)' },
                  { icon: '📚', label: 'Plants', sub: 'Full encyclopedia', link: '/plants', color: 'var(--gray-50)', border: 'var(--gray-200)' },
                ].map(a => (
                  <Link key={a.label} to={a.link} style={{ textDecoration: 'none' }}>
                    <div style={{ background: a.color, border: `1px solid ${a.border}`, borderRadius: 'var(--radius-md)', padding: '14px 12px', cursor: 'pointer', transition: 'all .2s' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}>
                      <div style={{ fontSize: 22, marginBottom: 6 }}>{a.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)', marginBottom: 2 }}>{a.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{a.sub}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div>
            <WeatherWidget city={user?.city} />

            <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)', padding: 22, marginTop: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 16 }}>🌱 Your Profile</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--green-400), var(--green-700))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, flexShrink: 0 }}>
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 15 }}>{user?.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--gray-400)', textTransform: 'capitalize' }}>{user?.experience} farmer {user?.city && `· ${user.city}`}</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Link to="/profile" className="btn btn-outline btn-sm" style={{ justifyContent: 'center' }}>Edit Profile</Link>
                <Link to="/reminders" className="btn btn-primary btn-sm" style={{ justifyContent: 'center' }}>+ Reminder</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
