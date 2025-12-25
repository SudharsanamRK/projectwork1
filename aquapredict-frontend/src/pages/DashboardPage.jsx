import React from "react";
import { Fish, Waves, ShieldCheck } from "lucide-react";

export default function DashboardOverview() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex items-center justify-center px-6 py-16">
      
      {/* MAIN CONTAINER */}
      <div className="w-full max-w-7xl text-center space-y-12">

        {/* BRAND TITLE (STEREOFIDELIC) */}
        <h1 className="font-stereo text-6xl md:text-8xl text-white tracking-tight">
          Aqua<span className="text-cyan-400">Predict</span>
        </h1>

        {/* TAGLINE */}
        <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto">
          Smart decision support for modern fishing and aquaculture
        </p>

        {/* DIVIDER */}
        <div className="h-px w-40 bg-gradient-to-r from-transparent via-slate-600 to-transparent mx-auto" />

        {/* EXPLANATION */}
        <div className="max-w-4xl mx-auto space-y-6 text-slate-300 text-base md:text-lg leading-relaxed">
          <p>
            <span className="text-cyan-400 font-semibold">AquaPredict</span> helps
            fishermen, operators, and planners make{" "}
            <span className="text-emerald-400 font-semibold">
              safer, smarter, and sustainable
            </span>{" "}
            decisions by translating complex ocean and environmental data into
            clear, easy-to-understand guidance.
          </p>

          <p>
            You don’t need scientific knowledge or technical expertise.
            AquaPredict continuously analyzes sea conditions, fish behavior,
            and ecological limits — and presents them in a way{" "}
            <span className="text-white font-semibold">
              anyone can understand.
            </span>
          </p>
        </div>

        {/* FEATURE BLOCKS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-16 text-left">

          {/* HARVEST GUIDANCE */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-8 hover:border-cyan-500/40 transition">
            <div className="h-12 w-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
              <Fish size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Harvest Guidance
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Identifies which fish species are most suitable to catch based on
              live sea conditions — improving yield without guesswork.
            </p>
          </div>

          {/* SAFETY AWARENESS */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-8 hover:border-emerald-500/40 transition">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <Waves size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Safety Awareness
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Converts wave height and weather patterns into clear{" "}
              <span className="text-white font-semibold">Go / No-Go</span>{" "}
              signals for safer marine operations.
            </p>
          </div>

          {/* SUSTAINABILITY */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-8 hover:border-indigo-500/40 transition">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Sustainability First
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Ensures fishing activity stays within ecological and regulatory
              limits — protecting both livelihoods and marine ecosystems.
            </p>
          </div>

        </div>

        {/* FOOTER NOTE */}
        <p className="pt-16 text-[11px] uppercase tracking-[0.35em] text-slate-600 font-bold">
          Explore modules using the sidebar
        </p>

      </div>
    </div>
  );
}
