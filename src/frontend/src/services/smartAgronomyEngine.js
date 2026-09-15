// Smart Agronomy Decision Engine
// Combines Weather Forecast + Crop + Growth Stage + Soil Moisture + Soil Type -> Unified Weather & Irrigation Intelligence

export const CROPS_DATA = {
  Cotton: { minMoisture: 50, maxMoisture: 70, waterDemand: "High (4.8 mm/day)", stages: ["Germination", "Vegetative", "Flowering", "Maturity"] },
  Wheat: { minMoisture: 45, maxMoisture: 65, waterDemand: "Moderate (3.8 mm/day)", stages: ["Tillering", "Jointing", "Heading", "Grain Filling"] },
  Tomatoes: { minMoisture: 55, maxMoisture: 75, waterDemand: "High (5.2 mm/day)", stages: ["Seedling", "Vegetative", "Flowering / Fruiting", "Harvesting"] },
  PaddyRice: { minMoisture: 70, maxMoisture: 90, waterDemand: "Very High (7.5 mm/day)", stages: ["Nursery", "Tillering", "Panicle", "Ripening"] },
  Sugarcane: { minMoisture: 60, maxMoisture: 80, waterDemand: "High (6.0 mm/day)", stages: ["Germination", "Tillering", "Grand Growth", "Maturation"] }
};

