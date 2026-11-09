const Plant = require('./models/Plant');
const { Container } = require('./models/Garden');
const SoilGuide = require('./models/SoilGuide');
const CategoryCompost = require('./models/CategoryCompost');
const path = require('path');

const DEFAULT_CATEGORY_COMPOSTS = [
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
      { name: 'Garden Soil',             percentage: 50, color: '#8B4513' },
      { name: 'Compost / Vermicompost',  percentage: 30, color: '#5C4033' },
      { name: 'River Sand / Cocopeat',   percentage: 20, color: '#D4B483' },
    ],
    why: 'Fruiting vegetables need well-drained, rich soil with plenty of phosphorus and potassium for strong fruit development.',
    tips: [
      'Add 1 tsp neem cake per kg to repel pests',
      'Kitchen waste compost works perfectly',
      'Replenish top layer every 6 months'
    ],
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
      { name: 'Cocopeat',      percentage: 40, color: '#DEB887' },
      { name: 'Garden Soil',   percentage: 40, color: '#8B4513' },
      { name: 'Vermicompost',  percentage: 20, color: '#4A2C2A' },
    ],
    why: 'Herbs need light, moisture-retaining soil. Cocopeat prevents waterlogging while vermicompost gives steady nitrogen for leaf growth.',
    tips: [
      'Used tea leaves = free nitrogen boost',
      'Expand cocopeat in water before mixing',
      'Water when top 1 inch feels dry'
    ],
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
    examples: ['Spinach', 'Amaranth', 'Mustard Leaves', 'Lettuce', 'Methi'],
    compostName: 'Leafy Green Compost',
    recipe: [
      { name: 'Cocopeat',      percentage: 50, color: '#DEB887' },
      { name: 'Vermicompost',  percentage: 30, color: '#4A2C2A' },
      { name: 'Garden Soil',   percentage: 20, color: '#8B4513' },
    ],
    why: 'Leafy greens are heavy nitrogen feeders. High vermicompost ratio fuels rapid, lush leaf growth in shallow containers.',
    tips: [
      'Spray diluted cow dung water weekly',
      'Grow in partial shade in summer',
      'Harvest outer leaves first to keep plant producing'
    ],
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
    examples: ['Lemon', 'Guava', 'Pomegranate', 'Papaya', 'Drumstick'],
    compostName: 'Fruit & Deep Root Compost',
    recipe: [
      { name: 'Garden Soil',          percentage: 40, color: '#8B4513' },
      { name: 'Compost',              percentage: 30, color: '#5C4033' },
      { name: 'Sand',                 percentage: 20, color: '#D4B483' },
      { name: 'Bone Meal / Neem Cake', percentage: 10, color: '#F5F5DC' },
    ],
    why: 'Fruit trees need heavy, nutrient-dense soil with good aeration. Bone meal provides slow-release phosphorus for root expansion and fruit setting.',
    tips: [
      'Use 25L+ containers for fruiting trees',
      'Mulch surface with dry leaves',
      'Water deeply but infrequently'
    ],
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
      { name: 'Garden Soil',            percentage: 50, color: '#8B4513' },
      { name: 'Leaf Compost',           percentage: 30, color: '#556B2F' },
      { name: 'Perlite / Coarse Sand',  percentage: 20, color: '#B0C4DE' },
    ],
    why: 'Flowering plants need slightly acidic, aerated soil. Leaf compost provides potassium that triggers bloom production.',
    tips: [
      'Crushed banana peels = free potassium',
      'Eggshell powder prevents blossom drop',
      'Deadhead spent flowers weekly'
    ],
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
    examples: ['Aloe Vera', 'Jade Plant', 'Snake Plant', 'Haworthia', 'Echeveria'],
    compostName: 'Cactus & Succulent Mix',
    recipe: [
      { name: 'Coarse Sand / Gravel', percentage: 50, color: '#D4B483' },
      { name: 'Garden Soil',          percentage: 30, color: '#8B4513' },
      { name: 'Pumice / Perlite',     percentage: 20, color: '#E0EEEE' },
    ],
    why: 'Succulents store water in leaves and rot instantly in wet soil. Ultra-fast draining gritty mix prevents root rot completely.',
    tips: [
      'Never use normal potting mix for succulents',
      'Water only when completely bone-dry',
      'Avoid any organic-heavy fertilizer'
    ],
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
      { name: 'Fine Cocopeat',            percentage: 70, color: '#DEB887' },
      { name: 'Vermiculite / Perlite',    percentage: 20, color: '#E5E5E5' },
      { name: 'Fine Vermicompost',        percentage: 10, color: '#4A2C2A' },
    ],
    why: 'Seeds need a sterile, airy, moisture-holding medium for germination. Heavy soil smothers tender seedling roots.',
    tips: [
      'Mist with spray bottle — never pour water',
      'Cover tray with plastic wrap until sprouts appear',
      'Transplant when 2nd set of leaves emerge'
    ],
    ph: '5.8 – 6.8',
    drainage: 'High Aeration',
  },
];

