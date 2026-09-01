import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPlants } from '../utils/api';
import PlantCard from '../components/PlantCard';

const STATS = [
  { value: '14,000+', label: 'Urban Farmers' },
  { value: '8', label: 'Plant Varieties' },
  { value: '100%', label: 'Pesticide Free' },
  { value: '6', label: 'Container Types' },
];

const FEATURES = [
  { icon: '📸', title: 'Smart Container Matcher', desc: 'Tell us what container you have — bottle, bucket, pipe — and get perfectly matched plant recommendations instantly.', link: '/container-matcher', cta: 'Try Matcher' },
  { icon: '🌱', title: 'Complete Plant Guides', desc: 'Step-by-step growing guides for every plant: soil mix ratios, fertilizer schedules, common problems & fixes.', link: '/plants', cta: 'Browse Plants' },
  { icon: '🧪', title: 'DIY Soil Recipes', desc: 'Make perfect growing soil from household materials. No expensive store-bought potting mix needed.', link: '/soil-guide', cta: 'See Recipes' },
  { icon: '🔔', title: 'Smart Reminders', desc: 'Never miss watering, fertilizing, or harvesting. Get personalized reminders based on your garden setup.', link: '/reminders', cta: 'Set Reminders' },
  { icon: '👥', title: 'Community Forum', desc: 'Join thousands of rooftop farmers. Share harvests, ask questions, solve problems together.', link: '/community', cta: 'Join Community' },
  { icon: '🌿', title: 'My Garden Tracker', desc: 'Track all your containers and plants in one place. See growth progress and upcoming harvests.', link: '/my-garden', cta: 'Track Garden' },
];

const CONTAINER_HIGHLIGHTS = [
  { emoji: '🍾', name: 'Plastic Bottle', desc: '500ml – 5L', plants: 'Herbs, Spinach, Coriander' },
  { emoji: '🪣', name: 'Old Bucket', desc: '5L – 20L', plants: 'Tomato, Chilli, Brinjal' },
  { emoji: '🔧', name: 'PVC Pipe', desc: '2"–6" dia', plants: 'Leafy Greens, Herbs' },
  { emoji: '🛍️', name: 'Grow Bag', desc: '3L – 50L', plants: 'Any Vegetable' },
];