export const getSmartAgronomyAdvice = ({
  soilMoisture = 38,
  crop = "Cotton",
  growthStage = "Flowering",
  soilType = "Loamy",
  weatherData = {
    location: "Ahmedabad, Gujarat",
    temperature: 34,
    humidity: 72,
    windSpeed: 14,
    rainProbability: 80,
    rainfallExpected: 22,
    condition: "Thunderstorms Expected"
  }
}) => {
  const cropInfo = CROPS_DATA[crop] || CROPS_DATA.Cotton;
  const { minMoisture, maxMoisture } = cropInfo;

  let status = "MONITOR";
  let statusBadge = "bg-amber-100 text-amber-800 border-amber-300";
  let icon = "🌧️";
  let headline = "";
  let actionDetails = "";
  let recommendedWater = "0 mm";
  let durationHours = 0;
  let whyReasons = [];

  // Decision Logic Engine Rules:
  if (soilMoisture >= maxMoisture) {
    status = "NOT REQUIRED";
    statusBadge = "bg-emerald-100 text-emerald-800 border-emerald-300";
    icon = "✅";
    headline = "Optimal Soil Moisture";
    actionDetails = "Soil moisture is optimal or saturated. No additional watering required.";
    whyReasons.push({ type: "success", text: `Soil moisture (${soilMoisture}%) is above target minimum (${minMoisture}%)` });
    whyReasons.push({ type: "info", text: `Crop root zone currently has adequate water reserves` });
  } else if (soilMoisture < minMoisture && weatherData.rainProbability >= 60) {
    status = "DELAY IRRIGATION";
    statusBadge = "bg-sky-100 text-sky-800 border-sky-300";
    icon = "🌧️";
    headline = "Delay Irrigation — Rain Expected";
    actionDetails = `Soil moisture (${soilMoisture}%) is below target (${minMoisture}–${maxMoisture}%), but significant rainfall (${weatherData.rainProbability}% chance, ~${weatherData.rainfallExpected}mm) is expected within 24 hours. Recheck soil moisture after rainfall.`;
    recommendedWater = "0 mm (Rain Pending)";
    durationHours = 0;

    whyReasons.push({ type: "warning", text: `Soil moisture (${soilMoisture}%) is below target (${minMoisture}–${maxMoisture}%)` });
    whyReasons.push({ type: "rain", text: `High rainfall probability (${weatherData.rainProbability}% chance, ~${weatherData.rainfallExpected}mm rain expected)` });
    whyReasons.push({ type: "temp", text: `High temperature forecast (${weatherData.temperature}°C) increases evapotranspiration` });
    whyReasons.push({ type: "crop", text: `${crop} at ${growthStage} stage has high water demand` });
  } else if (soilMoisture < minMoisture && weatherData.rainProbability < 60) {
    status = "IRRIGATION REQUIRED";
    statusBadge = "bg-emerald-600 text-white border-emerald-700";
    icon = "💧";
    headline = "Irrigation Required";
    actionDetails = `Soil moisture (${soilMoisture}%) is below target range (${minMoisture}–${maxMoisture}%). Low chance of rain (${weatherData.rainProbability}%). Apply irrigation to maintain crop vitality.`;
    recommendedWater = "20–25 mm (12,500 L)";
    durationHours = 2.5;

    whyReasons.push({ type: "warning", text: `Soil moisture (${soilMoisture}%) is below target minimum (${minMoisture}%)` });
    whyReasons.push({ type: "temp", text: `Expected temp ${weatherData.temperature}°C increases crop water demand` });
    whyReasons.push({ type: "rain", text: `Low probability of natural rain (${weatherData.rainProbability}%)` });
    whyReasons.push({ type: "crop", text: `${crop} during ${growthStage} requires consistent root zone hydration` });
  } else {
    status = "MONITOR";
    statusBadge = "bg-amber-100 text-amber-800 border-amber-300";
    icon = "👀";
    headline = "Monitor Moisture Levels";
    actionDetails = "Soil moisture is acceptable. Monitor changes in weather and temperature over the next 24 hours.";
    recommendedWater = "10–15 mm (Light Top-up)";
    durationHours = 1.0;

    whyReasons.push({ type: "info", text: `Soil moisture (${soilMoisture}%) is close to minimum threshold (${minMoisture}%)` });
  }

  // Weather Intelligence Alerts
  const weatherAlerts = [
    {
      type: "temp",
      title: "High-Temperature Warning",
      desc: `Temperatures forecast up to ${weatherData.temperature}°C tomorrow. Increases evaporation rate.`,
      icon: "🔥",
      badge: "Warning"
    },
    {
      type: "rain",
      title: "Rainfall Alert",
      desc: `${weatherData.rainProbability}% probability of rain (~${weatherData.rainfallExpected}mm expected tomorrow).`,
      icon: "🌧️",
      badge: "Precipitation"
    },
    {
      type: "crop",
      title: "Crop-Specific Impact",
      desc: `High humidity (${weatherData.humidity}%) & warm weather increases risk of fungal diseases (Early Blight / Rust).`,
      icon: "🌾",
      badge: "Agronomy"
    },
    {
      type: "work",
      title: "Best Window for Field Work",
      desc: "Optimal window for spraying & field operations: Today 06:00 AM – 09:30 AM before peak heat.",
      icon: "⏰",
      badge: "Field Schedule"
    },
    {
      type: "disease",
      title: "Weather-Based Disease Risk Warning",
      desc: "Raised disease risk — monitor crop foliage closely and avoid overhead watering during humid periods.",
      icon: "🦠",
      badge: "High Disease Risk"
    }
  ];

  // Schedule Table
  const scheduleTable = [
    {
      date: "Today, 14 Sep",
      action: status === "DELAY IRRIGATION" ? "Delay Irrigation" : "Irrigate",
      water: status === "DELAY IRRIGATION" ? "0 mm" : "20–25 mm",
      duration: status === "DELAY IRRIGATION" ? "0 hrs" : "2.5 hrs",
      reason: status === "DELAY IRRIGATION" ? "Rain expected tomorrow (80%)" : "Moisture below target (38%)",
      status: status === "DELAY IRRIGATION" ? "Weather Delayed" : "Pending",
      badgeClass: status === "DELAY IRRIGATION" ? "bg-sky-100 text-sky-800" : "bg-emerald-100 text-emerald-800"
    },
    {
      date: "Tomorrow, 15 Sep",
      action: "Monitor",
      water: "—",
      duration: "—",
      reason: "Significant rainfall expected (~22 mm)",
      status: "Rain Expected",
      badgeClass: "bg-blue-100 text-blue-800"
    },
    {
      date: "17 Sep",
      action: "Irrigate",
      water: "18–22 mm",
      duration: "2.0 hrs",
      reason: "Moisture decline post-rainfall assessment",
      status: "Scheduled",
      badgeClass: "bg-gray-100 text-gray-800"
    }
  ];

  return {
    status,
    statusBadge,
    icon,
    headline,
    actionDetails,
    recommendedWater,
    durationHours,
    whyReasons,
    weatherAlerts,
    scheduleTable,
    targetMin: minMoisture,
    targetMax: maxMoisture,
    cropDemand: cropInfo.waterDemand
  };
};
