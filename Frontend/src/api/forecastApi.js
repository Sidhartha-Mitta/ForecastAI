import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000,
});

export async function getForecast(date, city) {
  const response = await api.post('/predict', { date, city });
  return response.data;
}

export async function getMeta() {
  const response = await api.get('/meta');
  return response.data;
}

export async function getPlannerPrediction({ mode, city, date, startDate, endDate }) {
  if (mode === 'single') {
    const day = await getForecast(date, city);
    return {
      mode: 'single',
      city: day.city,
      generated_at: new Date().toISOString(),
      start_date: day.date,
      end_date: day.date,
      total_days: 1,
      rainfall_total: day.rainfall,
      average_max: day.temperature_max,
      average_min: day.temperature_min,
      hottest_day: day.date,
      hottest_value: day.temperature_max,
      wettest_day: day.date,
      wettest_value: day.rainfall,
      days: [{ ...day, date: day.date }],
    };
  }

  if (mode === 'range') {
    const response = await api.post('/predict/range', {
      city,
      start_date: startDate,
      end_date: endDate,
    });
    return response.data;
  }

  if (mode === 'year') {
    const response = await api.post('/predict/year', {
      city,
      year: Number(date),
    });
    return response.data;
  }

  const response = await api.post('/predict/next7', {
    city,
    days: 7,
  });
  return response.data;
}

export async function getExplanation({ city, mode, startDate, endDate }) {
  const response = await api.post('/explain', {
    city,
    mode,
    start_date: startDate,
    end_date: endDate,
  });
  return response.data;
}
