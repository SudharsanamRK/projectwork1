export const getFishingInsights = () => {
  const tips = [
    "🎣 Best fishing time: early morning or sunset.",
    "🐟 Avoid fishing during high tide; mid-tide gives better catch.",
    "🧭 Popular species today: Mackerel and Tuna near coastal areas.",
  ];
  return tips[Math.floor(Math.random() * tips.length)];
};
