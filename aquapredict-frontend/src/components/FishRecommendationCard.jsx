import { Fish, Brain } from "lucide-react";

export default function FishRecommendationCard({ rec, fallback }) {
  if (!rec) return null;

  const confidence = fallback ? 62 : rec.confidence ?? 75;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-cyan-500/10">
          <Fish className="text-cyan-400" />
        </div>
        <div>
          <p className="text-xs text-slate-400">AI Recommended Catch</p>
          <h3 className="text-xl font-bold text-white">{rec.species}</h3>
        </div>
      </div>

      {/* Confidence */}
      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Confidence</span>
          <span>{confidence}%</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-500"
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>

      {/* Reason */}
      <div className="text-sm text-slate-300">
        {rec.reasons?.slice(0, 2).join(" • ")}
      </div>

      {/* Source */}
      <div className="text-xs text-slate-500 flex items-center gap-1">
        <Brain size={12} />
        Source: {fallback ? "Rule-based fallback" : "AI / ML model"}
      </div>
    </div>
  );
}
