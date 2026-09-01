import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getNotifications, markNotifRead, markAllRead } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date);
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return 'just now';
};

const NotificationBell = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (!user) return;
    fetchNotifs();
    // Poll every 60 seconds
    const interval = setInterval(fetchNotifs, 60000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchNotifs = async () => {
    try {
      const res = await getNotifications({ limit: 10 });
      setNotifications(res.data.notifications || []);
      setUnread(res.data.unreadCount || 0);
    } catch {}
  };

  const handleRead = async (notif) => {
    if (!notif.isRead) {
      try {
        await markNotifRead(notif._id);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
        setUnread(prev => Math.max(0, prev - 1));
      } catch {}
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnread(0);
    } catch {}
  };

  if (!user) return null;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        position: 'relative', background: 'none', border: 'none', cursor: 'pointer',
        fontSize: 18, padding: '6px 10px', borderRadius: 'var(--radius-full)',
        transition: 'background .15s'
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-100)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
        title="Notifications"
      >
        🔔
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 2, right: 4,
            width: 16, height: 16, borderRadius: '50%',
            background: 'var(--red)', color: '#fff',
            fontSize: 9, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--cream)'
          }}>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: 320, background: '#fff', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-lg)',
          zIndex: 200, overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--gray-100)' }}>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600 }}>Notifications</h4>
            {unread > 0 && (
              <button onClick={handleMarkAll} style={{ fontSize: 12, color: 'var(--green-600)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--gray-400)' }}>
                <p style={{ fontSize: 28, marginBottom: 8 }}>🔔</p>
                <p style={{ fontSize: 13 }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <div key={n._id} onClick={() => handleRead(n)} style={{
                  padding: '12px 16px', cursor: 'pointer', transition: 'background .15s',
                  background: n.isRead ? 'transparent' : 'var(--green-50)',
                  borderBottom: '1px solid var(--gray-50)',
                  borderLeft: n.isRead ? '3px solid transparent' : '3px solid var(--green-400)'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = n.isRead ? 'transparent' : 'var(--green-50)'}
                >
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{n.icon || '🌱'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: n.isRead ? 400 : 600, color: 'var(--gray-800)', marginBottom: 2, lineHeight: 1.4 }}>{n.title}</p>
                      <p style={{ fontSize: 12, color: 'var(--gray-500)', lineHeight: 1.5, marginBottom: 3 }}>{n.message}</p>
                      <p style={{ fontSize: 11, color: 'var(--gray-400)' }}>{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.isRead && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green-500)', flexShrink: 0, marginTop: 4 }} />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
