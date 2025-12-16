// src/hooks/useAlerts.js
import { useEffect, useState, useCallback } from "react";

const ALERT_KEY = "aq_alerts_v1";

/*
  rule = { id, species, type: "gte"|"lte", threshold: number, enabled: true, createdAt }
*/
export default function useAlerts() {
  const [rules, setRules] = useState(() => {
    try { return JSON.parse(localStorage.getItem(ALERT_KEY) || "[]"); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(ALERT_KEY, JSON.stringify(rules));
  }, [rules]);

  const addRule = useCallback((rule) => {
    setRules((r) => [{ ...rule, id: `${Date.now()}_${Math.random().toString(36).slice(2,8)}`, createdAt: new Date().toISOString(), enabled: true }, ...r]);
  }, []);

  const removeRule = useCallback((id) => setRules((r) => r.filter((x) => x.id !== id)), []);
  const toggleRule = useCallback((id) => setRules((r) => r.map(x => x.id === id ? {...x, enabled: !x.enabled} : x)), []);

  // matchPrice: returns list of matched rules for given incoming price update { species, price, timestamp }
  const matchPrice = useCallback((update) => {
    const matches = [];
    for (const rule of rules) {
      if (!rule.enabled) continue;
      if (rule.species && rule.species !== update.species) continue;
      if (rule.type === "gte" && update.price >= Number(rule.threshold)) matches.push(rule);
      if (rule.type === "lte" && update.price <= Number(rule.threshold)) matches.push(rule);
    }
    return matches;
  }, [rules]);

  return { rules, addRule, removeRule, toggleRule, matchPrice, setRules };
}
