import React, { useState } from 'react';
import { matchPlants } from '../utils/api';
import PlantCard from '../components/PlantCard';
import toast from 'react-hot-toast';

const CONTAINER_TYPES = [
  {
    value: 'bottle', emoji: '🍾', label: 'Plastic Bottle / Jug',
    sizes: ['500ml', '1.5L', '2L', '5L Can'],
    diyTips: 'Cut top off or slice side horizontally. Drill 4-6 holes at base for drainage. Wrap in foil/paper to block heat.',
    bestFor: 'Mint, Coriander, Methi, Microgreens'
  },
  {
    value: 'bucket', emoji: '🪣', label: 'Bucket / Paint Tub',
    sizes: ['5L', '10L', '15L', '20L Heavy'],
    diyTips: 'Drill 8-10 holes at the bottom. Add 1 inch gravel layer. Paint white to reflect summer heat.',
    bestFor: 'Tomato, Chilli, Brinjal, Okra, Moringa'
  },
  {
    value: 'pipe', emoji: '🔧', label: 'PVC Pipe / Gutter',
    sizes: ['3 inch', '4 inch', '6 inch Wide'],
    diyTips: 'Cut 3-inch circular planting holes every 6 inches. Seal pipe caps & drill bottom drainage slits.',
    bestFor: 'Spinach, Lettuce, Strawberry, Herbs'
  },
  {
    value: 'grow-bag', emoji: '🛍️', label: 'Fabric Grow Bag',
    sizes: ['3L', '5L', '10L', '15L', '25L Tree'],
    diyTips: 'No drilling needed! Fabric naturally air-prunes roots and prevents root circling & waterlogging.',
    bestFor: 'All Vegetables, Fruit Trees, Root Crops'
  },
  {
    value: 'pot', emoji: '🪴', label: 'Clay / Plastic Pot',
    sizes: ['6 inch', '8 inch', '10 inch', '14 inch', '18 inch'],
    diyTips: 'Place a broken clay piece (tikli) over the drainage hole before filling with soil mix.',
    bestFor: 'Rose, Jasmine, Tulsi, Hibiscus, Aloe'
  },
  {
    value: 'tray', emoji: '📦', label: 'Tray / Window Box',
    sizes: ['Shallow 8cm', 'Medium 15cm', 'Deep 20cm'],
    diyTips: 'Line with plastic sheet if wooden. Drill holes every 10cm. Ideal for high-density leaf crops.',
    bestFor: 'Fenugreek (Methi), Palak, Microgreens, Radish'
  },
];

const SUN_OPTIONS = [
  { value: 2, label: '2-3 hours', icon: '🌥️', desc: 'Balcony with partial shade' },
  { value: 4, label: '4-5 hours', icon: '⛅', desc: 'Morning sun exposure' },
  { value: 6, label: '6+ hours', icon: '☀️', desc: 'Full rooftop direct sun' },
];

const SEASONS = [
  { value: 'spring', label: 'Spring', icon: '🌸' },
  { value: 'summer', label: 'Summer', icon: '☀️' },
  { value: 'monsoon', label: 'Monsoon', icon: '🌧️' },
  { value: 'autumn', label: 'Autumn', icon: '🍂' },
  { value: 'winter', label: 'Winter', icon: '❄️' },
];

const EXPERIENCE_OPTIONS = [
  { value: 'beginner', label: '🌱 Beginner', desc: 'First time rooftop gardener — easy, forgiving plants' },
  { value: 'intermediate', label: '🌿 Intermediate', desc: 'Have grown herbs or veggies before' },
  { value: 'expert', label: '🌳 Expert', desc: 'Experienced terrace farmer — ready for any crop' },
];

