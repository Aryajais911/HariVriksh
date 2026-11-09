import React, { useEffect, useState } from 'react';
import { getSoilGuides, getSoilPlantsList, getSoilRecommendation, getCategoryComposts } from '../utils/api';
import { Link } from 'react-router-dom';

// ─── Static Compost-by-Plant-Type Mapping ────────────────────────────────────
// This works 100% offline without any database connection
const PLANT_TYPE_COMPOST = [
  {
    category: 'vegetable',
    label: 'Vegetables',
    emoji: '🥬',
    color: '#16a34a',
    bg: '#dcfce7',
    border: '#86efac',
    examples: ['Tomato', 'Chilli', 'Brinjal', 'Capsicum', 'Bottle Gourd', 'Okra', 'Pumpkin'],
    compostName: 'Basic Vegetable Compost',
    recipe: [
      { name: 'Garden Soil', pct: 50, color: '#8B4513' },
      { name: 'Compost / Vermicompost', pct: 30, color: '#5C4033' },
      { name: 'River Sand / Cocopeat', pct: 20, color: '#D4B483' },
    ],
    why: 'Fruiting vegetables need well-drained, rich soil with plenty of phosphorus and potassium for strong fruit development.',
    tips: ['Add 1 tsp neem cake per kg to repel pests', 'Kitchen waste compost works perfectly', 'Replenish top layer every 6 months'],
    ph: '6.0 – 7.0',
    drainage: 'Excellent',
  },
  {
    category: 'herb',
    label: 'Herbs',
    emoji: '🌿',
    color: '#15803d',
    bg: '#f0fdf4',
    border: '#86efac',
    examples: ['Mint', 'Basil', 'Coriander', 'Fenugreek', 'Curry Leaf', 'Lemongrass'],
    compostName: 'Herb & Leafy Compost',
    recipe: [
      { name: 'Cocopeat', pct: 40, color: '#DEB887' },
      { name: 'Garden Soil', pct: 40, color: '#8B4513' },
      { name: 'Vermicompost', pct: 20, color: '#4A2C2A' },
    ],
    why: 'Herbs need light, moisture-retaining soil. Cocopeat prevents waterlogging while vermicompost gives steady nitrogen for leaf growth.',
    tips: ['Used tea leaves = free nitrogen boost', 'Expand cocopeat in water before mixing', 'Water when top 1 inch feels dry'],
    ph: '6.0 – 7.5',
    drainage: 'Good',
  },
  {
    category: 'leafy',
    label: 'Leafy Greens',
    emoji: '🥗',
    color: '#065f46',
    bg: '#d1fae5',
    border: '#6ee7b7',
    examples: ['Spinach', 'Amaranth (Chaulai)', 'Mustard Leaves', 'Lettuce', 'Methi'],
    compostName: 'Leafy Green Compost',
    recipe: [
      { name: 'Cocopeat', pct: 50, color: '#DEB887' },
      { name: 'Vermicompost', pct: 30, color: '#4A2C2A' },
      { name: 'Garden Soil', pct: 20, color: '#8B4513' },
    ],
    why: 'Leafy greens are heavy nitrogen feeders. High vermicompost ratio fuels rapid, lush leaf growth in shallow containers.',
    tips: ['Spray diluted cow dung water weekly', 'Grow in partial shade in summer', 'Harvest outer leaves first to keep plant producing'],
    ph: '6.0 – 7.0',
    drainage: 'High',
  },
  {
    category: 'fruit',
    label: 'Fruits & Trees',
    emoji: '🍋',
    color: '#9a3412',
    bg: '#ffedd5',
    border: '#fdba74',
    examples: ['Lemon', 'Guava', 'Pomegranate', 'Papaya', 'Drumstick', 'Curry Leaf Tree'],
    compostName: 'Fruit & Deep Root Compost',
    recipe: [
      { name: 'Garden Soil', pct: 40, color: '#8B4513' },
      { name: 'Compost', pct: 30, color: '#5C4033' },
      { name: 'Sand', pct: 20, color: '#D4B483' },
      { name: 'Bone Meal / Neem Cake', pct: 10, color: '#F5F5DC' },
    ],
    why: 'Fruit trees need heavy, nutrient-dense soil with good aeration. Bone meal provides slow-release phosphorus for root expansion and fruit setting.',
    tips: ['Use 25L+ containers for fruiting trees', 'Mulch surface with dry leaves', 'Water deeply but infrequently'],
    ph: '6.0 – 7.0',
    drainage: 'Moderate',
  },
  {
    category: 'flower',
    label: 'Flowers & Ornamentals',
    emoji: '🌸',
    color: '#9d174d',
    bg: '#fce7f3',
    border: '#f9a8d4',
    examples: ['Marigold', 'Rose', 'Petunia', 'Geranium', 'Hibiscus', 'Mogra'],
    compostName: 'Flower & Bloom Compost',
    recipe: [
      { name: 'Garden Soil', pct: 50, color: '#8B4513' },
      { name: 'Leaf Compost', pct: 30, color: '#556B2F' },
      { name: 'Perlite / Coarse Sand', pct: 20, color: '#B0C4DE' },
    ],
    why: 'Flowering plants need slightly acidic, aerated soil. Leaf compost provides potassium that triggers bloom production.',
    tips: ['Crushed banana peels = free potassium', 'Eggshell powder prevents blossom drop', 'Deadhead spent flowers weekly'],
    ph: '5.5 – 6.5',
    drainage: 'Very Good',
  },
  {
    category: 'succulent',
    label: 'Succulents & Cacti',
    emoji: '🌵',
    color: '#065f46',
    bg: '#ecfdf5',
    border: '#6ee7b7',
    examples: ['Aloe Vera', 'Jade Plant', 'Snake Plant', 'Haworthia', 'Echeveria', 'Cactus'],
    compostName: 'Cactus & Succulent Mix',
    recipe: [
      { name: 'Coarse Sand / Gravel', pct: 50, color: '#D4B483' },
      { name: 'Garden Soil', pct: 30, color: '#8B4513' },
      { name: 'Pumice / Perlite', pct: 20, color: '#E0EEEE' },
    ],
    why: 'Succulents store water in their leaves and rot instantly in wet soil. Ultra-fast draining gritty mix prevents root rot completely.',
    tips: ['Never use normal potting mix for succulents', 'Water only when completely bone-dry', 'Avoid any organic fertilizer'],
    ph: '6.0 – 7.0',
    drainage: 'Ultra Fast',
  },
  {
    category: 'seedling',
    label: 'Seeds & Seedlings',
    emoji: '🌱',
    color: '#1d4ed8',
    bg: '#eff6ff',
    border: '#93c5fd',
    examples: ['Any seed germination', 'Microgreens', 'Cuttings', 'Young Transplants'],
    compostName: 'Seed Germination Mix',
    recipe: [
      { name: 'Fine Cocopeat', pct: 70, color: '#DEB887' },
      { name: 'Vermiculite / Perlite', pct: 20, color: '#E5E5E5' },
      { name: 'Fine Vermicompost', pct: 10, color: '#4A2C2A' },
    ],
    why: 'Seeds need a sterile, airy, moisture-holding medium for germination. Heavy soil or compost smothers tender seedling roots.',
    tips: ['Mist with spray bottle — never pour water', 'Cover tray with plastic wrap until sprouts appear', 'Transplant when 2nd set of leaves emerge'],
    ph: '5.8 – 6.8',
    drainage: 'High Aeration',
  },
];

