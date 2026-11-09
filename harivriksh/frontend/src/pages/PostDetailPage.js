import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPost, addComment, likePost, createPost, deletePost, uploadMultiple, markCommentSolution } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { id: 'disease_solution', label: '🩺 Disease & Solution', desc: 'Share plant diseases, photo symptoms & how you cured it' },
  { id: 'problem', label: '⚠️ Problem / Help', desc: 'Ask for community help with a sick plant photo' },
  { id: 'harvest', label: '🌾 Harvest Showcase', desc: 'Show off your fresh rooftop garden produce' },
  { id: 'tip', label: '💡 Pro Tip / Guide', desc: 'Share a secret technique or fertilizer recipe' },
  { id: 'question', label: '❓ General Question', desc: 'Ask any question about soil, seeds or pests' },
  { id: 'general', label: '💬 General Discussion', desc: 'Chat with fellow urban gardeners' },
];

export const NewPostPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', content: '', category: 'disease_solution', tags: '' });
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (images.length + files.length > 5) {
      toast.error('You can upload up to 5 photos max');
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
        toast.success(`${urls.length} photo(s) attached!`);
      }
    } catch {
      toast.error('Image upload failed. Please try a smaller photo.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const insertTemplate = () => {
    const template = `🐛 Problem Observed:
(Describe yellowing leaves, white spots, pest damage, wilting, etc.)

🔬 Disease / Cause:
(e.g. Powdery Mildew, Aphid Infestation, Root Rot, Calcium Deficiency)

💊 Solution & Cured Method:
(e.g. Sprayed Neem oil + liquid soap weekly, pruned affected leaves, added wood ash for potassium)`;
    setForm(p => ({ ...p, content: p.content ? `${p.content}\n\n${template}` : template }));
    toast.success('Disease template added!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    setLoading(true);
    try {
      const res = await createPost({
        ...form,
        images,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
      });
      toast.success('Post published!');
      navigate(`/community/${res.data.post._id}`);
    } catch {
      toast.error('Failed to publish post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: 'var(--nav-height)', background: 'var(--cream)', minHeight: '100vh', paddingBottom: 80 }}>
      <div className="container-sm" style={{ padding: '40px 24px' }}>
        <Link to="/community" style={{ fontSize: 13, color: 'var(--gray-500)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20, textDecoration: 'none', fontWeight: 600 }}>
          ← Back to Community Forum
        </Link>
        <h1 className="page-title">Post a Plant Problem or Solution</h1>
        <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: 24 }}>
          Upload photos of plant diseases, ask for diagnosis, or share how you solved a garden pest/disease problem.
        </p>

        <div className="card" style={{ padding: 36, borderRadius: 20 }}>
          <form onSubmit={handleSubmit}>
            {/* Category Select */}
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: 14 }}>Post Category *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                {CATEGORIES.map(c => {
                  const isSel = form.category === c.id;
                  return (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => setForm(p => ({ ...p, category: c.id }))}
                      style={{
                        padding: '12px 14px', borderRadius: 12, textAlign: 'left',
                        border: `2px solid ${isSel ? 'var(--green-600)' : 'var(--gray-200)'}`,
                        background: isSel ? '#f0fdf4' : 'white',
                        cursor: 'pointer', transition: 'all .2s'
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 700, color: isSel ? 'var(--green-900)' : 'var(--gray-800)' }}>{c.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 2 }}>{c.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: 14 }}>Title / Main Problem *</label>
              <input
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Yellow spots on Tomato leaves — cured with Neem & baking soda spray!"
                maxLength={120}
                style={{ padding: '12px 16px', borderRadius: 12, fontSize: 14 }}
              />
            </div>

            {/* Content & Template Helper */}
            <div className="form-group" style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>Detailed Explanation *</label>
                {form.category === 'disease_solution' && (
                  <button
                    type="button"
                    onClick={insertTemplate}
                    style={{ fontSize: 12, padding: '4px 10px', borderRadius: 8, background: '#fefce8', border: '1px solid #fef08a', color: '#854d0e', fontWeight: 700, cursor: 'pointer' }}
                  >
                    📝 Auto-fill Disease/Solution Format
                  </button>
                )}
              </div>
              <textarea
                value={form.content}
                onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                placeholder="Explain what happened to your plant, the symptoms, and what steps fixed it..."
                rows={7}
                style={{ resize: 'vertical', padding: 16, borderRadius: 12, fontSize: 14 }}
              />
            </div>

            {/* Photo Upload Section */}
            <div className="form-group" style={{ marginBottom: 24, background: '#f8fafc', padding: 20, borderRadius: 14, border: '1.5px dashed #cbd5e1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>📷 Upload Plant & Disease Photos (Up to 5)</label>
                  <p style={{ fontSize: 12, color: 'var(--gray-500)', margin: '2px 0 0' }}>Attach clear photos of leaves, stems, or pests for accurate diagnosis.</p>
                </div>
                <label style={{
                  padding: '8px 16px', borderRadius: 20, background: 'var(--green-600)', color: 'white',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6
                }}>
                  {uploading ? 'Uploading...' : '📁 Choose Photos'}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {/* Uploaded Thumbnail Previews */}
              {images.length > 0 && (
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 14 }}>
                  {images.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative', width: 90, height: 90, borderRadius: 10, overflow: 'hidden', border: '2px solid var(--green-500)' }}>
                      <img src={img} alt={`Upload ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        style={{
                          position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%',
                          background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="form-group" style={{ marginBottom: 28 }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: 14 }}>Tags (comma separated)</label>
              <input
                value={form.tags}
                onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                placeholder="e.g. tomato, powdery-mildew, neem-spray, cured"
                style={{ padding: '12px 16px', borderRadius: 12, fontSize: 14 }}
              />
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={() => navigate('/community')} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
                Cancel
              </button>
              <button type="submit" disabled={loading || uploading} className="btn btn-primary btn-lg" style={{ flex: 2, justifyContent: 'center' }}>
                {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Publishing...</> : '📢 Publish Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const PostDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [activePhoto, setActivePhoto] = useState(null);

  useEffect(() => {
    getPost(id).then(res => setPost(res.data.post)).catch(() => navigate('/community')).finally(() => setLoading(false));
  }, [id, navigate]);

  const handleLike = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const res = await likePost(id);
      setPost(prev => ({ ...prev, likes: res.data.liked ? [...(prev.likes || []), user._id] : prev.likes.filter(l => l !== user._id) }));
    } catch { toast.error('Could not like'); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!comment.trim()) return;
    setCommenting(true);
    try {
      const res = await addComment(id, { content: comment });
      setPost(prev => ({ ...prev, comments: res.data.comments }));
      setComment('');
      toast.success('Comment added!');
    } catch { toast.error('Failed to comment'); }
    finally { setCommenting(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try { await deletePost(id); toast.success('Post deleted'); navigate('/community'); }
    catch { toast.error('Failed to delete'); }
  };

  const handleToggleSolution = async (commentId) => {
    try {
      const res = await markCommentSolution(id, commentId);
      if (res.data.success) {
        setPost(res.data.post);
        toast.success(res.data.isSolution ? 'Marked as Verified Solution! ✅' : 'Unmarked verified solution');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update solution');
    }
  };

  if (loading) return <div style={{ paddingTop: 'calc(var(--nav-height) + 60px)' }}><div className="container-sm"><div className="skeleton" style={{ height: 400 }} /></div></div>;
  if (!post) return null;

  const liked = user && post.likes?.includes(user._id);

  return (
    <div style={{ paddingTop: 'var(--nav-height)', background: 'var(--cream)', minHeight: '100vh', paddingBottom: 80 }}>
      <div className="container-sm" style={{ padding: '40px 24px' }}>
        <Link to="/community" style={{ fontSize: 13, color: 'var(--gray-500)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20, textDecoration: 'none', fontWeight: 600 }}>
          ← Back to Community
        </Link>

        <div className="card" style={{ padding: 36, marginBottom: 24, borderRadius: 20 }}>
          {/* Header info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--green-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700 }}>
                {post.author?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{post.author?.name}</p>
                <p style={{ fontSize: 12, color: 'var(--gray-500)', margin: '2px 0 0' }}>{post.author?.city} · {new Date(post.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {post.isSolved && (
                <span style={{ fontSize: 12, fontWeight: 800, padding: '4px 14px', borderRadius: 20, background: '#dcfce7', color: '#15803d', border: '1.5px solid #86efac' }}>
                  ✅ SOLVED
                </span>
              )}
              <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 14px', borderRadius: 20, background: post.category === 'disease_solution' ? '#fefce8' : 'var(--green-100)', color: post.category === 'disease_solution' ? '#854d0e' : 'var(--green-800)', border: post.category === 'disease_solution' ? '1px solid #fef08a' : 'none' }}>
                {post.category === 'disease_solution' ? '🩺 Disease & Solution' : post.category}
              </span>
              {user?._id === post.author?._id && (
                <button onClick={handleDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: 16, padding: '4px 8px' }} title="Delete post">
                  🗑️
                </button>
              )}
            </div>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginBottom: 16, color: 'var(--gray-900)' }}>{post.title}</h1>
          
          {/* Main Content */}
          <div style={{ fontSize: 15, color: 'var(--gray-700)', lineHeight: 1.8, whiteSpace: 'pre-wrap', marginBottom: 24, background: '#f8fafc', padding: 20, borderRadius: 14, border: '1px solid #e2e8f0' }}>
            {post.content}
          </div>

          {/* Attached Disease / Plant Photos Gallery */}
          {post.images && post.images.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-600)', marginBottom: 10 }}>📷 Attached Plant Photos ({post.images.length}):</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                {post.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Attached ${idx + 1}`}
                    onClick={() => setActivePhoto(img)}
                    style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 12, border: '1px solid var(--gray-200)', cursor: 'pointer', transition: 'transform .2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                ))}
              </div>
            </div>
          )}

          {post.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
              {post.tags.map(t => <span key={t} className="tag">{t}</span>)}
            </div>
          )}

          <div style={{ display: 'flex', gap: 20, paddingTop: 20, borderTop: '1px solid var(--gray-100)', alignItems: 'center' }}>
            <button onClick={handleLike} style={{ display: 'flex', alignItems: 'center', gap: 8, background: liked ? '#fee2e2' : 'var(--gray-50)', border: 'none', borderRadius: 20, padding: '8px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: liked ? 'var(--red)' : 'var(--gray-600)' }}>
              {liked ? '❤️' : '🤍'} {post.likes?.length || 0} Likes
            </button>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--gray-500)', fontWeight: 600 }}>💬 {post.comments?.length || 0} Comments</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--gray-500)', fontWeight: 600 }}>👁 {post.views || 0} Views</span>
          </div>
        </div>

        {/* Comments Section */}
        <div className="card" style={{ padding: 32, borderRadius: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 24 }}>💬 Community Responses & Fixes</h3>

          <form onSubmit={handleComment} style={{ marginBottom: 32 }}>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder={user ? 'Suggest a cure, diagnosis, or comment...' : 'Sign in to comment'}
              disabled={!user}
              rows={3}
              style={{ marginBottom: 12, resize: 'none', padding: 14, borderRadius: 12 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button type="submit" disabled={!user || commenting || !comment.trim()} className="btn btn-primary btn-sm" style={{ opacity: !user || !comment.trim() ? .5 : 1 }}>
                {commenting ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Post Comment'}
              </button>
              {!user && <Link to="/login" className="btn btn-outline btn-sm">Sign In to Comment</Link>}
            </div>
          </form>

          {post.comments?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--gray-400)' }}>
              <p style={{ fontSize: 36, marginBottom: 8 }}>💬</p>
              <p>No comments yet. Be the first to reply or suggest a treatment!</p>
            </div>
          ) : (
            post.comments?.map((c, i) => (
              <div
                key={c._id || i}
                style={{
                  display: 'flex', gap: 14, padding: '18px 20px', borderRadius: 14, marginBottom: 14,
                  background: c.isSolution ? '#f0fdf4' : 'transparent',
                  border: c.isSolution ? '2px solid #86efac' : '1px solid var(--gray-100)',
                  boxShadow: c.isSolution ? '0 4px 16px rgba(34,197,94,0.1)' : 'none',
                  position: 'relative'
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: c.isSolution ? '#166534' : 'var(--green-100)', color: c.isSolution ? 'white' : 'var(--green-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
                  {c.author?.name?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-800)' }}>{c.author?.name}</span>
                      <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    {c.isSolution && (
                      <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 12, background: '#dcfce7', color: '#15803d', border: '1px solid #86efac' }}>
                        ✅ VERIFIED SOLUTION BY AUTHOR
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>{c.content}</p>

                  {/* Mark as Solution Toggle Button for Post Author */}
                  {user?._id === post.author?._id && (
                    <button
                      type="button"
                      onClick={() => handleToggleSolution(c._id)}
                      style={{
                        marginTop: 10, fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 8,
                        background: c.isSolution ? '#fef2f2' : '#f0fdf4',
                        border: `1px solid ${c.isSolution ? '#fca5a5' : '#86efac'}`,
                        color: c.isSolution ? '#991b1b' : '#166534', cursor: 'pointer', transition: 'all .2s'
                      }}
                    >
                      {c.isSolution ? 'Unmark Solution' : '✅ Mark as Verified Solution'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: 20
          }}
        >
          <img src={activePhoto} alt="Full view" style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }} />
        </div>
      )}
    </div>
  );
};

export default PostDetailPage;
