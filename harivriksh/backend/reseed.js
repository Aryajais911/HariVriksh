const mongoose = require("mongoose");
require("dotenv").config();
const Plant = require("./models/Plant");

const plants = require("./data/clean_plants.json");

mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 })
  .then(async () => {
    console.log("Connected to MongoDB");
    await Plant.deleteMany({});
    console.log("Cleared all existing plants");
    const inserted = await Plant.insertMany(plants);
    console.log("SUCCESS: Inserted " + inserted.length + " unique plants!");
    const cats = {};
    inserted.forEach(p => { cats[p.category] = (cats[p.category] || 0) + 1; });
    console.log("Category breakdown:", JSON.stringify(cats, null, 2));
    process.exit(0);
  })
  .catch(err => { console.error("FAILED:", err.message); process.exit(1); });
