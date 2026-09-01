import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer style={{ background: 'var(--gray-900)', color: 'var(--gray-400)', padding: '60px 0 32px' }}>
    <div className="container">
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 28 }}>🌿</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'white' }}>HariVriksh</span>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.8, maxWidth: 280, color: 'var(--gray-400)' }}>
            Empowering urban families to grow pesticide-free vegetables, herbs, and flowers on rooftops using household containers.
          </p>
          <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['🌿 Organic', '🆓 Free Forever', '🇮🇳 Made for India'].map(tag => (
              <span key={tag} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,.07)', color: 'var(--gray-400)' }}>{tag}</span>
            ))}
          </div>
        </div>
        {[
          { title: 'Grow', links: [['Plants Guide', '/plants'], ['Container Matcher', '/container-matcher'], ['Soil Guide', '/soil-guide'], ['AI Doctor', '/ai-doctor']] },
          { title: 'My Garden', links: [['Dashboard', '/dashboard'], ['My Garden', '/my-garden'], ['Reminders', '/reminders'], ['Community', '/community']] },
          { title: 'Account', links: [['Register Free', '/register'], ['Sign In', '/login'], ['Profile', '/profile']] },
        ].map(col => (
          <div key={col.title}>
            <h4 style={{ color: 'white', fontSize: 14, fontWeight: 600, marginBottom: 16, letterSpacing: '.05em' }}>{col.title}</h4>
            {col.links.map(([label, to]) => (
              <Link key={to} to={to} style={{ display: 'block', fontSize: 14, color: 'var(--gray-400)', marginBottom: 10, transition: 'color .2s', textDecoration: 'none' }}
                onMouseEnter={e => e.target.style.color = '#4ade80'}
                onMouseLeave={e => e.target.style.color = 'var(--gray-400)'}
              >{label}</Link>
            ))}
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid var(--gray-800)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <p style={{ fontSize: 13 }}>© 2025 HariVriksh. Grow your own food. 🌱</p>
        <p style={{ fontSize: 13 }}>
          Built with MERN Stack · AI by <span style={{ color: '#4ade80' }}>Claude (Anthropic)</span> · Weather by <span style={{ color: '#4ade80' }}>Open-Meteo (free)</span>
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
