export async function getHarvestPlan(inputs) {
  try {
    const res = await fetch("http://localhost:8000/api/harvest/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inputs),
    });

    if (!res.ok) throw new Error("ML offline");
    return await res.json();
  } catch {
    return null; // fallback handled in UI
  }
}
