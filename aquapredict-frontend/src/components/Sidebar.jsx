import React from "react";
import {
  BarChart3,
  Fish,
  TrendingUp,
  Droplets,
  MessageSquare,
  ClipboardCheck,
  X,
  Menu,
  ChevronLeft,
  Settings,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* =========================
   Spring (Apple-like feel)
========================= */
const sidebarSpring = {
  type: "spring",
  stiffness: 260,
  damping: 28,
  mass: 0.9,
};

/* =========================
   Navigation Items
========================= */
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "prediction", label: "Fish Prediction", icon: Fish },
  { id: "market", label: "Market Trends", icon: TrendingUp },
  { id: "environment", label: "Environment", icon: Droplets },
  { id: "chatbot", label: "AquaBot", icon: MessageSquare },
  { id: "fishpredictor", label: "Harvest Planner", icon: ClipboardCheck },
];

/* =========================
   Sidebar Component
========================= */
const Sidebar = ({
  isOpen = false,
  toggleSidebar = () => {},
  page,
  setPage,
  collapsed,
  setCollapsed,
}) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 256 }}
        transition={sidebarSpring}
        className={`
          relative z-50 h-screen flex flex-col
          bg-[#020617] 
          border-r border-slate-800/60
          shadow-2xl
          text-slate-200
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        
        {/* ================= Header (Logo Area) ================= */}
        <div className="p-6 flex items-center justify-between gap-2">
          <button
            onClick={() => collapsed && setCollapsed(false)}
            className="flex items-center gap-3 focus:outline-none"
          >
            <AnimatePresence mode="wait">
              {!collapsed ? (
                <motion.div
                  key="full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-stereo text-4xl tracking-tight leading-none"
                  style={{ fontFamily: "'Stereofidelic', sans-serif" }}
                >
                  <span className="text-white">Aqua</span>
                  <span className="text-cyan-400">Predict</span>
                </motion.div>
              ) : (
                <motion.div
                  key="compact"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="font-stereo text-3xl text-cyan-400"
                  style={{ fontFamily: "'Stereofidelic', sans-serif" }}
                >
                  AP
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Desktop/Mobile Toggle */}
          <button
            className="rounded-md p-1.5 hover:bg-slate-800 text-slate-500 hover:text-white transition-colors"
            onClick={() => (window.innerWidth < 1024 ? toggleSidebar() : setCollapsed(!collapsed))}
          >
            {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Divider */}
        <div className="mx-6 mb-4 h-px bg-slate-800/50" />

        {/* ================= Navigation List ================= */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = page === item.id;

            return (
              <li key={item.id} className="list-none group">
                <button
                  onClick={() => setPage(item.id)}
                  className={`
                    relative flex items-center gap-3 w-full rounded-xl px-3 py-2.5
                    transition-all duration-200
                    ${
                      active
                        ? "bg-cyan-500/10 text-cyan-400 shadow-[inset_0_0_12px_rgba(34,211,238,0.05)]"
                        : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                    }
                    ${collapsed ? "justify-center px-0" : ""}
                  `}
                >
                  {/* Icon */}
                  <span className={`${active ? "text-cyan-400" : "group-hover:text-slate-200"}`}>
                    <Icon size={20} />
                  </span>

                  {/* Label */}
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="font-medium text-[15px]"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Active Visual Indicator */}
                  {active && !collapsed && (
                    <motion.div 
                      layoutId="activeGlow"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" 
                    />
                  )}
                </button>
              </li>
            );
          })}
        </nav>

        {/* ================= User Footer Section ================= */}
        <div className="p-4 mt-auto">
          <div
            className={`flex items-center gap-3 rounded-2xl p-3 bg-slate-900/40 border border-slate-800/60
              ${collapsed ? "justify-center p-2" : ""}
            `}
          >
            <div className="h-9 w-9 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <User size={18} />
            </div>

            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate">Captain Jack</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Fisherman</div>
              </div>
            )}
            
            {!collapsed && (
              <button className="text-slate-500 hover:text-white transition-colors">
                <Settings size={16} />
              </button>
            )}
          </div>

          {/* Copyright Note */}
          {!collapsed && (
             <div className="mt-4 text-center">
                <span className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold">
                  © AquaPredict
                </span>
             </div>
          )}
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;