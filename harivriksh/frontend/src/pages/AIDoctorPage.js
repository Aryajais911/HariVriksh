import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiDiagnose, aiRecommend, uploadMultiple } from '../utils/api';
import toast from 'react-hot-toast';

const SYMPTOM_EXAMPLES = [
  'Leaves are turning yellow from edges',
  'White powdery coating on leaves',
  'Plant is wilting despite watering',
  'Brown spots on leaves',
  'Leaves curling inward',
  'Fruits not setting / flowers dropping',
];

const AIDoctorPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('diagnose');
  const [plantName, setPlantName] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState('');
  const [diagnosing, setDiagnosing] = useState(false);

  const [recForm, setRecForm] = useState({ city: '', sunHours: 4, containerType: '', experience: 'beginner', season: 'summer' });
  const [recResult, setRecResult] = useState('');
  const [recommending, setRecommending] = useState(false);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (images.length + files.length > 3) {
      toast.error('Upload up to 3 leaf photos max');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    files.forEach(f => formData.append('images', f));
    try {
      const res = await uploadMultiple(formData);
      if (res.data?.success && res.data.images) {
        const urls = res.data.images.map(img => img.url);
        setImages(prev => [...prev, ...urls]);
        toast.success(`${urls.length} leaf photo(s) attached!`);
      }
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleDiagnose = async () => {
    if (!symptoms.trim() && images.length === 0) {
      toast.error('Please describe symptoms or attach a photo');
      return;
    }
    setDiagnosing(true);
    setDiagnosisResult('');
    try {
      const res = await aiDiagnose({
        plantName,
        symptoms,
        imageUrl: images[0] || undefined
      });
      setDiagnosisResult(res.data.diagnosis);
    } catch {
      toast.error('AI service unavailable. Using organic pathology fallback.');
    } finally {
      setDiagnosing(false);
    }
  };

  const handleRecommend = async () => {
    setRecommending(true);
    setRecResult('');
    try {
      const res = await aiRecommend(recForm);
      setRecResult(res.data.recommendations);
    } catch { toast.error('AI service unavailable.'); }
    finally { setRecommending(false); }
  };

  const formatDiagnosis = (text) => {
    if (!text) return null;
    const lines = text.split('\n').filter(Boolean);
    return lines.map((line, i) => {
      const isHeader = line.startsWith('PROBLEM:') || line.startsWith('CAUSE:') || line.startsWith('FIX:') || line.startsWith('PREVENT:');
      if (isHeader) {
        const [label, ...rest] = line.split(':');
        const colors = { PROBLEM: '#dc2626', CAUSE: '#d97706', FIX: '#16a34a', PREVENT: '#2563eb' };
        const bgs = { PROBLEM: '#fee2e2', CAUSE: '#fef3c7', FIX: '#dcfce7', PREVENT: '#dbeafe' };
        return (
          <div key={i} style={{ background: bgs[label] || '#f9fafb', borderRadius: 10, padding: '12px 14px', marginBottom: 10 }}>
            <span style={{ fontWeight: 700, color: colors[label] || '#374151', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 4 }}>{label}</span>
            <span style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{rest.join(':').trim()}</span>
          </div>
        );
      }
      return <p key={i} style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 6 }}>{line}</p>;
    });
  };

  return (
    <div style={{ paddingTop: 'var(--nav-height)', background: 'var(--cream)', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg, var(--green-50), white)', padding: '48px 0 40px', borderBottom: '1px solid var(--gray-100)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', background: 'var(--green-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🤖</div>
            <div>
              <p className="section-label">AI Doctor & Pathology Assistant</p>
              <h1 className="page-title" style={{ marginBottom: 0 }}>AI Plant Doctor & Disease Scanner</h1>
            </div>
          </div>
          <p className="page-sub">Upload leaf photos or describe symptoms to diagnose plant diseases & get organic treatments instantly.</p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {[
            { key: 'diagnose', label: '🔬 Plant Doctor & Photo Scanner', desc: 'Diagnose problems' },
            { key: 'recommend', label: '🎯 Get Recommendations', desc: 'Personalized plants' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              padding: '12px 24px', borderRadius: 'var(--radius-full)', fontWeight: 500, cursor: 'pointer',
              border: '1.5px solid', transition: 'all .2s', fontSize: 14,
              borderColor: activeTab === tab.key ? 'var(--green-500)' : 'var(--gray-200)',
              background: activeTab === tab.key ? 'var(--green-600)' : 'white',
              color: activeTab === tab.key ? 'white' : 'var(--gray-600)'
            }}>{tab.label}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, alignItems: 'start' }}>
          {/* DIAGNOSE TAB */}
          {activeTab === 'diagnose' && (
            <>
              <div className="card" style={{ padding: 28 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 20 }}>🔬 Describe Symptoms or Upload Photo</h3>

                <div className="form-group">
                  <label className="form-label">Plant Name (optional)</label>
                  <input value={plantName} onChange={e => setPlantName(e.target.value)} placeholder="e.g. Tomato, Mint, Chilli..." />
                </div>

                <div className="form-group">
                  <label className="form-label">Describe the Symptoms *</label>
                  <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} placeholder="Describe leaf color, spots, wilting, curling, insects..." rows={3} style={{ resize: 'none' }} />
                </div>

                {/* Photo Upload Input */}
                <div className="form-group" style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1.5px dashed #cbd5e1', marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)' }}>📷 Leaf / Plant Photo</span>
                      <p style={{ fontSize: 11, color: 'var(--gray-500)', margin: '2px 0 0' }}>Attach photos for visual AI analysis</p>
                    </div>
                    <label style={{ padding: '6px 14px', borderRadius: 20, background: 'var(--green-600)', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      {uploading ? 'Uploading...' : '📁 Attach Photo'}
                      <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} style={{ display: 'none' }} />
                    </label>
                  </div>
                  {images.length > 0 && (
                    <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                      {images.map((img, idx) => (
                        <div key={idx} style={{ position: 'relative', width: 64, height: 64, borderRadius: 8, overflow: 'hidden', border: '2px solid var(--green-500)' }}>
                          <img src={img} alt={`Leaf photo ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button type="button" onClick={() => removeImage(idx)} style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 800 }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 8 }}>Quick symptom examples:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {SYMPTOM_EXAMPLES.map(s => (
                      <button key={s} onClick={() => setSymptoms(s)} style={{
                        padding: '5px 12px', borderRadius: 'var(--radius-full)', fontSize: 11,
                        border: '1px solid var(--gray-200)', background: 'var(--gray-50)',
                        cursor: 'pointer', color: 'var(--gray-600)', transition: 'all .15s'
                      }}>{s}</button>
                    ))}
                  </div>
                </div>

                <button onClick={handleDiagnose} disabled={diagnosing || (!symptoms.trim() && !images.length)} className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', opacity: (!symptoms.trim() && !images.length) ? .5 : 1 }}>
                  {diagnosing ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Diagnosing with AI...</> : '🔬 Diagnose Problem Now'}
                </button>
              </div>

              <div>
                {diagnosisResult ? (
                  <div className="card" style={{ padding: 28 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16 }}>
                      🤖 AI Diagnosis & Treatment Plan
                    </h3>
                    {formatDiagnosis(diagnosisResult)}

                    <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
                      <button onClick={() => navigate('/community/new')} className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center', borderColor: '#86efac', color: '#166534', background: '#f0fdf4' }}>
                        💬 Ask Community Helpline
                      </button>
                      <button onClick={() => setDiagnosisResult('')} className="btn btn-ghost btn-sm">
                        Diagnose Another
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="card" style={{ padding: 28, textAlign: 'center' }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>🔬</div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 10 }}>AI Plant Pathology & Organic Scanner</h3>
                    <p style={{ fontSize: 14, color: 'var(--gray-400)', lineHeight: 1.7 }}>
                      Upload leaf photos or select symptoms to receive immediate organic diagnosis, causes, 100% natural home remedies, and prevention tips.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* RECOMMEND TAB */}
          {activeTab === 'recommend' && (
            <>
              <div className="card" style={{ padding: 28 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 20 }}>🎯 Your Garden Details</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Your City</label>
                    <input value={recForm.city} onChange={e => setRecForm(p => ({ ...p, city: e.target.value }))} placeholder="Delhi, Mumbai, Bangalore..." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Daily Sun Hours</label>
                    <select value={recForm.sunHours} onChange={e => setRecForm(p => ({ ...p, sunHours: parseInt(e.target.value) }))}>
                      <option value={2}>2-3 hours (Shade)</option>
                      <option value={4}>4-5 hours (Partial)</option>
                      <option value={6}>6+ hours (Full Sun)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Container You Have</label>
                    <select value={recForm.containerType} onChange={e => setRecForm(p => ({ ...p, containerType: e.target.value }))}>
                      <option value="">Any container</option>
                      <option value="bottle">Plastic Bottle</option>
                      <option value="bucket">Old Bucket</option>
                      <option value="grow-bag">Grow Bag</option>
                      <option value="pipe">PVC Pipe</option>
                      <option value="pot">Clay/Plastic Pot</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Current Season</label>
                    <select value={recForm.season} onChange={e => setRecForm(p => ({ ...p, season: e.target.value }))}>
                      <option value="summer">Summer</option>
                      <option value="monsoon">Monsoon</option>
                      <option value="autumn">Autumn</option>
                      <option value="winter">Winter</option>
                      <option value="spring">Spring</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Your Experience</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {['beginner', 'intermediate', 'expert'].map(exp => (
                      <button key={exp} onClick={() => setRecForm(p => ({ ...p, experience: exp }))} style={{
                        flex: 1, padding: '9px', borderRadius: 'var(--radius-md)', fontSize: 13, cursor: 'pointer', textTransform: 'capitalize',
                        border: `1.5px solid ${recForm.experience === exp ? 'var(--green-500)' : 'var(--gray-200)'}`,
                        background: recForm.experience === exp ? 'var(--green-50)' : 'white',
                        color: recForm.experience === exp ? 'var(--green-700)' : 'var(--gray-600)'
                      }}>{exp}</button>
                    ))}
                  </div>
                </div>

                <button onClick={handleRecommend} disabled={recommending} className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                  {recommending ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Getting AI Recommendations...</> : '🎯 Get My Recommendations'}
                </button>
              </div>

              <div>
                {recResult ? (
                  <div className="card" style={{ padding: 28 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 20 }}>🤖 AI Recommendations for You</h3>
                    <div style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{recResult}</div>
                    <button onClick={() => setRecResult('')} className="btn btn-ghost btn-sm" style={{ marginTop: 16 }}>Get New Recommendations</button>
                  </div>
                ) : (
                  <div className="card" style={{ padding: 28, textAlign: 'center' }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>🎯</div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 10 }}>Personalized for You</h3>
                    <p style={{ fontSize: 14, color: 'var(--gray-400)', lineHeight: 1.7 }}>
                      Fill in your details and the AI will pick the best 3 plants from our database that perfectly match your conditions and experience level.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIDoctorPage;
