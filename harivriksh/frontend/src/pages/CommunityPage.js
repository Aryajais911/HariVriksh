import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPosts, likePost } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'all', label: '🌿 All', color: 'var(--green-600)' },
  { value: 'disease_solution', label: '🩺 Disease & Solution', color: '#854d0e' },
  { value: 'tip', label: '💡 Tips', color: '#d97706' },
  { value: 'question', label: '❓ Questions', color: 'var(--blue)' },
  { value: 'harvest', label: '🌾 Harvests', color: '#16a34a' },
  { value: 'problem', label: '⚠️ Problems', color: '#dc2626' },
  { value: 'general', label: '💬 General', color: 'var(--gray-600)' },
];

const CATEGORY_COLORS = {
  disease_solution: '#fefce8',
  tip: '#fef3c7',
  question: '#dbeafe',
  harvest: 'var(--green-100)',
  problem: '#fee2e2',
  general: 'var(--gray-100)'
};

const PostCard = ({ post, onLike }) => {
  const { user } = useAuth();
  const liked = user && post.likes?.includes(user._id);
  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const d = Math.floor(diff / 86400000);
    if (d > 0) return `${d}d ago`;
    const h = Math.floor(diff / 3600000);
    if (h > 0) return `${h}h ago`;
    return 'just now';
  };

  return (
    <div className="card" style={{ padding: 24, transition: 'all .25s' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--green-200)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--gray-100)'; }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--green-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600 }}>
            {post.author?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)' }}>{post.author?.name}</p>
            <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>{post.author?.city} · {timeAgo(post.createdAt)}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {post.isSolved && (
            <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 'var(--radius-full)', background: '#dcfce7', color: '#15803d', border: '1px solid #86efac' }}>
              ✅ SOLVED
            </span>
          )}
          {post.category && (
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 'var(--radius-full)', background: CATEGORY_COLORS[post.category] || 'var(--gray-100)', color: 'var(--gray-800)', textTransform: 'capitalize' }}>
              {post.category === 'disease_solution' ? '🩺 Disease & Fix' : post.category}
            </span>
          )}
        </div>
      </div>

      <Link to={`/community/${post._id}`} style={{ textDecoration: 'none' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--gray-900)', marginBottom: 8, lineHeight: 1.3 }}>{post.title}</h3>
        <p style={{ fontSize: 14, color: 'var(--gray-500)', lineHeight: 1.7, marginBottom: 14 }}>
          {post.content?.slice(0, 140)}{post.content?.length > 140 ? '...' : ''}
        </p>

        {/* Post Image Thumbnails */}
        {post.images && post.images.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto' }}>
            {post.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Post attachment ${i + 1}`}
                style={{ width: 100, height: 75, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--gray-200)' }}
              />
            ))}
          </div>
        )}
      </Link>

      {post.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {post.tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
      )}

      <div style={{ display: 'flex', gap: 16, paddingTop: 14, borderTop: '1px solid var(--gray-100)', alignItems: 'center' }}>
        <button onClick={() => onLike(post._id)} style={{
          display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none',
          cursor: 'pointer', fontSize: 13, color: liked ? 'var(--red)' : 'var(--gray-400)', fontWeight: 500, transition: 'color .2s'
        }}>
          {liked ? '❤️' : '🤍'} {post.likes?.length || 0}
        </button>
        <Link to={`/community/${post._id}`} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--gray-400)', fontWeight: 500, textDecoration: 'none' }}>
          💬 {post.comments?.length || 0}
        </Link>
        <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>👁 {post.views || 0}</span>
      </div>
    </div>
  );
};

const CommunityPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);

  const fetchPosts = useCallback(() => {
    setLoading(true);
    getPosts({ category: category === 'all' ? '' : category, sort, page, limit: 10 })
      .then(res => { setPosts(res.data.posts); setTotal(res.data.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, sort, page]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);
  useEffect(() => { setPage(1); }, [category, sort]);

  const handleLike = async (postId) => {
    if (!user) { navigate('/login'); return; }
    try {
      const res = await likePost(postId);
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, likes: res.data.liked ? [...(p.likes || []), user._id] : (p.likes || []).filter(id => id !== user._id) } : p));
    } catch { toast.error('Could not like post'); }
  };

  return (
    <div style={{ paddingTop: 'var(--nav-height)', background: 'var(--cream)', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg, var(--green-50), white)', padding: '48px 0 40px', borderBottom: '1px solid var(--gray-100)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <p className="section-label">Farmer Community</p>
            <h1 className="page-title">Community Forum</h1>
            <p className="page-sub">Share your harvests, ask questions, get help from fellow urban farmers.</p>
          </div>
          <button onClick={() => user ? navigate('/community/new') : navigate('/login')} className="btn btn-primary btn-lg">
            ✍️ Write a Post
          </button>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32 }}>
          <div>
            {/* Filters */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {CATEGORIES.map(c => (
                  <button key={c.value} onClick={() => setCategory(c.value)} style={{
                    padding: '7px 16px', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 500,
                    border: '1.5px solid', cursor: 'pointer', transition: 'all .2s',
                    borderColor: category === c.value ? 'var(--green-500)' : 'var(--gray-200)',
                    background: category === c.value ? 'var(--green-50)' : 'white',
                    color: category === c.value ? 'var(--green-700)' : 'var(--gray-600)'
                  }}>{c.label}</button>
                ))}
              </div>
              <select value={sort} onChange={e => setSort(e.target.value)} style={{ width: 'auto', borderRadius: 'var(--radius-full)', padding: '7px 14px', fontSize: 13 }}>
                <option value="latest">Latest</option>
                <option value="popular">Most Liked</option>
                <option value="views">Most Viewed</option>
              </select>
            </div>

            {/* Posts */}
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 180 }} />)}
              </div>
            ) : posts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">💬</div>
                <h3>No posts yet</h3>
                <p>Be the first to post in this category!</p>
                <button className="btn btn-primary" onClick={() => user ? navigate('/community/new') : navigate('/login')}>Write First Post</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {posts.map(post => <PostCard key={post._id} post={post} onLike={handleLike} />)}
              </div>
            )}

            {total > 10 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn btn-outline btn-sm" style={{ opacity: page === 1 ? .4 : 1 }}>← Prev</button>
                <span style={{ padding: '7px 12px', fontSize: 14 }}>Page {page}</span>
                <button disabled={page * 10 >= total} onClick={() => setPage(p => p + 1)} className="btn btn-outline btn-sm" style={{ opacity: page * 10 >= total ? .4 : 1 }}>Next →</button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 16 }}>🌿 Community Stats</h3>
              {[
                { label: 'Total Posts', value: total },
                { label: 'Active Farmers', value: '2,400+' },
                { label: 'Tips Shared', value: '850+' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--gray-50)' }}>
                  <span style={{ fontSize: 14, color: 'var(--gray-500)' }}>{s.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-700)' }}>{s.value}</span>
                </div>
              ))}
            </div>
            <div style={{ background: 'linear-gradient(135deg, var(--green-600), var(--green-800))', borderRadius: 'var(--radius-lg)', padding: 24, color: 'white', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🌱</div>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 10 }}>Share Your Harvest!</h4>
              <p style={{ fontSize: 13, opacity: .8, marginBottom: 16 }}>Inspire other farmers with your success story.</p>
              <button onClick={() => user ? navigate('/community/new') : navigate('/register')} className="btn" style={{ background: 'white', color: 'var(--green-800)', fontWeight: 600, width: '100%', justifyContent: 'center' }}>
                {user ? 'Post Now' : 'Join Free →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
