/**
 * API Client for UK Day-Ahead Renewable Procurement Backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE_URL}/api/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function fetchDayAheadForecast(deliveryDate, cutoffHour = 11, cutoffMinute = 0) {
  const params = new URLSearchParams();
  if (deliveryDate) params.append('deliveryDate', deliveryDate);
  params.append('cutoffHour', cutoffHour.toString());
  params.append('cutoffMinute', cutoffMinute.toString());

  const res = await fetch(`${API_BASE_URL}/api/forecasts/day-ahead?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch day-ahead forecast: ${res.statusText}`);
  return res.json();
}

export async function fetchForecastEvolution(targetStartTime) {
  const params = new URLSearchParams({ targetStartTime });
  const res = await fetch(`${API_BASE_URL}/api/forecasts/evolution?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch forecast evolution: ${res.statusText}`);
  return res.json();
}

export async function fetchMonthlyAnalytics(cutoffHour = 11, cutoffMinute = 0) {
  const params = new URLSearchParams({
    cutoffHour: cutoffHour.toString(),
    cutoffMinute: cutoffMinute.toString()
  });
  const res = await fetch(`${API_BASE_URL}/api/analytics/monthly?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch monthly analytics: ${res.statusText}`);
  return res.json();
}

export async function simulateProcurement({
  deliveryDate,
  cutoffHour = 11,
  cutoffMinute = 0,
  demandProfile = 'medium_utility',
  userPeakDemandMW = 16000,
  riskBufferPercentile = 85,
  systemBuyPrice = 125,
  systemSellPrice = 45,
  dayAheadPrice = 85
}) {
  const params = new URLSearchParams({
    deliveryDate,
    cutoffHour: cutoffHour.toString(),
    cutoffMinute: cutoffMinute.toString(),
    demandProfile,
    userPeakDemandMW: userPeakDemandMW.toString(),
    riskBufferPercentile: riskBufferPercentile.toString(),
    systemBuyPrice: systemBuyPrice.toString(),
    systemSellPrice: systemSellPrice.toString(),
    dayAheadPrice: dayAheadPrice.toString()
  });

  const res = await fetch(`${API_BASE_URL}/api/analytics/simulate-procurement?${params.toString()}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error(`Procurement simulation failed: ${res.statusText}`);
  return res.json();
}
