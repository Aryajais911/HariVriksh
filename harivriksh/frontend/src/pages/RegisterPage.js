import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', city: '', experience: 'beginner' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await register(form);
      loginUser(res.data.token, res.data.user);
      toast.success(`Welcome to HariVriksh, ${res.data.user.name}! 🌿`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--green-50), var(--cream))', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 28 }}>
            <span style={{ fontSize: 36 }}>🌿</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--green-800)' }}>HariVriksh</span>
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 8 }}>Start Growing</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 15 }}>Create your free account and begin your urban farming journey</p>
        </div>

        <div className="card" style={{ padding: 36 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name" required autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="Delhi, Mumbai..." />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="you@example.com" required />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Minimum 6 characters" required />
            </div>

            <div className="form-group">
              <label className="form-label">Experience Level</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {[{ v: 'beginner', l: '🌱 Beginner' }, { v: 'intermediate', l: '🌿 Intermediate' }, { v: 'expert', l: '🌳 Expert' }].map(opt => (
                  <button key={opt.v} type="button" onClick={() => setForm(p => ({ ...p, experience: opt.v }))} style={{
                    flex: 1, padding: '10px 8px', borderRadius: 'var(--radius-md)', fontSize: 13, border: '1.5px solid', cursor: 'pointer', fontWeight: 500,
                    borderColor: form.experience === opt.v ? 'var(--green-500)' : 'var(--gray-200)',
                    background: form.experience === opt.v ? 'var(--green-50)' : 'white',
                    color: form.experience === opt.v ? 'var(--green-700)' : 'var(--gray-600)'
                  }}>{opt.l}</button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
              {loading ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Creating Account...</> : '🌿 Create Free Account →'}
            </button>
          </form>

          <div className="divider" />
          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--gray-500)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--green-600)', fontWeight: 600, textDecoration: 'none' }}>Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