const DEFAULT_SOIL_GUIDES = [
  {
    id: 'basic-veggie',
    name: 'Basic Vegetable Mix',
    color: '#8B4513',
    emoji: '🥬',
    bestFor: ['Tomato', 'Chilli', 'Brinjal', 'Bottle Gourd', 'Capsicum'],
    description: 'Perfect for fruiting and vegetable plants. Excellent drainage keeps roots healthy and prevents rot.',
    components: [
      { name: 'Garden Soil', percentage: 50, color: '#8B4513' },
      { name: 'Compost / Vermicompost', percentage: 30, color: '#5C4033' },
      { name: 'River Sand / Cocopeat', percentage: 20, color: '#D4B483' }
    ],
    tips: [
      'Use kitchen waste compost — completely rich and nutrient-dense!',
      'Add 1 tsp neem cake powder per kg of mix to prevent pest attacks.',
      'Replenish top layer with 2 inches of compost every 6 months.'
    ],
    ph: '6.0 - 7.0',
    drainage: 'Excellent'
  },
  {
    id: 'herb-mix',
    name: 'Herb & Leafy Mix',
    color: '#228B22',
    emoji: '🌿',
    bestFor: ['Mint', 'Basil', 'Coriander', 'Spinach', 'Fenugreek', 'Curry Leaf'],
    description: 'Lightweight mix retains moisture well without waterlogging. Ideal for shallow containers like bottles and trays.',
    components: [
      { name: 'Cocopeat', percentage: 40, color: '#DEB887' },
      { name: 'Garden Soil', percentage: 40, color: '#8B4513' },
      { name: 'Vermicompost', percentage: 20, color: '#4A2C2A' }
    ],
    tips: [
      'Decomposed tea leaves serve as an excellent nitrogen booster for green leafy growth.',
      'Expand cocopeat blocks thoroughly in water before mixing.',
      'Water when top 1 inch feels slightly dry to the touch.'
    ],
    ph: '6.0 - 7.5',
    drainage: 'Good'
  },
  {
    id: 'flower-mix',
    name: 'Flower & Ornamental Mix',
    color: '#FF6B35',
    emoji: '🌸',
    bestFor: ['Marigold', 'Roses', 'Petunia', 'Geranium', 'Hibiscus'],
    description: 'Rich, aerated blend with balanced organic nutrients to encourage continuous flowering and vibrant blooms.',
    components: [
      { name: 'Garden Soil', percentage: 50, color: '#8B4513' },
      { name: 'Leaf Compost', percentage: 30, color: '#556B2F' },
      { name: 'Perlite / Coarse Sand', percentage: 20, color: '#B0C4DE' }
    ],
    tips: [
      'Mix in dried, crushed banana peels for a natural potassium boost.',
      'Crushed eggshells add calcium, preventing flower blossom drop.',
      'Ensure pots have unobstructed drainage holes.'
    ],
    ph: '5.5 - 6.5',
    drainage: 'Very Good'
  },
  {
    id: 'fruit-mix',
    name: 'Fruit & Deep Root Mix',
    color: '#FF8C00',
    emoji: '🍋',
    bestFor: ['Lemon', 'Guava', 'Pomegranate', 'Papaya', 'Drumstick'],
    description: 'Heavy, nutrient-rich soil mix designed for large containers, fruit trees, and perennial woody crops.',
    components: [
      { name: 'Garden Soil', percentage: 40, color: '#8B4513' },
      { name: 'Compost', percentage: 30, color: '#5C4033' },
      { name: 'Sand', percentage: 20, color: '#D4B483' },
      { name: 'Bone Meal / Neem Cake', percentage: 10, color: '#F5F5DC' }
    ],
    tips: [
      'Mix slow-release organic fertilizer at planting time.',
      'Mulch surface with 2 inches of dry leaves or wood chips to retain moisture.',
      'Water deeply but allow soil to dry between watering cycles.'
    ],
    ph: '6.0 - 7.0',
    drainage: 'Moderate'
  },
  {
    id: 'succulent-mix',
    name: 'Cactus & Succulent Mix',
    color: '#2E8B57',
    emoji: '🌵',
    bestFor: ['Aloe Vera', 'Jade Plant', 'Snake Plant', 'Haworthia', 'Echeveria'],
    description: 'Ultra-fast draining porous soil recipe that prevents root rot for desert and succulent plants.',
    components: [
      { name: 'Coarse Sand / Gravel', percentage: 50, color: '#D4B483' },
      { name: 'Garden Soil', percentage: 30, color: '#8B4513' },
      { name: 'Pumice / Perlite', percentage: 20, color: '#E0EEEE' }
    ],
    tips: [
      'Never allow standing water in saucer plates beneath succulent pots.',
      'Water only when soil is completely bone dry all the way down.',
      'Avoid high-nitrogen organic compost to prevent weak leggy stems.'
    ],
    ph: '6.0 - 7.0',
    drainage: 'Ultra Fast'
  },
  {
    id: 'seedling-mix',
    name: 'Seed Germination Mix',
    color: '#4682B4',
    emoji: '🌱',
    bestFor: ['Seed Starters', 'Microgreens', 'Cuttings', 'Young Plantlets'],
    description: 'Sterile, lightweight, fine-texture mix ensuring maximum germination rates and tender root formation.',
    components: [
      { name: 'Fine Cocopeat', percentage: 70, color: '#DEB887' },
      { name: 'Vermiculite / Perlite', percentage: 20, color: '#E5E5E5' },
      { name: 'Fine Vermicompost', percentage: 10, color: '#4A2C2A' }
    ],
    tips: [
      'Moisten mix lightly with a gentle water mist bottle before sowing seeds.',
      'Do not add heavy fertilizers to seed mix — tender young roots can burn.',
      'Keep tray covered with transparent film until sprouts emerge.'
    ],
    ph: '5.8 - 6.8',
    drainage: 'High Aeration'
  }
];

