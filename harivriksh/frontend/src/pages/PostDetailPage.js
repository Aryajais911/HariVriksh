import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPost, addComment, likePost, createPost, deletePost } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = ['tip', 'question', 'harvest', 'problem', 'general'];

export const NewPostPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', content: '', category: 'general', tags: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) { toast.error('Title and content are required'); return; }
    setLoading(true);
    try {
      const res = await createPost({ ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) });
      toast.success('Post published!');
      navigate(`/community/${res.data.post._id}`);
    } catch { toast.error('Failed to publish'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ paddingTop: 'var(--nav-height)', background: 'var(--cream)', minHeight: '100vh' }}>
      <div className="container-sm" style={{ padding: '48px 24px' }}>
        <Link to="/community" style={{ fontSize: 13, color: 'var(--gray-400)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>← Back to Community</Link>
        <h1 className="page-title">Write a Post</h1>
        <div className="card" style={{ padding: 36, marginTop: 24 }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {CATEGORIES.map(c => (
                  <button type="button" key={c} onClick={() => setForm(p => ({ ...p, category: c }))} style={{
                    padding: '8px 18px', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 500,
                    border: '1.5px solid', cursor: 'pointer', textTransform: 'capitalize',
                    borderColor: form.category === c ? 'var(--green-500)' : 'var(--gray-200)',
                    background: form.category === c ? 'var(--green-50)' : 'white',
                    color: form.category === c ? 'var(--green-700)' : 'var(--gray-600)'
                  }}>{c}</button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="What's your post about?" maxLength={120} />
            </div>
            <div className="form-group">
              <label className="form-label">Content *</label>
              <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Share your experience, tip, question or problem in detail..." rows={8} style={{ resize: 'vertical' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="e.g. tomato, beginner, balcony" />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={() => navigate('/community')} className="btn btn-ghost">Cancel</button>
              <button type="submit" disabled={loading} className="btn btn-primary btn-lg">
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

  if (loading) return <div style={{ paddingTop: 'calc(var(--nav-height) + 60px)' }}><div className="container-sm"><div className="skeleton" style={{ height: 400 }} /></div></div>;
  if (!post) return null;

  const liked = user && post.likes?.includes(user._id);

  return (
    <div style={{ paddingTop: 'var(--nav-height)', background: 'var(--cream)', minHeight: '100vh' }}>
      <div className="container-sm" style={{ padding: '40px 24px' }}>
        <Link to="/community" style={{ fontSize: 13, color: 'var(--gray-400)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>← Back to Community</Link>

        <div className="card" style={{ padding: 36, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--green-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600 }}>
                {post.author?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600 }}>{post.author?.name}</p>
                <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>{post.author?.city} · {new Date(post.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'var(--green-100)', color: 'var(--green-800)', textTransform: 'capitalize' }}>{post.category}</span>
              {user?._id === post.author?._id && (
                <button onClick={handleDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: 14, padding: '4px 8px' }}>🗑️</button>
              )}
            </div>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 16, color: 'var(--gray-900)' }}>{post.title}</h1>
          <div style={{ fontSize: 16, color: 'var(--gray-600)', lineHeight: 1.8, whiteSpace: 'pre-wrap', marginBottom: 24 }}>{post.content}</div>

          {post.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
              {post.tags.map(t => <span key={t} className="tag">{t}</span>)}
            </div>
          )}

          <div style={{ display: 'flex', gap: 20, paddingTop: 20, borderTop: '1px solid var(--gray-100)' }}>
            <button onClick={handleLike} style={{ display: 'flex', alignItems: 'center', gap: 8, background: liked ? '#fee2e2' : 'var(--gray-50)', border: 'none', borderRadius: 'var(--radius-full)', padding: '8px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 500, color: liked ? 'var(--red)' : 'var(--gray-600)' }}>
              {liked ? '❤️' : '🤍'} {post.likes?.length || 0} Likes
            </button>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--gray-400)' }}>💬 {post.comments?.length || 0} Comments</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--gray-400)' }}>👁 {post.views || 0} Views</span>
          </div>
        </div>

        {/* Comments */}
        <div className="card" style={{ padding: 32 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 24 }}>💬 {post.comments?.length || 0} Comments</h3>

          <form onSubmit={handleComment} style={{ marginBottom: 32 }}>
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder={user ? 'Add a comment...' : 'Sign in to comment'} disabled={!user} rows={3} style={{ marginBottom: 12, resize: 'none' }} />
            <button type="submit" disabled={!user || commenting || !comment.trim()} className="btn btn-primary btn-sm" style={{ opacity: !user || !comment.trim() ? .5 : 1 }}>
              {commenting ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Post Comment'}
            </button>
            {!user && <Link to="/login" className="btn btn-outline btn-sm" style={{ marginLeft: 8 }}>Sign In to Comment</Link>}
          </form>

          {post.comments?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--gray-400)' }}>
              <p style={{ fontSize: 36, marginBottom: 8 }}>💬</p>
              <p>No comments yet. Be the first!</p>
            </div>
          ) : (
            post.comments?.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '16px 0', borderBottom: i < post.comments.length - 1 ? '1px solid var(--gray-50)' : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--green-100)', color: 'var(--green-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
                  {c.author?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{c.author?.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.7 }}>{c.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;