// Category style map for recommender
const categoryStyles = {
  vegetable: { bg: '#dcfce7', color: '#166534', label: 'Vegetable' },
  herb:      { bg: '#fef9c3', color: '#854d0e', label: 'Herb' },
  leafy:     { bg: '#d1fae5', color: '#065f46', label: 'Leafy' },
  flower:    { bg: '#fce7f3', color: '#9d174d', label: 'Flower' },
  fruit:     { bg: '#ffedd5', color: '#9a3412', label: 'Fruit' },
};

// ─── Component ────────────────────────────────────────────────────────────────
const SoilGuidePage = () => {
  const [guides, setGuides] = useState([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedType, setExpandedType] = useState(null);

  // Volume Calculator
  const [potSize, setPotSize] = useState(10);
  const [potCount, setPotCount] = useState(1);
  const [customVolume, setCustomVolume] = useState('');

  // Plant Recommender
  const [allPlants, setAllPlants] = useState([]);
  const [selectedPlantId, setSelectedPlantId] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [recoLoading, setRecoLoading] = useState(false);
  const [plantSearch, setPlantSearch] = useState('');

  const [categoryComposts, setCategoryComposts] = useState(PLANT_TYPE_COMPOST);

  useEffect(() => {
    getSoilGuides()
      .then(res => { if (res.data?.guides) setGuides(res.data.guides); })
      .catch(() => {})
      .finally(() => setLoading(false));

    getSoilPlantsList()
      .then(res => { if (res.data?.plants) setAllPlants(res.data.plants); })
      .catch(() => {});

    getCategoryComposts()
      .then(res => {
        if (res.data?.success && res.data.categoryGuides?.length) {
          const normalized = res.data.categoryGuides.map(item => ({
            ...item,
            recipe: (item.recipe || []).map(r => ({
              ...r,
              pct: r.pct ?? r.percentage ?? 0
            }))
          }));
          setCategoryComposts(normalized);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedPlantId) { setRecommendation(null); return; }
    setRecoLoading(true);
    getSoilRecommendation(selectedPlantId)
      .then(res => { if (res.data?.success) setRecommendation(res.data); else setRecommendation(null); })
      .catch(() => setRecommendation(null))
      .finally(() => setRecoLoading(false));
  }, [selectedPlantId]);

  const totalVolume = parseFloat(customVolume) || (potSize * potCount);

  const filteredGuides = guides.filter(g => {
    if (!search.trim()) return true;
    const t = search.toLowerCase();
    return g.name.toLowerCase().includes(t) || g.description.toLowerCase().includes(t) || g.bestFor.some(p => p.toLowerCase().includes(t));
  });
  const guide = filteredGuides[active] || filteredGuides[0] || guides[0];

  const filteredPlants = allPlants.filter(p =>
    !plantSearch.trim() || p.name.toLowerCase().includes(plantSearch.toLowerCase())
  );

  if (loading) return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 60px)' }}>
      <div className="container"><div className="skeleton" style={{ height: 500, borderRadius: 16 }} /></div>
    </div>
  );

  return (
    <div style={{ paddingTop: 'var(--nav-height)', background: 'var(--cream)', minHeight: '100vh', paddingBottom: 80 }}>

      {/* ── Header ── */}
      <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #ffffff)', padding: '48px 0 40px', borderBottom: '1px solid var(--gray-100)' }}>
        <div className="container">
          <p className="section-label">🌱 Complete Compost Reference</p>
          <h1 className="page-title">Which Compost for Which Plant?</h1>
          <p className="page-sub">
            Different plants need completely different soil compositions. Find the exact compost mix for every plant type — vegetables, fruits, herbs, flowers and more.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px' }}>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 1 — Compost by Plant Type (Main Feature)
        ══════════════════════════════════════════════════════════════════ */}
        <div style={{ marginBottom: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 30 }}>📋</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, margin: 0 }}>
              Compost Mix by Plant Type
            </h2>
          </div>
          <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 28, marginLeft: 42 }}>
            Click any plant type to expand the full compost recipe, exact ratios, and preparation tips.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {categoryComposts.map((type) => {
              const isOpen = expandedType === type.category;
              return (
                <div
                  key={type.category}
                  style={{
                    borderRadius: 16,
                    border: `2px solid ${isOpen ? type.color : type.border}`,
                    background: isOpen ? 'white' : type.bg,
                    overflow: 'hidden',
                    transition: 'all 0.25s ease',
                    boxShadow: isOpen ? `0 8px 32px ${type.color}22` : '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  {/* ── Row Header (always visible) ── */}
                  <button
                    onClick={() => setExpandedType(isOpen ? null : type.category)}
                    style={{
                      width: '100%', padding: '20px 24px',
                      display: 'flex', alignItems: 'center', gap: 16,
                      background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    {/* Emoji badge */}
                    <div style={{
                      width: 56, height: 56, borderRadius: 14, flexShrink: 0,
                      background: type.bg, border: `2px solid ${type.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
                    }}>
                      {type.emoji}
                    </div>

                    {/* Label + examples */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={{ fontSize: 18, fontWeight: 700, color: type.color }}>{type.label}</span>
                        <span style={{
                          fontSize: 11, padding: '2px 10px', borderRadius: 20,
                          background: type.bg, color: type.color, fontWeight: 700,
                          border: `1px solid ${type.border}`
                        }}>
                          {type.compostName}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {type.examples.map(ex => (
                          <span key={ex} style={{
                            fontSize: 12, padding: '2px 8px', borderRadius: 8,
                            background: 'rgba(0,0,0,0.05)', color: 'var(--gray-600)'
                          }}>{ex}</span>
                        ))}
                      </div>
                    </div>

                    {/* Inline mini-bar (collapsed preview) */}
                    {!isOpen && (
                      <div style={{ flexShrink: 0, display: 'flex', gap: 4, alignItems: 'center' }}>
                        {type.recipe.map(r => (
                          <div key={r.name} title={`${r.name}: ${r.pct}%`} style={{
                            width: Math.max(r.pct * 0.6, 18), height: 8, borderRadius: 4,
                            background: r.color, opacity: 0.85,
                          }} />
                        ))}
                        <span style={{ fontSize: 20, color: 'var(--gray-400)', marginLeft: 8 }}>+</span>
                      </div>
                    )}

                    {/* Chevron */}
                    <span style={{
                      fontSize: 20, color: type.color, transition: 'transform 0.2s',
                      transform: isOpen ? 'rotate(45deg)' : 'none', flexShrink: 0
                    }}>
                      {isOpen ? '✕' : '↓'}
                    </span>
                  </button>

                  {/* ── Expanded Content ── */}
                  {isOpen && (
                    <div style={{ padding: '0 24px 28px' }} className="animate-fadeIn">

                      {/* Why this mix */}
                      <div style={{
                        background: type.bg, border: `1px solid ${type.border}`,
                        borderRadius: 12, padding: '14px 18px', marginBottom: 24
                      }}>
                        <p style={{ fontSize: 13, color: type.color, fontWeight: 600, margin: 0, lineHeight: 1.7 }}>
                          💡 Why this mix? — {type.why}
                        </p>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        {/* Left: Recipe */}
                        <div>
                          <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 16 }}>
                            Compost Recipe — {type.compostName}
                          </h4>

                          {type.recipe.map(r => {
                            const liters = ((totalVolume * r.pct) / 100).toFixed(1);
                            return (
                              <div key={r.name} style={{ marginBottom: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 12, height: 12, borderRadius: 3, background: r.color, flexShrink: 0 }} />
                                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)' }}>{r.name}</span>
                                  </div>
                                  <div>
                                    <span style={{ fontSize: 15, fontWeight: 800, color: type.color, marginRight: 8 }}>{r.pct}%</span>
                                    <span style={{ fontSize: 12, background: 'var(--gray-100)', padding: '2px 8px', borderRadius: 6, color: 'var(--gray-600)', fontWeight: 600 }}>
                                      {liters}L
                                    </span>
                                  </div>
                                </div>
                                <div style={{ height: 10, background: 'var(--gray-100)', borderRadius: 5, overflow: 'hidden' }}>
                                  <div style={{ width: `${r.pct}%`, height: '100%', background: r.color, borderRadius: 5, transition: 'width .6s' }} />
                                </div>
                              </div>
                            );
                          })}

                          {/* Stacked bar */}
                          <div style={{ height: 32, borderRadius: 8, overflow: 'hidden', display: 'flex', marginTop: 8 }}>
                            {type.recipe.map(r => (
                              <div key={r.name} style={{
                                width: `${r.pct}%`, height: '100%', background: r.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 11, color: 'white', fontWeight: 700
                              }}>
                                {r.pct >= 20 ? `${r.pct}%` : ''}
                              </div>
                            ))}
                          </div>

                          {/* pH & Drainage */}
                          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                            <div style={{ flex: 1, background: type.bg, borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
                              <p style={{ fontSize: 11, color: type.color, fontWeight: 700, margin: 0 }}>SOIL pH</p>
                              <p style={{ fontSize: 16, fontWeight: 800, color: type.color, margin: 0 }}>{type.ph}</p>
                            </div>
                            <div style={{ flex: 1, background: type.bg, borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
                              <p style={{ fontSize: 11, color: type.color, fontWeight: 700, margin: 0 }}>DRAINAGE</p>
                              <p style={{ fontSize: 14, fontWeight: 800, color: type.color, margin: 0 }}>{type.drainage}</p>
                            </div>
                          </div>
                        </div>

                        {/* Right: Tips + Calculator */}
                        <div>
                          <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 14 }}>
                            Preparation Tips
                          </h4>
                          {type.tips.map((tip, i) => (
                            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}>
                              <div style={{
                                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                                background: type.bg, border: `1.5px solid ${type.border}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, fontWeight: 800, color: type.color
                              }}>{i + 1}</div>
                              <p style={{ fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.65, margin: 0 }}>{tip}</p>
                            </div>
                          ))}

                          {/* Quick volume calc */}
                          <div style={{ marginTop: 20, background: 'var(--gray-50)', borderRadius: 10, padding: 16, border: '1px solid var(--gray-200)' }}>
                            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-600)', marginBottom: 10 }}>
                              🧮 Quantities for {totalVolume}L ({potCount} pot × {potSize}L):
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${type.recipe.length}, 1fr)`, gap: 8 }}>
                              {type.recipe.map(r => (
                                <div key={r.name} style={{ borderLeft: `3px solid ${r.color}`, paddingLeft: 8 }}>
                                  <p style={{ fontSize: 10, color: 'var(--gray-500)', margin: 0 }}>{r.name}</p>
                                  <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--gray-900)', margin: 0 }}>
                                    {((totalVolume * r.pct) / 100).toFixed(1)}L
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 2 — Volume Calculator (global, affects all sections)
        ══════════════════════════════════════════════════════════════════ */}
        <div className="card" style={{ padding: 28, marginBottom: 48, borderRadius: 16, border: '2px solid var(--green-200)', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 24 }}>🧮</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, margin: 0 }}>Pot Volume Calculator</h2>
          </div>
          <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 20 }}>
            Set your container size here — all compost quantities above update automatically.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>Container Size</label>
              <select
                value={potSize}
                onChange={e => { setPotSize(Number(e.target.value)); setCustomVolume(''); }}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid var(--gray-300)', fontSize: 14, outline: 'none' }}
              >
                <option value={2}>2L — Small Bottle / 6" Pot</option>
                <option value={5}>5L — Medium Pot / Grow Bag</option>
                <option value={10}>10L — Bucket / 10" Grow Bag</option>
                <option value={15}>15L — Large Bucket / 12" Pot</option>
                <option value={25}>25L — Deep Fruit Grow Bag</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>Number of Pots</label>
              <input
                type="number" min={1} max={100} value={potCount}
                onChange={e => { setPotCount(Math.max(1, parseInt(e.target.value) || 1)); setCustomVolume(''); }}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid var(--gray-300)', fontSize: 14, outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>Custom Total Volume (L)</label>
              <input
                type="number" placeholder="e.g. 50"
                value={customVolume}
                onChange={e => setCustomVolume(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid var(--gray-300)', fontSize: 14, outline: 'none' }}
              />
            </div>
          </div>
          <div style={{ marginTop: 16, padding: '10px 18px', borderRadius: 10, background: 'var(--green-50)', border: '1px solid var(--green-200)', display: 'inline-block' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-800)' }}>
              Total soil volume: {totalVolume} Liters ({potCount} pot{potCount > 1 ? 's' : ''} × {potSize}L)
            </span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 3 — Plant-Specific Recommender (needs DB)
        ══════════════════════════════════════════════════════════════════ */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 28 }}>🌱</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, margin: 0 }}>
              Per-Plant Soil Recommender
            </h2>
          </div>
          <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 20, marginLeft: 40 }}>
            Select a specific plant to see its exact, tailored soil composition from the database.
          </p>

          <div className="card" style={{ padding: 28, borderRadius: 16, border: '2px solid var(--green-200)', background: 'linear-gradient(135deg, #f0fdf4, #fefce8)' }}>
            {allPlants.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                <p style={{ fontSize: 36, marginBottom: 8 }}>🔌</p>
                <p style={{ fontWeight: 700, color: 'var(--gray-700)', marginBottom: 4 }}>Database not connected</p>
                <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>
                  The per-plant recommender needs MongoDB. Use the <strong>Compost by Plant Type</strong> section above — it works fully offline and covers all plant categories.
                </p>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="🔍 Type plant name (e.g. Tomato, Rose, Mint)..."
                  value={plantSearch}
                  onChange={e => setPlantSearch(e.target.value)}
                  style={{ width: '100%', padding: '12px 18px', borderRadius: 12, border: '1.5px solid var(--gray-300)', outline: 'none', fontSize: 14, background: 'white', marginBottom: 16 }}
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxHeight: 180, overflowY: 'auto', padding: '4px 0', marginBottom: 20 }}>
                  {filteredPlants.map(p => {
                    const isSelected = selectedPlantId === p._id;
                    const cs = categoryStyles[p.category] || categoryStyles.vegetable;
                    return (
                      <button
                        key={p._id}
                        onClick={() => setSelectedPlantId(isSelected ? '' : p._id)}
                        style={{
                          padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                          border: '1.5px solid', cursor: 'pointer', transition: 'all .2s',
                          display: 'flex', alignItems: 'center', gap: 6,
                          borderColor: isSelected ? 'var(--green-600)' : 'var(--gray-200)',
                          background: isSelected ? 'var(--green-600)' : 'white',
                          color: isSelected ? 'white' : 'var(--gray-700)',
                          boxShadow: isSelected ? '0 3px 10px rgba(22,163,74,0.25)' : 'none',
                        }}
                      >
                        <span>{p.emoji}</span> {p.name}
                        <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 8, background: isSelected ? 'rgba(255,255,255,0.25)' : cs.bg, color: isSelected ? 'white' : cs.color, fontWeight: 700 }}>
                          {cs.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {recoLoading && <div className="skeleton" style={{ height: 200, borderRadius: 12 }} />}

                {!recoLoading && recommendation && (
                  <div className="animate-fadeIn" style={{ background: 'white', borderRadius: 16, padding: 28, border: '1px solid var(--gray-200)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 36 }}>{recommendation.plant.emoji}</span>
                        <div>
                          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, margin: 0 }}>{recommendation.plant.name}</h3>
                          <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
                            {(() => { const cs = categoryStyles[recommendation.plant.category] || categoryStyles.vegetable; return <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 8, background: cs.bg, color: cs.color, fontWeight: 700 }}>{cs.label}</span>; })()}
                            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 8, background: '#ede9fe', color: '#5b21b6', fontWeight: 700 }}>{recommendation.plant.difficulty}</span>
                            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 8, background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>💧 {recommendation.plant.waterFrequency}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600, margin: 0 }}>RECOMMENDED GUIDE</p>
                        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-700)', margin: '4px 0 2px' }}>{recommendation.recommendedGuide.emoji} {recommendation.recommendedGuide.name}</p>
                        <p style={{ fontSize: 11, color: 'var(--gray-500)', margin: 0 }}>pH: {recommendation.recommendedGuide.ph} · Drainage: {recommendation.recommendedGuide.drainage}</p>
                      </div>
                    </div>

                    {/* ICAR & Kaggle Scientific Parameters */}
                    {recommendation.plantMix && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 16 }}>
                        <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                          <p style={{ fontSize: 10, color: '#64748b', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>NPK Ratio (N-P-K)</p>
                          <p style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', margin: '3px 0 0' }}>
                            {recommendation.plantMix.npkRatio ? `${recommendation.plantMix.npkRatio.n}:${recommendation.plantMix.npkRatio.p}:${recommendation.plantMix.npkRatio.k}` : '8:8:8'}
                          </p>
                        </div>
                        <div style={{ background: '#f0fdf4', padding: '10px 12px', borderRadius: 10, border: '1px solid #bbf7d0', textAlign: 'center' }}>
                          <p style={{ fontSize: 10, color: '#166534', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>Ideal pH Range</p>
                          <p style={{ fontSize: 15, fontWeight: 800, color: '#15803d', margin: '3px 0 0' }}>
                            {recommendation.plantMix.phRange ? `${recommendation.plantMix.phRange.min} – ${recommendation.plantMix.phRange.max}` : '6.0 – 7.0'}
                          </p>
                        </div>
                        <div style={{ background: '#fff7ed', padding: '10px 12px', borderRadius: 10, border: '1px solid #fed7aa', textAlign: 'center' }}>
                          <p style={{ fontSize: 10, color: '#9a3412', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>Soil Texture</p>
                          <p style={{ fontSize: 12, fontWeight: 800, color: '#c2410c', margin: '5px 0 0' }}>
                            {recommendation.plantMix.soilTexture || 'Sandy Loam'}
                          </p>
                        </div>
                        <div style={{ background: '#fefce8', padding: '10px 12px', borderRadius: 10, border: '1px solid #fef08a', textAlign: 'center' }}>
                          <p style={{ fontSize: 10, color: '#854d0e', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>Organic Matter</p>
                          <p style={{ fontSize: 15, fontWeight: 800, color: '#a16207', margin: '3px 0 0' }}>
                            {recommendation.plantMix.organicMatterPct || 30}%
                          </p>
                        </div>
                      </div>
                    )}

                    {recommendation.plantMix?.recipe && (
                      <div style={{ background: 'var(--green-50)', padding: '12px 16px', borderRadius: 10, marginBottom: 16, border: '1px solid var(--green-200)' }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-800)', margin: 0 }}>📋 Recipe: {recommendation.plantMix.recipe}</p>
                      </div>
                    )}

                    {recommendation.plantMix?.components?.map(c => {
                      const liters = ((totalVolume * c.percentage) / 100).toFixed(1);
                      return (
                        <div key={c.name} style={{ marginBottom: 14 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 12, height: 12, borderRadius: 3, background: c.color, flexShrink: 0 }} />
                              <span style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</span>
                            </div>
                            <div>
                              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--green-700)', marginRight: 8 }}>{c.percentage}%</span>
                              <span style={{ fontSize: 12, background: 'var(--gray-100)', padding: '2px 8px', borderRadius: 6, color: 'var(--gray-600)', fontWeight: 600 }}>{liters}L</span>
                            </div>
                          </div>
                          <div style={{ height: 10, background: 'var(--gray-100)', borderRadius: 5, overflow: 'hidden' }}>
                            <div style={{ width: `${c.percentage}%`, height: '100%', background: c.color, borderRadius: 5 }} />
                          </div>
                        </div>
                      );
                    })}

                    <div style={{ marginTop: 16, textAlign: 'right' }}>
                      <Link to={`/plants/${recommendation.plant._id}`} style={{ display: 'inline-block', padding: '8px 18px', borderRadius: 20, background: 'var(--green-600)', color: 'white', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                        Full {recommendation.plant.name} Guide →
                      </Link>
                    </div>
                  </div>
                )}

                {!recoLoading && !recommendation && !selectedPlantId && (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--gray-400)' }}>
                    <p style={{ fontSize: 13 }}>👆 Select a plant above to see its specific soil composition</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 4 — General Recipe Tabs
        ══════════════════════════════════════════════════════════════════ */}
        {guides.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 28 }}>🧪</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, margin: 0 }}>General Mix Recipes</h2>
            </div>
            <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 20, marginLeft: 40 }}>
              Browse full mix recipes with tips and parameters.
            </p>
            <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
              {guides.map((g, i) => (
                <button
                  key={g.id || i}
                  onClick={() => setActive(i)}
                  style={{
                    padding: '12px 22px', borderRadius: 'var(--radius-full)', fontSize: 14, fontWeight: 600,
                    border: '1.5px solid', cursor: 'pointer', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 8,
                    borderColor: guide?.id === g.id ? 'var(--green-600)' : 'var(--gray-200)',
                    background: guide?.id === g.id ? 'var(--green-600)' : 'white',
                    color: guide?.id === g.id ? 'white' : 'var(--gray-700)',
                    boxShadow: guide?.id === g.id ? '0 4px 12px rgba(22,163,74,0.25)' : 'none',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{g.emoji}</span> {g.name}
                </button>
              ))}
            </div>

            {guide && (
              <div className="animate-fadeIn" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 28 }}>
                <div>
                  <div className="card" style={{ padding: 32, marginBottom: 24, borderRadius: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24 }}>{guide.emoji} {guide.name}</h2>
                      <span style={{ padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 700, background: 'var(--green-100)', color: 'var(--green-800)' }}>pH: {guide.ph}</span>
                    </div>
                    <p style={{ fontSize: 15, color: 'var(--gray-600)', lineHeight: 1.7, marginBottom: 24 }}>{guide.description}</p>
                    {guide.components.map(c => {
                      const liters = ((totalVolume * c.percentage) / 100).toFixed(1);
                      return (
                        <div key={c.name} style={{ marginBottom: 18 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 12, height: 12, borderRadius: 3, background: c.color, flexShrink: 0 }} />
                              <span style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</span>
                            </div>
                            <div>
                              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--green-700)', marginRight: 10 }}>{c.percentage}%</span>
                              <span style={{ fontSize: 12, background: 'var(--gray-100)', padding: '2px 8px', borderRadius: 6, color: 'var(--gray-600)', fontWeight: 600 }}>{liters}L</span>
                            </div>
                          </div>
                          <div style={{ height: 10, background: 'var(--gray-100)', borderRadius: 5, overflow: 'hidden' }}>
                            <div style={{ width: `${c.percentage}%`, height: '100%', background: c.color, borderRadius: 5 }} />
                          </div>
                        </div>
                      );
                    })}
                    <div style={{ height: 36, borderRadius: 8, overflow: 'hidden', display: 'flex', marginTop: 16 }}>
                      {guide.components.map(c => (
                        <div key={c.name} style={{ width: `${c.percentage}%`, height: '100%', background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'white', fontWeight: 700 }}>
                          {c.percentage >= 15 ? `${c.percentage}%` : ''}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="card" style={{ padding: 28, borderRadius: 16 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 18 }}>💡 Tips</h3>
                    {guide.tips.map((tip, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < guide.tips.length - 1 ? '1px solid var(--gray-100)' : 'none' }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--green-100)', color: 'var(--green-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                        <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.65 }}>{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="card" style={{ padding: 24, marginBottom: 20, borderRadius: 16 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 14 }}>📊 Parameters</h3>
                    {[{ label: 'Soil pH', value: guide.ph }, { label: 'Drainage', value: guide.drainage }, { label: 'Nutrient Life', value: '3–6 Months' }].map(item => (
                      <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid var(--gray-100)' }}>
                        <span style={{ fontSize: 14, color: 'var(--gray-600)' }}>{item.label}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-800)' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="card" style={{ padding: 24, marginBottom: 20, borderRadius: 16 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 14 }}>🌱 Best For</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {guide.bestFor.map(plant => (
                        <Link key={plant} to={`/plants?search=${encodeURIComponent(plant)}`} style={{ padding: '6px 14px', borderRadius: 16, background: 'var(--green-50)', color: 'var(--green-700)', border: '1px solid var(--green-200)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                          {plant} ↗
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="card" style={{ padding: 24, borderRadius: 16, background: 'linear-gradient(135deg, #15803d, #166534)', color: 'white' }}>
                    <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>🤖 Need Custom Advice?</h4>
                    <p style={{ fontSize: 13, lineHeight: 1.6, opacity: 0.9, marginBottom: 14 }}>Ask Kisaan Mitra for personalized soil recipes based on your local materials.</p>
                    <Link to="/ai-doctor" style={{ display: 'inline-block', padding: '8px 16px', borderRadius: 20, background: 'white', color: 'var(--green-800)', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                      Ask AI Doctor →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SoilGuidePage;
