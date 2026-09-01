import React, { useState } from 'react';
import { matchPlants } from '../utils/api';
import PlantCard from '../components/PlantCard';
import toast from 'react-hot-toast';

const CONTAINER_TYPES = [
  { value: 'bottle', emoji: '🍾', label: 'Plastic Bottle', sizes: ['500ml', '1L', '2L', '5L'] },
  { value: 'bucket', emoji: '🪣', label: 'Bucket / Tub', sizes: ['5L', '10L', '15L', '20L'] },
  { value: 'pipe', emoji: '🔧', label: 'PVC Pipe', sizes: ['2 inch', '4 inch', '6 inch'] },
  { value: 'grow-bag', emoji: '🛍️', label: 'Grow Bag', sizes: ['3L', '5L', '10L', '15L', '25L'] },
  { value: 'pot', emoji: '🪴', label: 'Clay/Plastic Pot', sizes: ['4 inch', '6 inch', '8 inch', '12 inch', '18 inch'] },
  { value: 'tray', emoji: '📦', label: 'Tray / Window Box', sizes: ['Small', 'Medium', 'Large'] },
];

const SUN_OPTIONS = [
  { value: 2, label: '2-3 hours', icon: '🌥️', desc: 'Mostly shade' },
  { value: 4, label: '4-5 hours', icon: '⛅', desc: 'Partial sun' },
  { value: 6, label: '6+ hours', icon: '☀️', desc: 'Full sun' },
];

const SEASONS = [
  { value: 'spring', label: 'Spring', icon: '🌸' },
  { value: 'summer', label: 'Summer', icon: '☀️' },
  { value: 'monsoon', label: 'Monsoon', icon: '🌧️' },
  { value: 'autumn', label: 'Autumn', icon: '🍂' },
  { value: 'winter', label: 'Winter', icon: '❄️' },
];

