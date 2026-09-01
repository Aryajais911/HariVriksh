import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  const handleLogout = () => {
    logoutUser();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const navLinks = [
    { to: '/plants', label: 'Plants' },
    { to: '/container-matcher', label: 'Container Matcher' },
    { to: '/soil-guide', label: 'Soil Guide' },
    { to: '/community', label: 'Community' },
    { to: '/ai-doctor', label: '🤖 AI Doctor' },
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 'var(--nav-height)',
      background: scrolled ? 'rgba(250,250,247,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--gray-100)' : 'none',
      transition: 'all .3s',
    }}>
      <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <span style={{ fontSize: 28 }}>🌿</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--green-800)' }}>
            HariVriksh
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} style={{
              padding: '8px 16px', borderRadius: 'var(--radius-full)',
              fontSize: 14, fontWeight: 500, transition: 'all .2s',
              color: isActive(link.to) ? 'var(--green-700)' : 'var(--gray-600)',
              background: isActive(link.to) ? 'var(--green-50)' : 'transparent',
              textDecoration: 'none'
            }}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="desktop-nav">
          {user ? (
            <>
              <Link to="/my-garden" className="btn btn-ghost btn-sm">🌱 My Garden</Link>
              <NotificationBell />
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 14px 6px 6px', borderRadius: 'var(--radius-full)',
                    background: 'var(--green-50)', border: '1px solid var(--green-200)',
                    cursor: 'pointer', fontSize: 14
                  }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: 'var(--green-600)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 600
                  }}>{user.name?.[0]?.toUpperCase()}</div>
                  <span style={{ fontWeight: 500, color: 'var(--gray-700)' }}>{user.name?.split(' ')[0]}</span>
                  <span style={{ color: 'var(--gray-400)', fontSize: 12 }}>▾</span>
                </button>
                {menuOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    background: 'white', borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-lg)',
                    minWidth: 180, overflow: 'hidden', zIndex: 200
                  }}>
                    {[
                      { to: '/dashboard', label: '📊 Dashboard' },
                      { to: '/profile', label: '👤 Profile' },
                      { to: '/my-garden', label: '🌱 My Garden' },
                      { to: '/reminders', label: '🔔 Reminders' },
                    ].map(item => (
                      <Link key={item.to} to={item.to} style={{
                        display: 'block', padding: '12px 18px', fontSize: 14,
                        color: 'var(--gray-700)', transition: 'background .15s'
                      }}
                        onMouseEnter={e => e.target.style.background = 'var(--green-50)'}
                        onMouseLeave={e => e.target.style.background = 'transparent'}
                      >{item.label}</Link>
                    ))}
                    <div style={{ height: 1, background: 'var(--gray-100)' }} />
                    <button onClick={handleLogout} style={{
                      width: '100%', textAlign: 'left', padding: '12px 18px',
                      fontSize: 14, color: 'var(--red)', background: 'none',
                      border: 'none', cursor: 'pointer'
                    }}>🚪 Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started Free</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="mobile-menu-btn"
          style={{ display: 'none', background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          background: 'white', borderTop: '1px solid var(--gray-100)',
          padding: '16px 24px', display: 'none'
        }} className="mobile-menu">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} style={{
              display: 'block', padding: '12px 0', fontSize: 15,
              color: 'var(--gray-700)', borderBottom: '1px solid var(--gray-50)'
            }}>{link.label}</Link>
          ))}
          {user ? (
            <>
              <Link to="/my-garden" style={{ display: 'block', padding: '12px 0', fontSize: 15, color: 'var(--gray-700)' }}>🌱 My Garden</Link>
              <Link to="/profile" style={{ display: 'block', padding: '12px 0', fontSize: 15, color: 'var(--gray-700)' }}>👤 Profile</Link>
              <button onClick={handleLogout} style={{ display: 'block', padding: '12px 0', fontSize: 15, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer' }}>🚪 Logout</button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <Link to="/login" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Sign In</Link>
              <Link to="/register" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
