import React, { useEffect, useState } from 'react';
import { getSoilGuides } from '../utils/api';

const SoilGuidePage = () => {
  const [guides, setGuides] = useState([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSoilGuides().then(res => setGuides(res.data.guides)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const guide = guides[active];

  if (loading) return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 60px)' }}>
      <div className="container"><div className="skeleton" style={{ height: 400 }} /></div>
    </div>
  );

  return (
    <div style={{ paddingTop: 'var(--nav-height)', background: 'var(--cream)', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg, var(--green-50), white)', padding: '48px 0 40px', borderBottom: '1px solid var(--gray-100)' }}>
        <div className="container">
          <p className="section-label">DIY Soil Mixes</p>
          <h1 className="page-title">Soil Guide</h1>
          <p className="page-sub">Make perfect growing soil from affordable, household materials. No expensive potting mix needed.</p>
        </div>
      </div>

      <div className="container" style={{ padding: '48px 24px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 40, flexWrap: 'wrap' }}>
          {guides.map((g, i) => (
            <button key={g.id} onClick={() => setActive(i)} style={{
              padding: '12px 22px', borderRadius: 'var(--radius-full)', fontSize: 14, fontWeight: 500,
              border: '1.5px solid', cursor: 'pointer', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 8,
              borderColor: active === i ? 'var(--green-500)' : 'var(--gray-200)',
              background: active === i ? 'var(--green-50)' : 'white',
              color: active === i ? 'var(--green-700)' : 'var(--gray-600)'
            }}>
              <span style={{ fontSize: 18 }}>{g.emoji}</span> {g.name}
            </button>
          ))}
        </div>

        {guide && (
          <div className="animate-fadeIn" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 32 }}>
            <div>
              {/* Mix visualization */}
              <div className="card" style={{ padding: 32, marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginBottom: 8 }}>{guide.emoji} {guide.name}</h2>
                <p style={{ fontSize: 15, color: 'var(--gray-500)', lineHeight: 1.7, marginBottom: 28 }}>{guide.description}</p>

                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Mix Composition</h3>
                {guide.components.map((c, i) => (
                  <div key={c.name} style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 12, height: 12, borderRadius: 3, background: c.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 15, fontWeight: 500 }}>{c.name}</span>
                      </div>
                      <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--green-700)' }}>{c.percentage}%</span>
                    </div>
                    <div style={{ height: 10, background: 'var(--gray-100)', borderRadius: 5, overflow: 'hidden' }}>
                      <div style={{
                        width: `${c.percentage}%`, height: '100%', borderRadius: 5,
                        background: c.color, opacity: .85,
                        transition: 'width 1.2s ease',
                        animation: `none`
                      }} />
                    </div>
                  </div>
                ))}

                {/* Stacked visual bar */}
                <div style={{ height: 48, borderRadius: 12, overflow: 'hidden', display: 'flex', marginTop: 24 }}>
                  {guide.components.map(c => (
                    <div key={c.name} style={{
                      width: `${c.percentage}%`, height: '100%', background: c.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, color: 'white', fontWeight: 700, opacity: .9,
                      transition: 'width .8s', overflow: 'hidden'
                    }}>{c.percentage >= 20 ? `${c.percentage}%` : ''}</div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="card" style={{ padding: 28 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 19, marginBottom: 20 }}>💡 Pro Tips</h3>
                {guide.tips.map((tip, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: i < guide.tips.length - 1 ? '1px solid var(--gray-50)' : 'none' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--green-100)', color: 'var(--green-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                    <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.7 }}>{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div className="card" style={{ padding: 24, marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 16 }}>📊 Quick Info</h3>
                {[
                  { label: 'Soil pH', value: guide.ph },
                  { label: 'Drainage', value: guide.drainage },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--gray-50)' }}>
                    <span style={{ fontSize: 14, color: 'var(--gray-500)' }}>{item.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)' }}>{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 16 }}>🌱 Best For</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {guide.bestFor.map(plant => (
                    <span key={plant} className="tag">{plant}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SoilGuidePage;
