import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../utils/api';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', city: user?.city || '', bio: user?.bio || '', experience: user?.experience || 'beginner' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateProfile(form);
      setUser(res.data.user);
      setEditing(false);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ paddingTop: 'var(--nav-height)', background: 'var(--cream)', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg, var(--green-50), white)', padding: '48px 0 40px', borderBottom: '1px solid var(--gray-100)' }}>
        <div className="container">
          <h1 className="page-title">My Profile</h1>
        </div>
      </div>

      <div className="container-sm" style={{ padding: '48px 24px' }}>
        <div className="card" style={{ padding: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid var(--gray-100)' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--green-400), var(--green-700))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginBottom: 4 }}>{user?.name}</h2>
              <p style={{ fontSize: 14, color: 'var(--gray-400)' }}>{user?.email}</p>
              {user?.city && <p style={{ fontSize: 14, color: 'var(--gray-500)', marginTop: 2 }}>📍 {user.city}</p>}
            </div>
            <button onClick={() => setEditing(!editing)} className="btn btn-outline" style={{ marginLeft: 'auto' }}>
              {editing ? 'Cancel' : '✏️ Edit Profile'}
            </button>
          </div>

          {/* Stats */}
          <div className="grid-3" style={{ marginBottom: 32 }}>
            {[
              { label: 'Experience', value: user?.experience, icon: '🌱' },
              { label: 'Saved Plants', value: user?.savedPlants?.length || 0, icon: '❤️' },
              { label: 'Member Since', value: user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString('en', { month: 'short', year: 'numeric' }) : 'N/A', icon: '📅' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--green-50)', borderRadius: 'var(--radius-md)', padding: '18px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green-800)', textTransform: 'capitalize', marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {editing ? (
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 24 }}>Edit Profile</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="Your city..." />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={3} placeholder="Tell the community about yourself..." />
              </div>
              <div className="form-group">
                <label className="form-label">Experience Level</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {['beginner', 'intermediate', 'expert'].map(exp => (
                    <button key={exp} type="button" onClick={() => setForm(p => ({ ...p, experience: exp }))} style={{
                      flex: 1, padding: '10px 8px', borderRadius: 'var(--radius-md)', fontSize: 13, border: '1.5px solid', cursor: 'pointer', textTransform: 'capitalize',
                      borderColor: form.experience === exp ? 'var(--green-500)' : 'var(--gray-200)',
                      background: form.experience === exp ? 'var(--green-50)' : 'white',
                      color: form.experience === exp ? 'var(--green-700)' : 'var(--gray-600)'
                    }}>{exp}</button>
                  ))}
                </div>
              </div>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-lg">
                {saving ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Save Changes'}
              </button>
            </div>
          ) : (
            user?.bio && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 12 }}>About</h3>
                <p style={{ fontSize: 15, color: 'var(--gray-600)', lineHeight: 1.7 }}>{user.bio}</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
