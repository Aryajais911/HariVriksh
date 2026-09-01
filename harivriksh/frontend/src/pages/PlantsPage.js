import React, { useState, useEffect, useCallback } from 'react';
import { getPlants } from '../utils/api';
import PlantCard from '../components/PlantCard';

const CATEGORIES = [
  { value: '', label: '🌿 All Plants' },
  { value: 'vegetable', label: '🥦 Vegetables' },
  { value: 'herb', label: '🌿 Herbs' },
  { value: 'fruit', label: '🍋 Fruits' },
  { value: 'flower', label: '🌸 Flowers' },
  { value: 'leafy', label: '🥬 Leafy Greens' },
];

const DIFFICULTIES = [
  { value: '', label: 'Any Level' },
  { value: 'easy', label: '🟢 Easy' },
  { value: 'medium', label: '🟡 Medium' },
  { value: 'hard', label: '🔴 Hard' },
];

const PlantsPage = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ category: '', difficulty: '', search: '' });
  const [page, setPage] = useState(1);

  const fetchPlants = useCallback(() => {
    setLoading(true);
    getPlants({ ...filters, page, limit: 12 })
      .then(res => { setPlants(res.data.plants); setTotal(res.data.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filters, page]);

  useEffect(() => { fetchPlants(); }, [fetchPlants]);
  useEffect(() => setPage(1), [filters]);

  const setFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

  return (
    <div style={{ paddingTop: 'var(--nav-height)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--green-50), white)', padding: '48px 0 40px', borderBottom: '1px solid var(--gray-100)' }}>
        <div className="container">
          <p className="section-label">Plant Encyclopedia</p>
          <h1 className="page-title">Find Your Perfect Plant</h1>
          <p className="page-sub">Complete guides for every plant — soil mix, fertilizer schedule, common problems and fixes.</p>

          {/* Search */}
          <div style={{ marginTop: 24, maxWidth: 480, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }}>🔍</span>
            <input
              placeholder="Search plants..."
              value={filters.search}
              onChange={e => setFilter('search', e.target.value)}
              style={{ paddingLeft: 44, borderRadius: 'var(--radius-full)', background: 'white', border: '1.5px solid var(--gray-200)' }}
            />
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {CATEGORIES.map(c => (
            <button key={c.value} onClick={() => setFilter('category', c.value)}
              style={{
                padding: '8px 18px', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 500,
                border: '1.5px solid', cursor: 'pointer', transition: 'all .2s',
                borderColor: filters.category === c.value ? 'var(--green-500)' : 'var(--gray-200)',
                background: filters.category === c.value ? 'var(--green-50)' : 'white',
                color: filters.category === c.value ? 'var(--green-700)' : 'var(--gray-600)'
              }}>
              {c.label}
            </button>
          ))}
          <div style={{ width: 1, background: 'var(--gray-200)', margin: '0 4px' }} />
          {DIFFICULTIES.map(d => (
            <button key={d.value} onClick={() => setFilter('difficulty', d.value)}
              style={{
                padding: '8px 18px', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 500,
                border: '1.5px solid', cursor: 'pointer', transition: 'all .2s',
                borderColor: filters.difficulty === d.value ? 'var(--green-500)' : 'var(--gray-200)',
                background: filters.difficulty === d.value ? 'var(--green-50)' : 'white',
                color: filters.difficulty === d.value ? 'var(--green-700)' : 'var(--gray-600)'
              }}>
              {d.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 24 }}>
          {loading ? 'Loading...' : `${total} plants found`}
        </p>

        {/* Grid */}
        {loading ? (
          <div className="grid-4">
            {[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ height: 300 }} />)}
          </div>
        ) : plants.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🌵</div>
            <h3>No plants found</h3>
            <p>Try different filters or search terms</p>
            <button className="btn btn-outline" onClick={() => setFilters({ category: '', difficulty: '', search: '' })}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid-4">
            {plants.map(p => <PlantCard key={p._id} plant={p} />)}
          </div>
        )}

        {/* Pagination */}
        {total > 12 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn btn-outline btn-sm" style={{ opacity: page === 1 ? .4 : 1 }}>← Prev</button>
            <span style={{ padding: '7px 16px', fontSize: 14, color: 'var(--gray-600)' }}>Page {page} of {Math.ceil(total / 12)}</span>
            <button disabled={page * 12 >= total} onClick={() => setPage(p => p + 1)} className="btn btn-outline btn-sm" style={{ opacity: page * 12 >= total ? .4 : 1 }}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantsPage;
