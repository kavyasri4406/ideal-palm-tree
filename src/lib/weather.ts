export interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windspeed: number;
  cropImpact: "Low" | "Medium" | "High";
  cropImpactNote: string;
  soilMoistureIndex: number;
  forecast: {
    date: string;
    condition: string;
    maxTemp: number;
    minTemp: number;
    precipitation: number;
    icon: string;
  }[];
}

export interface City {
  name: string;
  lat: number;
  lon: number;
  state: string;
}

export const INDIAN_CITIES: City[] = [
  { name: "New Delhi", lat: 28.6139, lon: 77.2090, state: "Delhi" },
  { name: "Mumbai", lat: 19.0760, lon: 72.8777, state: "Maharashtra" },
  { name: "Chennai", lat: 13.0827, lon: 80.2707, state: "Tamil Nadu" },
  { name: "Kolkata", lat: 22.5726, lon: 88.3639, state: "West Bengal" },
  { name: "Bengaluru", lat: 12.9716, lon: 77.5946, state: "Karnataka" },
  { name: "Hyderabad", lat: 17.3850, lon: 78.4867, state: "Telangana" },
  { name: "Ahmedabad", lat: 23.0225, lon: 72.5714, state: "Gujarat" },
  { name: "Pune", lat: 18.5204, lon: 73.8567, state: "Maharashtra" },
  { name: "Jaipur", lat: 26.9124, lon: 75.7873, state: "Rajasthan" },
  { name: "Lucknow", lat: 26.8467, lon: 80.9462, state: "Uttar Pradesh" },
  { name: "Bhopal", lat: 23.2599, lon: 77.4126, state: "Madhya Pradesh" },
  { name: "Patna", lat: 25.5941, lon: 85.1376, state: "Bihar" },
  { name: "Chandigarh", lat: 30.7333, lon: 76.7794, state: "Punjab" },
  { name: "Nagpur", lat: 21.1458, lon: 79.0882, state: "Maharashtra" },
  { name: "Vijayawada", lat: 16.5062, lon: 80.6480, state: "Andhra Pradesh" },
  { name: "Coimbatore", lat: 11.0168, lon: 76.9558, state: "Tamil Nadu" },
  { name: "Varanasi", lat: 25.3176, lon: 82.9739, state: "Uttar Pradesh" },
  { name: "Indore", lat: 22.7196, lon: 75.8577, state: "Madhya Pradesh" },
  { name: "Kochi", lat: 9.9312, lon: 76.2673, state: "Kerala" },
  { name: "Amritsar", lat: 31.6340, lon: 74.8723, state: "Punjab" },
];

const WMO_CODES: Record<number, { condition: string; icon: string }> = {
  0: { condition: "Clear Sky", icon: "☀️" },
  1: { condition: "Mainly Clear", icon: "🌤️" },
  2: { condition: "Partly Cloudy", icon: "⛅" },
  3: { condition: "Overcast", icon: "☁️" },
  45: { condition: "Foggy", icon: "🌫️" },
  48: { condition: "Icy Fog", icon: "🌫️" },
  51: { condition: "Light Drizzle", icon: "🌦️" },
  53: { condition: "Drizzle", icon: "🌦️" },
  55: { condition: "Dense Drizzle", icon: "🌧️" },
  56: { condition: "Light Freezing Drizzle", icon: "🌨️" },
  57: { condition: "Dense Freezing Drizzle", icon: "🌨️" },
  61: { condition: "Light Rain", icon: "🌧️" },
  63: { condition: "Moderate Rain", icon: "🌧️" },
  65: { condition: "Heavy Rain", icon: "🌧️" },
  66: { condition: "Light Freezing Rain", icon: "🌨️" },
  67: { condition: "Heavy Freezing Rain", icon: "🌨️" },
  71: { condition: "Light Snowfall", icon: "🌨️" },
  73: { condition: "Moderate Snowfall", icon: "🌨️" },
  75: { condition: "Heavy Snowfall", icon: "❄️" },
  77: { condition: "Snow Grains", icon: "🌨️" },
  80: { condition: "Rain Showers", icon: "🌦️" },
  81: { condition: "Moderate Showers", icon: "🌦️" },
  82: { condition: "Violent Showers", icon: "⛈️" },
  85: { condition: "Light Snow Showers", icon: "🌨️" },
  86: { condition: "Heavy Snow Showers", icon: "❄️" },
  95: { condition: "Thunderstorm", icon: "⛈️" },
  96: { condition: "Thunderstorm w/ Hail", icon: "⛈️" },
  99: { condition: "Thunderstorm w/ Heavy Hail", icon: "⛈️" },
};

