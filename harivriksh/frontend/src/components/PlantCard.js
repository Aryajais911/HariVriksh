import React from 'react';
import { Link } from 'react-router-dom';

const difficultyConfig = {
  easy: { color: 'var(--green-600)', bg: 'var(--green-50)', label: 'Easy' },
  medium: { color: '#92400e', bg: 'var(--amber-light)', label: 'Medium' },
  hard: { color: '#991b1b', bg: '#fee2e2', label: 'Hard' },
};

const sunConfig = {
  low: { icon: '🌥️', label: '2-4 hrs' },
  medium: { icon: '⛅', label: '4-6 hrs' },
  high: { icon: '☀️', label: '6+ hrs' },
};

const PlantCard = ({ plant, showMatch = false }) => {
  const diff = difficultyConfig[plant.difficulty] || difficultyConfig.easy;
  const sun = sunConfig[plant.sunRequirement] || sunConfig.medium;

  return (
    <Link to={`/plants/${plant._id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{
        cursor: 'pointer', transition: 'all .25s', height: '100%',
        display: 'flex', flexDirection: 'column'
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
      >
        {/* Emoji banner */}
        <div style={{
          height: 120, background: 'linear-gradient(135deg, var(--green-50), var(--green-100))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 56, position: 'relative'
        }}>
          {plant.emoji}
          {showMatch && plant.matchScore && (
            <div style={{
              position: 'absolute', top: 12, right: 12,
              background: 'var(--green-600)', color: 'white',
              fontSize: 12, fontWeight: 700, padding: '3px 10px',
              borderRadius: 'var(--radius-full)'
            }}>{plant.matchScore}% match</div>
          )}
          <div style={{
            position: 'absolute', top: 12, left: 12,
            background: diff.bg, color: diff.color,
            fontSize: 11, fontWeight: 600, padding: '3px 10px',
            borderRadius: 'var(--radius-full)'
          }}>{diff.label}</div>
        </div>

        <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 10 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--gray-900)', marginBottom: 4 }}>
              {plant.name}
            </h3>
            {plant.scientificName && (
              <p style={{ fontSize: 12, color: 'var(--gray-400)', fontStyle: 'italic' }}>{plant.scientificName}</p>
            )}
          </div>

          <p style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.6, marginBottom: 14, flex: 1 }}>
            {plant.description?.slice(0, 90)}...
          </p>

          <div style={{ display: 'flex', gap: 12, paddingTop: 12, borderTop: '1px solid var(--gray-100)' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 2 }}>Harvest</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)' }}>
                {plant.harvestDays?.min}–{plant.harvestDays?.max}d
              </div>
            </div>
            <div style={{ width: 1, background: 'var(--gray-100)' }} />
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 2 }}>Sun</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)' }}>{sun.label}</div>
            </div>
            <div style={{ width: 1, background: 'var(--gray-100)' }} />
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 2 }}>Rating</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--amber)' }}>⭐ {plant.rating}</div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PlantCard;
