// utils/normalize.js
export const normalizeDashboard = (raw) => ({
  timestamp: raw?.timestamp ?? Date.now(),

  environment: {
    temperature:
      typeof raw?.environment?.temperature === "number"
        ? raw.environment.temperature
        : 0,
    salinity:
      typeof raw?.environment?.salinity === "number"
        ? raw.environment.salinity
        : 34,
    waveHeight:
      typeof raw?.environment?.waveHeight === "number"
        ? raw.environment.waveHeight
        : 0
  },

  insights: {
    topSpecies:
      typeof raw?.insights?.topSpecies === "string"
        ? raw.insights.topSpecies
        : "—",
    sustainabilityScore:
      typeof raw?.insights?.sustainabilityScore === "number"
        ? raw.insights.sustainabilityScore
        : 0
  },

  marketTrend: Array.isArray(raw?.marketTrend)
    ? raw.marketTrend
    : [],

  alerts: Array.isArray(raw?.alerts) ? raw.alerts : []
});