function getCropImpact(condition: string, humidity: number, temp: number): { impact: "Low" | "Medium" | "High"; note: string } {
  if (condition.includes("Heavy Rain") || condition.includes("Violent") || condition.includes("Thunderstorm")) {
    return { impact: "High", note: "Heavy rain may damage standing crops. Harvest early if possible." };
  }
  if (condition.includes("Rain") || condition.includes("Drizzle") || humidity > 80) {
    return { impact: "Medium", note: "Moderate moisture — watch for fungal diseases in oilseeds." };
  }
  if (temp > 40) {
    return { impact: "High", note: "Extreme heat stress may reduce yield and quality." };
  }
  if (temp < 10) {
    return { impact: "Medium", note: "Cold temperatures may affect tropical crops." };
  }
  return { impact: "Low", note: "Good farming conditions. Ideal for field operations." };
}

export async function fetchWeather(lat: number, lon: number, city: string): Promise<WeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia%2FKolkata&forecast_days=7`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("API error");
    const data = await res.json();

    const currentCode = data.current.weather_code ?? 1;
    const cond = WMO_CODES[currentCode] || { condition: "Partly Cloudy", icon: "⛅" };
    const temp = Math.round(data.current.temperature_2m);
    const humidity = data.current.relative_humidity_2m;
    const windspeed = Math.round(data.current.wind_speed_10m);

    const { impact, note } = getCropImpact(cond.condition, humidity, temp);
    const soilMoistureIndex = Math.min(100, Math.round((humidity / 100) * 60 + Math.random() * 30));

    const forecast = (data.daily.time as string[]).map((date: string, i: number) => {
      const code = data.daily.weather_code[i] ?? 1;
      const dayCondition = WMO_CODES[code]?.condition || "Partly Cloudy";
      return {
        date,
        condition: dayCondition,
        icon: WMO_CODES[code]?.icon || "⛅",
        maxTemp: Math.round(data.daily.temperature_2m_max[i]),
        minTemp: Math.round(data.daily.temperature_2m_min[i]),
        precipitation: parseFloat((data.daily.precipitation_sum[i] || 0).toFixed(1)),
      };
    });

    return { city, temperature: temp, condition: cond.condition, icon: cond.icon, humidity, windspeed, cropImpact: impact, cropImpactNote: note, soilMoistureIndex, forecast };
  } catch (err) {
    console.error("Weather fetch failed, falling back to mock:", err);
    return getMockWeather(city);
  }
}

function getMockWeather(city: string): WeatherData {
  const conditions = [
    { condition: "Partly Cloudy", icon: "⛅", temp: 30, hum: 65, wind: 12 },
    { condition: "Sunny", icon: "☀️", temp: 34, hum: 50, wind: 8 },
    { condition: "Light Rain", icon: "🌧️", temp: 26, hum: 82, wind: 15 },
    { condition: "Overcast", icon: "☁️", temp: 28, hum: 72, wind: 10 },
  ];
  const pick = conditions[Math.floor(Math.random() * conditions.length)];
  const { impact, note } = getCropImpact(pick.condition, pick.hum, pick.temp);
  return {
    city,
    temperature: pick.temp,
    condition: pick.condition,
    icon: pick.icon,
    humidity: pick.hum,
    windspeed: pick.wind,
    cropImpact: impact,
    cropImpactNote: note,
    soilMoistureIndex: Math.round(pick.hum * 0.7 + Math.random() * 20),
    forecast: Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const day = [conditions[1], conditions[0], conditions[2], conditions[3]][i % 4]; // Sunny, Partly Cloudy, Light Rain, Overcast
      return {
        date: d.toISOString().slice(0, 10),
        condition: day.condition,
        icon: day.icon,
        maxTemp: pick.temp + Math.round((Math.random() - 0.4) * 4),
        minTemp: pick.temp - 6 + Math.round(Math.random() * 4),
        precipitation: Math.random() > 0.6 ? parseFloat((Math.random() * 15).toFixed(1)) : 0,
      };
    }),
  };
}