const HomePage = () => {
  const [plants, setPlants] = useState([]);
  const [loadingPlants, setLoadingPlants] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getPlants({ limit: 4, sort: 'rating' })
      .then(res => setPlants(res.data.plants))
      .catch(() => {})
      .finally(() => setLoadingPlants(false));
  }, []);

  return (
    <div>
      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        background: 'linear-gradient(160deg, #f0fdf4 0%, #fafaf7 50%, #fef9ef 100%)',
        paddingTop: 'var(--nav-height)', position: 'relative', overflow: 'hidden'
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: '10%', right: '5%', width: 400, height: 400, borderRadius: '60% 40% 70% 30%', background: 'rgba(74,222,128,.08)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: 300, height: 300, borderRadius: '40% 60% 30% 70%', background: 'rgba(245,158,11,.06)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div className="container" style={{ padding: '80px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div className="animate-slideUp">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--green-100)', color: 'var(--green-800)', padding: '6px 16px', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 500, marginBottom: 24 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green-500)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              100% Pesticide-Free Urban Farming
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px,5vw,68px)', fontWeight: 900, color: 'var(--gray-900)', lineHeight: 1.1, marginBottom: 24 }}>
              Grow Fresh Food<br />
              <span style={{ color: 'var(--green-600)' }}>On Your Rooftop</span>
            </h1>

            <p style={{ fontSize: 18, color: 'var(--gray-500)', lineHeight: 1.8, maxWidth: 480, marginBottom: 40 }}>
              Turn any bottle, bucket, or pipe into a thriving garden. Our AI-powered matcher tells you exactly what to grow, what soil to use, and how to care for it.
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 48 }}>
              <Link to="/container-matcher" className="btn btn-primary btn-lg">
                🌿 Match Your Container
              </Link>
              <Link to="/plants" className="btn btn-outline btn-lg">
                Browse Plants
              </Link>
            </div>

            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
              {STATS.map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--green-700)', fontFamily: 'var(--font-display)' }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{
              width: 380, background: 'white', borderRadius: 28,
              boxShadow: 'var(--shadow-lg)', padding: 24,
              border: '1px solid var(--gray-100)'
            }} className="animate-fadeIn">
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--green-600)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 16 }}>🔍 Container Matcher Result</p>
              {[
                { emoji: '🍾', container: '2L Plastic Bottle', plant: 'Mint (Pudina)', match: 94, color: 'var(--green-600)' },
                { emoji: '🪣', container: '10L Paint Bucket', plant: 'Cherry Tomato', match: 88, color: 'var(--green-500)' },
                { emoji: '🛍️', container: 'Grow Bag 5L', plant: 'Chilli (Mirchi)', match: 91, color: 'var(--green-700)' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: 14, borderRadius: 'var(--radius-md)',
                  background: i === 0 ? 'var(--green-50)' : 'var(--gray-50)',
                  marginBottom: 10, border: `1px solid ${i === 0 ? 'var(--green-200)' : 'var(--gray-100)'}`,
                  cursor: 'pointer', transition: 'all .2s'
                }}>
                  <span style={{ fontSize: 32 }}>{item.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 2 }}>{item.container}</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-800)' }}>{item.plant}</div>
                    <div style={{ marginTop: 5, height: 4, background: 'var(--gray-200)', borderRadius: 2 }}>
                      <div style={{ width: `${item.match}%`, height: '100%', background: item.color, borderRadius: 2 }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: item.color }}>{item.match}%</div>
                </div>
              ))}
              <button onClick={() => navigate('/container-matcher')} className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}>
                Try With Your Container →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTAINERS SECTION ── */}
      <section style={{ padding: '80px 0', background: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p className="section-label">What You Already Have</p>
            <h2 className="page-title">Any Container, Any Plant</h2>
            <p className="page-sub" style={{ margin: '0 auto' }}>
              You don't need to buy expensive planters. Use what's already at home.
            </p>
          </div>
          <div className="grid-4">
            {CONTAINER_HIGHLIGHTS.map(c => (
              <div key={c.name} className="card" style={{ padding: 28, textAlign: 'center', transition: 'all .25s', cursor: 'pointer' }}
                onClick={() => navigate('/container-matcher')}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>{c.emoji}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, marginBottom: 4 }}>{c.name}</h3>
                <p style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 10 }}>{c.desc}</p>
                <p style={{ fontSize: 13, color: 'var(--green-700)', fontWeight: 500 }}>{c.plants}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/container-matcher" className="btn btn-outline">See All Container Types →</Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section style={{ padding: '80px 0', background: 'var(--cream)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p className="section-label">Everything You Need</p>
            <h2 className="page-title">From Zero to Harvest</h2>
            <p className="page-sub" style={{ margin: '0 auto' }}>Complete tools for every step of your urban farming journey.</p>
          </div>
          <div className="grid-3">
            {FEATURES.map((f, i) => (
              <Link key={f.title} to={f.link} style={{ textDecoration: 'none' }}>
                <div className="card" style={{
                  padding: 28, height: '100%', transition: 'all .25s',
                  animationDelay: `${i * .08}s`
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = 'var(--green-200)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--gray-100)'; }}>
                  <div style={{ width: 52, height: 52, background: 'var(--green-50)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 18 }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 600, marginBottom: 10 }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--gray-500)', lineHeight: 1.7, marginBottom: 18 }}>{f.desc}</p>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-600)' }}>{f.cta} →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR PLANTS ── */}
      <section style={{ padding: '80px 0', background: 'white' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p className="section-label">Top Rated</p>
              <h2 className="page-title" style={{ marginBottom: 0 }}>Popular Plants</h2>
            </div>
            <Link to="/plants" className="btn btn-outline">View All Plants →</Link>
          </div>
          {loadingPlants ? (
            <div className="grid-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 280 }} />)}
            </div>
          ) : (
            <div className="grid-4">
              {plants.map(p => <PlantCard key={p._id} plant={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '100px 24px', background: 'linear-gradient(135deg, var(--green-700), var(--green-900))', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: 56, marginBottom: 24 }}>🌿</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,4vw,52px)', fontWeight: 900, color: 'white', marginBottom: 16 }}>
            Start Growing Today
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,.7)', lineHeight: 1.8, marginBottom: 40 }}>
            Join thousands of families growing their own pesticide-free food. Free to use, forever.
          </p>
          <Link to="/register" className="btn btn-lg" style={{ background: 'white', color: 'var(--green-800)', fontWeight: 700 }}>
            Create Free Account →
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
