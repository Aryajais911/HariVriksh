const Plant = require('./models/Plant');
const { Container } = require('./models/Garden');
const path = require('path');

const seedData = async () => {
  try {
    const plantsData = require('./data/clean_plants.json');
    const plantCount = await Plant.countDocuments();
    
    // If database has old duplicate data (less than 36 or not clean), reset plant collection
    if (plantCount !== plantsData.length) {
      console.log(`Reseeding plants database (current count: ${plantCount}, target clean count: ${plantsData.length})...`);
      await Plant.deleteMany({});
      await Plant.insertMany(plantsData);
      console.log(`✅ Successfully seeded ${plantsData.length} unique plants without duplicates!`);
    } else {
      console.log(`Database already has ${plantCount} clean plants — skipping seed`);
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
  } catch (error) {
    console.error('Seed error:', error.message);
  }
};

module.exports = seedData;