const seedData = async () => {
  try {
    const plantsData = require('./data/clean_plants.json');
    const plantCount = await Plant.countDocuments();
    const missingNpk = await Plant.countDocuments({ 'soilMix.npkRatio': { $exists: false } });
    
    // Reseed if plant count mismatches or plants miss scientific ICAR data
    if (plantCount !== plantsData.length || missingNpk > 0) {
      console.log(`Reseeding plants database with ICAR scientific parameters (current count: ${plantCount})...`);
      await Plant.deleteMany({});
      await Plant.insertMany(plantsData);
      console.log(`✅ Successfully seeded ${plantsData.length} unique plants with ICAR & Kaggle scientific parameters!`);
    } else {
      console.log(`Database already has ${plantCount} clean enriched plants — skipping seed`);
    }

    const containerCount = await Container.countDocuments();
    if (containerCount === 0) {
      const containers = [
        { type:'bottle',emoji:'🍾',sizeRange:{min:'500ml',max:'5L'},volumeLiters:{min:0.5,max:5},description:'Repurposed plastic bottles — the most eco-friendly option!',pros:['Free','Recyclable','Easy to drill holes'],cons:['Small volume','Can tip over'],difficulty:'easy',preparationTips:['Cut bottom for large opening','Drill 4-5 holes at bottom'],drainageInfo:'Drill 4-6 small holes at bottom' },
        { type:'bucket',emoji:'🪣',sizeRange:{min:'5L',max:'20L'},volumeLiters:{min:5,max:20},description:'Old paint buckets — great for vegetables!',pros:['Large volume','Durable','Available everywhere'],cons:['Heavy when filled'],difficulty:'easy',preparationTips:['Make 8-10 holes at base','Paint white to reflect heat'],drainageInfo:'Minimum 8 holes for proper drainage' },
        { type:'grow-bag',emoji:'🛍️',sizeRange:{min:'3L',max:'50L'},volumeLiters:{min:3,max:50},description:'Fabric bags with excellent aeration and drainage.',pros:['Best drainage','Air prunes roots','Lightweight'],cons:['Dries out faster'],difficulty:'easy',preparationTips:['No preparation needed'],drainageInfo:'Natural fabric drainage' },
        { type:'pipe',emoji:'🔧',sizeRange:{min:'2 inch',max:'6 inch'},volumeLiters:{min:1,max:10},description:'Old PVC pipes repurposed as vertical gardens.',pros:['Space efficient','Vertical growing'],cons:['Dries quickly'],difficulty:'medium',preparationTips:['Cut 4-6 inch holes for planting','Mount on wall for vertical garden'],drainageInfo:'Drill holes at base' },
        { type:'pot',emoji:'🪴',sizeRange:{min:'4 inch',max:'18 inch'},volumeLiters:{min:1,max:25},description:'Traditional clay and plastic pots — timeless and effective.',pros:['Good drainage','Various sizes'],cons:['Clay pots dry fast'],difficulty:'easy',preparationTips:['Add broken clay pieces at bottom'],drainageInfo:'Usually has drainage hole' },
        { type:'tray',emoji:'📦',sizeRange:{min:'30cm',max:'90cm'},volumeLiters:{min:5,max:30},description:'Old trays and window boxes — perfect for leafy greens.',pros:['High surface area','Good for leafy greens'],cons:['Shallow'],difficulty:'easy',preparationTips:['Add drainage holes every 6 inches'],drainageInfo:'Drill holes every 15cm along bottom' }
      ];
      await Container.insertMany(containers);
      console.log(`✅ Seeded ${containers.length} container types`);

      const allPlants = await Plant.find();
      const allContainers = await Container.find();
      for (const container of allContainers) {
        const compatible = allPlants.filter(p =>
          p.compatibleContainers.some(c => c.type.toLowerCase().includes(container.type.toLowerCase()))
        );
        container.bestFor = compatible.slice(0, 4).map(p => p._id);
        await container.save();
      }
      console.log('✅ Linked containers to plants');
    }

    const soilCount = await SoilGuide.countDocuments();
    if (soilCount === 0) {
      await SoilGuide.insertMany(DEFAULT_SOIL_GUIDES);
      console.log(`✅ Seeded ${DEFAULT_SOIL_GUIDES.length} soil mix guides in MongoDB`);
    }

    const categoryCount = await CategoryCompost.countDocuments();
    if (categoryCount === 0) {
      await CategoryCompost.insertMany(DEFAULT_CATEGORY_COMPOSTS);
      console.log(`✅ Seeded ${DEFAULT_CATEGORY_COMPOSTS.length} category compost guides in MongoDB`);
    } else {
      console.log(`Database already has ${categoryCount} category compost guides — skipping seed`);
    }
  } catch (error) {
    console.error('Seed error:', error.message);
  }
};

module.exports = seedData;

