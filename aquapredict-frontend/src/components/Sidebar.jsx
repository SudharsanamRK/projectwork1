import React, { useState } from "react";
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
  LogOut,
  Settings,
  User,
} from "lucide-react";

/**
 * Sidebar — updated
 * - Minimal header: only "AquaPredict" (no icon, no subtitle)
 * - Choose nostalgic scheme via `logoScheme` prop: "neon" | "aero" | "vhs"
 * - Collapsible compact mode, mobile overlay handling
 *
 * Props:
 * - isOpen (bool) - controls mobile overlay visibility
 * - toggleSidebar (fn) - toggle overlay on mobile
 * - page (string) - current page id
 * - setPage (fn) - change page id
 * - logoScheme (string) - "neon" | "aero" | "vhs" (optional)
 */
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "prediction", label: "Fish Prediction", icon: Fish },
  { id: "market", label: "Market Trends", icon: TrendingUp },
  { id: "environment", label: "Environment", icon: Droplets },
  { id: "chatbot", label: "AquaBot", icon: MessageSquare },
  { id: "fishpredictor", label: "Harvest Planner", icon: ClipboardCheck },
];

const Sidebar = ({
  isOpen = false,
  toggleSidebar = () => {},
  page,
  setPage,
  logoScheme = "neon", // "neon" | "aero" | "vhs"
}) => {
  const [collapsed, setCollapsed] = useState(false);

  // Derive logo class from scheme
  const logoClass =
    logoScheme === "aero"
      ? "logo--aero"
      : logoScheme === "vhs"
      ? "logo--vhs"
      : "logo--neon";

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen flex flex-col transition-all duration-300 ease-in-out
          ${collapsed ? "w-20" : "w-64"}
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        aria-hidden={!isOpen && typeof window !== "undefined" && window.innerWidth < 1024}
      >
        {/* Sidebar container with glass + gradient */}
        <div
          className="relative flex h-full flex-col justify-between
            bg-linear-to-b from-slate-900/90 to-slate-800/85
            border-r border-slate-700/40
            p-4
            shadow-[0_10px_30px_rgba(2,6,23,0.7)]
            backdrop-blur-sm
            text-white"
          style={{ minHeight: "100dvh" }}
        >
          {/* Top: Logo + controls */}
          <div>
            <div className="flex items-center justify-between gap-3">
              {/* Logo (name only) */}
              <button
                onClick={() => {
                  if (collapsed) setCollapsed(false);
                }}
                className="group flex items-center gap-3 rounded-md focus:outline-none"
                aria-label="AquaPredict home"
              >
                <div className="logo-container relative">
                  {/* Only show full text when not collapsed */}
                  {!collapsed ? (
                    <div
                      className={`text-5xl font-extrabold tracking-tight ${logoClass}`}
                      style={{
                        fontFamily:
                          "'Stereofidelic', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      AquaPredict
                    </div>
                  ) : (
                    /* small compact wordmark for collapsed state (iconic initials) */
                    <div
                      className={`text-lg font-extrabold tracking-tight ${logoClass}`}
                      style={{
                        fontFamily:
                          "'Stereofidelic', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
                        letterSpacing: "-0.02em",
                      }}
                      aria-hidden
                    >
                      AP
                    </div>
                  )}
                </div>
              </button>

              {/* Right-side icons */}
              <div className="flex items-center gap-2">
                {/* collapse toggle (desktop) */}
                <button
                  className="hidden rounded-md p-2 hover:bg-white/5 lg:inline-flex"
                  title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                  onClick={() => setCollapsed((s) => !s)}
                >
                  {collapsed ? <ChevronLeft size={18} /> : <Menu size={18} />}
                </button>

                {/* mobile close */}
                <button
                  className="inline-flex rounded-md p-2 hover:bg-white/5 lg:hidden"
                  onClick={toggleSidebar}
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="my-4 h-px w-full bg-slate-700/40" />
          </div>

          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto scrollbar-thin">
            <ul className="flex flex-col gap-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = page === item.id;

                return (
                  <li key={item.id} className="relative group">
                    <button
                      onClick={() => setPage(item.id)}
                      className={`group relative flex items-center gap-3 w-full rounded-lg px-3 py-2 text-left transition-all duration-200
                        ${active ? "bg-sky-500/90 text-white shadow-xl" : "text-slate-300 hover:bg-slate-700/60"}
                        ${collapsed ? "justify-center px-2" : ""}
                      `}
                      aria-current={active ? "page" : undefined}
                    >
                      {/* active indicator bar */}
                      <span
                        className={`absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-md transition-all duration-200
                          ${active ? "bg-white/90 opacity-100" : "bg-transparent"}
                        `}
                        aria-hidden
                      />

                      {/* icon */}
                      <span
                        className={`flex items-center justify-center shrink-0 rounded-md p-1 ${
                          active ? "bg-white/10" : "group-hover:bg-white/5"
                        }`}
                        style={{ width: 36, height: 36 }}
                      >
                        <Icon size={18} />
                      </span>

                      {/* label */}
                      {!collapsed && (
                        <span className="ml-1 font-medium">{item.label}</span>
                      )}

                      {/* small badge example (demo) */}
                      {item.id === "prediction" && !collapsed && (
                        <span className="ml-auto text-xs font-semibold bg-white/6 px-2 py-1 rounded-full text-sky-100">
                          live
                        </span>
                      )}
                    </button>

                    {/* tooltip for collapsed mode */}
                    {collapsed && (
                      <div
                        role="tooltip"
                        className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 rounded-md bg-slate-900/95 px-3 py-2 text-sm text-slate-100 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                        aria-hidden
                      >
                        {item.label}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer: user + actions */}
          <div className="mt-4">
            <div
              className={`flex items-center gap-3 rounded-md p-3 transition-colors ${
                collapsed ? "justify-center" : ""
              } hover:bg-white/3`}
            >
              <div
                className="relative flex items-center justify-center h-10 w-10 shrink-0 rounded-full bg-linear-to-br from-sky-500 to-cyan-400"
                title="Captain Jack"
                aria-hidden
              >
                <User size={18} className="text-white" />
              </div>

              {!collapsed && (
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold">Captain Jack</div>
                      <div className="text-xs text-slate-300">Fisherman</div>
                    </div>

                    <button
                      className="rounded-md p-2 hover:bg-white/5"
                      title="Settings"
                      onClick={() => setPage("settings")}
                    >
                      <Settings size={16} />
                    </button>
                  </div>

                  <div className="mt-2 flex gap-2">
                    <button
                      className="flex-1 rounded-md border border-slate-700/50 bg-slate-800/60 px-3 py-1 text-xs"
                      onClick={() => setPage("profile")}
                    >
                      Profile
                    </button>
                    <button
                      className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold hover:brightness-95"
                      onClick={() => {
                        /* handle logout */
                      }}
                    >
                      <span className="hidden sm:inline">Sign out</span>
                      <LogOut className="inline sm:hidden" size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* small settings row */}
            <div className={`mt-3 flex items-center justify-between ${collapsed ? "flex-col gap-2" : ""}`}>
              <button
                className="hidden rounded-md px-2 py-1 text-xs text-slate-300 hover:bg-white/5 lg:inline-flex"
                onClick={() => setCollapsed((s) => !s)}
                title="Toggle compact"
              >
                {collapsed ? "Expand" : "Compact"}
              </button>

              {!collapsed && (
                <div className="text-xs text-slate-400">© AquaPredict</div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
