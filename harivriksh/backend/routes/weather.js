const express = require('express');
const router = express.Router();

// Uses Open-Meteo API — 100% FREE, no API key needed
// Docs: https://open-meteo.com/en/docs

const WMO_CODES = {
  0: { label: 'Clear sky', icon: '☀️' },
  1: { label: 'Mainly clear', icon: '🌤️' },
  2: { label: 'Partly cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Foggy', icon: '🌫️' },
  48: { label: 'Icy fog', icon: '🌫️' },
  51: { label: 'Light drizzle', icon: '🌦️' },
  53: { label: 'Drizzle', icon: '🌦️' },
  55: { label: 'Heavy drizzle', icon: '🌧️' },
  61: { label: 'Light rain', icon: '🌧️' },
  63: { label: 'Rain', icon: '🌧️' },
  65: { label: 'Heavy rain', icon: '🌧️' },
  71: { label: 'Light snow', icon: '❄️' },
  73: { label: 'Snow', icon: '❄️' },
  75: { label: 'Heavy snow', icon: '❄️' },
  80: { label: 'Rain showers', icon: '🌦️' },
  81: { label: 'Showers', icon: '🌧️' },
  82: { label: 'Violent showers', icon: '⛈️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
  96: { label: 'Thunderstorm + hail', icon: '⛈️' },
  99: { label: 'Heavy thunderstorm', icon: '⛈️' },
};

// City coordinates for popular Indian cities
const CITY_COORDS = {
  delhi: { lat: 28.6139, lon: 77.209 },
  mumbai: { lat: 19.076, lon: 72.8777 },
  bangalore: { lat: 12.9716, lon: 77.5946 },
  bengaluru: { lat: 12.9716, lon: 77.5946 },
  hyderabad: { lat: 17.385, lon: 78.4867 },
  chennai: { lat: 13.0827, lon: 80.2707 },
  kolkata: { lat: 22.5726, lon: 88.3639 },
  pune: { lat: 18.5204, lon: 73.8567 },
  jaipur: { lat: 26.9124, lon: 75.7873 },
  lucknow: { lat: 26.8467, lon: 80.9462 },
  ahmedabad: { lat: 23.0225, lon: 72.5714 },
  surat: { lat: 21.1702, lon: 72.8311 },
  bhopal: { lat: 23.2599, lon: 77.4126 },
  indore: { lat: 22.7196, lon: 75.8577 },
  nagpur: { lat: 21.1458, lon: 79.0882 },
  patna: { lat: 25.5941, lon: 85.1376 },
  chandigarh: { lat: 30.7333, lon: 76.7794 },
  kochi: { lat: 9.9312, lon: 76.2673 },
  coimbatore: { lat: 11.0168, lon: 76.9558 },
  vizag: { lat: 17.6868, lon: 83.2185 },
};

const getFarmingAdvice = (temp, humidity, weatherCode, city) => {
  const advice = [];
  const isRaining = weatherCode >= 51 && weatherCode <= 82;
  const isHot = temp > 35;
  const isCold = temp < 15;
  const isHumid = humidity > 80;

  if (isRaining) {
    advice.push({ type: 'warning', icon: '🌧️', text: 'Skip watering today — rain is doing the job for you!' });
    advice.push({ type: 'tip', icon: '🪣', text: 'Collect rainwater in buckets for later use — it\'s best for plants.' });
    if (isHumid) advice.push({ type: 'warning', icon: '🍄', text: 'High humidity — watch for fungal diseases on tomatoes and roses.' });
  } else if (isHot) {
    advice.push({ type: 'urgent', icon: '🔥', text: `${Math.round(temp)}°C is very hot — water plants early morning before 8am.` });
    advice.push({ type: 'tip', icon: '🌿', text: 'Add mulch (dry leaves/newspaper) on soil surface to retain moisture.' });
    advice.push({ type: 'tip', icon: '⛱️', text: 'Provide shade cloth 40-50% from 12pm-4pm for leafy greens.' });
  } else if (isCold) {
    advice.push({ type: 'tip', icon: '❄️', text: `${Math.round(temp)}°C is ideal for Spinach, Coriander, Methi, and Peas!` });
    advice.push({ type: 'warning', icon: '💧', text: 'Water less frequently in cold weather — soil stays moist longer.' });
  } else {
    advice.push({ type: 'good', icon: '✅', text: 'Great weather for gardening! Perfect for most vegetables and herbs.' });
    advice.push({ type: 'tip', icon: '🌱', text: 'Today is a good day to transplant seedlings or sow new seeds.' });
  }

  if (humidity < 30) {
    advice.push({ type: 'warning', icon: '🏜️', text: 'Very dry air — mist leaves gently and water more frequently.' });
  }

  return advice;
};

// GET /api/weather?city=delhi  OR  /api/weather?lat=28.6&lon=77.2
router.get('/', async (req, res) => {
  try {
    let { city, lat, lon } = req.query;

    // Resolve city name to coordinates
    if (city && !lat) {
      const coords = CITY_COORDS[city.toLowerCase().trim()];
      if (coords) { lat = coords.lat; lon = coords.lon; }
      else { lat = 28.6139; lon = 77.209; city = 'Delhi'; } // default Delhi
    }

    if (!lat || !lon) {
      return res.status(400).json({ success: false, message: 'Provide city name or lat/lon coordinates' });
    }

    // Open-Meteo free API — no key needed
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&forecast_days=5&timezone=Asia%2FKolkata`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Weather API request failed');

    const data = await response.json();
    const current = data.current;
    const daily = data.daily;

    const isRainingToday = (current.weather_code >= 51 && current.weather_code <= 82) || (current.precipitation > 0) || daily.precipitation_sum[0] > 0.5;
    const shouldSkipWatering = isRainingToday || daily.precipitation_sum[0] > 1.0;

    const weatherInfo = WMO_CODES[current.weather_code] || { label: 'Unknown', icon: '🌡️' };
    const temp = current.temperature_2m;
    const humidity = current.relative_humidity_2m;

    // Build 5-day forecast
    const forecast = daily.time.map((date, i) => {
      const precip = daily.precipitation_sum[i] || 0;
      const wCode = daily.weather_code[i];
      const rainExpected = precip > 0.5 || (wCode >= 51 && wCode <= 82);
      return {
        date,
        maxTemp: Math.round(daily.temperature_2m_max[i]),
        minTemp: Math.round(daily.temperature_2m_min[i]),
        precipitation: precip,
        rainExpected,
        suggestedCare: rainExpected ? '🌧️ Skip Watering (Rain expected)' : temp > 35 ? '🔥 Water Early (Hot Day)' : '🌱 Standard Care',
        weather: WMO_CODES[wCode] || { label: 'Variable', icon: '🌤️' }
      };
    });

    const farmingAdvice = getFarmingAdvice(temp, humidity, current.weather_code, city);

    // Formatted location display name
    let locationName = city || 'Current Location';
    if (!city && lat && lon) {
      locationName = `Your Location (${Number(lat).toFixed(2)}°, ${Number(lon).toFixed(2)}°)`;
    }

    res.json({
      success: true,
      city: locationName,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      isRainingToday,
      shouldSkipWatering,
      rainAmountMm: current.precipitation || daily.precipitation_sum[0] || 0,
      smartAction: shouldSkipWatering ? 'PAUSE_WATERING' : 'NORMAL_CARE',
      current: {
        temp: Math.round(temp),
        feelsLike: Math.round(current.apparent_temperature),
        humidity: Math.round(humidity),
        windSpeed: Math.round(current.wind_speed_10m),
        precipitation: current.precipitation || 0,
        weather: weatherInfo,
        updatedAt: current.time
      },
      forecast,
      farmingAdvice,
      source: 'Open-Meteo Weather Engine'
    });

  } catch (error) {
    console.error('Weather error:', error.message);
    res.status(500).json({ success: false, message: 'Weather service unavailable. Check internet connection.' });
  }
});

// GET /api/weather/cities — list supported cities
router.get('/cities', (req, res) => {
  res.json({ success: true, cities: Object.keys(CITY_COORDS) });
});

module.exports = router;