const EXPERIENCE_OPTIONS = [
  { value: 'beginner', label: 'Beginner', desc: 'First time growing' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Some experience' },
  { value: 'expert', label: 'Expert', desc: 'Experienced farmer' },
];

const ContainerMatcherPage = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ containerType: '', size: '', sunHours: 4, season: 'summer', experience: 'beginner' });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleMatch = async () => {
    if (!form.containerType) { toast.error('Please select a container type'); return; }
    setLoading(true);
    try {
      const res = await matchPlants({ containerType: form.containerType, sunHours: form.sunHours, season: form.season, experience: form.experience });
      setResults(res.data.plants);
      setStep(4);
    } catch { toast.error('Matching failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const selectedContainer = CONTAINER_TYPES.find(c => c.value === form.containerType);

  const StepIndicator = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 40 }}>
      {[1, 2, 3].map((s, i) => (
        <React.Fragment key={s}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 600, transition: 'all .3s',
            background: step > s ? 'var(--green-600)' : step === s ? 'var(--green-600)' : 'var(--gray-200)',
            color: step >= s ? 'white' : 'var(--gray-500)'
          }}>{step > s ? '✓' : s}</div>
          {i < 2 && <div style={{ flex: 1, height: 2, background: step > s ? 'var(--green-500)' : 'var(--gray-200)', transition: 'all .3s', maxWidth: 80 }} />}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div style={{ paddingTop: 'var(--nav-height)', background: 'var(--cream)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--green-50), white)', padding: '48px 0 40px', borderBottom: '1px solid var(--gray-100)' }}>
        <div className="container">
          <p className="section-label">AI-Powered Tool</p>
          <h1 className="page-title">Container Matcher</h1>
          <p className="page-sub">Tell us what containers you have and we'll find the perfect plants for them.</p>
        </div>
      </div>

      <div className="container-sm" style={{ padding: '48px 24px' }}>
        {step < 4 ? (
          <div className="card" style={{ padding: 40 }}>
            <StepIndicator />

            {/* Step 1: Container Type */}
            {step === 1 && (
              <div className="animate-fadeIn">
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 8 }}>What container do you have?</h2>
                <p style={{ fontSize: 14, color: 'var(--gray-400)', marginBottom: 28 }}>Pick the type that matches what you have at home.</p>
                <div className="grid-3" style={{ gap: 14 }}>
                  {CONTAINER_TYPES.map(c => (
                    <button key={c.value} onClick={() => setField('containerType', c.value)} style={{
                      padding: '20px 14px', borderRadius: 'var(--radius-lg)', textAlign: 'center',
                      border: `2px solid ${form.containerType === c.value ? 'var(--green-500)' : 'var(--gray-200)'}`,
                      background: form.containerType === c.value ? 'var(--green-50)' : 'white',
                      cursor: 'pointer', transition: 'all .2s'
                    }}>
                      <div style={{ fontSize: 36, marginBottom: 8 }}>{c.emoji}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: form.containerType === c.value ? 'var(--green-700)' : 'var(--gray-700)' }}>{c.label}</div>
                    </button>
                  ))}
                </div>
                <button disabled={!form.containerType} onClick={() => setStep(2)} className="btn btn-primary btn-lg" style={{ marginTop: 32, opacity: form.containerType ? 1 : .4 }}>
                  Next →
                </button>
              </div>
            )}

            {/* Step 2: Sun & Season */}
            {step === 2 && (
              <div className="animate-fadeIn">
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 8 }}>Sun & Season</h2>
                <p style={{ fontSize: 14, color: 'var(--gray-400)', marginBottom: 28 }}>How much direct sunlight does your space get?</p>

                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, color: 'var(--gray-700)' }}>Daily Sunlight Hours</h3>
                  <div style={{ display: 'flex', gap: 14 }}>
                    {SUN_OPTIONS.map(s => (
                      <button key={s.value} onClick={() => setField('sunHours', s.value)} style={{
                        flex: 1, padding: '18px 12px', borderRadius: 'var(--radius-lg)', textAlign: 'center',
                        border: `2px solid ${form.sunHours === s.value ? 'var(--green-500)' : 'var(--gray-200)'}`,
                        background: form.sunHours === s.value ? 'var(--green-50)' : 'white',
                        cursor: 'pointer', transition: 'all .2s'
                      }}>
                        <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>{s.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, color: 'var(--gray-700)' }}>Current Season</h3>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {SEASONS.map(s => (
                      <button key={s.value} onClick={() => setField('season', s.value)} style={{
                        padding: '10px 18px', borderRadius: 'var(--radius-full)', fontSize: 14,
                        border: `1.5px solid ${form.season === s.value ? 'var(--green-500)' : 'var(--gray-200)'}`,
                        background: form.season === s.value ? 'var(--green-50)' : 'white',
                        cursor: 'pointer', transition: 'all .2s', fontWeight: 500
                      }}>
                        {s.icon} {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setStep(1)} className="btn btn-ghost">← Back</button>
                  <button onClick={() => setStep(3)} className="btn btn-primary btn-lg">Next →</button>
                </div>
              </div>
            )}

            {/* Step 3: Experience */}
            {step === 3 && (
              <div className="animate-fadeIn">
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 8 }}>Your Experience Level</h2>
                <p style={{ fontSize: 14, color: 'var(--gray-400)', marginBottom: 28 }}>We'll recommend plants that match your skill level.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                  {EXPERIENCE_OPTIONS.map(e => (
                    <button key={e.value} onClick={() => setField('experience', e.value)} style={{
                      padding: '18px 20px', borderRadius: 'var(--radius-lg)', textAlign: 'left',
                      border: `2px solid ${form.experience === e.value ? 'var(--green-500)' : 'var(--gray-200)'}`,
                      background: form.experience === e.value ? 'var(--green-50)' : 'white',
                      cursor: 'pointer', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 16
                    }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${form.experience === e.value ? 'var(--green-500)' : 'var(--gray-300)'}`, background: form.experience === e.value ? 'var(--green-500)' : 'white', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600 }}>{e.label}</div>
                        <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>{e.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Summary */}
                <div style={{ background: 'var(--green-50)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 24, border: '1px solid var(--green-200)' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-800)', marginBottom: 8 }}>Your selection:</p>
                  <p style={{ fontSize: 13, color: 'var(--gray-600)' }}>
                    {selectedContainer?.emoji} {selectedContainer?.label} · {form.sunHours} hrs sun · {form.season} · {form.experience}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setStep(2)} className="btn btn-ghost">← Back</button>
                  <button onClick={handleMatch} disabled={loading} className="btn btn-primary btn-lg">
                    {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Matching...</> : '🌿 Find My Plants'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Results */
          <div className="animate-slideUp">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 4 }}>🎉 Perfect Matches!</h2>
                <p style={{ fontSize: 14, color: 'var(--gray-400)' }}>
                  Best plants for your {selectedContainer?.emoji} {selectedContainer?.label}
                </p>
              </div>
              <button onClick={() => { setStep(1); setResults([]); }} className="btn btn-outline">Start Over</button>
            </div>

            {results.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🌵</div>
                <h3>No exact matches found</h3>
                <p>Try different sun hours or season settings</p>
                <button className="btn btn-primary" onClick={() => setStep(1)}>Try Again</button>
              </div>
            ) : (
              <div className="grid-3" style={{ marginBottom: 40 }}>
                {results.map(p => <PlantCard key={p._id} plant={p} showMatch />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContainerMatcherPage;