const DIY_UPCYCLING_HACKS = [
  { title: '🛢️ 5L Cooking Oil Cans', tip: 'Wash thoroughly with soap. Cut top handle off. Yields a durable 5L planter for Chillies & Capsicum.' },
  { title: '📦 Thermocol Fish/Fruit Crates', tip: 'Super lightweight & insulating! Excellent for growing Spinach, Methi, and Radish in high summer heat.' },
  { title: '🥛 2L Milk Cartons', tip: 'Cut top, poke 4 bottom holes. Perfect 100% free windowsill pot for Mint and Coriander.' },
  { title: '🛍️ Old Shopping Tote Bags', tip: 'Breathable canvas or jute bags work just like commercial grow bags. Great for potatoes & peanuts.' },
];

const ContainerMatcherPage = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ containerType: '', size: '', sunHours: 4, season: 'summer', experience: 'beginner' });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showHacks, setShowHacks] = useState(false);

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleMatch = async () => {
    if (!form.containerType) { toast.error('Please select a container type'); return; }
    setLoading(true);
    try {
      const res = await matchPlants({
        containerType: form.containerType,
        sunHours: form.sunHours,
        season: form.season,
        experience: form.experience
      });
      setResults(res.data.plants);
      setStep(4);
    } catch {
      toast.error('Matching failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedContainer = CONTAINER_TYPES.find(c => c.value === form.containerType);

  const StepIndicator = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
      {[1, 2, 3].map((s, i) => (
        <React.Fragment key={s}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, transition: 'all .3s',
            background: step > s ? 'var(--green-600)' : step === s ? 'var(--green-600)' : 'var(--gray-200)',
            color: step >= s ? 'white' : 'var(--gray-500)',
            boxShadow: step === s ? '0 4px 12px rgba(22,163,74,0.3)' : 'none'
          }}>{step > s ? '✓' : s}</div>
          {i < 2 && <div style={{ flex: 1, height: 3, background: step > s ? 'var(--green-500)' : 'var(--gray-200)', transition: 'all .3s', maxWidth: 100 }} />}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div style={{ paddingTop: 'var(--nav-height)', background: 'var(--cream)', minHeight: '100vh', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)', padding: '48px 0 40px', borderBottom: '1px solid var(--gray-100)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p className="section-label">🪴 Smart Terrace Matcher</p>
              <h1 className="page-title">Smart Container Matcher</h1>
              <p className="page-sub">Select the pots, buckets, or household waste containers you have — we'll match the best crops & DIY prep tips!</p>
            </div>
            <button
              onClick={() => setShowHacks(!showHacks)}
              style={{
                padding: '10px 18px', borderRadius: 20, background: '#fefce8', border: '1.5px solid #fef08a',
                color: '#854d0e', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              💡 {showHacks ? 'Hide DIY Hacks' : 'DIY Upcycling Hacks'}
            </button>
          </div>

          {/* Upcycling Hacks Drawer */}
          {showHacks && (
            <div className="animate-fadeIn" style={{ marginTop: 24, background: 'white', borderRadius: 16, padding: 24, border: '1px solid #fef08a', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: '#854d0e', margin: '0 0 14px' }}>
                ♻️ Household Waste to Planter Hacks
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                {DIY_UPCYCLING_HACKS.map((h, idx) => (
                  <div key={idx} style={{ background: '#fefce8', borderRadius: 12, padding: 14, border: '1px solid #fef08a' }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: '#713f12', margin: '0 0 6px' }}>{h.title}</p>
                    <p style={{ fontSize: 12, color: '#854d0e', margin: 0, lineHeight: 1.5 }}>{h.tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container-sm" style={{ padding: '40px 24px' }}>
        {step < 4 ? (
          <div className="card" style={{ padding: 36, borderRadius: 20 }}>
            <StepIndicator />

            {/* Step 1: Container Selection */}
            {step === 1 && (
              <div className="animate-fadeIn">
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 6 }}>1. What container do you have?</h2>
                <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 24 }}>Pick any pot or recycled household item you want to grow in.</p>
                
                <div className="grid-3" style={{ gap: 14, marginBottom: 24 }}>
                  {CONTAINER_TYPES.map(c => {
                    const isSel = form.containerType === c.value;
                    return (
                      <button key={c.value} onClick={() => { setField('containerType', c.value); setField('size', c.sizes[0]); }} style={{
                        padding: '20px 14px', borderRadius: 16, textAlign: 'center',
                        border: `2px solid ${isSel ? 'var(--green-600)' : 'var(--gray-200)'}`,
                        background: isSel ? '#f0fdf4' : 'white',
                        cursor: 'pointer', transition: 'all .2s',
                        boxShadow: isSel ? '0 4px 16px rgba(22,163,74,0.15)' : 'none'
                      }}>
                        <div style={{ fontSize: 40, marginBottom: 8 }}>{c.emoji}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: isSel ? 'var(--green-800)' : 'var(--gray-800)', marginBottom: 4 }}>{c.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{c.bestFor.split(',')[0]}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Container Preparation Info */}
                {selectedContainer && (
                  <div style={{ background: '#f0fdf4', borderRadius: 14, padding: 20, marginBottom: 24, border: '1px solid #bbf7d0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 24 }}>{selectedContainer.emoji}</span>
                      <div>
                        <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--green-900)', margin: 0 }}>
                          {selectedContainer.label} — Preparation & DIY Tips
                        </h4>
                        <span style={{ fontSize: 12, color: 'var(--green-700)', fontWeight: 600 }}>Best For: {selectedContainer.bestFor}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: '#166534', margin: '8px 0 14px', lineHeight: 1.6, background: 'white', padding: 12, borderRadius: 10, border: '1px solid #bbf7d0' }}>
                      <strong>🛠️ DIY Prep Guide:</strong> {selectedContainer.diyTips}
                    </p>

                    {/* Size Selector */}
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--green-800)', marginBottom: 8, textTransform: 'uppercase' }}>Select Your Container Size:</p>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {selectedContainer.sizes.map(s => (
                          <button
                            key={s}
                            onClick={() => setField('size', s)}
                            style={{
                              padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700,
                              border: '1.5px solid', cursor: 'pointer', transition: 'all .2s',
                              borderColor: form.size === s ? 'var(--green-600)' : 'var(--gray-300)',
                              background: form.size === s ? 'var(--green-600)' : 'white',
                              color: form.size === s ? 'white' : 'var(--gray-700)',
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <button disabled={!form.containerType} onClick={() => setStep(2)} className="btn btn-primary btn-lg" style={{ width: '100%', opacity: form.containerType ? 1 : .4, justifyContent: 'center' }}>
                  Next: Sunlight & Season →
                </button>
              </div>
            )}

            {/* Step 2: Sunlight & Season */}
            {step === 2 && (
              <div className="animate-fadeIn">
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 6 }}>2. Sunlight & Season</h2>
                <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 28 }}>Tell us about the direct sunlight your growing area gets.</p>

                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: 'var(--gray-800)' }}>☀️ Daily Direct Sunlight Hours</h3>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {SUN_OPTIONS.map(s => {
                      const isSel = form.sunHours === s.value;
                      return (
                        <button key={s.value} onClick={() => setField('sunHours', s.value)} style={{
                          flex: 1, padding: '18px 12px', borderRadius: 16, textAlign: 'center',
                          border: `2px solid ${isSel ? 'var(--green-600)' : 'var(--gray-200)'}`,
                          background: isSel ? '#f0fdf4' : 'white',
                          cursor: 'pointer', transition: 'all .2s'
                        }}>
                          <div style={{ fontSize: 32, marginBottom: 6 }}>{s.icon}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: isSel ? 'var(--green-800)' : 'var(--gray-800)' }}>{s.label}</div>
                          <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 4 }}>{s.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: 'var(--gray-800)' }}>📅 Planting Season</h3>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {SEASONS.map(s => {
                      const isSel = form.season === s.value;
                      return (
                        <button key={s.value} onClick={() => setField('season', s.value)} style={{
                          padding: '10px 20px', borderRadius: 20, fontSize: 14, fontWeight: 700,
                          border: `1.5px solid ${isSel ? 'var(--green-600)' : 'var(--gray-300)'}`,
                          background: isSel ? 'var(--green-600)' : 'white',
                          color: isSel ? 'white' : 'var(--gray-700)',
                          cursor: 'pointer', transition: 'all .2s'
                        }}>
                          {s.icon} {s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setStep(1)} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>← Back</button>
                  <button onClick={() => setStep(3)} className="btn btn-primary btn-lg" style={{ flex: 2, justifyContent: 'center' }}>Next: Skill Level →</button>
                </div>
              </div>
            )}

            {/* Step 3: Skill Level & Match Execution */}
            {step === 3 && (
              <div className="animate-fadeIn">
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 6 }}>3. Your Gardening Experience</h2>
                <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 24 }}>We will prioritize plants that match your experience level.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                  {EXPERIENCE_OPTIONS.map(e => {
                    const isSel = form.experience === e.value;
                    return (
                      <button key={e.value} onClick={() => setField('experience', e.value)} style={{
                        padding: '18px 20px', borderRadius: 16, textAlign: 'left',
                        border: `2px solid ${isSel ? 'var(--green-600)' : 'var(--gray-200)'}`,
                        background: isSel ? '#f0fdf4' : 'white',
                        cursor: 'pointer', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 16
                      }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: '50%',
                          border: `2px solid ${isSel ? 'var(--green-600)' : 'var(--gray-300)'}`,
                          background: isSel ? 'var(--green-600)' : 'white',
                          flexShrink: 0
                        }} />
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: isSel ? 'var(--green-900)' : 'var(--gray-800)' }}>{e.label}</div>
                          <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>{e.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Summary Box */}
                <div style={{ background: '#f8fafc', borderRadius: 14, padding: 18, marginBottom: 28, border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: 6 }}>📋 Matching Criteria Summary:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 8, background: 'white', border: '1px solid #cbd5e1', fontWeight: 600 }}>
                      {selectedContainer?.emoji} {selectedContainer?.label} ({form.size})
                    </span>
                    <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 8, background: 'white', border: '1px solid #cbd5e1', fontWeight: 600 }}>
                      ☀️ {form.sunHours} hrs Sun
                    </span>
                    <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 8, background: 'white', border: '1px solid #cbd5e1', fontWeight: 600 }}>
                      📅 {form.season}
                    </span>
                    <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 8, background: 'white', border: '1px solid #cbd5e1', fontWeight: 600 }}>
                      {form.experience}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setStep(2)} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>← Back</button>
                  <button onClick={handleMatch} disabled={loading} className="btn btn-primary btn-lg" style={{ flex: 2, justifyContent: 'center' }}>
                    {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Matching Plants...</> : '🌿 Find Compatible Plants'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Results Section */
          <div className="animate-slideUp">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, margin: '0 0 4px' }}>🎉 Compatible Plants Found!</h2>
                <p style={{ fontSize: 14, color: 'var(--gray-500)', margin: 0 }}>
                  Matched for your <strong>{selectedContainer?.emoji} {selectedContainer?.label} ({form.size})</strong> with <strong>{form.sunHours} hrs sun</strong>.
                </p>
              </div>
              <button onClick={() => { setStep(1); setResults([]); }} className="btn btn-outline">
                🔄 Change Container
              </button>
            </div>

            {results.length === 0 ? (
              <div className="empty-state" style={{ background: 'white', padding: 40, borderRadius: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🌵</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>No exact matches found</h3>
                <p style={{ color: 'var(--gray-500)', marginBottom: 20 }}>Try adjusting your sun hours or container size setting.</p>
                <button className="btn btn-primary" onClick={() => setStep(1)}>Try Matcher Again</button>
              </div>
            ) : (
              <div className="grid-3" style={{ marginBottom: 40 }}>
                {results.map(p => (
                  <div key={p._id} style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute', top: 12, right: 12, zIndex: 10,
                      background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white',
                      fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 20,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}>
                      🎯 {p.matchScore || 95}% Match
                    </div>
                    <PlantCard plant={p} showMatch />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContainerMatcherPage;
