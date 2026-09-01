import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPlant, savePlant } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Section = ({ title, children }) => (
  <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)', padding: 28, marginBottom: 20 }}>
    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--gray-100)' }}>{title}</h3>
    {children}
  </div>
);

const PlantDetailPage = () => {
  const { id } = useParams();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getPlant(id).then(res => setPlant(res.data.plant)).catch(() => navigate('/plants')).finally(() => setLoading(false));
  }, [id, navigate]);

  const isSaved = user?.savedPlants?.includes(id);

  const handleSave = async () => {
    if (!user) { navigate('/login'); return; }
    setSaving(true);
    try {
      const res = await savePlant(id);
      setUser(prev => ({ ...prev, savedPlants: res.data.savedPlants }));
      toast.success(res.data.saved ? 'Plant saved!' : 'Plant unsaved');
    } catch { toast.error('Error saving plant'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 40px)' }}>
      <div className="container"><div className="skeleton" style={{ height: 300, marginBottom: 20 }} /></div>
    </div>
  );
  if (!plant) return null;

  const soilParts = plant.soilMix?.components || [];

  return (
    <div style={{ paddingTop: 'var(--nav-height)', background: 'var(--cream)', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, var(--green-50) 0%, white 100%)', borderBottom: '1px solid var(--gray-100)', padding: '40px 0' }}>
        <div className="container">
          <Link to="/plants" style={{ fontSize: 13, color: 'var(--gray-400)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20, textDecoration: 'none' }}>← Back to Plants</Link>
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 40, alignItems: 'start' }}>
            <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--gray-100)', padding: '40px 20px', textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ fontSize: 96, marginBottom: 16 }}>{plant.emoji}</div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, marginBottom: 4 }}>{plant.name}</h1>
              {plant.scientificName && <p style={{ fontSize: 13, color: 'var(--gray-400)', fontStyle: 'italic', marginBottom: 16 }}>{plant.scientificName}</p>}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
                <span className={`badge badge-${plant.difficulty === 'easy' ? 'green' : plant.difficulty === 'medium' ? 'amber' : 'red'}`}>{plant.difficulty}</span>
                <span className="badge badge-gray">{plant.category}</span>
              </div>
              <button onClick={handleSave} disabled={saving} className={`btn ${isSaved ? 'btn-primary' : 'btn-outline'}`} style={{ width: '100%' }}>
                {saving ? <span className="spinner" /> : isSaved ? '❤️ Saved' : '🤍 Save Plant'}
              </button>
            </div>

            <div>
              <p style={{ fontSize: 16, color: 'var(--gray-600)', lineHeight: 1.8, marginBottom: 28 }}>{plant.description}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
                {[
                  { label: 'Harvest Time', value: `${plant.harvestDays?.min}–${plant.harvestDays?.max} days`, icon: '📅' },
                  { label: 'Sun Needed', value: plant.sunRequirement, icon: '☀️' },
                  { label: 'Watering', value: plant.waterFrequency || 'Regular', icon: '💧' },
                  { label: 'Rating', value: `⭐ ${plant.rating}/5`, icon: '🌟' },
                ].map(stat => (
                  <div key={stat.label} style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '16px 14px', border: '1px solid var(--gray-100)', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, marginBottom: 8 }}>{stat.icon}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.05em' }}>{stat.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', textTransform: 'capitalize' }}>{stat.value}</div>
                  </div>
                ))}
              </div>
              {plant.benefits?.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {plant.benefits.map(b => <span key={b} className="tag">{b}</span>)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container" style={{ padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
          <div>
            {/* Growing Steps */}
            {plant.growingSteps?.length > 0 && (
              <Section title="📋 Step-by-Step Growing Guide">
                <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                  {plant.growingSteps.map((s, i) => (
                    <button key={i} onClick={() => setActiveStep(i)} style={{
                      padding: '7px 16px', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 500,
                      border: '1.5px solid', cursor: 'pointer', transition: 'all .2s',
                      borderColor: activeStep === i ? 'var(--green-500)' : 'var(--gray-200)',
                      background: activeStep === i ? 'var(--green-50)' : 'white',
                      color: activeStep === i ? 'var(--green-700)' : 'var(--gray-600)'
                    }}>Step {s.step}</button>
                  ))}
                </div>
                {plant.growingSteps[activeStep] && (
                  <div style={{ background: 'var(--green-50)', borderRadius: 'var(--radius-md)', padding: 24, border: '1px solid var(--green-200)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 10 }}>
                      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--green-800)' }}>{plant.growingSteps[activeStep].title}</h4>
                      {plant.growingSteps[activeStep].duration && (
                        <span className="badge badge-green">{plant.growingSteps[activeStep].duration}</span>
                      )}
                    </div>
                    <p style={{ fontSize: 15, color: 'var(--gray-700)', lineHeight: 1.7 }}>{plant.growingSteps[activeStep].description}</p>
                    <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                      <button disabled={activeStep === 0} onClick={() => setActiveStep(a => a - 1)} className="btn btn-outline btn-sm" style={{ opacity: activeStep === 0 ? .4 : 1 }}>← Prev</button>
                      <button disabled={activeStep === plant.growingSteps.length - 1} onClick={() => setActiveStep(a => a + 1)} className="btn btn-primary btn-sm" style={{ opacity: activeStep === plant.growingSteps.length - 1 ? .4 : 1 }}>Next →</button>
                    </div>
                  </div>
                )}
              </Section>
            )}

            {/* Soil Mix */}
            {soilParts.length > 0 && (
              <Section title="🧪 Soil Mix Recipe">
                <div style={{ background: 'var(--green-50)', borderRadius: 'var(--radius-md)', padding: 20, marginBottom: 16, border: '1px solid var(--green-200)' }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--green-800)', marginBottom: 4 }}>Recipe</p>
                  <p style={{ fontSize: 14, color: 'var(--gray-600)' }}>{plant.soilMix?.recipe}</p>
                </div>
                {soilParts.map(comp => (
                  <div key={comp.name} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{comp.name}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-700)' }}>{comp.percentage}%</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--gray-100)', borderRadius: 4 }}>
                      <div style={{ width: `${comp.percentage}%`, height: '100%', background: 'var(--green-500)', borderRadius: 4, transition: 'width 1s' }} />
                    </div>
                  </div>
                ))}
              </Section>
            )}

            {/* Fertilizer */}
            {plant.fertilizerSchedule?.length > 0 && (
              <Section title="💊 Fertilizer Schedule">
                {plant.fertilizerSchedule.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16, padding: '16px 0', borderBottom: i < plant.fertilizerSchedule.length - 1 ? '1px solid var(--gray-100)' : 'none' }}>
                    <div style={{ width: 60, height: 60, borderRadius: 'var(--radius-md)', background: 'var(--amber-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>💊</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Week {f.weekFrom}–{f.weekTo}: {f.fertilizer}</div>
                      <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>Amount: <strong>{f.amount}</strong></div>
                      {f.notes && <div style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 4, fontStyle: 'italic' }}>{f.notes}</div>}
                    </div>
                  </div>
                ))}
              </Section>
            )}

            {/* Common Problems */}
            {plant.commonProblems?.length > 0 && (
              <Section title="⚠️ Common Problems & Solutions">
                {plant.commonProblems.map((p, i) => (
                  <div key={i} style={{ background: '#fff7f0', borderRadius: 'var(--radius-md)', padding: 18, marginBottom: 12, border: '1px solid #fed7aa' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 16 }}>⚠️</span>
                      <strong style={{ fontSize: 15, color: 'var(--gray-800)' }}>{p.problem}</strong>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 6 }}><strong>Cause:</strong> {p.cause}</p>
                    <p style={{ fontSize: 13, color: 'var(--green-700)' }}><strong>Fix:</strong> {p.solution}</p>
                  </div>
                ))}
              </Section>
            )}
          </div>

          {/* Sidebar */}
          <div>
            {/* Compatible Containers */}
            {plant.compatibleContainers?.length > 0 && (
              <div className="card" style={{ padding: 22, marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, marginBottom: 16 }}>📦 Compatible Containers</h3>
                {plant.compatibleContainers.map((c, i) => (
                  <div key={i} style={{ padding: '12px 0', borderBottom: i < plant.compatibleContainers.length - 1 ? '1px solid var(--gray-100)' : 'none' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, textTransform: 'capitalize' }}>✅ {c.type}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Min: {c.minSize}</div>
                    {c.notes && <div style={{ fontSize: 12, color: 'var(--green-700)', marginTop: 4 }}>{c.notes}</div>}
                  </div>
                ))}
              </div>
            )}

            {/* Season calendar */}
            {plant.seasons?.length > 0 && (
              <div className="card" style={{ padding: 22, marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, marginBottom: 16 }}>📅 Best Seasons</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {plant.seasons.map(s => <span key={s} className="badge badge-green" style={{ textTransform: 'capitalize' }}>{s}</span>)}
                </div>
              </div>
            )}

            {/* Quick CTA */}
            <div style={{ background: 'linear-gradient(135deg, var(--green-600), var(--green-800))', borderRadius: 'var(--radius-lg)', padding: 24, color: 'white', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{plant.emoji}</div>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 10 }}>Ready to Grow {plant.name}?</h4>
              <p style={{ fontSize: 13, opacity: .8, marginBottom: 18, lineHeight: 1.6 }}>Add to your garden and track growth, get reminders & more.</p>
              <Link to="/my-garden" className="btn" style={{ background: 'white', color: 'var(--green-800)', fontWeight: 600, width: '100%', justifyContent: 'center' }}>
                Add to My Garden →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantDetailPage;
